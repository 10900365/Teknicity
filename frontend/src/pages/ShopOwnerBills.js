import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ShopOwnerBills = () => {
  const [completedRepairs, setCompletedRepairs] = useState([]);
  const [bills, setBills] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showRepairDetails, setShowRepairDetails] = useState(false);
  const [newBill, setNewBill] = useState({
    partsCost: '',
    laborCost: '',
    tax: '',
    total: '',
    notes: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const formatNumberDisplay = (val) => {
    if (val === '' || val === null || typeof val === 'undefined') return '';
    const n = Number(val || 0);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // normalizeBill is used in multiple places (useEffect and createBill), so keep it at
  // component scope rather than nested in useEffect.
  const normalizeBill = (item) => ({
    // server may return different field names; normalize to a stable shape
    id: item.id || item.ID || item.billId || item.BillID || item.bill_id || null,
    // prefer explicit ticket fields; if missing, fall back to any pass/pass_code variants
    ticketId: item.ticketid || item.ticket_id || item.TicketID || item.repairId || item.repair_id || item.ticketId || item.pass || item.Pass || item.pass_code || item.PassCode || (item.ticket_id ? item.ticket_id : ''),
    ticket_id: item.ticket_id || item.ticketid || item.TicketID || item.ticketId || item.pass || item.Pass || item.pass_code || item.PassCode || '',
    customerName: item.customer_name || item.customer || item.customerName || (item.customerName && typeof item.customerName === 'string' ? item.customerName : ''),
    customerPhone: item.customer_phone || item.customerPhone || item.phone || item.phone_no || item.msisdn || item.mobile || '',
    device: item.device || item.Device || (item.brand ? `${item.brand} ${item.model || ''}`.trim() : ''),
  // map issue from common server field names so printed bills show the issue text
  issue: item.issue || item.issue_description || item.problem || item.Overview || item.overview || '',
    // map parts/labor/tax variants so UI and printing can display them
    partsCost: Number(item.parts_cost || item.partsCost || item.parts || item.Parts || 0) || 0,
    laborCost: Number(item.labor_cost || item.laborCost || item.labor || item.Labor || 0) || 0,
    tax: Number(item.tax || item.tax_amount || item.taxAmount || 0) || 0,
    totalAmount: Number(item.total_amount || item.total || item.totalAmount || 0) || 0,
    status: item.status || item.Status || 'Pending',
    pass: item.pass || item.Pass || item.pass_code || item.PassCode || '',
    raw: item
  });

  // Load completed repairs from server (with localStorage fallback)
  useEffect(() => {
    let mounted = true;

      const normalize = (item) => ({
      id: item.ticket_id || item.TicketID || item.ticketNo || item.ticket_number || item.id || item.Id || item.TicketID || '',
      brand: item.brand || item.device || item.device_brand || item.brand_name || '',
      model: item.model || item.device_model || item.model_name || '',
      issue: item.issue || item.issue_description || item.problem || item.Overview || '',
      customerName: item.customer_name || item.customer || item.customerName || item.name || '',
      customerPhone: item.phone_no || item.phone || item.customer_phone || item.customerPhone || item.mobile || item.msisdn || '',
      status: (item.status || item.Status || '').toString(),
      imei: item.imei || item.IMEI || item.device_imei || '',
      completedAt: item.completed_date || item.completedAt || item.completedOn || item.completed_on || item.ClosedDate || item.created_date || '',
      raw: item
    });
    

  const loadData = async () => {
  const storedBillsRaw = JSON.parse(localStorage.getItem('repairBills') || '[]');
  // clean stored bills: dedupe by ticket/reapir/id and ignore entries without a key
  const storedBills = (Array.isArray(storedBillsRaw) ? storedBillsRaw : []).filter(Boolean);
  const keyForLocal = (b) => String(b && (b.ticketId || b.ticket_id || b.repairId || b.id || '')).trim();
  const seenLocal = new Set();
  const storedBillsClean = [];
  for (const sb of storedBills) {
    const k = keyForLocal(sb);
    if (!k) continue; // ignore items without a key to avoid duplicate-null entries
    if (seenLocal.has(k)) continue;
    seenLocal.add(k);
    storedBillsClean.push(sb);
  }

      try {
        const res = await api.get('http://localhost:60748/RepairTicket/GetCompletedRepairTickets');

        let list = [];
        if (res && res.data) {
          // handle multiple shapes
          if (Array.isArray(res.data)) list = res.data;
          else if (Array.isArray(res.data.ResultSet)) list = res.data.ResultSet;
          else if (res.data.Result) {
            try { list = JSON.parse(res.data.Result); } catch (e) { list = res.data.Result; }
          } else if (Array.isArray(res.data.data)) list = res.data.data;
        }

  const normalized = (list || []).map(normalize);
        try { localStorage.setItem('repairTickets', JSON.stringify(normalized)); } catch (e) { /* ignore */ }

        // prefer server-side completed tickets; include items where status indicates completion
        const completed = normalized.filter(t => {
          const s = (t.status || '').toString().toLowerCase();
          const hasCompletedFlag = s.indexOf('completed') !== -1 || s.indexOf('done') !== -1 || s.indexOf('closed') !== -1;
          return hasCompletedFlag || (t.completedAt || '').toString().trim() !== '';
        });

        // We'll compute completed tickets without bills after we fetch server bills below
        // temporarily hold the completed list until we know which tickets have server bills
        const completedList = completed;

        // Try to load bills from server endpoint CustomerBill/GetAllCustomerBills
        try {
          const billRes = await api.get('http://localhost:60748/CustomerBill/GetAllCustomerBills');
          let billList = [];
          if (billRes && billRes.data) {
            if (Array.isArray(billRes.data)) billList = billRes.data;
            else if (Array.isArray(billRes.data.ResultSet)) billList = billRes.data.ResultSet;
            else if (billRes.data.Result) {
              try { billList = JSON.parse(billRes.data.Result); } catch (e) { billList = billRes.data.Result; }
            } else if (Array.isArray(billRes.data.data)) billList = billRes.data.data;
          }

          const normalizedBillsFromServer = (billList || []).map(normalizeBill);
          // If server returned an explicit empty list (successful call but no rows),
          // clear local stored bills to avoid showing stale/duplicated local records.
          if (mounted && normalizedBillsFromServer.length === 0) {
            // no server bills -> all completed repairs are available for billing
            if (mounted) setCompletedRepairs(completedList || []);
            setBills([]);
            try { localStorage.setItem('repairBills', JSON.stringify([])); } catch (e) { /* ignore */ }
            return;
          }

          if (mounted && normalizedBillsFromServer.length > 0) {
            // Merge server bills with local bills, but remove provisional local rows that the server now has.
            const byKey = new Map();
            const keyFor = (b) => String(b.ticketId || b.ticket_id || b.repairId || b.id || '');

            normalizedBillsFromServer.forEach(b => {
              const k = keyFor(b);
              if (!k) return; // ignore server items without a key
              if (!byKey.has(k)) byKey.set(k, b);
            });

            // Build set of server repair keys to detect provisional locals that should be dropped
            const serverRepairKeys = new Set((normalizedBillsFromServer || []).map(b => String(b.repairId || b.pass || b.ticketId || b.ticket_id || '')));

            // merge only cleaned stored bills; drop provisional local rows (id starting with 'local-') that match server repairs
            (storedBillsClean || []).forEach(local => {
              const isLocal = String((local && local.id) || '').startsWith('local-');
              const localRepairKey = String((local && (local.repairId || local.pass || local.ticketId || local.ticket_id)) || '');
              if (isLocal && localRepairKey && serverRepairKeys.has(localRepairKey)) {
                // server has this repair's bill now, skip the provisional local entry
                return;
              }

              const k = keyFor(local);
              if (!k) return;
              if (!byKey.has(k)) {
                // prefer local object if server doesn't have it
                byKey.set(k, local);
              } else {
                // if server has the bill but lacks a ticketId, try to backfill from local
                const serverItem = byKey.get(k);
                if ((!serverItem.ticketId || serverItem.ticketId === '') && (local.ticketId || local.ticket_id)) {
                  serverItem.ticketId = local.ticketId || local.ticket_id;
                  serverItem.ticket_id = serverItem.ticket_id || local.ticket_id || local.ticketId;
                }
                // also preserve totalAmount if server missing it
                if ((serverItem.totalAmount === undefined || serverItem.totalAmount === 0) && (local.totalAmount || local.total)) {
                  serverItem.totalAmount = local.totalAmount || local.total;
                }
              }
            });

            // Show only server-provided bills (do not mix with local provisional rows)
            const serverOnly = (normalizedBillsFromServer || []).slice();
            setBills(serverOnly);
            try { localStorage.setItem('repairBills', JSON.stringify(serverOnly)); } catch (e) { /* ignore */ }
            // compute completed repairs that do not yet have server bills
            try {
              const completedWithoutBills = (completedList || []).filter(ticket => !serverOnly.some(b => String(b.repairId) === String(ticket.id)));
              if (mounted) setCompletedRepairs(completedWithoutBills || []);
            } catch (e) { if (mounted) setCompletedRepairs([]); }
          } else if (mounted) {
            // fallback to stored bills if server returned none
            setBills(storedBills);
          }
        } catch (e) {
          // server call failed, use localStorage bills
          if (mounted) setBills(storedBills);
        }
        return;
      } catch (err) {
        console.warn('GetCompletedRepairTickets failed; server unavailable', err && err.message ? err.message : err);
        // Per request: show only server-side data. When server is unavailable we show no bills/completed repairs.
        if (mounted) {
          setCompletedRepairs([]);
          setBills([]);
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // format completed date to yyyy-mm-dd when possible
  const formatDate = (val) => {
    if (!val) return '';
    try {
      if (typeof val === 'string' && val.indexOf('T') !== -1) return val.split('T')[0];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      return String(val).split('T')[0];
    } catch (e) { return String(val); }
  };

  const openBillForm = (repair) => {
    setSelectedRepair(repair);
    // initialize empty while we fetch labor cost
    setNewBill({
      partsCost: '',
      laborCost: '',
      tax: '',
      total: '',
      notes: ''
    });
    setShowBillForm(true);

    // Fetch ticket usage cost from the UsageReport endpoint and set laborCost
    (async () => {
      try {
        const ticketId = repair && (repair.id || repair.ticketId || repair.ticket_id || repair.pass) ? (repair.id || repair.ticketId || repair.ticket_id || repair.pass) : null;
        if (!ticketId) return;
        const res = await api.get(`http://localhost:60748/UsageReport/GetTicketUsageCost?ticket_id=${encodeURIComponent(ticketId)}`);
        let payload = res && res.data ? res.data : null;

        // Prefer explicit GrandTotal when present (many endpoints return it under ResultSet)
        let sum = 0;
        const rs = payload && payload.ResultSet ? payload.ResultSet : payload;
        const maybeGrand = rs && (rs.GrandTotal || rs.grandTotal || rs.grand_total || rs.Grandtotal);
        if (typeof maybeGrand !== 'undefined' && String(maybeGrand).trim() !== '') {
          const parsed = Number(String(maybeGrand).replace(/,/g, ''));
          if (Number.isFinite(parsed)) {
            sum = parsed;
          }
        }

        // If GrandTotal wasn't available, fall back to summing item totals / price fields
        if (sum === 0) {
          let items = [];
          if (!payload) items = [];
          else if (Array.isArray(payload)) items = payload;
          else if (Array.isArray(payload.ResultSet)) items = payload.ResultSet;
          else if (payload.Result) {
            try { items = typeof payload.Result === 'string' ? JSON.parse(payload.Result) : payload.Result; } catch (e) { items = payload.Result; }
          } else if (Array.isArray(payload.data)) items = payload.data;
          else if (rs && Array.isArray(rs.Items)) items = rs.Items;
          else items = [payload];

          const values = (items || []).map(it => Number(it && (it.TotalPrice || it.totalPrice || it.total_price || it.price || it.total) ) || 0);
          sum = values.reduce((a, b) => a + b, 0);
        }

        // If sum is > 0, put that value into Parts Cost (replace) and recalc total
        if (sum > 0) {
          setNewBill(prev => {
            const apiParts = sum;
            const labor = prev.laborCost === '' ? 0 : Number(prev.laborCost || 0);
            const tax = prev.tax === '' ? 0 : Number(prev.tax || 0);
            const total = apiParts + labor + tax;
            return { ...prev, partsCost: apiParts, total: total };
          });
        }
      } catch (e) {
        // ignore fetch errors — allow manual entry
        console.debug('GetTicketUsageCost failed', e && e.message ? e.message : e);
      }
    })();
  };

  const openRepairDetails = (repair) => {
    setSelectedRepair(repair);
    setShowRepairDetails(true);
  };
  
  const handleBillChange = (e) => {
    const { name, value } = e.target;
    // For numeric fields allow empty string (so inputs don't show 0 by default).
    const isNotes = name === 'notes';
    let fieldValue;
    if (isNotes) {
      fieldValue = value;
    } else {
      // strip commas from formatted input
      const raw = String(value).replace(/,/g, '').trim();
      if (raw === '') fieldValue = '';
      else {
        const n = parseFloat(raw);
        fieldValue = Number.isFinite(n) ? n : '';
      }
    }

    const updatedBill = {
      ...newBill,
      [name]: fieldValue
    };

    // Calculate total as a number but show empty when all parts are empty
    const p = updatedBill.partsCost === '' ? 0 : Number(updatedBill.partsCost || 0);
    const l = updatedBill.laborCost === '' ? 0 : Number(updatedBill.laborCost || 0);
    const t = updatedBill.tax === '' ? 0 : Number(updatedBill.tax || 0);
    const totalNumber = p + l + t;
    updatedBill.total = (p === 0 && l === 0 && t === 0) ? '' : totalNumber;

    setNewBill(updatedBill);
  };

  const createBill = (e) => {
    e.preventDefault();
    
    if (!selectedRepair) return;
  // per user preference: do not create provisional local bills; only create when server responds.

    // Build a minimal, robust payload for the server. Send only the fields the backend typically needs
    // and coerce numeric fields to numbers to avoid validation/type issues server-side.
    const serverPayload = {
      // Link to existing repair/ticket by id (important)
      repairId: Number(selectedRepair.id) || selectedRepair.id,
      pass: Number(selectedRepair.id) || selectedRepair.id,
      // Customer / device / issue
      // include both camelCase and snake_case forms since the backend appears to expect
      // `customer_name` as NOT NULL. Provide fallbacks from raw when available.
  customerName: selectedRepair.customerName || (selectedRepair.raw && (selectedRepair.raw.customer_name || selectedRepair.raw.customer || selectedRepair.raw.name)) || '',
  customer_name: selectedRepair.customerName || (selectedRepair.raw && (selectedRepair.raw.customer_name || selectedRepair.raw.customer || selectedRepair.raw.name)) || '',
  // include multiple phone field variants. Prefer selectedRepair.customerPhone, then raw variants.
  customerPhone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.customer_phone || selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
  customer_phone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.customer_phone || selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
  phone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.phone || selectedRepair.raw.phone_no || selectedRepair.raw.customer_phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
  phone_no: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.customer_phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
  msisdn: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.msisdn || selectedRepair.raw.mobile || selectedRepair.raw.phone || selectedRepair.raw.phone_no)) || '',
      device: `${selectedRepair.brand || ''} ${selectedRepair.model || ''}`.trim(),
      issue: selectedRepair.issue || '',
      // Amounts (coerced to numbers)
      parts_cost: Number(newBill.partsCost) || 0,
      labor_cost: Number(newBill.laborCost) || 0,
      tax: Number(newBill.tax) || 0,
      total_amount: Number(newBill.total) || 0,
      // Notes
      notes: newBill.notes || ''
    };

    try { console.debug('AddCustomerBill serverPayload:', serverPayload); } catch (e) { }

    setIsCreating(true);
    (async () => {
      try {
        const res = await api.post('http://localhost:60748/CustomerBill/AddCustomerBill', serverPayload, {
          headers: { 'Content-Type': 'application/json' }
        });
        try { console.debug('AddCustomerBill response:', res && res.data ? res.data : res); } catch (e) { }

        // Treat any 2xx status as success to be more resilient to server response shapes
        // Consider the HTTP status and also guard against servers that return a 200 HTTP
        // response but include an application-level StatusCode in the body (e.g. { StatusCode: 500 }).
        const ok = res && res.status >= 200 && res.status < 300 && (
          !res.data || typeof res.data.StatusCode === 'undefined' || res.data.StatusCode === 200 || res.data.success === true
        );
        let serverAssignedId = null;
        if (ok) {
          // attempt to read id from server response across several possible shapes
          try {
            const d = res && res.data ? res.data : null;
            if (d) {
              serverAssignedId = d.id || d.insertId || d.ID || null;
              if (!serverAssignedId && Array.isArray(d.ResultSet) && d.ResultSet.length > 0) {
                serverAssignedId = d.ResultSet[0].id || d.ResultSet[0].ID || d.ResultSet[0].insertId || null;
              }
              if (!serverAssignedId && d.Result) {
                try {
                  const parsed = typeof d.Result === 'string' ? JSON.parse(d.Result) : d.Result;
                  serverAssignedId = (parsed && (parsed.id || parsed.insertId || parsed.ID)) || serverAssignedId;
                } catch (e) {
                  // ignore parse
                }
              }
              if (!serverAssignedId && d.data) {
                serverAssignedId = d.data.id || d.data.insertId || d.data.ID || serverAssignedId;
              }
            }
            // final fallback: if response body itself is a primitive id
            if (!serverAssignedId && res && (typeof res.data === 'string' || typeof res.data === 'number')) {
              serverAssignedId = String(res.data);
            }
          } catch (e) {
            serverAssignedId = null;
          }
          if (serverAssignedId) serverAssignedId = String(serverAssignedId);
        }

        // If server accepted the bill, persist server data locally (including phone). If server returned success
        // but did not provide an id, we still treat it as server-saved and keep ticket fields as selectedRepair.id
        if (ok) {
          const clientId = serverAssignedId || selectedRepair.id;
          const newBillData = {
            id: clientId,
            repairId: selectedRepair.id,
            pass: selectedRepair.id,
            ticketId: selectedRepair.id,
            ticket_id: selectedRepair.id,
            customerName: selectedRepair.customerName,
            customerPhone: selectedRepair.customerPhone,
            device: `${selectedRepair.brand} ${selectedRepair.model}`,
            issue: selectedRepair.issue,
            partsCost: Number(newBill.partsCost) || 0,
            laborCost: Number(newBill.laborCost) || 0,
            tax: Number(newBill.tax) || 0,
            total: Number(newBill.total) || 0,
            notes: newBill.notes || '',
            createdAt: new Date().toISOString().split('T')[0],
            status: 'Pending Payment',
            rawResponse: res && res.data ? res.data : null
          };

          // avoid duplicates: if a bill for this repair/ticket already exists, update it instead of appending
          const existsIndex = bills.findIndex(b => String(b.repairId) === String(selectedRepair.id) || String(b.pass) === String(selectedRepair.id) || String(b.id) === String(clientId));
          let updatedBills;
          if (existsIndex !== -1) {
            updatedBills = bills.slice();
            updatedBills[existsIndex] = { ...updatedBills[existsIndex], ...newBillData };
          } else {
            updatedBills = [...bills, newBillData];
          }

          // Persist tentative local view
          setBills(updatedBills);
          try { localStorage.setItem('repairBills', JSON.stringify(updatedBills)); } catch (e) { /* ignore */ }

          // Try to refresh bills from server to ensure UI matches server-side state
          try {
            const billResAfter = await api.get('http://localhost:60748/CustomerBill/GetAllCustomerBills');
            let billListAfter = [];
            if (billResAfter && billResAfter.data) {
              if (Array.isArray(billResAfter.data)) billListAfter = billResAfter.data;
              else if (Array.isArray(billResAfter.data.ResultSet)) billListAfter = billResAfter.data.ResultSet;
              else if (billResAfter.data.Result) {
                try { billListAfter = JSON.parse(billResAfter.data.Result); } catch (e) { billListAfter = billResAfter.data.Result; }
              } else if (Array.isArray(billResAfter.data.data)) billListAfter = billResAfter.data.data;
            }
            const normalizedBillsAfter = (billListAfter || []).map(normalizeBill);
            if (normalizedBillsAfter.length > 0) {
              // If server didn't return the new bill id earlier, try to find it in the freshly fetched list.
              if (!serverAssignedId) {
                // Prefer bills that match the repair/ticket id
                let found = normalizedBillsAfter.find(b => String(b.repairId) === String(selectedRepair.id) || String(b.pass) === String(selectedRepair.id) || String(b.ticketId) === String(selectedRepair.id) || String(b.ticket_id) === String(selectedRepair.id));
                // Fallback: match by customer phone/name and pick the most recent
                if (!found) {
                  const sameCustomer = normalizedBillsAfter.filter(b => (b.customerPhone && selectedRepair.customerPhone && String(b.customerPhone) === String(selectedRepair.customerPhone)) || (b.customerName && selectedRepair.customerName && String(b.customerName) === String(selectedRepair.customerName)));
                  if (sameCustomer.length > 0) {
                    sameCustomer.sort((a, b) => {
                      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      if (tb !== ta) return tb - ta;
                      // fallback to numeric id if available
                      const ia = Number(a.id) || 0;
                      const ib = Number(b.id) || 0;
                      return ib - ia;
                    });
                    found = sameCustomer[0];
                  }
                }

                if (found && found.id) {
                  serverAssignedId = String(found.id);
                }
              }

              // Merge server bills with any remaining non-provisional local bills.
              // Also remove provisional local rows (id starting with 'local-') that match this repair.
              let storedLocal = [];
              try { storedLocal = JSON.parse(localStorage.getItem('repairBills') || '[]') || []; } catch (e) { storedLocal = []; }

              const cleanedLocal = (storedLocal || []).filter(lb => {
                try {
                  const isLocal = String((lb && lb.id) || '').startsWith('local-');
                  const sameRepair = String((lb && (lb.repairId || lb.pass || lb.ticketId || lb.ticket_id || lb.id)) || '') === String(selectedRepair.id);
                  // Filter out provisional local rows for this repair
                  if (isLocal && sameRepair) return false;
                  return true;
                } catch (e) { return true; }
              });

              // Build map keyed by ticket/repair/id to avoid duplicates
              const byKey = new Map();
              const keyFor = (b) => String(((b && (b.ticketId || b.ticket_id || b.repairId || b.id)) || '')).trim();
              (normalizedBillsAfter || []).forEach(b => {
                const k = keyFor(b);
                if (!k) return;
                if (!byKey.has(k)) byKey.set(k, b);
              });
              (cleanedLocal || []).forEach(local => {
                const k = keyFor(local);
                if (!k) return;
                if (!byKey.has(k)) byKey.set(k, local);
              });

              // Prefer to show only the server-provided bills here — replace any local provisional rows.
              setBills(normalizedBillsAfter);
              try { localStorage.setItem('repairBills', JSON.stringify(normalizedBillsAfter)); } catch (e) { /* ignore */ }
              // Remove this repair from completedRepairs since it's now billed on server
              try { setCompletedRepairs(prev => (prev || []).filter(t => String(t.id) !== String(selectedRepair.id))); } catch (e) { /* ignore */ }
            }
          } catch (e) {
            // ignore - we already updated the local view above
          }

          // Bill created successfully on server — attempt to notify customer via SMS.
          setShowBillForm(false);
          // Prefer the repair/ticket id (pass) when notifying via SMS — the SMS endpoint expects the ticket/pass value,
          // not the newly-created bill id. Fall back to serverAssignedId only if ticket id is missing.
          const idToSend = selectedRepair.id || serverAssignedId;
          if (idToSend) {
            try {
              const smsResult = await sendSMSNotification(idToSend);
              // try to update repair ticket status (best-effort)
              let statusResult = null;
              try {
                statusResult = await updateRepairTicketStatus(idToSend);
              } catch (e) {
                statusResult = { success: false, error: e };
              }

              const smsOk = smsResult && smsResult.success;
              const statusOk = statusResult && statusResult.success;

              if (smsOk && statusOk) {
                alert('Bill created successfully, customer notified via SMS, and ticket marked Payment Process.');
              } else {
                const parts = [];
                if (!smsOk) parts.push('SMS not sent');
                if (!statusOk) parts.push('Ticket status update failed');
                const msg = parts.join('; ') || 'Unknown issue. Check logs.';
                alert('Bill created. ' + msg + '.');
              }
            } catch (e) {
              // Attempt status update even if SMS call threw
              try { await updateRepairTicketStatus(idToSend); } catch (ee) { /* ignore */ }
              alert('Bill created, but SMS notification failed: ' + (e && e.message ? e.message : String(e)));
            }
          } else {
            // no ticket id to send — still try to update server with repair id if possible
            alert('Bill created successfully.');
          }
          return;
        }

        // If we reach here the server responded but indicated failure.
        console.warn('AddCustomerBill server responded with non-ok status', res && res.status, res && res.data);
        throw new Error('Server returned non-ok response');
      } catch (err) {
        // Server call failed — per user preference we do not create local provisional rows; inform user.
        console.warn('AddCustomerBill failed, server unavailable', err && err.message ? err.message : err);
        // Attempt to still send SMS using the ticket/pass value so both endpoints are invoked as requested.
        try {
          const idToSendOnError = (selectedRepair && (selectedRepair.id || selectedRepair.pass)) ? (selectedRepair.id || selectedRepair.pass) : null;
          if (idToSendOnError) {
            try {
                const smsResultOnError = await sendSMSNotification(idToSendOnError);
                // attempt to update repair ticket status even if bill creation failed
                let statusResultOnError = null;
                try {
                  statusResultOnError = await updateRepairTicketStatus(idToSendOnError);
                } catch (e) {
                  statusResultOnError = { success: false, error: e };
                }

                const smsOk = smsResultOnError && smsResultOnError.success;
                const statusOk = statusResultOnError && statusResultOnError.success;

                if (smsOk && statusOk) {
                  alert('Bill creation failed on server, but SMS was sent and ticket marked Payment Process.');
                } else {
                  const parts = [];
                  if (!smsOk) parts.push('SMS not sent');
                  if (!statusOk) parts.push('Ticket status update failed');
                  const msg = parts.join('; ') || 'Unknown issue. Check logs.';
                  alert('Bill creation failed on server. ' + msg + '.');
                }
            } catch (smsErr) {
              console.warn('SMS send attempt after bill create failure also failed', smsErr && smsErr.message ? smsErr.message : smsErr);
                // SMS attempt failed; still try to update status as a last effort
                try { await updateRepairTicketStatus(idToSendOnError); } catch (ee) { /* ignore */ }
                alert('Bill creation failed on server, and SMS notification failed as well.');
            }
          } else {
            alert('Failed to create bill on server. Please try again when the server is available.');
          }
        } catch (e) {
          alert('Failed to create bill on server. Please try again when the server is available.');
        }
      } finally {
        setIsCreating(false);
      }
    })();
  };

  
  const sendSMSNotification = async (ticketId) => {
    const tryPost = async (payload) => {
      try { console.debug('SendCustomerBillSMS payload:', payload); } catch (e) { }
      const res = await api.post('http://localhost:60748/CustomerBill/SendCustomerBillSMS', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const ok = res && res.status >= 200 && res.status < 300 && (!res.data || typeof res.data.StatusCode === 'undefined' || res.data.StatusCode === 200 || res.data.success === true);
      try {
        const smsLogs = JSON.parse(localStorage.getItem('smsLogs') || '[]');
        const smsId = smsLogs.length > 0 ? Math.max(...smsLogs.map(s => s.id || 0)) + 1 : 1;
        smsLogs.push({ id: smsId, payload, status: ok ? 'Sent' : 'Pending', attemptedAt: new Date().toISOString(), serverResponse: res && res.data ? res.data : res });
        localStorage.setItem('smsLogs', JSON.stringify(smsLogs));
      } catch (e) { /* ignore logging errors */ }
      return { ok, res };
    };

    // Try several payload shapes in order to match backend expectations. Many servers expect the 'pass' key
    // (ticket id) specifically — try it first, then ticketid as string/number.
    try {
      // 1) try 'pass' key first (preferred by some servers)
      let attempt = await tryPost({ pass: String(ticketId) });
      if (attempt.ok) return { success: true, response: attempt.res && attempt.res.data ? attempt.res.data : attempt.res };

      // 2) ticketid as string
      attempt = await tryPost({ ticketid: String(ticketId) });
      if (attempt.ok) return { success: true, response: attempt.res && attempt.res.data ? attempt.res.data : attempt.res };

      // 3) ticketid as number (some backends expect numeric id)
      const numeric = Number(ticketId);
      if (Number.isFinite(numeric)) {
        attempt = await tryPost({ ticketid: numeric });
        if (attempt.ok) return { success: true, response: attempt.res && attempt.res.data ? attempt.res.data : attempt.res };
      }

      // all attempts failed — return last response for diagnostics
      return { success: false, response: attempt.res && attempt.res.data ? attempt.res.data : attempt.res };
    } catch (err) {
      try {
        const smsLogs = JSON.parse(localStorage.getItem('smsLogs') || '[]');
        const smsId = smsLogs.length > 0 ? Math.max(...smsLogs.map(s => s.id || 0)) + 1 : 1;
        smsLogs.push({ id: smsId, payload: { ticketid: String(ticketId) }, status: 'Pending', attemptedAt: new Date().toISOString(), error: err && err.message ? err.message : String(err) });
        localStorage.setItem('smsLogs', JSON.stringify(smsLogs));
      } catch (e) { /* ignore logging errors */ }
      return { success: false, error: err };
    }
  };

    // Best-effort: update repair ticket status to 'Payment Process'
    const updateRepairTicketStatus = async (ticketId) => {
      if (!ticketId) return { success: false, error: 'missing ticketId' };
      // Try a few likely status values if the database CHECK constraint rejects the first.
      const statusCandidates = [
        'Payment Process',
        'Payment Processing',
        'Payment Pending',
        'Pending Payment',
        'Payment'
      ];

      for (const statusVal of statusCandidates) {
        const payload = {
          ticketId: String(ticketId),
          ticket_id: String(ticketId),
          repairId: String(ticketId),
          repair_id: String(ticketId),
          pass: String(ticketId),
          status: statusVal
        };

        try {
          try { console.debug('UpdateRepairTicketStatus attempt payload:', payload); } catch (e) {}
          const res = await api.post('http://localhost:60748/RepairTicket/UpdateRepairTicketStatus', payload, {
            headers: { 'Content-Type': 'application/json' }
          });

          const ok = res && res.status >= 200 && res.status < 300 && (!res.data || typeof res.data.StatusCode === 'undefined' || res.data.StatusCode === 200 || res.data.success === true);

          // Log attempt for diagnostics
          try {
            const logs = JSON.parse(localStorage.getItem('repairStatusLogs') || '[]');
            const id = logs.length > 0 ? Math.max(...logs.map(l => l.id || 0)) + 1 : 1;
            logs.push({ id, payload, status: ok ? 'Updated' : 'Failed', attemptedAt: new Date().toISOString(), serverResponse: res && res.data ? res.data : res });
            localStorage.setItem('repairStatusLogs', JSON.stringify(logs));
          } catch (e) { /* ignore logging errors */ }

          if (ok) return { success: true, response: res && res.data ? res.data : res, usedStatus: statusVal };

          // If server responded with a CHECK constraint error mentioning the status column, try next candidate
          const bodyText = (res && res.data && (res.data.Result || res.data.message || JSON.stringify(res.data))) || '';
          if ((typeof bodyText === 'string' && bodyText.indexOf('CK__RepairTic__statu') !== -1) || String(bodyText).toLowerCase().indexOf('check constraint') !== -1) {
            // continue to next candidate
            continue;
          }

          // otherwise stop trying and return failure info
          return { success: false, response: res && res.data ? res.data : res };
        } catch (err) {
          // Log network/error
          try {
            const logs = JSON.parse(localStorage.getItem('repairStatusLogs') || '[]');
            const id = logs.length > 0 ? Math.max(...logs.map(l => l.id || 0)) + 1 : 1;
            logs.push({ id, payload, status: 'Error', attemptedAt: new Date().toISOString(), error: err && err.message ? err.message : String(err) });
            localStorage.setItem('repairStatusLogs', JSON.stringify(logs));
          } catch (e) { /* ignore logging errors */ }

          // If error message hints at CHECK constraint, try next candidate, otherwise return error
          const errMsg = err && (err.message || (err.response && err.response.data && (err.response.data.Result || err.response.data.message))) ? (err.message || (err.response && err.response.data && (err.response.data.Result || err.response.data.message))) : '';
          if (String(errMsg).toLowerCase().indexOf('check constraint') !== -1 || String(errMsg).indexOf('CK__RepairTic__statu') !== -1) {
            continue; // try next status
          }

          return { success: false, error: err };
        }
      }

      // All candidates tried and none accepted
      return { success: false, error: 'All status candidates rejected by server CHECK constraint' };
    };

  // syncLocalBills removed per request — bills are saved locally or posted once during createBill

  const sanitizeOverview = (text) => {
    if (!text) return '';
    const blacklist = [
      'Keyboard not responding',
      'overheating'
    ];
    let out = String(text);
    blacklist.forEach(phrase => {
      const re = new RegExp(phrase, 'ig');
      out = out.replace(re, '');
    });
    // collapse whitespace and trim
    out = out.replace(/\s+/g, ' ').trim();
    // remove leading/trailing punctuation leftover
    out = out.replace(/^[-—:\s]+|[-—:\s]+$/g, '');
    return out;
  };

  

  const updateBillStatus = async (billId, newStatus) => {
    // optimistic UI update using functional state update to avoid stale closures
    setBills(prev => {
      const updated = prev.map(b => (String(b.id) === String(billId) || String(b.pass) === String(billId) || String(b.ticketId) === String(billId) || String(b.ticket_id) === String(billId)) ? { ...b, status: newStatus } : b);
      try { localStorage.setItem('repairBills', JSON.stringify(updated)); } catch (e) { /* ignore */ }
      return updated;
    });

    // Determine bill object from current bills array snapshot
    const billObj = bills.find(b => String(b.id) === String(billId) || String(b.pass) === String(billId) || String(b.ticketId) === String(billId) || String(b.ticket_id) === String(billId));

    // Prefer the original ticket id when available. Many server responses include the
    // true ticket id in the raw payload under `ticketid` or `ticket_id` fields. Try
    // raw.ticketid/raw.ticket_id/raw.TicketID first, then normalized fields, then fall
    // back to pass or bill.id as a last resort.
    let ticketIdToSend = String(billId);
    if (billObj) {
      const raw = billObj.raw || {};
      const candidates = [raw.ticketid, raw.ticket_id, raw.TicketID, billObj.ticket_id, billObj.ticketId, billObj.repairId, billObj.pass, billObj.id];
      const found = candidates.find(c => (typeof c !== 'undefined' && c !== null && String(c).trim() !== ''));
      ticketIdToSend = found ? String(found) : String(billId);
    }

    // Prepare payload expected by the backend: use ticketid (but containing bill.id) and status only.
    // Map friendly statuses to backend codes where necessary (e.g. 'Refunded' -> 'c').
    const mappedStatus = (String(newStatus || '').toLowerCase() === 'refunded') ? 'c' : newStatus;
    // Prefer the bill's real `pass` value; fall back to ticketIdToSend if absent.
    const passValue = billObj && (billObj.pass || billObj.Pass || billObj.pass_code || billObj.PassCode || billObj.passCode || billObj.passcode || billObj.raw && (billObj.raw.pass || billObj.raw.Pass))
      ? String(billObj.pass || billObj.Pass || billObj.pass_code || billObj.PassCode || billObj.passCode || billObj.passcode || (billObj.raw && (billObj.raw.pass || billObj.raw.Pass)))
      : ticketIdToSend;

    const payload = {
      pass: passValue,
      status: mappedStatus
    };

    try {
      try { console.debug('UpdateCustomerBillStatus payload:', payload); } catch (e) {}
      const res = await api.post('http://localhost:60748/CustomerBill/UpdateCustomerBillStatus', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // log attempt for diagnostics
      try {
        const logs = JSON.parse(localStorage.getItem('billStatusLogs') || '[]');
        const id = logs.length > 0 ? Math.max(...logs.map(l => l.id || 0)) + 1 : 1;
        logs.push({ id, payload, attemptedAt: new Date().toISOString(), serverResponse: res && res.data ? res.data : res });
        localStorage.setItem('billStatusLogs', JSON.stringify(logs));
      } catch (e) { /* ignore logging errors */ }

      return res;
    } catch (e) {
      // server update failed - we already saved locally; inform the user and log
      console.warn('UpdateCustomerBillStatus failed; saved locally', e && e.message ? e.message : e);
      try {
        const logs = JSON.parse(localStorage.getItem('billStatusLogs') || '[]');
        const id = logs.length > 0 ? Math.max(...logs.map(l => l.id || 0)) + 1 : 1;
        logs.push({ id, payload: { ...payload, error: e && e.message ? e.message : String(e) }, attemptedAt: new Date().toISOString() });
        localStorage.setItem('billStatusLogs', JSON.stringify(logs));
      } catch (ee) { /* ignore */ }
    }
  };

  const printBill = (bill) => {
    try {
      // Helper: safe HTML escape
      const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Format date as dd/mm/yyyy HH:MM
      const dt = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formattedDate = `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

      const num = (v) => {
        const n = Number(v || 0);
        if (!Number.isFinite(n)) return '0.00';
        return n.toFixed(2);
      };

      // Build plain-text receipt lines (monospace). Align amounts to the right in a fixed width.
      const padRight = (s, l) => (s + ' '.repeat(Math.max(0, l - String(s).length))).slice(0, l);
      const padLeft = (s, l) => ((' '.repeat(Math.max(0, l - String(s).length))) + s).slice(-l);

      const lineWidth = 32; // characters for ~80mm paper at typical font-size
      const labelWidth = 20;

      const partsLine = `${padRight('Parts', labelWidth)} ${padLeft('Rs. ' + num(bill.partsCost || bill.parts_cost || 0), lineWidth - labelWidth - 1)}`;
      const laborLine = `${padRight('Labor', labelWidth)} ${padLeft('Rs. ' + num(bill.laborCost || bill.labor_cost || 0), lineWidth - labelWidth - 1)}`;
      const taxLine = `${padRight('Tax', labelWidth)} ${padLeft('Rs. ' + num(bill.tax || bill.tax_amount || 0), lineWidth - labelWidth - 1)}`;
      const totalLine = `${padRight('TOTAL', labelWidth)} ${padLeft('Rs. ' + num(bill.totalAmount || bill.total || bill.total_amount || 0), lineWidth - labelWidth - 1)}`;

      const receiptLines = [];
      receiptLines.push('      Teknicity Service Center');
      receiptLines.push('          Customer Bill');
      receiptLines.push('-'.repeat(lineWidth));
      receiptLines.push(`Bill ID: ${esc(bill.id || bill.ticketId || bill.ticket_id || '')}`);
      receiptLines.push(`Ticket ID: ${esc(bill.pass || bill.ticket_id || bill.repairId || '')}`);
      receiptLines.push(`Date: ${formattedDate}`);
      receiptLines.push(`Customer: ${esc(bill.customerName || '')}`);
      receiptLines.push(`Device: ${esc(bill.device || '')}`);
      receiptLines.push(`Issue: ${esc(bill.issue || '')}`);
      receiptLines.push('-'.repeat(lineWidth));
      receiptLines.push(padRight('Item', labelWidth) + ' ' + padLeft('Amount', lineWidth - labelWidth - 1));
      receiptLines.push('-'.repeat(lineWidth));
      receiptLines.push(partsLine);
      receiptLines.push(laborLine);
      receiptLines.push(taxLine);
      receiptLines.push('-'.repeat(lineWidth));
      receiptLines.push(totalLine);
      receiptLines.push('-'.repeat(lineWidth));
      // receiptLines.push(`Status: ${esc(bill.status || 'Pending')}`);
      receiptLines.push('Thank you for your business!');

      const text = receiptLines.join('\n');

      // Write plain-text receipt into a new window inside a <pre> so it prints nicely.
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><style>
        body { margin:0; padding:6mm; font-family: monospace; }
        .receipt { width:80mm; }
        pre { font-family: monospace; font-size:10px; line-height:1.1; white-space: pre-wrap; }
        @media print { @page { size: 80mm auto; margin: 0mm; } body { margin:2mm; } }
      </style></head><body><div class="receipt"><pre>${esc(text)}</pre></div></body></html>`;

      const w = window.open('', '_blank');
      if (!w) { alert('Please allow popups to print the bill.'); return; }
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.onload = () => { try { w.focus(); w.print(); } catch (e) { /* ignore */ } };
    } catch (e) {
      console.error('Print failed', e);
      alert('Failed to open print window.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Bills Management</h1>

        {/* Completed Repairs Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Repairs (Ready for Billing)</h2>
          
          {completedRepairs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Completed Repairs</h3>
              <p className="text-gray-600">Completed repairs from technicians will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedRepairs.map((repair, idx) => (
                    <tr key={repair.id || repair.ticketId || repair.ticket_id || `repair-${idx}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{repair.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{repair.brand} {repair.model}</div>
                        {repair.imei ? <div className="text-sm text-gray-500">{repair.imei}</div> : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{repair.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.customerPhone || (repair.raw && (repair.raw.phone_no || repair.raw.phone || repair.raw.customer_phone || repair.raw.mobile || repair.raw.msisdn || ''))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(repair.completedAt || (repair.raw && (repair.raw.completed_date || repair.raw.completedAt || repair.raw.completedOn || repair.raw.completed_on)))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openRepairDetails(repair)} className="text-sm text-blue-600 hover:underline">Repair Details</button>
                          <button onClick={() => openBillForm(repair)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-200">Create Bill</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Existing Bills Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Bills</h2>
          
          {/* Search bar for bills by customer name/phone/ticket */}
          <div className="mb-4 flex items-center space-x-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone or ticket id"
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              Clear
            </button>
          </div>

          {bills.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🧾</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Created</h3>
              <p className="text-gray-600">Bills for completed repairs will appear here.</p>
            </div>
          ) : (
            (() => {
              const q = String(searchQuery || '').trim().toLowerCase();
              const filtered = q === '' ? bills : (bills || []).filter(b => {
                const name = String(b.customerName || b.customer || b.customer_name || '').toLowerCase();
                const phone = String(b.customerPhone || b.customer_phone || b.phone || b.phone_no || '').toLowerCase();
                const ticket = String(b.pass || b.ticketId || b.ticket_id || b.repairId || b.id || '').toLowerCase();
                return name.indexOf(q) !== -1 || phone.indexOf(q) !== -1 || ticket.indexOf(q) !== -1;
              });

              if (!filtered || filtered.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No bills match your search</h3>
                    <p className="text-gray-600">Try a different customer name, phone number or ticket id.</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((bill, idx) => (
                <tr key={`bill-${bill.id || bill.ticketId || bill.ticket_id || bill.repairId || bill.pass || idx}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {/* show ticket id as Bill ID when available, fallback to internal id */}
                            {bill.ticketId ? String(bill.ticketId) : (bill.id ? (Number.isFinite(Number(bill.id)) ? `BILL-${String(Number(bill.id)).padStart(4, '0')}` : String(bill.id)) : '—')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                            <div className="text-sm text-gray-500">{bill.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bill.pass || bill.ticket_id || bill.repairId || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bill.device}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(() => {
                              const disp = formatNumberDisplay(bill.totalAmount || bill.total || '');
                              return disp === '' ? '—' : `Rs. ${disp}`;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bill.status === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              {/* Status selector - updates status optimistically and tries server update */}
                              <select
                                value={bill.status || 'Pending Payment'}
                                onChange={(e) => updateBillStatus(bill.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option>Pending Payment</option>
                                <option>Paid</option>
                                <option>Refunded</option>
                              </select>

                              {/* Print button */}
                              <button
                                onClick={() => printBill(bill)}
                                title="Print Bill"
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </div>

        {/* Bill Creation Modal (constrained + scrollable) */}
        {showBillForm && selectedRepair && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Create Bill</h2>
                  <button 
                    onClick={() => setShowBillForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={createBill} className="flex flex-col">
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="mb-2">
                      <div className="text-xs text-gray-500">Ticket ID</div>
                      <div className="text-lg font-medium text-gray-900">{selectedRepair.id}</div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Device: {selectedRepair.brand} {selectedRepair.model}</p>
                    <p className="text-sm text-gray-600">Customer: {selectedRepair.customerName} ({selectedRepair.customerPhone})</p>
                    <p className="text-sm text-gray-600">Issue: {selectedRepair.issue}</p>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[62vh]">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parts Cost</label>
                      <input
                        type="text"
                        name="partsCost"
                        value={editingField === 'partsCost' ? (newBill.partsCost === '' ? '' : String(newBill.partsCost)) : formatNumberDisplay(newBill.partsCost)}
                        onChange={handleBillChange}
                        onFocus={() => setEditingField('partsCost')}
                        onBlur={() => setEditingField(null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                      <input
                        type="text"
                        name="laborCost"
                        value={editingField === 'laborCost' ? (newBill.laborCost === '' ? '' : String(newBill.laborCost)) : formatNumberDisplay(newBill.laborCost)}
                        onChange={handleBillChange}
                        onFocus={() => setEditingField('laborCost')}
                        onBlur={() => setEditingField(null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                      <input
                        type="text"
                        name="tax"
                        value={editingField === 'tax' ? (newBill.tax === '' ? '' : String(newBill.tax)) : formatNumberDisplay(newBill.tax)}
                        onChange={handleBillChange}
                        onFocus={() => setEditingField('tax')}
                        onBlur={() => setEditingField(null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="text"
                        name="total"
                        value={newBill.total === '' ? '' : formatNumberDisplay(newBill.total)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={newBill.notes}
                        onChange={handleBillChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 sticky bottom-0 bg-white pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowBillForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Bill & Notify Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Repair Details Modal */}
        {showRepairDetails && selectedRepair && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Repair Details</h2>
                  <button 
                    onClick={() => setShowRepairDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 text-sm overflow-y-auto max-h-[70vh]">
                  <div>
                    <div className="text-xs text-gray-500">Ticket ID</div>
                    <div className="text-lg font-medium">{selectedRepair.id}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Device</div>
                    <div className="text-lg font-medium">{selectedRepair.brand} {selectedRepair.model}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Customer</div>
                    <div className="text-lg font-medium">{selectedRepair.customerName}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-lg font-medium">{selectedRepair.customerPhone}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Issue</div>
                    <div className="text-sm text-gray-900">{sanitizeOverview(selectedRepair.issue)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Completed Date</div>
                    <div className="text-sm text-gray-900">{formatDate(selectedRepair.completedAt || (selectedRepair.raw && (selectedRepair.raw.completed_date || selectedRepair.raw.completedAt || selectedRepair.raw.completedOn || selectedRepair.raw.completed_on)))}</div>
                  </div>
                </div>

                <div className="mt-4 sticky bottom-0 bg-white pt-4 text-right">
                  <button onClick={() => setShowRepairDetails(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOwnerBills;


// import React, { useState, useEffect } from 'react';
// import api from '../services/api';

// const ShopOwnerBills = () => {
//   const [completedRepairs, setCompletedRepairs] = useState([]);
//   const [bills, setBills] = useState([]);
//   const [showBillForm, setShowBillForm] = useState(false);
//   const [selectedRepair, setSelectedRepair] = useState(null);
//   const [showRepairDetails, setShowRepairDetails] = useState(false);
//   const [newBill, setNewBill] = useState({
//     partsCost: '',
//     laborCost: '',
//     tax: '',
//     total: '',
//     notes: ''
//   });
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingField, setEditingField] = useState(null);

//   const formatNumberDisplay = (val) => {
//     if (val === '' || val === null || typeof val === 'undefined') return '';
//     const n = Number(val || 0);
//     if (!Number.isFinite(n)) return '';
//     return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   // normalizeBill is used in multiple places (useEffect and createBill), so keep it at
//   // component scope rather than nested in useEffect.
//   const normalizeBill = (item) => ({
//     // server may return different field names; normalize to a stable shape
//     id: item.id || item.ID || item.billId || item.BillID || item.bill_id || null,
//     // prefer explicit ticket fields; if missing, fall back to any pass/pass_code variants
//     ticketId: item.ticketid || item.ticket_id || item.TicketID || item.repairId || item.repair_id || item.ticketId || item.pass || item.Pass || item.pass_code || item.PassCode || (item.ticket_id ? item.ticket_id : ''),
//     ticket_id: item.ticket_id || item.ticketid || item.TicketID || item.ticketId || item.pass || item.Pass || item.pass_code || item.PassCode || '',
//     customerName: item.customer_name || item.customer || item.customerName || (item.customerName && typeof item.customerName === 'string' ? item.customerName : ''),
//     customerPhone: item.customer_phone || item.customerPhone || item.phone || item.phone_no || item.msisdn || item.mobile || '',
//     device: item.device || item.Device || (item.brand ? `${item.brand} ${item.model || ''}`.trim() : ''),
//     // map issue from common server field names so printed bills show the issue text
//     issue: item.issue || item.issue_description || item.problem || item.Overview || item.overview || '',
//     // map parts/labor/tax variants so UI and printing can display them
//     partsCost: Number(item.parts_cost || item.partsCost || item.parts || item.Parts || 0) || 0,
//     laborCost: Number(item.labor_cost || item.laborCost || item.labor || item.Labor || 0) || 0,
//     tax: Number(item.tax || item.tax_amount || item.taxAmount || 0) || 0,
//     totalAmount: Number(item.total_amount || item.total || item.totalAmount || 0) || 0,
//     status: item.status || item.Status || 'Pending',
//     pass: item.pass || item.Pass || item.pass_code || item.PassCode || '',
//     raw: item
//   });

//   // Load completed repairs from server (with localStorage fallback)
//   useEffect(() => {
//     let mounted = true;

//     const normalize = (item) => ({
//       id: item.ticket_id || item.TicketID || item.ticketNo || item.ticket_number || item.id || item.Id || item.TicketID || '',
//       brand: item.brand || item.device || item.device_brand || item.brand_name || '',
//       model: item.model || item.device_model || item.model_name || '',
//       issue: item.issue || item.issue_description || item.problem || item.Overview || '',
//       customerName: item.customer_name || item.customer || item.customerName || item.name || '',
//       customerPhone: item.phone_no || item.phone || item.customer_phone || item.customerPhone || item.mobile || item.msisdn || '',
//       status: (item.status || item.Status || '').toString(),
//       imei: item.imei || item.IMEI || item.device_imei || '',
//       completedAt: item.completed_date || item.completedAt || item.completedOn || item.completed_on || item.ClosedDate || item.created_date || '',
//       raw: item
//     });

//     const loadData = async () => {
//       const storedBillsRaw = JSON.parse(localStorage.getItem('repairBills') || '[]');
//       // clean stored bills: dedupe by ticket/reapir/id and ignore entries without a key
//       const storedBills = (Array.isArray(storedBillsRaw) ? storedBillsRaw : []).filter(Boolean);
//       const keyForLocal = (b) => String(b && (b.ticketId || b.ticket_id || b.repairId || b.id || '')).trim();
//       const seenLocal = new Set();
//       const storedBillsClean = [];
//       for (const sb of storedBills) {
//         const k = keyForLocal(sb);
//         if (!k) continue; // ignore items without a key to avoid duplicate-null entries
//         if (seenLocal.has(k)) continue;
//         seenLocal.add(k);
//         storedBillsClean.push(sb);
//       }

//       try {
//         const res = await api.get('http://localhost:60748/RepairTicket/GetCompletedRepairTickets');

//         let list = [];
//         if (res && res.data) {
//           // handle multiple shapes
//           if (Array.isArray(res.data)) list = res.data;
//           else if (Array.isArray(res.data.ResultSet)) list = res.data.ResultSet;
//           else if (res.data.Result) {
//             try { list = JSON.parse(res.data.Result); } catch (e) { list = res.data.Result; }
//           } else if (Array.isArray(res.data.data)) list = res.data.data;
//         }

//         const normalized = (list || []).map(normalize);
//         try { localStorage.setItem('repairTickets', JSON.stringify(normalized)); } catch (e) { /* ignore */ }

//         // prefer server-side completed tickets; include items where status indicates completion
//         const completed = normalized.filter(t => {
//           const s = (t.status || '').toString().toLowerCase();
//           const hasCompletedFlag = s.indexOf('completed') !== -1 || s.indexOf('done') !== -1 || s.indexOf('closed') !== -1;
//           return hasCompletedFlag || (t.completedAt || '').toString().trim() !== '';
//         });

//         const completedWithoutBills = completed.filter(ticket => !storedBills.some(b => String(b.repairId) === String(ticket.id)));
//         if (mounted) {
//           setCompletedRepairs(completedWithoutBills);
//         }

//         // Try to load bills from server endpoint CustomerBill/GetAllCustomerBills
//         try {
//           const billRes = await api.get('http://localhost:60748/CustomerBill/GetAllCustomerBills');
//           let billList = [];
//           if (billRes && billRes.data) {
//             if (Array.isArray(billRes.data)) billList = billRes.data;
//             else if (Array.isArray(billRes.data.ResultSet)) billList = billRes.data.ResultSet;
//             else if (billRes.data.Result) {
//               try { billList = JSON.parse(billRes.data.Result); } catch (e) { billList = billRes.data.Result; }
//             } else if (Array.isArray(billRes.data.data)) billList = billRes.data.data;
//           }

//           const normalizedBillsFromServer = (billList || []).map(normalizeBill);
//           // If server returned an explicit empty list (successful call but no rows),
//           // clear local stored bills to avoid showing stale/duplicated local records.
//           if (mounted && normalizedBillsFromServer.length === 0) {
//             setBills([]);
//             try { localStorage.setItem('repairBills', JSON.stringify([])); } catch (e) { /* ignore */ }
//             return;
//           }

//           if (mounted && normalizedBillsFromServer.length > 0) {
//             // Merge locally-created bills (storedBills) into server list when server items don't include them.
//             // This preserves ticketId values created locally that the server response might omit.
//             const byKey = new Map();
//             const keyFor = (b) => String(b.ticketId || b.ticket_id || b.repairId || b.id || '');

//             normalizedBillsFromServer.forEach(b => {
//               const k = keyFor(b);
//               if (!k) return; // ignore server items without a key
//               if (!byKey.has(k)) byKey.set(k, b);
//             });
//             // merge only cleaned stored bills
//             (storedBillsClean || []).forEach(local => {
//               const k = keyFor(local);
//               if (!k) return;
//               if (!byKey.has(k)) {
//                 // prefer local object if server doesn't have it
//                 byKey.set(k, local);
//               } else {
//                 // if server has the bill but lacks a ticketId, try to backfill from local
//                 const serverItem = byKey.get(k);
//                 if ((!serverItem.ticketId || serverItem.ticketId === '') && (local.ticketId || local.ticket_id)) {
//                   serverItem.ticketId = local.ticketId || local.ticket_id;
//                   serverItem.ticket_id = serverItem.ticket_id || local.ticket_id || local.ticketId;
//                 }
//                 // also preserve totalAmount if server missing it
//                 if ((serverItem.totalAmount === undefined || serverItem.totalAmount === 0) && (local.totalAmount || local.total)) {
//                   serverItem.totalAmount = local.totalAmount || local.total;
//                 }
//               }
//             });

//             const merged = Array.from(byKey.values());
//             setBills(merged);
//             try { localStorage.setItem('repairBills', JSON.stringify(merged)); } catch (e) { /* ignore */ }
//           } else if (mounted) {
//             // fallback to stored bills if server returned none
//             setBills(storedBills);
//           }
//         } catch (e) {
//           // server call failed, use localStorage bills
//           if (mounted) setBills(storedBills);
//         }
//         return;
//       } catch (err) {
//         console.warn('GetCompletedRepairTickets failed, falling back to localStorage', err && err.message ? err.message : err);
//       }

//       // fallback to localStorage
//       try {
//         const storedTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]');
//         const storedBills = JSON.parse(localStorage.getItem('repairBills') || '[]');
//         const completedWithoutBills = (storedTickets || []).filter(ticket => ((ticket.completedAt) || (ticket.raw && (ticket.raw.completed_date || ticket.raw.completedAt)) || '').toString().trim() !== '' && !storedBills.some(b => String(b.repairId) === String(ticket.id)));
//         if (mounted) {
//           setCompletedRepairs(completedWithoutBills);
//           setBills(storedBills);
//         }
//       } catch (e) {
//         console.error('Failed to load fallback tickets', e);
//         // fallback failed; continue with empty lists
//         if (mounted) {
//           setCompletedRepairs([]);
//           setBills(JSON.parse(localStorage.getItem('repairBills') || '[]'));
//         }
//       }
//     };

//     loadData();
//     const interval = setInterval(loadData, 5000);
//     return () => { mounted = false; clearInterval(interval); };
//   }, []);

//   // format completed date to yyyy-mm-dd when possible
//   const formatDate = (val) => {
//     if (!val) return '';
//     try {
//       if (typeof val === 'string' && val.indexOf('T') !== -1) return val.split('T')[0];
//       const d = new Date(val);
//       if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
//       return String(val).split('T')[0];
//     } catch (e) { return String(val); }
//   };

//   const openBillForm = (repair) => {
//     setSelectedRepair(repair);
//     setNewBill({
//       partsCost: '',
//       laborCost: '',
//       tax: '',
//       total: '',
//       notes: ''
//     });
//     setShowBillForm(true);
//   };

//   const openRepairDetails = (repair) => {
//     setSelectedRepair(repair);
//     setShowRepairDetails(true);
//   };
  
//   const handleBillChange = (e) => {
//     const { name, value } = e.target;
//     // For numeric fields allow empty string (so inputs don't show 0 by default).
//     const isNotes = name === 'notes';
//     let fieldValue;
//     if (isNotes) {
//       fieldValue = value;
//     } else {
//       // strip commas from formatted input
//       const raw = String(value).replace(/,/g, '').trim();
//       if (raw === '') fieldValue = '';
//       else {
//         const n = parseFloat(raw);
//         fieldValue = Number.isFinite(n) ? n : '';
//       }
//     }

//     const updatedBill = {
//       ...newBill,
//       [name]: fieldValue
//     };

//     // Calculate total as a number but show empty when all parts are empty
//     const p = updatedBill.partsCost === '' ? 0 : Number(updatedBill.partsCost || 0);
//     const l = updatedBill.laborCost === '' ? 0 : Number(updatedBill.laborCost || 0);
//     const t = updatedBill.tax === '' ? 0 : Number(updatedBill.tax || 0);
//     const totalNumber = p + l + t;
//     updatedBill.total = (p === 0 && l === 0 && t === 0) ? '' : totalNumber;

//     setNewBill(updatedBill);
//   };

//   const createBill = (e) => {
//     e.preventDefault();
    
//     if (!selectedRepair) return;
//     // generate a provisional client id which will only be used if the server call fails
//     const provisionalClientId = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//     // Build a minimal, robust payload for the server. Send only the fields the backend typically needs
//     // and coerce numeric fields to numbers to avoid validation/type issues server-side.
//     const serverPayload = {
//       // Link to existing repair/ticket by id (important)
//       repairId: Number(selectedRepair.id) || selectedRepair.id,
//       pass: Number(selectedRepair.id) || selectedRepair.id,
//       // Customer / device / issue
//       // include both camelCase and snake_case forms since the backend appears to expect
//       // `customer_name` as NOT NULL. Provide fallbacks from raw when available.
//       customerName: selectedRepair.customerName || (selectedRepair.raw && (selectedRepair.raw.customer_name || selectedRepair.raw.customer || selectedRepair.raw.name)) || '',
//       customer_name: selectedRepair.customerName || (selectedRepair.raw && (selectedRepair.raw.customer_name || selectedRepair.raw.customer || selectedRepair.raw.name)) || '',
//       // include multiple phone field variants. Prefer selectedRepair.customerPhone, then raw variants.
//       customerPhone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.customer_phone || selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
//       customer_phone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.customer_phone || selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
//       phone: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.phone || selectedRepair.raw.phone_no || selectedRepair.raw.customer_phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
//       phone_no: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.phone_no || selectedRepair.raw.phone || selectedRepair.raw.customer_phone || selectedRepair.raw.mobile || selectedRepair.raw.msisdn)) || '',
//       msisdn: selectedRepair.customerPhone || (selectedRepair.raw && (selectedRepair.raw.msisdn || selectedRepair.raw.mobile || selectedRepair.raw.phone || selectedRepair.raw.phone_no)) || '',
//       device: `${selectedRepair.brand || ''} ${selectedRepair.model || ''}`.trim(),
//       issue: selectedRepair.issue || '',
//       // Amounts (coerced to numbers)
//       parts_cost: Number(newBill.partsCost) || 0,
//       labor_cost: Number(newBill.laborCost) || 0,
//       tax: Number(newBill.tax) || 0,
//       total_amount: Number(newBill.total) || 0,
//       // Notes
//       notes: newBill.notes || ''
//     };

//     try { console.debug('AddCustomerBill serverPayload:', serverPayload); } catch (e) { }

//     setIsCreating(true);
//     (async () => {
//       try {
//         const res = await api.post('http://localhost:60748/CustomerBill/AddCustomerBill', serverPayload, {
//           headers: { 'Content-Type': 'application/json' }
//         });
//         try { console.debug('AddCustomerBill response:', res && res.data ? res.data : res); } catch (e) { }

//         // Treat any 2xx status as success to be more resilient to server response shapes
//         // Consider the HTTP status and also guard against servers that return a 200 HTTP
//         // response but include an application-level StatusCode in the body (e.g. { StatusCode: 500 }).
//         const ok = res && res.status >= 200 && res.status < 300 && (
//           !res.data || typeof res.data.StatusCode === 'undefined' || res.data.StatusCode === 200 || res.data.success === true
//         );
//         let serverAssignedId = null;
//         if (ok) {
//           // attempt to read id from server response
//           serverAssignedId = (res.data && (res.data.id || res.data.insertId || res.data.ID)) || null;
//         }

//         // If server accepted the bill, persist server data locally (including phone). If server returned success
//         // but did not provide an id, we still treat it as server-saved and keep ticket fields as selectedRepair.id
//         if (ok) {
//           const clientId = serverAssignedId || selectedRepair.id;
//           const newBillData = {
//             id: clientId,
//             repairId: selectedRepair.id,
//             pass: selectedRepair.id,
//             ticketId: selectedRepair.id,
//             ticket_id: selectedRepair.id,
//             customerName: selectedRepair.customerName,
//             customerPhone: selectedRepair.customerPhone,
//             device: `${selectedRepair.brand} ${selectedRepair.model}`,
//             issue: selectedRepair.issue,
//             partsCost: Number(newBill.partsCost) || 0,
//             laborCost: Number(newBill.laborCost) || 0,
//             tax: Number(newBill.tax) || 0,
//             total: Number(newBill.total) || 0,
//             notes: newBill.notes || '',
//             createdAt: new Date().toISOString().split('T')[0],
//             status: 'Pending Payment',
//             rawResponse: res && res.data ? res.data : null
//           };

//           // avoid duplicates: if a bill for this repair/ticket already exists, update it instead of appending
//           const existsIndex = bills.findIndex(b => String(b.repairId) === String(selectedRepair.id) || String(b.pass) === String(selectedRepair.id) || String(b.id) === String(clientId));
//           let updatedBills;
//           if (existsIndex !== -1) {
//             updatedBills = bills.slice();
//             updatedBills[existsIndex] = { ...updatedBills[existsIndex], ...newBillData };
//           } else {
//             updatedBills = [...bills, newBillData];
//           }

//           // Persist tentative local view
//           setBills(updatedBills);
//           try { localStorage.setItem('repairBills', JSON.stringify(updatedBills)); } catch (e) { /* ignore */ }

//           // Try to refresh bills from server to ensure UI matches server-side state
//           try {
//             const billResAfter = await api.get('http://localhost:60748/CustomerBill/GetAllCustomerBills');
//             let billListAfter = [];
//             if (billResAfter && billResAfter.data) {
//               if (Array.isArray(billResAfter.data)) billListAfter = billResAfter.data;
//               else if (Array.isArray(billResAfter.data.ResultSet)) billListAfter = billResAfter.data.ResultSet;
//               else if (billResAfter.data.Result) {
//                 try { billListAfter = JSON.parse(billResAfter.data.Result); } catch (e) { billListAfter = billResAfter.data.Result; }
//               } else if (Array.isArray(billResAfter.data.data)) billListAfter = billResAfter.data.data;
//             }
//             const normalizedBillsAfter = (billListAfter || []).map(normalizeBill);
//             if (normalizedBillsAfter.length > 0) {
//               setBills(normalizedBillsAfter);
//               try { localStorage.setItem('repairBills', JSON.stringify(normalizedBillsAfter)); } catch (e) { /* ignore */ }
//             }
//           } catch (e) {
//             // ignore - we already updated the local view above
//           }

//           // Send SMS notification (simulated)
//           sendSMSNotification(selectedRepair, newBillData.total);

//           setShowBillForm(false);
//           alert('Bill created and customer notified successfully!');
//           return;
//         }

//         // If we reach here the server responded but indicated failure.
//         console.warn('AddCustomerBill server responded with non-ok status', res && res.status, res && res.data);
//         throw new Error('Server returned non-ok response');
//       } catch (err) {
//         // Server call failed — fallback to local-only save using a provisional id
//         console.warn('AddCustomerBill failed, falling back to localStorage', err && err.message ? err.message : err);
//         try {
//           const clientId = provisionalClientId;
//           const newBillData = {
//             id: clientId,
//             repairId: selectedRepair.id,
//             pass: selectedRepair.id,
//             ticketId: clientId,
//             ticket_id: clientId,
//             customerName: selectedRepair.customerName,
//             customerPhone: selectedRepair.customerPhone,
//             device: `${selectedRepair.brand} ${selectedRepair.model}`,
//             issue: selectedRepair.issue,
//             partsCost: Number(newBill.partsCost) || 0,
//             laborCost: Number(newBill.laborCost) || 0,
//             tax: Number(newBill.tax) || 0,
//             total: Number(newBill.total) || 0,
//             totalAmount: Number(newBill.total) || 0,
//             notes: newBill.notes || '',
//             createdAt: new Date().toISOString().split('T')[0],
//             status: 'Pending Payment'
//           };

//           // avoid duplicates in local fallback
//           const existsIndex = bills.findIndex(b => String(b.repairId) === String(selectedRepair.id) || String(b.pass) === String(selectedRepair.id) || String(b.id) === String(clientId));
//           let updatedBills;
//           if (existsIndex !== -1) {
//             updatedBills = bills.slice();
//             updatedBills[existsIndex] = { ...updatedBills[existsIndex], ...newBillData };
//           } else {
//             updatedBills = [...bills, newBillData];
//           }

//           setBills(updatedBills);
//           try { localStorage.setItem('repairBills', JSON.stringify(updatedBills)); } catch (e) { /* ignore */ }

//           // Update repair tickets local storage if desired
//           sendSMSNotification(selectedRepair, newBillData.total);
//           setShowBillForm(false);
//           alert('Bill saved locally (server unavailable).');
//         } catch (e) {
//           console.error('Failed to save bill locally', e);
//           alert('Failed to create bill: ' + (e && e.message ? e.message : e));
//         }
//       } finally {
//         setIsCreating(false);
//       }
//     })();
//   };

//   const sendSMSNotification = (repair, totalAmount) => {
//     const smsLogs = JSON.parse(localStorage.getItem('smsLogs') || '[]');
//     const smsId = smsLogs.length > 0 ? Math.max(...smsLogs.map(s => s.id)) + 1 : 1;

//     const newSMS = {
//       id: smsId,
//       to: repair.customerPhone,
//       message: `Hello ${repair.customerName}, your ${repair.brand} ${repair.model} repair is complete. Total amount: Rs. ${totalAmount}. Please visit our shop to collect your device.`,
//       sentAt: new Date().toISOString(),
//       status: 'Sent'
//     };

//     const updatedSMSLogs = [...smsLogs, newSMS];
//     localStorage.setItem('smsLogs', JSON.stringify(updatedSMSLogs));
//   };

//   const sanitizeOverview = (text) => {
//     if (!text) return '';
//     const blacklist = [
//       'Keyboard not responding',
//       'overheating'
//     ];
//     let out = String(text);
//     blacklist.forEach(phrase => {
//       const re = new RegExp(phrase, 'ig');
//       out = out.replace(re, '');
//     });
//     // collapse whitespace and trim
//     out = out.replace(/\s+/g, ' ').trim();
//     // remove leading/trailing punctuation leftover
//     out = out.replace(/^[-—:\s]+|[-—:\s]+$/g, '');
//     return out;
//   };

//   const updateBillStatus = async (billId, newStatus) => {
//     // optimistic UI update
//     const updatedBills = bills.map(b => b.id === billId ? { ...b, status: newStatus } : b);
//     setBills(updatedBills);
//     localStorage.setItem('repairBills', JSON.stringify(updatedBills));

//     // try to notify server (best-effort). If server endpoint doesn't exist, ignore errors.
//     try {
//       await api.post('http://localhost:60748/CustomerBill/UpdateCustomerBillStatus', { billId, status: newStatus }, {
//         headers: { 'Content-Type': 'application/json' }
//       });
//     } catch (e) {
//       // server update failed - we already saved locally; inform the user
//       console.warn('Server status update failed, saved locally', e && e.message ? e.message : e);
//     }
//   };

//   const printBill = (bill) => {
//     try {
//       // Helper: safe HTML escape
//       const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

//       // Format date as dd/mm/yyyy HH:MM
//       const dt = new Date();
//       const pad = (n) => String(n).padStart(2, '0');
//       const formattedDate = `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

//       const num = (v) => {
//         const n = Number(v || 0);
//         if (!Number.isFinite(n)) return '0.00';
//         return n.toFixed(2);
//       };

//       // Create a modern, professional bill design
//       const html = `<!doctype html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>Customer Bill - ${esc(bill.id || bill.ticketId || '')}</title>
//   <style>
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }
    
//     body {
//       font-family: 'Inter', sans-serif;
//       background: #f8fafc;
//       padding: 20px;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       min-height: 100vh;
//     }
    
//     .receipt-container {
//       max-width: 400px;
//       width: 100%;
//       background: white;
//       border-radius: 16px;
//       box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//       overflow: hidden;
//       border: 1px solid #e2e8f0;
//     }
    
//     .receipt-header {
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       color: white;
//       padding: 30px 20px;
//       text-align: center;
//       position: relative;
//     }
    
//     .receipt-header::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="white" fill-opacity="0.1"><circle cx="50" cy="50" r="2"/></svg>');
//     }
    
//     .company-name {
//       font-size: 24px;
//       font-weight: 700;
//       margin-bottom: 8px;
//       letter-spacing: -0.5px;
//       position: relative;
//     }
    
//     .company-tagline {
//       font-size: 14px;
//       font-weight: 400;
//       opacity: 0.9;
//       position: relative;
//     }
    
//     .receipt-body {
//       padding: 30px;
//     }
    
//     .section {
//       margin-bottom: 24px;
//     }
    
//     .section-title {
//       font-size: 12px;
//       font-weight: 600;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//       color: #64748b;
//       margin-bottom: 12px;
//       border-bottom: 1px solid #f1f5f9;
//       padding-bottom: 8px;
//     }
    
//     .bill-info {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 16px;
//       margin-bottom: 20px;
//     }
    
//     .info-item {
//       text-align: center;
//       padding: 12px;
//       background: #f8fafc;
//       border-radius: 8px;
//     }
    
//     .info-label {
//       font-size: 11px;
//       font-weight: 500;
//       color: #64748b;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//       margin-bottom: 4px;
//     }
    
//     .info-value {
//       font-size: 14px;
//       font-weight: 600;
//       color: #1e293b;
//     }
    
//     .customer-details {
//       background: #f8fafc;
//       padding: 16px;
//       border-radius: 8px;
//       margin-bottom: 20px;
//     }
    
//     .detail-row {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 8px;
//     }
    
//     .detail-row:last-child {
//       margin-bottom: 0;
//     }
    
//     .detail-label {
//       font-size: 12px;
//       font-weight: 500;
//       color: #64748b;
//     }
    
//     .detail-value {
//       font-size: 12px;
//       font-weight: 600;
//       color: #1e293b;
//       text-align: right;
//     }
    
//     .amounts-table {
//       width: 100%;
//       border-collapse: collapse;
//       margin: 20px 0;
//     }
    
//     .amounts-table td {
//       padding: 12px 8px;
//       border-bottom: 1px solid #f1f5f9;
//     }
    
//     .amounts-table tr:last-child td {
//       border-bottom: none;
//     }
    
//     .amount-label {
//       font-size: 13px;
//       font-weight: 500;
//       color: #475569;
//     }
    
//     .amount-value {
//       font-size: 13px;
//       font-weight: 600;
//       color: #1e293b;
//       text-align: right;
//     }
    
//     .total-row {
//       background: #f8fafc;
//       border-radius: 8px;
//       margin-top: 16px;
//     }
    
//     .total-row td {
//       padding: 16px 8px;
//       font-size: 16px;
//       font-weight: 700;
//     }
    
//     .total-label {
//       color: #1e293b;
//     }
    
//     .total-value {
//       color: #dc2626;
//       text-align: right;
//     }
    
//     .status-badge {
//       display: inline-block;
//       padding: 6px 12px;
//       background: #dcfce7;
//       color: #166534;
//       border-radius: 20px;
//       font-size: 11px;
//       font-weight: 600;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//     }
    
//     .footer {
//       text-align: center;
//       padding: 20px;
//       background: #f8fafc;
//       border-top: 1px solid #e2e8f0;
//     }
    
//     .thank-you {
//       font-size: 14px;
//       font-weight: 600;
//       color: #475569;
//       margin-bottom: 8px;
//     }
    
//     .contact-info {
//       font-size: 11px;
//       color: #64748b;
//       line-height: 1.4;
//     }
    
//     @media print {
//       body {
//         background: white;
//         padding: 0;
//       }
      
//       .receipt-container {
//         box-shadow: none;
//         border: none;
//         max-width: 100%;
//         border-radius: 0;
//       }
      
//       .receipt-header {
//         background: #333 !important;
//         -webkit-print-color-adjust: exact;
//         color-adjust: exact;
//       }
      
//       .footer {
//         background: #f8fafc !important;
//         -webkit-print-color-adjust: exact;
//         color-adjust: exact;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="receipt-container">
//     <!-- Header -->
//     <div class="receipt-header">
//       <div class="company-name">TEKNICITY SERVICE CENTER</div>
//       <div class="company-tagline">Quality Repair Services</div>
//     </div>
    
//     <!-- Body -->
//     <div class="receipt-body">
//       <!-- Bill Information -->
//       <div class="bill-info">
//         <div class="info-item">
//           <div class="info-label">Bill ID</div>
//           <div class="info-value">${esc(bill.id || bill.ticketId || bill.ticket_id || 'N/A')}</div>
//         </div>
//         <div class="info-item">
//           <div class="info-label">Date</div>
//           <div class="info-value">${formattedDate}</div>
//         </div>
//       </div>
      
//       <!-- Customer Details -->
//       <div class="section">
//         <div class="section-title">Customer & Device Information</div>
//         <div class="customer-details">
//           <div class="detail-row">
//             <span class="detail-label">Customer Name:</span>
//             <span class="detail-value">${esc(bill.customerName || '')}</span>
//           </div>
//           <div class="detail-row">
//             <span class="detail-label">Phone:</span>
//             <span class="detail-value">${esc(bill.customerPhone || '')}</span>
//           </div>
//           <div class="detail-row">
//             <span class="detail-label">Device:</span>
//             <span class="detail-value">${esc(bill.device || '')}</span>
//           </div>
//           <div class="detail-row">
//             <span class="detail-label">Issue:</span>
//             <span class="detail-value">${esc(bill.issue || '')}</span>
//           </div>
//           <div class="detail-row">
//             <span class="detail-label">Ticket ID:</span>
//             <span class="detail-value">${esc(bill.pass || bill.ticket_id || bill.repairId || '')}</span>
//           </div>
//         </div>
//       </div>
      
//       <!-- Amounts -->
//       <div class="section">
//         <div class="section-title">Bill Breakdown</div>
//         <table class="amounts-table">
//           <tr>
//             <td class="amount-label">Parts Cost</td>
//             <td class="amount-value">Rs. ${num(bill.partsCost || bill.parts_cost || 0)}</td>
//           </tr>
//           <tr>
//             <td class="amount-label">Labor Cost</td>
//             <td class="amount-value">Rs. ${num(bill.laborCost || bill.labor_cost || 0)}</td>
//           </tr>
//           <tr>
//             <td class="amount-label">Tax</td>
//             <td class="amount-value">Rs. ${num(bill.tax || bill.tax_amount || 0)}</td>
//           </tr>
//           <tr class="total-row">
//             <td class="total-label">TOTAL AMOUNT</td>
//             <td class="total-value">Rs. ${num(bill.totalAmount || bill.total || bill.total_amount || 0)}</td>
//           </tr>
//         </table>
//       </div>
      
//       <!-- Status -->
//       <div style="text-align: center; margin-top: 24px;">
//         <span class="status-badge">${esc(bill.status || 'Pending')}</span>
//       </div>
//     </div>
    
//     <!-- Footer -->
//     <div class="footer">
//       <div class="thank-you">Thank you for your business!</div>
//       <div class="contact-info">
//         📍 123 Tech Street, City • 📞 +94 77 123 4567<br>
//         ⏰ Mon-Sat: 9AM-6PM • 🌐 www.teknicity.lk
//       </div>
//     </div>
//   </div>
  
//   <script>
//     // Auto-print when the window loads
//     window.onload = function() {
//       setTimeout(function() {
//         window.print();
//       }, 500);
//     };
    
//     // Close window after printing (optional)
//     window.onafterprint = function() {
//       setTimeout(function() {
//         window.close();
//       }, 500);
//     };
//   </script>
// </body>
// </html>`;

//       const w = window.open('', '_blank', 'width=450,height=700');
//       if (!w) { 
//         alert('Please allow popups to print the bill.'); 
//         return; 
//       }
      
//       w.document.open();
//       w.document.write(html);
//       w.document.close();
      
//     } catch (e) {
//       console.error('Print failed', e);
//       alert('Failed to generate bill. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Bills Management</h1>

//         {/* Completed Repairs Section */}
//         <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Repairs (Ready for Billing)</h2>
          
//           {completedRepairs.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-5xl mb-4">✅</div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">No Completed Repairs</h3>
//               <p className="text-gray-600">Completed repairs from technicians will appear here.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {completedRepairs.map((repair, idx) => (
//                     <tr key={repair.id || repair.ticketId || repair.ticket_id || `repair-${idx}`}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{repair.id}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{repair.brand} {repair.model}</div>
//                         {repair.imei ? <div className="text-sm text-gray-500">{repair.imei}</div> : null}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{repair.customerName}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.customerPhone || (repair.raw && (repair.raw.phone_no || repair.raw.phone || repair.raw.customer_phone || repair.raw.mobile || repair.raw.msisdn || ''))}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(repair.completedAt || (repair.raw && (repair.raw.completed_date || repair.raw.completedAt || repair.raw.completedOn || repair.raw.completed_on)))}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center space-x-3">
//                           <button onClick={() => openRepairDetails(repair)} className="text-sm text-blue-600 hover:underline">Repair Details</button>
//                           <button onClick={() => openBillForm(repair)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-200">Create Bill</button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Existing Bills Section */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Bills</h2>
          
//           {bills.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-5xl mb-4">🧾</div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Created</h3>
//               <p className="text-gray-600">Bills for completed repairs will appear here.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {bills.map((bill, idx) => (
//                     <tr key={bill.id || bill.ticketId || bill.ticket_id || bill.repairId || `bill-${idx}`}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {/* show ticket id as Bill ID when available, fallback to internal id */}
//                         {bill.ticketId ? String(bill.ticketId) : (bill.id ? (Number.isFinite(Number(bill.id)) ? `BILL-${String(Number(bill.id)).padStart(4, '0')}` : String(bill.id)) : '—')}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
//                         <div className="text-sm text-gray-500">{bill.customerPhone}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {bill.pass || bill.ticket_id || bill.repairId || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {bill.device}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {(() => {
//                           const disp = formatNumberDisplay(bill.totalAmount || bill.total || '');
//                           return disp === '' ? '—' : `Rs. ${disp}`;
//                         })()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           bill.status === 'Paid' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {bill.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center space-x-3">
//                           {/* Status selector - updates status optimistically and tries server update */}
//                           <select
//                             value={bill.status || 'Pending Payment'}
//                             onChange={(e) => updateBillStatus(bill.id, e.target.value)}
//                             className="border rounded px-2 py-1 text-sm"
//                           >
//                             <option>Pending Payment</option>
//                             <option>Paid</option>
//                             <option>Cancelled</option>
//                             <option>Refunded</option>
//                           </select>

//                           {/* Print button */}
//                           <button
//                             onClick={() => printBill(bill)}
//                             title="Print Bill"
//                             className="text-blue-600 hover:text-blue-900 text-sm"
//                           >
//                             Print
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Bill Creation Modal (constrained + scrollable) */}
//         {showBillForm && selectedRepair && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-auto">
//             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6 flex flex-col">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-bold text-gray-900">Create Bill</h2>
//                   <button 
//                     onClick={() => setShowBillForm(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <form onSubmit={createBill} className="flex flex-col">
//                   <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//                     <div className="mb-2">
//                       <div className="text-xs text-gray-500">Ticket ID</div>
//                       <div className="text-lg font-medium text-gray-900">{selectedRepair.id}</div>
//                     </div>
//                     <p className="text-sm font-medium text-gray-700">Device: {selectedRepair.brand} {selectedRepair.model}</p>
//                     <p className="text-sm text-gray-600">Customer: {selectedRepair.customerName} ({selectedRepair.customerPhone})</p>
//                     <p className="text-sm text-gray-600">Issue: {selectedRepair.issue}</p>
//                   </div>

//                   <div className="space-y-4 overflow-y-auto max-h-[62vh]">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Parts Cost</label>
//                       <input
//                         type="text"
//                         name="partsCost"
//                         value={editingField === 'partsCost' ? (newBill.partsCost === '' ? '' : String(newBill.partsCost)) : formatNumberDisplay(newBill.partsCost)}
//                         onChange={handleBillChange}
//                         onFocus={() => setEditingField('partsCost')}
//                         onBlur={() => setEditingField(null)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
//                       <input
//                         type="text"
//                         name="laborCost"
//                         value={editingField === 'laborCost' ? (newBill.laborCost === '' ? '' : String(newBill.laborCost)) : formatNumberDisplay(newBill.laborCost)}
//                         onChange={handleBillChange}
//                         onFocus={() => setEditingField('laborCost')}
//                         onBlur={() => setEditingField(null)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
//                       <input
//                         type="text"
//                         name="tax"
//                         value={editingField === 'tax' ? (newBill.tax === '' ? '' : String(newBill.tax)) : formatNumberDisplay(newBill.tax)}
//                         onChange={handleBillChange}
//                         onFocus={() => setEditingField('tax')}
//                         onBlur={() => setEditingField(null)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
//                       <input
//                         type="text"
//                         name="total"
//                         value={newBill.total === '' ? '' : formatNumberDisplay(newBill.total)}
//                         readOnly
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
//                       <textarea
//                         name="notes"
//                         value={newBill.notes}
//                         onChange={handleBillChange}
//                         rows="2"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div className="mt-4 sticky bottom-0 bg-white pt-4 flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={() => setShowBillForm(false)}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
//                       disabled={isCreating}
//                     >
//                       {isCreating ? 'Creating...' : 'Create Bill & Notify Customer'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Repair Details Modal */}
//         {showRepairDetails && selectedRepair && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-auto">
//             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6 flex flex-col">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-bold text-gray-900">Repair Details</h2>
//                   <button 
//                     onClick={() => setShowRepairDetails(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="space-y-3 text-sm overflow-y-auto max-h-[70vh]">
//                   <div>
//                     <div className="text-xs text-gray-500">Ticket ID</div>
//                     <div className="text-lg font-medium">{selectedRepair.id}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Device</div>
//                     <div className="text-lg font-medium">{selectedRepair.brand} {selectedRepair.model}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Customer</div>
//                     <div className="text-lg font-medium">{selectedRepair.customerName}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Phone</div>
//                     <div className="text-lg font-medium">{selectedRepair.customerPhone}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Issue</div>
//                     <div className="text-sm text-gray-900">{sanitizeOverview(selectedRepair.issue)}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Completed Date</div>
//                     <div className="text-sm text-gray-900">{formatDate(selectedRepair.completedAt || (selectedRepair.raw && (selectedRepair.raw.completed_date || selectedRepair.raw.completedAt || selectedRepair.raw.completedOn || selectedRepair.raw.completed_on)))}</div>
//                   </div>
//                 </div>

//                 <div className="mt-4 sticky bottom-0 bg-white pt-4 text-right">
//                   <button onClick={() => setShowRepairDetails(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Close</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ShopOwnerBills;





