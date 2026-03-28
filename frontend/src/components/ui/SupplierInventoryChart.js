import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import UsageReportService from '../../services/UsageReportService';

// Helper to try and extract list from different API shapes
const extractList = (res) => {
  if (!res) return [];
  const d = res.data || res;
  // Common shapes: { ResultSet: [...] } or { Result: [...] } or [] directly
  if (Array.isArray(d)) return d;
  if (d.ResultSet && Array.isArray(d.ResultSet)) return d.ResultSet;
  if (d.Result && Array.isArray(d.Result)) return d.Result;
  if (d.Data && Array.isArray(d.Data)) return d.Data;
  // try to find the first array value
  const vals = Object.values(d).find(v => Array.isArray(v));
  return Array.isArray(vals) ? vals : [];
};

// Flexible extractor for category name / used / available keys
const normalize = (item) => {
  const keys = Object.keys(item || {});
  const find = (candidates) => candidates.map(s => keys.find(k => k.toLowerCase().includes(s))).find(Boolean);
  const catKey = find(['category', 'cat', 'group', 'type', 'name']) || keys[0];
  const usedKey = find(['used', 'consumed', 'usedcount', 'used_count', 'usedQty', 'usage']) || keys.find(k => /used|consum|usage|count|qty|quantity/i.test(k));
  const availKey = find(['available', 'avail', 'instock', 'stock', 'availablecount', 'available_count']) || keys.find(k => /avail|stock|available|remaining/i.test(k));

  const category = item[catKey];
  const used = usedKey ? Number(item[usedKey]) || 0 : (Number(item.used) || Number(item.Used) || 0);
  const available = availKey ? Number(item[availKey]) || 0 : (Number(item.available) || Number(item.Available) || 0);
  return { category: category || 'Unknown', used, available };
};

const SupplierInventoryChart = () => {
  const [mode, setMode] = useState('daily'); // 'daily' | '1month' | '6months' | 'custom'
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [chartKey, setChartKey] = useState(0);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'grid'

  const fetchForMode = async (m) => {
    setLoading(true);
    setError(null);
    console.debug('[SupplierInventoryChart] fetchForMode ->', m);
    try {
      let res;
      if (m === 'daily') {
        res = await UsageReportService.getDailyReport(30);
      } else if (m === '1month') {
        res = await UsageReportService.getMonthlyReport(1);
      } else if (m === '6months') {
        res = await UsageReportService.getMonthlyReport(6);
      } else if (m === 'custom') {
        const { start, end } = customRange;
        if (!start || !end) throw new Error('Please select start and end date');
        res = await UsageReportService.getCustomReport(start, end);
      }

      const list = extractList(res);
      const mapped = list.map(normalize);

      // Group by category and sum used/available
      const map = {};
      mapped.forEach(({ category, used, available }) => {
        const key = String(category);
        if (!map[key]) map[key] = { category: key, used: 0, available: 0 };
        map[key].used += Number(used) || 0;
        map[key].available += Number(available) || 0;
      });

      const rows = Object.values(map);
      setDataRows(rows);
      // bump key to force chart remount/redraw (helps Chart.js pick up data changes reliably)
      setChartKey(Date.now());
      console.debug('[SupplierInventoryChart] fetched rows', rows.length);
    } catch (err) {
      setError(err.message || 'Failed to load report');
      setDataRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForMode(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // change mode and fetch immediately (gives faster UX than relying solely on effect)
  const changeMode = (m) => {
    setMode(m);
    fetchForMode(m);
  };

  const onApplyCustom = () => {
    setMode('custom');
    fetchForMode('custom');
  };

  const labels = dataRows.map(r => r.category);
  const usedData = dataRows.map(r => r.used);
  const availData = dataRows.map(r => r.available);

  const chartData = {
    labels,
    datasets: [
      { label: 'Used', data: usedData, backgroundColor: 'rgba(59,130,246,0.85)' },
      { label: 'Available', data: availData, backgroundColor: 'rgba(16,185,129,0.85)' }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Supplier Inventory Usage</h3>
          <p className="text-sm text-gray-500">Shows category-wise used and available counts.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button disabled={loading} onClick={() => changeMode('daily')} className={`px-3 py-1 rounded ${mode==='daily'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>Day-to-day</button>
          <button disabled={loading} onClick={() => changeMode('1month')} className={`px-3 py-1 rounded ${mode==='1month'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>1 Month</button>
          <button disabled={loading} onClick={() => changeMode('6months')} className={`px-3 py-1 rounded ${mode==='6months'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>6 Months</button>
          
          {/* view toggle */}
          <button onClick={() => setViewMode(v => v === 'chart' ? 'grid' : 'chart')} title="Toggle compact view" className={`ml-3 p-2 rounded ${viewMode==='grid' ? 'bg-gray-200' : 'bg-white'} border`}>
            {viewMode === 'chart' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h4v4H3V3zM7 3h10v4H7V3zM3 7h4v10H3V7zM7 9h10v8H7V9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h4v4H3V3zM11 3h6v6h-6V3zM3 11h6v6H3v-6zM11 11h6v6h-6v-6z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <input type="date" value={customRange.start} onChange={(e)=>setCustomRange(s=>({...s,start:e.target.value}))} className="border px-2 py-1 rounded" />
          <span className="text-gray-400">to</span>
          <input type="date" value={customRange.end} onChange={(e)=>setCustomRange(s=>({...s,end:e.target.value}))} className="border px-2 py-1 rounded" />
          <button onClick={onApplyCustom} className="ml-2 px-3 py-1 rounded bg-gray-800 text-white">Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading report…</div>
      ) : error ? (
        <div className="py-6 text-sm text-red-600">{error}</div>
      ) : dataRows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No data available for the selected range.</div>
      ) : (
        <div>
          {viewMode === 'chart' ? (
            <>
              <div className="h-64" style={{ minHeight: 240 }}>
                <Bar
                  key={chartKey}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { x: { stacked: false }, y: { beginAtZero: true } }
                  }}
                  data={chartData}
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total Categories: <span className="font-medium text-gray-800">{dataRows.length}</span>
                <span className="ml-4">Total Used: <span className="font-medium">{usedData.reduce((a,b)=>a+b,0)}</span></span>
                <span className="ml-4">Total Available: <span className="font-medium">{availData.reduce((a,b)=>a+b,0)}</span></span>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataRows.map((r, idx) => (
                <div key={r.category + idx} className="border rounded p-3 bg-white shadow-sm flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">{String(r.category || '').charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{r.category}</div>
                    <div className="text-xs text-gray-500 mt-1">Used: <span className="font-semibold text-blue-600">{r.used}</span> • Available: <span className="font-semibold text-green-600">{r.available}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierInventoryChart;
