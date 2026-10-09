import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CloudRain,
  TrendingDown,
  Activity,
  Truck,
  Thermometer,
  Droplets,
  Calendar,
  Building,
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Badge from '../components/Badge';
import {
  fetchCommodities,
  fetchMandis,
  fetchMarketTrends,
  fetchWeatherSummary,
} from '../services/api';

export default function JokhimEngine() {
  const [commodities, setCommodities] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Onion');
  const [selectedMandi, setSelectedMandi] = useState('APMC Lasalgaon');

  const [weatherSummary, setWeatherSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [priceUnit, setPriceUnit] = useState('Rs./Quintal');
  const [arrivalUnit, setArrivalUnit] = useState('Metric Tonnes');

  // Load commodities
  useEffect(() => {
    async function loadComms() {
      try {
        const comms = await fetchCommodities();
        setCommodities(comms);
        if (comms?.length > 0) {
          const defaultCrop = comms.find((c) => c.commodity === 'Onion') || comms[0];
          setSelectedCrop(defaultCrop.commodity);
          setPriceUnit(defaultCrop.price_unit);
          setArrivalUnit(defaultCrop.arrival_unit);
        }
      } catch (err) {
        console.error('Failed to load commodities in Jokhim:', err);
      }
    }
    loadComms();
  }, []);

  // Load mandis for selected crop
  useEffect(() => {
    async function loadMandisList() {
      if (!selectedCrop) return;
      try {
        const mList = await fetchMandis({ commodity: selectedCrop });
        setMandis(mList);
        if (mList?.length > 0) {
          const exists = mList.some((m) => m.market === selectedMandi);
          if (!exists) setSelectedMandi(mList[0].market);
        }
      } catch (err) {
        console.error('Failed to load mandis in Jokhim:', err);
      }
    }
    loadMandisList();
  }, [selectedCrop]);

  // Load weather and trend data for selected mandi
  useEffect(() => {
    async function loadObservations() {
      if (!selectedCrop || !selectedMandi) return;
      try {
        const [weatherRes, trendRes] = await Promise.all([
          fetchWeatherSummary({ market: selectedMandi }),
          fetchMarketTrends({ commodity: selectedCrop, market: selectedMandi, limit: 30 }),
        ]);

        if (weatherRes?.found) {
          setWeatherSummary(weatherRes);
        } else {
          setWeatherSummary(null);
        }

        if (trendRes?.found) {
          setTrendData(trendRes.data);
          setPriceUnit(trendRes.price_unit);
          setArrivalUnit(trendRes.arrival_unit);
        } else {
          setTrendData([]);
        }
      } catch (err) {
        console.error('Failed to load Jokhim observations:', err);
      }
    }
    loadObservations();
  }, [selectedCrop, selectedMandi]);

  // Calculate historical volatility metrics from real points
  const prices = trendData.map((d) => d.modal_price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const spreadPrice = maxPrice - minPrice;

  const arrivals = trendData.map((d) => d.arrival_quantity).filter(Boolean);
  const maxArrival = arrivals.length > 0 ? Math.max(...arrivals) : 0;
  const minArrival = arrivals.length > 0 ? Math.min(...arrivals) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Jokhim Risk Indicators</h1>
            <Badge variant="amber" size="xs">
              Historical Observations Only
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Observed historical price volatility, arrival spikes, and station weather records.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <label className="text-slate-500 font-medium">Select Mandi:</label>
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="font-bold text-emerald-800 bg-transparent focus:outline-hidden"
          >
            {mandis.map((m) => (
              <option key={m.market} value={m.market}>
                {m.market}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Status Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl text-amber-900 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-950">
              Predictive Risk Scoring Engine Disabled
            </h3>
            <p className="text-amber-800 leading-relaxed">
              In accordance with our data guidelines, future risk prediction scores (e.g. price drop probability,
              arrival flood probability) will remain disabled until the formal ML risk scoring logic is connected.
              The panels below present <strong>actual observed historical fluctuations</strong> from the dataset.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Weather Drivers Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Station Weather Record History ({selectedMandi})
            </h2>
          </div>
          {weatherSummary && (
            <Badge variant="neutral" size="sm">
              <Calendar className="w-3 h-3 text-slate-500" />
              Observed {weatherSummary.date_range?.start} → {weatherSummary.date_range?.end}
            </Badge>
          )}
        </div>

        {weatherSummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                <Thermometer className="w-4 h-4 text-amber-500" />
                Temperature Range
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {weatherSummary.temperature?.min_c}°C – {weatherSummary.temperature?.max_c}°C
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Historical mean: {weatherSummary.temperature?.mean_c}°C
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                Precipitation History
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {weatherSummary.rainfall?.total_precipitation_mm} mm
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {weatherSummary.rainfall?.rainy_days_count} rainy days (Peak: {weatherSummary.rainfall?.max_single_day_rain_mm} mm)
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                <Droplets className="w-4 h-4 text-teal-500" />
                Relative Humidity Range
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {weatherSummary.humidity?.min_pct}% – {weatherSummary.humidity?.max_pct}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Historical mean: {weatherSummary.humidity?.mean_pct}%
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4 text-center">
            No weather observations found for this market.
          </div>
        )}
      </div>

      {/* Historical Market Volatility Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                30-Day Modal Price Spread ({selectedCrop})
              </h3>
            </div>
            <Badge variant="emerald" size="xs">
              Observed
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Minimum Recorded Price:</span>
              <span className="font-bold text-slate-800">₹{minPrice.toLocaleString('en-IN')} {priceUnit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Maximum Recorded Price:</span>
              <span className="font-bold text-slate-800">₹{maxPrice.toLocaleString('en-IN')} {priceUnit}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Price Variance Spread:</span>
              <span className="font-extrabold text-emerald-700">₹{spreadPrice.toLocaleString('en-IN')} {priceUnit}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Arrival Inflow Volume Variations
              </h3>
            </div>
            <Badge variant="neutral" size="xs">
              Recorded Inflow
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Lowest Daily Arrival:</span>
              <span className="font-bold text-slate-800">{minArrival.toLocaleString('en-IN')} {arrivalUnit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Peak Daily Arrival Surge:</span>
              <span className="font-bold text-slate-800">{maxArrival.toLocaleString('en-IN')} {arrivalUnit}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Observation Points:</span>
              <span className="font-semibold text-slate-600">{trendData.length} recorded auction dates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
