"""
Dealer Connectors for UAE Preowned Market
Modular adapters for Al-Futtaim Automall, CARS24, Kavak, CarSwitch, and The Elite Cars.
Designed to ingest authorized JSON feeds, REST APIs, or dealer-provided CSV exports.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import csv
import json
import os
from .models import Vehicle, PricePoint, Dealer


class BaseDealerConnector(ABC):
    """Abstract base class for all UAE car dealer inventory connectors."""

    def __init__(self, dealer: Dealer):
        self.dealer = dealer

    @abstractmethod
    def fetch_listings(self) -> List[Vehicle]:
        """Fetch and normalize listings into standard Vehicle objects."""
        pass

    def normalize_spec(self, raw_spec: str) -> str:
        """Standardize specification to GCC or Imported."""
        val = str(raw_spec).strip().upper()
        if "GCC" in val or "GULF" in val:
            return "GCC"
        return "Imported (Non-GCC)"

    def clean_price(self, raw_price: Any) -> float:
        """Extract clean numeric AED price."""
        if isinstance(raw_price, (int, float)):
            return float(raw_price)
        s = str(raw_price).replace("AED", "").replace(",", "").replace(" ", "").strip()
        try:
            return float(s)
        except ValueError:
            return 0.0

    def clean_mileage(self, raw_mileage: Any) -> int:
        """Extract clean numeric km mileage."""
        if isinstance(raw_mileage, (int, float)):
            return int(raw_mileage)
        s = str(raw_mileage).lower().replace("km", "").replace(",", "").replace(" ", "").strip()
        try:
            return int(float(s))
        except ValueError:
            return 0


class AlFuttaimAutomallConnector(BaseDealerConnector):
    """
    Adapter for Al-Futtaim Automall.
    Known for: 99-point inspection, comprehensive agency warranties, strong Toyota/Lexus/Honda volume.
    Locations: Dubai Festival City, Airport Road Abu Dhabi, Sharjah.
    """

    def fetch_listings(self) -> List[Vehicle]:
        # In production, fetches from Al-Futtaim Authorized Inventory REST Endpoint / SFTP Feed
        # Returns normalized Vehicle objects
        return []


class Cars24Connector(BaseDealerConnector):
    """
    Adapter for CARS24 UAE.
    Known for: 150+ point inspection, 12-month standard warranty, 7-day return policy, online purchasing.
    Mega Refurbishment Lab: Jebel Ali, Dubai.
    """

    def fetch_listings(self) -> List[Vehicle]:
        return []


class KavakConnector(BaseDealerConnector):
    """
    Adapter for Kavak UAE.
    Known for: 240-point inspection, Kavak Total warranty, Dubai Festival Plaza hub.
    """

    def fetch_listings(self) -> List[Vehicle]:
        return []


class CarSwitchConnector(BaseDealerConnector):
    """
    Adapter for CarSwitch.
    Known for: Certified peer-to-peer and dealer inventory, condition rating out of 5 stars, detailed tire/paint report.
    """

    def fetch_listings(self) -> List[Vehicle]:
        return []


class TheEliteCarsConnector(BaseDealerConnector):
    """
    Adapter for The Elite Cars.
    Known for: Ultra-luxury & exotic preowned (Mercedes-AMG, Porsche, Range Rover, Bentley, Rolls-Royce).
    Showrooms: Sheikh Zayed Road, Al Barsha, Dubai.
    """

    def fetch_listings(self) -> List[Vehicle]:
        return []


class GenericCsvDealerConnector(BaseDealerConnector):
    """
    Universal CSV/Excel parser for dealer batch inventory imports.
    Allows administrators to upload dealer files directly.
    """

    def parse_csv_content(self, csv_text: str, is_demo: bool = False) -> List[Vehicle]:
        lines = csv_text.strip().splitlines()
        if not lines:
            return []
        
        reader = csv.DictReader(lines)
        vehicles: List[Vehicle] = []

        for row in reader:
            price = self.clean_price(row.get("price_aed", 0))
            orig_price = self.clean_price(row.get("original_price_aed", price))
            if orig_price <= 0:
                orig_price = price
            
            mileage = self.clean_mileage(row.get("mileage_km", 0))
            spec = self.normalize_spec(row.get("specification", "GCC"))

            v = Vehicle(
                id=row.get("id") or f"{self.dealer.id}-{abs(hash(row.get('vin', ''))) % 100000}",
                vin=row.get("vin", "UNDISCLOSED_VIN"),
                dealer_id=self.dealer.id,
                dealer_name=self.dealer.name,
                original_listing_url=row.get("original_listing_url", self.dealer.website),
                is_demo_data=is_demo,
                make=row.get("make", "Unknown"),
                model=row.get("model", "Unknown"),
                variant=row.get("variant", "Standard"),
                year=int(row.get("year", 2022)),
                price_aed=price,
                original_price_aed=orig_price,
                mileage_km=mileage,
                fuel_type=row.get("fuel_type", "Petrol"),
                engine_capacity_cc=int(row.get("engine_capacity_cc", 3000)),
                transmission=row.get("transmission", "Automatic"),
                body_type=row.get("body_type", "SUV"),
                specification=spec,
                origin_country=row.get("origin_country", "UAE / GCC"),
                warranty_available=str(row.get("warranty_available", "")).lower() in ["true", "1", "yes"],
                warranty_duration_months=int(row.get("warranty_duration_months", 0)),
                warranty_provider=row.get("warranty_provider", "Undisclosed"),
                warranty_coverage=row.get("warranty_coverage", "Undisclosed"),
                service_history_disclosed=str(row.get("service_history_disclosed", "")).lower() in ["true", "1", "yes"],
                service_history_type=row.get("service_history_type", "Undisclosed"),
                accident_history_disclosed=str(row.get("accident_history_disclosed", "")).lower() in ["true", "1", "yes"],
                accident_status=row.get("accident_status", "Undisclosed"),
                inspection_report_available=str(row.get("inspection_report_available", "")).lower() in ["true", "1", "yes"],
                inspection_points=int(row.get("inspection_points", 0)),
                inspection_summary=row.get("inspection_summary", "Inspection report available on request"),
                exterior_color=row.get("exterior_color", "White"),
                interior_color=row.get("interior_color", "Black"),
                dealer_location=row.get("dealer_location", self.dealer.location),
                dealer_phone=row.get("dealer_phone", self.dealer.contact_phone),
                dealer_whatsapp=row.get("dealer_whatsapp", "+971 50 000 0000"),
                photos=[p.strip() for p in row.get("photos", "").split(";") if p.strip()],
                listing_date=row.get("listing_date", "2026-10-01"),
                last_observed_date=row.get("last_observed_date", "2026-10-10"),
                availability_status=row.get("availability_status", "Available"),
                price_history=[
                    PricePoint(date="2026-09-15", price_aed=orig_price, note="Initial listed price"),
                    PricePoint(date="2026-10-05", price_aed=price, note="Observed update")
                ] if orig_price != price else [PricePoint(date="2026-10-01", price_aed=price, note="Listed")]
            )
            v.data_completeness_pct = v.calculate_completeness()
            vehicles.append(v)
            
        return vehicles

    def fetch_listings(self) -> List[Vehicle]:
        return []
