import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({ siteTitle: 'TekniCity' });
  const [deviceName, setDeviceName] = useState('');
  const [devices, setDevices] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [adminForm, setAdminForm] = useState({ username: '', mobile: '', email: '' });
  const [adminErrors, setAdminErrors] = useState({});

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('devices') || '[]');
      const c = JSON.parse(localStorage.getItem('inventoryCategories') || '[]');
      const s = JSON.parse(localStorage.getItem('appSettings') || 'null');
      if (Array.isArray(d)) setDevices(d);
      if (Array.isArray(c)) setCategories(c);
      if (s) setSettings(prev => ({ ...prev, ...s }));
    } catch (e) {
      // ignore
    }
  }, []);

  const saveSettings = (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      alert('Settings saved locally');
    } catch (err) {
      console.error(err);
    }
  };

  const submitCreateAdmin = () => {
    (async () => {
      const { username, mobile, email } = adminForm;
      // Validate before submitting
      const errs = validateAdminForm(adminForm);
      if (Object.keys(errs).length > 0) { setAdminErrors(errs); return alert('Please fix the highlighted errors before submitting.'); }
      if (!username) return alert('Enter username');

      const localEntry = { id: Date.now(), username, mobile, email, status: 'Admin', createdAt: new Date().toISOString(), synced: false };

      // Try to send to server (form-encoded). If server responds OK, persist returned data.
      try {
        const form = new URLSearchParams();
        // Map fields to expected server column names
        form.append('UserName', username);
        form.append('MobileNo', mobile || '');
        form.append('Email', email || '');
        // Always send status as Admin
        form.append('Role', 'Admin');

        const res = await fetch('http://localhost:60748/Login/AddUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });

        const body = await res.json().catch(() => null);
        if (res.ok) {
          const returnedId = body && (body.id || body.ID || body.UserID || body.insertId || null);
          const saved = { ...localEntry, id: returnedId || localEntry.id, synced: true, raw: body };
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          users.push(saved);
          localStorage.setItem('users', JSON.stringify(users));
          setAdminForm({ username: '', mobile: '', email: '' });
          alert('Admin added on server');
          return;
        }

        console.warn('AddUser response', res.status, body);
      } catch (err) {
        console.warn('AddUser request failed', err && (err.message || String(err)));
      }

      // Fallback: save locally so user doesn't lose data
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(localEntry);
        localStorage.setItem('users', JSON.stringify(users));
        setAdminForm({ username: '', mobile: '', email: '' });
        alert('Admin saved locally (server unavailable or rejected).');
      } catch (err) {
        console.error(err);
        alert('Failed to save admin.');
      }
    })();
  };

  const validateAdminForm = (form) => {
    const e = {};
    if (!form || typeof form !== 'object') return e;
    const uname = (form.username || '').toString().trim();
    const mob = (form.mobile || '').toString().trim();
    const mail = (form.email || '').toString().trim();

    if (!uname) e.username = 'Username is required.';
    else if (uname.length < 3) e.username = 'Username must be at least 3 characters.';

    if (mob) {
      const digits = mob.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 10) e.mobile = 'Enter a valid mobile number (10 digits).';
    }

    if (!mail) e.email = 'Email is required.';
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(mail)) e.email = 'Enter a valid email address.';
    }

    return e;
  };

  const saveDevice = async () => {
    const name = (deviceName || '').trim();
    if (!name) return alert('Enter a device name');
    const localId = Date.now();
    const entry = { id: localId, name, createdAt: new Date().toISOString(), synced: false };
    const updated = [...devices, entry];
    setDevices(updated);
    try { localStorage.setItem('devices', JSON.stringify(updated)); } catch (e) {}
    setDeviceName('');

    // server expects form-encoded fields: brand, BrandName, Name
    try {
      const form = new URLSearchParams();
      form.append('brand', name);
      form.append('BrandName', name);
      form.append('Name', name);
      const res = await fetch('http://localhost:60748/DeviceBrand/AddBrand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        const returnedId = body && (body.id || body.ID || body.BrandID || body.insertId || null);
        const merged = updated.map(d => d.id === localId ? { ...d, id: returnedId || d.id, synced: true, raw: body } : d);
        setDevices(merged); try { localStorage.setItem('devices', JSON.stringify(merged)); } catch (e) {}
        alert('Device saved to server');
        return;
      }
      console.warn('AddBrand response', res.status, body);
    } catch (err) {
      console.warn('AddBrand request failed', err && (err.message || String(err)));
    }

    alert('Device saved locally (server unavailable or rejected).');
  };

  const saveInventoryCategory = async () => {
    const name = (categoryName || '').trim();
    if (!name) return alert('Enter a category name');
    const localId = Date.now();
    const entry = { id: localId, name, createdAt: new Date().toISOString(), synced: false };
    const updated = [...categories, entry];
    setCategories(updated);
    try { localStorage.setItem('inventoryCategories', JSON.stringify(updated)); } catch (e) {}
    setCategoryName('');

    // try JSON first
    try {
      const res = await fetch('http://localhost:60748/InventoryCategory/AddCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        const returnedId = body && (body.id || body.ID || body.CategoryID || body.insertId || null);
        const merged = updated.map(d => d.id === localId ? { ...d, id: returnedId || d.id, synced: true, raw: body } : d);
        setCategories(merged); try { localStorage.setItem('inventoryCategories', JSON.stringify(merged)); } catch (e) {}
        alert('Category saved to server');
        return;
      }
      console.warn('AddCategory response', res.status, body);
    } catch (err) {
      console.warn('AddCategory request failed', err && (err.message || String(err)));
    }

    // fallback form-encoded
    try {
      const form = new URLSearchParams();
      form.append('name', name);
      form.append('CategoryName', name);
      const res2 = await fetch('http://localhost:60748/InventoryCategory/AddCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const body2 = await res2.json().catch(() => null);
      if (res2.ok) {
        const returnedId = body2 && (body2.id || body2.ID || body2.CategoryID || body2.insertId || null);
        const merged = updated.map(d => d.id === localId ? { ...d, id: returnedId || d.id, synced: true, raw: body2 } : d);
        setCategories(merged); try { localStorage.setItem('inventoryCategories', JSON.stringify(merged)); } catch (e) {}
        alert('Category saved to server');
        return;
      }
      console.warn('AddCategory form response', res2.status, body2);
    } catch (err) {
      console.warn('AddCategory form failed', err && (err.message || String(err)));
    }

    alert('Category saved locally (server unavailable or rejected).');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <form onSubmit={saveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Site Title</h3>
              <input name="siteTitle" value={settings.siteTitle} onChange={(e) => setSettings(s => ({ ...s, siteTitle: e.target.value }))} className="mt-3 block w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Create Admin</h3>
              <div className="space-y-3 mt-3">
                <div>
                  <input name="username" value={adminForm.username} onChange={(e) => { const v = e.target.value; setAdminForm(a => ({ ...a, username: v })); setAdminErrors(prev => { const copy = { ...prev }; delete copy.username; return copy; }); }} placeholder="Username" className="block w-full border border-gray-300 rounded px-3 py-2" />
                  {adminErrors.username && <div className="text-xs text-red-600 mt-1">{adminErrors.username}</div>}
                </div>
                <div>
                  <input name="mobile" value={adminForm.mobile} onChange={(e) => { const v = e.target.value; setAdminForm(a => ({ ...a, mobile: v })); const errs = validateAdminForm({ ...adminForm, mobile: v }); setAdminErrors(prev => ({ ...prev, ...(errs.mobile ? { mobile: errs.mobile } : {}), ...(errs.username ? {} : {}) })); }} placeholder="Mobile" className="block w-full border border-gray-300 rounded px-3 py-2" />
                  {adminErrors.mobile && <div className="text-xs text-red-600 mt-1">{adminErrors.mobile}</div>}
                </div>
                <div>
                  <input name="email" value={adminForm.email} onChange={(e) => { const v = e.target.value; setAdminForm(a => ({ ...a, email: v })); const errs = validateAdminForm({ ...adminForm, email: v }); setAdminErrors(prev => ({ ...prev, ...(errs.email ? { email: errs.email } : {}) })); }} placeholder="Email" className="block w-full border border-gray-300 rounded px-3 py-2" />
                  {adminErrors.email && <div className="text-xs text-red-600 mt-1">{adminErrors.email}</div>}
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={submitCreateAdmin} disabled={Object.keys(validateAdminForm(adminForm)).length > 0} className={`px-4 py-2 rounded ${Object.keys(validateAdminForm(adminForm)).length > 0 ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white'}`}>Add Admin</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Device</h3>
              <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="e.g., iPhone 13" className="mt-3 block w-full border border-gray-300 rounded px-3 py-2" />
              <div className="mt-3 flex justify-end"><button type="button" onClick={saveDevice} className="px-4 py-2 bg-blue-600 text-white rounded">Save Device</button></div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Add InventoryCategory</h3>
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g., Screens, Batteries" className="mt-3 block w-full border border-gray-300 rounded px-3 py-2" />
              <div className="mt-3 flex justify-end"><button type="button" onClick={saveInventoryCategory} className="px-4 py-2 bg-blue-600 text-white rounded">Save Category</button></div>
            </div>
          </div>

          <div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Settings</button></div>
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium">Saved Devices</h4>
            <ul className="mt-2 text-sm text-gray-700">
              {devices.map(d => <li key={d.id} className="py-1">{d.name} <span className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</span></li>)}
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium">Saved Categories</h4>
            <ul className="mt-2 text-sm text-gray-700">
              {categories.map(c => <li key={c.id} className="py-1">{c.name} <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
