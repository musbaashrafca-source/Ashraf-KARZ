import React, { useState } from 'react';
import { Vehicle, PriceAlert } from '../types';
import { X, Bell, DollarSign, TrendingDown, Check, Sparkles, AlertCircle } from 'lucide-react';

interface PriceAlertModalProps {
  vehicle: Vehicle | null;
  existingAlert?: PriceAlert | null;
  onClose: () => void;
  onSaveAlert: (vehicleId: string, targetPriceAed: number, userEmail?: string) => Promise<void>;
  onSimulatePriceDrop: (vehicleId: string, targetPriceAed: number) => Promise<void>;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  vehicle,
  existingAlert,
  onClose,
  onSaveAlert,
  onSimulatePriceDrop,
}) => {
  if (!vehicle) return null;

  const currentPrice = vehicle.price_aed;

  // Presets
  const preset3Pct = Math.round(currentPrice * 0.97 / 1000) * 1000;
  const preset5Pct = Math.round(currentPrice * 0.95 / 1000) * 1000;
  const preset10Pct = Math.round(currentPrice * 0.90 / 1000) * 1000;

  const [targetPrice, setTargetPrice] = useState<number>(
    existingAlert ? existingAlert.target_price_aed : preset5Pct
  );
  const [userEmail, setUserEmail] = useState<string>(
    existingAlert?.user_email || 'ashrafmusba@gmail.com'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const discountAmount = currentPrice - targetPrice;
  const discountPct = Math.round((discountAmount / currentPrice) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0 || targetPrice >= currentPrice) {
      setFeedback('Target price must be lower than the current advertised price.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSaveAlert(vehicle.id, targetPrice, userEmail);
      setFeedback('Target price alert active! Monitoring dealer inventory.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await onSimulatePriceDrop(vehicle.id, targetPrice);
      setFeedback('Price drop simulated! Threshold reached and notification triggered.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Set Target Price Alert
              </h3>
              <p className="text-xs text-slate-500">
                Receive instant alert when dealer discounts this vehicle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Target Vehicle Brief */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              {vehicle.dealer_name} · {vehicle.dealer_location}
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h4>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-600">Current Advertised Asking Price:</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                AED {currentPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Quick Target Discounts:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetPrice(preset3Pct)}
                className={`py-2 px-3 rounded-lg border text-left transition-colors ${
                  targetPrice === preset3Pct
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-[10px] text-slate-500">-3% Drop</span>
                <span className="font-mono font-semibold">AED {preset3Pct.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetPrice(preset5Pct)}
                className={`py-2 px-3 rounded-lg border text-left transition-colors ${
                  targetPrice === preset5Pct
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-[10px] text-slate-500">-5% Drop</span>
                <span className="font-mono font-semibold">AED {preset5Pct.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetPrice(preset10Pct)}
                className={`py-2 px-3 rounded-lg border text-left transition-colors ${
                  targetPrice === preset10Pct
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-[10px] text-slate-500">-10% Drop</span>
                <span className="font-mono font-semibold">AED {preset10Pct.toLocaleString()}</span>
              </button>
            </div>
          </div>

          {/* Custom Target Price Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Your Target Price (AED):
              </label>
              {discountAmount > 0 && (
                <span className="font-mono font-semibold text-emerald-700">
                  Save AED {discountAmount.toLocaleString()} ({discountPct}% drop)
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-mono">
                AED
              </span>
              <input
                type="number"
                min="1000"
                max={currentPrice - 100}
                step="1000"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-13 pr-4 py-2.5 font-mono text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* User Email */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Notification Channel (In-App & Email):
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                feedback.includes('Error')
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-between">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
              title="Instantly simulates dealer dropping the price to your target threshold for live testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{isSimulating ? 'Simulating...' : 'Test & Trigger Alert (Simulate Drop)'}</span>
            </button>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSubmitting ? 'Saving...' : 'Set Price Watch'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
