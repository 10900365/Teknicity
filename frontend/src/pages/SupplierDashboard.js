import React, { useState } from 'react';

const SupplierDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Sample data for demonstration
  const orders = [
    { id: 1, partName: 'iPhone 12 Battery', quantity: 5, shop: 'FixIt Mobile', status: 'Pending', date: '2023-05-15' },
    { id: 2, partName: 'USB-C Port', quantity: 10, shop: 'Phone Hospital', status: 'Shipped', date: '2023-05-10' },
    { id: 3, partName: 'Samsung Screen', quantity: 3, shop: 'Screen Masters', status: 'Delivered', date: '2023-05-05' }
  ];

  const inventory = [
    { id: 1, partName: 'iPhone 13 Screen', stock: 15, price: 89.99, category: 'Screens' },
    { id: 2, partName: 'Samsung Battery', stock: 25, price: 29.99, category: 'Batteries' },
    { id: 3, partName: 'USB-C Port', stock: 8, price: 12.99, category: 'Ports' },
    { id: 4, partName: 'Camera Module', stock: 12, price: 45.99, category: 'Cameras' }
  ];

  const stats = [
    { name: 'Total Orders', value: '24', change: '+4', changeType: 'positive', icon: '📦' },
    { name: 'Pending Orders', value: '3', change: '-2', changeType: 'positive', icon: '⏳' },
    { name: 'Low Stock Items', value: '2', change: '+1', changeType: 'negative', icon: '⚠️' },
    { name: 'Total Revenue', value: 'Rs 2,847', change: '+12%', changeType: 'positive', icon: '💰' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className={`font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>{' '}
                  <span className="text-gray-500">from last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{order.partName}</h3>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity} • {order.shop}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200">
              View All Orders
            </button>
          </div>
          
          {/* Inventory Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
            <div className="space-y-4">
              {inventory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.partName}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">Rs {item.price}</p>
                    <p className={`text-sm ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      Stock: {item.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;