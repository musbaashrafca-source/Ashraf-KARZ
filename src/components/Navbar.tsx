import React from 'react';
import { Layers, GitCompare, BarChart3, ShieldCheck, Database, Plus, Bell, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'inventory' | 'compare' | 'market' | 'transparency' | 'admin';
  setActiveTab: (tab: 'inventory' | 'compare' | 'market' | 'transparency' | 'admin') => void;
  compareCount: number;
  alertsCount: number;
  triggeredAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenImport: () => void;
  onSyncLive?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  compareCount,
  alertsCount,
  triggeredAlertsCount,
  onOpenAlerts,
  onOpenImport,
  onSyncLive,
  isSyncing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('inventory')}
          className="text-left group flex items-baseline gap-2 whitespace-nowrap shrink-0"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
            KARZ<span className="text-amber-600">4U</span>
          </span>
          <span className="hidden sm:inline text-xs font-medium text-slate-400">
            UAE Preowned Intelligence
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              activeTab === 'inventory'
                ? 'border-amber-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Consolidated Inventory
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'border-amber-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Vehicle Comparison</span>
            {compareCount > 0 && (
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                {compareCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              activeTab === 'market'
                ? 'border-amber-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Market Intelligence
          </button>

          <button
            onClick={() => setActiveTab('transparency')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              activeTab === 'transparency'
                ? 'border-amber-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Buyer & RTA Guide
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              activeTab === 'admin'
                ? 'border-amber-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Dealer Admin & Python CLI
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onSyncLive && (
            <button
              onClick={onSyncLive}
              disabled={isSyncing}
              className="p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh and Synchronize Live Dealer Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync Feeds'}</span>
            </button>
          )}

          <button
            onClick={onOpenAlerts}
            className={`relative p-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border ${
              triggeredAlertsCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : alertsCount > 0
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Manage Target Price Alerts"
          >
            <Bell className={`w-4 h-4 ${triggeredAlertsCount > 0 ? 'text-emerald-700' : 'text-amber-600'}`} />
            <span className="hidden sm:inline">Price Alerts</span>
            {triggeredAlertsCount > 0 ? (
              <span className="font-mono text-[11px] font-bold text-white bg-emerald-700 px-1.5 py-0.2 rounded-full">
                {triggeredAlertsCount}
              </span>
            ) : alertsCount > 0 ? (
              <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full">
                {alertsCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Import / Add Feed</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-4 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'inventory' ? 'text-amber-600 font-bold' : ''}`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${activeTab === 'compare' ? 'text-amber-600 font-bold' : ''}`}
        >
          <span>Compare ({compareCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'market' ? 'text-amber-600 font-bold' : ''}`}
        >
          Market Trends
        </button>
        <button
          onClick={() => setActiveTab('transparency')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'transparency' ? 'text-amber-600 font-bold' : ''}`}
        >
          RTA Guide
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'admin' ? 'text-amber-600 font-bold' : ''}`}
        >
          Admin & CLI
        </button>
      </div>
    </header>
  );
};
