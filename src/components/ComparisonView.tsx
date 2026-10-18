import React, { useState, useEffect } from 'react';
import { Vehicle, SuitabilityWeights } from '../types';
import {
  SlidersHorizontal,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingDown,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { getVehicleImage } from '../utils/carImages';

interface ComparisonViewProps {
  compareList: Vehicle[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectVehicle: (v: Vehicle) => void;
  onGoToInventory: () => void;
  allVehicles: Vehicle[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onSelectVehicle,
  onGoToInventory,
  allVehicles,
}) => {
  // Weights for Buyer Suitability Score (0 - 100)
  const [weights, setWeights] = useState<SuitabilityWeights>({
    price: 25,
    mileage: 20,
    year: 15,
    warranty: 15,
    service_history: 15,
    completeness: 10,
  });

  const [showWeightsConfig, setShowWeightsConfig] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Calculate suitability scores for each vehicle
  const scoredVehicles = React.useMemo(() => {
    const totalW =
      weights.price +
      weights.mileage +
      weights.year +
      weights.warranty +
      weights.service_history +
      weights.completeness || 100;

    return compareList.map((v) => {
      // 1. Price Score
      const comps = allVehicles.filter(
        (other) => other.make === v.make && other.model === v.model
      );
      let priceScore = 75;
      if (comps.length > 1) {
        const sorted = comps.map((c) => c.price_aed).sort((a, b) => a - b);
        const med = sorted[Math.floor(sorted.length / 2)];
        const deltaPct = ((v.price_aed - med) / (med || 1)) * 100;
        priceScore = Math.max(20, Math.min(100, 75 - deltaPct * 1.5));
      }

      // 2. Mileage Score
      const carAge = Math.max(1, 2026 - v.year);
      const annualKm = v.mileage_km / carAge;
      let mileageScore = 70;
      if (annualKm <= 12000) mileageScore = 95;
      else if (annualKm <= 18000) mileageScore = 85;
      else if (annualKm <= 25000) mileageScore = 70;
      else if (annualKm <= 35000) mileageScore = 50;
      else mileageScore = 30;

      // 3. Year Score
      const age = 2026 - v.year;
      const yearScore = Math.max(25, 95 - age * 12);

      // 4. Warranty Score (Undisclosed / Missing = 0)
      let warrantyScore = 0;
      if (v.warranty_available) {
        let base = 60;
        if (v.warranty_duration_months >= 36) base = 95;
        else if (v.warranty_duration_months >= 24) base = 88;
        else if (v.warranty_duration_months >= 12) base = 75;

        if (
          v.warranty_coverage.includes('Comprehensive') ||
          v.warranty_provider.includes('Agency')
        ) {
          warrantyScore = Math.min(100, base + 5);
        } else {
          warrantyScore = base;
        }
      }

      // 5. Service & Disclosures Score
      let serviceScore = 0;
      if (v.service_history_disclosed) {
        if (v.service_history_type.includes('Full Agency')) serviceScore += 55;
        else if (v.service_history_type.includes('Partial')) serviceScore += 35;
        else serviceScore += 20;
      }
      if (v.accident_history_disclosed) {
        if (v.accident_status.includes('Clean')) serviceScore += 45;
        else if (v.accident_status.includes('Minor')) serviceScore += 25;
        else serviceScore += 10;
      }
      if (v.specification !== 'GCC') {
        serviceScore = Math.max(10, serviceScore - 20);
      }

      // 6. Data Completeness
      const completenessScore = v.data_completeness_pct || 70;

      const overall =
        (priceScore * weights.price +
          mileageScore * weights.mileage +
          yearScore * weights.year +
          warrantyScore * weights.warranty +
          serviceScore * weights.service_history +
          completenessScore * weights.completeness) /
        totalW;

      return {
        vehicle: v,
        overallScore: Math.round(overall * 10) / 10,
        priceScore: Math.round(priceScore),
        mileageScore: Math.round(mileageScore),
        yearScore: Math.round(yearScore),
        warrantyScore: Math.round(warrantyScore),
        serviceScore: Math.round(serviceScore),
        completenessScore: Math.round(completenessScore),
      };
    });
  }, [compareList, allVehicles, weights]);

  // Find the highest scoring vehicle
  const bestValueVehicle = React.useMemo(() => {
    if (!scoredVehicles.length) return null;
    return [...scoredVehicles].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [scoredVehicles]);

  if (compareList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <SlidersHorizontal className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No vehicles in comparison queue</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Select between 2 and 5 vehicles from the consolidated inventory to compare prices, GCC specifications, warranty terms, and calculate your custom Buyer Suitability Score.
        </p>
        <button
          onClick={onGoToInventory}
          className="px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <span>Browse Inventory</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Cross-Dealer Vehicle Comparison
            </h1>
            <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {compareList.length} of 5 Vehicles
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Side-by-side technical, warranty, accident disclosure, and dealer evaluation with customized suitability scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowWeightsConfig(!showWeightsConfig)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Configure Scoring Weights</span>
          </button>

          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors border ${
              highlightDifferences
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            Highlight Differences
          </button>

          <button
            onClick={onClearCompare}
            className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Configurable Buyer Suitability Weights Panel */}
      {showWeightsConfig && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <span>Buyer Suitability Score Weights Configuration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust criteria weightings to reflect your personal purchasing priorities.
                Missing or undisclosed information is penalized automatically.
              </p>
            </div>
            <button
              onClick={() =>
                setWeights({
                  price: 25,
                  mileage: 20,
                  year: 15,
                  warranty: 15,
                  service_history: 15,
                  completeness: 10,
                })
              }
              className="text-xs text-amber-700 hover:underline font-semibold"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Price Competitiveness: {weights.price}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.price}
                onChange={(e) => setWeights({ ...weights, price: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Mileage Freshness: {weights.mileage}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.mileage}
                onChange={(e) => setWeights({ ...weights, mileage: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Model Year Recency: {weights.year}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.year}
                onChange={(e) => setWeights({ ...weights, year: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Warranty Protection: {weights.warranty}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.warranty}
                onChange={(e) => setWeights({ ...weights, warranty: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Service & Disclosures: {weights.service_history}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.service_history}
                onChange={(e) => setWeights({ ...weights, service_history: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Data Completeness: {weights.completeness}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.completeness}
                onChange={(e) => setWeights({ ...weights, completeness: parseInt(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            {/* Top Row: Vehicle Cards */}
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-4 w-48 text-xs font-semibold text-slate-400 uppercase tracking-wider align-top">
                Vehicle Overview
              </th>
              {scoredVehicles.map(({ vehicle, overallScore }) => {
                const isBest = bestValueVehicle?.vehicle.id === vehicle.id;
                return (
                  <th key={vehicle.id} className="p-4 w-64 align-top">
                    <div className="relative space-y-3">
                      {/* Best Value Badge */}
                      {isBest && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-sm">
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          <span>Top Value Alternative</span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveFromCompare(vehicle.id)}
                        className="absolute top-0 right-0 p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Image */}
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={getVehicleImage(vehicle)}
                          alt={vehicle.model}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = getVehicleImage(null);
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Title & Dealer */}
                      <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase block">
                          {vehicle.dealer_name}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">
                          {vehicle.variant}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="p-2.5 bg-slate-100 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Suitability Score:</span>
                        <span className="font-mono text-base font-bold text-slate-950">
                          {overallScore}
                          <span className="text-xs text-slate-400">/100</span>
                        </span>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Row 1: Advertised Price */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Advertised Price (AED)
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-base text-slate-900 block">
                      AED {vehicle.price_aed.toLocaleString()}
                    </span>
                    {vehicle.original_price_aed > vehicle.price_aed && (
                      <span className="font-mono text-[11px] text-emerald-700 font-semibold block">
                        Observed drop: -AED {(vehicle.original_price_aed - vehicle.price_aed).toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 2: Mileage & Annual Rate */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Mileage & Usage
              </td>
              {scoredVehicles.map(({ vehicle }) => {
                const age = Math.max(1, 2026 - vehicle.year);
                const annual = Math.round(vehicle.mileage_km / age);
                return (
                  <td key={vehicle.id} className="p-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      {vehicle.mileage_km.toLocaleString()} km
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ~{annual.toLocaleString()} km / year
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Specification (GCC vs Non-GCC) */}
            <tr className={highlightDifferences ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Specification & Origin
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  <span
                    className={`font-semibold block ${
                      vehicle.specification === 'GCC' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {vehicle.specification}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {vehicle.origin_country}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 4: Warranty Details */}
            <tr className={highlightDifferences ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Warranty Protection
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  {vehicle.warranty_available ? (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-emerald-700 block">
                        {vehicle.warranty_duration_months} Months ({vehicle.warranty_coverage})
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {vehicle.warranty_provider}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-400">None / Undisclosed</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 5: Service History Records */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Service History
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  <span
                    className={`font-semibold block ${
                      vehicle.service_history_disclosed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {vehicle.service_history_type}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 6: Accident Disclosure */}
            <tr className={highlightDifferences ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Accident History Disclosure
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  <span
                    className={`font-semibold block ${
                      vehicle.accident_status.includes('Clean')
                        ? 'text-emerald-700'
                        : vehicle.accident_status.includes('Minor')
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {vehicle.accident_status}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 7: Inspection Report Availability */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Technical Inspection
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  {vehicle.inspection_report_available ? (
                    <div>
                      <span className="font-mono font-bold text-emerald-700 block">
                        {vehicle.inspection_points}-Point Certified
                      </span>
                      <span className="text-slate-500 text-[11px] line-clamp-2">
                        {vehicle.inspection_summary}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-semibold">No Report</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 8: Data Completeness Score */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Data Completeness
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4 font-mono font-semibold text-slate-900">
                  {vehicle.data_completeness_pct}%
                </td>
              ))}
            </tr>

            {/* Row 9: Dealer Location & Contact */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Showroom Location
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4 text-slate-700">
                  <span className="font-semibold block">{vehicle.dealer_name}</span>
                  <span className="text-[11px] text-slate-500 block">{vehicle.dealer_location}</span>
                </td>
              ))}
            </tr>

            {/* Row 10: Dossier Action */}
            <tr className="bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/30">
                Actions
              </td>
              {scoredVehicles.map(({ vehicle }) => (
                <td key={vehicle.id} className="p-4">
                  <button
                    onClick={() => onSelectVehicle(vehicle)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    View Full Dossier
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory Formula Callout */}
      <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 space-y-2 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>How the Buyer Suitability Score is Calculated</span>
        </h4>
        <p className="leading-relaxed">
          The Buyer Suitability Score uses a deterministic, multi-variable ranking formula that integrates <strong>price competitiveness</strong> relative to market median, <strong>mileage freshness</strong> (annual km rate against UAE average), <strong>model year recency</strong>, <strong>active warranty coverage duration</strong>, <strong>agency service records</strong>, and <strong>overall data completeness</strong>.
        </p>
        <p className="font-medium text-slate-700">
          Strict Policy: Missing or undisclosed items (e.g. absent accident disclosures or undisclosed warranty coverage) are penalized and never treated favorably.
        </p>
      </div>
    </div>
  );
};
