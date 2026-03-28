import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Barcode from 'react-barcode';

const TicketManagement = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [showTicketDetails, setShowTicketDetails] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [repairTickets, setRepairTickets] = useState([]);

  // Normalize short status codes to human-friendly labels (e.g. 'w' -> 'Waiting for Parts')
  const normalizeStatus = (s) => {
    const st = (s == null) ? '' : String(s).trim();
    const low = st.toLowerCase();
    if (low === 'w') return 'Waiting for Parts';
    if (low === 'i') return 'In Progress';
    if (low === 'c') return 'Completed';
    if (low === 'a' || low === 'approved') return 'Approved';
    if (low === 'r' || low === 'rejected') return 'Rejected';
    if (low === 'inprogress' || low === 'in progress') return 'In Progress';
    if (low.includes('waiting') && low.includes('part')) return 'Waiting for Parts';
    return st || '';
  };
  
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    devices: [{ brand: '', issue: '' }]
  });
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Ensure newest tickets appear first (by date, fallback to id)
  const sortTicketsNewestFirst = (arr) => {
    return (arr || []).slice().sort((a, b) => {
      const aTime = new Date(a.createdAt || a.created_at || a.created_date || a.date || 0).getTime() || 0;
      const bTime = new Date(b.createdAt || b.created_at || b.created_date || b.date || 0).getTime() || 0;
      if (bTime !== aTime) return bTime - aTime;
      const aId = Number(a.id) || 0;
      const bId = Number(b.id) || 0;
      return bId - aId;
    });
  };

  // Load tickets from backend (or fall back to localStorage)
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await api.get('/RepairTicket/GetAllRepairTicket');
        if (res && res.data && (res.data.StatusCode === 200 || res.status === 200)) {
          let list = [];
          if (Array.isArray(res.data.ResultSet) && res.data.ResultSet.length > 0) list = res.data.ResultSet;
          else if (res.data.Result) {
            try { list = JSON.parse(res.data.Result); } catch (e) { list = res.data.Result; }
          }

          const normalized = (list || []).map(item => ({
            id: item.ticket_id || item.TicketID || item.id || item.device_id || item.DeviceID || Date.now(),
            brand: item.brand || item.device || item.device_brand || '',
            issue: item.issue_description || item.issue || '',
            customerName: item.customer_name || item.customer || '',
            customerPhone: item.customer_phone || item.customerPhone || '',
            status: normalizeStatus(item.status || item.Status) || (item.status || item.Status) || 'Available',
            barcodeValue: item.barcode || item.barcodeValue || `TKT${String(item.ticket_id || item.id || Date.now()).padStart(6,'0')}`,
            createdAt: item.created_date || item.createdAt || item.created_at || item.date || ''
          }));

          const sorted = sortTicketsNewestFirst(normalized);
          setRepairTickets(sorted);
          localStorage.setItem('repairTickets', JSON.stringify(sorted));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch tickets from server, falling back to localStorage', err);
      }

      // fallback
      try {
        const storedTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]') || [];
        const normalizedStored = (storedTickets || []).map(t => ({ ...t, status: normalizeStatus(t.status) || t.status }));
        setRepairTickets(sortTicketsNewestFirst(normalizedStored));
      } catch (error) {
        console.error('Error loading tickets from localStorage:', error);
        setRepairTickets([]);
      }
    };

    
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load device brands for the brand dropdown
  useEffect(() => {
    let mounted = true;
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await api.get('/DeviceBrand/GetAllBrands');
        let payload = res && res.data ? (res.data.Result || res.data.ResultSet || res.data) : null;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch (e) { /* ignore */ }
        }

        const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
        const normalized = (arr || []).map(b => ({
          id: b.brand_id || b.id || b.BrandId || b.ID,
          name: b.brand_name || b.name || b.BrandName || b.brand || String(b)
        }));

        if (mounted) {
          setBrands(normalized);
          // persist as fallback
          localStorage.setItem('deviceBrands', JSON.stringify(normalized));
        }
      } catch (err) {
        // fallback to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('deviceBrands') || '[]');
          if (mounted) setBrands(stored);
        } catch (e) {
          if (mounted) setBrands([]);
        }
      } finally {
        if (mounted) setLoadingBrands(false);
      }
    };

    loadBrands();
    return () => { mounted = false; };
  }, []);

  const statusOptions = ['All', 'Available', 'Diagnosing', 'Waiting for Parts', 'In Progress', 'Completed'];

  const filteredTickets = filterStatus === 'All' 
    ? repairTickets 
    : repairTickets.filter(ticket => ticket.status === filterStatus);

  const updateTicketStatus = (ticketId, newStatus) => {
    const updatedTickets = repairTickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    setRepairTickets(updatedTickets);
    localStorage.setItem('repairTickets', JSON.stringify(updatedTickets));
    alert(`Ticket status updated to ${newStatus}`);
  };

  const viewTicketDetails = (ticket) => {
    setShowTicketDetails(ticket);
  };

  // Print a thermal-style 80mm receipt for a ticket (includes barcode via JsBarcode)
  const printTicket = (ticket, targetWindow) => {
    try {
      const id = ticket.barcodeValue || ticket.barcode || String(ticket.id || '');
      const date = new Date(ticket.createdAt || ticket.date || Date.now()).toLocaleString();

      const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Receipt - ${id}</title><meta name="viewport" content="width=device-width,initial-scale=1" /><style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin:0; padding:8mm; }
        .receipt { width:80mm; max-width:80mm; }
        h1 { font-size:16px; margin:0 0 6px 0; text-align:center; letter-spacing:0.6px }
        .muted { color:#222; font-size:13px; text-align:center; margin-bottom:8px }
        .line { margin:6px 0; font-size:13px; color:#111 }
        .label { display:inline-block; width:85px; color:#333 }
        .value { display:inline-block; font-weight:600 }
        .issue { display:block; margin-top:4px; font-size:12px; color:#111 }
        .ticket-number { margin-top:10px; font-weight:700; text-align:left; font-size:13px }
        .barcode { text-align:center; margin-top:10px; }
        .small { font-size:11px; color:#444; text-align:center }
        @media print { body { padding:4mm; } }
      </style></head><body>
        <div class="receipt">
          <h1>TEKNICITY REPAIR SHOP</h1>
          <div class="muted">Repair Ticket</div>

          <div class="line"><span class="label">Device ID:</span><span class="value">${ticket.id || ''}</span></div>
          <div class="line"><span class="label">Device:</span><span class="value">${(ticket.brand || '').toString()}</span></div>
          <div class="line"><span class="label">Customer:</span><span class="value">${(ticket.customerName || '').toString()}</span></div>
          <div class="line"><span class="label">Issue:</span><span class="value">${(ticket.issue || '').toString()}</span></div>
          <div class="line"><span class="label">Date:</span><span class="value">${date}</span></div>

          <div class="ticket-number">Ticket Number: ${id}</div>

          <div class="barcode"><svg id="barcode"></svg><div class="small" style="margin-top:6px;">${id}</div></div>
        </div>
  <script>
          (function(){
            function renderBarcode() {
              try {
                if (window.JsBarcode) {
                  window.JsBarcode(document.getElementById('barcode'), ${JSON.stringify(id)}, {format: 'CODE128', displayValue: false, width:2, height:60, margin:8});
                } else {
                  var s = document.createElement('script');
                  s.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
                  s.onload = function(){ try { window.JsBarcode(document.getElementById('barcode'), ${JSON.stringify(id)}, {format: 'CODE128', displayValue: false, width:2, height:60, margin:8}); } catch(e){ console.error(e); } };
                  s.onerror = function(){ console.warn('Failed to load JsBarcode, showing text fallback'); };
                  document.head.appendChild(s);
                }
              } catch(e){ console.error('Barcode error', e); }
            }

            if (document.readyState === 'complete' || document.readyState === 'interactive') renderBarcode(); else document.addEventListener('DOMContentLoaded', renderBarcode);
            window.addEventListener('load', function(){ setTimeout(function(){ try{ window.print(); }catch(e){console.error(e);} }, 700); });
          })();
        </script>
      </body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      // If caller provided a target window (opened synchronously), navigate it to the blob url so browser won't block.
      if (targetWindow) {
        try {
          try { targetWindow.location.href = url; } catch (e) { targetWindow.location = url; }
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          return;
        } catch (e) {
          console.warn('Failed to use provided popup window, falling back to open()', e);
        }
      }

      const w = window.open(url, '_blank', 'noopener');
      if (!w) { alert('Please allow popups to print the receipt.'); URL.revokeObjectURL(url); return; }
      // revoke after some time
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('printTicket error', err);
      alert('Failed to open print window');
    }
  };

  // Create provisional bill records for newly created tickets and persist to localStorage
  const createBillsForTickets = (tickets) => {
    try {
      const existing = JSON.parse(localStorage.getItem('repairBills') || '[]');
      const now = new Date().toISOString();
      const bills = (tickets || []).map((t, idx) => ({
        id: `BILL-${Date.now()}-${Math.floor(Math.random()*9000)+1000}-${idx}`,
        ticketId: t.id,
        ticketNumber: t.barcodeValue || `TKT${String(t.id).padStart(6,'0')}`,
        customerName: t.customerName || '',
        customerPhone: t.customerPhone || '',
        device: t.brand || '',
        issue: t.issue || '',
        amount: 0,
        status: 'Pending Payment',
        createdAt: now,
        _provisional: true
      }));

      const merged = [...bills, ...existing];
      localStorage.setItem('repairBills', JSON.stringify(merged));
      return bills;
    } catch (e) {
      console.error('createBillsForTickets error', e);
      return [];
    }
  };

  // Fallback: Print multiple tickets by loading a combined HTML into a hidden iframe and calling print()
  const printTicketsInIframe = (tickets) => {
    try {
      if (!tickets || tickets.length === 0) return;
      const parts = tickets.map((ticket, idx) => {
        const id = ticket.barcodeValue || ticket.barcode || String(ticket.id || '');
        const date = new Date(ticket.createdAt || ticket.date || Date.now()).toLocaleString();
        const svgId = `barcode-${idx}`;
        return `
          <div class="receipt" style="width:80mm; max-width:80mm; margin-bottom:12mm;">
            <h1 style="font-size:16px; margin:0 0 6px 0; text-align:center; letter-spacing:0.6px">TEKNICITY REPAIR SHOP</h1>
            <div style="font-size:13px; text-align:center; margin-bottom:8px">Repair Ticket</div>
            <div style="margin:6px 0; font-size:13px;"><span style="display:inline-block; width:85px; color:#333">Device ID:</span><span style="font-weight:600">${ticket.id || ''}</span></div>
            <div style="margin:6px 0; font-size:13px;"><span style="display:inline-block; width:85px; color:#333">Device:</span><span style="font-weight:600">${(ticket.brand || '').toString()}</span></div>
            <div style="margin:6px 0; font-size:13px;"><span style="display:inline-block; width:85px; color:#333">Customer:</span><span style="font-weight:600">${(ticket.customerName || '').toString()}</span></div>
            <div style="margin:6px 0; font-size:13px;"><span style="display:inline-block; width:85px; color:#333">Issue:</span><span style="font-weight:600">${(ticket.issue || '').toString()}</span></div>
            <div style="margin:6px 0; font-size:13px;"><span style="display:inline-block; width:85px; color:#333">Date:</span><span style="font-weight:600">${date}</span></div>
            <div style="margin-top:10px; font-weight:700; text-align:left; font-size:13px">Ticket Number: ${id}</div>
            <div style="text-align:center; margin-top:10px;"><svg id="${svgId}"></svg><div style="font-size:11px; color:#444; margin-top:6px">${id}</div></div>
          </div>`;
      }).join('\n');

      const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Receipts</title><meta name="viewport" content="width=device-width,initial-scale=1" /><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;padding:8mm} @media print{body{padding:4mm}}</style></head><body>${parts}
        <script>
          (function(){
            function renderAll() {
              try {
                var ids = [];
                ${tickets.map((t, i) => `ids.push('barcode-${i}');`).join('\n')}
                function onceLoaded() {
                  try {
                    ids.forEach(function(id){
                      try { window.JsBarcode(document.getElementById(id), document.getElementById(id).nextSibling.textContent.trim(), {format:'CODE128', displayValue:false, width:2, height:60, margin:8}); } catch(e) { console.error(e); }
                    });
                  } catch(e) { console.error(e); }
                }
                if (window.JsBarcode) { onceLoaded(); } else {
                  var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
                  s.onload = onceLoaded; s.onerror = function(){ console.warn('Failed to load barcode lib'); };
                  document.head.appendChild(s);
                }
              } catch(e){console.error(e);}            
            }
            if (document.readyState === 'complete' || document.readyState === 'interactive') renderAll(); else document.addEventListener('DOMContentLoaded', renderAll);
            window.addEventListener('load', function(){ setTimeout(function(){ try{ window.print(); }catch(e){console.error(e);} }, 900); });
          })();
        </script>
      </body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // create hidden iframe, point to blob url, and call print
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;
      document.body.appendChild(iframe);

      const cleanup = () => {
        try { URL.revokeObjectURL(url); } catch(e){}
        try { document.body.removeChild(iframe); } catch(e){}
      };

      iframe.onload = function() {
        try {
          setTimeout(function(){
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(e){ console.error(e); }
            setTimeout(cleanup, 1500);
          }, 800);
        } catch(e) { console.error('iframe print error', e); cleanup(); }
      };
      // safety cleanup if load doesn't fire
      setTimeout(cleanup, 60000);
    } catch (e) {
      console.error('printTicketsInIframe error', e);
      alert('Unable to print receipts in-page; please allow popups or try again.');
    }
  };

  // NOTE: grouped-bill behavior removed — we'll create and print individual bills per ticket

  const closeTicketDetails = () => {
    setShowTicketDetails(null);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      return dt.toLocaleDateString();
    } catch (e) {
      return d;
    }
  };

  const formatToYMD = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd}`;
    } catch (e) {
      return d;
    }
  };

  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    if (dateInputRef && dateInputRef.current) {
      try {
        // modern browsers may support showPicker(); otherwise fallback to click()
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (e) {
        dateInputRef.current.click();
      }
    }
  };

  const handleInputChange = (e) => {
    setNewTicket({
      ...newTicket,
      [e.target.name]: e.target.value
    });
  };

  // ensure phone input only contains digits and limit to 10 characters
  const handlePhoneChange = (e) => {
    const digits = (e.target.value || '').toString().replace(/\D/g, '').slice(0, 10);
    setNewTicket({
      ...newTicket,
      customerPhone: digits
    });
  };

  const handleDeviceChange = (index, field, value) => {
    const updatedDevices = [...newTicket.devices];
    updatedDevices[index][field] = value;
    setNewTicket({
      ...newTicket,
      devices: updatedDevices
    });
  };

  const addDevice = () => {
    setNewTicket({
      ...newTicket,
      devices: [...newTicket.devices, { brand: '', issue: '' }]
    });
  };

  const removeDevice = (index) => {
    if (newTicket.devices.length > 1) {
      const updatedDevices = newTicket.devices.filter((_, i) => i !== index);
      setNewTicket({
        ...newTicket,
        devices: updatedDevices
      });
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    
    // Validate customer details
    if (!newTicket.customerName || !newTicket.customerPhone) {
      alert('Please fill in all required customer details');
      return;
    }

    // Validate name: only letters and spaces
    const nameTrim = (newTicket.customerName || '').trim();
    if (!/^[A-Za-z\s]+$/.test(nameTrim)) {
      alert('Customer name must contain only letters and spaces');
      return;
    }

    // Validate phone: allow formatting but require exactly 10 digits
    const phoneDigits = (newTicket.customerPhone || '').toString().replace(/\D/g, '');
    if (!/^\d{10}$/.test(phoneDigits)) {
      alert('Phone number must contain exactly 10 digits');
      return;
    }

    // Validate date
    if (!newTicket.date) {
      alert('Please select a date for the ticket');
      return;
    }

    // Validate devices
    for (let device of newTicket.devices) {
      if (!device.brand || !device.issue) {
        alert('Please fill in all device details');
        return;
      }
    }

    const ticketId = repairTickets.length > 0 ? Math.max(...repairTickets.map(t => t.id)) + 1 : 1;

    // Create a ticket for each device
    const newTicketsData = newTicket.devices.map((device, idx) => ({
      brand: device.brand,
      issue: device.issue,
      customerName: newTicket.customerName,
      customerPhone: phoneDigits,
      customerEmail: '',
      // id will be assigned by server; keep a local id for optimistic UI
      id: ticketId + idx,
      status: 'Available',
      assignedTo: null,
      assignedDate: null,
      createdAt: newTicket.date,
      estimatedCompletion: null,
      completedAt: null,
      barcodeValue: `TKT${String(ticketId + idx).padStart(6, '0')}`
    }));

    // Open popup windows synchronously (user-initiated) so later navigation to blob URLs won't be blocked.
    const popupWindows = (newTicketsData || []).map(() => {
      try {
        return window.open('', '_blank', 'noopener');
      } catch (e) {
        return null;
      }
    });
    if (popupWindows.some(w => !w)) {
      // Inform user that popups may be blocked; we continue since we can still attempt opens later.
      alert('Please allow popups in your browser to enable printing multiple receipts automatically. Some receipts may be blocked otherwise.');
    }

    // Try to persist each ticket to server. If server calls fail, fall back to localStorage.
    const persistTickets = async () => {
      const successes = [];
      const failures = [];

      for (let ticket of newTicketsData) {
        // Build defensive params for the backend (form-encoded below)

        try {
          // Some backend MVC endpoints expect form-encoded bodies. Send as x-www-form-urlencoded
          const params = new URLSearchParams();
          params.append('brand', ticket.brand);
          params.append('device', ticket.brand);
          params.append('device_brand', ticket.brand);
          params.append('issue_description', ticket.issue);
          params.append('issue', ticket.issue);
          params.append('customer_name', ticket.customerName);
          // Ensure phone_no is provided (server column name)
          params.append('customer_phone', ticket.customerPhone || '');
          params.append('customerPhone', ticket.customerPhone || '');
          params.append('phone_no', ticket.customerPhone || '');
          params.append('date', ticket.createdAt || '');
          params.append('createdAt', ticket.createdAt || '');
          params.append('status', ticket.status || 'Available');

          const res = await api.post('/RepairTicket/AddRepairTicket', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          if (res && (res.status === 200 || (res.data && res.data.StatusCode === 200))) {
            successes.push({ ticket, res });
          } else {
            failures.push({ ticket, res });
          }
        } catch (err) {
          failures.push({ ticket, err });
        }
      }

      if (failures.length === 0) {
        // All saved on server — reload authoritative list from server
        try {
          const listRes = await api.get('/RepairTicket/GetAllRepairTicket');
          if (listRes && listRes.data && (listRes.data.StatusCode === 200 || listRes.status === 200)) {
            let list = [];
            if (Array.isArray(listRes.data.ResultSet) && listRes.data.ResultSet.length > 0) list = listRes.data.ResultSet;
            else if (listRes.data.Result) {
              try { list = JSON.parse(listRes.data.Result); } catch (e) { list = listRes.data.Result; }
            }

            const normalized = (list || []).map(item => ({
              id: item.ticket_id || item.TicketID || item.id || item.device_id || item.DeviceID || Date.now(),
              brand: item.brand || item.device || item.device_brand || '',
              issue: item.issue_description || item.issue || '',
              customerName: item.customer_name || item.customer || '',
              customerPhone: item.customer_phone || item.customerPhone || '',
              status: item.status || item.Status || 'Available',
              barcodeValue: item.barcode || item.barcodeValue || `TKT${String(item.ticket_id || item.id || Date.now()).padStart(6,'0')}`,
              createdAt: item.createdAt || item.created_at || item.date || ''
            }));
            const sorted = sortTicketsNewestFirst(normalized);
            setRepairTickets(sorted);
            localStorage.setItem('repairTickets', JSON.stringify(sorted));
            // create provisional bills for these tickets and trigger printing
            try {
              // create individual provisional bills for each ticket and print one receipt per ticket
              createBillsForTickets(newTicketsData);
              // Print using pre-opened popups when available; otherwise collect and print via iframe fallback
              const iframeBatch = [];
              newTicketsData.forEach((t, i) => {
                if (popupWindows && popupWindows[i]) {
                  setTimeout(() => printTicket(t, popupWindows[i]), i * 900);
                } else {
                  iframeBatch.push(t);
                }
              });
              if (iframeBatch.length) setTimeout(() => printTicketsInIframe(iframeBatch), newTicketsData.length * 1000);
            } catch (e) { console.warn('Auto-bill/print after server save failed', e); }

            setShowCreateForm(false);
            setNewTicket({ customerName: '', customerPhone: '', date: new Date().toISOString().split('T')[0], devices: [{ brand: '', issue: '' }] });
            alert(`Created ${newTicketsData.length} repair ticket(s) on the server.`);
            return;
          }
        } catch (e) {
          console.warn('Created tickets but failed to reload list from server', e);
        }
      }

      // If we reach here, at least one server call failed — fallback to local-only persistence
  // Put newly created tickets at the top so they show up first in the list
  const updatedTickets = [...newTicketsData, ...repairTickets];
  const sortedUpdated = sortTicketsNewestFirst(updatedTickets);
  setRepairTickets(sortedUpdated);
  localStorage.setItem('repairTickets', JSON.stringify(sortedUpdated));
          // create provisional bills for these locally-created tickets and trigger printing
          try {
            // create individual provisional bills for each ticket and print one receipt per ticket
            createBillsForTickets(newTicketsData);
            const iframeBatch = [];
            newTicketsData.forEach((t, i) => {
              if (popupWindows && popupWindows[i]) {
                setTimeout(() => printTicket(t, popupWindows[i]), i * 900);
              } else {
                iframeBatch.push(t);
              }
            });
            if (iframeBatch.length) setTimeout(() => printTicketsInIframe(iframeBatch), newTicketsData.length * 1000);
          } catch (e) { console.warn('Auto-bill/print for local tickets failed', e); }
      setShowCreateForm(false);
      setNewTicket({ customerName: '', customerPhone: '', date: new Date().toISOString().split('T')[0], devices: [{ brand: '', issue: '' }] });

      let msg = `Created ${newTicketsData.length} ticket(s) locally.`;
      if (failures.length > 0) msg += ' Some items failed to persist to server.';
      alert(msg);
    };

    // Run persistence and don't block the UI thread (but we await here because caller expects immediate feedback)
    persistTickets();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repair Ticket Management</h1>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Create New Ticket
          </button>
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
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Repair Tickets</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                      <div className="text-xs text-gray-500">{ticket.barcodeValue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.customerName}</div>
                      <div className="text-sm text-gray-500">{ticket.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{ticket.issue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.status === 'Payment Process' ? 'bg-red-100 text-red-800' :
                        ticket.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'Waiting for Parts' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'Diagnosing' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); viewTicketDetails(ticket); }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); printTicket(ticket); }}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Create New Repair Ticket</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateTicket}>
                  {/* Customer Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                        <input
                          type="text"
                          name="customerName"
                          value={newTicket.customerName}
                          onChange={handleInputChange}
                          pattern="[A-Za-z\s]+"
                          title="Only letters and spaces are allowed"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="customerPhone"
                          value={newTicket.customerPhone}
                          onChange={handlePhoneChange}
                          inputMode="numeric"
                          pattern="\d{10}"
                          maxLength={10}
                          title="Enter exactly 10 digits"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <div className="relative">
                          {/* visible button styled like a date field; clicking opens native date picker */}
                          <button
                            type="button"
                            onClick={openDatePicker}
                            className="w-full text-left px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-900">{formatToYMD(newTicket.date)}</span>
                            <svg className="w-5 h-5 text-gray-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* hidden native date input to trigger browser picker (keeps accessibility and native behavior) */}
                          <input
                            ref={dateInputRef}
                            type="date"
                            name="date"
                            value={newTicket.date}
                            onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })}
                            className="sr-only"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Devices Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Device Information</h3>
                      <button
                        type="button"
                        onClick={addDevice}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded-md transition duration-200"
                      >
                        + Add Another Device
                      </button>
                    </div>

                    {newTicket.devices.map((device, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Device {index + 1}</h4>
                          {newTicket.devices.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDevice(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                            {brands && brands.length > 0 ? (
                              (() => {
                                const isKnown = !!brands.find(b => b.name === device.brand);
                                const selectValue = isKnown ? device.brand : (device.brand ? 'Other' : '');
                                return (
                                  <>
                                    <select
                                      value={selectValue}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'Other') {
                                          // prepare for custom input
                                          handleDeviceChange(index, 'brand', '');
                                        } else {
                                          handleDeviceChange(index, 'brand', val);
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                    >
                                      <option value="">Select brand</option>
                                      {brands.map(b => (
                                        <option key={b.id || b.name} value={b.name}>{b.name}</option>
                                      ))}
                                      <option value="Other">Other (type below)</option>
                                    </select>
                                    { (selectValue === 'Other' || (!isKnown && device.brand)) && (
                                      <input
                                        type="text"
                                        placeholder="Enter brand"
                                        value={device.brand || ''}
                                        onChange={(e) => handleDeviceChange(index, 'brand', e.target.value)}
                                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                      />
                                    )}
                                  </>
                                );
                              })()
                            ) : (
                              <input
                                type="text"
                                value={device.brand}
                                onChange={(e) => handleDeviceChange(index, 'brand', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description *</label>
                            <input
                              type="text"
                              value={device.issue}
                              onChange={(e) => handleDeviceChange(index, 'issue', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                    >
                      Create Ticket(s)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showTicketDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Ticket Details</h3>
                <button onClick={closeTicketDetails} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Device ID</div>
                  <div className="text-lg font-medium">{showTicketDetails.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Device</div>
                  <div className="text-lg font-medium">{showTicketDetails.brand}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="text-lg font-medium">{showTicketDetails.customerName} — <span className="text-sm text-gray-600">{showTicketDetails.customerPhone}</span></div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Issue</div>
                  <div className="text-sm text-gray-900">{showTicketDetails.issue}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-900">Date</div>
                  <div className="text-sm text-gray-500">{formatDate(showTicketDetails.createdAt || showTicketDetails.date)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Barcode</div>
                  <div className="mt-2">
                    <Barcode value={showTicketDetails.barcodeValue || String(showTicketDetails.id)} />
                    <div className="text-xs text-gray-600 mt-2">{showTicketDetails.barcodeValue || String(showTicketDetails.id)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-right">
                <button onClick={closeTicketDetails} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;