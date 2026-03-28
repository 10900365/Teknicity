import React, { useEffect, useState } from 'react';
import api from '../services/api';
import UserService from '../services/UserService';
import RepairmanService from '../services/RepairmanService';

const DUMMY = [
	{ id: 'TKT-1001', brand: 'iPhone', issue: 'Screen cracked', status: 'In Progress', assignedTo: '' },
	{ id: 'TKT-1002', brand: 'Samsung', issue: 'Battery not charging', status: 'Diagnosing', assignedTo: '' },
	{ id: 'TKT-1003', brand: 'Xiaomi', issue: 'Camera failure', status: 'In Progress', assignedTo: 'other' }
];

const AgeetWorkPerformingTask = () => {
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const [tickets, setTickets] = useState([]);
	// prefer server-resolved canonical rep_name, fall back to stored user.username
	const repNameUsed = (localStorage.getItem('rep_name') || user.username || '').trim();

	const normalize = (item) => ({
		id: item.ticket_id || item.TicketID || item.id || item.device_id || item.DeviceID || item.barcode || item.barcodeValue || '',
		brand: item.brand || item.device || item.device_brand || item.brand_name || '',
		issue: item.issue_description || item.issue || item.problem || '',
			status: item.status || item.Status || 'In Progress',
			// backend may return assigned field under several names, including rep_name
			assignedTo: item.assignedTo || item.assigned_to || item.repairman || item.assigned || item.rep_name || item.repName || '',
			// backend may return repairman id under several keys
			repairmanId: item.repairman_id || item.RepairmanID || item.RepairmanId || item.repairmanId || '',
		raw: item
	});

		useEffect(() => {
			let mounted = true;

			const load = async () => {
				// First try server endpoint for In Progress tickets
							let repairmanId = null;
							try {
								// resolve repairman_id (prefer TestGetUserRole)
												const rawUser = user || {};
												const mobile = (rawUser.phone || rawUser.mobile || rawUser.MobileNo || rawUser.Mobile || rawUser.mobileNo || '').toString().replace(/\D/g,'');
												const MAX_INT32 = 2147483647;
												const normalizeToInt = (v) => {
													if (v === undefined || v === null) return null;
													const digits = String(v).replace(/[^0-9\-]/g, '');
													if (digits === '') return null;
													const n = parseInt(digits, 10);
													if (Number.isNaN(n)) return null;
													if (Math.abs(n) > MAX_INT32) return null;
													return n;
												};

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
																const n = normalizeToInt(c);
																if (n) { repairmanId = n; break; }
															}
														}
													} catch (e) { /* ignore */ }
												}

												// fallback to local cache and server list if needed
												if (!repairmanId) {
													try {
														const cached = JSON.parse(localStorage.getItem('repairmen') || '[]');
														const found = (cached || []).find(r => (r.repairman_contact && String(r.repairman_contact).replace(/\D/g,'') === String(mobile)) || (r.phone && String(r.phone).replace(/\D/g,'') === String(mobile)) || String(r.username || r.repairman_name || r.name || '').trim().toLowerCase() === repNameUsed.toLowerCase());
														if (found) {
															const candidates = [found.RepairmanID, found.RepairmanId, found.repairman_id, found.id];
															for (const c of candidates) { const n = normalizeToInt(c); if (n) { repairmanId = n; break; } }
														}
													} catch (e) { /* ignore */ }
												}

												if (!repairmanId) {
													try {
														const srv = await RepairmanService.GetAllRepairman();
														let list = [];
														if (srv && srv.data) {
															if (Array.isArray(srv.data.ResultSet) && srv.data.ResultSet.length > 0) list = srv.data.ResultSet;
															else if (srv.data.Result) {
																try { list = JSON.parse(srv.data.Result); } catch (e) { list = srv.data.Result; }
															} else if (Array.isArray(srv.data)) list = srv.data;
														}
														const foundSrv = (list || []).find(r => String(r.repairman_contact || r.phone || r.username || r.repairman_name || r.name || '').trim().toLowerCase() === repNameUsed.toLowerCase() || (r.repairman_contact && String(r.repairman_contact).replace(/\D/g,'') === String(mobile)));
														if (foundSrv) {
															const candidates = [foundSrv.RepairmanID, foundSrv.RepairmanId, foundSrv.repairman_id, foundSrv.id];
															for (const c of candidates) { const n = normalizeToInt(c); if (n) { repairmanId = n; break; } }
														}
													} catch (e) { /* ignore */ }
												}

												if (!repairmanId) {
													console.warn('Could not resolve repairman_id; falling back to rep_name query');
												}

												// request scoped to the canonical repairman id when available
												const url = repairmanId ? `/RepairTicket/GetInProgressRepairTickets?repairman_id=${repairmanId}` : `/RepairTicket/GetInProgressRepairTickets?rep_name=${encodeURIComponent(repNameUsed)}`;
												const res = await api.get(url);
					let list = [];
					if (res && res.data) {
						if (Array.isArray(res.data.ResultSet) && res.data.ResultSet.length > 0) list = res.data.ResultSet;
						else if (res.data.Result) {
							try { list = JSON.parse(res.data.Result); } catch (e) { list = res.data.Result; }
						} else if (Array.isArray(res.data)) list = res.data;
						else if (Array.isArray(res.data.data)) list = res.data.data;
					}

							if (list && list.length > 0) {
								const normalized = list.map(normalize);
								// API returns ResultSet — filter to only In Progress tickets assigned to this repairman
								const inProgress = normalized.filter(t => {
									const s = (t.status || (t.raw && (t.raw.status || t.raw.Status))) || '';
									const assigned = (t.assignedTo || (t.raw && (t.raw.assignedTo || t.raw.assigned_to || t.raw.repairman))) || '';
									// prefer matching by numeric repairman id when available
									if (repairmanId) {
										const ticketRepId = (t.repairmanId || (t.raw && (t.raw.repairman_id || t.raw.RepairmanID || t.raw.RepairmanId))) || '';
										return String(s) === 'In Progress' && String(ticketRepId) === String(repairmanId);
									}
									return String(s) === 'In Progress' && String(assigned) === String(repNameUsed);
								});
								if (mounted) setTickets(inProgress);
								return;
							}

							// If the server explicitly returned an empty list, clear any locally cached repair
							// tickets so the UI reflects the server state (empty).
							if (Array.isArray(list) && list.length === 0) {
								try { localStorage.removeItem('diagnosingTickets'); localStorage.removeItem('repairTickets'); } catch (e) { /* ignore */ }
								if (mounted) setTickets([]);
								return;
							}
				} catch (err) {
					console.warn('GetInProgressRepairTickets failed, falling back to localStorage', err && err.message ? err.message : err);
				}

				// fallback to localStorage
				try {
					const stored = JSON.parse(localStorage.getItem('diagnosingTickets') || localStorage.getItem('repairTickets') || '[]');
							if (Array.isArray(stored) && stored.length > 0) {
								const normalized = stored.map(normalize);
								// fallback: show stored In Progress tickets only for this repairman
								const inProgressStored = normalized.filter(t => {
									const s = (t.status || (t.raw && (t.raw.status || t.raw.Status))) || '';
									const assigned = (t.assignedTo || (t.raw && (t.raw.assignedTo || t.raw.assigned_to || t.raw.repairman))) || '';
									if (repairmanId) {
										const ticketRepId = (t.repairmanId || (t.raw && (t.raw.repairman_id || t.raw.RepairmanID || t.raw.RepairmanId))) || '';
										return String(s) === 'In Progress' && String(ticketRepId) === String(repairmanId);
									}
									return String(s) === 'In Progress' && String(assigned) === String(repNameUsed);
								});
								if (mounted) setTickets(inProgressStored);
								return;
							}
				} catch (e) {
					// ignore
				}

				// final fallback to DUMMY
				const myDummy = DUMMY.map(normalize).filter(t => {
					const s = (t.status || (t.raw && (t.raw.status || t.raw.Status))) || '';
					const assigned = (t.assignedTo || (t.raw && (t.raw.assignedTo || t.raw.assigned_to || t.raw.repairman))) || '';
					return String(s) === 'In Progress' && String(assigned) === String(repNameUsed);
				});
				if (mounted) setTickets(myDummy);
			};

			load();
			return () => { mounted = false; };
		}, [repNameUsed]);

		const persistUpdateLocal = (ticketId, newStatus) => {
			try {
				const repairTickets = JSON.parse(localStorage.getItem('repairTickets') || '[]');
				const diagnosing = JSON.parse(localStorage.getItem('diagnosingTickets') || '[]');

				const updater = (arr) => (arr || []).map(t => {
					const rawId = t && (t.ticket_id || t.TicketID || t.id || t.DeviceID);
					const normId = t && (t.id || t.barcode || t.barcodeValue);
					if (String(rawId) === String(ticketId) || String(normId) === String(ticketId)) {
						// update both normalized status and raw.status for consistency
						const updatedRaw = t && t.raw && typeof t.raw === 'object' ? { ...t.raw, status: newStatus } : { ...(t.raw || {}), status: newStatus };
						return { ...t, status: newStatus, raw: updatedRaw };
					}
					return t;
				});

				localStorage.setItem('repairTickets', JSON.stringify(updater(repairTickets)));
				localStorage.setItem('diagnosingTickets', JSON.stringify(updater(diagnosing)));
			} catch (e) {
				// ignore
			}
		};

		const updateStatus = async (ticket, newStatus) => {
			// optimistic UI update — also update raw.status so rendered badge uses new value
			setTickets(prev => prev.map(t => {
				const matchId = String((t.raw && (t.raw.ticket_id || t.raw.TicketID)) || t.id);
				const tid = String((ticket.raw && (ticket.raw.ticket_id || ticket.raw.TicketID)) || ticket.id);
				if (matchId === tid) {
					return {
						...t,
						status: newStatus,
						raw: t.raw && typeof t.raw === 'object' ? { ...t.raw, status: newStatus } : { ...(t.raw || {}), status: newStatus }
					};
				}
				return t;
			}));

			// Prepare params similar to AssignedRepairs.updateRepairStatus
			let ticketId = (ticket && ticket.raw && (ticket.raw.ticket_id || ticket.raw.TicketID)) || ticket.id;

			const params = new URLSearchParams();
			params.append('ticket_id', ticketId);
			params.append('TicketID', ticketId);
			params.append('status', newStatus);
			params.append('Status', newStatus);

			// include raw fields to avoid overwriting with nulls
			if (ticket && ticket.raw && typeof ticket.raw === 'object') {
				Object.keys(ticket.raw).forEach(key => {
					const val = ticket.raw[key];
					if (val === null || typeof val === 'undefined') return;
					if (typeof val === 'object') {
						try { params.append(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
					} else {
						params.append(key, String(val));
					}
				});
			}

			try {
				const res = await api.post('http://localhost:60748/RepairTicket/UpdateRepairTicketStatus', params.toString(), {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});

				const ok = res && (res.status === 200 || (res.data && (res.data.StatusCode === 200 || res.data.success === true)));
				if (ok) {
					// persist to localStorage and confirm
					persistUpdateLocal(ticketId, newStatus);
					// ensure UI raw/status are synchronized with persisted state
					setTickets(prev => prev.map(t => {
						const matchId = String((t.raw && (t.raw.ticket_id || t.raw.TicketID)) || t.id);
						if (matchId === String(ticketId)) {
							return { ...t, status: newStatus, raw: t.raw && typeof t.raw === 'object' ? { ...t.raw, status: newStatus } : { ...(t.raw || {}), status: newStatus } };
						}
						return t;
					}));
					alert(`Status for ${ticketId} updated to ${newStatus}`);
					return;
				}

				throw new Error('Server response not OK');
			} catch (err) {
				console.warn('UpdateRepairTicketStatus failed, falling back to local update', err && err.message ? err.message : err);
				// fallback local update
				persistUpdateLocal(ticketId, newStatus);
				alert(`Status for ${ticketId} updated locally to ${newStatus}`);
			}
		};

	return (
		<div className="p-6">
			<h2 className="text-2xl font-semibold mb-4">My Performing task</h2>

			<div className="bg-white shadow rounded p-4">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{tickets.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No performing tasks</td>
								</tr>
							) : (
								tickets.map((t) => (
									<tr key={t.id}>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(t.raw && (t.raw.ticket_id || t.raw.TicketID)) || t.id || '-'}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(t.raw && (t.raw.brand || t.raw.device || t.raw.brand_name)) || t.brand || '-'}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(t.raw && (t.raw.issue_description || t.raw.issue || t.raw.problem)) || t.issue || '-'}</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
																	((t.raw && (t.raw.status || t.raw.Status)) || t.status) === 'Completed' ? 'bg-green-100 text-green-800' : ((t.raw && (t.raw.status || t.raw.Status)) || t.status) === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
																}`}>{(t.raw && (t.raw.status || t.raw.Status)) || t.status}</span>
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
																{t.status !== 'In Progress' && (
																	<button onClick={() => updateStatus(t, 'In Progress')} className="text-blue-600 hover:text-blue-900">Mark In Complete</button>
																)}
																{t.status !== 'Completed' && (
																	<button onClick={() => updateStatus(t, 'Completed')} className="text-green-600 hover:text-green-900">Mark Completed</button>
																)}
															</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default AgeetWorkPerformingTask;
