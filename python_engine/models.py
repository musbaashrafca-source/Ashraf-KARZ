"""
Data Models for UAE Preowned Car Aggregator
Structured schema for vehicles, dealers, price history, and transparency audits.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime


@dataclass
class Dealer:
    id: str
    name: str
    website: str
    inventory_source: str  # 'api', 'feed_url', 'csv_import', 'crawler'
    source_url: str
    location: str  # e.g., 'Dubai - Al Quoz', 'Abu Dhabi'
    contact_phone: str
    contact_email: str
    is_active: bool = True
    last_updated: str = ""
    total_listings: int = 0
    inspection_standard: str = "Standard 50-point"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PricePoint:
    date: str
    price_aed: float
    note: str = ""


@dataclass
class Vehicle:
    id: str
    vin: str
    dealer_id: str
    dealer_name: str
    original_listing_url: str
    is_demo_data: bool  # Strictly flags demonstration data vs real feed

    # Core Spec
    make: str
    model: str
    variant: str
    year: int
    price_aed: float
    original_price_aed: float
    mileage_km: int

    # Technical Specs
    fuel_type: str  # 'Petrol', 'Hybrid', 'Electric', 'Diesel'
    engine_capacity_cc: int
    transmission: str  # 'Automatic', 'Manual', 'Dual-Clutch'
    body_type: str  # 'SUV', 'Sedan', 'Coupe', 'Hatchback', 'Pickup'
    specification: str  # 'GCC' or 'Imported (Non-GCC)'
    origin_country: str = "UAE / GCC"

    # Warranty
    warranty_available: bool = False
    warranty_duration_months: int = 0
    warranty_provider: str = "Undisclosed"  # 'Dealer In-house', 'Official Agency', 'Third-Party Extended'
    warranty_coverage: str = "Undisclosed"  # 'Comprehensive', 'Powertrain Only', 'None', 'Undisclosed'

    # Disclosures & History
    service_history_disclosed: bool = False
    service_history_type: str = "Undisclosed"  # 'Full Agency History', 'Partial Service Records', 'Undisclosed'
    accident_history_disclosed: bool = False
    accident_status: str = "Undisclosed"  # 'Clean Record Disclosed', 'Minor Fender Disclosed', 'Repaired Structural', 'Undisclosed'

    # Inspection
    inspection_report_available: bool = False
    inspection_points: int = 0  # e.g. 150, 99, 240
    inspection_summary: str = "No report available"
    inspection_url: str = ""

    # Appearance
    exterior_color: str = "White"
    interior_color: str = "Black"

    # Location & Contact
    dealer_location: str = "Dubai"
    dealer_phone: str = "+971 4 000 0000"
    dealer_whatsapp: str = "+971 50 000 0000"

    # Media & Dates
    photos: List[str] = field(default_factory=list)
    listing_date: str = ""
    last_observed_date: str = ""
    availability_status: str = "Available"  # 'Available', 'Reserved', 'Under Inspection', 'Delisted'

    # Price tracking
    price_history: List[PricePoint] = field(default_factory=list)

    # Transparency Score (0-100)
    data_completeness_pct: float = 0.0

    def calculate_completeness(self) -> float:
        """
        Calculates information transparency percentage.
        Missing information is never treated favorably.
        """
        checks = [
            bool(self.vin and len(self.vin) >= 11),
            bool(self.make and self.model and self.year),
            bool(self.price_aed > 0),
            bool(self.mileage_km >= 0),
            bool(self.specification in ["GCC", "Imported (Non-GCC)"]),
            bool(self.warranty_available and self.warranty_duration_months > 0 and self.warranty_provider != "Undisclosed"),
            bool(self.service_history_disclosed and self.service_history_type != "Undisclosed"),
            bool(self.accident_history_disclosed and self.accident_status != "Undisclosed"),
            bool(self.inspection_report_available and self.inspection_points > 0),
            bool(len(self.photos) > 0),
        ]
        return round((sum(checks) / len(checks)) * 100, 1)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["data_completeness_pct"] = self.calculate_completeness()
        return data
