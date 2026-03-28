import React, { useState, useEffect } from 'react';

const PartsHistory = () => {
  const [partsRequests, setPartsRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingIds, setApprovingIds] = useState([]);

  // Load parts requests from localStorage
  useEffect(() => {
    let mounted = true;

    const normalize = (item, idx) => {
      const statusVal = item.status || item.Status || '';
      // Normalize short status codes returned by backend (e.g. 'i' / 'w')
      const normalizeStatus = (s) => {
        const st = (s == null) ? '' : String(s).trim();
        const low = st.toLowerCase();
        if (low === 'i') return 'In Progress';
        if (low === 'w') return 'Waiting for Parts';
        if (low === 'c') return 'Completed';
        if (low === 'approved') return 'Approved';
        if (low === 'rejected') return 'Rejected';
        if (low === 'inprogress' || low === 'in progress') return 'In Progress';
        if (low.includes('waiting') && low.includes('part')) return 'Waiting for Parts';
        return st || '';
      };
      // determine active with multiple possible key names
      let activeVal = undefined;
      if (typeof item.active === 'boolean') activeVal = item.active;
      else if (item.active === 'true' || item.active === '1' || item.active === 1) activeVal = true;
      else if (typeof item.isActive === 'boolean') activeVal = item.isActive;
      else if (item.isActive === 'true' || item.isActive === '1' || item.isActive === 1) activeVal = true;
      else if (typeof item.Active === 'boolean') activeVal = item.Active;
      else if (item.Active === 'true' || item.Active === '1' || item.Active === 1) activeVal = true;

      // If active is still undefined infer from status for common final/approved states
      if (typeof activeVal === 'undefined') {
        const finalStates = ['Approved', 'In Progress', 'Completed'];
        activeVal = finalStates.includes(String(statusVal));
      }

      const normalizedStatus = normalizeStatus(statusVal) || 'Waiting for Parts';

      return ({
      id: item.id || item.ID || item.requestId || item.request_id || null,
      // stable unique id for React key and local matching
      uid: item.id || item.ID || item.requestId || item.request_id || item.ticket_id || item.ticketId || `uid_${idx}_${Math.random().toString(36).slice(2,8)}`,
      ticket_id: item.ticket_id || item.ticketId || item.ticket || item.ticket_number || item.TicketID || '',
      partName: item.partName || item.part_name || item.part || '',
      urgency: item.urgency || item.Urgency || 'Normal',
      quantity: item.quantity || item.qty || item.Qty || 0,
      requestdate: item.requestdate || item.requestedDate || item.requested_date || item.requestDate || item.requestedOn || item.requested_on || item.requested_at || item.createdAt || item.created_date || '',
      status: normalizedStatus,
      active: !!activeVal,
      raw: item
    });
    };

    const loadPartsRequests = async () => {
      try {
        const res = await fetch('http://localhost:60748/PartRequest/GetAllPartRequest');
        let list = [];
        if (res && res.ok) {
          const body = await res.json();
          if (Array.isArray(body)) list = body;
          else if (Array.isArray(body.ResultSet)) list = body.ResultSet;
          else if (body.Result) {
            try { list = JSON.parse(body.Result); } catch (e) { list = body.Result; }
          } else if (Array.isArray(body.data)) list = body.data;

          // If server explicitly returned an empty list, respect that and
          // clear any previously-stored local copies so the UI reflects
          // the current empty state instead of showing stale data.
          if (Array.isArray(list) && list.length === 0) {
            try { localStorage.removeItem('partsRequests'); } catch (e) {}
            if (mounted) setPartsRequests([]);
            return;
          }
        }

        if (list && list.length > 0) {
          const normalized = (list || []).map((item, idx) => normalize(item, idx));
          try { localStorage.setItem('partsRequests', JSON.stringify(normalized)); } catch (e) {}
          if (mounted) setPartsRequests(normalized);
          return;
        }

        // If server returned an empty list (no part requests), prefer any existing locally-saved
        // partsRequests so the UI doesn't disappear for users who have local requests stored.
        // This covers the case where the backend may be temporarily empty but the client has
        // previously saved requests in localStorage.
        try {
          const storedRequests = JSON.parse(localStorage.getItem('partsRequests') || '[]');
          if (Array.isArray(storedRequests) && storedRequests.length > 0) {
            const normalizedStored = storedRequests.map((item, idx) => normalize(item, idx));
            if (mounted) setPartsRequests(normalizedStored);
            return;
          }
        } catch (e) {
          // ignore and fall through to the normal fallback below
        }
      } catch (err) {
        console.warn('GetAllPartRequest failed, falling back to localStorage', err && err.message ? err.message : err);
      }

      // fallback to localStorage
      try {
        const storedRequests = JSON.parse(localStorage.getItem('partsRequests') || '[]');
        const normalizedStored = (storedRequests || []).map((item, idx) => normalize(item, idx));
        if (mounted) setPartsRequests(normalizedStored);
      } catch (e) {
        console.error('Failed to load partsRequests from localStorage', e);
        if (mounted) setPartsRequests([]);
      }
    };

    loadPartsRequests();
    const interval = setInterval(loadPartsRequests, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const formatDate = (val) => {
    if (!val) return '';
    try {
      if (typeof val === 'string' && val.indexOf('T') !== -1) return val.split('T')[0];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      // try common formats like 10/8/2025 8:35:35 AM -> convert
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) return new Date(parsed).toISOString().split('T')[0];
      return String(val);
    } catch (e) { return String(val); }
  };

  const statusOptions = ['All', 'Waiting for Parts', 'Completed'];

  const filteredByStatus = filterStatus === 'All'
    ? partsRequests
    : partsRequests.filter(request => request.status === filterStatus);

  const trimmedSearch = (searchTerm || '').trim().toLowerCase();
  const filteredRequests = trimmedSearch
    ? filteredByStatus.filter(request => {
        const pn = (request.partName || request.part_name || request.part || (request.raw && (request.raw.part_name || request.raw.part || request.raw.PartName)) || '').toString().toLowerCase();
        return pn.indexOf(trimmedSearch) !== -1;
      })
    : filteredByStatus;

  const toggleActiveStatus = (uid) => {
    const updatedRequests = partsRequests.map(request => 
      request.uid === uid ? { ...request, active: !request.active } : request
    );
    setPartsRequests(updatedRequests);
    localStorage.setItem('partsRequests', JSON.stringify(updatedRequests));
  };

  

  // edit flow retained for future use

  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    const original = partsRequests.find(r => r.uid === editingRequest.uid) || {};
    const raw = original.raw || {};

    const equal = (a, b) => {
      if (a === b) return true;
      if (a == null && b == null) return true;
      if (typeof a === 'number' && typeof b === 'string') return String(a) === b;
      if (typeof b === 'number' && typeof a === 'string') return a === String(b);
      try {
        const da = a ? new Date(a) : null;
        const db = b ? new Date(b) : null;
        if (da && db && !isNaN(da.getTime()) && !isNaN(db.getTime())) {
          return da.toISOString().split('T')[0] === db.toISOString().split('T')[0];
        }
      } catch (e) {}
      return false;
    };

    const changed = {};
    if (!equal(editingRequest.partName, raw.partName ?? raw.part_name ?? raw.PartName)) changed.part_name = editingRequest.partName ?? editingRequest.part_name;
    if (!equal(editingRequest.quantity, raw.quantity ?? raw.qty ?? raw.Quantity)) changed.quantity = editingRequest.quantity;
    if (!equal(editingRequest.urgency, raw.urgency ?? raw.Urgency)) changed.urgency = editingRequest.urgency;
    if (!equal(editingRequest.requestdate, raw.requestdate ?? raw.requestedDate ?? raw.RequestDate)) changed.requestdate = editingRequest.requestdate;
    if (!equal(editingRequest.status, raw.status ?? raw.Status)) changed.status = editingRequest.status;
    if (!equal(editingRequest.active, raw.active ?? (raw.active === 'true' || raw.active === true))) {
      changed.active = editingRequest.active;
      changed.actions = editingRequest.active ? 'Active' : 'Inactive';
    }

    // identifier: prefer ticket_id (DB column), else id
    const idVal = original.ticket_id || original.id || raw.ticket_id || raw.id || null;
    if (idVal) changed.ticket_id = idVal;

    // Some DB columns are NOT NULL (e.g. brand_name). If backend expects them,
    // include their existing values when user didn't change them so UPDATE won't fail.
    // Map part name to brand_name (common in your schema) if missing.
    const existingBrand = (original.raw && (original.raw.brand_name || original.raw.part_name || original.raw.part || original.brand_name)) || original.partName || original.part_name || '';
    if (!changed.brand_name) {
      // prefer the edited value if user changed the part name
      if (changed.part_name) changed.brand_name = changed.part_name;
      else if (editingRequest.partName) changed.brand_name = editingRequest.partName;
      else if (existingBrand) changed.brand_name = existingBrand;
    }
    // also ensure part_name is present for backend if it uses that column
    if (!changed.part_name) {
      if (changed.brand_name) changed.part_name = changed.brand_name;
      else if (editingRequest.partName) changed.part_name = editingRequest.partName;
      else if (existingBrand) changed.part_name = existingBrand;
    }

    // Ensure requestdate is present (DB column 'requestdate' is NOT NULL)
    if (!Object.prototype.hasOwnProperty.call(changed, 'requestdate') || changed.requestdate == null || changed.requestdate === '') {
      const existingDate = (editingRequest && (editingRequest.requestdate || editingRequest.requestedDate)) || original.requestdate || original.requestedDate || raw.requestdate || raw.requestedDate || '';
      if (existingDate) {
        changed.requestdate = existingDate;
      } else {
        // fallback to today's date (ISO yyyy-mm-dd)
        changed.requestdate = new Date().toISOString().split('T')[0];
      }
    }

    // Ensure urgency and status present to avoid NOT NULL failures
    if (!Object.prototype.hasOwnProperty.call(changed, 'urgency')) {
      changed.urgency = (editingRequest && (editingRequest.urgency || editingRequest.Urgency)) || original.urgency || original.Urgency || raw.urgency || raw.Urgency || 'Normal';
    }
    if (!Object.prototype.hasOwnProperty.call(changed, 'status')) {
      changed.status = (editingRequest && (editingRequest.status || editingRequest.Status)) || original.status || original.Status || raw.status || raw.Status || 'Waiting for Parts';
    }

    // Ensure quantity is present (DB column 'quantity' is NOT NULL in your schema)
    if (!Object.prototype.hasOwnProperty.call(changed, 'quantity')) {
      const existingQty = (editingRequest && (typeof editingRequest.quantity !== 'undefined' ? editingRequest.quantity : undefined)) ?? original.quantity ?? raw.quantity ?? raw.qty ?? 0;
      changed.quantity = existingQty;
    }

    if (Object.keys(changed).length === 0) {
      alert('No changes to save.');
      return;
    }

    if (!changed.ticket_id) {
      alert('Cannot save: missing ticket identifier (ticket_id).');
      return;
    }

    // log outgoing payload for debugging
    console.log('UpdatePartRequest payload:', changed);

    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:60748/PartRequest/UpdatePartRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changed)
      });

      const text = await res.text();
      let body = null;
      try { body = JSON.parse(text); } catch (e) { body = text; }
      console.log('UpdatePartRequest response:', res.status, body);

      if (!res.ok) {
        alert('Failed to save changes. Server returned ' + res.status);
        return;
      }

      // update local state with edited values
      const updatedRequests = partsRequests.map(request =>
        request.uid === editingRequest.uid ? { ...request, ...editingRequest, raw: { ...request.raw, ...editingRequest } } : request
      );
      setPartsRequests(updatedRequests);
      try { localStorage.setItem('partsRequests', JSON.stringify(updatedRequests)); } catch (e) {}

      setEditingRequest(null);
      alert('Part request updated successfully.');
    } catch (err) {
      console.error('UpdatePartRequest error', err);
      alert('Failed to save changes. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditingRequest({
      ...editingRequest,
      [field]: value
    });
  };

  // Approve / Reject handlers
  const handleApprove = async (request) => {
    if (!request) return;
    const idVal = request.ticket_id || request.id || (request.raw && (request.raw.ticket_id || request.raw.id));
    if (!idVal) { alert('Cannot approve: missing ticket identifier.'); return; }
    if (!window.confirm('Approve this part request?')) return;

    const uid = request.uid;
    setApprovingIds(prev => [...prev, uid]);
    try {
      const partName = (request.raw && (request.raw.part_name || request.raw.part || request.raw.PartName)) || request.partName || request.part_name || request.part || '';
      const brand = (request.raw && (request.raw.brand_name || request.raw.brand || request.raw.brandName)) || request.brand_name || request.brand || '';
      const qty = typeof request.quantity !== 'undefined' && request.quantity !== null ? request.quantity : (request.qty || (request.raw && (request.raw.quantity || request.raw.qty)) || 0);
      const requestDate = (request.requestdate || request.requestedDate || request.requested_date || (request.raw && (request.raw.requestdate || request.raw.requestedDate || request.raw.requested_date))) || new Date().toISOString().split('T')[0];

      const payload = { ActionType: 6, ticket_id: Number(idVal), brand_name: brand, part_name: partName, quantity: qty, requestdate: requestDate, status: 'Approved' };
      console.log('Approve payload', payload);

      const res = await fetch('http://localhost:60748/PartRequest/IssuePart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      if (!res.ok) {
        console.error('Approve failed', res.status, body);
        alert('Failed to approve. Server returned ' + res.status);
        return;
      }

  const updated = partsRequests.map(r => r.uid === uid ? { ...r, status: 'In Progress', active: true, raw: { ...r.raw, status: 'In Progress', active: true } } : r);
      setPartsRequests(updated);
      try { localStorage.setItem('partsRequests', JSON.stringify(updated)); } catch (e) {}
    } catch (err) {
      console.error('Approve error', err);
      alert('Failed to approve. See console for details.');
    } finally {
      setApprovingIds(prev => prev.filter(x => x !== uid));
    }
  };

  

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Waiting for Parts': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Normal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Parts Request History</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Filter by Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="ml-4 flex-1">
              <input
                type="text"
                placeholder="Search Part Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Parts Requests Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Parts Requests</h2>
          
          {partsRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Parts Requests</h3>
              <p className="text-gray-600">Parts requests from repairmen will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(request.ticket_id || request.ticketId || request.ticket || request.ticket_number) || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <input
                            type="text"
                            value={editingRequest.partName || editingRequest.part_name || ''}
                            onChange={(e) => handleEditChange('partName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          request.partName || request.part_name || request.part || ''
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(request.raw && (request.raw.brand_name || request.raw.brand || request.raw.brandName)) || request.brand_name || request.brand || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <select
                            value={editingRequest.urgency}
                            onChange={(e) => handleEditChange('urgency', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(request.urgency || request.Urgency)}`}>
                            {request.urgency || request.Urgency}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <input
                            type="number"
                            value={editingRequest.quantity}
                            onChange={(e) => handleEditChange('quantity', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          request.quantity || request.qty || ''
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <input
                            type="date"
                            value={editingRequest.requestdate || editingRequest.requestedDate || editingRequest.requested_date || ''}
                            onChange={(e) => handleEditChange('requestdate', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          formatDate(request.requestdate || request.requestedDate || request.requested_date || request.requestedDate || '')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <select
                            value={editingRequest.status}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Waiting for Parts">Waiting for Parts</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          // when editing, allow changing active state via select
                          <select
                            value={editingRequest.active ? 'true' : 'false'}
                            onChange={(e) => handleEditChange('active', e.target.value === 'true')}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => toggleActiveStatus(request.uid)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                              request.active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {request.active ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingRequest && editingRequest.uid === request.uid ? (
                          <div className="space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className={`text-green-600 hover:text-green-900 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingRequest(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            {(() => {
                              const finalStatuses = ['Completed', 'Approved', 'Rejected'];
                              const isFinal = finalStatuses.includes(request.status);
                              const isApproving = approvingIds.includes(request.uid);
                              return (
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={isFinal || isApproving}
                                  className={`mr-3 ${(isFinal || isApproving) ? 'opacity-50 cursor-not-allowed' : 'text-green-600 hover:text-green-900'}`}
                                >
                                  {isApproving ? 'Approving...' : 'Approve'}
                                </button>
                              );
                            })()}
                          </div>
                        )}
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
  );
};

export default PartsHistory;