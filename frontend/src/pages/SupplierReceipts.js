// pages/SupplierReceipts.js
import React, { useState, useEffect } from 'react';

const SupplierReceipts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [supplierReceipts, setSupplierReceipts] = useState([]);
  const [partsRequests, setPartsRequests] = useState([]);
  const [parts, setParts] = useState([]); // ✅ added
  const [newReceipt, setNewReceipt] = useState({
    partsRequestId: '',
    supplierId: '',
    receiptNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: ''
  });
  const [currentItem, setCurrentItem] = useState({
    partName: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const receipts = JSON.parse(localStorage.getItem('supplierReceipts') || '[]');
    const requests = JSON.parse(localStorage.getItem('partsRequests') || '[]');
    const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const allParts = JSON.parse(localStorage.getItem('parts') || '[]'); // ✅ load from localStorage

    setSupplierReceipts(receipts);
    setPartsRequests(requests.filter(req => req.status === 'Delivered'));
    setParts(allParts); // ✅ store in state
  };

  const generateReceiptNumber = () => {
    const receipts = JSON.parse(localStorage.getItem('supplierReceipts') || '[]');
    return `SR-${String(receipts.length + 1).padStart(6, '0')}`;
  };

  const handleAddItem = () => {
    if (!currentItem.partName || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Please fill all item fields correctly');
      return;
    }

    const itemTotal = currentItem.quantity * currentItem.unitPrice;
    const updatedItems = [...newReceipt.items, { ...currentItem, total: itemTotal }];
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - newReceipt.discount;

    setNewReceipt({
      ...newReceipt,
      items: updatedItems,
      subtotal,
      tax,
      total
    });

    setCurrentItem({
      partName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  };

  const removeItem = (index) => {
    const updatedItems = newReceipt.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - newReceipt.discount;

    setNewReceipt({
      ...newReceipt,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    
    if (newReceipt.items.length === 0) {
      alert('Please add at least one item to the receipt');
      return;
    }

    const receipt = {
      ...newReceipt,
      id: Date.now(),
      receiptNumber: generateReceiptNumber(),
      createdAt: new Date().toISOString()
    };

    const updatedReceipts = [...supplierReceipts, receipt];
    setSupplierReceipts(updatedReceipts);
    localStorage.setItem('supplierReceipts', JSON.stringify(updatedReceipts));

    alert('Supplier receipt created successfully!');
    setShowCreateForm(false);
    setNewReceipt({
      partsRequestId: '',
      supplierId: '',
      receiptNumber: '',
      receiptDate: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      notes: ''
    });
  };

  const printReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TEKNICITY REPAIR SHOP</h1>
            <h2>Supplier Receipt</h2>
          </div>
          <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
          <p><strong>Date:</strong> ${receipt.receiptDate}</p>
          <table class="items-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(item => `
                <tr>
                  <td>${item.partName}</td>
                  <td>${item.quantity}</td>
                  <td>Rs ${item.unitPrice.toFixed(2)}</td>
                  <td>Rs ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p><strong>Subtotal:</strong> Rs ${receipt.subtotal.toFixed(2)}</p>
            <p><strong>Tax (10%):</strong> Rs ${receipt.tax.toFixed(2)}</p>
            <p><strong>Discount:</strong> Rs ${receipt.discount.toFixed(2)}</p>
            <p><strong>Total:</strong> Rs ${receipt.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Receipts</h1>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Create Receipt
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Create Supplier Receipt</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateReceipt} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
                      <input
                        type="date"
                        value={newReceipt.receiptDate}
                        onChange={(e) => setNewReceipt({...newReceipt, receiptDate: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newReceipt.discount}
                        onChange={(e) => {
                          const discount = parseFloat(e.target.value) || 0;
                          const total = newReceipt.subtotal + newReceipt.tax - discount;
                          setNewReceipt({...newReceipt, discount, total});
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                        {/* ✅ Dropdown instead of text input */}
                        <select
                          value={currentItem.partName}
                          onChange={(e) => setCurrentItem({...currentItem, partName: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Part</option>
                          {parts.map((part, index) => (
                            <option key={index} value={part.partName}>
                              {part.partName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={currentItem.quantity}
                          onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Rs)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentItem.unitPrice}
                          onChange={(e) => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value) || 0})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>

                    {newReceipt.items.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {newReceipt.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.partName}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">Rs {item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">Rs {item.total.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={newReceipt.notes}
                        onChange={(e) => setNewReceipt({...newReceipt, notes: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Receipt Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>Rs {newReceipt.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span>Rs {newReceipt.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>Rs {newReceipt.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>Rs {newReceipt.total.toFixed(2)}</span>
                        </div>
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
                      Create Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Table of all supplier receipts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Receipts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplierReceipts.map(receipt => (
                  <tr key={receipt.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{receipt.receiptDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{receipt.items.length} items</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rs {receipt.subtotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rs {receipt.tax.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rs {receipt.discount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs {receipt.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => printReceipt(receipt)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
                {supplierReceipts.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No supplier receipts found.
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

export default SupplierReceipts;
