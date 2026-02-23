import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.jsx';
import SplashPage from './pages/SplashPage.jsx';
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
      { path: 'home', element: <HomePage /> },
      { path: 'scan', element: <ScanPage /> },
      { path: 'food', element: <FoodPage /> },
      { path: 'electronics', element: <ElectronicsPage /> },
      { path: 'recyclables', element: <RecyclablesPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'credit-score', element: <CreditScorePage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'bidding', element: <BiddingPage /> },
      { path: 'direct-deal', element: <DirectDealPage /> },
      { path: 'chatbot', element: <ChatbotPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
