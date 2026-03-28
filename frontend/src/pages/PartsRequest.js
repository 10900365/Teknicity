// pages/PartsRequest.js
import React, { useState, useEffect } from 'react';

const PartsRequest = () => {
  const [partRequest, setPartRequest] = useState({
    partName: '',
    quantity: 1,
    urgency: 'Normal',
    neededBy: '',
    supplierId: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [requestedParts, setRequestedParts] = useState([]);

  useEffect(() => {
    // Load suppliers and parts requests from localStorage
    const loadData = () => {
      const suppliersData = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const partsRequestsData = JSON.parse(localStorage.getItem('partsRequests') || '[]');
      setSuppliers(suppliersData);
      setRequestedParts(partsRequestsData);
    };

    loadData();
    
    // Refresh data every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const selectedSupplier = suppliers.find(s => s.supplier_id === partRequest.supplierId);
    
    const newRequest = {
      id: Date.now(),
      partName: partRequest.partName,
      quantity: parseInt(partRequest.quantity),
      urgency: partRequest.urgency,
      neededBy: partRequest.neededBy,
      status: 'Pending',
      requestedDate: new Date().toISOString().split('T')[0],
      requestedBy: user.username || 'repairman',
      supplierId: partRequest.supplierId,
      supplierName: selectedSupplier?.company_name || 'Unknown Supplier',
      messages: []
    };

    // Save to localStorage
    const updatedRequests = [...requestedParts, newRequest];
    localStorage.setItem('partsRequests', JSON.stringify(updatedRequests));
    setRequestedParts(updatedRequests);
    
    alert(`Part request for ${partRequest.partName} submitted successfully!`);
    
    setPartRequest({
      partName: '',
      quantity: 1,
      urgency: 'Normal',
      neededBy: '',
      supplierId: ''
    });
  };

  const handleInputChange = (e) => {
    setPartRequest({
      ...partRequest,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Normal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Parts Request</h1>

        {/* Request Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request New Part</h2>
          <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Part Name</label>
              <input
                type="text"
                name="partName"
                value={partRequest.partName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., iPhone 13 Screen, Samsung Battery"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={partRequest.quantity}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
              <select
                name="urgency"
                value={partRequest.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <select
                name="supplierId"
                value={partRequest.supplierId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.company_name} - {supplier.part_specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Needed By Date</label>
              <input
                type="date"
                name="neededBy"
                value={partRequest.neededBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Submit Parts Request
              </button>
            </div>
          </form>
        </div>

        {/* Requested Parts List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Requested Parts History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Needed By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requestedParts.map(request => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.partName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.neededBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {requestedParts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No parts requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsRequest;