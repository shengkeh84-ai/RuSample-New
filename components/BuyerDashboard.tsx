import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { CATEGORY_DATA } from '../constants';
import { 
  Search, Package, Star, Clock, CheckCircle, 
  Settings, User, ShoppingBag, Mail, LogOut, Save,
  LayoutGrid, ChevronRight, Link as LinkIcon, Upload, Image as ImageIcon, X, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type BuyerView = 'BROWSE' | 'CATEGORIES' | 'MY_SAMPLES' | 'INBOX' | 'SETTINGS';

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
  const [realUser, setRealUser] = useState<{email: string, id: string} | null>(null);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realOrders, setRealOrders] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 并行加载商品
        const productsPromise = supabase
            .from('products')
            .select('*')
            .eq('status', 'Active')
            .order('created_at', { ascending: false });
            
        let ordersPromise = Promise.resolve({ data: [], error: null } as any);

        if (user) {
            if (isMounted) setRealUser({ email: user.email || '', id: user.id });
            // 加载订单
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

  // 刷新订单函数
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

  const displayName = realUser ? realUser.email.split('@')[0] : buyerProfile.displayName;
  const displayEmail = realUser ? realUser.email : 'buyer@example.com';

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewCategoryId, setViewCategoryId] = useState(CATEGORY_DATA[0].id);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Review Modal States
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewExternalLink, setReviewExternalLink] = useState('');
  const [reviewProofFile, setReviewProofFile] = useState<File | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // 成功弹窗状态
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Local Forms
  const [localProfile, setLocalProfile] = useState(buyerProfile);
  const [localAddress, setLocalAddress] = useState(buyerAddress);
  
  // 1. 申请样品
  const handleRequestSample = async (productId: string) => {
    if (!realUser) {
        alert("Please login first");
        return;
    }
    
    const product = realProducts.find(p => p.id === productId);
    if (!product) return;

    // 检查 product_id (数据库字段)
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

    } catch (error: any) {
        alert('Request failed: ' + error.message);
    }
  };

  // 2. 确认收货
  const handleConfirmDelivery = async (orderId: string) => {
      if (!realUser) return;
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Review_Pending' }) 
        .eq('id', orderId);
      
      if (!error) {
          await refreshOrders(realUser.id);
      } else {
          alert("Error: " + error.message);
      }
  };

  // 3. 提交评价 (核心修改：上传到 review-images 并存入新字段)
  const handleReviewSubmit = async () => {
    if (!realUser) return;

    if (reviewOrderId && reviewExternalLink && reviewProofFile) {
        setIsSubmittingReview(true);
        try {
            let proofUrl = '';
            // 使用时间戳防止文件名冲突
            const fileExt = reviewProofFile.name.split('.').pop();
            const fileName = `${realUser.id}_${Date.now()}.${fileExt}`;
            
            // 上传到 review-images 桶
            const { error: uploadError } = await supabase.storage
                .from('review-images')
                .upload(fileName, reviewProofFile);
            
            if (uploadError) throw uploadError;
            
            // 获取公开链接
            const { data } = supabase.storage
                .from('review-images')
                .getPublicUrl(fileName);
            proofUrl = data.publicUrl;

            // 存入数据库 (使用新添加的字段)
            const { error } = await supabase
                .from('orders')
                .update({ 
                    status: 'Completed',
                    ozon_link: reviewExternalLink,        // 存入 ozon_link 字段
                    review_screenshot_url: proofUrl,      // 存入 screenshot 字段
                    // 同时也存入 JSONB 以备不时之需
                    review_data: {
                        rating: reviewRating,
                        comment: reviewContent,
                        submittedAt: new Date().toISOString()
                    }
                })
                .eq('id', reviewOrderId);

            if (error) throw error;

            // 刷新数据
            await refreshOrders(realUser.id);

            // 关闭评论输入窗，显示成功窗
            setReviewOrderId(null);
            setShowSuccessModal(true);

            // 重置表单
            setReviewContent('');
            setReviewExternalLink('');
            setReviewProofFile(null);
            setReviewRating(5);

        } catch (error: any) {
            console.error("Submission error:", error);
            alert('Submission failed: ' + error.message);
        } finally {
            setIsSubmittingReview(false);
        }
    } else {
        alert('Please fill in all required fields (Link & Screenshot).');
    }
  };

  const handleCloseSuccessModal = () => {
      setShowSuccessModal(false);
      // 用户关闭成功弹窗后，页面已经在 My Samples，可以看到更新后的状态
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };
  const handleSubcategoryClick = (subId: string, parentId: string) => {
      setSelectedCategory(parentId);
      setSearchTerm(t.categories[subId]); 
      setActiveView('BROWSE');
  };
  const handleSaveChanges = () => {
    updateBuyerProfile(localProfile);
    updateBuyerAddress(localAddress);
    alert('Settings saved successfully!');
  };

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
  const myNotifications = [{ id: '1', title: 'Welcome', message: 'Welcome to RuSample!', date: new Date().toISOString(), read: false, type: 'SYSTEM', userId: 'current_buyer' }];
  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      
      {/* 成功弹窗 (Success Modal) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Submitted Successfully!</h3>
                <p className="text-gray-500 mb-6">Your review and proof have been uploaded. You can view them in your order list.</p>
                <button 
                    onClick={handleCloseSuccessModal}
                    className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                    Close & View Order
                </button>
            </div>
        </div>
      )}

      {/* Review Input Modal */}
      {reviewOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{t.buyer.writeReview}</h3>
                      <button onClick={() => setReviewOrderId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400"/></button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">Please complete your review on Ozon/WB first, then submit the proof here.</p>
                  
                  {/* Rating */}
                  <div className="flex justify-center mb-6 gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110"><Star size={32} fill={star <= reviewRating ? "#EAB308" : "none"} className={star <= reviewRating ? "text-yellow-500" : "text-gray-300"} /></button>))}
                  </div>

                  <div className="space-y-4">
                      {/* External Link */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">External Review Link (Required)</label>
                          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                              <LinkIcon size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                              <input type="url" placeholder="https://ozon.ru/product/reviews/..." value={reviewExternalLink} onChange={(e) => setReviewExternalLink(e.target.value)} className="w-full bg-transparent outline-none text-sm text-gray-700" />
                          </div>
                      </div>

                      {/* Screenshot Upload */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proof Screenshot (Required)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                                <input type="file" accept="image/*" onChange={(e) => e.target.files && setReviewProofFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {reviewProofFile ? (
                                    <div className="text-sm text-green-600 font-bold flex flex-col items-center gap-1">
                                        <ImageIcon size={24} />
                                        <span className="break-all">{reviewProofFile.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs text-gray-500">Click to upload screenshot</span>
                                    </>
                                )}
                          </div>
                      </div>

                      {/* Comment */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label>
                          <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none h-20 text-sm" placeholder="Additional details..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)}></textarea>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setReviewOrderId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                      <button 
                        onClick={handleReviewSubmit} 
                        disabled={isSubmittingReview || !reviewExternalLink || !reviewProofFile} 
                        className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isSubmittingReview ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Submit Proof'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
         <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-xl text-purple-700 italic">RuSample</h2>
            <div className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-1">Buyer Portal</div>
         </div>
         <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap md:whitespace-normal">
            <SidebarItem view="BROWSE" icon={ShoppingBag} label={t.buyer.browse} />
            <SidebarItem view="CATEGORIES" icon={LayoutGrid} label={t.nav.categories} />
            <SidebarItem view="MY_SAMPLES" icon={Package} label={t.buyer.mySamples} badge={realOrders.filter(o => o.status !== 'Completed').length > 0 ? realOrders.filter(o => o.status !== 'Completed').length : undefined} />
            <SidebarItem view="INBOX" icon={Mail} label={t.buyer.inbox} badge={unreadCount > 0 ? unreadCount : undefined} />
            <SidebarItem view="SETTINGS" icon={Settings} label={t.buyer.settings} />
         </nav>
         <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 px-4 py-2">
                 <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">{displayName.charAt(0).toUpperCase()}</div>
                 <div className="flex-1 min-w-0">
                     <div className="text-sm font-bold text-gray-900 truncate">{displayName}</div>
                     <div className="text-xs text-gray-500 truncate">{displayEmail}</div>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col max-h-screen ${activeView === 'CATEGORIES' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'}`}>
        
        {/* BROWSE VIEW */}
        {activeView === 'BROWSE' && (
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                      <h1 className="text-2xl font-bold text-gray-800">{t.buyer.browse}</h1>
                      <div className="relative w-64 md:w-80">
                          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.nav.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm" />
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      </div>
                </div>
                {/* Banner */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-10 shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2">{t.buyer.welcomeBack}, {displayName}!</h2>
                            <p className="opacity-90 max-w-lg">Discover exclusive free samples from top global brands.</p>
                            <div className="flex gap-8 mt-6">
                                    <div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm"><span className="block text-2xl font-bold">{realOrders.length}</span><span className="text-xs opacity-80 uppercase tracking-wider">{t.buyer.mySamples}</span></div>
                                    <div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm"><span className="block text-2xl font-bold">{realOrders.filter(o => o.status === 'Review_Pending').length}</span><span className="text-xs opacity-80 uppercase tracking-wider">To Review</span></div>
                            </div>
                        </div>
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
                                    {product.platformLinks?.ozon && (<span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">OZON</span>)}
                                    {product.platformLinks?.wb && (<span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100">WB</span>)}
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
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400">Loading orders...</div>
                ) : realOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm"><ShoppingBag size={48} className="mx-auto mb-4 opacity-20" /><p>You haven't requested any samples yet.</p><button onClick={() => setActiveView('BROWSE')} className="mt-4 text-purple-600 font-bold hover:underline">Start Browsing</button></div>
                ) : (
                    <div className="grid gap-4">
                        {realOrders.map(order => {
                            const product = realProducts.find(p => p.id === order.product_id) || { title: 'Unknown Product', images: [] };
                            let daysLeft = null; let isOverdue = false;
                            if (order.status === 'Review_Pending' && order.review_deadline) { const diffTime = new Date(order.review_deadline).getTime() - Date.now(); daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (daysLeft < 0) isOverdue = true; }
                            
                            return (
                                <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200"><img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" /></div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="font-bold text-lg text-gray-800">{product.title}</h4>
                                        <div className="text-sm text-gray-500 mt-1">Order #{order.id.slice(0,8)} • {new Date(order.created_at).toLocaleDateString()}</div>
                                        <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' : order.status === 'Review_Pending' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{t.seller.status}: {order.status}</span>
                                            {order.status === 'Review_Pending' && (<span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}><Clock size={12} />{isOverdue ? t.buyer.overdue : `${daysLeft} ${t.buyer.daysLeft}`}</span>)}
                                        </div>
                                        
                                        {/* 显示已提交的评论信息 */}
                                        {order.status === 'Completed' && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-left">
                                                <div className="text-xs font-bold text-gray-500 uppercase mb-2">My Review Info</div>
                                                <div className="flex items-center gap-4">
                                                    {order.review_screenshot_url && (
                                                        <a href={order.review_screenshot_url} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded border border-gray-200 overflow-hidden hover:opacity-80">
                                                            <img src={order.review_screenshot_url} className="w-full h-full object-cover" alt="Proof" />
                                                        </a>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        {order.ozon_link || order.wb_link ? (
                                                            <a href={order.ozon_link || order.wb_link} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline flex items-center gap-1 truncate">
                                                                <LinkIcon size={12} /> View Published Review
                                                            </a>
                                                        ) : <span className="text-xs text-gray-400">No link provided</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-64 flex flex-col gap-2">
                                            {order.status === 'Pending' && (<div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-lg border border-gray-100"><Clock size={16} />{t.buyer.waitingShipment}</div>)}
                                            {order.status === 'Shipped' && (<button onClick={() => handleConfirmDelivery(order.id)} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">{t.buyer.confirmReceipt}</button>)}
                                            {order.status === 'Review_Pending' && (
                                                <button onClick={() => { setReviewOrderId(order.id); setReviewContent(''); setReviewRating(5); setReviewExternalLink(''); setReviewProofFile(null); }} className={`w-full py-2 text-white font-bold rounded-lg transition-colors shadow-sm bg-purple-600 hover:bg-purple-700`}>{t.buyer.writeReview}</button>
                                            )}
                                            {order.status === 'Completed' && (<div className="text-center text-green-600 font-bold flex items-center justify-center gap-2 bg-green-50 py-3 rounded-lg border border-green-100"><CheckCircle size={20} />{t.buyer.reviewed}</div>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* INBOX & SETTINGS views... */}
        {activeView === 'INBOX' && <div className="p-8 text-center text-gray-400">Inbox (Coming Soon)</div>}
        {activeView === 'SETTINGS' && (
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.buyer.settings}</h1>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><User size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">{t.buyer.profile}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.fullName}</label>
                            <input type="text" value={localProfile.fullName} onChange={(e) => setLocalProfile({...localProfile, fullName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.displayName}</label>
                            <input type="text" value={localProfile.displayName} onChange={(e) => setLocalProfile({...localProfile, displayName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pb-12">
                    <button onClick={onLogout} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 flex items-center gap-2"><LogOut size={20}/>{t.buyer.logout}</button>
                    <button onClick={handleSaveChanges} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 flex items-center gap-2"><Save size={20}/>{t.buyer.saveChanges}</button>
                </div>
            </div>
        )}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;