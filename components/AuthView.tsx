import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Apple, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- 图标组件保持不变 ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const VKIcon = () => (
  <svg className="w-6 h-6 text-[#0077FF] group-hover:text-[#0066DD]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 22 6.93 20.67 6.93 15.07V8.93C22 3.33 20.67 2 15.07 2zM17.6 14.65c.57 1.32 1.48 2.22 2.3 2.22h.73c.96 0 1.25.64.9 1.3-.28.53-1.07.97-2.12.97-1.47 0-3.23-1.42-4.14-2.58-.33-.42-.65-.6-1-.55-.38.05-.5.35-.5.85v1.27c0 .58-.23.95-1.5.95-3.32 0-6.17-3.77-6.17-8.8 0-1.28.58-1.8 1.5-1.8h2.32c.58 0 .8.27.93.73.4 1.83 1.25 4.3 2.1 4.3.32 0 .5-.37.5-1.55v-2.3c0-1.3-.25-1.78-.97-1.92-.3-.06-.18-.5.5-.68.6-.15 1.75-.18 2.45-.07.72.1 1.05.5 1.05 1.63v3.4c0 .37.15.53.33.53.25 0 .53-.28.98-1.07 1.03-1.8 1.8-3.73 1.8-3.73.1-.53.48-.75 1.15-.75h2.38c.88 0 1.03.45.83 1.15-.4 1.42-2.9 4.88-3.08 5.18-.32.53-.28.77 0 1.2z" />
  </svg>
);

interface AuthViewProps {
  initialMode?: 'LOGIN' | 'SIGNUP';
  onLoginSuccess: (role: 'BUYER' | 'SELLER') => void;
  onSignupSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'LOGIN', onLoginSuccess, onSignupSuccess }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'LOGIN');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  
  // 表单状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 切换 登录/注册 模式
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  // --- 核心：处理邮箱认证 ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // [登录逻辑]
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;

        // 获取用户角色（从数据库 profiles 表或 metadata）
        // 为了确保安全，我们这里直接读取 metadata，它是我们注册时写入的
        const userRole = data.user?.user_metadata?.role;

        // 如果用户身份不匹配，进行拦截
        if (role === 'SELLER' && userRole !== 'SELLER') {
            await supabase.auth.signOut(); 
            throw new Error('此账号不是卖家账号。请切换到“我是买家”登录。');
        }
        
        onLoginSuccess(role);

      } else {
        // [注册逻辑]
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 关键：将用户选定的角色写入 metadata
            data: { role } 
          }
        });

        if (error) throw error;

        alert(`注册成功！请检查您的邮箱 ${email} 进行验证。`);
        onSignupSuccess(); 
        setIsLogin(true); 
      }
    } catch (err: any) {
      alert(err.message || '操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 核心：处理社交登录 ---
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider as any, // 'google', 'facebook' 等
            options: {
                redirectTo: 'https://ru-sample-new-p4b5.vercel.app',
            }
        });
        if (error) throw error;
    } catch (err: any) {
        alert(err.message || `无法使用 ${provider} 登录`);
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)] bg-gray-50">
      
      {/* 左侧展示区域 (UI 保持不变) */}
      <div className="hidden lg:flex flex-1 bg-[#5D3EA8] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center max-w-md w-full z-10">
          <div className="relative w-64 h-[500px] bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden mb-12 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
             <div className="w-full h-full bg-white relative flex flex-col">
                <div className="h-24 bg-purple-50 p-4 pt-8 flex items-end">
                   <div className="w-8 h-8 rounded-full bg-purple-200"></div>
                   <div className="ml-2 w-24 h-4 bg-purple-100 rounded"></div>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                    <div className="w-full h-32 bg-gray-100 rounded-xl relative overflow-hidden group">
                       <img src="https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=300" className="w-full h-full object-cover" alt="Product" />
                       <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded text-[10px] font-bold text-purple-600">NEW</div>
                    </div>
                    <div className="space-y-2">
                        <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                        <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-full h-32 bg-gray-100 rounded-xl mt-4 relative overflow-hidden">
                       <img src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300" className="w-full h-full object-cover" alt="Product 2" />
                    </div>
                </div>
                <div className="h-12 border-t border-gray-100 flex justify-around items-center px-4">
                   <div className="w-6 h-6 rounded bg-gray-200"></div>
                   <div className="w-6 h-6 rounded bg-purple-500"></div>
                   <div className="w-6 h-6 rounded bg-gray-200"></div>
                </div>
             </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-6 leading-tight">
            {t.auth.leftHeadline}
          </h2>
          
          <button className="px-8 py-3 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all">
            {t.auth.getAppButton}
          </button>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-24 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
             <h1 style={{color: 'red', fontSize: '30px', textAlign: 'center'}}>我是新版本！！！</h1>
             <h2 className="text-3xl font-bold text-gray-900 mb-2">
               {isLogin ? t.auth.loginTitle : t.auth.signupTitle}
             </h2>
             <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600">
               <span>{isLogin ? t.auth.notMember : t.auth.alreadyMember}</span>
               <button 
                 onClick={toggleMode}
                 className="text-purple-600 font-bold hover:underline decoration-2 underline-offset-2"
               >
                 {isLogin ? t.auth.registerLink : t.auth.loginLink}
               </button>
             </div>
          </div>

          {/* 角色选择器 */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all duration-200 ${role === 'BUYER' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.auth.roleBuyer}
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all duration-200 ${role === 'SELLER' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.auth.roleSeller}
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.auth.emailLabel}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t.auth.emailPlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.auth.passwordLabel}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-left">
                <button type="button" className="text-purple-600 font-bold text-sm hover:underline">
                  {t.auth.forgotPassword}
                </button>
              </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-purple-300 text-white font-bold rounded-full shadow-md hover:bg-purple-400 active:scale-95 transition-all text-lg mb-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? t.auth.submitLogin : t.auth.submitSignup}
            </button>
          </form>

          <div className="h-6 relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-200"></div>
            <span className="bg-gray-50 px-4 text-xs text-gray-400 font-medium relative z-10">OR</span>
          </div>

          <div className="space-y-3 mt-6">
             <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <GoogleIcon />
                {t.auth.continueGoogle}
             </button>

             <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <FacebookIcon />
                {t.auth.continueFacebook}
             </button>

             <button onClick={() => handleSocialLogin('apple')} className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <Apple size={20} className="text-black" />
                {t.auth.continueApple}
             </button>

             <button onClick={() => handleSocialLogin('vk')} className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm group">
                <VKIcon />
                {t.auth.continueVK}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;