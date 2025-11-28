import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { CATEGORY_DATA } from '../constants';
import { Order, Review } from '../types';
import { 
  LayoutDashboard, Package, BarChart3, Settings, Plus, Upload, Link, Check, X, 
  Image as ImageIcon, Trash2, Edit2, Shield, Bell, User, Save, Truck, Star, Eye,
  ArrowUpRight, ArrowDownRight, TrendingUp, LogOut, CreditCard, Award,
  CheckCircle, Calendar, ExternalLink, PlayCircle, GripHorizontal
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types & Icons ---
const AlipayIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg viewBox="0 0 1024 1024" width={size} height={size} className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M928 224H608V128h-96v96H192v96h320v32c0 108.8-39.4 207-106.8 281.6-46.8-51.4-81.8-109.8-102.6-173l-89.8 29.6c26.2 79.4 70.2 152.2 129.2 215.2-64.8 53.4-143.4 87.2-229.4 97.4l11.6 90.8c105.6-12.4 202.4-53.8 282.8-119.8 69.4 56.6 153.2 90.2 244.2 92.6l4.2-90.8c-73.4-2-141.2-29-197.4-74.6 59.6-67.4 96-155.4 96-250h264v-96H512v-32h416v-96z" /></svg>
);
const WeChatIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg viewBox="0 0 1024 1024" width={size} height={size} className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M512 64C264.6 64 64 242.2 64 461.9c0 119.5 59.2 227.3 154.9 301.6l-37.1 133.4 163.7-88.8c51.9 14.5 107.4 22.4 165.2 22.4 247.4 0 448-178.2 448-397.9S759.4 64 512 64z m258.8 322.6L462.1 695.3c-12.5 12.5-32.8 12.5-45.3 0L253.2 531.7c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l141 141 286-286c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z" /></svg>
);

interface MediaItem {
    id: string;
    url: string;
    file?: File;
    type: 'EXISTING' | 'NEW';
    isVideo: boolean;
}

type SellerView = 'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'CREATE_PRODUCT' | 'ANALYTICS' | 'SETTINGS' | 'MEMBERSHIP';

