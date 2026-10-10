import React, { useState } from 'react';
import { Vehicle, CrossDealerBenchmark } from '../types';
import {
  X,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  History,
  Calculator,
  ChevronRight,
  TrendingDown,
  Info,
  Car
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  benchmark?: CrossDealerBenchmark | null;
  onClose: () => void;
  onToggleCompare: (vehicle: Vehicle) => void;
  isInCompare: boolean;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  benchmark,
  onClose,
  onToggleCompare,
  isInCompare,
}) => {
  if (!vehicle) return null;

  // UAE Out-of-door transfer cost calculations
  const rtaInspectionFee = 170; // Tasjeel / Shamil vehicle testing fee
  const rtaTransferFee = 420; // RTA ownership certificate & transfer
  const knowledgeFee = 20;
  const plateFee = 120;
  const estimatedInsurance = Math.round(vehicle.price_aed * 0.0225); // ~2.25% average UAE comprehensive insurance
  const totalOnTheRoad =
    vehicle.price_aed + rtaInspectionFee + rtaTransferFee + knowledgeFee + plateFee + estimatedInsurance;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {vehicle.dealer_name}
            </span>
            <span className="text-xs font-mono text-slate-500">
              VIN: {vehicle.vin}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleCompare(vehicle)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isInCompare
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isInCompare ? 'In Comparison Queue' : '+ Add to Comparison'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Top Gallery & Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Photograph */}
            <div className="space-y-3">
              <div className="aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={vehicle.photos[0] || '/src/assets/images/hero_uae_luxury_fleet_1791627589055.jpg'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo Caption & Availability */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Status:{' '}
                  <strong className="text-emerald-700 font-semibold">
                    {vehicle.availability_status}
                  </strong>
                </span>
                <span className="font-mono">
                  Observed: {vehicle.last_observed_date}
                </span>
              </div>
            </div>

            {/* Title, Pricing & Dealer Card */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">
                  {vehicle.year} · {vehicle.mileage_km.toLocaleString()} km · {vehicle.body_type}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  {vehicle.make} {vehicle.model}
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  {vehicle.variant}
                </p>

                {/* Price Display */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold block">
                        Advertised Asking Price
                      </span>
                      <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                        AED {vehicle.price_aed.toLocaleString()}
                      </span>
                    </div>

                    {vehicle.original_price_aed > vehicle.price_aed && (
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 line-through block">
                          AED {vehicle.original_price_aed.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 font-mono">
                          -AED {(vehicle.original_price_aed - vehicle.price_aed).toLocaleString()} observed drop
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Market Benchmark Badge if available */}
                  {benchmark && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-500">Cross-Dealer Benchmark:</span>
                      <span className="font-semibold text-slate-800">
                        {benchmark.price_position_label}{' '}
                        <span className="font-mono text-slate-500">
                          ({benchmark.pct_from_median >= 0 ? '+' : ''}
                          {benchmark.pct_from_median}% vs AED {benchmark.median_advertised_price_aed.toLocaleString()} median)
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dealer Contact Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">
                      Dealer & Showroom
                    </span>
                    <span className="text-sm font-semibold">{vehicle.dealer_name}</span>
                  </div>
                  <a
                    href={vehicle.original_listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Original Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{vehicle.dealer_location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <a
                    href={`tel:${vehicle.dealer_phone}`}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Showroom</span>
                  </a>
                  <a
                    href={`https://wa.me/${vehicle.dealer_whatsapp.replace(/[^0-9]/g, '')}?text=Inquiring%20about%20${encodeURIComponent(`${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* GCC Specification & Critical Warnings */}
          <div
            className={`p-4 rounded-xl border ${
              vehicle.specification === 'GCC'
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/70 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {vehicle.specification === 'GCC' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Specification: {vehicle.specification}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    ({vehicle.origin_country})
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vehicle.specification === 'GCC'
                    ? 'Built to Gulf Cooperation Council specifications. Factory engineered with high-capacity desert cooling radiator, enhanced AC compressor, tropicalized rubber seals, and standard GCC agency diagnostics support.'
                    : 'Attention: Non-GCC Imported vehicle (e.g. North America, Europe, or Japan). Verify radio frequency compatibility, radiator capacity, and ensure the vehicle has passed the mandatory RTA chassis safety test. Resale values and trade-in offers are typically 15–25% lower.'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Technical Specifications & Aesthetics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Engine Capacity</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {vehicle.engine_capacity_cc > 0 ? `${vehicle.engine_capacity_cc} cc` : 'Electric Dual Motor'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Transmission</span>
                <span className="font-semibold text-slate-900">{vehicle.transmission}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Exterior Colour</span>
                <span className="font-semibold text-slate-900">{vehicle.exterior_color}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Interior Colour</span>
                <span className="font-semibold text-slate-900">{vehicle.interior_color}</span>
              </div>
            </div>
          </div>

          {/* Transparency & Disclosures Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Dealer History & Disclosures Audit
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Transparency Score: <strong className="text-slate-900">{vehicle.data_completeness_pct}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Warranty disclosure */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Warranty Protection</span>
                  <span
                    className={`font-semibold ${
                      vehicle.warranty_available ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {vehicle.warranty_available ? `${vehicle.warranty_duration_months} Months` : 'None / Undisclosed'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Provider: <strong>{vehicle.warranty_provider}</strong>
                  <br />
                  Coverage: {vehicle.warranty_coverage}
                </p>
              </div>

              {/* Service records */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Service History Records</span>
                  <span
                    className={`font-semibold ${
                      vehicle.service_history_disclosed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {vehicle.service_history_type}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {vehicle.service_history_disclosed
                    ? 'Official maintenance stamps or agency digital service ledger available for verification.'
                    : 'Undisclosed: Inquire with dealer for service booklet or agency printout before deposit.'}
                </p>
              </div>

              {/* Accident history */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Accident Disclosure</span>
                  <span
                    className={`font-semibold ${
                      vehicle.accident_status.includes('Clean')
                        ? 'text-emerald-700'
                        : vehicle.accident_status.includes('Minor')
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {vehicle.accident_status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Note: Always verify with official Emirates Vehicle Gate (EVG) or MOI chassis accident inquiry.
                </p>
              </div>

              {/* Inspection report */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Technical Inspection</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {vehicle.inspection_points}-Point Certified
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {vehicle.inspection_summary}
                </p>
              </div>
            </div>
          </div>

          {/* Observed Price History Timeline */}
          {vehicle.price_history && vehicle.price_history.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Observed Price Changes History
              </h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                {vehicle.price_history.map((ph, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{ph.date}</span>
                      <span className="text-slate-700">{ph.note || 'Observation checkpoint'}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      AED {ph.price_aed.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical RTA Estimated Transfer & Out-of-Pocket Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-600" />
              <span>UAE Estimated Out-of-Door Transfer Cost Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Includes mandatory Dubai/Abu Dhabi Roads and Transport Authority (RTA) fees and estimated comprehensive insurance.
            </p>

            <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 text-xs">
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">Advertised Asking Price:</span>
                <span className="font-mono font-semibold text-slate-900">
                  AED {vehicle.price_aed.toLocaleString()}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">RTA Technical Passing Test (Tasjeel / Shamil):</span>
                <span className="font-mono text-slate-800">AED {rtaInspectionFee}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">RTA Ownership Transfer & Title Certificate:</span>
                <span className="font-mono text-slate-800">AED {rtaTransferFee}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">Knowledge & Innovation Fees:</span>
                <span className="font-mono text-slate-800">AED {knowledgeFee}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">Traffic File & Standard Number Plate Fee:</span>
                <span className="font-mono text-slate-800">AED {plateFee}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-600">Estimated 1-Year Comprehensive Insurance (~2.25%):</span>
                <span className="font-mono text-slate-800">AED {estimatedInsurance.toLocaleString()}</span>
              </div>
              <div className="p-3.5 bg-slate-100 flex justify-between items-center font-semibold text-slate-950">
                <span>Estimated Total Out-of-Door Capital Required:</span>
                <span className="font-mono text-base text-amber-900">
                  AED {totalOnTheRoad.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Source: {vehicle.dealer_name} Authorized Data Channel
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close Dossier
            </button>
            <a
              href={vehicle.original_listing_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Visit Dealer Listing</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
