import React from 'react';
import { PriceAlert, Vehicle } from '../types';
import {
  X,
  Bell,
  Trash2,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Eye,
  ArrowRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  vehicles: Vehicle[];
  onDeleteAlert: (id: string) => Promise<void>;
  onDismissAlert: (id: string) => Promise<void>;
  onSimulatePriceDrop: (vehicleId: string, targetPriceAed: number) => Promise<void>;
  onSelectVehicle: (v: Vehicle) => void;
  onOpenInventory: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  vehicles,
  onDeleteAlert,
  onDismissAlert,
  onSimulatePriceDrop,
  onSelectVehicle,
  onOpenInventory,
}) => {
  if (!isOpen) return null;

  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered');
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const dismissedAlerts = alerts.filter((a) => a.status === 'dismissed');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Target Price Alerts
              </h3>
              <p className="text-xs text-slate-500">
                {alerts.length} total monitored ({triggeredAlerts.length} triggered)
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Section 1: Triggered Notifications */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Price Drop Alert Triggered ({triggeredAlerts.length})</span>
                </span>
              </div>

              <div className="space-y-3">
                {triggeredAlerts.map((alert) => {
                  const matchingVehicle = vehicles.find((v) => v.id === alert.vehicle_id);
                  const savings = alert.initial_price_aed - alert.current_price_aed;

                  return (
                    <div
                      key={alert.id}
                      className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-emerald-900 uppercase">
                            {alert.dealer_name}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {alert.vehicle_title}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Target Reached!
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-600">New Advertised Price:</span>
                          <span className="font-mono text-base font-bold text-emerald-700">
                            AED {alert.current_price_aed.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Your Target Threshold:</span>
                          <span className="font-mono">AED {alert.target_price_aed.toLocaleString()}</span>
                        </div>
                        {savings > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                            <span>Total Discount:</span>
                            <span className="font-mono">-AED {savings.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Triggered: {alert.triggered_at}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                          >
                            Dismiss
                          </button>
                          {matchingVehicle && (
                            <button
                              onClick={() => {
                                onSelectVehicle(matchingVehicle);
                                onClose();
                              }}
                              className="px-3 py-1 text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Car</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Active Watches */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Price Watches ({activeAlerts.length})
            </span>

            {activeAlerts.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-900">
                  No active price thresholds
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Click the bell icon on any vehicle card in the inventory to set your target price.
                </p>
                <button
                  onClick={() => {
                    onOpenInventory();
                    onClose();
                  }}
                  className="mt-2 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Browse Vehicles
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => {
                  const matchingVehicle = vehicles.find((v) => v.id === alert.vehicle_id);
                  const currentP = matchingVehicle?.price_aed || alert.current_price_aed;
                  const deltaToTarget = currentP - alert.target_price_aed;

                  return (
                    <div
                      key={alert.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {alert.dealer_name}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {alert.vehicle_title}
                          </h4>
                        </div>
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete price watch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Current Asking:</span>
                          <span className="font-mono font-bold text-slate-900">
                            AED {currentP.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Target Threshold:</span>
                          <span className="font-mono font-bold text-amber-700">
                            AED {alert.target_price_aed.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">
                          Waiting for: <strong className="font-mono text-slate-800">AED {deltaToTarget.toLocaleString()} drop</strong>
                        </span>

                        {/* Interactive Simulate Button for Testing */}
                        <button
                          onClick={() => onSimulatePriceDrop(alert.vehicle_id, alert.target_price_aed)}
                          className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline text-[11px]"
                          title="Simulate dealer price drop to trigger alert"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Simulate Drop (Test)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Alerts sync across all 5 dealer feeds
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
