// pages/SupplierInventory.js
import React, { useState, useEffect } from 'react';

const SupplierInventory = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [newPart, setNewPart] = useState({
    partName: '',
    category: '',
    stock: 0,
    price: ''
  });

  const categories = ['Batteries', 'Screens', 'Connectors', 'Cameras', 'Logic Boards', 'Housings', 'Other'];

  useEffect(() => {
    // Load inventory from localStorage
    const supplierInventory = JSON.parse(localStorage.getItem('supplierInventory') || '[]');
    if (supplierInventory.length === 0) {
      // Initialize with sample data if empty
      const initialInventory = [
        { id: 1, partName: 'iPhone 12 Battery', category: 'Batteries', stock: 45, price: 'Rs 29.99' },
        { id: 2, partName: 'USB-C Port', category: 'Connectors', stock: 32, price: 'Rs 15.99' },
        { id: 3, partName: 'Samsung Screen', category: 'Screens', stock: 18, price: 'Rs 89.99' },
        { id: 4, partName: 'iPhone Charging Port', category: 'Connectors', stock: 27, price: 'Rs 22.50' },
        { id: 5, partName: 'Google Pixel Battery', category: 'Batteries', stock: 22, price: 'Rs 34.99' },
        { id: 6, partName: 'Samsung Charging Port', category: 'Connectors', stock: 15, price: 'Rs 18.99' }
      ];
      localStorage.setItem('supplierInventory', JSON.stringify(initialInventory));
      setInventory(initialInventory);
    } else {
      setInventory(supplierInventory);
    }
  }, []);

  const handleAddPart = (e) => {
    e.preventDefault();
    const newPartWithId = {
      ...newPart,
      id: Date.now(),
      stock: parseInt(newPart.stock)
    };

    const updatedInventory = [...inventory, newPartWithId];
    setInventory(updatedInventory);
    localStorage.setItem('supplierInventory', JSON.stringify(updatedInventory));
    
    alert(`Part ${newPart.partName} added to inventory!`);
    
    setNewPart({
      partName: '',
      category: '',
      stock: 0,
      price: ''
    });
    
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    setNewPart({
      ...newPart,
      [e.target.name]: e.target.value
    });
  };

  const updateStock = (partId, partName, newStock) => {
    const updatedInventory = inventory.map(item => 
      item.id === partId ? { ...item, stock: parseInt(newStock) } : item
    );
    setInventory(updatedInventory);
    localStorage.setItem('supplierInventory', JSON.stringify(updatedInventory));
    alert(`Stock updated for ${partName}`);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  // Calculate inventory statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock < 10 && item.stock > 0).length;
  const outOfStockItems = inventory.filter(item => item.stock === 0).length;
  const inStockItems = inventory.filter(item => item.stock >= 10).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Inventory</h1>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showAddForm ? 'Cancel' : 'Add New Part'}
          </button>
        </div>

        {/* Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Items</div>
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">In Stock</div>
            <div className="text-2xl font-bold text-green-600">{inStockItems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Low Stock</div>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Part</h2>
            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <input
                    type="text"
                    name="partName"
                    value={newPart.partName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Part name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={newPart.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={newPart.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    name="price"
                    value={newPart.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Price"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Add Part
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map(item => {
                  const stockStatus = getStockStatus(item.stock);
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.partName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateStock(item.id, item.partName, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => updateStock(item.id, item.partName, item.stock + 50)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Restock +50
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No inventory items found. Add your first part!
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

export default SupplierInventory;