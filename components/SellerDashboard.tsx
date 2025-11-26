import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { CATEGORY_DATA } from '../constants';
import { Order, Review } from '../types';
import { 
  LayoutDashboard, Package, BarChart3, Settings, Plus, Upload, Link, Check, X, 
  Image as ImageIcon, Trash2, Edit2, Shield, Bell, User, Save, Truck, Star, Eye,
  ArrowUpRight, ArrowDownRight, TrendingUp, LogOut, CreditCard, Award,
  CheckCircle, Calendar
} from 'lucide-react';

// Custom Brand Icons - Official Paths
const AlipayIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 1024 1024" 
    width={size} 
    height={size} 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M928 224H608V128h-96v96H192v96h320v32c0 108.8-39.4 207-106.8 281.6-46.8-51.4-81.8-109.8-102.6-173l-89.8 29.6c26.2 79.4 70.2 152.2 129.2 215.2-64.8 53.4-143.4 87.2-229.4 97.4l11.6 90.8c105.6-12.4 202.4-53.8 282.8-119.8 69.4 56.6 153.2 90.2 244.2 92.6l4.2-90.8c-73.4-2-141.2-29-197.4-74.6 59.6-67.4 96-155.4 96-250h264v-96H512v-32h416v-96z" />
  </svg>
);

const WeChatIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 1024 1024" 
    width={size} 
    height={size} 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd" 
      d="M512 64C264.6 64 64 242.2 64 461.9c0 119.5 59.2 227.3 154.9 301.6l-37.1 133.4 163.7-88.8c51.9 14.5 107.4 22.4 165.2 22.4 247.4 0 448-178.2 448-397.9S759.4 64 512 64z m258.8 322.6L462.1 695.3c-12.5 12.5-32.8 12.5-45.3 0L253.2 531.7c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l141 141 286-286c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"
    />
  </svg>
);

type SellerView = 'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'CREATE_PRODUCT' | 'ANALYTICS' | 'SETTINGS' | 'MEMBERSHIP';

