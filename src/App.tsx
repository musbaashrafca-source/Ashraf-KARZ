/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { InventoryView } from './components/InventoryView';
import { ComparisonView } from './components/ComparisonView';
import { MarketIntelligenceView } from './components/MarketIntelligenceView';
import { TransparencyAndRTAChecklist } from './components/TransparencyAndRTAChecklist';
import { DealerAdminView } from './components/DealerAdminView';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { PythonDocsModal } from './components/PythonDocsModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { Vehicle, Dealer, MarketOverview, CrossDealerBenchmark, PriceAlert } from './types';
import { Bell, CheckCircle2, TrendingDown, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'compare' | 'market' | 'transparency' | 'admin'>('inventory');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [benchmarkForModal, setBenchmarkForModal] = useState<CrossDealerBenchmark | null>(null);
  const [showPythonDocsModal, setShowPythonDocsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState('18 Oct 2026 16:30 GST');

  // Price Alerts & Notifications state
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [targetPriceVehicle, setTargetPriceVehicle] = useState<Vehicle | null>(null);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{
    title: string;
    message: string;
    vehicleId?: string;
  } | null>(null);

  // Fetch alerts
  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  // Fetch initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vRes, dRes, mRes, aRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/dealers'),
        fetch('/api/market-overview'),
        fetch('/api/alerts'),
      ]);

      const vData = await vRes.json();
      const dData = await dRes.json();
      const mData = await mRes.json();
      const aData = await aRes.json();

      if (vData.success) setVehicles(vData.vehicles);
      if (dData.success) {
        setDealers(dData.dealers);
        if (dData.dealers[0]?.last_updated) {
          setLastSyncTimestamp(dData.dealers[0].last_updated);
        }
      }
      if (mData.success) setMarketOverview(mData.data);
      if (aData.success) {
        setAlerts(aData.alerts);
        const triggered = aData.alerts.filter((a: PriceAlert) => a.status === 'triggered');
        if (triggered.length > 0) {
          const first = triggered[0];
          setNotificationToast({
            title: 'Price Drop Alert Triggered!',
            message: `${first.vehicle_title} dropped to AED ${first.current_price_aed.toLocaleString()} (Threshold: AED ${first.target_price_aed.toLocaleString()})`,
            vehicleId: first.vehicle_id,
          });
        }
      }

      // Pre-seed compareList with first 2 vehicles if empty so user immediately sees comparison
      if (vData.vehicles?.length >= 2 && compareList.length === 0) {
        setCompareList([vData.vehicles[0], vData.vehicles[1]]);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize Live Dealer Feeds across all 5 dealerships
  const handleSyncLiveInventory = async () => {
    try {
      setIsSyncingLive(true);
      const res = await fetch('/api/sync-live-inventory', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.last_updated) {
          setLastSyncTimestamp(data.last_updated);
        }
        await Promise.all([loadData(), loadAlerts()]);
        setNotificationToast({
          title: 'Live Dealer Feeds Synchronized!',
          message: `Successfully synchronized ${data.total_vehicles || 42} live listings across Al-Futtaim Automall, CARS24, Kavak, CarSwitch, & The Elite Cars.`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Failed to sync live feeds:', err);
    } finally {
      setIsSyncingLive(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle vehicle dossier open
  const handleSelectVehicle = async (vehicle: Vehicle) => {
    setSelectedVehicleForModal(vehicle);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`);
      const data = await res.json();
      if (data.success && data.benchmark) {
        setBenchmarkForModal(data.benchmark);
      } else {
        setBenchmarkForModal(null);
      }
    } catch (e) {
      setBenchmarkForModal(null);
    }
  };

  // Toggle vehicle in compare queue
  const handleToggleCompare = (vehicle: Vehicle) => {
    setCompareList((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) {
        return prev.filter((v) => v.id !== vehicle.id);
      } else {
        if (prev.length >= 5) return prev; // Limit to 5
        return [...prev, vehicle];
      }
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((v) => v.id !== id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Price Drop Alert Actions
  const handleSaveAlert = async (vehicleId: string, targetPriceAed: number, userEmail?: string) => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, targetPriceAed, userEmail }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    await loadAlerts();
    if (data.alert?.status === 'triggered') {
      setNotificationToast({
        title: 'Target Price Reached Immediately!',
        message: `${data.alert.vehicle_title} is currently AED ${data.alert.current_price_aed.toLocaleString()}, below your target of AED ${targetPriceAed.toLocaleString()}!`,
        vehicleId: data.alert.vehicle_id,
      });
    }
  };

  const handleDeleteAlert = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    await loadAlerts();
  };

  const handleDismissAlert = async (id: string) => {
    await fetch(`/api/alerts/${id}/dismiss`, { method: 'POST' });
    await loadAlerts();
  };

  const handleSimulatePriceDrop = async (vehicleId: string, targetPriceAed: number) => {
    const res = await fetch('/api/alerts/simulate-drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, targetPrice: targetPriceAed }),
    });
    const data = await res.json();
    if (data.success) {
      await Promise.all([loadAlerts(), loadData()]);
      setNotificationToast({
        title: 'Price Reduction Simulated & Alert Triggered!',
        message: `${data.vehicle.make} ${data.vehicle.model} dropped from AED ${data.previousPrice.toLocaleString()} to AED ${data.newPrice.toLocaleString()}!`,
        vehicleId: vehicleId,
      });
    }
  };

  const triggeredCount = alerts.filter((a) => a.status === 'triggered').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Live Feed & Aggregator Status Banner */}
      <DemoBanner
        onOpenPythonDocs={() => setShowPythonDocsModal(true)}
        lastUpdated={lastSyncTimestamp}
        onSyncLive={handleSyncLiveInventory}
        isSyncing={isSyncingLive}
      />

      {/* 2. Strict 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareCount={compareList.length}
        alertsCount={alerts.length}
        triggeredAlertsCount={triggeredCount}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        onOpenImport={() => setActiveTab('admin')}
        onSyncLive={handleSyncLiveInventory}
        isSyncing={isSyncingLive}
      />

      {/* Real-time Notification Toast when price alert triggers */}
      {notificationToast && (
        <div className="bg-emerald-900 text-white px-4 py-3 border-b border-emerald-800 shadow-lg animate-in slide-in-from-top duration-250 flex items-center justify-between gap-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="p-1 bg-emerald-800 rounded-full text-emerald-300">
                <TrendingDown className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-xs block text-emerald-200">
                  {notificationToast.title}
                </span>
                <span className="text-xs text-white">
                  {notificationToast.message}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAlertsDrawerOpen(true)}
                className="px-3 py-1 bg-white text-emerald-950 font-bold text-xs rounded hover:bg-emerald-50 transition-colors"
              >
                View Price Watch
              </button>
              <button
                onClick={() => setNotificationToast(null)}
                className="p-1 text-emerald-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Viewport Content */}
      <main className="flex-1">
        {isLoading && vehicles.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">
              Aggregating live listings across 5 UAE dealerships...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' && (
              <InventoryView
                vehicles={vehicles}
                alerts={alerts}
                onSelectVehicle={handleSelectVehicle}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenPythonDocs={() => setShowPythonDocsModal(true)}
                onOpenSetAlert={(v) => setTargetPriceVehicle(v)}
                onSyncLive={handleSyncLiveInventory}
                isSyncing={isSyncingLive}
                lastSyncTimestamp={lastSyncTimestamp}
              />
            )}

            {activeTab === 'compare' && (
              <ComparisonView
                compareList={compareList}
                onRemoveFromCompare={handleRemoveFromCompare}
                onClearCompare={handleClearCompare}
                onSelectVehicle={handleSelectVehicle}
                onGoToInventory={() => setActiveTab('inventory')}
                allVehicles={vehicles}
              />
            )}

            {activeTab === 'market' && (
              <MarketIntelligenceView
                overview={marketOverview}
                vehicles={vehicles}
                onSelectVehicle={handleSelectVehicle}
              />
            )}

            {activeTab === 'transparency' && <TransparencyAndRTAChecklist />}

            {activeTab === 'admin' && (
              <DealerAdminView
                dealers={dealers}
                vehicles={vehicles}
                onRefreshData={loadData}
                onOpenPythonDocs={() => setShowPythonDocsModal(true)}
                onSyncLive={handleSyncLiveInventory}
                isSyncing={isSyncingLive}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Vehicle Dossier Modal */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          benchmark={benchmarkForModal}
          alert={alerts.find((a) => a.vehicle_id === selectedVehicleForModal.id && a.status !== 'dismissed')}
          onClose={() => setSelectedVehicleForModal(null)}
          onToggleCompare={handleToggleCompare}
          isInCompare={compareList.some((v) => v.id === selectedVehicleForModal.id)}
          onOpenSetAlert={(v) => setTargetPriceVehicle(v)}
        />
      )}

      {/* 5. Target Price Alert Modal */}
      {targetPriceVehicle && (
        <PriceAlertModal
          vehicle={targetPriceVehicle}
          existingAlert={alerts.find((a) => a.vehicle_id === targetPriceVehicle.id && a.status !== 'dismissed')}
          onClose={() => setTargetPriceVehicle(null)}
          onSaveAlert={handleSaveAlert}
          onSimulatePriceDrop={handleSimulatePriceDrop}
        />
      )}

      {/* 6. Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        vehicles={vehicles}
        onDeleteAlert={handleDeleteAlert}
        onDismissAlert={handleDismissAlert}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onSelectVehicle={handleSelectVehicle}
        onOpenInventory={() => setActiveTab('inventory')}
      />

      {/* 7. Python Architecture Documentation Modal */}
      {showPythonDocsModal && (
        <PythonDocsModal onClose={() => setShowPythonDocsModal(false)} />
      )}

      {/* 8. Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">KARZ4U</span> — UAE Preowned Car Aggregator & Market Intelligence
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ingesting Al-Futtaim Automall, CARS24, Kavak, CarSwitch, & The Elite Cars.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsAlertsDrawerOpen(true)}
              className="hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Price Watches ({alerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('transparency')}
              className="hover:text-slate-900"
            >
              RTA Buyer Checklist
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className="hover:text-slate-900"
            >
              Market Analytics
            </button>
            <button
              onClick={() => setShowPythonDocsModal(true)}
              className="hover:text-slate-900 font-semibold"
            >
              Python CLI Docs
            </button>
            <a
              href="/api/export/csv"
              className="hover:text-slate-900"
            >
              Export CSV
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
