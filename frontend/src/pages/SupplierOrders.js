// pages/SupplierOrders.js
import React, { useState, useEffect } from 'react';

const SupplierOrders = () => {
  const [partsRequests, setPartsRequests] = useState([]);
  const [supplierInventory, setSupplierInventory] = useState([]);

  useEffect(() => {
    // Load parts requests and supplier inventory from localStorage
    const loadData = () => {
      const partsRequestsData = JSON.parse(localStorage.getItem('partsRequests') || '[]');
      const supplierInventoryData = JSON.parse(localStorage.getItem('supplierInventory') || '[]');
      
      setPartsRequests(partsRequestsData);
      setSupplierInventory(supplierInventoryData);
    };

    loadData();
    
    // Refresh data every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = (requestId) => {
    const request = partsRequests.find(req => req.id === requestId);
    const partInInventory = supplierInventory.find(item => 
      item.partName.toLowerCase().includes(request.partName.toLowerCase()) ||
      request.partName.toLowerCase().includes(item.partName.toLowerCase())
    );

    if (partInInventory && partInInventory.stock >= request.quantity) {
      // Update the request status and add message
      const updatedRequests = partsRequests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'Processing',
              messages: [...(req.messages || []), `Request accepted. Part available in stock. Processing order...`]
            }
          : req
      );
      
      // Update stock in supplier inventory
      const updatedInventory = supplierInventory.map(item =>
        item.id === partInInventory.id
          ? { ...item, stock: item.stock - request.quantity }
          : item
      );

      localStorage.setItem('partsRequests', JSON.stringify(updatedRequests));
      localStorage.setItem('supplierInventory', JSON.stringify(updatedInventory));
      setPartsRequests(updatedRequests);
      setSupplierInventory(updatedInventory);
      
      alert(`Request accepted! Part is available and order is now processing.`);
    } else {
      alert(`Cannot accept request: Part not available in sufficient quantity or not found in inventory.`);
    }
  };

  const handleRejectRequest = (requestId) => {
    const updatedRequests = partsRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'Rejected',
            messages: [...(req.messages || []), `Request rejected by supplier`]
          }
        : req
    );
    
    localStorage.setItem('partsRequests', JSON.stringify(updatedRequests));
    setPartsRequests(updatedRequests);
    alert(`Request rejected successfully.`);
  };

  const updateOrderStatus = (requestId, newStatus) => {
    const statusMessages = {
      'Processing': 'Order is being processed',
      'Shipped': 'Order has been shipped',
      'Delivered': 'Order has been delivered'
    };

    const updatedRequests = partsRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: newStatus,
            messages: [...(req.messages || []), statusMessages[newStatus]]
          }
        : req
    );
    
    localStorage.setItem('partsRequests', JSON.stringify(updatedRequests));
    setPartsRequests(updatedRequests);
    alert(`Order status updated to: ${newStatus}`);
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

  const checkPartAvailability = (partName, quantity) => {
    const partInInventory = supplierInventory.find(item => 
      item.partName.toLowerCase().includes(partName.toLowerCase()) ||
      partName.toLowerCase().includes(item.partName.toLowerCase())
    );
    
    if (!partInInventory) return { available: false, reason: 'Part not found in inventory' };
    if (partInInventory.stock < quantity) return { available: false, reason: 'Insufficient stock' };
    return { available: true, part: partInInventory };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Parts Orders</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Parts Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partsRequests.map(request => {
                  const availability = checkPartAvailability(request.partName, request.quantity);
                  
                  return (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.partName}
                        <div className="text-xs text-gray-500 mt-1">
                          {availability.available ? 
                            `Available: ${availability.part.stock} in stock` : 
                            `Not available: ${availability.reason}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.status === 'Pending' && (
                          <div className="space-y-2">
                            <button 
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={!availability.available}
                              className={`w-full px-3 py-1 rounded text-xs ${
                                availability.available 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.id)}
                              className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status === 'Processing' && (
                          <div className="space-y-2">
                            <button 
                              onClick={() => updateOrderStatus(request.id, 'Shipped')}
                              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                            >
                              Mark as Shipped
                            </button>
                          </div>
                        )}
                        {request.status === 'Shipped' && (
                          <div className="space-y-2">
                            <button 
                              onClick={() => updateOrderStatus(request.id, 'Delivered')}
                              className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              Mark as Delivered
                            </button>
                          </div>
                        )}
                        {(request.status === 'Delivered' || request.status === 'Rejected') && (
                          <span className="text-gray-400 text-xs">No actions available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {partsRequests.length === 0 && (
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

        {/* Order Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-blue-600">{partsRequests.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {partsRequests.filter(req => req.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing</h3>
            <p className="text-3xl font-bold text-blue-600">
              {partsRequests.filter(req => req.status === 'Processing').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {partsRequests.filter(req => req.status === 'Delivered').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierOrders;