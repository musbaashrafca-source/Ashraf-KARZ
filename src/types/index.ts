export interface Dealer {
  id: string;
  name: string;
  website: string;
  inventory_source: string;
  source_url: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  last_updated: string;
  total_listings: number;
  inspection_standard: string;
}

export interface PricePoint {
  date: string;
  price_aed: number;
  note?: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  dealer_id: string;
  dealer_name: string;
  original_listing_url: string;
  is_demo_data: boolean;

  make: string;
  model: string;
  variant: string;
  year: number;
  price_aed: number;
  original_price_aed: number;
  mileage_km: number;

  fuel_type: 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel';
  engine_capacity_cc: number;
  transmission: string;
  body_type: 'SUV' | 'Sedan' | 'Coupe' | 'Hatchback' | 'Pickup';
  specification: 'GCC' | 'Imported (Non-GCC)';
  origin_country: string;

  warranty_available: boolean;
  warranty_duration_months: number;
  warranty_provider: string;
  warranty_coverage: string;

  service_history_disclosed: boolean;
  service_history_type: string;
  accident_history_disclosed: boolean;
  accident_status: string;

  inspection_report_available: boolean;
  inspection_points: number;
  inspection_summary: string;
  inspection_url?: string;

  exterior_color: string;
  interior_color: string;

  dealer_location: string;
  dealer_phone: string;
  dealer_whatsapp: string;

  photos: string[];
  listing_date: string;
  last_observed_date: string;
  availability_status: 'Available' | 'Reserved' | 'Under Inspection' | 'Delisted';

  price_history: PricePoint[];
  data_completeness_pct: number;
}

export interface SuitabilityWeights {
  price: number;
  mileage: number;
  year: number;
  warranty: number;
  service_history: number;
  completeness: number;
}

export interface SuitabilityScoreResult {
  overall_score: number;
  breakdown: {
    price_score: number;
    mileage_score: number;
    year_score: number;
    warranty_score: number;
    service_score: number;
    completeness_score: number;
  };
  applied_weights: SuitabilityWeights;
  explanation: string;
}

export interface CrossDealerBenchmark {
  comparable_count: number;
  median_advertised_price_aed: number;
  average_advertised_price_aed: number;
  min_advertised_price_aed: number;
  max_advertised_price_aed: number;
  target_price_aed: number;
  delta_from_median_aed: number;
  pct_from_median: number;
  dealers_represented: string[];
  reduced_comparables_count: number;
  price_position_label: string;
  disclaimer: string;
}

export interface MarketOverview {
  total_vehicles: number;
  median_price_aed: number;
  average_price_aed: number;
  min_price_aed: number;
  max_price_aed: number;
  average_mileage_km: number;
  median_mileage_km: number;
  gcc_spec_count: number;
  imported_spec_count: number;
  gcc_spec_pct: number;
  warranty_available_count: number;
  warranty_available_pct: number;
  price_reductions_count: number;
  total_price_savings_aed: number;
  dealer_breakdown: Record<string, number>;
  make_breakdown: Record<string, number>;
  fuel_breakdown: Record<string, number>;
  body_type_breakdown: Record<string, number>;
}

export interface PriceAlert {
  id: string;
  vehicle_id: string;
  vehicle_title: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  dealer_name: string;
  initial_price_aed: number;
  current_price_aed: number;
  target_price_aed: number;
  user_email?: string;
  created_at: string;
  status: 'active' | 'triggered' | 'dismissed';
  triggered_at?: string;
  triggered_price_aed?: number;
}

