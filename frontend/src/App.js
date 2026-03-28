import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimpleLogin from './pages/SimpleLogin';
import LandingPage from './pages/LandingPage';

// Shop Owner Pages
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import PhoneReturns from './pages/PhoneReturns';
import RepairmanManagement from './pages/RepairmanManagement';
import TicketManagement from './pages/TicketManagement';
import ShopOwnerBills from './pages/ShopOwnerBills';
import Inventory from './pages/Inventory';
import PartsHistory from './pages/PartsHistory';
import Settings from './pages/Settings';

// Repairman Pages
import RepairmanDashboard from './pages/RepairmanDashboard';
import AvailableRepairs from './pages/AvailableRepairs';
import AssignedRepairs from './pages/AssignedRepairs';
import AgeetWorkPerformingTask from './pages/AgeetWorkPerformingTask';

// Supplier Pages
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierInventory from './pages/SupplierInventory';
import SupplierManagement from './pages/SupplierManagement';
import SupplierOrders from './pages/SupplierOrders';
import SupplierReceipts from './pages/SupplierReceipts';

// Layout Components
import ShopOwnerLayout from './components/ShopOwnerLayout';
import RepairmanLayout from './components/RepairmanLayout';
import SupplierLayout from './components/SupplierLayout';

// Sample data initialization removed to avoid seeding demo login/users.
// If you want to restore sample data for development, re-add a lightweight initializer here or call an external seed script.

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout Wrapper Components
const ShopOwnerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['shopowner']}>
    <ShopOwnerLayout>{children}</ShopOwnerLayout>
  </ProtectedRoute>
);

const RepairmanRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['repairman']}>
    <RepairmanLayout>{children}</RepairmanLayout>
  </ProtectedRoute>
);

const SupplierRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['supplier']}>
    <SupplierLayout>{children}</SupplierLayout>
  </ProtectedRoute>
);

function App() {
  useEffect(() => {
    // initializeSampleData() deliberately not called to avoid demo/sample users and dummy login data in production
    // If you want sample app data (tickets, parts, etc.) enable this during development.
    // initializeSampleData();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<SimpleLogin />} />
          
          {/* Shop Owner Routes */}
          <Route path="/shop-owner/dashboard" element={
            <ShopOwnerRoute>
              <ShopOwnerDashboard />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/repairmen" element={
            <ShopOwnerRoute>
              <RepairmanManagement />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/tickets" element={
            <ShopOwnerRoute>
              <TicketManagement />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/inventory" element={
            <ShopOwnerRoute>
              <Inventory />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/bills" element={
            <ShopOwnerRoute>
              <ShopOwnerBills />
            </ShopOwnerRoute>
          } />
          {/* /shop-owner/communication removed - CustomerCommunication page deleted */}
          <Route path="/shop-owner/parts-history" element={
            <ShopOwnerRoute>
              <PartsHistory />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/phone-returns" element={
            <ShopOwnerRoute>
              <PhoneReturns />
            </ShopOwnerRoute>
          } />
          <Route path="/shop-owner/settings" element={
            <ShopOwnerRoute>
              <Settings />
            </ShopOwnerRoute>
          } />
          
          
          {/* Repairman Routes */}
          <Route path="/repairman/dashboard" element={
            <RepairmanRoute>
              <RepairmanDashboard />
            </RepairmanRoute>
          } />
          <Route path="/repairman/available-repairs" element={
            <RepairmanRoute>
              <AvailableRepairs />
            </RepairmanRoute>
          } />
          <Route path="/repairman/assigned-repairs" element={
            <RepairmanRoute>
              <AssignedRepairs />
            </RepairmanRoute>
          } />
          <Route path="/repairman/performing-task" element={
            <RepairmanRoute>
              <AgeetWorkPerformingTask />
            </RepairmanRoute>
          } />

          {/* Supplier Routes */}
          <Route path="/supplier/dashboard" element={
            <SupplierRoute>
              <SupplierDashboard />
            </SupplierRoute>
          } />
          <Route path="/supplier/inventory" element={
            <SupplierRoute>
              <SupplierInventory />
            </SupplierRoute>
          } />
          <Route path="/supplier/management" element={
            <SupplierRoute>
              <SupplierManagement />
            </SupplierRoute>
          } />
          <Route path="/supplier/orders" element={
            <SupplierRoute>
              <SupplierOrders />
            </SupplierRoute>
          } />
          <Route path="/supplier/receipts" element={
            <SupplierRoute>
              <SupplierReceipts />
            </SupplierRoute>
          } />
          
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;