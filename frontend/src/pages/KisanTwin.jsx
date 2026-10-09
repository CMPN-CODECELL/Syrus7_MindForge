import React, { useState } from 'react';
import {
  UserCheck,
  MapPin,
  Warehouse,
  Truck,
  Clock,
  Sparkles,
  Save,
  CheckCircle,
  Shield,
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Badge from '../components/Badge';
import { CROPS } from '../data/mockData';

export default function KisanTwin() {
  const [profile, setProfile] = useState({
    farmerName: 'Ramesh Patel',
    village: 'Sanwer, Indore District',
    state: 'Madhya Pradesh',
    crop: 'wheat',
    quantity: 65,
    storageType: 'farm_shed', // farm_shed, pucca_warehouse, none
    transportAccess: 'hired_trolley', // own_tractor, hired_trolley, middleman_pickup
    sellingUrgency: 'moderate', // immediate, moderate, flexible
    holdingCapacityDays: 14,
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const currentCropObj = CROPS.find((c) => c.id === profile.crop) || CROPS[0];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">KisanTwin Profile</h1>
            <Badge variant="emerald" size="xs">
              Farmer Digital Twin
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Tailor AI recommendations to your storage constraints, vehicle access, and cash-flow urgency.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Twin state updated locally!
          </div>
        )}
      </div>

      <DisclaimerBanner
        title="Local State Notice"
        description="Your farmer profile is maintained securely in your browser's local React state during this prototype phase. Backend persistence with PostgreSQL will be enabled in future stages."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Configuration Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Configure Farmer Constraints</span>
            <span className="text-xs font-normal text-slate-500">Parameters customize advice</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Farmer Name
                </label>
                <input
                  type="text"
                  value={profile.farmerName}
                  onChange={(e) => setProfile({ ...profile, farmerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Village & District
                </label>
                <input
                  type="text"
                  value={profile.village}
                  onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Current Harvest Crop
                </label>
                <select
                  value={profile.crop}
                  onChange={(e) => setProfile({ ...profile, crop: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                >
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lot Size (Quintals)
                </label>
                <input
                  type="number"
                  min="1"
                  value={profile.quantity}
                  onChange={(e) => setProfile({ ...profile, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Storage Facility Access
                </label>
                <select
                  value={profile.storageType}
                  onChange={(e) => setProfile({ ...profile, storageType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                >
                  <option value="pucca_warehouse">Pucca Warehouse / Grameen Bhandar (Dry, Safe)</option>
                  <option value="farm_shed">Covered Farm Shed (Can hold 10–15 days)</option>
                  <option value="none">Open Courtyard / No Storage (Must sell fast)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Logistics & Transport Means
                </label>
                <select
                  value={profile.transportAccess}
                  onChange={(e) => setProfile({ ...profile, transportAccess: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                >
                  <option value="own_tractor">Own Tractor-Trolley (Lowest per-km fuel cost)</option>
                  <option value="hired_trolley">Hired Commercial Vehicle / Mini-Truck</option>
                  <option value="middleman_pickup">Depends on Village Aggregator Pickup</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cash Realization Urgency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'immediate', label: 'Need Cash Today', desc: 'Prioritize instant liquidity' },
                  { id: 'moderate', label: 'Can Wait 3–7 Days', desc: 'Can hold for slight price gains' },
                  { id: 'flexible', label: 'Can Hold 15+ Days', desc: 'Wait for peak seasonal rally' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, sellingUrgency: item.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.sellingUrgency === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                Update KisanTwin Profile
              </button>
            </div>
          </form>
        </div>

        {/* Digital Twin Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-900/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm tracking-tight">KisanTwin Active State</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono">
                SYNCHRONIZED
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-emerald-300/70 block text-[11px]">Farmer</span>
                <span className="font-bold text-base text-white">{profile.farmerName}</span>
                <span className="text-slate-400 block text-[11px]">{profile.village}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-emerald-300/70 text-[11px]">Commodity</span>
                  <div className="font-bold text-slate-100">{currentCropObj.name}</div>
                </div>
                <div>
                  <span className="text-emerald-300/70 text-[11px]">Total Quantity</span>
                  <div className="font-bold text-slate-100">{profile.quantity} Quintals</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-emerald-300/70 text-[11px]">Logistics Capability</span>
                <div className="text-slate-200 mt-0.5">
                  {profile.transportAccess === 'own_tractor'
                    ? 'Own Tractor: Capable of multi-taluka haulage at low cost.'
                    : profile.transportAccess === 'hired_trolley'
                    ? 'Commercial Freight: Dependent on per-kilometer hiring rates.'
                    : 'Middleman Dependent: High vulnerability to farmgate discount.'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-emerald-300/70 text-[11px]">AI Advisory Constraint</span>
                <div className="text-emerald-200 mt-0.5 font-medium">
                  {profile.sellingUrgency === 'immediate'
                    ? '⚡ Immediate liquidation required: Engine recommends closest high-liquidity mandi.'
                    : profile.sellingUrgency === 'moderate'
                    ? '🌾 3–7 day patience window: Recommended to wait for mid-week supply dip.'
                    : '⏳ Long holding capacity: Wait for seasonal price consolidation.'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-900/60 text-[11px] text-emerald-300/70 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Digital Twin drives personalized BechSmart and Kyun Nahi AI responses.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

