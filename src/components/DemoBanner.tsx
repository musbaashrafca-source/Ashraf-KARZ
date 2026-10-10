import React from 'react';
import { ShieldAlert, Terminal, Sparkles, ExternalLink } from 'lucide-react';

interface DemoBannerProps {
  onOpenPythonDocs: () => void;
  lastUpdated?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenPythonDocs, lastUpdated = '10 Oct 2026 10:18 GST' }) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-950">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            Demonstration Mode Active:
          </span>
          <span className="text-amber-800">
            Listing records calibrated to representative UAE inventory from <strong>Al-Futtaim Automall, CARS24, Kavak, CarSwitch, & The Elite Cars</strong>.
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-amber-900 shrink-0 self-end sm:self-auto">
          <span className="text-amber-700 font-mono text-[11px]">
            Feed Sync: {lastUpdated}
          </span>
          <button
            onClick={onOpenPythonDocs}
            className="font-semibold hover:underline flex items-center gap-1 text-amber-900"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-700" />
            <span>Connect Live APIs & Python CLI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
