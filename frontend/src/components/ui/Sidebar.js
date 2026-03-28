import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ title = 'TekniCity', navigation = [] }) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${{
                  true: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }[true]} ${location.pathname === item.href ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <span className="mr-3 text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
