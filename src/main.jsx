import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import App from './App.jsx';
import SplashPage from './pages/SplashPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import FoodPage from './pages/FoodPage.jsx';
import ElectronicsPage from './pages/ElectronicsPage.jsx';
import RecyclablesPage from './pages/RecyclablesPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import CreditScorePage from './pages/CreditScorePage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import BiddingPage from './pages/BiddingPage.jsx';
import DirectDealPage from './pages/DirectDealPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <SplashPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'home', element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: 'scan', element: <ProtectedRoute><ScanPage /></ProtectedRoute> },
      { path: 'food', element: <ProtectedRoute><FoodPage /></ProtectedRoute> },
      { path: 'electronics', element: <ProtectedRoute><ElectronicsPage /></ProtectedRoute> },
      { path: 'recyclables', element: <ProtectedRoute><RecyclablesPage /></ProtectedRoute> },
      { path: 'wallet', element: <ProtectedRoute><WalletPage /></ProtectedRoute> },
      { path: 'credit-score', element: <ProtectedRoute><CreditScorePage /></ProtectedRoute> },
      { path: 'marketplace', element: <ProtectedRoute><MarketplacePage /></ProtectedRoute> },
      { path: 'bidding', element: <ProtectedRoute><BiddingPage /></ProtectedRoute> },
      { path: 'direct-deal', element: <ProtectedRoute><DirectDealPage /></ProtectedRoute> },
      { path: 'chatbot', element: <ProtectedRoute><ChatbotPage /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
