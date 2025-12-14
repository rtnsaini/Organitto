import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineBanner from './components/OfflineBanner';
import UpdateNotification from './components/UpdateNotification';
import FloatingActionButton from './components/FloatingActionButton';
import { FloatingLeaves } from './components/ui/FloatingLeaves';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import ExpenseList from './pages/ExpenseList';
import ExpenseReports from './pages/ExpenseReports';
import Investments from './pages/Investments';
import ProductPipeline from './pages/ProductPipeline';
import ProductDetail from './pages/ProductDetail';
import CostCalculator from './pages/CostCalculator';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Ingredients from './pages/Ingredients';
import IngredientDetail from './pages/IngredientDetail';
import Compliance from './pages/Compliance';
import LicenseDetail from './pages/LicenseDetail';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import UserApprovals from './pages/UserApprovals';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  const publicPaths = ['/', '/login', '/register'];
  const isPublicRoute = publicPaths.includes(location.pathname);
  const shouldShowFAB = user && !isPublicRoute;

  return (
    <>
      {!isPublicRoute && <FloatingLeaves />}
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/edit/:id" element={<EditExpense />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/reports" element={<ExpenseReports />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/products" element={<ProductPipeline />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/calculator" element={<CostCalculator />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/batches/:id" element={<BatchDetail />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/ingredients/:id" element={<IngredientDetail />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/compliance/:id" element={<LicenseDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route
            path="/admin/user-approvals"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserApprovals />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {shouldShowFAB && <FloatingActionButton />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineBanner />
        <PWAInstallPrompt />
        <UpdateNotification />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
