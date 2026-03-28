// pages/SupplierManagement.js
import React, { useState, useEffect } from 'react';

const SupplierManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    company_name: '',
    email: '',
    phone_no: '',
    address: '',
    part_specialty: ''
  });

  // Load suppliers from localStorage on component mount
  useEffect(() => {
    const storedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    if (storedSuppliers.length === 0) {
      // Initialize with sample data if empty
      const sampleSuppliers = [
        { 
          supplier_id: 1, 
          company_name: 'Mobile Parts Inc.', 
          email: 'contact@mobileparts.com', 
          phone_no: '555-1000', 
          address: '123 Tech Street, City', 
          part_specialty: 'Screens & Displays'
        },
        { 
          supplier_id: 2, 
          company_name: 'Battery World', 
          email: 'orders@batteryworld.com', 
          phone_no: '555-2000', 
          address: '456 Power Ave, City', 
          part_specialty: 'Batteries'
        },
        { 
          supplier_id: 3, 
          company_name: 'Component Central', 
          email: 'info@componentcentral.com', 
          phone_no: '555-3000', 
          address: '789 Circuit Road, City', 
          part_specialty: 'Charging Ports & Connectors'
        }
      ];
      setSuppliers(sampleSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(sampleSuppliers));
    } else {
      setSuppliers(storedSuppliers);
    }
  }, []);

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleAddSupplier = (e) => {
    e.preventDefault();
    
    const supplierId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.supplier_id)) + 1 : 1;
    
    const newSupplierData = {
      ...newSupplier,
      supplier_id: supplierId
    };

    const updatedSuppliers = [...suppliers, newSupplierData];
    setSuppliers(updatedSuppliers);
    
    // Reset form
    setNewSupplier({
      company_name: '',
      email: '',
      phone_no: '',
      address: '',
      part_specialty: ''
    });
    
    setShowAddForm(false);
    alert(`Supplier ${newSupplier.company_name} added successfully!`);
  };

  const handleInputChange = (e) => {
    setNewSupplier({
      ...newSupplier,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    if (supplier) {
      setNewSupplier({
        company_name: supplier.company_name,
        email: supplier.email,
        phone_no: supplier.phone_no,
        address: supplier.address,
        part_specialty: supplier.part_specialty
      });
      setShowAddForm(true);
      // You can implement edit functionality here
      alert(`Edit functionality for ${supplier.company_name} would be implemented here`);
    }
  };

  const handleOrderParts = (supplier) => {
    alert(`Order parts from ${supplier.company_name} - ${supplier.part_specialty}`);
  };

  const handleRemoveSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    if (supplier && window.confirm(`Are you sure you want to remove ${supplier.company_name}?`)) {
      const updatedSuppliers = suppliers.filter(s => s.supplier_id !== supplierId);
      setSuppliers(updatedSuppliers);
      alert(`${supplier.company_name} has been removed successfully!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showAddForm ? 'Cancel' : 'Add New Supplier'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={newSupplier.company_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newSupplier.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    name="phone_no"
                    value={newSupplier.phone_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parts Specialty *</label>
                  <select
                    name="part_specialty"
                    value={newSupplier.part_specialty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="Screens & Displays">Screens & Displays</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Charging Ports & Connectors">Charging Ports & Connectors</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Logic Boards">Logic Boards</option>
                    <option value="Housings & Frames">Housings & Frames</option>
                    <option value="Audio Components">Audio Components</option>
                    <option value="Buttons & Switches">Buttons & Switches</option>
                    <option value="Flex Cables">Flex Cables</option>
                    <option value="Tools & Equipment">Tools & Equipment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  value={newSupplier.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  rows="3"
                  placeholder="Full address"
                />
              </div>
              
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Add Supplier
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Suppliers</h2>
          {suppliers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏭</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Suppliers Found</h3>
              <p className="text-gray-600">Add your first supplier using the "Add New Supplier" button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map(supplier => (
                <div key={supplier.supplier_id} className="border rounded-lg p-4 hover:shadow-md transition duration-200 bg-white">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{supplier.company_name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-gray-600 break-all">{supplier.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="text-gray-600">{supplier.phone_no}</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 text-sm">{supplier.address}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{supplier.part_specialty}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={() => handleEditSupplier(supplier.supplier_id)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition duration-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOrderParts(supplier)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium px-3 py-1 border border-green-600 rounded hover:bg-green-50 transition duration-200"
                    >
                      Order Parts
                    </button>
                    <button 
                      onClick={() => handleRemoveSupplier(supplier.supplier_id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement;