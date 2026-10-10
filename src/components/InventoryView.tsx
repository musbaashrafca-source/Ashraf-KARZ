import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Check,
  Plus,
  Eye,
  Shield,
  FileCheck,
  TrendingDown,
  AlertCircle,
  X,
  MapPin,
  ChevronDown
} from 'lucide-react';

interface InventoryViewProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  compareList: Vehicle[];
  onToggleCompare: (vehicle: Vehicle) => void;
  onOpenPythonDocs: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  vehicles,
  onSelectVehicle,
  compareList,
  onToggleCompare,
  onOpenPythonDocs,
}) => {
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedDealer, setSelectedDealer] = useState('all');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedBody, setSelectedBody] = useState('all');
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [maxMileage, setMaxMileage] = useState<number>(150000);
  const [minYear, setMinYear] = useState<number>(2020);
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [serviceOnly, setServiceOnly] = useState(false);
  const [inspectionOnly, setInspectionOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent_listed');

  // Filter options derived from data
  const makes = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => v.make))).sort();
  }, [vehicles]);

  const dealers = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => v.dealer_name))).sort();
  }, [vehicles]);

  const bodyTypes = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => v.body_type))).sort();
  }, [vehicles]);

  // Apply filters
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        if (search) {
          const q = search.toLowerCase();
          const matchText = `${v.make} ${v.model} ${v.variant} ${v.vin} ${v.dealer_name} ${v.dealer_location}`.toLowerCase();
          if (!matchText.includes(q)) return false;
        }
        if (selectedMake !== 'all' && v.make !== selectedMake) return false;
        if (selectedDealer !== 'all' && v.dealer_name !== selectedDealer) return false;
        if (selectedSpec !== 'all' && v.specification !== selectedSpec) return false;
        if (selectedBody !== 'all' && v.body_type !== selectedBody) return false;
        if (selectedFuel !== 'all' && v.fuel_type !== selectedFuel) return false;
        if (v.price_aed > maxPrice) return false;
        if (v.mileage_km > maxMileage) return false;
        if (v.year < minYear) return false;
        if (warrantyOnly && !v.warranty_available) return false;
        if (serviceOnly && !v.service_history_disclosed) return false;
        if (inspectionOnly && !v.inspection_report_available) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price_aed - b.price_aed;
          case 'price_desc':
            return b.price_aed - a.price_aed;
          case 'mileage_asc':
            return a.mileage_km - b.mileage_km;
          case 'year_desc':
            return b.year - a.year;
          case 'discount_desc':
            return (b.original_price_aed - b.price_aed) - (a.original_price_aed - a.price_aed);
          case 'completeness_desc':
            return b.data_completeness_pct - a.data_completeness_pct;
          case 'recent_listed':
          default:
            return new Date(b.listing_date).getTime() - new Date(a.listing_date).getTime();
        }
      });
  }, [
    vehicles,
    search,
    selectedMake,
    selectedDealer,
    selectedSpec,
    selectedBody,
    selectedFuel,
    maxPrice,
    maxMileage,
    minYear,
    warrantyOnly,
    serviceOnly,
    inspectionOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearch('');
    setSelectedMake('all');
    setSelectedDealer('all');
    setSelectedSpec('all');
    setSelectedBody('all');
    setSelectedFuel('all');
    setMaxPrice(800000);
    setMaxMileage(150000);
    setMinYear(2020);
    setWarrantyOnly(false);
    setServiceOnly(false);
    setInspectionOnly(false);
    setSortBy('recent_listed');
  };

  const isVehicleInCompare = (id: string) => {
    return compareList.some((c) => c.id === id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            UAE Consolidated Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Real-time aggregate listings across Al-Futtaim Automall, CARS24, Kavak, CarSwitch, and The Elite Cars. Full inspection, GCC spec, and history disclosures.
          </p>
        </div>

        {/* Quick summary metric strip */}
        <div className="flex items-center gap-6 text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Listings</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{filteredVehicles.length}</span>
          </div>
          <div className="w-px h-6 bg-slate-300" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">GCC Spec</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {filteredVehicles.filter((v) => v.specification === 'GCC').length}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-300" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Price Drops</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {filteredVehicles.filter((v) => v.original_price_aed > v.price_aed).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Filter Bar & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Row 1: Search & Core Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search make, model, VIN, dealer..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dealer Select */}
          <div>
            <select
              value={selectedDealer}
              onChange={(e) => setSelectedDealer(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">All Dealers (5 UAE Hubs)</option>
              {dealers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Make Select */}
          <div>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">All Makes</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="recent_listed">Recently Listed</option>
              <option value="price_asc">Price: Lowest to Highest</option>
              <option value="price_desc">Price: Highest to Lowest</option>
              <option value="discount_desc">Largest Price Reduction</option>
              <option value="mileage_asc">Mileage: Lowest First</option>
              <option value="year_desc">Year: Newest First</option>
              <option value="completeness_desc">Transparency Completeness</option>
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filters & Sliders */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Checkbox Disclosures */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={warrantyOnly}
                onChange={(e) => setWarrantyOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>Warranty Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={serviceOnly}
                onChange={(e) => setServiceOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>Full Service Records</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={inspectionOnly}
                onChange={(e) => setInspectionOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>Inspection Report Available</span>
            </label>

            {/* Spec Filter */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-500">Spec:</span>
              <button
                onClick={() => setSelectedSpec('all')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedSpec === 'all' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedSpec('GCC')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedSpec === 'GCC' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                GCC Only
              </button>
              <button
                onClick={() => setSelectedSpec('Imported (Non-GCC)')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedSpec === 'Imported (Non-GCC)'
                    ? 'bg-amber-800 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Imported (Non-GCC)
              </button>
            </div>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Max AED <strong className="font-mono text-slate-700">{maxPrice.toLocaleString()}</strong>
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Floating Compare Action Bar if cars are selected */}
      {compareList.length > 0 && (
        <div className="sticky top-20 z-30 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Comparison Queue
            </span>
            <span className="text-sm font-medium">
              {compareList.length} of 5 vehicles selected
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ({compareList.map((c) => `${c.make} ${c.model}`).join(', ')})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(compareList[0])}
              className="text-xs text-slate-300 hover:text-white px-2 py-1"
            >
              Clear Queue
            </button>
            <button
              onClick={() => {
                const navBtn = document.querySelector('button[name="compare-nav"]') as HTMLElement;
                if (navBtn) navBtn.click();
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
            >
              Compare Side-by-Side →
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No vehicles match current criteria</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your price ceiling, mileage filter, or clearing the warranty and inspection restrictions.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const inCompare = isVehicleInCompare(vehicle.id);
            const priceDropped = vehicle.original_price_aed > vehicle.price_aed;
            const dropAmount = vehicle.original_price_aed - vehicle.price_aed;

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 transition-all shadow-xs group"
              >
                {/* 1. Vehicle Image Container */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={vehicle.photos[0] || '/src/assets/images/hero_uae_luxury_fleet_1791627589055.jpg'}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Top Bar on Image: Dealer & Price Drop */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-semibold bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-sm shadow-xs">
                      {vehicle.dealer_name}
                    </span>

                    {priceDropped && (
                      <span className="text-[11px] font-bold font-mono bg-emerald-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-xs">
                        <TrendingDown className="w-3 h-3" />
                        -AED {dropAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Spec marker bottom right */}
                  <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm shadow-xs ${
                        vehicle.specification === 'GCC'
                          ? 'bg-slate-900/80 text-emerald-400'
                          : 'bg-amber-950/90 text-amber-300'
                      }`}
                    >
                      {vehicle.specification === 'GCC' ? 'GCC Spec' : 'Imported (Non-GCC)'}
                    </span>
                  </div>
                </div>

                {/* 2. Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Quiet unboxed metadata: Year · Mileage · Engine */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <span>{vehicle.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{vehicle.mileage_km.toLocaleString()} km</span>
                      <span aria-hidden="true">·</span>
                      <span>{vehicle.fuel_type}</span>
                    </div>

                    {/* Vehicle Title */}
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight mt-0.5 line-clamp-1">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {vehicle.variant}
                    </p>

                    {/* Price Block */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-950">
                        AED {vehicle.price_aed.toLocaleString()}
                      </span>
                      {priceDropped && (
                        <span className="text-xs font-mono text-slate-400 line-through">
                          AED {vehicle.original_price_aed.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. Disclosures Summary Strip (Quiet unboxed indicators) */}
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Warranty:</span>
                      <span className="font-medium text-slate-700">
                        {vehicle.warranty_available
                          ? `${vehicle.warranty_duration_months} Mos (${vehicle.warranty_coverage})`
                          : 'None / Undisclosed'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Inspection:</span>
                      <span className="font-medium text-slate-700">
                        {vehicle.inspection_report_available
                          ? `${vehicle.inspection_points}-Point Certified`
                          : 'No Report Disclosed'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Showroom:</span>
                      <span className="text-slate-700 flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{vehicle.dealer_location}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4. Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectVehicle(vehicle)}
                      className="flex-1 py-2 px-3 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Dossier</span>
                    </button>

                    <button
                      onClick={() => onToggleCompare(vehicle)}
                      disabled={!inCompare && compareList.length >= 5}
                      className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        inCompare
                          ? 'bg-amber-600 text-white'
                          : compareList.length >= 5
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={
                        compareList.length >= 5 && !inCompare
                          ? 'Max 5 vehicles in comparison'
                          : 'Add to comparison'
                      }
                    >
                      {inCompare ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Compare</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
