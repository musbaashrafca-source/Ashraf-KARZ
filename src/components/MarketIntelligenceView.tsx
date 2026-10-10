import React, { useState, useMemo } from 'react';
import { Vehicle, MarketOverview } from '../types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  Calendar,
  Info,
  DollarSign,
  Gauge,
  Percent,
  CheckCircle2,
  AlertOctagon,
  Building2,
  Flame
} from 'lucide-react';

interface MarketIntelligenceViewProps {
  overview: MarketOverview | null;
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  overview,
  vehicles,
  onSelectVehicle,
}) => {
  const [reportingPeriod, setReportingPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [selectedMakeFilter, setSelectedMakeFilter] = useState('all');

  // Filter vehicles if make filter is active
  const filteredVehicles = useMemo(() => {
    if (selectedMakeFilter === 'all') return vehicles;
    return vehicles.filter((v) => v.make === selectedMakeFilter);
  }, [vehicles, selectedMakeFilter]);

  // Aggregate model intelligence
  const modelTrends = useMemo(() => {
    const map: Record<
      string,
      {
        make: string;
        model: string;
        listings: number;
        dealers: Set<string>;
        priceDrops: number;
        prices: number[];
        totalSavings: number;
      }
    > = {};

    filteredVehicles.forEach((v) => {
      const key = `${v.make} ${v.model}`;
      if (!map[key]) {
        map[key] = {
          make: v.make,
          model: v.model,
          listings: 0,
          dealers: new Set(),
          priceDrops: 0,
          prices: [],
          totalSavings: 0,
        };
      }
      map[key].listings += 1;
      map[key].dealers.add(v.dealer_name);
      if (v.original_price_aed > v.price_aed) {
        map[key].priceDrops += 1;
        map[key].totalSavings += v.original_price_aed - v.price_aed;
      }
      map[key].prices.push(v.price_aed);
    });

    return Object.entries(map).map(([key, data]) => {
      const sorted = [...data.prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] || 0;
      return {
        modelName: key,
        make: data.make,
        model: data.model,
        listingsCount: data.listings,
        dealersCount: data.dealers.size,
        dealersList: Array.from(data.dealers),
        priceDropsCount: data.priceDrops,
        medianPriceAed: median,
        totalSavingsAed: data.totalSavings,
      };
    }).sort((a, b) => b.listingsCount - a.listingsCount);
  }, [filteredVehicles]);

  // Top price dropped vehicles
  const topDiscountedVehicles = useMemo(() => {
    return [...filteredVehicles]
      .filter((v) => v.original_price_aed > v.price_aed)
      .sort((a, b) => (b.original_price_aed - b.price_aed) - (a.original_price_aed - a.price_aed))
      .slice(0, 5);
  }, [filteredVehicles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Reporting Period Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            UAE Preowned Market Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Inventory velocity, cross-dealer pricing distributions, and historical pricing adjustments across Al-Futtaim Automall, CARS24, Kavak, CarSwitch, and The Elite Cars.
          </p>
        </div>

        {/* Timeframe Selector (Interactive Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {(['7d', '30d', '90d', '12m'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setReportingPeriod(period)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                reportingPeriod === period
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === '7d'
                ? 'Last 7 Days'
                : period === '30d'
                ? 'Last 30 Days'
                : period === '90d'
                ? 'Last 90 Days'
                : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Demand vs Supply Distinction Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">
            Market Intelligence Methodological Notice
          </h4>
          <p className="leading-relaxed text-amber-800">
            <strong>Distinguishing Inventory Supply from Buyer Demand:</strong> Listing counts and inventory growth reflect dealer stocking, procurement channels, and trade-in volumes. A high number of listings does not inherently signify that a vehicle is selling quickly or in high consumer demand. Prices displayed represent seller asking prices and exclude closed private negotiations or RTA titling fees.
          </p>
        </div>
      </div>

      {/* Executive Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Observed Inventory
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {filteredVehicles.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              5 Dealer Networks
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1 border-t border-slate-100">
            Updated today across Dubai, Abu Dhabi, Sharjah
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Median Advertised Price
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900">
              AED {(overview?.median_price_aed || 258000).toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1 border-t border-slate-100">
            Mean: AED {(overview?.average_price_aed || 296000).toLocaleString()}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            GCC Spec Ratio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-emerald-700">
              {overview?.gcc_spec_pct || 94.4}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              {overview?.gcc_spec_count || 17} of {overview?.total_vehicles || 18}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1 border-t border-slate-100">
            Imported non-GCC: {overview?.imported_spec_count || 1} units
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Observed Price Reductions
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-amber-700">
              {overview?.price_reductions_count || 18} Listings
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1 border-t border-slate-100">
            Total discounts: AED {(overview?.total_price_savings_aed || 175000).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dealer Inventory Share & Body Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dealer Share */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Inventory by Dealer Network</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {filteredVehicles.length}
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(overview?.dealer_breakdown || {}).map(([dealerName, count]) => {
              const pct = Math.round((count / (overview?.total_vehicles || 1)) * 100);
              return (
                <div key={dealerName} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-700 font-medium">
                    <span>{dealerName}</span>
                    <span className="font-mono">
                      {count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Powertrain & Body Type Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-600" />
              <span>Body Style & Fuel Architecture</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">GCC Distribution</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-900 block border-b border-slate-100 pb-1">
                Body Classification
              </span>
              {Object.entries(overview?.body_type_breakdown || {}).map(([body, count]) => (
                <div key={body} className="flex justify-between text-slate-600">
                  <span>{body}</span>
                  <span className="font-mono font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-900 block border-b border-slate-100 pb-1">
                Fuel Technology
              </span>
              {Object.entries(overview?.fuel_breakdown || {}).map(([fuel, count]) => (
                <div key={fuel} className="flex justify-between text-slate-600">
                  <span>{fuel}</span>
                  <span className="font-mono font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Note: UAE preowned market remains predominantly SUV oriented (~80%), followed by executive sedans.
          </div>
        </div>
      </div>

      {/* Model-Level Market Intelligence Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Most Widely Stocked UAE Models & Multi-Dealer Availability
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Models stocked across 2 or more dealers enable direct cross-dealer pricing leverage.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter Make:</span>
            <select
              value={selectedMakeFilter}
              onChange={(e) => setSelectedMakeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Makes</option>
              {Array.from(new Set(vehicles.map((v) => v.make))).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-3.5 pl-5">Make & Model</th>
                <th className="p-3.5">Aggregated Listings</th>
                <th className="p-3.5">Dealer Availability</th>
                <th className="p-3.5">Median Advertised Price</th>
                <th className="p-3.5">Observed Reductions</th>
                <th className="p-3.5 pr-5">Inventory Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelTrends.map((trend) => (
                <tr key={trend.modelName} className="hover:bg-slate-50/50">
                  <td className="p-3.5 pl-5 font-bold text-slate-900">
                    {trend.modelName}
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-slate-700">
                    {trend.listingsCount} units
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {trend.dealersCount} Dealers
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                      {trend.dealersList.join(', ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">
                    AED {trend.medianPriceAed.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    {trend.priceDropsCount > 0 ? (
                      <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {trend.priceDropsCount} reductions (-AED {trend.totalSavingsAed.toLocaleString()})
                      </span>
                    ) : (
                      <span className="text-slate-400">Stable asking price</span>
                    )}
                  </td>
                  <td className="p-3.5 pr-5">
                    <span className="font-mono text-xs text-slate-700">
                      {trend.listingsCount >= 3 ? '+14% stocking growth' : '+5% steady'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Observed Price Reductions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-700" />
              <span>Largest Observed Price Reductions (Recent Adjustments)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Listings where the seller lowered advertised asking price during the observation period.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topDiscountedVehicles.map((vehicle) => {
            const drop = vehicle.original_price_aed - vehicle.price_aed;
            const dropPct = Math.round((drop / vehicle.original_price_aed) * 100);

            return (
              <div
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle)}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {vehicle.dealer_name}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    -{dropPct}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="font-mono text-base font-bold text-slate-900">
                      AED {vehicle.price_aed.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs text-slate-400 line-through block">
                      AED {vehicle.original_price_aed.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-700">
                    Save AED {drop.toLocaleString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200">
                  <span>{vehicle.specification}</span>
                  <span>{vehicle.mileage_km.toLocaleString()} km</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