interface SellerDashboardProps {
  onLogout: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { products: fakeProducts, deleteProduct, sellerSubscription, upgradeSubscription } = useData();
  const [currentView, setCurrentView] = useState<SellerView>('OVERVIEW');
  const [overviewTab, setOverviewTab] = useState<'REVIEWS' | 'PRODUCTS' | 'ORDERS'>('REVIEWS');
  const [selectedReviewDetail, setSelectedReviewDetail] = useState<any | null>(null);
  const overviewContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Supabase Real Data State ---
  const [realUser, setRealUser] = useState<{email: string, id: string} | null>(null);
  const [realProducts, setRealProducts] = useState<any[]>([]); 
  const [realOrders, setRealOrders] = useState<any[]>([]); 
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setRealUser({ email: user.email || '', id: user.id });
        fetchMyProducts(user.id);
        fetchMyOrders(user.id);
      }
    };
    initData();
  }, []);

  const fetchMyProducts = async (userId: string) => {
    setIsLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) setRealProducts(data);
    setIsLoadingProducts(false);
  };

  const fetchMyOrders = async (userId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });
      if(!error && data) setRealOrders(data);
  };

  const handleShipOrder = async (orderId: string) => {
      if (!realUser) return;
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Shipped' })
        .eq('id', orderId);
      if (!error) {
          alert("Order marked as Shipped!");
          setRealOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Shipped' } : o));
      } else {
          alert("Error: " + error.message);
      }
  };

  const displayProducts = realProducts.length > 0 ? realProducts : fakeProducts;
  const displayOrders = realOrders;

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [paymentMethod, setPaymentMethod] = useState<'ALIPAY' | 'WECHAT' | 'CARD'>('ALIPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Product Form State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState(CATEGORY_DATA[0].id);
  const [productDesc, setProductDesc] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [ozonLink, setOzonLink] = useState('');
  const [wbLink, setWbLink] = useState('');
  const [reqPhoto, setReqPhoto] = useState(true);
  const [reqVideo, setReqVideo] = useState(false);
  
  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [shopName, setShopName] = useState('My Awesome Shop');
  
  // Helpers
  const completedReviews = displayOrders.filter(o => o.status === 'Completed').length;
  const totalSamplesClaimed = displayOrders.length;
  const reviewRate = totalSamplesClaimed > 0 ? Math.round((completedReviews / totalSamplesClaimed) * 100) : 0;
  const daysRemaining = Math.ceil((new Date(sellerSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;

  const recentReviewsList = displayOrders
    .filter(o => o.status === 'Completed')
    .map(o => ({
        id: o.id,
        rating: o.review_data?.rating || 5,
        content: o.review_data?.comment || '',
        date: o.review_data?.submittedAt || o.created_at,
        buyerName: 'Buyer', 
        productTitle: displayProducts.find(p => p.id === o.product_id)?.title || 'Unknown Product',
        productImage: displayProducts.find(p => p.id === o.product_id)?.images?.[0] || '',
        proofUrl: o.review_screenshot_url,
        externalLink: o.ozon_link || o.wb_link
    }))
    .slice(0, 5);

  const isVideoUrl = (url: string) => {
      const lower = url.toLowerCase();
      return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.endsWith('.ogg');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (mediaItems.length + newFiles.length > 9) {
          alert("Maximum 9 files allowed. Please remove some first.");
          return;
      }
      const newMediaItems: MediaItem[] = newFiles.map(file => ({
          id: `new-${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(file),
          file: file,
          type: 'NEW',
          isVideo: file.type.startsWith('video/')
      }));
      setMediaItems(prev => [...prev, ...newMediaItems]);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMediaItem = (index: number) => {
      setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => { setDraggedItemIndex(index); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      const newItems = [...mediaItems];
      const draggedItem = newItems[draggedItemIndex];
      newItems.splice(draggedItemIndex, 1);
      newItems.splice(index, 0, draggedItem);
      setDraggedItemIndex(index);
      setMediaItems(newItems);
  };
  const handleDragEnd = () => { setDraggedItemIndex(null); };

  const handleUploadClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const handleEditClick = (product: any) => {
      setEditingId(product.id);
      setProductTitle(product.title);
      setProductCategory(product.category);
      setProductDesc(product.description || '');
      setQuantity(product.stock);
      setOzonLink(product.platform_links?.ozon || '');
      setWbLink(product.platform_links?.wb || '');
      setReqPhoto(product.requirements?.photo || true);
      setReqVideo(product.requirements?.video || false);
      const existing: MediaItem[] = (product.images || []).map((url: string, idx: number) => ({
          id: `exist-${idx}-${Date.now()}`,
          url: url,
          type: 'EXISTING',
          isVideo: isVideoUrl(url)
      }));
      setMediaItems(existing);
      setCurrentView('CREATE_PRODUCT');
  };

  const resetForm = () => {
      setEditingId(null);
      setProductTitle('');
      setProductDesc('');
      setQuantity(10);
      setOzonLink('');
      setWbLink('');
      setMediaItems([]);
      setReqPhoto(true);
      setReqVideo(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realUser) return;
    setIsPublishing(true);

    try {
        const finalImageUrls: string[] = [];

        // 按当前拖拽后的顺序处理图片
        for (const item of mediaItems) {
            if (item.type === 'EXISTING') {
                finalImageUrls.push(item.url);
            } else if (item.type === 'NEW' && item.file) {
                const fileExt = item.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${realUser.id}/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('product-media').upload(filePath, item.file);
                if (!uploadError) {
                    const { data } = supabase.storage.from('product-media').getPublicUrl(filePath);
                    finalImageUrls.push(data.publicUrl);
                }
            }
        }

        if (finalImageUrls.length === 0) {
            finalImageUrls.push('https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300');
        }

        const productData = {
            seller_id: realUser.id,
            title: productTitle,
            description: productDesc,
            category: productCategory,
            stock: quantity,
            images: finalImageUrls,
            platform_links: { ozon: ozonLink, wb: wbLink },
            requirements: { photo: reqPhoto, video: reqVideo },
            status: 'Active'
        };

        if (editingId) {
            // 修复点：使用 select() 确保更新成功并返回数据
            const { data: updatedData, error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingId)
                .select(); // 关键：要求返回更新后的数据

            if (updateError) throw updateError;
            
            // 如果 updatedData 为空，说明没有权限修改或ID不存在
            if (!updatedData || updatedData.length === 0) {
                throw new Error("Update failed. Please check your permissions or try refreshing.");
            }

            // 更新本地视图
            setRealProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...productData } : p));
            alert('Product Updated Successfully!');
        } else {
            const { error: insertError } = await supabase.from('products').insert(productData);
            if (insertError) throw insertError;
            alert('Product Published Successfully!');
            await fetchMyProducts(realUser.id);
        }

        resetForm();
        setCurrentView('PRODUCTS');

    } catch (error: any) {
        alert('Error saving product: ' + error.message);
    } finally {
        setIsPublishing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
      if(!confirm("Are you sure you want to delete this product?")) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if(!error) {
          setRealProducts(prev => prev.filter(p => p.id !== id));
      } else {
          // 如果数据库删除失败，尝试从本地删除（应对假数据情况）
          deleteProduct(id);
      }
  }

  const handleSaveSettings = () => { alert('Settings saved successfully!'); };
  const handleProcessPayment = () => {
      setIsProcessingPayment(true);
      setTimeout(() => {
          upgradeSubscription(selectedPlan);
          setIsProcessingPayment(false);
          setShowPaymentModal(false);
          alert('Payment Successful!');
      }, 2000);
  };
  const handleKpiClick = (type: 'REVIEWS' | 'PRODUCTS' | 'ORDERS') => {
      setOverviewTab(type);
      if (overviewContentRef.current) overviewContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SidebarItem = ({ view, icon: Icon, label, badge }: { view: SellerView; icon: any; label: string, badge?: React.ReactNode }) => (
    <button 
      onClick={() => { if (view === 'CREATE_PRODUCT') resetForm(); setCurrentView(view); }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${currentView === view ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {badge}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      
      {/* Review Modal */}
      {selectedReviewDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800">Review Details</h3>
                      <button onClick={() => setSelectedReviewDetail(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500"/></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="flex items-center gap-3 mb-6">
                          <img src={selectedReviewDetail.productImage} className="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="Product"/>
                          <div>
                              <div className="text-sm text-gray-500">Product</div>
                              <div className="font-bold text-gray-800">{selectedReviewDetail.productTitle}</div>
                          </div>
                      </div>
                      <div className="mb-6">
                          <div className="flex text-yellow-500 mb-2">{[...Array(5)].map((_, i) => (<Star key={i} size={18} fill={i < selectedReviewDetail.rating ? "currentColor" : "none"} />))}</div>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{selectedReviewDetail.content}"</p>
                      </div>
                      <div className="mb-6">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Proof Screenshot</label>
                          {selectedReviewDetail.proofUrl ? (
                              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100"><img src={selectedReviewDetail.proofUrl} alt="Proof" className="w-full h-auto object-contain max-h-64" /></div>
                          ) : (<div className="text-sm text-gray-400 italic">No screenshot provided.</div>)}
                      </div>
                      {selectedReviewDetail.externalLink ? (
                          <a href={selectedReviewDetail.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"><ExternalLink size={18} /> View on Ozon/WB</a>
                      ) : (<button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed">No Link Provided</button>)}
                  </div>
              </div>
          </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Award className="text-purple-600" />{t.seller.upgradeToPro}</h3>
                      <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                  </div>
                  <div className="p-8 flex-1 overflow-y-auto">
                      {isExpired && (<div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 border border-red-100"><Shield size={20} /><span className="font-bold">{t.seller.trialExpired}</span><span className="text-sm">{t.seller.paymentRequired}</span></div>)}
                      <button onClick={handleProcessPayment} disabled={isProcessingPayment} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isProcessingPayment ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <>{t.seller.payNow} - {selectedPlan === 'MONTHLY' ? '$49.99' : '$389.00'}</>}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
         <div className="p-6 border-b border-gray-100 flex flex-col gap-1">
            <h2 className="font-bold text-xl text-purple-700">{t.seller.dashboard}</h2>
            {realUser && <div className="text-xs text-gray-500 truncate">{realUser.email}</div>}
         </div>
         <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap md:whitespace-normal">
            <SidebarItem view="OVERVIEW" icon={LayoutDashboard} label={t.seller.overview} />
            <SidebarItem view="PRODUCTS" icon={Package} label={t.seller.products} />
            <SidebarItem view="ORDERS" icon={Truck} label={t.seller.orders} />
            <SidebarItem view="ANALYTICS" icon={BarChart3} label={t.seller.analytics} />
            <div className="my-4 border-t border-gray-100"></div>
            <SidebarItem view="MEMBERSHIP" icon={Award} label={t.seller.membership} badge={<span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{isExpired ? 'EXP' : 'PRO'}</span>} />
            <SidebarItem view="SETTINGS" icon={Settings} label={t.seller.settings} />
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        
        {currentView === 'OVERVIEW' && (
            <>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{t.seller.overview}</h1>
                    <button onClick={() => { resetForm(); setCurrentView('CREATE_PRODUCT'); }} className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"><Plus size={18} />{t.seller.createProduct}</button>
                </div>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div onClick={() => handleKpiClick('REVIEWS')} className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all ${overviewTab === 'REVIEWS' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                        <p className={`text-sm font-medium mb-2 ${overviewTab === 'REVIEWS' ? 'text-purple-600' : 'text-gray-500'}`}>{t.seller.totalReviews}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{completedReviews}</h3>
                        <div className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">+12 this week</div>
                    </div>
                    <div onClick={() => handleKpiClick('PRODUCTS')} className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all ${overviewTab === 'PRODUCTS' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                        <p className={`text-sm font-medium mb-2 ${overviewTab === 'PRODUCTS' ? 'text-purple-600' : 'text-gray-500'}`}>{t.seller.activeProducts}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{displayProducts.length}</h3>
                    </div>
                    <div onClick={() => handleKpiClick('ORDERS')} className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all ${overviewTab === 'ORDERS' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                        <p className={`text-sm font-medium mb-2 ${overviewTab === 'ORDERS' ? 'text-purple-600' : 'text-gray-500'}`}>{t.seller.pendingOrders}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{displayOrders.filter(o => o.status === 'Pending').length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium mb-2">{t.seller.reviewRate}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{reviewRate}%</h3>
                        <div className="mt-2 text-xs font-bold text-green-500">Excellent</div>
                    </div>
                </div>

                {/* Dynamic Overview Content */}
                <div ref={overviewContentRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-lg text-gray-800">{overviewTab === 'REVIEWS' && t.seller.recentReviews}{overviewTab === 'PRODUCTS' && t.seller.products}{overviewTab === 'ORDERS' && t.seller.orders}</h3>
                    </div>
                    {overviewTab === 'REVIEWS' && (
                        <div className="divide-y divide-gray-100">{recentReviewsList.length > 0 ? (recentReviewsList.map(review => (<div key={review.id} className="p-6 flex gap-4 hover:bg-gray-50 transition-colors items-start"><div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"><img src={review.productImage} alt={review.productTitle} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><div className="flex justify-between items-start mb-1"><div><h4 className="font-bold text-sm text-gray-900 line-clamp-1">{review.productTitle}</h4><div className="flex items-center gap-2 mt-0.5"><span className="text-xs font-medium text-gray-500">{review.buyerName}</span><div className="flex text-yellow-400">{[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />))}</div></div></div><span className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(review.date).toLocaleDateString()}</span></div><p className="text-sm text-gray-600 line-clamp-2">{review.content}</p></div><button onClick={() => setSelectedReviewDetail(review)} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors ml-2 flex-shrink-0"><Eye size={18} /></button></div>))) : (<div className="p-12 text-center text-gray-400">No reviews yet.</div>)}</div>
                    )}
                    {overviewTab === 'PRODUCTS' && (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-sm uppercase"><tr><th className="px-6 py-4 font-medium">{t.seller.recentProducts}</th><th className="px-6 py-4 font-medium">{t.seller.status}</th><th className="px-6 py-4 font-medium">Stock / Claimed</th><th className="px-6 py-4 font-medium text-right">{t.seller.actions}</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">{displayProducts.map(product => { const claimedCount = displayOrders.filter(o => o.product_id === product.id).length; return (<tr key={product.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">{product.images && product.images[0] && <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />}</div><span className="font-medium text-gray-800">{product.title}</span></div></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{product.status}</span></td><td className="px-6 py-4 text-gray-600"><span className="font-bold text-gray-800">{product.stock}</span> <span className="text-gray-400 mx-1">/</span><span className="text-purple-600 font-bold">{claimedCount}</span></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEditClick(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={16} /></button><button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button></div></td></tr>)})}</tbody>
                        </table>
                    )}
                    {overviewTab === 'ORDERS' && (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-sm uppercase"><tr><th className="px-6 py-4 font-medium">Order ID</th><th className="px-6 py-4 font-medium">Product</th><th className="px-6 py-4 font-medium">{t.seller.status}</th><th className="px-6 py-4 font-medium">{t.seller.shipBy}</th><th className="px-6 py-4 font-medium text-right">{t.seller.actions}</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">{displayOrders.filter(o => o.status !== 'Cancelled').map(order => { const product = displayProducts.find(p => p.id === order.product_id); const isOverdue = order.status === 'Pending' && order.shippingDeadline && new Date() > new Date(order.shippingDeadline); return (<tr key={order.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 text-gray-600">#{order.id.slice(0,8)}</td><td className="px-6 py-4 font-medium text-gray-800">{product?.title || 'Unknown Product'}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'Review_Pending' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.status}</span></td><td className="px-6 py-4 text-gray-600">{order.status === 'Pending' && order.shippingDeadline ? (<span className={isOverdue ? 'text-red-500 font-bold' : ''}>{new Date(order.shippingDeadline).toLocaleDateString()}{isOverdue && ' (Overdue!)'}</span>) : '-'}</td><td className="px-6 py-4 text-right">{order.status === 'Pending' && (<button onClick={() => handleShipOrder(order.id)} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors">{t.seller.markShipped}</button>)}{order.status === 'Completed' && (<span className="text-xs text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={14}/> Reviewed</span>)}</td></tr>)})}</tbody>
                        </table>
                    )}
                </div>
            </>
        )}

        {/* VIEW: PRODUCTS LIST (Standalone) */}
        {currentView === 'PRODUCTS' && (
            <>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">{t.seller.products}</h1>
                    <button onClick={() => { resetForm(); setCurrentView('CREATE_PRODUCT'); }} className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"><Plus size={18} />{t.seller.createProduct}</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoadingProducts ? (<div className="p-8 text-center text-gray-500">Loading products...</div>) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase"><tr><th className="px-6 py-4 font-medium">{t.seller.recentProducts}</th><th className="px-6 py-4 font-medium">{t.seller.status}</th><th className="px-6 py-4 font-medium">Stock / Claimed</th><th className="px-6 py-4 font-medium text-right">{t.seller.actions}</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">{displayProducts.map(product => { const claimedCount = displayOrders.filter(o => o.product_id === product.id).length; return (<tr key={product.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">{product.images && product.images[0] && <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />}</div><span className="font-medium text-gray-800">{product.title}</span></div></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{product.status}</span></td><td className="px-6 py-4 text-gray-600"><span className="font-bold text-gray-800">{product.stock}</span> <span className="text-gray-400 mx-1">/</span><span className="text-purple-600 font-bold">{claimedCount}</span></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEditClick(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={16} /></button><button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button></div></td></tr>)})}</tbody>
                    </table>)}
                </div>
            </>
        )}

        {/* VIEW: CREATE/EDIT PRODUCT */}
        {currentView === 'CREATE_PRODUCT' && (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setCurrentView('PRODUCTS')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                    <h1 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Product' : t.seller.createProduct}</h1>
                </div>

                <form onSubmit={handlePublish} className="space-y-8 pb-12">
                    {/* Media Upload (Drag & Drop + Video Support) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">{t.seller.uploadMedia} <span className="text-xs text-gray-400 font-normal">(Max 9 Files, Drag to Reorder)</span></h3>
                            <span className="text-xs font-bold text-purple-600">{mediaItems.length} / 9</span>
                        </div>
                        
                        <input type="file" multiple accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                        <div onClick={handleUploadClick} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group select-none">
                             <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                             <p className="font-medium text-gray-700">Click to add more files</p>
                        </div>
                        
                        {/* Unified Media Grid (Draggable) */}
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                             {mediaItems.map((item, idx) => (
                                <div 
                                    key={item.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`aspect-square rounded-lg overflow-hidden border relative group bg-gray-100 cursor-move transition-transform ${draggedItemIndex === idx ? 'opacity-50 scale-95 border-purple-500' : 'border-gray-200 hover:shadow-md'}`}
                                >
                                    {/* Preview */}
                                    {item.isVideo ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black/10"><PlayCircle size={32} className="text-white opacity-80"/></div>
                                    ) : (
                                        <img src={item.url} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                                    )}
                                    
                                    {/* Drag Handle Icon (Visual Cue) */}
                                    <div className="absolute top-1 left-1 p-1 bg-black/30 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <GripHorizontal size={14} />
                                    </div>

                                    {/* Delete Button */}
                                    <button type="button" onClick={() => removeMediaItem(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={12} /></button>
                                    
                                    {/* Status Label */}
                                    <div className={`absolute bottom-0 left-0 right-0 text-[10px] px-1 py-0.5 text-center text-white ${idx === 0 ? 'bg-purple-600' : (item.type === 'EXISTING' ? 'bg-black/50' : 'bg-green-500')}`}>
                                        {idx === 0 ? 'Main Image' : (item.type === 'EXISTING' ? 'Saved' : 'New')}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-sm font-bold text-gray-700">{t.seller.productTitle}</label><input type="text" required value={productTitle} onChange={(e) => setProductTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none" /></div>
                            <div className="space-y-2"><label className="text-sm font-bold text-gray-700">{t.nav.categories}</label><select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none bg-white">{CATEGORY_DATA.map(cat => (<option key={cat.id} value={cat.id}>{t.categories[cat.id]}</option>))}</select></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700">{t.seller.productDesc}</label><textarea rows={4} value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none resize-none"></textarea></div>
                    </div>

                    {/* Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                         <div className="space-y-2"><label className="text-sm font-bold text-gray-700">{t.seller.quantity}</label><input type="number" min="0" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-32 px-4 py-2.5 rounded-lg border border-gray-200 outline-none" /></div>
                        <div className="space-y-4"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Link size={16} />{t.seller.platformLinks}</label><div className="flex items-center gap-3"><span className="w-24 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded text-center">Ozon</span><input type="url" placeholder="https://ozon.ru/..." value={ozonLink} onChange={(e) => setOzonLink(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none" /></div><div className="flex items-center gap-3"><span className="w-24 text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded text-center">Wildberries</span><input type="url" placeholder="https://wildberries.ru/..." value={wbLink} onChange={(e) => setWbLink(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none" /></div></div>
                    </div>

                    {/* Review Requirements */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <label className="text-sm font-bold text-gray-700">{t.seller.reviewReq}</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors flex-1"><input type="checkbox" checked={reqPhoto} onChange={(e) => setReqPhoto(e.target.checked)} className="accent-purple-600 w-5 h-5" /><ImageIcon size={20} className="text-gray-500" /><span className="font-medium text-gray-700">{t.seller.reqPhoto}</span></label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors flex-1"><input type="checkbox" checked={reqVideo} onChange={(e) => setReqVideo(e.target.checked)} className="accent-purple-600 w-5 h-5" /><Upload size={20} className="text-gray-500" /><span className="font-medium text-gray-700">{t.seller.reqVideo}</span></label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button type="button" onClick={() => setCurrentView('PRODUCTS')} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">{t.seller.cancel}</button>
                        <button type="submit" disabled={isPublishing} className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">{isPublishing ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Check size={20} /> {editingId ? 'Update Product' : t.seller.publish}</>}</button>
                    </div>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};

export default SellerDashboard;