import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeAlert,
  Car,
  KeyRound,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Building
} from 'lucide-react';

export const TransparencyAndRTAChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    {
      id: 'step-1-rta-test',
      title: '1. Mandatory RTA Technical Inspection (Passing Certificate)',
      desc: 'Never purchase without an active RTA Passing Test certificate conducted at an authorized testing centre (Tasjeel, Shamil, Wasel, or Al Mumayaz). The test verifies roadworthiness, structural frame integrity, brake balance, and emissions.',
      cost: 'Cost: AED 170 | Validity: 30 days',
      critical: true,
    },
    {
      id: 'step-2-evg-chassis',
      title: '2. Emirates Vehicle Gate (EVG) / MOI Accident History Check',
      desc: 'Check the vehicle chassis/VIN number on the EVG portal (evg.ae) or Ministry of Interior (MOI) app. This government database logs police-reported accidents across all 7 emirates, including structural damage classification.',
      cost: 'Cost: Free / Nominal government inquiry fee',
      critical: true,
    },
    {
      id: 'step-3-gcc-spec',
      title: '3. Genuine GCC Specification Verification',
      desc: 'Inspect the door jamb compliance sticker and radiator build. Vehicles built for the GCC market feature upgraded heavy-duty radiators, Gulf-rated air conditioning compressors, dust filtration, and metric instrumentation. Non-GCC imports (e.g. USA, Canada) often carry salvage history and suffer 20%+ resale value penalties.',
      cost: 'Cost: Free (Inspect VIN & Agency verification)',
      critical: true,
    },
    {
      id: 'step-4-bank-mortgage',
      title: '4. Bank Mortgage & Outstanding Finance Release',
      desc: 'Ensure the car has no active bank mortgage (RTA system will block transfer if mortgaged). If financed by the prior owner, require an electronic No Objection Certificate (NOC) and loan clearance confirmation from the bank in the RTA system.',
      cost: 'Cost: Free (Verified instantly at RTA counter)',
      critical: true,
    },
    {
      id: 'step-5-warranty-transfer',
      title: '5. Warranty Transferability & Agency Validity',
      desc: 'Confirm whether the remaining warranty is an Official Agency Manufacturer Warranty (e.g. Al-Futtaim Toyota/Lexus, Gargash Mercedes, Al Tayer Land Rover) or a dealer in-house/third-party policy. Agency warranties require transfer notification and continuous proof of periodic servicing.',
      cost: 'Cost: AED 0 - 500 depending on agency',
      critical: false,
    },
    {
      id: 'step-6-tyre-heat',
      title: '6. UAE Summer Tyre Age & Heat Rating Safety Check',
      desc: 'UAE traffic laws prohibit tires older than 5 years (many insurance companies reject claims if tires exceed 3-4 years). Inspect the 4-digit DOT date stamp on the tire sidewall. In UAE summer temperatures exceeding 48°C, tires must have Temperature Rating A.',
      cost: 'Cost: Free visual inspection',
      critical: true,
    },
    {
      id: 'step-7-fines-clearance',
      title: '7. Traffic Fines & Salik Toll Clearance',
      desc: 'The seller must pay all traffic fines across Dubai Police, Abu Dhabi Police, and federal traffic authorities, and ensure no pending black points exist before the RTA ownership transfer can execute.',
      cost: 'Seller obligation',
      critical: true,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          UAE Buyer Assistance & RTA Pre-Purchase Guide
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-3xl">
          Crucial verification standards and statutory requirements for acquiring a preowned vehicle in the United Arab Emirates. Designed to protect buyers from undisclosed accident damage, salvage imports, and transfer roadblocks.
        </p>
      </div>

      {/* Mandatory Red Flags Alert */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BadgeAlert className="w-5 h-5 text-rose-700 shrink-0" />
          <h3 className="text-sm font-bold text-rose-950">
            Critical Preowned Purchasing Rules in the UAE
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-rose-900">
          <div className="p-3 bg-white/70 rounded-lg border border-rose-100 space-y-1">
            <span className="font-bold block">1. Never Assume Clean History</span>
            <p>
              Absence of accident disclosures on a dealer listing does NOT mean clean history. Always run an EVG chassis check and request the RTA comprehensive inspection report.
            </p>
          </div>
          <div className="p-3 bg-white/70 rounded-lg border border-rose-100 space-y-1">
            <span className="font-bold block">2. Scrutinize Non-GCC Imports</span>
            <p>
              Many American-spec cars in local markets were imported as salvage vehicles from auctions (flood/collision). Always run a CarFax / AutoCheck using the 17-digit VIN before placing a deposit.
            </p>
          </div>
          <div className="p-3 bg-white/70 rounded-lg border border-rose-100 space-y-1">
            <span className="font-bold block">3. Advertised vs Transaction Price</span>
            <p>
              Advertised prices rarely include RTA passing fees (AED 170), ownership transfer (AED 420), plate fees, or dealer administrative documentation charges.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive UAE Pre-Purchase Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
              <span>Interactive Pre-Purchase Due Diligence Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off each item as you verify it with the dealership or inspector.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
            {Object.values(checkedItems).filter(Boolean).length} of {checklistItems.length} Verified
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {checklistItems.map((item) => {
            const isChecked = checkedItems[item.id] || false;
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-5 cursor-pointer transition-colors flex items-start gap-4 ${
                  isChecked ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">{item.cost}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RTA Transfer Process Flow & Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-slate-700" />
          <span>Official RTA Ownership Transfer Workflow (Step-by-Step)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-slate-900">Vehicle Testing</h4>
            <p className="text-slate-600">
              Drive vehicle to Tasjeel / Shamil. Pass technical roadworthiness test (AED 170). Valid for 30 days.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-slate-900">Insurance Issuance</h4>
            <p className="text-slate-600">
              Buyer arranges insurance policy in their name using vehicle chassis number. Uploaded directly to RTA system.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-slate-900">RTA Counter / App</h4>
            <p className="text-slate-600">
              Buyer & seller present original Emirates IDs. Clear pending fines. Execute ownership transfer contract (AED 420).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
              4
            </span>
            <h4 className="font-bold text-slate-900">Mulkiya & Plates</h4>
            <p className="text-slate-600">
              Buyer receives new electronic Mulkiya (Registration Card) and Dubai / Abu Dhabi number plates. Vehicle is officially yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
