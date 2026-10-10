import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Code2, Server } from 'lucide-react';

interface PythonDocsModalProps {
  onClose: () => void;
}

export const PythonDocsModal: React.FC<PythonDocsModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cliSnippet = `# 1. Display UAE aggregate market overview
python3 python_engine/cli.py --action summary

# 2. List vehicles filtered by make or dealer
python3 python_engine/cli.py --action list --make Toyota
python3 python_engine/cli.py --action list --dealer "Al-Futtaim Automall"

# 3. Compare 2 to 5 vehicles side-by-side
python3 python_engine/cli.py --action compare --ids AFA-LC300-01 C24-LC300-02 CSW-LC300-03

# 4. Run data disclosure & transparency audit
python3 python_engine/cli.py --action audit

# 5. Export consolidated dataset as JSON
python3 python_engine/cli.py --action export --format json > uae_inventory.json`;

  const cronSnippet = `# Crontab configuration for daily inventory ingestion (runs at 04:00 GST daily)
0 4 * * * cd /workspace && python3 python_engine/cli.py --action sync >> /var/log/uae_car_sync.log 2>&1`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Python Aggregator Architecture & Integration Setup Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Modular Python Architecture Overview
            </h3>
            <p>
              The application features a complete standalone Python package in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-900 font-mono">/python_engine</code> that operates both independently via command-line interface (CLI) and in tandem with the web application through Express API proxy routes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">python_engine/connectors.py</span>
                <span className="text-slate-500">
                  Dealer adapters for Al-Futtaim, CARS24, Kavak, CarSwitch, and The Elite Cars. Normalizes pricing, mileage, GCC spec, and inspection fields.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">python_engine/analytics.py</span>
                <span className="text-slate-500">
                  Calculates cross-dealer price positioning, trend velocity, and the multi-criteria Buyer Suitability Score.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">python_engine/aggregator.py</span>
                <span className="text-slate-500">
                  Handles inventory deduplication (cross-dealer VIN matching), historical price change logging, and data completeness audits.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-900 block">python_engine/cli.py</span>
                <span className="text-slate-500">
                  Command-line interface for running batch operations, exports, side-by-side terminal comparisons, and sync jobs.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: CLI Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. CLI Usage & Commands
              </h3>
              <button
                onClick={() => handleCopy(cliSnippet, 'cli')}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold"
              >
                {copiedSection === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'cli' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {cliSnippet}
            </pre>
          </div>

          {/* Section 3: Connecting Actual Dealer Feeds */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Connecting The Top 5 UAE Dealerships in Production
            </h3>
            <p>
              In production, each dealer provides an authorized feed channel. The connector interfaces in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">python_engine/connectors.py</code> are built to consume these feeds:
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                    <th className="p-2.5">Dealership</th>
                    <th className="p-2.5">Protocol</th>
                    <th className="p-2.5">Integration Pattern</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Al-Futtaim Automall</td>
                    <td className="p-2.5 font-mono">REST / SFTP</td>
                    <td className="p-2.5 text-slate-600">Enterprise inventory JSON with 99-point check metadata and Al-Futtaim agency warranty status.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">CARS24 UAE</td>
                    <td className="p-2.5 font-mono">Webhook / API</td>
                    <td className="p-2.5 text-slate-600">Direct sync from Jebel Ali Mega Refurbishment Lab feed with 150-point report URLs and 360° spin images.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Kavak UAE</td>
                    <td className="p-2.5 font-mono">Partner API</td>
                    <td className="p-2.5 text-slate-600">Catalog API endpoint with 240-point reconditioning checklist and Kavak Total guarantee.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">CarSwitch</td>
                    <td className="p-2.5 font-mono">Export Feed</td>
                    <td className="p-2.5 text-slate-600">Certified vehicles JSON feed with 5-star rating and tire/paint scratch report.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">The Elite Cars</td>
                    <td className="p-2.5 font-mono">SFTP / CSV</td>
                    <td className="p-2.5 text-slate-600">Bespoke luxury XML/CSV batch exports for high-line exotic vehicles (G-Wagon, Range Rover, Porsche, Bentley).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Cron automation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Automated Nightly Feed Synchronization (Cron)
              </h3>
              <button
                onClick={() => handleCopy(cronSnippet, 'cron')}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold"
              >
                {copiedSection === 'cron' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'cron' ? 'Copied' : 'Copy Cron'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {cronSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Engine verified on Python 3.10+ Linux runtime
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
