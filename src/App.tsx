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
import { Vehicle, Dealer, MarketOverview, CrossDealerBenchmark } from './types';

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

  // Fetch initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vRes, dRes, mRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/dealers'),
        fetch('/api/market-overview'),
      ]);

      const vData = await vRes.json();
      const dData = await dRes.json();
      const mData = await mRes.json();

      if (vData.success) setVehicles(vData.vehicles);
      if (dData.success) setDealers(dData.dealers);
      if (mData.success) setMarketOverview(mData.data);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Demonstration Data Disclaimer Banner */}
      <DemoBanner
        onOpenPythonDocs={() => setShowPythonDocsModal(true)}
        lastUpdated="10 Oct 2026 10:18 GST"
      />

      {/* 2. Strict 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareCount={compareList.length}
        onOpenImport={() => setActiveTab('admin')}
      />

      {/* 3. Main Viewport Content */}
      <main className="flex-1">
        {isLoading && vehicles.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">
              Aggregating listings across 5 UAE dealerships...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' && (
              <InventoryView
                vehicles={vehicles}
                onSelectVehicle={handleSelectVehicle}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenPythonDocs={() => setShowPythonDocsModal(true)}
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
          onClose={() => setSelectedVehicleForModal(null)}
          onToggleCompare={handleToggleCompare}
          isInCompare={compareList.some((v) => v.id === selectedVehicleForModal.id)}
        />
      )}

      {/* 5. Python Architecture Documentation Modal */}
      {showPythonDocsModal && (
        <PythonDocsModal onClose={() => setShowPythonDocsModal(false)} />
      )}

      {/* 6. Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">AUTOHUB.AE</span> — UAE Preowned Car Aggregator & Market Intelligence
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ingesting Al-Futtaim Automall, CARS24, Kavak, CarSwitch, & The Elite Cars.
            </p>
          </div>

          <div className="flex items-center gap-6">
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
