import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STORAGE_KEY = 'inventoryParts';
const LOW_STOCK_THRESHOLD = 5;

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [partsCatalog, setPartsCatalog] = useState([]);
  const [loadingPartsCatalog, setLoadingPartsCatalog] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newPart, setNewPart] = useState({ name: '', category: '', categoryId: '', quantity: '', price: '' });
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/SupplierInventory/GetAllSupplierInventory');
        let payload = res && res.data ? (res.data.ResultSet || res.data.Result || res.data) : null;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch (e) { /* ignore */ }
        }

        const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
        const normalized = (arr || []).map((item, idx) => ({
          id: item.inventory_id || item.id || item.part_id || item.PartID || item.ID || idx + 1,
          name: item.part_name || item.PartName || item.name || item.partName || '',
          category: item.category || item.Category || item.group || '',
          quantity: Number(item.stock_quantity || item.stock || item.quantity || 0),
          price: Number(item.price || item.unit_price || item.cost || 0),
          status: item.status || item.Status || (Number(item.stock_quantity || item.stock || item.quantity || 0) === 0 ? 'Out of Stock' : 'In Stock')
        }));

        if (mounted) {
          setParts(normalized);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch (e) {}
        }
        return;
      } catch (e) {
        console.warn('Failed to load SupplierInventory from server, falling back to localStorage', e);
      }

      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (mounted) setParts(Array.isArray(stored) ? stored : []);
      } catch (err) {
        if (mounted) setParts([]);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/InventoryCategory/GetAllCategories');
        let payload = res && res.data ? (res.data.ResultSet || res.data.Result || res.data) : null;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch (e) { /* ignore */ }
        }

        const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
        const normalized = (arr || []).map((c, idx) => {
          if (!c) return { id: idx + 1, name: String(c || '') };
          if (typeof c === 'string') return { id: c, name: c };
          const rawId = c.id || c.category_id || c.CategoryId || c.CategoryID || '';
          const idStr = rawId != null && String(rawId).trim() !== '' ? String(rawId) : '';
          const numericId = idStr && /^\d+$/.test(idStr) ? idStr : null;
          return { id: numericId, name: (c.name || c.category || c.Category || String(c)).toString() };
        });

        if (mounted) {
          setCategories(normalized);
          try { localStorage.setItem('inventoryCategories', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
        }
      } catch (err) {
        try {
          const stored = JSON.parse(localStorage.getItem('inventoryCategories') || '[]');
          if (mounted) setCategories(Array.isArray(stored) ? stored : []);
        } catch (e) {
          if (mounted) setCategories([]);
        }
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    // load parts catalog to allow selecting existing part names
    (async function loadPartsCatalog(){
      setLoadingPartsCatalog(true);
      try {
        const res = await api.get('/PartRequest/GetWPartrequst');
        let payload = res && res.data ? (res.data.ResultSet || res.data.Result || res.data) : null;
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch(e) { /* ignore */ } }
        const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
        const normalized = (arr || []).map((p, idx) => ({
          id: p.id || p.part_id || p.PartID || idx + 1,
          name: p.part_name || p.PartName || p.name || p.part || ''
        }));
        if (mounted) {
          setPartsCatalog(normalized);
          try { localStorage.setItem('partsCatalog', JSON.stringify(normalized)); } catch (e) {}
        }
      } catch (e) {
        try {
          const stored = JSON.parse(localStorage.getItem('partsCatalog') || '[]');
          if (mounted) setPartsCatalog(Array.isArray(stored) ? stored : []);
        } catch (err) {
          if (mounted) setPartsCatalog([]);
        }
      } finally { if (mounted) setLoadingPartsCatalog(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const persist = (next) => {
    setParts(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
  };

  const computeStatusFromQty = (qty) => {
    const n = Number(qty || 0);
    if (n === 0) return 'Out of Stock';
    if (n > 0 && n <= LOW_STOCK_THRESHOLD) return 'Low Stock';
    return 'In Stock';
  };

  const resolveCategoryDisplay = (catValue, fallbackName) => {
    if (catValue == null) return fallbackName || '';
    const asString = String(catValue);
    const byId = categories.find(c => String(c.id) === asString);
    if (byId) return byId.name;
    const byName = categories.find(c => String(c.name).toLowerCase() === asString.toLowerCase());
    if (byName) return byName.name;
    return fallbackName || asString;
  };

  const totalItems = parts.length;
  const inStock = parts.filter(p => Number(p.quantity) > 0).length;
  const outOfStock = parts.filter(p => Number(p.quantity) === 0).length;
  const lowStock = parts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= LOW_STOCK_THRESHOLD).length;

  const filteredParts = (String(searchQuery || '').trim() === '') ? parts : (parts || []).filter(p => {
    try { return String(p && (p.name || p.part_name || p.part || '')).toLowerCase().indexOf(String(searchQuery).toLowerCase()) !== -1; } catch (e) { return false; }
  });

  const handleOpenAdd = (part = null) => {
    if (part) {
      const found = categories.find(c => String(c.name).trim() === String(part.category).trim() || String(c.id) === String(part.category) || String(c.id) === String(part.categoryId));
      const isCustom = !found;
      setIsCustomCategory(Boolean(isCustom));
      // determine if the part name exists in catalog
      const catalogMatch = partsCatalog.find(pc => String(pc.name).toLowerCase() === String(part.name).toLowerCase());
      setSelectedCatalogId(catalogMatch ? String(catalogMatch.id) : '__other');
      setNewPart({ id: part.id, name: part.name, category: part.category, categoryId: found ? found.id : '', quantity: String(part.quantity), price: String(part.price) });
    } else {
      setIsCustomCategory(false);
      setNewPart({ name: '', category: '', categoryId: '', quantity: '', price: '' });
      setSelectedCatalogId('');
    }
    setShowAdd(true);
  };

  const handleSavePart = async (e) => {
    e.preventDefault();
    if (!newPart.name.trim()) { alert('Please enter a Part Name'); return; }
    if (!String(newPart.category || '').trim()) { alert('Please select or enter a Category'); return; }
    const qty = Number(newPart.quantity || 0);
    if (isNaN(qty) || qty < 0) { alert('Quantity must be a non-negative number'); return; }
    const price = Number(newPart.price || 0);
    if (isNaN(price) || price < 0) { alert('Price must be a non-negative number'); return; }

    if (newPart.id) {
      const formUpdate = new URLSearchParams();
      formUpdate.append('inventory_id', String(newPart.id));
      formUpdate.append('part_name', newPart.name.trim());

      let categoryForUpdate = '';
      if (newPart.category && String(newPart.category).trim()) { categoryForUpdate = String(newPart.category).trim(); }
      else if (newPart.categoryId) { const foundCat = categories.find(c => String(c.id) === String(newPart.categoryId)); categoryForUpdate = foundCat ? String(foundCat.name) : ''; }
      if (categoryForUpdate) formUpdate.append('category', categoryForUpdate);

      const existing = parts.find(p => String(p.id) === String(newPart.id));
      const existingQty = Number(existing && existing.quantity ? existing.quantity : 0);
      // The form provides the absolute stock quantity when editing.
      // Use the provided quantity as the new total, do not add it to existing stock.
      const newStockQty = qty;
      formUpdate.append('stock_quantity', String(newStockQty));
      formUpdate.append('price', String(price));
      formUpdate.append('status', computeStatusFromQty(newStockQty));

      try {
        console.debug('Attempting UpdateSupplierInventory with payload (form):', Object.fromEntries(formUpdate.entries()));
        const url = 'http://localhost:60748/SupplierInventory/UpdateSupplierInventory';
        let res = null;
        const payloadObj = Object.fromEntries(formUpdate.entries());

        try { res = await api.put(url, formUpdate, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }); console.debug('PUT (form) succeeded'); }
        catch (putFormErr) {
          console.warn('PUT (form) failed, trying PUT (JSON).', putFormErr && putFormErr.message);
          try { res = await api.put(url, payloadObj, { headers: { 'Content-Type': 'application/json' } }); console.debug('PUT (json) succeeded'); }
          catch (putJsonErr) {
            console.warn('PUT (json) failed, trying POST (form).', putJsonErr && putJsonErr.message);
            try { res = await api.post(url, formUpdate, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }); console.debug('POST (form) succeeded'); }
            catch (postFormErr) { res = await api.post(url, payloadObj, { headers: { 'Content-Type': 'application/json' } }); console.debug('POST (json) succeeded'); }
          }
        }

        console.debug('UpdateSupplierInventory response:', res && res.data ? res.data : res);

        let updated = null;
        if (res && res.data) {
          const body = res.data.ResultSet || res.data.Result || res.data;
          if (Array.isArray(body) && body.length > 0) updated = body[0];
          else if (body && typeof body === 'object') updated = body;
          else if (res.data && typeof res.data === 'object' && (res.data.inventory_id || res.data.part_id || res.data.id || res.data.ID)) updated = res.data;
        }

        if (updated) {
          const next = parts.map(p => p.id !== newPart.id ? p : ({
            id: updated.inventory_id || updated.part_id || updated.id || updated.ID || newPart.id,
            name: updated.part_name || updated.PartName || updated.name || newPart.name.trim(),
            category: resolveCategoryDisplay(updated.category || updated.Category || updated.category_id || updated.CategoryId || newPart.category.trim(), newPart.category.trim()),
            quantity: Number(updated.stock_quantity || updated.stock || updated.quantity || newStockQty),
            price: Number(updated.price || updated.unit_price || updated.cost || price),
            status: updated.status || computeStatusFromQty(Number(updated.stock_quantity || updated.stock || updated.quantity || newStockQty))
          }));
          persist(next);
          setShowAdd(false);
          alert('Part updated.');
          return;
        }

        try {
          const listRes = await api.get('/SupplierInventory/GetAllSupplierInventory');
          let payload = listRes && listRes.data ? (listRes.data.ResultSet || listRes.data.Result || listRes.data) : null;
          if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { /* ignore */ } }
          const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
          const normalizedList = (arr || []).map((item, idx) => ({
            id: item.inventory_id || item.id || item.part_id || item.PartID || item.ID || idx + 1,
            name: item.part_name || item.PartName || item.name || item.partName || '',
            category: item.category || item.Category || item.group || '',
            quantity: Number(item.stock_quantity || item.stock || item.quantity || 0),
            price: Number(item.price || item.unit_price || item.cost || 0),
            status: item.status || item.Status || (Number(item.stock_quantity || item.stock || item.quantity || 0) === 0 ? 'Out of Stock' : 'In Stock')
          }));
          persist(normalizedList);
          setShowAdd(false);
          alert('Part updated (server refreshed).');
          return;
        } catch (fetchErr) {
          console.warn('Update succeeded but failed to refresh list from server, falling back to local update', fetchErr);
          const next = parts.map(p => p.id === newPart.id ? { ...p, name: newPart.name.trim(), category: newPart.category.trim(), quantity: newStockQty, price } : p);
          persist(next);
          setShowAdd(false);
          alert('Part updated locally (server response incomplete).');
          return;
        }
      } catch (err) {
        try {
          const status = err && err.response && err.response.status;
            const data = err && err.response && err.response.data;
            console.error('Update failed:', { status, data, message: err.message });
            const serverMsg = (data && (data.Result || data.message || data.Message)) || JSON.stringify(data) || err.message || String(err);
            alert('Failed to update on server. Server response: ' + (status ? ('HTTP ' + status + ' - ') : '') + serverMsg);
          } catch (e) { console.error('Error while reporting update failure', e); }
          const next = parts.map(p => p.id === newPart.id ? { ...p, name: newPart.name.trim(), category: newPart.category.trim(), quantity: qty, price } : p);
        persist(next);
        setShowAdd(false);
        alert('Part updated locally (server unavailable).');
        return;
      }
    }

    if (isCustomCategory) { alert('Custom categories are not allowed directly. Please choose an existing category from the list or add the category on the server first via InventoryCategory management.'); return; }

    const form = new URLSearchParams();
    const partName = newPart.name.trim();
    let categoryIdVal = newPart.categoryId ? String(newPart.categoryId).trim() : '';
    let categoryName = newPart.category ? newPart.category.trim() : '';
    const statusVal = computeStatusFromQty(qty);

    if (categoryIdVal && !/^\d+$/.test(categoryIdVal)) {
      const found = categories.find(c => String(c.name).toLowerCase() === String(categoryIdVal).toLowerCase() || String(c.name).toLowerCase() === String(categoryName).toLowerCase());
      if (found && found.id && /^\d+$/.test(String(found.id))) { categoryIdVal = String(found.id); categoryName = found.name; }
      else { console.warn('categoryId is non-numeric and could not be resolved to a numeric id, will send category name only', categoryIdVal); categoryIdVal = ''; }
    }

    form.append('part_name', partName);
    if (categoryIdVal) { form.append('category_id', categoryIdVal); } else { form.append('category', categoryName); }
    form.append('stock_quantity', String(qty));
    form.append('price', String(price));
    form.append('status', statusVal);
    if (newPart.categoryId) form.append('category_id', String(newPart.categoryId));

    try {
      const payloadObj = Object.fromEntries(form.entries());
      console.debug('Posting AddSupplierInventory payload:', payloadObj);
      const res = await api.post('/SupplierInventory/AddSupplierInventory', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      console.debug('AddSupplierInventory response:', res && res.data ? res.data : res);
      let created = null;
      if (res && res.data) {
        const body = res.data.ResultSet || res.data.Result || res.data;
        if (Array.isArray(body) && body.length > 0) created = body[0];
        else if (body && typeof body === 'object') created = body;
        else if (res.data && typeof res.data === 'object' && (res.data.part_id || res.data.part_name || res.data.ID)) created = res.data;
      }

      if (created) {
        const normalized = {
          id: created.inventory_id || created.part_id || created.id || created.ID || (parts.length > 0 ? Math.max(...parts.map(p => Number(p.id || 0))) + 1 : 1),
          name: created.part_name || created.PartName || created.name || newPart.name.trim(),
          category: resolveCategoryDisplay(created.category || created.Category || created.category_id || created.CategoryId || newPart.category.trim(), newPart.category.trim()),
          quantity: Number(created.stock_quantity || created.stock || created.quantity || qty),
          price: Number(created.price || created.unit_price || created.cost || price),
          status: created.status || computeStatusFromQty(Number(created.stock_quantity || created.stock || created.quantity || qty))
        };
        const next = [normalized, ...parts];
        persist(next);
        setShowAdd(false);
        alert('Part added to supplier inventory.');
        return;
      }
    } catch (err) {
      try {
        const serverMsg = ((err && err.response && err.response.data && (err.response.data.Result || err.response.data.message || err.response.data.Message)) || err.message || '');
        if (typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('check constraint')) {
          try {
            const catRes = await api.get('/InventoryCategory/GetAllCategories');
            let payload = catRes && catRes.data ? (catRes.data.ResultSet || catRes.data.Result || catRes.data) : null;
            if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { /* ignore */ } }
            const arr = Array.isArray(payload) ? payload : (payload && payload.ResultSet) ? payload.ResultSet : [];
            const names = (arr || []).map(c => (typeof c === 'string' ? c : (c.name || c.Category || c.category))).filter(Boolean);
            alert('Server rejected the category value. Please choose one of the server categories: ' + (names.join(', ') || '[none]') + '\nServer message: ' + serverMsg);
          } catch (fetchErr) { alert('Server rejected the category value. Please choose an existing category on the server. Server message: ' + serverMsg); }
          return;
        }
      } catch (e) { /* ignore */ }
      console.warn('Failed to add part to supplier endpoint, falling back to local save', err);
    }

    const id = parts.length > 0 ? Math.max(...parts.map(p => Number(p.id || 0))) + 1 : 1;
    const part = { id, name: newPart.name.trim(), category: newPart.category.trim(), quantity: qty, price, status: computeStatusFromQty(qty) };
    const next = [part, ...parts];
    persist(next);
    setShowAdd(false);
    alert('Part saved locally (server unavailable).');
  };

  const handleDeletePart = async (id) => {
    if (!window.confirm('Delete this part?')) return;
    const url = `http://localhost:60748/SupplierInventory/DeleteSupplierInventory?inventory_id=${encodeURIComponent(id)}`;
    try {
      const res = await api.delete(url);
      console.debug('DeleteSupplierInventory response:', res && res.data ? res.data : res);
      const next = parts.filter(p => p.id !== id);
      persist(next);
      alert('Part deleted.');
      return;
    } catch (err) {
      console.warn('Failed to delete part on server, falling back to local removal', err);
      try {
        const status = err && err.response && err.response.status;
        const data = err && err.response && err.response.data;
        const serverMsg = (data && (data.Result || data.message || data.Message)) || JSON.stringify(data) || err.message || String(err);
        alert('Failed to delete on server. Removing locally. Server response: ' + (status ? ('HTTP ' + status + ' - ') : '') + serverMsg);
      } catch (e) {
        // ignore
      }
      const next = parts.filter(p => p.id !== id);
      persist(next);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <div>
            <button onClick={() => handleOpenAdd()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">Add New Part</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Total Items</div>
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">In Stock</div>
            <div className="text-2xl font-bold text-green-600">{inStock}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Low Stock</div>
            <div className="text-2xl font-bold text-orange-500">{lowStock}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="mb-4">
            <input type="text" placeholder="Search parts by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredParts || []).map(p => {
                  const qty = Number(p.quantity || 0);
                  const derivedStatus = qty === 0 ? 'Out of Stock' : (qty <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock');
                  const status = (p.status && String(p.status).trim()) ? p.status : derivedStatus;
                  return (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.category}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${qty === 0 ? 'text-red-600' : qty <= LOW_STOCK_THRESHOLD ? 'text-orange-500' : 'text-green-700'}`}>{qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(p.price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button onClick={() => handleOpenAdd(p)} className="text-sm text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDeletePart(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                )})}
                {parts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No parts yet. Click "Add New Part" to create one.</td>
                  </tr>
                )}

                {parts.length > 0 && filteredParts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No parts match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{newPart && newPart.id ? 'Edit Part' : 'Add New Part'}</h2>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSavePart}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part Name *</label>
                    <div>
                      <select id="part_catalog" name="part_catalog" value={selectedCatalogId || ''} onChange={(e) => {
                        const v = e.target.value;
                        setSelectedCatalogId(v);
                        if (v === '__other') {
                          // keep existing custom name if present
                          setNewPart({ ...newPart, name: newPart.name || '' });
                        } else {
                          const sel = partsCatalog.find(pc => String(pc.id) === String(v));
                          if (sel) setNewPart({ ...newPart, name: sel.name });
                          else setNewPart({ ...newPart, name: '' });
                        }
                      }} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Select existing part (or choose Other)</option>
                        {(!loadingPartsCatalog && Array.isArray(partsCatalog) && partsCatalog.length > 0) ? partsCatalog.map(pc => (
                          <option key={pc.id || pc.name} value={pc.id}>{pc.name}</option>
                        )) : null}
                        <option value="__other">Other (enter custom name)</option>
                      </select>
                      {selectedCatalogId === '__other' && (
                        <input id="part_name" name="part_name" type="text" placeholder="Enter custom part name" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md" required />
                      )}
                      {(!selectedCatalogId || selectedCatalogId === '') && (
                        <div className="text-xs text-gray-500 mt-1">You may select an existing part or choose Other to type a new name.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div>
                      <select id="category_select" name="category_select"
                        value={isCustomCategory ? '__other' : (newPart.categoryId ? newPart.categoryId : (newPart.category ? `__name:${newPart.category}` : ''))}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__other') { setIsCustomCategory(true); setNewPart({ ...newPart, category: '', categoryId: '' }); }
                          else if (val && String(val).startsWith('__name:')) { const name = String(val).slice(7); setIsCustomCategory(false); setNewPart({ ...newPart, category: name, categoryId: '' }); }
                          else { setIsCustomCategory(false); const sel = categories.find(c => String(c.id) === String(val)); if (sel) setNewPart({ ...newPart, category: sel.name, categoryId: String(sel.id) }); else setNewPart({ ...newPart, category: '', categoryId: '' }); }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select category</option>
                        {(!loadingCategories && Array.isArray(categories) && categories.length > 0) ? categories.map(c => (
                          <option key={c.id || c.name} value={c.id ? c.id : `__name:${c.name}`}>{c.name}</option>
                        )) : null}
                        <option value="__other">Other (type below)</option>
                      </select>
                      {isCustomCategory && (
                        <input id="category_custom" name="category_custom" type="text" placeholder="Enter category" value={newPart.category} onChange={(e) => setNewPart({ ...newPart, category: e.target.value, categoryId: '' })} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md" />
                      )}
                    </div>
                    {loadingCategories && <div className="text-xs text-gray-500 mt-1">Loading categories...</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input id="stock_quantity" name="stock_quantity" type="number" min="0" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input id="price" name="price" type="number" min="0" step="0.01" value={newPart.price} onChange={(e) => setNewPart({ ...newPart, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{newPart && newPart.id ? 'Update Part' : 'Save Part'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
