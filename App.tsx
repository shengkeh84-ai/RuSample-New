import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchView from './components/SearchView';
import CategoryView from './components/CategoryView';
import AuthView from './components/AuthView';
import BuyerDashboard from './components/BuyerDashboard';
import SellerDashboard from './components/SellerDashboard';
import { useLanguage } from './contexts/LanguageContext';
import { supabase } from './lib/supabase';

function App() {
  const { t } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'BUYER' | 'SELLER' | null>(null);
  
  // 新增：是否需要选择身份的状态
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  // 初始化检查登录状态
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const role = user.user_metadata?.role;
        if (role) {
            setUserRole(role);
        } else {
            // 如果已登录但没身份，开启选择模式
            setNeedsRoleSelection(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) {
          const role = currentUser.user_metadata?.role;
          if (role) {
              setUserRole(role);
              setNeedsRoleSelection(false);
          } else {
              // 刚注册（比如Google登录），没有身份
              setNeedsRoleSelection(true);
          }
      } else {
          setUserRole(null);
          setNeedsRoleSelection(false);
      }
      setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRoleSelect = async (role: 'BUYER' | 'SELLER') => {
      if (!user) return;
      
      // 更新数据库中的用户身份
      const { error } = await supabase.auth.updateUser({
          data: { role: role }
      });

      if (!error) {
          setUserRole(role);
          setNeedsRoleSelection(false);
      } else {
          alert("Error saving role: " + error.message);
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setNeedsRoleSelection(false);
  };

  // 如果需要选择身份，显示全屏选择界面
  if (user && needsRoleSelection) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
              <div className="max-w-md w-full p-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
                  <p className="text-gray-500 mb-8">Please select your account type to continue.</p>
                  
                  <div className="space-y-4">
                      <button 
                          onClick={() => handleRoleSelect('BUYER')}
                          className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition-all group text-left flex items-center gap-4"
                      >
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛍️</div>
                          <div>
                              <h3 className="font-bold text-gray-900">I am a Buyer</h3>
                              <p className="text-sm text-gray-500">I want to find samples & review products</p>
                          </div>
                      </button>

                      <button 
                          onClick={() => handleRoleSelect('SELLER')}
                          className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition-all group text-left flex items-center gap-4"
                      >
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💼</div>
                          <div>
                              <h3 className="font-bold text-gray-900">I am a Seller</h3>
                              <p className="text-sm text-gray-500">I want to list products & get reviews</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // 路由逻辑
  if (userRole === 'SELLER') {
    return <SellerDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'BUYER') {
    return <BuyerDashboard onLogout={handleLogout} />;
  }

  // 未登录状态：显示首页
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar 
        onLoginClick={() => { setAuthMode('LOGIN'); setShowAuth(true); }} 
        onSignupClick={() => { setAuthMode('SIGNUP'); setShowAuth(true); }} 
      />
      <main>
        <Hero onGetApp={() => { setAuthMode('SIGNUP'); setShowAuth(true); }} />
        <SearchView />
        <CategoryView />
      </main>
      
      {showAuth && (
        <AuthView 
          initialMode={authMode} 
          onClose={() => setShowAuth(false)} 
        />
      )}
    </div>
  );
}

export default App;