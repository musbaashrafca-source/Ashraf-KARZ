"""
Market Intelligence and Analytics Engine for UAE Preowned Vehicles
Computes cross-dealer market metrics, price positioning, trending movements,
and transparent Buyer Suitability Scores.
"""

from typing import List, Dict, Any, Optional
import statistics
import math
from datetime import datetime, timedelta
from .models import Vehicle


class MarketAnalytics:
    """Calculates cross-dealer intelligence, price positioning, and suitability scoring."""

    @staticmethod
    def calculate_buyer_suitability_score(
        vehicle: Vehicle,
        weights: Optional[Dict[str, float]] = None,
        all_vehicles: Optional[List[Vehicle]] = None
    ) -> Dict[str, Any]:
        """
        Calculates a transparent 0-100 Buyer Suitability Score based on:
        - Price competitiveness relative to comparable vehicles
        - Mileage freshness (lower km / year ratio)
        - Model year recency
        - Warranty protection duration and coverage
        - Service history disclosure quality
        - Information transparency completeness

        Missing information is never treated favorably (penalized).
        """
        default_weights = {
            "price": 25.0,
            "mileage": 20.0,
            "year": 15.0,
            "warranty": 15.0,
            "service_history": 15.0,
            "completeness": 10.0
        }
        w = weights or default_weights
        total_weight = sum(w.values()) or 100.0

        # 1. Price Score (0 - 100)
        # Compare to median if list provided, or baseline price value
        price_score = 70.0
        if all_vehicles:
            comparables = [v for v in all_vehicles if v.make == vehicle.make and v.model == vehicle.model]
            if comparables and len(comparables) > 1:
                median_price = statistics.median([v.price_aed for v in comparables])
                delta_pct = ((vehicle.price_aed - median_price) / median_price) * 100
                # Cheaper is higher score
                price_score = max(20.0, min(100.0, 75.0 - (delta_pct * 1.5)))
            else:
                price_score = 75.0

        # 2. Mileage Score (0 - 100)
        # In UAE, average annual mileage is ~20,000 km.
        car_age = max(1, 2026 - vehicle.year)
        annual_km = vehicle.mileage_km / car_age
        if annual_km <= 12000:
            mileage_score = 95.0
        elif annual_km <= 18000:
            mileage_score = 85.0
        elif annual_km <= 25000:
            mileage_score = 70.0
        elif annual_km <= 35000:
            mileage_score = 50.0
        else:
            mileage_score = 30.0

        # 3. Model Year Score (0 - 100)
        current_year = 2026
        year_diff = current_year - vehicle.year
        if year_diff <= 1:
            year_score = 98.0
        elif year_diff <= 2:
            year_score = 90.0
        elif year_diff <= 3:
            year_score = 80.0
        elif year_diff <= 4:
            year_score = 68.0
        elif year_diff <= 5:
            year_score = 55.0
        else:
            year_score = max(25.0, 50.0 - (year_diff * 4))

        # 4. Warranty Score (0 - 100)
        # Missing or undisclosed warranty gets zero score!
        if not vehicle.warranty_available:
            warranty_score = 20.0 if vehicle.warranty_provider != "Undisclosed" else 0.0
        else:
            months = vehicle.warranty_duration_months
            if months >= 36:
                base = 95.0
            elif months >= 24:
                base = 88.0
            elif months >= 12:
                base = 75.0
            else:
                base = 55.0
            if "Comprehensive" in vehicle.warranty_coverage or "Agency" in vehicle.warranty_provider:
                warranty_score = min(100.0, base + 5.0)
            elif "Powertrain" in vehicle.warranty_coverage:
                warranty_score = base - 10.0
            else:
                warranty_score = base

        # 5. Service & Accident Disclosure Score (0 - 100)
        # Disclosed full agency is top; undisclosed is penalized heavily
        service_score = 0.0
        if vehicle.service_history_disclosed:
            if "Full Agency" in vehicle.service_history_type:
                service_score += 55.0
            elif "Partial" in vehicle.service_history_type:
                service_score += 35.0
            else:
                service_score += 20.0
        else:
            service_score += 5.0  # undisclosed warning

        if vehicle.accident_history_disclosed:
            if "Clean" in vehicle.accident_status:
                service_score += 45.0
            elif "Minor" in vehicle.accident_status:
                service_score += 25.0
            else:
                service_score += 10.0
        else:
            service_score += 0.0  # undisclosed accident history gets 0

        # GCC Spec bonus/penalty (imported non-GCC has severe resale and cooling considerations in UAE)
        if vehicle.specification != "GCC":
            service_score = max(10.0, service_score - 20.0)

        # 6. Data Completeness Score
        completeness_score = vehicle.calculate_completeness()

        # Weighted calculation
        total_score = (
            (price_score * (w["price"] / total_weight)) +
            (mileage_score * (w["mileage"] / total_weight)) +
            (year_score * (w["year"] / total_weight)) +
            (warranty_score * (w["warranty"] / total_weight)) +
            (service_score * (w["service_history"] / total_weight)) +
            (completeness_score * (w["completeness"] / total_weight))
        )

        return {
            "overall_score": round(total_score, 1),
            "breakdown": {
                "price_score": round(price_score, 1),
                "mileage_score": round(mileage_score, 1),
                "year_score": round(year_score, 1),
                "warranty_score": round(warranty_score, 1),
                "service_score": round(service_score, 1),
                "completeness_score": round(completeness_score, 1)
            },
            "applied_weights": w,
            "explanation": (
                f"Overall score {round(total_score, 1)}/100 calculated using user-configured criteria. "
                f"Year ({round(year_score, 1)}) and Mileage ({round(mileage_score, 1)}) assess mechanical youth, "
                f"Warranty ({round(warranty_score, 1)}) reflects risk mitigation, and "
                f"Disclosure ({round(service_score, 1)}) rigorously factors service records, accident disclosure, and GCC specification."
            )
        }

    @staticmethod
    def get_cross_dealer_benchmarks(vehicles: List[Vehicle], target_vehicle: Vehicle) -> Dict[str, Any]:
        """
        Finds comparable vehicles and computes cross-dealer price positioning.
        Clearly notes advertised prices are asking prices, not final transaction prices.
        """
        # Find comparables: same make and model, year within +/- 1
        comps = [
            v for v in vehicles
            if v.make.lower() == target_vehicle.make.lower()
            and v.model.lower() == target_vehicle.model.lower()
            and abs(v.year - target_vehicle.year) <= 1
        ]

        if not comps:
            comps = [target_vehicle]

        prices = [v.price_aed for v in comps]
        median_price = statistics.median(prices)
        min_price = min(prices)
        max_price = max(prices)
        avg_price = statistics.mean(prices)

        delta_from_median = target_vehicle.price_aed - median_price
        pct_from_median = (delta_from_median / median_price) * 100 if median_price else 0

        # Dealers offering comparable inventory
        dealers_represented = list(set([v.dealer_name for v in comps]))

        # Price reductions observed on comparables
        reduced_comps = [v for v in comps if v.original_price_aed > v.price_aed]

        return {
            "comparable_count": len(comps),
            "median_advertised_price_aed": round(median_price),
            "average_advertised_price_aed": round(avg_price),
            "min_advertised_price_aed": round(min_price),
            "max_advertised_price_aed": round(max_price),
            "target_price_aed": target_vehicle.price_aed,
            "delta_from_median_aed": round(delta_from_median),
            "pct_from_median": round(pct_from_median, 1),
            "dealers_represented": dealers_represented,
            "reduced_comparables_count": len(reduced_comps),
            "price_position_label": (
                "Below Market Median (Competitive)" if pct_from_median < -3
                else "Above Market Median (Premium/High Spec)" if pct_from_median > 3
                else "At Market Median"
            ),
            "disclaimer": "Important: Advertised asking prices may differ from closed transaction prices after dealer negotiation or trade-in allowances."
        }

    @staticmethod
    def generate_market_overview(vehicles: List[Vehicle]) -> Dict[str, Any]:
        """Summarizes aggregate market stats across dealers."""
        if not vehicles:
            return {}

        prices = [v.price_aed for v in vehicles if v.price_aed > 0]
        mileages = [v.mileage_km for v in vehicles if v.mileage_km >= 0]
        years = [v.year for v in vehicles]

        # Dealer counts
        dealer_counts: Dict[str, int] = {}
        for v in vehicles:
            dealer_counts[v.dealer_name] = dealer_counts.get(v.dealer_name, 0) + 1

        # Make counts
        make_counts: Dict[str, int] = {}
        for v in vehicles:
            make_counts[v.make] = make_counts.get(v.make, 0) + 1

        # GCC vs Imported
        gcc_count = sum(1 for v in vehicles if v.specification == "GCC")
        imported_count = sum(1 for v in vehicles if v.specification != "GCC")

        # Warranty presence
        warranty_count = sum(1 for v in vehicles if v.warranty_available)

        # Price drops
        price_drop_vehicles = [v for v in vehicles if v.original_price_aed > v.price_aed]
        total_drop_amount = sum(v.original_price_aed - v.price_aed for v in price_drop_vehicles)

        return {
            "total_vehicles": len(vehicles),
            "median_price_aed": round(statistics.median(prices)) if prices else 0,
            "average_price_aed": round(statistics.mean(prices)) if prices else 0,
            "min_price_aed": min(prices) if prices else 0,
            "max_price_aed": max(prices) if prices else 0,
            "average_mileage_km": round(statistics.mean(mileages)) if mileages else 0,
            "median_mileage_km": round(statistics.median(mileages)) if mileages else 0,
            "gcc_spec_count": gcc_count,
            "imported_spec_count": imported_count,
            "gcc_spec_pct": round((gcc_count / len(vehicles)) * 100, 1) if vehicles else 0,
            "warranty_available_count": warranty_count,
            "warranty_available_pct": round((warranty_count / len(vehicles)) * 100, 1) if vehicles else 0,
            "price_reductions_count": len(price_drop_vehicles),
            "total_price_savings_aed": round(total_drop_amount),
            "dealer_breakdown": dealer_counts,
            "make_breakdown": make_counts,
            "fuel_breakdown": {
                "Petrol": sum(1 for v in vehicles if v.fuel_type == "Petrol"),
                "Hybrid": sum(1 for v in vehicles if v.fuel_type == "Hybrid"),
                "Electric": sum(1 for v in vehicles if v.fuel_type == "Electric"),
                "Diesel": sum(1 for v in vehicles if v.fuel_type == "Diesel")
            },
            "body_type_breakdown": {
                "SUV": sum(1 for v in vehicles if v.body_type == "SUV"),
                "Sedan": sum(1 for v in vehicles if v.body_type == "Sedan"),
                "Coupe": sum(1 for v in vehicles if v.body_type == "Coupe"),
                "Hatchback": sum(1 for v in vehicles if v.body_type == "Hatchback")
            }
        }
