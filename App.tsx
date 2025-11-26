

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryView from './components/CategoryView';
import SearchView from './components/SearchView';
import AuthView from './components/AuthView';
import BuyerDashboard from './components/BuyerDashboard';
import SellerDashboard from './components/SellerDashboard';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import { ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  // Track auth mode to pass to AuthView
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  const handleToggleCategories = () => {
    if (viewState === 'CATEGORIES') {
      setViewState('HOME');
    } else {
      setViewState('CATEGORIES');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setViewState('SEARCH');
  };

  const handleLogin = () => {
    setAuthMode('LOGIN');
    setViewState('AUTH');
  };

  const handleSignup = () => {
    setAuthMode('SIGNUP');
    setViewState('AUTH');
  };

  const handleHome = () => {
    setViewState('HOME');
  };

  const handleAuthSuccess = (role: 'BUYER' | 'SELLER') => {
    if (role === 'BUYER') {
      setViewState('BUYER_DASHBOARD');
    } else {
      setViewState('SELLER_DASHBOARD');
    }
  };

  const handleSignupSuccess = () => {
    // Switch to Login mode internally in AuthView is handled, but here we could potentially do global state updates if needed.
    // For now, we just ensure we stay on AuthView to allow them to login.
    setViewState('AUTH');
    setAuthMode('LOGIN');
  };

  // Determine if we should show the standard Navbar
  // Usually Dashboards have their own nav, but for simplicity let's keep it or hide it.
  // We'll hide the public Navbar for Dashboard views to simulate a "Portal" experience.
  const showNavbar = !['BUYER_DASHBOARD', 'SELLER_DASHBOARD'].includes(viewState);

  return (
    <DataProvider>
    <LanguageProvider>
      <div className={`min-h-screen overflow-x-hidden selection:bg-pink-500 selection:text-white ${viewState === 'HOME' ? 'bg-[#9F55FF] bg-gradient-to-br from-[#A066FF] to-[#8239FF]' : 'bg-purple-600'}`}>
        
        {/* Background elements only for Home view to maintain performance and cleanliness in utility views */}
        {viewState === 'HOME' && (
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          {showNavbar && (
            <Navbar 
              onToggleCategories={handleToggleCategories} 
              isCategoriesOpen={viewState === 'CATEGORIES'}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              onLogin={handleLogin}
              onSignup={handleSignup}
              onHome={handleHome}
            />
          )}
          
          <main className="flex-1 flex flex-col relative">
            {viewState === 'HOME' && <Hero />}
            {viewState === 'CATEGORIES' && <CategoryView />}
            {viewState === 'SEARCH' && <SearchView query={searchQuery} />}
            {viewState === 'AUTH' && (
              <AuthView 
                initialMode={authMode} 
                onLoginSuccess={handleAuthSuccess}
                onSignupSuccess={handleSignupSuccess}
              />
            )}
            {viewState === 'BUYER_DASHBOARD' && <BuyerDashboard onLogout={handleHome} />}
            {viewState === 'SELLER_DASHBOARD' && <SellerDashboard onLogout={handleHome} />}
          </main>
        </div>
        
        {/* Floating Chat/N Icon (Bottom Left) - Keep visible on all pages */}
        <div className="fixed bottom-6 left-6 z-50">
           <button 
             onClick={() => setViewState('HOME')} // Reset to home
             className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-xl"
           >
             N
           </button>
        </div>

      </div>
      
      {/* CSS Animation injection */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </LanguageProvider>
    </DataProvider>
  );
};

export default App;