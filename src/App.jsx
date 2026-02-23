import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import PageTransition from './components/PageTransition';

const pageTitles = {
  '/home': 'GreenGrid',
  '/scan': 'AI Scan',
  '/food': 'Food & Organics',
  '/electronics': 'E-Waste',
  '/recyclables': 'Recyclables',
  '/wallet': 'GreenCoins',
  '/credit-score': 'Green Score',
  '/marketplace': 'Material Exchange',
  '/bidding': 'Live Bidding',
  '/direct-deal': 'Smart Deal',
  '/chatbot': 'GreenGrid AI',
  '/profile': 'Profile',
};

export default function App() {
  const location = useLocation();
  const isSplash = location.pathname === '/';
  const title = pageTitles[location.pathname] || 'GreenGrid';

  return (
    <>
      <div className="orb orb-green" />
      <div className="orb orb-gold" />
      {!isSplash && <Header title={title} />}
      <PageTransition keyVal={location.pathname}>
        <Outlet />
      </PageTransition>
      {!isSplash && <BottomNav />}
    </>
  );
}
