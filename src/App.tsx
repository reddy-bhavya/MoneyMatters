import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/Dashboard';
import Income from './components/income/Income';
import Expenses from './components/expenses/Expenses';
import TaxCalculator from './components/tax/TaxCalculator';
import BudgetPlanner from './components/budget/BudgetPlanner';
import TransactionHistory from './components/history/TransactionHistory';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="tax" element={<TaxCalculator />} />
          <Route path="budget" element={<BudgetPlanner />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;