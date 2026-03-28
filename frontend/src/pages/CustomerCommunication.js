// pages/CustomerCommunication.js
import React, { useState, useEffect } from 'react';

const CustomerCommunication = () => {
  const [smsLogs, setSmsLogs] = useState([]);
  const [selectedSMS, setSelectedSMS] = useState(null);

  useEffect(() => {
    loadSMSLogs();
  }, []);

  const loadSMSLogs = () => {
    const logs = JSON.parse(localStorage.getItem('smsLogs') || '[]');
    setSmsLogs(logs);
  };

  const viewSMSDetails = (sms) => {
    setSelectedSMS(sms);
  };

  const simulateSMSResponse = (smsId) => {
    const updatedLogs = smsLogs.map(log => 
      log.id === smsId ? { ...log, responded: true, response: 'Customer acknowledged the message and will visit the shop soon.' } : log
    );
    setSmsLogs(updatedLogs);
    localStorage.setItem('smsLogs', JSON.stringify(updatedLogs));
    alert('SMS response simulated!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Communication</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">SMS Communication Logs</h2>
          
          {smsLogs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages sent</h3>
              <p className="mt-1 text-sm text-gray-500">SMS messages sent to customers will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {smsLogs.map(sms => (
                <div key={sms.id} className="border rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{sms.customerName}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Bill: Rs {Number(sms && sms.billTotal ? sms.billTotal : 0).toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          sms.responded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sms.responded ? 'Responded' : 'Sent'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{sms.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Sent: {sms && sms.timestamp ? new Date(sms.timestamp).toLocaleString() : ''}</span>
                        {sms.responded && (
                          <span className="text-green-600">✓ Customer responded</span>
                        )}
                      </div>
                      {sms.response && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium">Customer Response:</p>
                          <p className="text-sm text-blue-700">{sms.response}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => viewSMSDetails(sms)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Details
                      </button>
                      {!sms.responded && (
                        <button
                          onClick={() => simulateSMSResponse(sms.id)}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Simulate Response
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSMS && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">SMS Details</h2>
                  <button 
                    onClick={() => setSelectedSMS(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSMS.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSMS.phoneNumber || selectedSMS.to || selectedSMS.toNumber || selectedSMS.toPhone || selectedSMS.phone || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedSMS.message}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bill Amount</label>
                    <p className="mt-1 text-sm text-gray-900">Rs {Number(selectedSMS && selectedSMS.billTotal ? selectedSMS.billTotal : 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sent Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSMS && selectedSMS.timestamp ? new Date(selectedSMS.timestamp).toLocaleString() : ''}</p>
                  </div>
                  {selectedSMS.response && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Response</label>
                      <p className="mt-1 text-sm text-green-700 bg-green-50 p-3 rounded">{selectedSMS.response}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCommunication;