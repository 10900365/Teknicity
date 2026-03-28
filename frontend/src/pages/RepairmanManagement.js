import React, { useState, useEffect } from 'react';
import RepairmanService from '../services/RepairmanService';

const RepairmanManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [repairmen, setRepairmen] = useState([]);
  const [newRepairman, setNewRepairman] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: ''
  });

  // Load repairmen from localStorage on component mount
  // Load repairmen from backend on mount, fall back to localStorage
  useEffect(() => {
    const loadRepairmen = async () => {
      try {
        const res = await RepairmanService.GetAllRepairman();
        if (res && res.data && res.data.StatusCode === 200) {
          let list = [];
          if (Array.isArray(res.data.ResultSet) && res.data.ResultSet.length > 0) list = res.data.ResultSet;
          else if (res.data.Result) {
            try { list = JSON.parse(res.data.Result); } catch (e) { list = []; }
          }

          // normalize each item to UI-friendly shape
          const normalized = list.map(item => {
            const id = item.RepairmanID || item.RepairmanId || item.id || item.repairman_id || item.Repairman_Id || Date.now();
            const name = item.repairman_name || item.RepairmanName || item.name || item.fullname || '';
            const email = item.repairman_email || item.email || '';
            const phone = item.repairman_contact || item.repairman_phone || item.phone || '';
            const specialty = item.specialty || item.RepairmanSpecialty || '';
            const experience = item.experience || item.years || '';
            const status = item.status || item.isActive || 'Active';
            const username = item.username || (email ? email.split('@')[0] : `user${id}`);
            return { id, name, email, phone, specialty, experience, status, username };
          });

          setRepairmen(normalized);
          localStorage.setItem('repairmen', JSON.stringify(normalized));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch repairmen from server, falling back to localStorage', err);
      }

      // fallback
      const storedRepairmen = JSON.parse(localStorage.getItem('repairmen') || '[]');
      setRepairmen(storedRepairmen);
    };

    loadRepairmen();
  }, []);

  // Save repairmen to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('repairmen', JSON.stringify(repairmen));
  }, [repairmen]);

  const handleAddRepairman = (e) => {
    e.preventDefault();

    // Map UI fields to backend expected field names
    const payload = {
      repairman_name: newRepairman.name,
      repairman_email: newRepairman.email,
      // backend may expect either `repairman_contact` or `repairman_phone`
      repairman_phone: newRepairman.phone,
      repairman_contact: newRepairman.phone,
      specialty: newRepairman.specialty,
      experience: newRepairman.experience
    };

    // simple client-side sanity checks
    if (!payload.repairman_name || payload.repairman_name.trim() === '') {
      alert('Please enter the repairman full name.');
      return;
    }
    if (!payload.repairman_contact || payload.repairman_contact.trim() === '') {
      alert('Please enter a contact phone number for the repairman.');
      return;
    }

    // debug: log the payload being sent to the backend
    console.log('AddRepairman payload:', payload);

    // optimistic UI: disable submit while request is in flight
    (async () => {
      try {
        const res = await RepairmanService.AddRepairman(payload);

  if (res && res.data && res.data.StatusCode === 200) {
          // prefer returned created object in ResultSet[0] or Result
          let created = null;
          if (res.data.ResultSet && res.data.ResultSet[0]) created = res.data.ResultSet[0];
          else if (res.data.Result) {
            try { created = JSON.parse(res.data.Result); } catch (e) { created = { id: Date.now(), name: newRepairman.name, email: newRepairman.email, phone: newRepairman.phone, specialty: newRepairman.specialty, experience: newRepairman.experience }; }
          }

          if (!created) {
            created = { id: Date.now(), ...payload };
            // normalize to UI-friendly shape
            created.name = created.repairman_name || created.name || newRepairman.name;
            created.email = created.repairman_email || created.email || newRepairman.email;
            created.phone = created.repairman_phone || created.phone || newRepairman.phone;
            created.username = (created.email || '').split('@')[0] || `user${created.id}`;
            created.status = 'Active';
          }

          // If the server returned an object with backend keys, normalize them for the UI
          if (created.repairman_name && !created.name) created.name = created.repairman_name;
          if (created.repairman_email && !created.email) created.email = created.repairman_email;
          if (created.repairman_phone && !created.phone) created.phone = created.repairman_phone;

          // Reset form and re-load from server for canonical data
          setNewRepairman({ name: '', email: '', phone: '', specialty: '', experience: '' });
          setShowAddForm(false);
          try {
            // reload list from server to reflect latest data
            const res2 = await RepairmanService.GetAllRepairman();
            if (res2 && res2.data && res2.data.StatusCode === 200) {
              let list = [];
              if (Array.isArray(res2.data.ResultSet) && res2.data.ResultSet.length > 0) list = res2.data.ResultSet;
              else if (res2.data.Result) {
                try { list = JSON.parse(res2.data.Result); } catch (e) { list = [] }
              }

              const normalized = list.map(item => {
                const id = item.RepairmanID || item.RepairmanId || item.id || item.repairman_id || item.Repairman_Id || Date.now();
                const name = item.repairman_name || item.RepairmanName || item.name || item.fullname || '';
                const email = item.repairman_email || item.email || '';
                const phone = item.repairman_contact || item.repairman_phone || item.phone || '';
                const specialty = item.specialty || item.RepairmanSpecialty || '';
                const experience = item.experience || item.years || '';
                const status = item.status || item.isActive || 'Active';
                const username = item.username || (email ? email.split('@')[0] : `user${id}`);
                return { id, name, email, phone, specialty, experience, status, username };
              });

              setRepairmen(normalized);
              localStorage.setItem('repairmen', JSON.stringify(normalized));
            }
          } catch (e) {
            // ignore reload errors, UI already updated optimistically
            console.warn('Failed to reload repairmen after add', e);
          }

          alert(`Repairman ${created.name || newRepairman.name} added successfully!`);
        } else {
          const errMsg = (res && res.data && res.data.Result) || 'Failed to add repairman';
          alert(errMsg);
        }
      } catch (err) {
        console.error('AddRepairman error', err);
        alert('Error adding repairman. See console for details.');
      }
    })();
  };

  const handleInputChange = (e) => {
    setNewRepairman({
      ...newRepairman,
      [e.target.name]: e.target.value
    });
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const updatedRepairmen = repairmen.map(repairman => 
      repairman.id === id ? { ...repairman, status: newStatus } : repairman
    );
    setRepairmen(updatedRepairmen);
    alert(`Repairman status updated to ${newStatus}`);
  };

  const deleteRepairman = (id) => {
    if (window.confirm('Are you sure you want to delete this repairman?')) {
      const updatedRepairmen = repairmen.filter(repairman => repairman.id !== id);
      setRepairmen(updatedRepairmen);
      alert('Repairman deleted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repairman Management</h1>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
            title={showAddForm ? 'Cancel' : 'Add New Repairman'}
          >
            {showAddForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New</span>
              </>
            )}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Repairman</h2>
            <form onSubmit={handleAddRepairman} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newRepairman.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newRepairman.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newRepairman.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <select
                    name="specialty"
                    value={newRepairman.specialty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="iPhone Repair">iPhone Repair</option>
                    <option value="Android Repair">Android Repair</option>
                    <option value="Tablet Repair">Tablet Repair</option>
                    <option value="Laptop Repair">Laptop Repair</option>
                    <option value="Data Recovery">Data Recovery</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={newRepairman.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Years of experience"
                />
              </div>
              
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Add Repairman
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Repair Technicians</h2>
          {repairmen.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">👨‍🔧</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Repairmen Added</h3>
              <p className="text-gray-600">Add your first repair technician using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repairmen.map(repairman => (
                    <tr key={repairman.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {repairman.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{repairman.name}</div>
                            <div className="text-sm text-gray-500">@{repairman.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repairman.email}</div>
                        <div className="text-sm text-gray-500">{repairman.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repairman.specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repairman.experience}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          repairman.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {repairman.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleStatus(repairman.id, repairman.status)}
                            className={`p-1 rounded-md ${repairman.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={repairman.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {/* Use a pencil icon for the action (edit/toggle) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464l9.9-9.9a2 2 0 012.828 0zM15.121 5.121l-1.414 1.414L13 5.828l1.121-1.121 1-1 1.414 1.414-1 1z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairmanManagement;