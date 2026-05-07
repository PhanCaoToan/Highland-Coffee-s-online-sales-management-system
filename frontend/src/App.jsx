import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import StaffOrderDetail from './pages/admin/StaffOrderDetail';
import ManageWarehouse from './pages/admin/ManageWarehouse';
import WarehouseDetail from './pages/admin/WarehouseDetail';
import RevenueReport from './pages/admin/RevenueReport';

// Chỉ cho admin (quản lý) truy cập, staff → redirect /admin/orders
function ManagerOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/admin/orders" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-dark flex flex-col">
            <Navbar />
            <CartDrawer />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ManagerOnly><Dashboard /></ManagerOnly>} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="orders/:id" element={<StaffOrderDetail />} />
                  <Route path="warehouse" element={<ManageWarehouse />} />
                  <Route path="warehouse/:id" element={<WarehouseDetail />} />
                  <Route path="report" element={<ManagerOnly><RevenueReport /></ManagerOnly>} />
                </Route>
              </Routes>
            </main>
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="/login" element={null} />
              <Route path="/register" element={null} />
              <Route path="/forgot-password" element={null} />
              <Route path="*" element={<Footer />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

