// src/App.tsx

import { useState } from 'react';
import { 
    BrowserRouter, // 1. The main Router component
    Routes,      // 2. Contains all route definitions
    Route,       // 3. Defines a single path
    Navigate     // 4. Used for redirects
} from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import ProductsManagement from './components/ProductsManagement';
import OrdersManagement from './components/OrdersManagement';
import UsersManagement from './components/UsersManagement';
import OAuthCallback from './components/OAuthCallback'; // 🔑 Import the necessary callback component

// --- 1. Dashboard Component (Remains the same) ---
function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

// --- 2. Protected Route Wrapper (New Component) ---
/**
 * Checks authentication status and admin role.
 * If authorized, renders the child element (Dashboard); otherwise, redirects to /login.
 */
function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated || !isAdmin) {
    // 🛑 If not authenticated or not admin, navigate to the login route
    return <Navigate to="/login" replace />;
  }

  // ✅ If authenticated and admin, render the component (Dashboard)
  return children;
}


// --- 3. Main App Structure (Updated to use Router) ---
function App() {
  return (
    // 🔑 Wrap everything in BrowserRouter to provide routing context
    <BrowserRouter>
      <AuthProvider>
        {/* Routes component is required for Route matching */}
        <Routes>
          
          {/* Public Routes */}
          
          {/* Route for the standard login page */}
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Route for the Google OAuth callback redirect */}
          <Route path="/auth-callback" element={<OAuthCallback />} />
          
          {/* Protected Routes */}
          
          {/* The main admin route, protected by the wrapper */}
          <Route 
            path="/admin/dashboard/*" // Use /* to allow nested routes within Dashboard
            element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            }
          />
          
          {/* Default redirect: send root path to the protected dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Fallback for unknown paths */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;