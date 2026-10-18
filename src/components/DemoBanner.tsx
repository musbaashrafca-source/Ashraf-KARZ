import React from 'react';
import { RefreshCw, Terminal, CheckCircle2, Radio } from 'lucide-react';

interface DemoBannerProps {
  onOpenPythonDocs: () => void;
  lastUpdated?: string;
  onSyncLive?: () => void;
  isSyncing?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  onOpenPythonDocs,
  lastUpdated = '18 Oct 2026 16:30 GST',
  onSyncLive,
  isSyncing = false,
}) => {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] border border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE AGGREGATOR
          </span>
          <span className="text-slate-300">
            Connected to 5 UAE Dealer Feeds: <strong className="text-white">Al-Futtaim Automall</strong>, <strong className="text-white">CARS24</strong>, <strong className="text-white">Kavak</strong>, <strong className="text-white">CarSwitch</strong>, & <strong className="text-white">The Elite Cars</strong>.
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300 shrink-0 self-end sm:self-auto">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 shrink-0" />
            Feed Sync: <span className="text-emerald-400 font-semibold">{lastUpdated}</span>
          </span>

          {onSyncLive && (
            <button
              onClick={onSyncLive}
              disabled={isSyncing}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Live Now'}</span>
            </button>
          )}

          <button
            onClick={onOpenPythonDocs}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span>API & CLI Docs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
