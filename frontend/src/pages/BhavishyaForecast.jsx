import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Thermometer,
  CloudRain,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Badge from '../components/Badge';
import {
  fetchCommodities,
  fetchMandis,
  fetchMarketTrends,
  fetchWeatherSummary,
} from '../services/api';

export default function BhavishyaForecast() {
  const [commodities, setCommodities] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Onion');
  const [selectedMandi, setSelectedMandi] = useState('APMC Lasalgaon');

  const [trendData, setTrendData] = useState([]);
  const [priceUnit, setPriceUnit] = useState('Rs./Quintal');
  const [weatherSummary, setWeatherSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const comms = await fetchCommodities();
        setCommodities(comms);
        if (comms && comms.length > 0) {
          const defaultCrop = comms.find((c) => c.commodity === 'Onion') || comms[0];
          setSelectedCrop(defaultCrop.commodity);
          setPriceUnit(defaultCrop.price_unit);
        }
      } catch (err) {
        console.error('Failed to load commodities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadMandis() {
      if (!selectedCrop) return;
      try {
        const mList = await fetchMandis({ commodity: selectedCrop });
        setMandis(mList);
        if (mList && mList.length > 0) {
          const exists = mList.some((m) => m.market === selectedMandi);
          if (!exists) setSelectedMandi(mList[0].market);
        }
      } catch (err) {
        console.error('Failed to load mandis:', err);
      }
    }
    loadMandis();
  }, [selectedCrop]);

  useEffect(() => {
    async function loadTrends() {
      if (!selectedCrop || !selectedMandi) return;
      try {
        setChartLoading(true);
        const [trendRes, weatherRes] = await Promise.all([
          fetchMarketTrends({
            commodity: selectedCrop,
            market: selectedMandi,
            limit: 60,
          }),
          fetchWeatherSummary({ market: selectedMandi }),
        ]);

        if (trendRes?.found) {
          setTrendData(trendRes.data);
          setPriceUnit(trendRes.price_unit);
        } else {
          setTrendData([]);
        }

        if (weatherRes?.found) {
          setWeatherSummary(weatherRes);
        }
      } catch (err) {
        console.error('Failed to load trends/weather:', err);
      } finally {
        setChartLoading(false);
      }
    }
    loadTrends();
  }, [selectedCrop, selectedMandi]);

  const latestPoint = trendData[trendData.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Bhavishya Forecast Readiness</h1>
            <Badge variant="amber" size="xs">
              ML Model Pipeline Next
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Historical price foundation and station observations preparing for XGBoost forward forecasting.
          </p>
        </div>
      </div>

      {/* Explicit ML Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl text-amber-900 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-950">
              ML Forecasting Engine Not Yet Connected
            </h3>
            <p className="text-amber-800 leading-relaxed">
              In accordance with our strict data integrity policy, we do not fabricate 1–7 day forward
              predictions. The chart below displays <strong>actual historical price observations</strong> from
              the dataset for {selectedCrop} at {selectedMandi}. The time-series forecasting model
              will be trained on this series in the upcoming ML phase.
            </p>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
            >
              {commodities.map((c) => (
                <option key={c.commodity} value={c.commodity}>
                  {c.commodity} ({c.price_unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Target APMC Mandi
            </label>
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
            >
              {mandis.map((m) => (
                <option key={m.market} value={m.market}>
                  {m.market}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Historical Baseline Price Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Observed Price Trajectory ({selectedCrop} @ {selectedMandi})
            </h2>
            <p className="text-xs text-slate-500">
              Training data input series for forward forecasting ({priceUnit})
            </p>
          </div>
          {latestPoint && (
            <Badge variant="emerald" size="sm">
              Latest: ₹{latestPoint.modal_price} ({latestPoint.date})
            </Badge>
          )}
        </div>

        {chartLoading ? (
          <div className="h-72 w-full flex items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading historical data...
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-72 w-full flex items-center justify-center text-slate-400 text-xs">
            No price records available for {selectedCrop} at {selectedMandi}.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`₹${val} (${priceUnit})`, 'Observed Modal Price']}
                />
                <Area
                  type="monotone"
                  dataKey="modal_price"
                  name="Observed Price"
                  stroke="#047857"
                  strokeWidth={2.5}
                  fill="url(#forecastFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Historical Weather Drivers for this Mandi */}
      {weatherSummary && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-emerald-600" />
            Historical Weather Drivers Available for Model Training
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">Temperature Extremes:</span>
              <span className="font-bold text-slate-900">
                {weatherSummary.temperature.min_c}°C to {weatherSummary.temperature.max_c}°C
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Mean: {weatherSummary.temperature.mean_c}°C
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">Cumulative Rainfall:</span>
              <span className="font-bold text-slate-900">
                {weatherSummary.rainfall.total_precipitation_mm} mm
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Across {weatherSummary.rainfall.rainy_days_count} recorded rainy days
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">Mean Relative Humidity:</span>
              <span className="font-bold text-slate-900">
                {weatherSummary.humidity.mean_pct}%
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Range: {weatherSummary.humidity.min_pct}% – {weatherSummary.humidity.max_pct}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
