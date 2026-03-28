import React, { useEffect, useState } from 'react';
import api from '../services/api';

const PhoneReturns = () => {
  const [rows, setRows] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  // Build a table of tickets joined with bills and return info (if any)
  const buildTicketRows = () => {
    let tickets = [];
    let bills = [];
    try { tickets = JSON.parse(localStorage.getItem('repairTickets') || '[]'); } catch (e) { tickets = []; }
    try { bills = JSON.parse(localStorage.getItem('bills') || localStorage.getItem('receipts') || '[]'); } catch (e) { bills = []; }

    // normalize bills into a lookup by ticket id
    const billByTicket = {};
    (Array.isArray(bills) ? bills : []).forEach(b => {
      const tid = b.ticket_id || b.ticketId || b.TicketID || b.ticket || b.id || b.bill_ticket_id;
      const id = b.bill_id || b.id || b.BillID || b.billId || b.invoice_id || b.InvoiceID;
      if (tid) billByTicket[String(tid)] = id || b.id || '';
    });

    const rows = (Array.isArray(tickets) ? tickets : []).map(t => {
      const ticketId = t.ticket_id || t.id || t.TicketID || t.ticket || '';
      const billId = billByTicket[String(ticketId)] || '-';
      const repName = t.repairmanName || t.rep_name || t.repairman || t.assignedTo || (t.raw && (t.raw.repairman || t.raw.rep_name)) || '';
      const customer = t.customerName || t.customer || t.name || (t.raw && (t.raw.customer || t.raw.customerName)) || '';
      const issue = t.issue || t.problem || t.complaint || t.description || (t.raw && (t.raw.issue || t.raw.problem)) || '';
      const device = t.device || t.deviceName || t.model || (t.raw && (t.raw.device || t.raw.model)) || '';
      const action = t.action || t.status || t.lastAction || (t.raw && (t.raw.action || t.raw.status)) || '';
      return { billId, ticketId, repName, customer, issue, device, action };
    });

    // show most recent first if ticket has a date
    rows.sort((a,b) => {
      const ta = (tickets.find(t => String(t.ticket_id || t.id || t.ticket) === String(a.ticketId)) || {}).createdAt || (tickets.find(t => String(t.ticket_id || t.id || t.ticket) === String(a.ticketId)) || {}).date || '';
      const tb = (tickets.find(t => String(t.ticket_id || t.id || t.ticket) === String(b.ticketId)) || {}).createdAt || (tickets.find(t => String(t.ticket_id || t.id || t.ticket) === String(b.ticketId)) || {}).date || '';
      const da = new Date(ta).getTime() || 0;
      const db = new Date(tb).getTime() || 0;
      return db - da;
    });

    // filter out obvious demo/sample rows (customers like 'test...') and rows with no identifying customer or rep
    const isDemoRow = (r) => {
      const cust = String(r.customer || '').trim();
      const rep = String(r.repName || '').trim();
      if (/^test/i.test(cust)) return true;
      // if both rep and customer are missing or are just '-', treat as demo/sample
      if ((cust === '' || cust === '-' ) && (rep === '' || rep === '-')) return true;
      return false;
    };

    const filtered = rows.filter(r => !isDemoRow(r));
    return filtered.slice(0, 200); // cap to 200 rows
  };

  useEffect(() => {
    let mounted = true;

    const normalizePayload = (payload) => {
      // payload might be nested: { ResultSet: [...] } or { Result: [...] } or array
      if (!payload) return [];
      if (Array.isArray(payload)) return payload;
      if (payload.ResultSet && Array.isArray(payload.ResultSet)) return payload.ResultSet;
      if (payload.Result && Array.isArray(payload.Result)) return payload.Result;
      return [];
    };

    // kept for reference: demo-row detection is handled in buildTicketRows fallback

    const fetchCancelled = async () => {
      try {
        const res = await fetch('http://localhost:60748/CustomerBill/GetCancelledCustomerBills');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const list = normalizePayload(data);
        // map server payload to row shape
        const mapped = (list || []).map(item => ({
          billId: item.ticketid || item.BillID || item.bill_id || item.billId || '-',
          ticketId: item.pass || item.ticket || item.TicketID || item.ticket_id || '-',
          repName: item.repairman_name || item.repairmanName || item.rep_name || item.repairman || '',
          customer: item.customer_name || item.customer || item.Customer || '',
          issue: item.issue || item.problem || item.Issue || '',
          device: 'HTC',
          action: '',
          note: item.notes || item.note || ''
        }));

        // helper: robustly extract repairman name from a GetRepairmanName response
        const extractName = (payload) => {
          if (!payload) return '';
          // ResultSet style
          if (payload.ResultSet && Array.isArray(payload.ResultSet) && payload.ResultSet.length) {
            const first = payload.ResultSet[0];
            return first.repairman_name || first.rep_name || first.repairman || first.repName || first.name || '';
          }
          // Result may be JSON string
          if (payload.Result) {
            try {
              const parsed = typeof payload.Result === 'string' ? JSON.parse(payload.Result) : payload.Result;
              if (Array.isArray(parsed) && parsed.length) {
                const f = parsed[0];
                return f.repairman_name || f.rep_name || f.repairman || f.repName || f.name || '';
              }
              if (typeof parsed === 'string') return parsed;
            } catch (e) {
              // ignore parse error
            }
          }
          // data or plain string
          if (payload.data && typeof payload.data === 'string') return payload.data;
          if (typeof payload === 'string') return payload;
          return '';
        };

        // fetch repairman name for a ticket id (defensive)
        const fetchRepairmanName = async (ticketId) => {
          if (!ticketId || ticketId === '-') return '';
          try {
            const r = await fetch(`http://localhost:60748/RepairTicket/GetRepairmanName?ticket_id=${encodeURIComponent(ticketId)}`);
            if (!r.ok) return '';
            const payload = await r.json();
            return extractName(payload) || '';
          } catch (e) {
            return '';
          }
        };

        // Only fetch repairman names for rows missing them (limit to avoid overload)
        const PARALLEL_LIMIT = 50;
        const needFetch = (Array.isArray(mapped) ? mapped : []).filter(r => (!r.repName || String(r.repName).trim() === '') && r.ticketId && String(r.ticketId).trim() !== '-').slice(0, PARALLEL_LIMIT);

        // perform parallel fetches and build a map by ticketId to avoid relying on array indexes
        const fetchedMap = {};
        if (needFetch.length > 0) {
          const promises = needFetch.map(async (row) => {
            try {
              const name = await fetchRepairmanName(row.ticketId);
              if (name) fetchedMap[String(row.ticketId)] = name;
            } catch (e) {
              // ignore individual failures
            }
          });
          await Promise.all(promises);
        }

        // merge fetched names back into mapped rows using ticketId as key
        const merged = mapped.map((row) => ({
          ...row,
          repName: fetchedMap[String(row.ticketId)] || row.repName || ''
        }));

        // merge locally-saved return notes (so notes persist even if server list doesn't include them)
        try {
          const saved = JSON.parse(localStorage.getItem('returnNotes') || '{}');
          if (saved && typeof saved === 'object') {
            merged.forEach(m => {
              const k = String(m.ticketId || m.billId || m.ticket || '');
              if (saved[k]) m.note = saved[k];
            });
          }
        } catch (e) { /* ignore */ }

        if (mounted) setRows(merged);
        return;
      } catch (err) {
        // fallback to localStorage
        console.warn('Failed fetching cancelled bills, falling back to localStorage:', err && err.message);
        if (mounted) setRows(buildTicketRows());
      }
    };

    // remove old demo keys conservatively
    try {
      localStorage.removeItem('partsRequests');
      localStorage.removeItem('returns');
    } catch (e) {}

    fetchCancelled();

    const onStorage = (e) => {
      if (['repairTickets','bills','receipts','returns'].includes(e.key)) fetchCancelled();
    };
    window.addEventListener('storage', onStorage);
    return () => { mounted = false; window.removeEventListener('storage', onStorage); };
  }, []);

  const saveNote = async () => {
    if (!modalRow) return;
    setIsSavingNote(true);
    try {
      const pass = String(modalRow.ticketId || modalRow.ticket || modalRow.ticket_id || modalRow.billId || '');
      const payload = { pass, ticketId: pass, ticket_id: pass, status: 'R', notes: noteText };
      await api.post('http://localhost:60748/CustomerBill/UpdateCustomerBillStatus', payload, { headers: { 'Content-Type': 'application/json' } });
      // update component state
      setRows(prev => prev.map(r => String(r.ticketId) === String(pass) ? { ...r, action: 'R', note: noteText } : r));
      // persist note locally so it survives list refreshes
      try {
        const key = String(pass);
        const saved = JSON.parse(localStorage.getItem('returnNotes') || '{}');
        saved[key] = noteText;
        localStorage.setItem('returnNotes', JSON.stringify(saved));
      } catch (e) { /* ignore persistence errors */ }

      setShowNoteModal(false);
      setModalRow(null);
      setNoteText('');
    } catch (e) {
      console.warn('Saving return note failed', e && e.message ? e.message : e);
      alert('Failed to save note. See console for details.');
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Phone Returns</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Bill ID</th>
                  <th className="py-2">Ticket ID</th>
                  <th className="py-2">Rep Name</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Issue</th>
                  <th className="py-2">Device</th>
                  <th className="py-2">Note</th>
                  <th className="py-2" aria-label="actions"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-500">No tickets found.</td></tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 text-gray-700">{r.billId || '-'}</td>
                      <td className="py-3 text-gray-700">{r.ticketId || '-'}</td>
                      <td className="py-3 text-gray-700">{r.repName || '-'}</td>
                      <td className="py-3 text-gray-700">{r.customer || '-'}</td>
                      <td className="py-3 text-gray-700">{r.issue || '-'}</td>
                      <td className="py-3 text-gray-700">{r.device || '-'}</td>
                      <td className="py-3 text-gray-700">{r.note || '-'}</td>
                      <td className="py-3 align-middle">
                        <div className="flex items-center justify-center h-full">
                          {r.action === 'Returned' ? (
                            <span className="text-sm text-green-700">Returned</span>
                          ) : r.action === 'Returning...' ? (
                            <span className="text-sm text-gray-500">Returning…</span>
                          ) : (
                            <button
                              onClick={() => {
                                setModalRow(r);
                                setNoteText(r.note || '');
                                setShowNoteModal(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md"
                            >
                              Return Phone
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showNoteModal && modalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Add return note for ticket {modalRow.ticketId}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter note (optional)"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setShowNoteModal(false); setModalRow(null); setNoteText(''); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button onClick={saveNote} disabled={isSavingNote} className="px-4 py-2 bg-blue-600 text-white rounded">{isSavingNote ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneReturns;
