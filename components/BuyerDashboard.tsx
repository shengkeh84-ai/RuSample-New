import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { CATEGORY_DATA } from '../constants';
import { 
    Search, MapPin, Package, Heart, Star, Clock, CheckCircle, 
    Bell, Settings, User, ShoppingBag, Mail, Shield, LogOut, Save,
    LayoutGrid, ChevronRight
} from 'lucide-react';

type BuyerView = 'BROWSE' | 'CATEGORIES' | 'MY_SAMPLES' | 'INBOX' | 'SETTINGS';

interface BuyerDashboardProps {
  onLogout: () => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { 
      products, placeOrder, orders, confirmDelivery, submitReview, 
      notifications, markNotificationRead, buyerProfile, updateBuyerProfile,
      buyerAddress, updateBuyerAddress 
  } = useData();
  const [activeView, setActiveView] = useState<BuyerView>('BROWSE');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories View State
  const [viewCategoryId, setViewCategoryId] = useState(CATEGORY_DATA[0].id);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Review Modal State
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  // Local state for forms (initialized from Context)
  const [localProfile, setLocalProfile] = useState(buyerProfile);
  const [localAddress, setLocalAddress] = useState(buyerAddress);
  
  const [notify, setNotify] = useState({
      orders: true,
      marketing: false
  });

  const handleRequestSample = (productId: string) => {
    const success = placeOrder(productId, 'current_buyer');
    if (success) {
        alert('Sample Requested Successfully!');
        setActiveView('MY_SAMPLES');
    } else {
        alert('Action Blocked: You have overdue reviews. Please complete them before requesting new samples.');
    }
  };

  const handleReviewSubmit = () => {
    if (reviewOrderId && reviewContent) {
        submitReview(reviewOrderId, { rating: reviewRating, content: reviewContent });
        setReviewOrderId(null);
        setReviewContent('');
        setReviewRating(5);
        alert('Review Submitted! Thank you.');
    }
  };

