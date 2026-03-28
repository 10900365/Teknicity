// pages/RepairmanBills.js
import React, { useState, useEffect } from 'react';

const RepairmanBills = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [repairBills, setRepairBills] = useState([]);
  const [completedRepairs, setCompletedRepairs] = useState([]);
  const [supplierReceipts, setSupplierReceipts] = useState([]);
  const [newBill, setNewBill] = useState({
    repairId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    customerName: '',
    deviceInfo: '',
    parts: [],
    laborCost: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    status: 'draft'
  });
  const [selectedReceipts, setSelectedReceipts] = useState([]);

  // Hardcoded sample data
  const sampleCompletedRepairs = [
    {
      id: '1',
      customerName: 'John Doe',
      brand: 'iPhone',
      model: '13 Pro',
      status: 'Completed',
      issue: 'Screen replacement'
    },
    {
      id: '2', 
      customerName: 'Jane Smith',
      brand: 'Samsung',
      model: 'Galaxy S21',
      status: 'Completed',
      issue: 'Battery replacement'
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      brand: 'Google',
      model: 'Pixel 6',
      status: 'Completed',
      issue: 'Charging port repair'
    }
  ];

  const sampleSupplierReceipts = [
    {
      id: '101',
      receiptNumber: 'SR-000001',
      supplierName: 'Mobile Parts Inc.',
      total: 240.25,
      items: [
        {
          partName: 'iPhone Screen',
          quantity: 2,
          unitPrice: 85.50,
          total: 171.00
        },
        {
          partName: 'Screen Adhesive',
          quantity: 1,
          unitPrice: 69.25,
          total: 69.25
        }
      ]
    },
    {
      id: '102',
      receiptNumber: 'SR-000002',
      supplierName: 'Battery World',
      total: 314.50,
      items: [
        {
          partName: 'Android Battery',
          quantity: 5,
          unitPrice: 35.50,
          total: 177.50
        },
        {
          partName: 'Battery Adhesive',
          quantity: 3,
          unitPrice: 45.67,
          total: 137.01
        }
      ]
    },
    {
      id: '103',
      receiptNumber: 'SR-000003',
      supplierName: 'Tech Components Ltd.',
      total: 427.25,
      items: [
        {
          partName: 'Charging Port',
          quantity: 3,
          unitPrice: 42.75,
          total: 128.25
        },
        {
          partName: 'USB-C Cable',
          quantity: 10,
          unitPrice: 12.50,
          total: 125.00
        },
        {
          partName: 'Power Adapter',
          quantity: 2,
          unitPrice: 87.00,
          total: 174.00
        }
      ]
    }
  ];

  // Sample repair bills for main table
  const sampleRepairBills = [
    {
      id: '1001',
      billNumber: 'RB-000001',
      billDate: '2025-10-14',
      customerName: 'John Doe',
      deviceInfo: 'iPhone 13 Pro',
      parts: [
        {
          partName: 'iPhone Screen',
          quantity: 1,
          unitCost: 85.50,
          totalCost: 85.50
        },
        {
          partName: 'Screen Adhesive',
          quantity: 1,
          unitCost: 69.25,
          totalCost: 69.25
        }
      ],
      laborCost: 75.00,
      subtotal: 229.75,
      discount: 15.00,
      tax: 22.98,
      total: 237.73,
      status: 'approved',
      createdAt: '2025-10-14T10:30:00Z',
      createdBy: 'Repairman'
    },
    {
      id: '1002',
      billNumber: 'RB-000002',
      billDate: '2025-10-13',
      customerName: 'Jane Smith',
      deviceInfo: 'Samsung Galaxy S21',
      parts: [
        {
          partName: 'Android Battery',
          quantity: 1,
          unitCost: 35.50,
          totalCost: 35.50
        }
      ],
      laborCost: 60.00,
      subtotal: 95.50,
      discount: 5.00,
      tax: 9.55,
      total: 100.05,
      status: 'paid',
      createdAt: '2025-10-13T14:20:00Z',
      createdBy: 'Repairman'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Always use sample data for testing UI
    setRepairBills(sampleRepairBills);
    setCompletedRepairs(sampleCompletedRepairs);
    setSupplierReceipts(sampleSupplierReceipts);
  };

  const generateBillNumber = () => {
    return `RB-${String(repairBills.length + 1).padStart(6, '0')}`;
  };

  const handleSelectRepair = (repairId) => {
    const repair = completedRepairs.find(r => r.id === repairId);
    if (repair) {
      setNewBill({
        ...newBill,
        repairId,
        customerName: repair.customerName,
        deviceInfo: `${repair.brand} ${repair.model}`
      });
    }
  };

  const handleAddPartsFromReceipts = () => {
    if (selectedReceipts.length === 0) {
      alert('Please select at least one supplier receipt');
      return;
    }

    const selectedParts = [];
    selectedReceipts.forEach(receiptId => {
      const receipt = supplierReceipts.find(r => r.id == receiptId);
      if (receipt) {
        receipt.items.forEach(item => {
          selectedParts.push({
            partName: item.partName,
            quantity: item.quantity,
            unitCost: item.unitPrice,
            totalCost: item.total
          });
        });
      }
    });

    const parts = [...newBill.parts, ...selectedParts];
    const partsTotal = parts.reduce((sum, part) => sum + part.totalCost, 0);
    const subtotal = partsTotal + newBill.laborCost;
    const tax = subtotal * 0.1;
    const total = subtotal + tax - newBill.discount;

    setNewBill({
      ...newBill,
      parts,
      subtotal,
      tax,
      total
    });

    setSelectedReceipts([]);
    alert(`Added ${selectedParts.length} parts from selected receipts`);
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    
    if (!newBill.repairId) {
      alert('Please select a completed repair');
      return;
    }

    if (newBill.parts.length === 0) {
      alert('Please add parts to the bill');
      return;
    }

    const bill = {
      ...newBill,
      id: Date.now().toString(),
      billNumber: generateBillNumber(),
      createdAt: new Date().toISOString(),
      createdBy: 'Repairman'
    };

    const updatedBills = [...repairBills, bill];
    setRepairBills(updatedBills);
    localStorage.setItem('repairBills', JSON.stringify(updatedBills));

    alert('Repair bill created successfully!');
    setShowCreateForm(false);
    setNewBill({
      repairId: '',
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      customerName: '',
      deviceInfo: '',
      parts: [],
      laborCost: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      status: 'draft'
    });
    setSelectedReceipts([]);
  };

  const calculateBillSummary = () => {
    const partsTotal = newBill.parts.reduce((sum, part) => sum + part.totalCost, 0);
    const subtotal = partsTotal + newBill.laborCost;
    const tax = subtotal * 0.1;
    const total = subtotal + tax - newBill.discount;

    return { partsTotal, subtotal, tax, total };
  };

  const printBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Repair Bill - ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .bill-info { margin-bottom: 20px; }
            .customer-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { margin-top: 20px; text-align: right; }
            .status { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .status-draft { background: #ffeb3b; color: #333; }
            .status-approved { background: #4caf50; color: white; }
            .status-paid { background: #2196f3; color: white; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TEKNICITY REPAIR SHOP</h1>
            <h2>Repair Bill</h2>
          </div>
          <div class="bill-info">
            <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
            <p><strong>Date:</strong> ${bill.billDate}</p>
            <p><strong>Status:</strong> <span class="status status-${bill.status}">${bill.status.toUpperCase()}</span></p>
          </div>
          <div class="customer-info">
            <p><strong>Customer:</strong> ${bill.customerName}</p>
            <p><strong>Device:</strong> ${bill.deviceInfo}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${bill.parts.map(part => `
                <tr>
                  <td>${part.partName}</td>
                  <td>${part.quantity}</td>
                  <td>Rs ${part.unitCost.toFixed(2)}</td>
                  <td>Rs ${part.totalCost.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Labor Cost:</td>
                <td>Rs ${bill.laborCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <p><strong>Subtotal:</strong> Rs ${bill.subtotal.toFixed(2)}</p>
            <p><strong>Tax (10%):</strong> Rs ${bill.tax.toFixed(2)}</p>
            <p><strong>Discount:</strong> Rs ${bill.discount.toFixed(2)}</p>
            <p><strong>Total Amount:</strong> Rs ${bill.total.toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Prepared by: ${bill.createdBy}</p>
            <p>Thank you for choosing TekniCity Repair Shop!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const removePart = (index) => {
    const updatedParts = newBill.parts.filter((_, i) => i !== index);
    const partsTotal = updatedParts.reduce((sum, part) => sum + part.totalCost, 0);
    const subtotal = partsTotal + newBill.laborCost;
    const tax = subtotal * 0.1;
    const total = subtotal + tax - newBill.discount;

    setNewBill({
      ...newBill,
      parts: updatedParts,
      subtotal,
      tax,
      total
    });
  };

  const { partsTotal, subtotal, tax, total } = calculateBillSummary();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repair Bills</h1>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Create Bill
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Create Repair Bill</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateBill} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Completed Repair</label>
                      <select
                        value={newBill.repairId}
                        onChange={(e) => handleSelectRepair(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Repair</option>
                        {completedRepairs.map(repair => (
                          <option key={repair.id} value={repair.id}>
                            {repair.customerName} - {repair.brand} {repair.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                      <input
                        type="date"
                        value={newBill.billDate}
                        onChange={(e) => setNewBill({...newBill, billDate: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {newBill.customerName && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Customer & Device Info</h3>
                      <p><strong>Customer:</strong> {newBill.customerName}</p>
                      <p><strong>Device:</strong> {newBill.deviceInfo}</p>
                    </div>
                  )}

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Parts from Supplier Receipts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Supplier Receipts</label>
                        <select
                          multiple
                          value={selectedReceipts}
                          onChange={(e) => setSelectedReceipts(Array.from(e.target.selectedOptions, option => option.value))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
                        >
                          {supplierReceipts.map(receipt => (
                            <option key={receipt.id} value={receipt.id}>
                              {receipt.receiptNumber} - Rs {receipt.total.toFixed(2)} - {receipt.items.length} items
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple receipts</p>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddPartsFromReceipts}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          Add Selected Receipts
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (Rs)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBill.laborCost}
                          onChange={(e) => {
                            const laborCost = parseFloat(e.target.value) || 0;
                            const subtotal = partsTotal + laborCost;
                            const tax = subtotal * 0.1;
                            const total = subtotal + tax - newBill.discount;
                            setNewBill({...newBill, laborCost, subtotal, tax, total});
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBill.discount}
                          onChange={(e) => {
                            const discount = parseFloat(e.target.value) || 0;
                            const total = subtotal + tax - discount;
                            setNewBill({...newBill, discount, total});
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {newBill.parts.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {newBill.parts.map((part, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{part.partName}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{part.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">Rs {part.unitCost.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">Rs {part.totalCost.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  <button
                                    type="button"
                                    onClick={() => removePart(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Labor Cost:</td>
                              <td className="px-4 py-2 text-sm font-semibold text-gray-900">Rs {newBill.laborCost.toFixed(2)}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Bill Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Parts Total:</span>
                        <span>Rs {partsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span>Rs {newBill.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Rs {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>Rs {tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>Rs {newBill.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>Rs {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      Create Bill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Repair Bills</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repairBills.map(bill => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bill.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bill.deviceInfo}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bill.parts.length} items</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rs {bill.laborCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs {bill.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'approved' ? 'bg-green-100 text-green-800' :
                        bill.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => printBill(bill)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairmanBills;