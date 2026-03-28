import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserService from '../services/UserService';
import Topbar from './ui/Topbar';

const ShopOwnerLayout = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [displayName, setDisplayName] = useState('');
  // normalize mobile once so the effect below can depend on a stable primitive
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
        // ignore — keep local
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
    { name: 'Dashboard', href: '/shop-owner/dashboard', icon: '📊' },
    { name: 'Repair Tickets', href: '/shop-owner/tickets', icon: '🔧' },
    { name: 'Technicians', href: '/shop-owner/repairmen', icon: '👨‍🔧' },
    { name: 'Customer Bills', href: '/shop-owner/bills', icon: '🧾' },
    { name: 'Parts History', href: '/shop-owner/parts-history', icon: '📈' },
    { name: 'Phone Returns', href: '/shop-owner/phone-returns', icon: '📞' },
    { name: 'Inventory', href: '/shop-owner/inventory', icon: '📦' },
    // { name: 'Repair Tickets', href: '/shop-owner/tickets', icon: '🔧' },
    // { name: 'Technicians', href: '/shop-owner/repairmen', icon: '👨‍🔧' },
    // { name: 'Customer Bills', href: '/shop-owner/bills', icon: '🧾' },
  // { name: 'Parts History', href: '/shop-owner/parts-history', icon: '📦' },
  { name: 'Settings', href: '/shop-owner/settings', icon: '⚙️' },
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

  // Admin creation moved to Settings page

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
            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">{displayName || (user.username && !(/^user\d{2,}$/.test(user.username)) ? user.username : '')}</p>
                  <p className="text-xs font-medium text-gray-500">Shop Owner</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    title="Logout (destructive)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4z" clipRule="evenodd" />
                      <path d="M9 7a1 1 0 011-1h4.586l-1.293-1.293a1 1 0 111.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L14.586 9H10a1 1 0 01-1-1z" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
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
                <div className="w-full flex items-center">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700">{displayName || (user.username && !(/^user\d{2,}$/.test(user.username)) ? user.username : '')}</p>
                    <p className="text-xs text-gray-500">Shop Owner</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      title="Logout (destructive)"
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

      {/* Admin creation moved to Settings page */}
    </div>
  );
};

export default ShopOwnerLayout;