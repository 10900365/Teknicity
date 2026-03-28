// components/SupplierLayout.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserService from '../services/UserService';
import Topbar from './ui/Topbar';

const SupplierLayout = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [displayName, setDisplayName] = useState('');
  const mobile = (user && (user.phone || user.mobile || user.MobileNo || user.Mobile || user.mobileNo || '')).toString().replace(/\D/g, '');

  useEffect(() => {
    let mounted = true;
    const isAuto = (n) => typeof n === 'string' && (/^user\d{2,}$/.test(n) || /^u\d{2,}$/.test(n));

    const raw = user || {};
    const setFromLocal = () => {
      const candidate = raw.UserName || raw.username || raw.name || raw.displayName || raw.fullName || '';
      if (candidate && !isAuto(candidate)) setDisplayName(candidate);
    };

    setFromLocal();

    if (!mobile) return undefined;

    (async () => {
      try {
        const res = await UserService.testGetUserRole(mobile);
        if (!mounted || !res || !res.data) return;
        const maybe = (res.data.ResultSet && res.data.ResultSet[0]) || res.data.Result || res.data;
        const name = (maybe && (maybe.UserName || maybe.User || maybe.Name || maybe.name || maybe.displayName || maybe.fullName)) || '';
        if (name && !isAuto(name)) setDisplayName(String(name));
      } catch (err) {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, [mobile]);

  const getSiteTitle = () => {
    try {
      const s = JSON.parse(localStorage.getItem('appSettings') || 'null');
      return (s && s.siteTitle) ? String(s.siteTitle) : 'TekniCity';
    } catch (e) { return 'TekniCity'; }
  };
  const siteTitle = getSiteTitle();

  const navigation = [
    { name: 'Dashboard', href: '/supplier/dashboard', icon: '📊' },
    { name: 'Orders', href: '/supplier/orders', icon: '📋' },
    { name: 'Inventory', href: '/supplier/inventory', icon: '📦' },
    { name: 'Supplier Receipts', href: '/supplier/receipts', icon: '🧾' },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-800">{siteTitle}</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{displayName || (user.username && !(/^user\d{2,}$/.test(user.username)) ? user.username : '')}</p>
                <p className="text-xs font-medium text-gray-500">Supplier</p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-auto text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile topbar */}
      <div className="md:hidden w-full">
        <Topbar title={siteTitle} onOpenMobile={() => setMobileOpen(true)} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 z-50 flex">
            <div className="w-64 sm:w-72 bg-white shadow-xl pb-4 flex flex-col overflow-y-auto h-full">
              <div className="px-4 pt-5 pb-2 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">{siteTitle}</h1>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{displayName || (user.username && !(/^user\d{2,}$/.test(user.username)) ? user.username : '')}</p>
                    <p className="text-xs text-gray-500">Supplier</p>
                  </div>
                  <div className="ml-auto">
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="dashboard-main h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;