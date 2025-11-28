import React, { useState, useEffect } from 'react';
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
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // --- 智能身份监听 ---
  useEffect(() => {
    // 1. 页面加载时检查 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // 读取用户元数据里的角色 (我们在注册时存进去的)
        const role = session.user.user_metadata?.role || 'BUYER'; 
        // 只有在首页时才自动跳转，防止打断用户操作
        if (viewState === 'HOME') {
            handleAuthSuccess(role as 'BUYER' | 'SELLER');
        }
      }
    });

    // 2. 监听登录/登出事件
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const role = session.user.user_metadata?.role || 'BUYER';
        handleAuthSuccess(role as 'BUYER' | 'SELLER');
      } else if (event === 'SIGNED_OUT') {
        setViewState('HOME');
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  // ------------------

  const handleToggleCategories = () => {
    setViewState(viewState === 'CATEGORIES' ? 'HOME' : 'CATEGORIES');
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
    setViewState('AUTH');
    setAuthMode('LOGIN');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleHome();
  };

  const showNavbar = !['BUYER_DASHBOARD', 'SELLER_DASHBOARD'].includes(viewState);

  return (
    <DataProvider>
    <LanguageProvider>
      <div className={`min-h-screen overflow-x-hidden selection:bg-pink-500 selection:text-white ${viewState === 'HOME' ? 'bg-[#9F55FF] bg-gradient-to-br from-[#A066FF] to-[#8239FF]' : 'bg-purple-600'}`}>
        
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
            {viewState === 'BUYER_DASHBOARD' && <BuyerDashboard onLogout={handleLogout} />}
            {viewState === 'SELLER_DASHBOARD' && <SellerDashboard onLogout={handleLogout} />}
          </main>
        </div>
        
        {!['BUYER_DASHBOARD', 'SELLER_DASHBOARD'].includes(viewState) && (
          <div className="fixed bottom-6 left-6 z-50">
             <button 
               onClick={() => setViewState('HOME')} 
               className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-xl"
             >
               N
             </button>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </LanguageProvider>
    </DataProvider>
  );
};

export default App;