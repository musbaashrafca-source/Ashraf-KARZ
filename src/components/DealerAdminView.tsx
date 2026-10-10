import React, { useState } from 'react';
import { Dealer, Vehicle } from '../types';
import {
  Building2,
  Upload,
  Download,
  Terminal,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Play,
  FileSpreadsheet,
  Database,
  ExternalLink,
  ShieldCheck,
  Plus,
  Sliders,
  Copy
} from 'lucide-react';

interface DealerAdminViewProps {
  dealers: Dealer[];
  vehicles: Vehicle[];
  onRefreshData: () => void;
  onOpenPythonDocs: () => void;
}

export const DealerAdminView: React.FC<DealerAdminViewProps> = ({
  dealers,
  vehicles,
  onRefreshData,
  onOpenPythonDocs,
}) => {
  // CSV Import State
  const [selectedDealerForImport, setSelectedDealerForImport] = useState(dealers[0]?.id || 'alfuttaim');
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Python CLI Terminal runner state
  const [cliAction, setCliAction] = useState('summary');
  const [cliMake, setCliMake] = useState('');
  const [cliTerminalOutput, setCliTerminalOutput] = useState<string>('');
  const [isRunningCli, setIsRunningCli] = useState(false);

  // New Dealer modal / state
  const [showAddDealer, setShowAddDealer] = useState(false);
  const [newDealerName, setNewDealerName] = useState('');
  const [newDealerWebsite, setNewDealerWebsite] = useState('');
  const [newDealerLocation, setNewDealerLocation] = useState('');
  const [newDealerSource, setNewDealerSource] = useState('REST API');
  const [newDealerFeedUrl, setNewDealerFeedUrl] = useState('');

  // Sample CSV template generator
  const sampleCsv = `vin,make,model,variant,year,price_aed,original_price_aed,mileage_km,fuel_type,engine_capacity_cc,transmission,body_type,specification,warranty_available,warranty_duration_months,warranty_provider,warranty_coverage,service_history_disclosed,service_history_type,accident_history_disclosed,accident_status,inspection_report_available,inspection_points,inspection_summary,exterior_color,interior_color,dealer_location,dealer_phone
WBA33AY08PFP10293,BMW,330i,M Sport 2.0L Turbo,2023,195000,205000,28000,Petrol,2000,Automatic,Sedan,GCC,true,24,AGMC Official Agency Warranty,Comprehensive Bumper to Bumper,true,Full Agency Service History,true,Clean Record Disclosed,true,150,Clean mechanical and chassis inspection,Alpine White,Cognac Leather,Dubai SZR,+971 4 000 0000`;

  const handleImportCsv = async () => {
    if (!csvInput.trim()) {
      setImportStatus('Please paste CSV content before submitting.');
      return;
    }
    setIsImporting(true);
    setImportStatus(null);

    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: selectedDealerForImport,
          csvContent: csvInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus(
          `Success: Parsed ${data.result?.total_parsed || 1} records (${data.result?.added_count || 1} added, ${data.result?.updated_count || 0} updated).`
        );
        setCsvInput('');
        onRefreshData();
      } else {
        setImportStatus(`Import Error: ${data.error || 'Failed to process CSV'}`);
      }
    } catch (err: any) {
      setImportStatus(`Network Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRunPythonCli = async () => {
    setIsRunningCli(true);
    setCliTerminalOutput('Executing python3 python_engine/cli.py in background container...');

    try {
      const res = await fetch('/api/run-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: cliAction,
          make: cliMake || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCliTerminalOutput(`$ ${data.command}\n\n${data.output}`);
      } else {
        setCliTerminalOutput(`[Execution Failed]\n${data.output || data.error}`);
      }
    } catch (err: any) {
      setCliTerminalOutput(`[Network Error] ${err.message}`);
    } finally {
      setIsRunningCli(false);
    }
  };

  const handleAddDealerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDealerName,
          website: newDealerWebsite,
          inventory_source: newDealerSource,
          source_url: newDealerFeedUrl,
          location: newDealerLocation,
          contact_phone: '+971 4 000 0000',
          contact_email: 'info@dealer.ae',
          inspection_standard: 'Comprehensive Pre-Check',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddDealer(false);
        setNewDealerName('');
        setNewDealerWebsite('');
        setNewDealerLocation('');
        setNewDealerFeedUrl('');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dealer Administration & Ingestion Console
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Configure dealership data connectors, ingest CSV/Excel batch updates, audit information completeness, and trigger backend Python aggregation tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPythonDocs}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Python Architecture Docs</span>
          </button>

          <a
            href="/api/export/csv"
            download="uae_preowned_inventory.csv"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </a>

          <a
            href="/api/export/json"
            download="uae_preowned_inventory.json"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </a>
        </div>
      </div>

      {/* 1. Dealer Configuration Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <span>Configured UAE Dealership Profiles (Top 5 Active)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage inventory sync sources, showroom hubs, and inspection standards.
            </p>
          </div>

          <button
            onClick={() => setShowAddDealer(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Dealer</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="p-3.5 pl-5">Dealer Name</th>
                <th className="p-3.5">Inventory Channel</th>
                <th className="p-3.5">Showroom Hubs</th>
                <th className="p-3.5">Inspection Standard</th>
                <th className="p-3.5">Last Sync</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealers.map((dealer) => (
                <tr key={dealer.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-slate-900 block">{dealer.name}</span>
                    <a
                      href={dealer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-amber-700 font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>{dealer.website.replace('https://www.', '')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {dealer.inventory_source}
                  </td>
                  <td className="p-3.5 text-slate-600">{dealer.location}</td>
                  <td className="p-3.5 font-semibold text-slate-800">
                    {dealer.inspection_standard}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                    {dealer.last_updated}
                  </td>
                  <td className="p-3.5 pr-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        dealer.is_active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Active Feed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive Python CLI Runner Console */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <span>Native Python Aggregator CLI Console</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute live command-line tasks directly on the server container using <code className="text-amber-300">python3 python_engine/cli.py</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={cliAction}
              onChange={(e) => setCliAction(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg focus:outline-hidden"
            >
              <option value="summary">--action summary</option>
              <option value="list">--action list</option>
              <option value="audit">--action audit</option>
              <option value="sync">--action sync</option>
            </select>

            {cliAction === 'list' && (
              <input
                type="text"
                placeholder="Make (e.g. Toyota)"
                value={cliMake}
                onChange={(e) => setCliMake(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs"
              />
            )}

            <button
              onClick={handleRunPythonCli}
              disabled={isRunningCli}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningCli ? 'Running...' : 'Execute CLI'}</span>
            </button>
          </div>
        </div>

        {/* Terminal Window Box */}
        <div className="font-mono text-xs bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-slate-300 overflow-x-auto min-h-[140px] whitespace-pre leading-relaxed">
          {cliTerminalOutput ||
            `$ python3 python_engine/cli.py --action summary\n\nClick "Execute CLI" above to run the Python engine script in real time.`}
        </div>
      </div>

      {/* 3. CSV / Excel Batch Importer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              <span>Batch CSV / Excel Inventory Ingestion</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Import dealer spreadsheets or manual batch inventory feeds directly into the consolidated database.
            </p>
          </div>

          <button
            onClick={() => setCsvInput(sampleCsv)}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Load Sample CSV Row</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">
              Target Dealership Feed:
            </label>
            <select
              value={selectedDealerForImport}
              onChange={(e) => setSelectedDealerForImport(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-slate-600">
              <span className="font-semibold text-slate-900 block">Required CSV Headers:</span>
              <p className="font-mono text-[10px] text-slate-500 leading-tight">
                vin, make, model, variant, year, price_aed, mileage_km, specification, warranty_available, service_history_type, accident_status, inspection_points
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Paste raw CSV contents with header row..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-between">
              {importStatus && (
                <span
                  className={`text-xs font-medium ${
                    importStatus.startsWith('Success') ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {importStatus}
                </span>
              )}
              <button
                onClick={handleImportCsv}
                disabled={isImporting}
                className="ml-auto px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{isImporting ? 'Ingesting...' : 'Ingest & Validate Feed'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dealer Modal */}
      {showAddDealer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add New UAE Preowned Dealer Profile
            </h3>
            <form onSubmit={handleAddDealerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Dealer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Park Lane Motors"
                  value={newDealerName}
                  onChange={(e) => setNewDealerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Website URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.example.ae"
                  value={newDealerWebsite}
                  onChange={(e) => setNewDealerWebsite(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Showroom Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Quoz 1, Dubai"
                  value={newDealerLocation}
                  onChange={(e) => setNewDealerLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Data Source Type</label>
                <select
                  value={newDealerSource}
                  onChange={(e) => setNewDealerSource(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Authorized REST API">Authorized REST API</option>
                  <option value="SFTP Batch Feed">SFTP Batch Feed</option>
                  <option value="Manual CSV/Excel Upload">Manual CSV/Excel Upload</option>
                  <option value="Webhook Push">Webhook Push</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDealer(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
