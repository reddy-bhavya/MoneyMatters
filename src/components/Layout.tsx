import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  DollarSign,
  CreditCard,
  Calculator,
  PieChart,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  History,
} from 'lucide-react';

function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', to: '/income', icon: DollarSign },
    { name: 'Expenses', to: '/expenses', icon: CreditCard },
    { name: 'Tax Calculator', to: '/tax', icon: Calculator },
    { name: 'Budget Planner', to: '/budget', icon: PieChart },
    { name: 'History', to: '/history', icon: History },
    { name: 'Profile', to: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin', to: '/admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full transition-transform duration-300 ease-in-out bg-white shadow-lg`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  MoneyMatters
                </h1>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-gray-600 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-md'
                        : 'hover:bg-gray-50 hover:text-indigo-600'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={user?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full ring-2 ring-indigo-600"
                />
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white shadow-sm backdrop-blur-sm bg-opacity-75">
            <div className="flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navigation.find((item) => 
                  window.location.pathname.includes(item.to)
                )?.name || 'Dashboard'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="hidden lg:block">
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                </div>
                <img
                  src={user?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-600"
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Layout;