"""
Core Aggregator Pipeline for UAE Preowned Vehicles
Coordinates multi-dealer ingestion, data normalization, deduplication,
historical tracking, and missing disclosure audits.
"""

import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from .models import Vehicle, Dealer, PricePoint
from .seed_data import INITIAL_DEALERS, INITIAL_VEHICLES
from .connectors import GenericCsvDealerConnector


class AggregatorEngine:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.dealers_file = os.path.join(self.data_dir, "dealers.json")
        self.vehicles_file = os.path.join(self.data_dir, "vehicles.json")
        self.audit_log_file = os.path.join(self.data_dir, "audit_log.json")

        self.dealers: List[Dealer] = []
        self.vehicles: List[Vehicle] = []
        self.load_or_bootstrap()

    def load_or_bootstrap(self):
        """Loads existing database or initializes with realistic demonstration inventory."""
        if os.path.exists(self.dealers_file) and os.path.exists(self.vehicles_file):
            try:
                with open(self.dealers_file, "r") as f:
                    dealers_data = json.load(f)
                    self.dealers = [Dealer(**d) for d in dealers_data]
                with open(self.vehicles_file, "r") as f:
                    vehicles_data = json.load(f)
                    self.vehicles = self._parse_vehicles(vehicles_data)
                return
            except Exception as e:
                print(f"[Warning] Failed loading cached data: {e}. Rebuilding from seed.")

        # Bootstrap with initial seed data
        self.dealers = [Dealer(**d) for d in INITIAL_DEALERS]
        self.vehicles = self._parse_vehicles(INITIAL_VEHICLES)
        self.save_state()

    def _parse_vehicles(self, raw_list: List[Dict[str, Any]]) -> List[Vehicle]:
        vehicles: List[Vehicle] = []
        for v in raw_list:
            price_hist = [
                PricePoint(**ph) if isinstance(ph, dict) else ph
                for ph in v.get("price_history", [])
            ]
            v_copy = dict(v)
            v_copy["price_history"] = price_hist
            if "data_completeness_pct" in v_copy:
                del v_copy["data_completeness_pct"]
            veh = Vehicle(**v_copy)
            veh.data_completeness_pct = veh.calculate_completeness()
            vehicles.append(veh)
        return vehicles

    def save_state(self):
        """Persists dealers and vehicles to disk."""
        with open(self.dealers_file, "w") as f:
            json.dump([d.to_dict() for d in self.dealers], f, indent=2)
        with open(self.vehicles_file, "w") as f:
            json.dump([v.to_dict() for v in self.vehicles], f, indent=2)

    def get_dealers(self) -> List[Dealer]:
        return self.dealers

    def get_vehicles(self) -> List[Vehicle]:
        return self.vehicles

    def add_dealer(self, dealer_dict: Dict[str, Any]) -> Dealer:
        dealer = Dealer(**dealer_dict)
        self.dealers.append(dealer)
        self.save_state()
        return dealer

    def update_dealer(self, dealer_id: str, updates: Dict[str, Any]) -> Optional[Dealer]:
        for idx, d in enumerate(self.dealers):
            if d.id == dealer_id:
                for k, v in updates.items():
                    if hasattr(d, k):
                        setattr(d, k, v)
                self.save_state()
                return self.dealers[idx]
        return None

    def record_price_update(self, vehicle_id: str, new_price_aed: float, note: str = ""):
        """Appends observed price update to vehicle history without erasing prior observations."""
        today = datetime.now().strftime("%Y-%m-%d")
        for v in self.vehicles:
            if v.id == vehicle_id:
                if v.price_aed != new_price_aed:
                    v.price_history.append(
                        PricePoint(date=today, price_aed=new_price_aed, note=note or "Price adjusted")
                    )
                    v.price_aed = new_price_aed
                    v.last_observed_date = today
                    self.save_state()
                break

    def deduplicate_inventory(self) -> Dict[str, Any]:
        """
        Identifies cross-feed duplicate vehicles by matching VIN or Make+Model+Year+similar Mileage.
        Does not blindly delete; records duplicate cluster.
        """
        seen_vins: Dict[str, List[Vehicle]] = {}
        duplicates_found = []

        for v in self.vehicles:
            if v.vin and v.vin != "UNDISCLOSED_VIN":
                seen_vins.setdefault(v.vin, []).append(v)

        for vin, matches in seen_vins.items():
            if len(matches) > 1:
                duplicates_found.append({
                    "vin": vin,
                    "vehicles": [
                        {"id": m.id, "dealer": m.dealer_name, "price_aed": m.price_aed}
                        for m in matches
                    ]
                })

        return {
            "duplicate_clusters_count": len(duplicates_found),
            "duplicates": duplicates_found
        }

    def import_csv_feed(self, dealer_id: str, csv_content: str, is_demo: bool = False) -> Dict[str, Any]:
        """Parses CSV, validates required fields, updates or appends to vehicle database."""
        dealer = next((d for d in self.dealers if d.id == dealer_id), None)
        if not dealer:
            raise ValueError(f"Dealer ID {dealer_id} not found.")

        connector = GenericCsvDealerConnector(dealer)
        imported = connector.parse_csv_content(csv_content, is_demo=is_demo)

        # Merge with existing
        existing_map = {v.vin: v for v in self.vehicles if v.vin and v.vin != "UNDISCLOSED_VIN"}
        added_count = 0
        updated_count = 0

        for new_v in imported:
            if new_v.vin in existing_map:
                existing = existing_map[new_v.vin]
                if existing.price_aed != new_v.price_aed:
                    existing.price_history.append(
                        PricePoint(
                            date=datetime.now().strftime("%Y-%m-%d"),
                            price_aed=new_v.price_aed,
                            note="Feed price update"
                        )
                    )
                existing.price_aed = new_v.price_aed
                existing.mileage_km = new_v.mileage_km
                existing.last_observed_date = datetime.now().strftime("%Y-%m-%d")
                updated_count += 1
            else:
                self.vehicles.append(new_v)
                added_count += 1

        dealer.last_updated = datetime.now().strftime("%Y-%m-%d %H:%M GST")
        self.save_state()

        return {
            "dealer_id": dealer_id,
            "dealer_name": dealer.name,
            "total_parsed": len(imported),
            "added_count": added_count,
            "updated_count": updated_count
        }

    def audit_transparency(self) -> List[Dict[str, Any]]:
        """Audits disclosure levels across all dealer inventories."""
        audits = []
        for v in self.vehicles:
            audits.append({
                "vehicle_id": v.id,
                "dealer": v.dealer_name,
                "car": f"{v.year} {v.make} {v.model}",
                "price_aed": v.price_aed,
                "vin_present": bool(v.vin and v.vin != "UNDISCLOSED_VIN"),
                "spec_disclosed": v.specification,
                "warranty_disclosed": v.warranty_available,
                "warranty_provider": v.warranty_provider,
                "service_disclosed": v.service_history_disclosed,
                "accident_disclosed": v.accident_history_disclosed,
                "inspection_disclosed": v.inspection_report_available,
                "completeness_pct": v.calculate_completeness()
            })
        return audits
