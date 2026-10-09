import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  Shuffle,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Badge from '../components/Badge';
import { BECH_SMART_RECOMMENDATIONS } from '../data/mockData';

export default function BechSmart() {
  const [activeStrategy, setActiveStrategy] = useState('wait_3_days');
  const data = BECH_SMART_RECOMMENDATIONS;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">BechSmart Advisory</h1>
            <Badge variant="amber" size="xs">
              Recommendation Engine Pending
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Actionable decisions: Sell Today, Hold for Price Surge, or Divert to Alternative Mandi.
          </p>
        </div>
      </div>

      <DisclaimerBanner
        title="BechSmart Recommendation Engine Notice"
        description="The decision cards and rationale below show the planned multi-factor advisor. Recommendations will eventually be synthesized from live APMC price velocity, arrivals, and local weather."
      />

      {/* Top Banner with Highlighted Decision */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              Optimal Recommendation for {data.currentCrop}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {data.actionTitle}
            </h2>
            <p className="text-emerald-100/90 text-sm max-w-xl">
              Arrivals are decelerating across Western MP while miller demand remains aggressive. Holding produce for 72 hours yields an estimated surplus of +₹80/quintal.
            </p>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center min-w-[200px] shrink-0">
            <div className="text-xs text-emerald-300 font-medium">Model Confidence</div>
            <div className="text-3xl font-black text-white my-1">{data.confidenceScore}%</div>
            <div className="text-[11px] text-emerald-300 font-semibold">{data.badgeText}</div>
          </div>
        </div>
      </div>

      {/* 3 Core Strategy Cards: Sell Now, Wait, Switch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.options.map((opt) => {
          const isSelected = activeStrategy === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setActiveStrategy(opt.id)}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                opt.isPrimary
                  ? 'bg-emerald-50/50 border-emerald-500 shadow-sm'
                  : isSelected
                  ? 'bg-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      opt.isPrimary
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {opt.action}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{opt.riskLevel}</span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-slate-500">Target Market</div>
                  <div className="text-base font-bold text-slate-900">{opt.mandi}</div>
                </div>

                <div className="mb-4 pb-4 border-b border-slate-100">
                  <div className="text-xs text-slate-500">Estimated Net Return</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    ₹{opt.expectedNetPerQtl}
                    <span className="text-xs font-normal text-slate-500"> / qtl</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div>
                    <span className="font-semibold text-emerald-700">Advantage: </span>
                    <span className="text-slate-600">{opt.pros}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-700">Tradeoff: </span>
                    <span className="text-slate-600">{opt.cons}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className={opt.isPrimary ? 'text-emerald-700' : 'text-slate-600'}>
                  {opt.timing}
                </span>
                {opt.isPrimary && (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Recommended
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rationale & Market Factors Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            Market Signals Driving This Recommendation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.aiAnalysisRationale.map((rationale, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-emerald-800 block mb-1">Signal #{idx + 1}</span>
              {rationale}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