  const handleSaveChanges = () => {
      updateBuyerProfile(localProfile);
      updateBuyerAddress(localAddress);
      alert('Settings saved successfully!');
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleSubcategoryClick = (subId: string, parentId: string) => {
      setSelectedCategory(parentId);
      setSearchTerm(t.categories[subId]); 
      setActiveView('BROWSE');
  };

  const activeProducts = products.filter(p => 
      p.status === 'Active' && 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const myOrders = orders.filter(o => o.buyerId === 'current_buyer' || o.buyerId === 'demo_buyer' || o.buyerId === 'demo_buyer_2');
  
  // Filter notifications for current user
  const myNotifications = notifications.filter(n => n.userId === 'current_buyer').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const SidebarItem = ({ view, icon: Icon, label, badge }: { view: BuyerView; icon: any; label: string, badge?: number }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
        activeView === view 
          ? 'bg-purple-50 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="relative">
        <Icon size={20} />
        {badge ? (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                 {badge}
             </span>
        ) : null}
      </div>
      {label}
    </button>
  );

  const viewCategory = CATEGORY_DATA.find(c => c.id === viewCategoryId);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      
      {/* Review Modal */}
      {reviewOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{t.buyer.writeReview}</h3>
                  <div className="flex justify-center mb-6 gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                              <Star size={32} fill={star <= reviewRating ? "#EAB308" : "none"} className={star <= reviewRating ? "text-yellow-500" : "text-gray-300"} />
                          </button>
                      ))}
                  </div>
                  <textarea 
                      className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none h-32"
                      placeholder="Write your review here..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                  ></textarea>
                  <div className="flex gap-3">
                      <button onClick={() => setReviewOrderId(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                      <button onClick={handleReviewSubmit} className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">Submit</button>
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
            <SidebarItem view="MY_SAMPLES" icon={Package} label={t.buyer.mySamples} />
            <SidebarItem view="INBOX" icon={Mail} label={t.buyer.inbox} badge={unreadCount > 0 ? unreadCount : undefined} />
            <SidebarItem view="SETTINGS" icon={Settings} label={t.buyer.settings} />
         </nav>
         <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 px-4 py-2">
                 <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    {buyerProfile.displayName.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                     <div className="text-sm font-bold text-gray-900 truncate">{buyerProfile.displayName}</div>
                     <div className="text-xs text-gray-500 truncate">buyer@example.com</div>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col max-h-screen ${activeView === 'CATEGORIES' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'}`}>
        
        {activeView === 'BROWSE' && (
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                     <h1 className="text-2xl font-bold text-gray-800">{t.buyer.browse}</h1>
                     <div className="relative w-64 md:w-80">
                         <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t.nav.searchPlaceholder} 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm" 
                         />
                         <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                     </div>
                </div>

                {/* Categories Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm ${
                            selectedCategory === 'all' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {t.nav.categories}
                    </button>
                    {CATEGORY_DATA.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm ${
                                selectedCategory === cat.id 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {t.categories[cat.id]}
                        </button>
                    ))}
                </div>

                {/* Banner */}
                {selectedCategory === 'all' && !searchTerm && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-10 shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2">{t.buyer.welcomeBack}, {buyerProfile.displayName}!</h2>
                            <p className="opacity-90 max-w-lg">Discover exclusive free samples from top global brands. Request, receive, and review to keep your score high.</p>
                            <div className="flex gap-8 mt-6">
                                    <div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                                        <span className="block text-2xl font-bold">{myOrders.length}</span>
                                        <span className="text-xs opacity-80 uppercase tracking-wider">{t.buyer.mySamples}</span>
                                    </div>
                                    <div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                                        <span className="block text-2xl font-bold">{myOrders.filter(o => o.status === 'Review_Pending').length}</span>
                                        <span className="text-xs opacity-80 uppercase tracking-wider">To Review</span>
                                    </div>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                                <path fill="#FFFFFF" d="M45.7,-70.5C58.9,-62.5,69.3,-51.2,75.9,-38.6C82.5,-26,85.4,-12.1,82.8,0.7C80.2,13.5,72.2,25.2,63.6,35.6C55,46,45.8,55.1,34.8,62.8C23.8,70.5,10.9,76.8,-1.2,78.9C-13.3,81,-25.6,78.9,-36.8,71.8C-48,64.7,-58.1,52.6,-65.4,39.5C-72.7,26.4,-77.2,12.3,-75.8,-1.2C-74.4,-14.7,-67.1,-27.6,-57.4,-38.3C-47.7,-49,-35.6,-57.5,-23.4,-66.1C-11.2,-74.7,1.1,-83.4,12.8,-82.3C24.5,-81.2,35.6,-70.3,45.7,-70.5Z" transform="translate(100 100)" />
                            </svg>
                        </div>
                    </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Package size={20} className="text-purple-600" />
                    {selectedCategory !== 'all' ? t.categories[selectedCategory] : t.buyer.availableSamples}
                </h3>

                {/* Product Grid */}
                {activeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <button className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors">
                                    <Heart size={16} />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {product.stock - product.stockTaken} left
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-purple-600 font-bold uppercase mb-1">{t.categories[product.category] || product.category}</div>
                                <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.title}</h4>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description}</p>
                                
                                <div className="flex items-center gap-1 mb-4">
                                    {product.platformLinks.ozon && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">OZON</span>
                                    )}
                                    {product.platformLinks.wb && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100">WB</span>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => handleRequestSample(product.id)}
                                    disabled={product.stock <= product.stockTaken}
                                    className="w-full py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {product.stock <= product.stockTaken ? t.buyer.outOfStock : t.buyer.requestSample}
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t.search.noResults}</p>
                        {selectedCategory !== 'all' && (
                            <button onClick={() => setSelectedCategory('all')} className="mt-4 text-purple-600 font-bold hover:underline">
                                View All Categories
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}

        {activeView === 'CATEGORIES' && (
            <div className="flex w-full h-full bg-gray-50">
                {/* Categories View - Left Sidebar */}
                <div className="w-48 md:w-64 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <h2 className="font-bold text-gray-800">{t.nav.categories}</h2>
                    </div>
                    <div className="py-2">
                        {CATEGORY_DATA.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setViewCategoryId(cat.id)}
                                className={`w-full text-left px-6 py-3.5 flex items-center justify-between text-sm transition-colors ${
                                    viewCategoryId === cat.id
                                    ? 'bg-purple-50 text-purple-600 font-bold border-l-4 border-purple-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                }`}
                            >
                                <span>{t.categories[cat.id]}</span>
                                {viewCategoryId === cat.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories View - Right Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FAFB]">
                    <div className="max-w-6xl mx-auto">
                        {viewCategory && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-8">{t.categories[viewCategory.id]}</h2>
                                
                                {viewCategory.subcategories.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {viewCategory.subcategories.map((sub) => {
                                        const isLoaded = loadedImages[sub.id];
                                        return (
                                            <div 
                                                key={sub.id} 
                                                onClick={() => handleSubcategoryClick(sub.id, viewCategory.id)}
                                                className="flex flex-col items-center group cursor-pointer"
                                            >
                                                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#f8f9fa] border border-gray-200 relative mb-3 transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md">
                                                    {!isLoaded && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[loading_1.5s_infinite] flex items-center justify-center text-xs text-gray-400">
                                                            Loading...
                                                        </div>
                                                    )}
                                                    <img 
                                                        src={sub.image} 
                                                        alt={t.categories[sub.id]} 
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                        onLoad={() => handleImageLoad(sub.id)}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-purple-600 transition-colors">
                                                    {t.categories[sub.id]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <p>No subcategories available.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeView === 'MY_SAMPLES' && (
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.buyer.mySamples}</h1>
                
                {myOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>You haven't requested any samples yet.</p>
                        <button onClick={() => setActiveView('BROWSE')} className="mt-4 text-purple-600 font-bold hover:underline">Start Browsing</button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {myOrders.map(order => {
                            const product = products.find(p => p.id === order.productId);
                            
                            // Calculate days left for review if pending
                            let daysLeft = null;
                            let isOverdue = false;
                            
                            if (order.status === 'Review_Pending' && order.reviewDeadline) {
                                const diffTime = new Date(order.reviewDeadline).getTime() - Date.now();
                                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (daysLeft < 0) isOverdue = true;
                            }

                            return (
                                <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                        <img src={product?.images[0]} alt={product?.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="font-bold text-lg text-gray-800">{product?.title}</h4>
                                        <div className="text-sm text-gray-500 mt-1">Order #{order.id} • {new Date(order.date).toLocaleDateString()}</div>
                                        <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                                                ${order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                                order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                order.status === 'Review_Pending' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-green-50 text-green-700 border-green-100'}`}>
                                                {t.seller.status}: {order.status}
                                            </span>
                                            
                                            {/* Countdown Badge */}
                                            {order.status === 'Review_Pending' && (
                                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                    <Clock size={12} />
                                                    {isOverdue ? t.buyer.overdue : `${daysLeft} ${t.buyer.daysLeft}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-64 flex flex-col gap-2">
                                        {order.status === 'Pending' && (
                                            <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-lg border border-gray-100">
                                                <Clock size={16} />
                                                {t.buyer.waitingShipment}
                                            </div>
                                        )}
                                        {order.status === 'Shipped' && (
                                            <button 
                                                onClick={() => confirmDelivery(order.id)}
                                                className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                {t.buyer.confirmReceipt}
                                            </button>
                                        )}
                                        {order.status === 'Review_Pending' && (
                                            <>
                                                <div className="text-xs text-center text-gray-500 mb-1">
                                                    Deadline: <span className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>{new Date(order.reviewDeadline!).toLocaleDateString()}</span>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setReviewOrderId(order.id);
                                                        setReviewContent('');
                                                        setReviewRating(5);
                                                    }}
                                                    className={`w-full py-2 text-white font-bold rounded-lg transition-colors shadow-sm ${isOverdue ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                                                >
                                                    {t.buyer.writeReview}
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'Completed' && (
                                            <div className="text-center text-green-600 font-bold flex items-center justify-center gap-2 bg-green-50 py-3 rounded-lg border border-green-100">
                                                <CheckCircle size={20} />
                                                {t.buyer.reviewed}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {activeView === 'INBOX' && (
            <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-6">
                     <h1 className="text-2xl font-bold text-gray-800">{t.buyer.inbox}</h1>
                     <button className="text-sm text-purple-600 font-bold hover:underline">Mark all as read</button>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     {myNotifications.length === 0 ? (
                         <div className="p-12 text-center text-gray-400">
                             <Mail size={48} className="mx-auto mb-4 opacity-20" />
                             No notifications yet.
                         </div>
                     ) : (
                         <div className="divide-y divide-gray-100">
                             {myNotifications.map(notif => (
                                 <div 
                                    key={notif.id} 
                                    onClick={() => markNotificationRead(notif.id)}
                                    className={`p-6 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-purple-50/50' : ''}`}
                                 >
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                         notif.type === 'SHIPMENT' ? 'bg-blue-100 text-blue-600' : 
                                         notif.type === 'REVIEW_REMINDER' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                     }`}>
                                         {notif.type === 'SHIPMENT' ? <Package size={20} /> : notif.type === 'REVIEW_REMINDER' ? <Clock size={20} /> : <Bell size={20} />}
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <h4 className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                                             <span className="text-xs text-gray-400">{new Date(notif.date).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-sm text-gray-600">{notif.message}</p>
                                     </div>
                                     {!notif.read && (
                                         <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                     )}
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        )}

        {activeView === 'SETTINGS' && (
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.buyer.settings}</h1>
                
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><User size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">{t.buyer.profile}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.fullName}</label>
                            <input 
                                type="text" 
                                value={localProfile.fullName} 
                                onChange={(e) => setLocalProfile({...localProfile, fullName: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.displayName}</label>
                            <input 
                                type="text" 
                                value={localProfile.displayName} 
                                onChange={(e) => setLocalProfile({...localProfile, displayName: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.gender}</label>
                            <select 
                                value={localProfile.gender}
                                onChange={(e) => setLocalProfile({...localProfile, gender: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.birthDate}</label>
                            <input 
                                type="date" 
                                value={localProfile.birthDate} 
                                onChange={(e) => setLocalProfile({...localProfile, birthDate: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.bio}</label>
                            <textarea 
                                value={localProfile.bio}
                                onChange={(e) => setLocalProfile({...localProfile, bio: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all h-24 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">{t.buyer.shippingAddress}</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.addressLine1}</label>
                            <input 
                                type="text" 
                                value={localAddress.line1}
                                onChange={(e) => setLocalAddress({...localAddress, line1: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.city}</label>
                                <input 
                                    type="text" 
                                    value={localAddress.city}
                                    onChange={(e) => setLocalAddress({...localAddress, city: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.state}</label>
                                <input 
                                    type="text" 
                                    value={localAddress.state}
                                    onChange={(e) => setLocalAddress({...localAddress, state: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.zipCode}</label>
                                <input 
                                    type="text" 
                                    value={localAddress.zip}
                                    onChange={(e) => setLocalAddress({...localAddress, zip: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.buyer.country}</label>
                                <input 
                                    type="text" 
                                    value={localAddress.country}
                                    onChange={(e) => setLocalAddress({...localAddress, country: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Shield size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">{t.buyer.security}</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.seller.newPassword}</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.seller.confirmPassword}</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pb-12">
                    <button 
                        onClick={onLogout}
                        className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <LogOut size={20} />
                        {t.buyer.logout}
                    </button>
                    <button 
                        onClick={handleSaveChanges}
                        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <Save size={20} />
                        {t.buyer.saveChanges}
                    </button>
                </div>
            </div>
        )}

      </div>
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
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