// pages/Analytics.js
import React from 'react';

const Analytics = () => {
  // Sample data for demonstration
  const monthlyData = [
    { month: 'Jan', repairs: 45, revenue: 4200 },
    { month: 'Feb', repairs: 52, revenue: 4800 },
    { month: 'Mar', repairs: 48, revenue: 4500 },
    { month: 'Apr', repairs: 60, revenue: 5600 },
    { month: 'May', repairs: 65, revenue: 6100 },
    { month: 'Jun', repairs: 70, revenue: 6700 }
  ];

  const deviceStats = [
    { brand: 'Apple', count: 120, percentage: 40 },
    { brand: 'Samsung', count: 90, percentage: 30 },
    { brand: 'Google', count: 45, percentage: 15 },
    { brand: 'Other', count: 45, percentage: 15 }
  ];

  const repairTypes = [
    { type: 'Screen Replacement', count: 95 },
    { type: 'Battery Replacement', count: 75 },
    { type: 'Charging Port', count: 45 },
    { type: 'Camera Repair', count: 35 },
    { type: 'Water Damage', count: 25 },
    { type: 'Other', count: 25 }
  ];

  const maxRepairs = Math.max(...monthlyData.map(data => data.repairs));
  const maxRevenue = Math.max(...monthlyData.map(data => data.revenue));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Repairs</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">300</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600">+15%</span> from last month
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">Rs 27,500</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600">+18%</span> from last month
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📱</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Repair Time</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">2.5 days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600">-0.5 days</span> from last month
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">⭐</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Customer Rating</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">4.8/5</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600">+0.2</span> from last month
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Repairs Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Repairs</h2>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div 
                        className="h-6 bg-blue-500 rounded-l" 
                        style={{ width: `${(data.repairs / maxRepairs) * 100}%` }}
                      ></div>
                      <div className="ml-2 text-sm text-gray-600">{data.repairs} repairs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div 
                        className="h-6 bg-green-500 rounded-l" 
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      ></div>
                      <div className="ml-2 text-sm text-gray-600">Rs {data.revenue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Brands */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Brands</h2>
            <div className="space-y-4">
              {deviceStats.map((device) => (
                <div key={device.brand}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{device.brand}</span>
                    <span className="text-sm text-gray-500">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repair Types */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Repair Types</h2>
            <div className="space-y-4">
              {repairTypes.map((repair) => (
                <div key={repair.type} className="flex items-center">
                  <div className="w-48 text-sm text-gray-600 truncate">{repair.type}</div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div 
                        className="h-6 bg-purple-500 rounded-l" 
                        style={{ width: `${(repair.count / 100) * 100}%` }}
                      ></div>
                      <div className="ml-2 text-sm text-gray-600">{repair.count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;