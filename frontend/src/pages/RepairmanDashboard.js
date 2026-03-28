import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../services/UserService';
import api from '../services/api';

const RepairmanDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    assignedRepairs: 0,
    completedToday: 0,
    waitingForParts: 0
  });
  const [availableRepairs, setAvailableRepairs] = useState([]);
  const [myRepairs, setMyRepairs] = useState([]);
  const [displayName, setDisplayName] = useState('');


//   const loadMyRepairs = async (repairmanId) => {
//   try {
//     const [diagnosingRes, returnedRes] = await Promise.all([
//       api.get(`/RepairTicket/GetDiagnosingRepairTickets?repairman_id=${repairmanId}`),
//       api.get(`/RepairTicket/GetReturnedRepairTickets?repairman_id=${repairmanId}`)
//     ]);

//     const diagnosing = diagnosingRes?.data?.Result || [];
//     const returned = returnedRes?.data?.Result || [];

//     setMyRepairs([...diagnosing, ...returned].slice(0, 3));
//   } catch (error) {
//     console.error('Failed to load My Repairs', error);
//     setMyRepairs([]);
//   }
// };

const loadMyRepairs = async (repairmanIdentifier) => {
  try {
    // repairmanIdentifier may be a numeric id or a name string. Choose query param accordingly.
    const isNumericId = repairmanIdentifier !== null && repairmanIdentifier !== undefined && !Number.isNaN(parseInt(repairmanIdentifier, 10)) && String(repairmanIdentifier).match(/^\d+$/);
    const idParam = isNumericId ? `repairman_id=${repairmanIdentifier}` : `rep_name=${encodeURIComponent(String(repairmanIdentifier || '').trim())}`;

    const [diagnosingRes, returnedRes] = await Promise.all([
      api.get(`/RepairTicket/GetDiagnosingRepairTickets?${idParam}`),
      api.get(`/RepairTicket/GetReturnedRepairTickets?${idParam}`)
    ]);

    // Safely extract data from API response
    const diagnosing = diagnosingRes?.data?.ResultSet || diagnosingRes?.data?.Result || [];
    const returned = returnedRes?.data?.ResultSet || returnedRes?.data?.Result || [];

    // Ensure arrays
    const diagnosingArray = Array.isArray(diagnosing) ? diagnosing : [];
    const returnedArray = Array.isArray(returned) ? returned : [];

    // Merge both lists and limit to 3 for dashboard
    const combined = [...diagnosingArray, ...returnedArray].slice(0, 3);

    setMyRepairs(combined);
  } catch (error) {
    console.error('Failed to load My Repairs', error);
    setMyRepairs([]); // fallback empty
  }
};



  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
        let repairmanId = rawUser?.repairman_id;

        // If no explicit repairman id, try to resolve via UserService using mobile number
        if (!repairmanId) {
          const mobile = (rawUser.phone || rawUser.mobile || rawUser.MobileNo || rawUser.Mobile || rawUser.mobileNo || '').toString().replace(/\D/g, '');
          if (mobile) {
            try {
              const roleRes = await UserService.testGetUserRole(mobile);
              if (roleRes && roleRes.data) {
                const maybe = (roleRes.data.ResultSet && roleRes.data.ResultSet[0]) || roleRes.data.Result || roleRes.data;
                const candidates = [
                  maybe && maybe.RepairmanID,
                  maybe && maybe.RepairmanId,
                  maybe && maybe.repairman_id,
                  maybe && maybe.repairmanId,
                  maybe && maybe.user_id,
                  maybe && maybe.UserID,
                  maybe && maybe.userId,
                  maybe && maybe.id
                ];
                for (const c of candidates) {
                  if (c === undefined || c === null) continue;
                  const digits = String(c).replace(/[^0-9\-]/g, '');
                  const n = digits === '' ? null : parseInt(digits, 10);
                  if (n && !Number.isNaN(n)) { repairmanId = n; break; }
                }
              }
            } catch (e) { /* ignore */ }
          }
        }

        // If we resolved an id or at least have a username, call loader. Prefer id, otherwise pass username/name.
        if (mounted) {
          if (repairmanId) await loadMyRepairs(repairmanId);
          else await loadMyRepairs(rawUser.username || rawUser.name || rawUser.userName || '');
        }
      } catch (err) {
        console.warn('loadMyRepairs resolver failed', err);
      }
    })();

    return () => { mounted = false; };

  }, []);


  // Load data from server (preferred) and fall back to localStorage
  useEffect(() => {
    let mounted = true;

    const parseSummary = (data) => {
      if (!data) return null;
      // Try to find an object with the summary counts
      const maybe = Array.isArray(data) && data.length > 0 ? data[0] : data.ResultSet && data.ResultSet[0] ? data.ResultSet[0] : data.Result || data;

      const extract = (obj, keys) => {
        for (const k of keys) {
          if (typeof obj[k] !== 'undefined' && obj[k] !== null) return Number(obj[k]) || 0;
        }
        return 0;
      };

      // common possible keys
      const assigned = extract(maybe, ['AssignedRepairs', 'assignedRepairs', 'assigned_repairs', 'Assigned', 'AssignedCount', 'AssignedRepairCount']);
      const completed = extract(maybe, ['CompletedToday', 'completedToday', 'completed_today', 'CompletedCount', 'Completed']);
      const waiting = extract(maybe, ['WaitingForParts', 'waitingForParts', 'waiting_for_parts', 'Waiting', 'WaitingCount']);

      return { assignedRepairs: assigned, completedToday: completed, waitingForParts: waiting };
    };

    const loadData = async () => {
      // Local fallback computation (kept for offline or legacy server)
      const storedTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]');
      const myAssignedRepairs = storedTickets.filter(ticket => String(ticket.assignedTo) === String(user.username));
      const availableRepairsData = storedTickets.filter(ticket => ticket.status === 'Available');
      const completedToday = myAssignedRepairs.filter(ticket => ticket.status === 'Completed' && ticket.completedAt === new Date().toISOString().split('T')[0]).length;
      const waitingForParts = myAssignedRepairs.filter(ticket => ticket.status === 'Waiting for Parts').length;

      // optimistic local values
      let localStats = {
        assignedRepairs: myAssignedRepairs.length,
        completedToday,
        waitingForParts
      };

      // set local derived values immediately so UI is responsive
      if (mounted) setStats(localStats);

      // attempt to load authoritative summary from server
      try {
        const repName = localStorage.getItem('rep_name') || user?.username || '';
        const encodedName = encodeURIComponent(String(repName || '').trim());

        // Try to resolve a numeric repairman id (prefer server-resolved), fallback to rep_name
        let repairmanId = null;
        try {
          const rawUser = user || {};
          const mobile = (rawUser.phone || rawUser.mobile || rawUser.MobileNo || rawUser.Mobile || rawUser.mobileNo || '').toString().replace(/\D/g, '');
          if (mobile) {
            try {
              const roleRes = await UserService.testGetUserRole(mobile);
              if (roleRes && roleRes.data) {
                const maybe = (roleRes.data.ResultSet && roleRes.data.ResultSet[0]) || roleRes.data.Result || roleRes.data;
                // Prefer explicit Repairman identifiers first to avoid picking a generic user_id
                const candidates = [
                  maybe && maybe.RepairmanID,
                  maybe && maybe.RepairmanId,
                  maybe && maybe.repairman_id,
                  maybe && maybe.repairmanId,
                  maybe && maybe.user_id,
                  maybe && maybe.UserID,
                  maybe && maybe.userId,
                  maybe && maybe.id
                ];
                for (const c of candidates) {
                  if (c === undefined || c === null) continue;
                  const digits = String(c).replace(/[^0-9\-]/g, '');
                  const n = digits === '' ? null : parseInt(digits, 10);
                  if (n && !Number.isNaN(n)) { repairmanId = n; console.debug('Resolved repairmanId from TestGetUserRole candidate:', c, '->', n); break; }
                }
              }
            } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore */ }

        const url = repairmanId ? `/RepairTicket/GetRepairmanWorkSummary?repairman_id=${repairmanId}` : `/RepairTicket/GetRepairmanWorkSummary?rep_name=${encodedName}`;
        const res = await api.get(url);
        if (res && res.data) {
          // Try multiple locations for payload. Server may return ResultSet as an object
          let payload = null;
          if (Array.isArray(res.data.ResultSet)) payload = res.data.ResultSet;
          else if (res.data.ResultSet && typeof res.data.ResultSet === 'object') payload = res.data.ResultSet;
          else if (res.data.Result) payload = (typeof res.data.Result === 'string' ? JSON.parse(res.data.Result || 'null') : res.data.Result);
          else payload = res.data;

          const parsed = parseSummary(payload);
          if (parsed && mounted) setStats(parsed);
        }
      } catch (err) {
        // ignore - preserve local stats
        console.warn('GetRepairmanWorkSummary failed', err && err.message ? err.message : err);
      }

      // set available/my repairs UI from localStorage as before
      // Do not overwrite if API already populated `myRepairs` or `availableRepairs`.
      if (mounted) {
        setAvailableRepairs(prev => (prev && prev.length > 0) ? prev : availableRepairsData.slice(0, 3)); // Show only 3
        setMyRepairs(prev => (prev && prev.length > 0) ? prev : myAssignedRepairs.slice(0, 3)); // Show only 3
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [user.username]);
  

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
      name: 'Assigned Repairs', 
      value: stats.assignedRepairs.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '🔧',
      color: 'blue'
    },
    { 
      name: 'Completed Today', 
      value: stats.completedToday.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '✅',
      color: 'green'
    },
    { 
      name: 'Waiting for Parts', 
      value: stats.waitingForParts.toString(), 
      change: '+0', 
      changeType: 'positive',
      icon: '⏳',
      color: 'yellow'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Waiting for Parts': return 'bg-yellow-100 text-yellow-800';
      case 'Diagnosing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const claimRepair = (ticketId) => {
    const storedTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]');
    const updatedTickets = storedTickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: 'Diagnosing', 
            assignedTo: user.username,
            assignedDate: new Date().toISOString().split('T')[0]
          } 
        : ticket
    );
    
    localStorage.setItem('repairTickets', JSON.stringify(updatedTickets));
    alert('Repair claimed successfully!');
    
    // Refresh data
    const availableRepairsData = updatedTickets.filter(ticket => 
      ticket.status === 'Available'
    );
    setAvailableRepairs(availableRepairsData.slice(0, 3));
  };

  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repair Technician Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {displayName || user.username || user.name || 'Technician'}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <span className="text-gray-500">from yesterday</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Repairs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Repairs</h2>
              <Link 
                to="/repairman/available-repairs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {availableRepairs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Available Repairs</h3>
                <p className="text-gray-600">All repairs are currently assigned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableRepairs.map(ticket => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ticket.brand}</div>
                          <div className="text-sm text-gray-500">{ticket.customerName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{ticket.issue}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => claimRepair(ticket.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Claim Repair
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Repairs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">My Repairs</h2>
              <Link 
                to="/repairman/assigned-repairs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {myRepairs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Assigned Repairs</h3>
                <p className="text-gray-600">Claim repairs from available repairs list.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myRepairs.map(ticket => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ticket.brand}</div>
                          <div className="text-sm text-gray-500">{ticket.customerName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.estimatedCompletion || 'Not set'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairmanDashboard;