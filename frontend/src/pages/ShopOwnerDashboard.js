import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import UserService from '../services/UserService';
import SupplierInventoryChart from '../components/ui/SupplierInventoryChart';
import CustomerBillService from '../services/CustomerBillService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ShopOwnerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalRepairs: 0,
    waitingRepairs: 0,
    inProgressRepairs: 0,
    completedRepairs: 0
  });
  // partsRequests state removed (Recent Parts Requests UI removed)
  const [displayName, setDisplayName] = useState('');

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      const storedTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]');
      
      const totalRepairs = storedTickets.length;
      // Count tickets waiting specifically for parts (various backend shapes handled)
      const waitingForParts = storedTickets.filter(ticket => {
        const s = (ticket.status || ticket.Status || '').toString();
        const low = s.toLowerCase();
        return low === 'waiting for parts' || low === 'waitingforparts' || low.includes('waiting for part');
      }).length;

      // In-progress excludes tickets that are waiting for parts (so counts are distinct)
      const inProgressRepairs = storedTickets.filter(ticket => {
        const s = (ticket.status || ticket.Status || '').toString();
        return ['Diagnosing', 'In Progress'].includes(s) || ['diagnosing', 'in progress'].includes(s.toLowerCase());
      }).length;
      const completedRepairs = storedTickets.filter(ticket => ticket.status === 'Completed').length;

      setStats({
        totalRepairs,
        waitingRepairs: waitingForParts,
        inProgressRepairs,
        completedRepairs
      });
      
  // Recent parts requests are no longer displayed on the dashboard.
    };

    loadStats();
    
    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch authoritative display name from backend (TestGetUserRole may return user info)
  useEffect(() => {
    let mounted = true;
    const fetchName = async () => {
      try {
        const raw = JSON.parse(localStorage.getItem('user') || '{}');
        const mobile = (raw.phone || raw.mobile || raw.MobileNo || raw.Mobile || raw.mobileNo || '').toString().replace(/\D/g, '');
        if (!mobile) {
          setDisplayName(raw.username || raw.name || '');
          return;
        }

        const res = await UserService.testGetUserRole(mobile);
        if (!mounted || !res || !res.data) return;

        // Try several shapes from backend
        const maybe = (res.data.ResultSet && res.data.ResultSet[0]) || res.data.Result || res.data;
        const name = (maybe && (maybe.UserName || maybe.User || maybe.Name || maybe.name || maybe.displayName || maybe.fullName)) || '';
        if (name) setDisplayName(String(name));
        else setDisplayName(raw.username || raw.name || '');
      } catch (err) {
        const raw = JSON.parse(localStorage.getItem('user') || '{}');
        setDisplayName(raw.username || raw.name || '');
      }
    };

    fetchName();
    return () => { mounted = false; };
  }, []);

  const statsData = [
    { 
      name: 'Total Repairs', 
      value: stats.totalRepairs.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '📋',
      color: 'blue'
    },
    { 
      name: 'Waiting for Parts', 
      value: stats.waitingRepairs.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '📦',
      color: 'purple'
    },
    { 
      name: 'In Progress', 
      value: stats.inProgressRepairs.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '🔧',
      color: 'yellow'
    },
    { 
      name: 'Completed', 
      value: stats.completedRepairs.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '✅',
      color: 'green'
    }
  ];

  // Note: Recent Parts Requests UI removed; partsRequests remains populated for potential future use.

  // UI state for expanded panels (modal)
  const [expandedPanel, setExpandedPanel] = useState(null);

  // --- Customer Bills dashboard state ---
  const [todayBills, setTodayBills] = useState({ count: 0, total: 0, loading: false });

  const [byDateInput, setByDateInput] = useState('');
  const [byDateResult, setByDateResult] = useState({ count: 0, total: 0, loading: false });

  const now = new Date();
  const [monthlyMonth, setMonthlyMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [monthlyYear, setMonthlyYear] = useState(String(now.getFullYear()));
  const [monthlyResult, setMonthlyResult] = useState({ count: 0, total: 0, loading: false });

  const [yearlyYear, setYearlyYear] = useState(String(now.getFullYear()));
  const [yearlyResult, setYearlyResult] = useState({ count: 0, total: 0, loading: false });

  // Helper to defensively parse different response shapes from backend
  const parseCountTotal = (res) => {
    if (!res || !res.data) return { count: 0, total: 0 };
    const payload = res.data.ResultSet || res.data.Result || res.data;
    if (Array.isArray(payload)) {
      const count = payload.length;
      const total = payload.reduce((s, it) => s + (parseFloat(it.TotalAmount || it.Amount || it.amount || 0) || 0), 0);
      return { count, total };
    }
    if (typeof payload === 'object') {
      const count = Number(payload.Count || payload.count || res.data.Count || res.data.count || 0) || 0;
      const total = Number(payload.TotalAmount || payload.totalAmount || payload.total || res.data.TotalAmount || res.data.totalAmount || 0) || 0;
      return { count, total };
    }
    // fallback: if response itself is a primitive number
    const asNumber = Number(res.data);
    if (!Number.isNaN(asNumber)) return { count: asNumber, total: 0 };
    return { count: 0, total: 0 };
  };

  const formatCurrency = (n) => {
    const num = Number(n) || 0;
    try {
      // Prefer localized number formatting but prefix with 'Rs'
      const formatted = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
      return `Rs ${formatted}`;
    } catch {
      return `Rs ${num.toFixed(2)}`;
    }
  };

  const fetchTodayBills = async () => {
    setTodayBills((s) => ({ ...s, loading: true }));
    try {
      const res = await CustomerBillService.GetTodayBillCount();
      const parsed = parseCountTotal(res);
      setTodayBills({ count: parsed.count, total: parsed.total, loading: false });
    } catch (err) {
      setTodayBills({ count: 0, total: 0, loading: false });
    }
  };

  const fetchBillsByDate = async (dateStr) => {
    if (!dateStr) return setByDateResult({ count: 0, total: 0, loading: false });
    setByDateResult((s) => ({ ...s, loading: true }));
    try {
      const res = await CustomerBillService.GetBillByDate(dateStr);
      const parsed = parseCountTotal(res);
      setByDateResult({ count: parsed.count, total: parsed.total, loading: false });
    } catch (err) {
      setByDateResult({ count: 0, total: 0, loading: false });
    }
  };

  const fetchMonthly = async (month, year) => {
    setMonthlyResult((s) => ({ ...s, loading: true }));
    try {
      const res = await CustomerBillService.GetMonthlyBillCount(month, year);
      const parsed = parseCountTotal(res);
      setMonthlyResult({ count: parsed.count, total: parsed.total, loading: false });
    } catch (err) {
      setMonthlyResult({ count: 0, total: 0, loading: false });
    }
  };

  const fetchYearly = async (year) => {
    setYearlyResult((s) => ({ ...s, loading: true }));
    try {
      const res = await CustomerBillService.GetYearlyBillCount(year);
      const parsed = parseCountTotal(res);
      setYearlyResult({ count: parsed.count, total: parsed.total, loading: false });
    } catch (err) {
      setYearlyResult({ count: 0, total: 0, loading: false });
    }
  };

  // Initial fetch for today's bills and current monthly/yearly
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTodayBills();
    fetchMonthly(monthlyMonth, monthlyYear);
    fetchYearly(yearlyYear);
  }, []);


  const openPanel = (panel) => setExpandedPanel(panel);
  const closePanel = () => setExpandedPanel(null);

  const getRepairTickets = () => {
    try {
      return JSON.parse(localStorage.getItem('repairTickets') || '[]');
    } catch (e) { return []; }
  };

  const getStatusCounts = () => {
    const tickets = getRepairTickets();
    const map = {};
    tickets.forEach(t => {
      const s = t.status || t.Status || 'Other';
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  };

  // Build chart data from localStorage (fallbacks included)

  // Repair Status Distribution (use stats we already compute)
  const statusLabels = ['Waiting for Repairman','In Progress','Completed','Other'];
  const statusData = [stats.waitingRepairs || 0, stats.inProgressRepairs || 0, stats.completedRepairs || 0, Math.max(0, (stats.totalRepairs || 0) - ((stats.waitingRepairs || 0) + (stats.inProgressRepairs || 0) + (stats.completedRepairs || 0)) )];

  // Monthly parts usage helper removed (monthly parts card deleted).

  

  const statusChartData = {
    labels: statusLabels,
    datasets: [{ data: statusData, backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#9ca3af'] }]
  };

  // --- Customer Bills Distribution ---
  const [billCounts, setBillCounts] = useState({ completed: 0, pending: 0, returned: 0, cancelled: 0, other: 0 });

  const loadBillCounts = () => {
    try {
      const bills = JSON.parse(localStorage.getItem('repairBills') || '[]');
      const counts = { completed: 0, pending: 0, returned: 0, cancelled: 0, other: 0 };
      (bills || []).forEach(b => {
        const s = (b.status || b.Status || '').toString().toLowerCase();
        if (s.includes('complete') || s === 'completed' || s === 'paid') counts.completed += 1;
        else if (s.includes('pend') || s === 'pending' || s === 'draft') counts.pending += 1;
        else if (s.includes('return') || s === 'returned') counts.returned += 1;
        else if (s.includes('cancel') || s === 'cancelled' || s === 'canceled') counts.cancelled += 1;
        else counts.other += 1;
      });
      setBillCounts(counts);
    } catch (e) {
      setBillCounts({ completed: 0, pending: 0, returned: 0, cancelled: 0, other: 0 });
    }
  };

  useEffect(() => {
    loadBillCounts();
    const iv = setInterval(loadBillCounts, 5000);
    return () => clearInterval(iv);
  }, []);

  const billLabels = ['Completed', 'Pending', 'Returned', 'Cancelled', 'Other'];
  const billData = [billCounts.completed || 0, billCounts.pending || 0, billCounts.returned || 0, billCounts.cancelled || 0, billCounts.other || 0];
  const billChartData = { labels: billLabels, datasets: [{ data: billData, backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#9ca3af'] }] };

  // Prepare sorted status entries for the modal (largest first) to show a clean, proportional list
  const statusEntries = Object.entries(getStatusCounts()).sort((a, b) => (b[1] || 0) - (a[1] || 0));

  // partsUsageChartData removed since Monthly Parts Usage Report card was deleted

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shop Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {displayName || user.username || user.name || 'Guest'}</span>
          </div>
        </div>

        {/* NOTE: search bar moved into Quick Actions section per UX request */}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 bg-${stat.color}-500 rounded-md flex items-center justify-center`}>
                      <span className="text-white font-bold">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className={`font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>{' '}
                  <span className="text-gray-500">from last week</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Bills Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Bills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Today's Bills</h3>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{todayBills.loading ? '...' : todayBills.count}</div>
                <div className="text-sm text-gray-500">Count</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{todayBills.loading ? '...' : formatCurrency(todayBills.total)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchTodayBills}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Bills By Date */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Bills by Date</h3>
            <label className="mt-3 block text-xs text-gray-600">Select date</label>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="date"
                value={byDateInput}
                onChange={(e) => setByDateInput(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full"
              />
              <button
                onClick={() => fetchBillsByDate(byDateInput)}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                Go
              </button>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{byDateResult.loading ? '...' : byDateResult.count}</div>
                <div className="text-sm text-gray-500">Count</div>
              </div>
              <div className="text-right">
                <div className="text-md font-semibold text-gray-900">{byDateResult.loading ? '...' : formatCurrency(byDateResult.total)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Monthly Bills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Monthly Bills</h3>
            <div className="mt-3 flex space-x-2">
              <select
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-1/2"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const m = String(i + 1).padStart(2, '0');
                  return <option key={m} value={m}>{m}</option>;
                })}
              </select>
              <input
                type="number"
                value={monthlyYear}
                onChange={(e) => setMonthlyYear(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-1/2"
                min="2000"
                max="2099"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={() => fetchMonthly(monthlyMonth, monthlyYear)}
                className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
              >
                Show
              </button>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{monthlyResult.loading ? '...' : monthlyResult.count}</div>
                <div className="text-sm text-gray-500">Count</div>
              </div>
              <div className="text-right">
                <div className="text-md font-semibold text-gray-900">{monthlyResult.loading ? '...' : formatCurrency(monthlyResult.total)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Yearly Bills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Yearly Bills</h3>
            <label className="mt-3 block text-xs text-gray-600">Select year</label>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="number"
                value={yearlyYear}
                onChange={(e) => setYearlyYear(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full"
                min="2000"
                max="2099"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={() => fetchYearly(yearlyYear)}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
              >
                Show
              </button>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{yearlyResult.loading ? '...' : yearlyResult.count}</div>
                <div className="text-sm text-gray-500">Count</div>
              </div>
              <div className="text-right">
                <div className="text-md font-semibold text-gray-900">{yearlyResult.loading ? '...' : formatCurrency(yearlyResult.total)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Repair Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Repair Status Distribution</h2>
              <div className="flex items-center">
                <div
                  role="button"
                  onClick={() => openPanel('repair-status')}
                  onKeyDown={(e) => { if (e.key === 'Enter') openPanel('repair-status'); }}
                  tabIndex={0}
                  className="relative w-40 h-40 cursor-pointer hover:shadow-inner transition-shadow"
                >
                  <Pie data={statusChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  {/* center total overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-bold text-gray-800">{statusData.reduce((a,b)=>a+b,0)}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>

                {/* custom legend on right */}
                <div className="ml-6 flex-1">
                  <ul className="space-y-3">
                    {statusChartData.labels.map((label, idx) => {
                      const value = statusChartData.datasets[0].data[idx] || 0;
                      const total = statusChartData.datasets[0].data.reduce((a,b)=>a+b,0) || 1;
                      const pct = Math.round((value/total)*1000)/10; // one decimal
                      const color = statusChartData.datasets[0].backgroundColor[idx] || '#ccc';
                      return (
                        <li key={label} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span style={{backgroundColor: color}} className="w-4 h-4 rounded-md inline-block" />
                            <span className="text-sm text-gray-700">{label}</span>
                          </div>
                          <div className="text-sm text-gray-700">{value} <span className="text-gray-400">({pct}%)</span></div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-4">Total: {stats.totalRepairs}</div>
            </div>

                {/* Customer Bills Distribution (mirrors Repair Status UI) */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Bills Distribution</h2>
                  <div className="flex items-center">
                    <div
                      role="button"
                      onClick={() => openPanel('bills-distribution')}
                      onKeyDown={(e) => { if (e.key === 'Enter') openPanel('bills-distribution'); }}
                      tabIndex={0}
                      className="relative w-40 h-40 cursor-pointer hover:shadow-inner transition-shadow"
                    >
                      <Pie data={billChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-2xl font-bold text-gray-800">{billData.reduce((a,b)=>a+b,0)}</div>
                        <div className="text-xs text-gray-500">Total Bills</div>
                      </div>
                    </div>

                    <div className="ml-6 flex-1">
                      <ul className="space-y-3">
                        {billChartData.labels.map((label, idx) => {
                          const value = billChartData.datasets[0].data[idx] || 0;
                          const total = billChartData.datasets[0].data.reduce((a,b)=>a+b,0) || 1;
                          const pct = Math.round((value/total)*1000)/10;
                          const color = billChartData.datasets[0].backgroundColor[idx] || '#ccc';
                          return (
                            <li key={label} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span style={{backgroundColor: color}} className="w-4 h-4 rounded-md inline-block" />
                                <span className="text-sm text-gray-700">{label}</span>
                              </div>
                              <div className="text-sm text-gray-700">{value} <span className="text-gray-400">({pct}%)</span></div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-4">Total: {billData.reduce((a,b)=>a+b,0)}</div>
                </div>
        </div>

        {/* Full-width Supplier Inventory Usage card */}
        <div className="mt-12 mb-12">
          <SupplierInventoryChart />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>

          {/* Quick Actions grid (search moved to Recent Parts Requests) */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/shop-owner/tickets"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-center"
            >
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-semibold text-gray-800">Manage Tickets</h3>
              <p className="text-gray-600 text-sm">View and manage repair tickets</p>
            </Link>
            
            <Link 
              to="/shop-owner/bills"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200 text-center"
            >
              <div className="text-3xl mb-2">🧾</div>
              <h3 className="font-semibold text-gray-800">Customer Bills</h3>
              <p className="text-gray-600 text-sm">Create and manage bills</p>
            </Link>
            
            <Link 
              to="/shop-owner/parts-history"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200 text-center"
            >
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-800">Parts History</h3>
              <p className="text-gray-600 text-sm">View parts request history</p>
            </Link>
          </div>
        </div>

        {/* Recent Parts Requests */}
        {/* Expanded detail modal (shows when a panel is clicked) */}
        {expandedPanel === 'repair-status' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/5 lg:w-1/2 p-6 relative">
              <button onClick={closePanel} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
              <h3 className="text-xl font-semibold mb-4">Repair Status - Full Overview</h3>
              <div>
                {/* Only show Status Counts in a clean, proportional card (Recent Tickets removed) */}
                <h4 className="font-medium mb-3">Status Counts</h4>
                <div className="bg-gray-50 rounded-md p-1">
                  {statusEntries.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No tickets found.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100 rounded-md overflow-hidden">
                      {statusEntries.map(([k, v], idx) => (
                        <li key={k} className="flex items-center justify-between py-4 px-5 bg-white">
                          <span className="text-sm text-gray-700">{k}</span>
                          <span className="text-sm font-medium text-gray-900">{v}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Recent Parts Requests removed per user request */}
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;