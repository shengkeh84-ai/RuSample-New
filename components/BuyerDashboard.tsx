import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { CATEGORY_DATA } from '../constants';
import { 
  Search, Package, Star, Clock, CheckCircle, 
  Settings, User, ShoppingBag, Mail, LogOut, Save,
  LayoutGrid, ChevronRight, Link as LinkIcon, Upload, Image as ImageIcon, X, ExternalLink,
  Camera, Lock, ShieldAlert, Trash2, KeyRound, Mail as MailIcon, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type BuyerView = 'BROWSE' | 'CATEGORIES' | 'MY_SAMPLES' | 'INBOX' | 'SETTINGS';
type SettingsTab = 'PROFILE' | 'SECURITY';

interface BuyerDashboardProps {
  onLogout: () => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { 
      buyerProfile, updateBuyerProfile, buyerAddress, updateBuyerAddress 
  } = useData();
  
  const [activeView, setActiveView] = useState<BuyerView>('BROWSE');
  
  // --- 真实数据状态 ---
  const [realUser, setRealUser] = useState<any | null>(null);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realOrders, setRealOrders] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('PROFILE');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // 初始化加载
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const productsPromise = supabase
            .from('products')
            .select('*')
            .eq('status', 'Active')
            .order('created_at', { ascending: false });
            
        let ordersPromise = Promise.resolve({ data: [], error: null } as any);

        if (user) {
            if (isMounted) {
                setRealUser(user);
                // 获取用户头像
                if (user.user_metadata?.avatar_url) {
                    setAvatarUrl(user.user_metadata.avatar_url);
                }
            }
            ordersPromise = supabase
                .from('orders')
                .select('*')
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });
        }

        const [productsRes, ordersRes] = await Promise.all([productsPromise, ordersPromise]);

        if (isMounted) {
            if (productsRes.data) {
                const formattedProducts = productsRes.data.map((p: any) => ({
                    ...p,
                    platformLinks: p.platform_links || {}, 
                    stockTaken: 0, 
                    images: p.images || []
                }));
                setRealProducts(formattedProducts);
            }
            if (ordersRes.data) {
                setRealOrders(ordersRes.data);
            }
        }
      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initData();
    return () => { isMounted = false; };
  }, []);

  const refreshOrders = async (userId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
          setRealOrders(data);
      }
  };

  const trackInteraction = async (productId: string, type: 'view' | 'click') => {
      try {
          await supabase.rpc('increment_product_stats', { 
              product_id: productId, 
              field_type: type 
          });
      } catch (e) { console.error(e); }
  };

  const displayName = realUser ? (realUser.user_metadata?.full_name || realUser.email?.split('@')[0]) : buyerProfile.displayName;
  const displayEmail = realUser ? realUser.email : 'buyer@example.com';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewCategoryId, setViewCategoryId] = useState(CATEGORY_DATA[0].id);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewExternalLink, setReviewExternalLink] = useState('');
  const [reviewProofFile, setReviewProofFile] = useState<File | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [localProfile, setLocalProfile] = useState(buyerProfile);
  const [localAddress, setLocalAddress] = useState(buyerAddress);
  
  // --- 功能函数 ---

  // 0. 图片压缩与裁剪函数 (核心优化)
  const resizeImage = (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const size = 400; // 目标尺寸 400x400
              
              canvas.width = size;
              canvas.height = size;

              if (!ctx) {
                  reject(new Error("Canvas context failed"));
                  return;
              }

              // 计算裁剪区域 (居中裁剪正方形)
              const minSize = Math.min(img.width, img.height);
              const startX = (img.width - minSize) / 2;
              const startY = (img.height - minSize) / 2;

              // 绘图: 从原图(startX, startY)截取(minSize, minSize)，缩放到(400, 400)
              ctx.drawImage(img, startX, startY, minSize, minSize, 0, 0, size, size);

              // 导出为 Blob (JPEG 格式, 90% 质量)
              canvas.toBlob((blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error("Canvas conversion failed"));
              }, 'image/jpeg', 0.9);
          };
          img.onerror = (err) => reject(err);
      });
  };

  // 1. 头像上传 (集成压缩)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const originalFile = e.target.files[0];
      
      // 自动开始上传
      setIsUploading(true);
      try {
          if (!realUser) throw new Error("No user");

          // 1. 先进行图片处理 (裁剪+压缩)
          const resizedBlob = await resizeImage(originalFile);
          const resizedFile = new File([resizedBlob], "avatar.jpg", { type: "image/jpeg" });

          // 本地预览
          setAvatarFile(resizedFile);
          setAvatarUrl(URL.createObjectURL(resizedFile));

          // 2. 上传处理后的图片
          const fileName = `avatars/${realUser.id}_${Date.now()}.jpg`;
          
          // 上传到 product-media 桶 (复用现有桶)
          const { error: uploadError } = await supabase.storage
              .from('product-media')
              .upload(fileName, resizedFile);
          
          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('product-media').getPublicUrl(fileName);
          
          // 更新用户元数据
          const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: data.publicUrl }
          });

          if (updateError) throw updateError;
          alert("Avatar updated successfully! (Resized to 400x400)");

      } catch (error: any) {
          console.error(error);
          alert("Error updating avatar: " + error.message);
      } finally {
          setIsUploading(false);
          // 清空 input，允许重复选择同一张图
          e.target.value = '';
      }
  };

  // 2. 修改密码
  const handleUpdatePassword = async () => {
      if (newPassword !== confirmPassword) {
          alert("Passwords do not match!");
          return;
      }
      if (newPassword.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
      }
      setIsSecurityLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          alert("Password updated successfully!");
          setNewPassword('');
          setConfirmPassword('');
      } catch (error: any) {
          alert("Error: " + error.message);
      } finally {
          setIsSecurityLoading(false);
      }
  };

  // 3. 换绑邮箱
  const handleUpdateEmail = async () => {
      if (!newEmail.includes('@')) {
          alert("Invalid email address");
          return;
      }
      setIsSecurityLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ email: newEmail });
          if (error) throw error;
          alert("Confirmation links sent to both old and new emails. Please verify to complete the change.");
          setNewEmail('');
      } catch (error: any) {
          alert("Error: " + error.message);
      } finally {
          setIsSecurityLoading(false);
      }
  };

  // 4. 注销账号
  const handleDeleteAccount = async () => {
      if (!confirm("Are you SURE? This action cannot be undone. All your data will be deleted.")) return;
      
      const confirmText = prompt("Type 'DELETE' to confirm account deletion:");
      if (confirmText !== 'DELETE') return;

      setIsSecurityLoading(true);
      try {
          // 调用 SQL 函数删除用户
          const { error } = await supabase.rpc('delete_user');
          if (error) throw error;
          
          alert("Account deleted. Goodbye!");
          onLogout();
      } catch (error: any) {
          console.error(error);
          // 如果 SQL 函数没设置，回退提示
          alert("Could not delete account automatically. Please ensure the 'delete_user' RPC function is set up in Supabase, or contact support.");
      } finally {
          setIsSecurityLoading(false);
      }
  };

  const handleRequestSample = async (productId: string) => {
    if (!realUser) {
        alert("Please login first");
        return;
    }
    trackInteraction(productId, 'view');
    const product = realProducts.find(p => p.id === productId);
    if (!product) return;

    const hasOrdered = realOrders.some(o => o.product_id === productId && o.status !== 'Cancelled');
    if (hasOrdered) {
        alert("You have already requested this sample.");
        return;
    }

    try {
        const { error } = await supabase.from('orders').insert({
            buyer_id: realUser.id,
            seller_id: product.seller_id, 
            product_id: productId,
            status: 'Pending', 
            review_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        if (error) throw error;
        alert('Sample Requested Successfully!');
        await refreshOrders(realUser.id);
        setActiveView('MY_SAMPLES');    
    } catch (error: any) { alert('Request failed: ' + error.message); }
  };

  const handleConfirmDelivery = async (orderId: string) => {
      if (!realUser) return;
      const { error } = await supabase.from('orders').update({ status: 'Review_Pending' }).eq('id', orderId);
      if (!error) await refreshOrders(realUser.id);
      else alert("Error: " + error.message);
  };

  const handleReviewSubmit = async () => {
    if (!realUser) return;
    if (reviewOrderId && reviewExternalLink && reviewProofFile) {
        setIsSubmittingReview(true);
        try {
            let proofUrl = '';
            const fileExt = reviewProofFile.name.split('.').pop();
            const fileName = `${realUser.id}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('review-images').upload(fileName, reviewProofFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('review-images').getPublicUrl(fileName);
            proofUrl = data.publicUrl;

            const { error } = await supabase.from('orders').update({ 
                    status: 'Completed',
                    ozon_link: reviewExternalLink,        
                    review_screenshot_url: proofUrl,      
                    review_data: { rating: reviewRating, comment: reviewContent, submittedAt: new Date().toISOString() }
                }).eq('id', reviewOrderId);

            if (error) throw error;
            await refreshOrders(realUser.id);
            setReviewOrderId(null);
            setShowSuccessModal(true);
            setReviewContent('');
            setReviewExternalLink('');
            setReviewProofFile(null);
            setReviewRating(5);
        } catch (error: any) { alert('Submission failed: ' + error.message); } finally { setIsSubmittingReview(false); }
    } else { alert('Please fill in all required fields.'); }
  };

  const handleCloseSuccessModal = () => { setShowSuccessModal(false); };
  const handleImageLoad = (id: string) => { setLoadedImages(prev => ({ ...prev, [id]: true })); };
  const handleSubcategoryClick = (subId: string, parentId: string) => { setSelectedCategory(parentId); setSearchTerm(t.categories[subId]); setActiveView('BROWSE'); };
  const handleSaveChanges = () => { updateBuyerProfile(localProfile); updateBuyerAddress(localAddress); alert('Settings saved successfully!'); };

  const activeProducts = realProducts.filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  const SidebarItem = ({ view, icon: Icon, label, badge }: { view: BuyerView; icon: any; label: string, badge?: number }) => (
    <button onClick={() => setActiveView(view)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${activeView === view ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
      <div className="relative"><Icon size={20} />{badge ? (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{badge}</span>) : null}</div>
      {label}
    </button>
  );

  const viewCategory = CATEGORY_DATA.find(c => c.id === viewCategoryId);
  
  const notifications = realOrders.filter(o => o.status === 'Shipped').map(o => ({
      id: o.id,
      title: 'Order Shipped!',
      message: `Your sample request for Order #${o.id.slice(0,8)} has been approved and shipped.`,
      date: o.created_at,
      read: false
  }));
  notifications.push({ id: 'welcome', title: 'Welcome', message: 'Welcome to RuSample!', date: new Date().toISOString(), read: false });
  const unreadCount = notifications.length;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Submitted Successfully!</h3>
                <p className="text-gray-500 mb-6">Your review and proof have been uploaded.</p>
                <button onClick={handleCloseSuccessModal} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors">Close & View Order</button>
            </div>
        </div>
      )}

      {/* Review Input Modal */}
      {reviewOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">{t.buyer.writeReview}</h3><button onClick={() => setReviewOrderId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400"/></button></div>
                  <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">Please complete your review on Ozon/WB first, then submit the proof here.</p>
                  <div className="flex justify-center mb-6 gap-2">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110"><Star size={32} fill={star <= reviewRating ? "#EAB308" : "none"} className={star <= reviewRating ? "text-yellow-500" : "text-gray-300"} /></button>))}</div>
                  <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">External Review Link (Required)</label><div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-200 transition-all"><LinkIcon size={16} className="text-gray-400 mr-2 flex-shrink-0" /><input type="url" placeholder="https://ozon.ru/product/reviews/..." value={reviewExternalLink} onChange={(e) => setReviewExternalLink(e.target.value)} className="w-full bg-transparent outline-none text-sm text-gray-700" /></div></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proof Screenshot (Required)</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative cursor-pointer group"><input type="file" accept="image/*" onChange={(e) => e.target.files && setReviewProofFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />{reviewProofFile ? (<div className="text-sm text-green-600 font-bold flex flex-col items-center gap-1"><ImageIcon size={24} /><span className="break-all">{reviewProofFile.name}</span></div>) : (<><Upload size={24} className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" /><span className="text-xs text-gray-500">Click to upload screenshot</span></>)}</div></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label><textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none h-20 text-sm" placeholder="Additional details..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)}></textarea></div>
                  </div>
                  <div className="flex gap-3 mt-6"><button onClick={() => setReviewOrderId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button><button onClick={handleReviewSubmit} disabled={isSubmittingReview || !reviewExternalLink || !reviewProofFile} className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSubmittingReview ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Submit Proof'}</button></div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
         <div className="p-6 border-b border-gray-100"><h2 className="font-bold text-xl text-purple-700 italic">RuSample</h2><div className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-1">Buyer Portal</div></div>
         <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap md:whitespace-normal">
            <SidebarItem view="BROWSE" icon={ShoppingBag} label={t.buyer.browse} />
            <SidebarItem view="CATEGORIES" icon={LayoutGrid} label={t.nav.categories} />
            <SidebarItem view="MY_SAMPLES" icon={Package} label={t.buyer.mySamples} badge={realOrders.filter(o => o.status !== 'Completed').length > 0 ? realOrders.filter(o => o.status !== 'Completed').length : undefined} />
            <SidebarItem view="INBOX" icon={Mail} label={t.buyer.inbox} badge={unreadCount > 0 ? unreadCount : undefined} />
            <SidebarItem view="SETTINGS" icon={Settings} label={t.buyer.settings} />
         </nav>
         <div className="p-4 border-t border-gray-100"><div className="flex items-center gap-3 px-4 py-2"><div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold overflow-hidden">{avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover"/> : displayName.charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-900 truncate">{displayName}</div><div className="text-xs text-gray-500 truncate">{displayEmail}</div></div></div></div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col max-h-screen ${activeView === 'CATEGORIES' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'}`}>
        
        {/* BROWSE VIEW */}
        {activeView === 'BROWSE' && (
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                      <h1 className="text-2xl font-bold text-gray-800">{t.buyer.browse}</h1>
                      <div className="relative w-64 md:w-80"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.nav.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm" /><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /></div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-10 shadow-lg relative overflow-hidden">
                        <div className="relative z-10"><h2 className="text-3xl font-bold mb-2">{t.buyer.welcomeBack}, {displayName}!</h2><p className="opacity-90 max-w-lg">Discover exclusive free samples from top global brands.</p><div className="flex gap-8 mt-6"><div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm"><span className="block text-2xl font-bold">{realOrders.length}</span><span className="text-xs opacity-80 uppercase tracking-wider">{t.buyer.mySamples}</span></div><div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm"><span className="block text-2xl font-bold">{realOrders.filter(o => o.status === 'Review_Pending').length}</span><span className="text-xs opacity-80 uppercase tracking-wider">To Review</span></div></div></div>
                        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full"><path fill="#FFFFFF" d="M45.7,-70.5C58.9,-62.5,69.3,-51.2,75.9,-38.6C82.5,-26,85.4,-12.1,82.8,0.7C80.2,13.5,72.2,25.2,63.6,35.6C55,46,45.8,55.1,34.8,62.8C23.8,70.5,10.9,76.8,-1.2,78.9C-13.3,81,-25.6,78.9,-36.8,71.8C-48,64.7,-58.1,52.6,-65.4,39.5C-72.7,26.4,-77.2,12.3,-75.8,-1.2C-74.4,-14.7,-67.1,-27.6,-57.4,-38.3C-47.7,-49,-35.6,-57.5,-23.4,-66.1C-11.2,-74.7,1.1,-83.4,12.8,-82.3C24.5,-81.2,35.6,-70.3,45.7,-70.5Z" transform="translate(100 100)" /></svg></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Package size={20} className="text-purple-600" />{t.buyer.availableSamples}</h3>
                {isLoading ? (<div className="text-center py-20 text-gray-400">Loading products...</div>) : activeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">{product.stock} left</div>
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-purple-600 font-bold uppercase mb-1">{t.categories[product.category] || product.category}</div>
                                <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.title}</h4>
                                <div className="flex items-center gap-1 mb-4 mt-1">
                                    {product.platformLinks?.ozon && (<a href={product.platformLinks.ozon} target="_blank" rel="noopener noreferrer" onClick={() => trackInteraction(product.id, 'click')} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-colors">OZON</a>)}
                                    {product.platformLinks?.wb && (<a href={product.platformLinks.wb} target="_blank" rel="noopener noreferrer" onClick={() => trackInteraction(product.id, 'click')} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100 hover:bg-purple-100 transition-colors">WB</a>)}
                                </div>
                                <button onClick={() => handleRequestSample(product.id)} className="w-full py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">{t.buyer.requestSample}</button>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (<div className="text-center py-20 text-gray-400"><ShoppingBag size={48} className="mx-auto mb-4 opacity-20" /><p>{t.search.noResults}</p></div>)}
            </div>
        )}

        {/* CATEGORIES VIEW */}
        {activeView === 'CATEGORIES' && (
            <div className="flex w-full h-full bg-gray-50">
                <div className="w-48 md:w-64 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10"><h2 className="font-bold text-gray-800">{t.nav.categories}</h2></div>
                    <div className="py-2">{CATEGORY_DATA.map((cat) => (<button key={cat.id} onClick={() => setViewCategoryId(cat.id)} className={`w-full text-left px-6 py-3.5 flex items-center justify-between text-sm transition-colors ${viewCategoryId === cat.id ? 'bg-purple-50 text-purple-600 font-bold border-l-4 border-purple-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}`}><span>{t.categories[cat.id]}</span>{viewCategoryId === cat.id && <ChevronRight size={14} />}</button>))}</div>
                </div>
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FAFB]">
                    <div className="max-w-6xl mx-auto">
                        {viewCategory && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-8">{t.categories[viewCategory.id]}</h2>
                                {viewCategory.subcategories.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{viewCategory.subcategories.map((sub) => {const isLoaded = loadedImages[sub.id]; return (<div key={sub.id} onClick={() => handleSubcategoryClick(sub.id, viewCategory.id)} className="flex flex-col items-center group cursor-pointer"><div className="w-full aspect-square rounded-xl overflow-hidden bg-[#f8f9fa] border border-gray-200 relative mb-3 transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md">{!isLoaded && (<div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-in fade-in duration-500 flex items-center justify-center text-xs text-gray-400">Loading...</div>)}<img src={sub.image} alt={t.categories[sub.id]} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => handleImageLoad(sub.id)} /></div><span className="text-sm font-medium text-gray-700 text-center group-hover:text-purple-600 transition-colors">{t.categories[sub.id]}</span></div>)})}</div>
                                ) : (<div className="flex flex-col items-center justify-center h-64 text-gray-400"><p>No subcategories available.</p></div>)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* MY SAMPLES VIEW */}
        {activeView === 'MY_SAMPLES' && (
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.buyer.mySamples}</h1>
                {realOrders.length === 0 ? <div className="text-center py-20 text-gray-400">No samples yet</div> : (
                    <div className="grid gap-4">
                        {realOrders.map(order => {
                            const product = realProducts.find(p => p.id === order.product_id) || { title: 'Unknown', images: [] };
                            return (
                                <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-center shadow-sm">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src={product.images?.[0]} className="w-full h-full object-cover" /></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg">{product.title}</h4>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            Status: 
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {order.status === 'Pending' ? 'Pending Review' : order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-64 flex flex-col gap-2">
                                        {order.status === 'Pending' && <div className="text-center text-gray-400 text-sm bg-gray-50 py-2 rounded-lg">Waiting for Seller Approval</div>}
                                        {order.status === 'Shipped' && <button onClick={() => handleConfirmDelivery(order.id)} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Confirm Receipt</button>}
                                        {order.status === 'Review_Pending' && <button onClick={() => setReviewOrderId(order.id)} className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Write Review</button>}
                                        {order.status === 'Completed' && <div className="text-green-600 font-bold text-center">Reviewed</div>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )}

        {/* INBOX */}
        {activeView === 'INBOX' && (
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.buyer.inbox}</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notif, idx) => (
                                <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"><Mail size={20}/></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                        <div className="text-xs text-gray-400 mt-2">{new Date(notif.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (<div className="p-12 text-center text-gray-400">No notifications yet.</div>)}
                </div>
            </div>
        )}

        {/* 5. 升级版 SETTINGS (包含头像、安全、换绑、注销) */}
        {activeView === 'SETTINGS' && (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{t.buyer.settings}</h1>
                    <button onClick={onLogout} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"><LogOut size={18}/>{t.buyer.logout}</button>
                </div>

                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button onClick={() => setActiveSettingsTab('PROFILE')} className={`pb-3 px-2 font-bold text-sm ${activeSettingsTab === 'PROFILE' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>My Profile</button>
                    <button onClick={() => setActiveSettingsTab('SECURITY')} className={`pb-3 px-2 font-bold text-sm ${activeSettingsTab === 'SECURITY' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Account Security</button>
                </div>

                {activeSettingsTab === 'PROFILE' && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-3xl overflow-hidden border-4 border-white shadow-md">
                                    {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 cursor-pointer shadow-sm transition-transform hover:scale-110">
                                    <Camera size={16} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                                </label>
                                {isUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">Uploading...</div>}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Click icon to change avatar</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.fullName}</label><input type="text" value={localProfile.fullName} onChange={(e) => setLocalProfile({...localProfile, fullName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.displayName}</label><input type="text" value={localProfile.displayName} onChange={(e) => setLocalProfile({...localProfile, displayName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={handleSaveChanges} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 flex items-center gap-2"><Save size={20}/>{t.buyer.saveChanges}</button>
                        </div>
                    </div>
                )}

                {activeSettingsTab === 'SECURITY' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Change Password */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><KeyRound size={20}/></div><h3 className="font-bold text-gray-800">Change Password</h3></div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <button onClick={handleUpdatePassword} disabled={isSecurityLoading} className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">Update Password</button>
                        </div>

                        {/* Change Email */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MailIcon size={20}/></div><h3 className="font-bold text-gray-800">Change Email Address</h3></div>
                            <p className="text-sm text-gray-500 mb-4">Current Email: <span className="font-bold text-gray-800">{displayEmail}</span></p>
                            <div className="flex gap-4">
                                <input type="email" placeholder="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500" />
                                <button onClick={handleUpdateEmail} disabled={isSecurityLoading} className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50">Update Email</button>
                            </div>
                        </div>

                        {/* Delete Account */}
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={20}/></div><h3 className="font-bold text-red-700">Delete Account</h3></div>
                            <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                            <button onClick={handleDeleteAccount} disabled={isSecurityLoading} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2"><Trash2 size={16}/> Delete My Account</button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default BuyerDashboard;