interface SellerDashboardProps {
  onLogout: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { products, addProduct, deleteProduct, orders, markAsShipped, sellerSubscription, upgradeSubscription } = useData();
  const [currentView, setCurrentView] = useState<SellerView>('OVERVIEW');
  const [selectedProductReviews, setSelectedProductReviews] = useState<{title: string, reviews: Review[]} | null>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [paymentMethod, setPaymentMethod] = useState<'ALIPAY' | 'WECHAT' | 'CARD'>('ALIPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Create Product Form State
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState(CATEGORY_DATA[0].id);
  const [productDesc, setProductDesc] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [ozonLink, setOzonLink] = useState('');
  const [wbLink, setWbLink] = useState('');
  const [reqPhoto, setReqPhoto] = useState(true);
  const [reqVideo, setReqVideo] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  // Settings Form State
  const [shopName, setShopName] = useState('My Awesome Shop');
  const [shopEmail, setShopEmail] = useState('seller@example.com');
  const [shopPhone, setShopPhone] = useState('+7 900 000 00 00');
  
  // Security Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Settings
  const [notifOrderUpdates, setNotifOrderUpdates] = useState(true);
  const [notifReviewAlerts, setNotifReviewAlerts] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Stats Calculation
  const completedReviews = orders.filter(o => o.status === 'Completed').length;
  const totalSamplesClaimed = orders.length;
  const reviewRate = totalSamplesClaimed > 0 ? Math.round((completedReviews / totalSamplesClaimed) * 100) : 0;
  
  // Subscription Status Helper
  const daysRemaining = Math.ceil((new Date(sellerSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;

  // Get recent reviews for Overview Feed
  const recentReviewsList = orders
    .filter(o => o.status === 'Completed' && o.review)
    .map(o => ({
        ...o.review!,
        productTitle: products.find(p => p.id === o.productId)?.title || 'Unknown Product',
        productImage: products.find(p => p.id === o.productId)?.images[0] || ''
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls = mediaFiles.length > 0 
        ? mediaFiles.map(file => URL.createObjectURL(file)) 
        : ['https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300'];

    const success = addProduct({
        title: productTitle,
        description: productDesc,
        category: productCategory,
        images: imageUrls,
        stock: quantity,
        platformLinks: {
            ozon: ozonLink,
            wb: wbLink
        },
        requirements: {
            photo: reqPhoto,
            video: reqVideo
        }
    });

    if (!success) {
        // Show Upgrade Modal if Failed due to subscription
        setShowPaymentModal(true);
        return;
    }

    setProductTitle('');
    setProductDesc('');
    setQuantity(10);
    setOzonLink('');
    setWbLink('');
    setMediaFiles([]);
    
    alert('Product Published Successfully!');
    setCurrentView('PRODUCTS');
  };

  const handleSaveSettings = () => {
      // Mock Save
      alert('Settings saved successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
  };

  const handleViewReviews = (productId: string, productTitle: string) => {
    const relevantOrders = orders.filter(o => o.productId === productId && o.status === 'Completed' && o.review);
    const reviews = relevantOrders.map(o => o.review!).filter(Boolean);
    setSelectedProductReviews({ title: productTitle, reviews });
  };

  const handleProcessPayment = () => {
      setIsProcessingPayment(true);
      setTimeout(() => {
          upgradeSubscription(selectedPlan);
          setIsProcessingPayment(false);
          setShowPaymentModal(false);
          alert('Payment Successful! Your subscription has been upgraded.');
      }, 2000);
  };

  const SidebarItem = ({ view, icon: Icon, label, badge }: { view: SellerView; icon: any; label: string, badge?: React.ReactNode }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
        currentView === view 
          ? 'bg-purple-50 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {badge}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Payment Modal */}
      {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <Award className="text-purple-600" />
                          {t.seller.upgradeToPro}
                      </h3>
                      <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <X size={20} className="text-gray-500" />
                      </button>
                  </div>
                  
                  <div className="p-8 flex-1 overflow-y-auto">
                      {isExpired && (
                          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
                              <Shield size={20} />
                              <span className="font-bold">{t.seller.trialExpired}</span>
                              <span className="text-sm">{t.seller.paymentRequired}</span>
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          {/* Monthly Plan */}
                          <div 
                              onClick={() => setSelectedPlan('MONTHLY')}
                              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                                  selectedPlan === 'MONTHLY' 
                                  ? 'border-purple-600 bg-purple-50' 
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                          >
                              <h4 className="font-bold text-gray-700 text-lg mb-2">{t.seller.monthlyPlan}</h4>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-gray-900">$49.99</span>
                                  <span className="text-gray-500">/mo</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 absolute top-6 right-6 flex items-center justify-center ${selectedPlan === 'MONTHLY' ? 'border-purple-600' : 'border-gray-300'}`}>
                                  {selectedPlan === 'MONTHLY' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                              </div>
                          </div>

                          {/* Yearly Plan */}
                          <div 
                              onClick={() => setSelectedPlan('YEARLY')}
                              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                                  selectedPlan === 'YEARLY' 
                                  ? 'border-purple-600 bg-purple-50' 
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                          >
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                  {t.seller.bestValue}
                              </div>
                              <h4 className="font-bold text-gray-700 text-lg mb-2">{t.seller.yearlyPlan}</h4>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-gray-900">$389.00</span>
                                  <span className="text-gray-500">/yr</span>
                              </div>
                              <div className="text-xs text-green-600 font-bold mt-1">Save ~35%</div>
                              <div className={`w-5 h-5 rounded-full border-2 absolute top-6 right-6 flex items-center justify-center ${selectedPlan === 'YEARLY' ? 'border-purple-600' : 'border-gray-300'}`}>
                                  {selectedPlan === 'YEARLY' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                              </div>
                          </div>
                      </div>

                      <h4 className="font-bold text-gray-800 mb-4">{t.seller.selectPayment}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <button 
                              onClick={() => setPaymentMethod('ALIPAY')}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'ALIPAY' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                              <div className="w-12 h-12 bg-[#1677FF] rounded-xl flex items-center justify-center shadow-sm">
                                  <AlipayIcon className="text-white" size={32} />
                              </div>
                              <span className="font-bold text-sm text-gray-700">{t.seller.paymentMethods.alipay}</span>
                          </button>
                          <button 
                              onClick={() => setPaymentMethod('WECHAT')}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'WECHAT' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                              <div className="w-12 h-12 bg-[#09B13C] rounded-xl flex items-center justify-center shadow-sm">
                                  <WeChatIcon className="text-white" size={36} />
                              </div>
                              <span className="font-bold text-sm text-gray-700">{t.seller.paymentMethods.wechat}</span>
                          </button>
                          <button 
                              onClick={() => setPaymentMethod('CARD')}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm text-white">
                                  <CreditCard size={28} />
                              </div>
                              <span className="font-bold text-sm text-gray-700">{t.seller.paymentMethods.card}</span>
                          </button>
                      </div>

                      <button 
                          onClick={handleProcessPayment}
                          disabled={isProcessingPayment}
                          className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isProcessingPayment ? (
                              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          ) : (
                              <>
                                  {t.seller.payNow} - {selectedPlan === 'MONTHLY' ? '$49.99' : '$389.00'}
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Review Modal */}
      {selectedProductReviews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">Reviews for: {selectedProductReviews.title}</h3>
                      <button onClick={() => setSelectedProductReviews(null)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {selectedProductReviews.reviews.length > 0 ? (
                          selectedProductReviews.reviews.map(review => (
                              <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="font-bold text-gray-800">{review.buyerName}</div>
                                      <div className="flex text-yellow-500">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                          ))}
                                      </div>
                                  </div>
                                  <p className="text-gray-600 text-sm">{review.content}</p>
                                  <div className="text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString()}</div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-400 py-8">No reviews yet.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
         <div className="p-6 border-b border-gray-100 flex items-center justify-between md:block">
            <h2 className="font-bold text-xl text-purple-700">{t.seller.dashboard}</h2>
         </div>
         <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:block whitespace-nowrap md:whitespace-normal">
            <SidebarItem view="OVERVIEW" icon={LayoutDashboard} label={t.seller.overview} />
            <SidebarItem view="PRODUCTS" icon={Package} label={t.seller.products} />
            <SidebarItem view="ORDERS" icon={Truck} label={t.seller.orders} />
            <SidebarItem view="ANALYTICS" icon={BarChart3} label={t.seller.analytics} />
            <div className="my-4 border-t border-gray-100"></div>
            <SidebarItem 
                view="MEMBERSHIP" 
                icon={Award} 
                label={t.seller.membership} 
                badge={
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {isExpired ? 'EXP' : 'PRO'}
                    </span>
                } 
            />
            <SidebarItem view="SETTINGS" icon={Settings} label={t.seller.settings} />
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        
        {/* VIEW: OVERVIEW */}
        {currentView === 'OVERVIEW' && (
            <>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{t.seller.overview}</h1>
                    <button 
                        onClick={() => setCurrentView('CREATE_PRODUCT')}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                    >
                        <Plus size={18} />
                        {t.seller.createProduct}
                    </button>
                </div>
                
                {/* Status Alert */}
                {isExpired && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="text-red-500" />
                            <div>
                                <h4 className="font-bold text-red-700">{t.seller.trialExpired}</h4>
                                <p className="text-sm text-red-600">{t.seller.paymentRequired}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 text-sm"
                        >
                            {t.seller.upgradeToPro}
                        </button>
                    </div>
                )}
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium mb-2">{t.seller.totalReviews}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{completedReviews}</h3>
                        <div className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">
                             +12 this week
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium mb-2">{t.seller.activeProducts}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{products.filter(p => p.status === 'Active').length}</h3>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium mb-2">{t.seller.pendingOrders}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'Pending').length}</h3>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-500 text-sm font-medium mb-2">{t.seller.reviewRate}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{reviewRate}%</h3>
                        <div className="mt-2 text-xs font-bold text-green-500">
                             Excellent
                        </div>
                    </div>
                </div>

                {/* Recent Reviews Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">{t.seller.recentReviews}</h3>
                        <button onClick={() => setCurrentView('ORDERS')} className="text-sm text-purple-600 font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentReviewsList.length > 0 ? (
                            recentReviewsList.map(review => (
                                <div key={review.id} className="p-6 flex gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img src={review.productImage} alt={review.productTitle} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                             <div>
                                                 <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{review.productTitle}</h4>
                                                 <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-medium text-gray-500">{review.buyerName}</span>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                 </div>
                                             </div>
                                             <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400">
                                No reviews yet.
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

        {/* VIEW: MEMBERSHIP */}
        {currentView === 'MEMBERSHIP' && (
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.seller.membership}</h1>

                {/* Status Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                 sellerSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                 sellerSubscription.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' :
                                 'bg-red-100 text-red-700'
                             }`}>
                                 {sellerSubscription.status}
                             </span>
                             <span className="text-sm text-gray-500 font-medium">
                                 {sellerSubscription.plan === 'MONTHLY' ? t.seller.monthlyPlan : 
                                  sellerSubscription.plan === 'YEARLY' ? t.seller.yearlyPlan : 'Free Trial'}
                             </span>
                         </div>
                         <h2 className="text-3xl font-bold text-gray-900 mb-6">
                             {isExpired ? t.seller.trialExpired : 
                              `${daysRemaining} ${t.seller.daysRemaining}`}
                         </h2>
                         
                         <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
                             <div className="flex items-center gap-1">
                                 <Calendar size={16} className="text-purple-600" />
                                 <span>Start: {new Date(sellerSubscription.startDate).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                 <Calendar size={16} className="text-purple-600" />
                                 <span>End: {new Date(sellerSubscription.endDate).toLocaleDateString()}</span>
                             </div>
                         </div>

                         <button 
                             onClick={() => setShowPaymentModal(true)}
                             className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700 transition-colors"
                         >
                             {isExpired ? t.seller.upgradeToPro : 'Extend Subscription'}
                         </button>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                            <path fill="#7C3AED" d="M45.7,-70.5C58.9,-62.5,69.3,-51.2,75.9,-38.6C82.5,-26,85.4,-12.1,82.8,0.7C80.2,13.5,72.2,25.2,63.6,35.6C55,46,45.8,55.1,34.8,62.8C23.8,70.5,10.9,76.8,-1.2,78.9C-13.3,81,-25.6,78.9,-36.8,71.8C-48,64.7,-58.1,52.6,-65.4,39.5C-72.7,26.4,-77.2,12.3,-75.8,-1.2C-74.4,-14.7,-67.1,-27.6,-57.4,-38.3C-47.7,-49,-35.6,-57.5,-23.4,-66.1C-11.2,-74.7,1.1,-83.4,12.8,-82.3C24.5,-81.2,35.6,-70.3,45.7,-70.5Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: ORDERS */}
        {currentView === 'ORDERS' && (
             <>
                <h1 className="text-2xl font-bold text-gray-800 mb-8">{t.seller.orders}</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">{t.seller.status}</th>
                                <th className="px-6 py-4 font-medium">{t.seller.shipBy}</th>
                                <th className="px-6 py-4 font-medium text-right">{t.seller.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.filter(o => o.status !== 'Cancelled').map(order => {
                                const product = products.find(p => p.id === order.productId);
                                const isOverdue = order.status === 'Pending' && order.shippingDeadline && new Date() > new Date(order.shippingDeadline);

                                return (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">#{order.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{product?.title || 'Unknown Product'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                              order.status === 'Review_Pending' ? 'bg-purple-100 text-purple-700' :
                                              'bg-green-100 text-green-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {order.status === 'Pending' && order.shippingDeadline ? (
                                            <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                                                {new Date(order.shippingDeadline).toLocaleDateString()}
                                                {isOverdue && ' (Overdue!)'}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.status === 'Pending' && (
                                            <button 
                                                onClick={() => markAsShipped(order.id)}
                                                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                {t.seller.markShipped}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-400">No orders found.</div>
                    )}
                </div>
             </>
        )}

        {/* VIEW: PRODUCTS LIST */}
        {currentView === 'PRODUCTS' && (
            <>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">{t.seller.products}</h1>
                    <button 
                        onClick={() => setCurrentView('CREATE_PRODUCT')}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                    >
                        <Plus size={18} />
                        {t.seller.createProduct}
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">{t.seller.recentProducts}</th>
                                <th className="px-6 py-4 font-medium">{t.seller.status}</th>
                                <th className="px-6 py-4 font-medium">Samples</th>
                                <th className="px-6 py-4 font-medium text-right">{t.seller.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-medium text-gray-800">{product.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {product.stockTaken} / {product.stock}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewReviews(product.id, product.title)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors"
                                            >
                                                <Eye size={14} />
                                                {t.seller.viewReviews}
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {/* VIEW: CREATE PRODUCT */}
        {currentView === 'CREATE_PRODUCT' && (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setCurrentView('PRODUCTS')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{t.seller.createProduct}</h1>
                </div>

                <form onSubmit={handlePublish} className="space-y-8 pb-12">
                    {/* Media Upload */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">{t.seller.uploadMedia}</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                             <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                             </div>
                             <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                             <p className="text-sm text-gray-400 mt-1">{t.seller.uploadHint}</p>
                        </div>
                        {mediaFiles.length > 0 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                {mediaFiles.map((file, idx) => (
                                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">{t.seller.productTitle}</label>
                                <input 
                                    type="text" 
                                    required
                                    value={productTitle}
                                    onChange={(e) => setProductTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">{t.nav.categories}</label>
                                <select 
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none bg-white"
                                >
                                    {CATEGORY_DATA.map(cat => (
                                        <option key={cat.id} value={cat.id}>{t.categories[cat.id]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.productDesc}</label>
                            <textarea 
                                rows={4}
                                value={productDesc}
                                onChange={(e) => setProductDesc(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.quantity}</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-32 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                                <span className="text-sm text-gray-500">units to give away</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Link size={16} />
                                {t.seller.platformLinks}
                            </label>
                            
                            <div className="flex items-center gap-3">
                                <span className="w-24 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded text-center">Ozon</span>
                                <input 
                                    type="url" 
                                    placeholder="https://ozon.ru/..."
                                    value={ozonLink}
                                    onChange={(e) => setOzonLink(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-24 text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded text-center">Wildberries</span>
                                <input 
                                    type="url" 
                                    placeholder="https://wildberries.ru/..."
                                    value={wbLink}
                                    onChange={(e) => setWbLink(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                     {/* Review Requirements */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <label className="text-sm font-bold text-gray-700">{t.seller.reviewReq}</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors flex-1">
                                <input type="checkbox" checked={reqPhoto} onChange={(e) => setReqPhoto(e.target.checked)} className="accent-purple-600 w-5 h-5" />
                                <ImageIcon size={20} className="text-gray-500" />
                                <span className="font-medium text-gray-700">{t.seller.reqPhoto}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors flex-1">
                                <input type="checkbox" checked={reqVideo} onChange={(e) => setReqVideo(e.target.checked)} className="accent-purple-600 w-5 h-5" />
                                <Upload size={20} className="text-gray-500" />
                                <span className="font-medium text-gray-700">{t.seller.reqVideo}</span>
                            </label>
                        </div>
                     </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setCurrentView('PRODUCTS')}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {t.seller.cancel}
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            {t.seller.publish}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* VIEW: ANALYTICS */}
        {currentView === 'ANALYTICS' && (() => {
            // Analytics Data Preparation
            const totalViews = 1542; // Mock Data
            const conversion = totalSamplesClaimed > 0 ? ((totalSamplesClaimed / totalViews) * 100).toFixed(1) : '0.0';
            
            // Calculate Avg Rating
            const reviews = orders.filter(o => o.review).map(o => o.review!);
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '0.0';

            // Rating Distribution
            const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(r => { if(r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++ });

            // Top Products
            const topProducts = products.map(p => {
                const productOrders = orders.filter(o => o.productId === p.id);
                const productReviews = productOrders.filter(o => o.review).map(o => o.review!);
                const pRatingSum = productReviews.reduce((sum, r) => sum + r.rating, 0);
                const pAvgRating = productReviews.length > 0 ? (pRatingSum / productReviews.length).toFixed(1) : '0.0';
                return {
                    ...p,
                    requests: productOrders.length,
                    reviewsCount: productReviews.length,
                    avgRating: pAvgRating
                };
            }).sort((a, b) => b.requests - a.requests).slice(0, 5);

            // Mock Views Data for Chart
            const last7DaysData = [...Array(7)].map((_, i) => ({
                day: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(undefined, {weekday: 'short'}),
                views: Math.floor(Math.random() * 50) + 10
            }));
            const maxView = Math.max(...last7DaysData.map(d => d.views));

            return (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">{t.seller.analytics}</h1>
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                             Last 7 Days
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye size={20} /></div>
                                 <span className="text-xs font-bold text-green-500 flex items-center">+12% <ArrowUpRight size={14} /></span>
                             </div>
                             <p className="text-sm text-gray-500 font-medium">{t.seller.totalViews}</p>
                             <h3 className="text-2xl font-bold text-gray-900">{totalViews}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={20} /></div>
                                 <span className="text-xs font-bold text-green-500 flex items-center">+5% <ArrowUpRight size={14} /></span>
                             </div>
                             <p className="text-sm text-gray-500 font-medium">{t.seller.sampleRequests}</p>
                             <h3 className="text-2xl font-bold text-gray-900">{totalSamplesClaimed}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
                                 <span className="text-xs font-bold text-red-500 flex items-center">-2% <ArrowDownRight size={14} /></span>
                             </div>
                             <p className="text-sm text-gray-500 font-medium">{t.seller.conversionRate}</p>
                             <h3 className="text-2xl font-bold text-gray-900">{conversion}%</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={20} /></div>
                                 <span className="text-xs font-bold text-gray-400">Stable</span>
                             </div>
                             <p className="text-sm text-gray-500 font-medium">{t.seller.avgRating}</p>
                             <h3 className="text-2xl font-bold text-gray-900">{avgRating}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Traffic Chart (Custom CSS Bar Chart) */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6">{t.seller.traffic}</h3>
                            <div className="h-64 flex items-end justify-between gap-2">
                                {last7DaysData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div 
                                            className="w-full bg-purple-100 rounded-t-md hover:bg-purple-200 transition-all relative group-hover:shadow-md"
                                            style={{ height: `${(d.views / maxView) * 100}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {d.views}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6">{t.seller.ratingDistribution}</h3>
                            <div className="space-y-4">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = ratingCounts[star as keyof typeof ratingCounts];
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-sm font-bold w-3 flex items-center">{star}</span>
                                            <Star size={12} className="text-yellow-400 fill-yellow-400 -ml-2 mr-1" />
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <div className="text-4xl font-bold text-gray-900">{avgRating}</div>
                                <div className="flex justify-center text-yellow-400 my-2">
                                     {[...Array(5)].map((_, i) => (
                                         <Star key={i} size={16} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                                     ))}
                                </div>
                                <div className="text-sm text-gray-500">Based on {reviews.length} reviews</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                             <h3 className="font-bold text-lg text-gray-800">{t.seller.topProducts}</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Requests</th>
                                    <th className="px-6 py-4">Reviews</th>
                                    <th className="px-6 py-4">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden">
                                                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-medium text-sm text-gray-800 line-clamp-1">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{p.requests}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.reviewsCount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                {p.avgRating}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        })()}

        {currentView === 'SETTINGS' && (
             <div className="max-w-4xl mx-auto space-y-6">
                 <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.seller.settings}</h1>
                 
                 {/* Profile Settings */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                             <User size={20} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-800">{t.seller.profileSettings}</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.shopName}</label>
                            <input 
                                type="text" 
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.phoneNumber}</label>
                            <input 
                                type="tel" 
                                value={shopPhone}
                                onChange={(e) => setShopPhone(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.contactEmail}</label>
                            <input 
                                type="email" 
                                value={shopEmail}
                                onChange={(e) => setShopEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                            />
                        </div>
                     </div>
                 </div>

                 {/* Security Settings */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <Shield size={20} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-800">{t.seller.security}</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t.seller.currentPassword}</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">{t.seller.newPassword}</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">{t.seller.confirmPassword}</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                            </div>
                        </div>
                     </div>
                 </div>

                 {/* Notification Settings */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                             <Bell size={20} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-800">{t.seller.notifications}</h3>
                     </div>
                     <div className="space-y-4 divide-y divide-gray-50">
                        <div className="flex items-center justify-between py-2">
                            <span className="font-medium text-gray-700">{t.seller.orderUpdates}</span>
                            <button 
                                onClick={() => setNotifOrderUpdates(!notifOrderUpdates)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifOrderUpdates ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifOrderUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2 pt-4">
                            <span className="font-medium text-gray-700">{t.seller.reviewAlerts}</span>
                            <button 
                                onClick={() => setNotifReviewAlerts(!notifReviewAlerts)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifReviewAlerts ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifReviewAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2 pt-4">
                            <span className="font-medium text-gray-700">{t.seller.marketingEmails}</span>
                            <button 
                                onClick={() => setNotifMarketing(!notifMarketing)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifMarketing ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifMarketing ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                     </div>
                 </div>

                 {/* Save Button */}
                 <div className="flex justify-end pt-4 pb-8 border-b border-gray-100 mb-8">
                     <button 
                        onClick={handleSaveSettings}
                        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                     >
                         <Save size={20} />
                         {t.seller.saveChanges}
                     </button>
                 </div>

                 {/* Logout Section */}
                 <div className="flex justify-start pb-8">
                    <button 
                        onClick={onLogout}
                        className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <LogOut size={20} />
                        {t.seller.logout}
                    </button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;