

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, Review, Notification, UserProfile, UserAddress, SellerSubscription } from '../types';

interface DataContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'status' | 'stockTaken' | 'createdAt'>) => boolean;
  deleteProduct: (id: string) => void;
  orders: Order[];
  placeOrder: (productId: string, buyerId: string) => boolean;
  markAsShipped: (orderId: string) => void;
  confirmDelivery: (orderId: string) => void;
  submitReview: (orderId: string, reviewData: { content: string, rating: number }) => void;
  isSeller: boolean;
  setIsSeller: (isSeller: boolean) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  // Buyer Profile Data
  buyerProfile: UserProfile;
  updateBuyerProfile: (profile: UserProfile) => void;
  buyerAddress: UserAddress;
  updateBuyerAddress: (address: UserAddress) => void;
  // Seller Subscription
  sellerSubscription: SellerSubscription;
  upgradeSubscription: (plan: 'MONTHLY' | 'YEARLY') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to add days to a date string
const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Initial Mock Data
const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    sellerId: 'demo_seller', 
    title: 'Aloe Vera Soothing Gel', 
    description: 'Natural soothing gel for all skin types.',
    category: 'beauty',
    images: ['https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=300'],
    stock: 50,
    stockTaken: 42,
    status: 'Active',
    platformLinks: { ozon: 'https://ozon.ru/demo' },
    requirements: { photo: true, video: false },
    createdAt: new Date().toISOString()
  },
  { 
    id: '2', 
    sellerId: 'demo_seller', 
    title: 'Wireless Earbuds Pro', 
    description: 'High fidelity audio with noise cancellation.',
    category: 'electronics',
    images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300'],
    stock: 20,
    stockTaken: 5,
    status: 'Active',
    platformLinks: { wb: 'https://wildberries.ru/demo' },
    requirements: { photo: true, video: true },
    createdAt: new Date().toISOString()
  }
];

// Seed some orders with reviews for demonstration
const MOCK_ORDERS: Order[] = [
  {
    id: '101',
    productId: '1',
    buyerId: 'demo_buyer',
    status: 'Completed',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    shippedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    review: {
      id: 'r1',
      orderId: '101',
      buyerName: 'Alice',
      rating: 5,
      content: 'Amazing product! Really loved the texture.',
      date: new Date(Date.now() - 7 * 86400000).toISOString()
    }
  },
  {
    id: '102',
    productId: '1',
    buyerId: 'demo_buyer_2',
    status: 'Completed',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    shippedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    review: {
      id: 'r2',
      orderId: '102',
      buyerName: 'Bob',
      rating: 4,
      content: 'Good quality, but shipping was a bit slow.',
      date: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        userId: 'current_buyer',
        type: 'SYSTEM',
        title: 'Welcome to RuSample',
        message: 'Thank you for joining! Complete your profile to get started.',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        read: true
    }
];

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'John Doe',
  displayName: 'Johnny',
  gender: 'Male',
  birthDate: '1990-01-01',
  bio: 'Love trying new tech gadgets from around the world!'
};

const DEFAULT_ADDRESS: UserAddress = {
  line1: 'Tverskaya St, 1',
  city: 'Moscow',
  state: 'Moscow',
  zip: '101000',
  country: 'Russia'
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [buyerProfile, setBuyerProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [buyerAddress, setBuyerAddress] = useState<UserAddress>(DEFAULT_ADDRESS);
  const [sellerSubscription, setSellerSubscription] = useState<SellerSubscription>({
    status: 'TRIAL',
    plan: 'FREE',
    startDate: new Date().toISOString(),
    endDate: addDays(new Date().toISOString(), 14)
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('rusample_products');
    const savedOrders = localStorage.getItem('rusample_orders');
    const savedNotifications = localStorage.getItem('rusample_notifications');
    const savedProfile = localStorage.getItem('rusample_profile');
    const savedAddress = localStorage.getItem('rusample_address');
    const savedSubscription = localStorage.getItem('rusample_subscription');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(MOCK_PRODUCTS);

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    else setOrders(MOCK_ORDERS);

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    else setNotifications(MOCK_NOTIFICATIONS);

    if (savedProfile) setBuyerProfile(JSON.parse(savedProfile));
    if (savedAddress) setBuyerAddress(JSON.parse(savedAddress));

    if (savedSubscription) {
        setSellerSubscription(JSON.parse(savedSubscription));
    } else {
        // Initialize 14 day trial if no sub exists
        const trialSub: SellerSubscription = {
            status: 'TRIAL',
            plan: 'FREE',
            startDate: new Date().toISOString(),
            endDate: addDays(new Date().toISOString(), 14)
        };
        setSellerSubscription(trialSub);
        localStorage.setItem('rusample_subscription', JSON.stringify(trialSub));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => { localStorage.setItem('rusample_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('rusample_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('rusample_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('rusample_profile', JSON.stringify(buyerProfile)); }, [buyerProfile]);
  useEffect(() => { localStorage.setItem('rusample_address', JSON.stringify(buyerAddress)); }, [buyerAddress]);
  useEffect(() => { localStorage.setItem('rusample_subscription', JSON.stringify(sellerSubscription)); }, [sellerSubscription]);

  const addProduct = (newProductData: Omit<Product, 'id' | 'sellerId' | 'status' | 'stockTaken' | 'createdAt'>): boolean => {
    // Check Subscription Status
    const now = new Date();
    const expiry = new Date(sellerSubscription.endDate);
    
    if (now > expiry) {
        // Subscription Expired
        return false;
    }

    const newProduct: Product = {
      ...newProductData,
      id: Date.now().toString(),
      sellerId: 'current_user',
      status: 'Active',
      stockTaken: 0,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    return true;
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const placeOrder = (productId: string, buyerId: string): boolean => {
    // RULE: Check for overdue reviews
    const hasOverdue = orders.some(o => 
      o.buyerId === buyerId && 
      o.status === 'Review_Pending' && 
      o.reviewDeadline && 
      new Date() > new Date(o.reviewDeadline)
    );

    if (hasOverdue) {
      return false; // Block order
    }

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: Date.now().toString(),
      productId,
      buyerId,
      status: 'Pending',
      date: now,
      shippingDeadline: addDays(now, 5) // 5 Days Shipping Limit
    };
    setOrders(prev => [newOrder, ...prev]);
    
    // Update stock taken
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stockTaken: p.stockTaken + 1 };
      }
      return p;
    }));

    return true; // Success
  };

  const markAsShipped = (orderId: string) => {
    // 1. Find Order
    const order = orders.find(o => o.id === orderId);
    
    // 2. Update Order Status
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Shipped', shippedAt: new Date().toISOString() };
      }
      return o;
    }));

    // 3. Trigger Notification for Buyer
    if (order) {
        const product = products.find(p => p.id === order.productId);
        const newNotif: Notification = {
            id: Date.now().toString(),
            userId: order.buyerId,
            type: 'SHIPMENT',
            title: 'Order Shipped!',
            message: `Your sample request for ${product?.title || 'item'} has been shipped.`,
            date: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const confirmDelivery = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: 'Review_Pending', 
          deliveredAt: now,
          reviewDeadline: addDays(now, 7) // 7 Days Review Limit
        };
      }
      return o;
    }));

    // Notify buyer
    const order = orders.find(o => o.id === orderId);
    if (order) {
         const newNotif: Notification = {
            id: Date.now().toString(),
            userId: order.buyerId,
            type: 'REVIEW_REMINDER',
            title: 'Delivery Confirmed',
            message: 'You have 7 days to complete your review. Overdue reviews will block new sample requests.',
            date: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const submitReview = (orderId: string, reviewData: { content: string, rating: number }) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: 'Completed', 
          review: {
            id: Date.now().toString(),
            orderId,
            buyerName: o.buyerId === 'current_buyer' ? 'Me' : 'Shopper',
            rating: reviewData.rating,
            content: reviewData.content,
            date: new Date().toISOString()
          }
        };
      }
      return o;
    }));
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateBuyerProfile = (profile: UserProfile) => setBuyerProfile(profile);
  const updateBuyerAddress = (address: UserAddress) => setBuyerAddress(address);

  const upgradeSubscription = (plan: 'MONTHLY' | 'YEARLY') => {
      const now = new Date();
      // If active, add time? Simple version: Reset start date to now, end date to future
      // Monthly: +30 days, Yearly: +365 days
      const daysToAdd = plan === 'MONTHLY' ? 30 : 365;
      
      const newSub: SellerSubscription = {
          status: 'ACTIVE',
          plan: plan,
          startDate: now.toISOString(),
          endDate: addDays(now.toISOString(), daysToAdd)
      };
      setSellerSubscription(newSub);
  };

  const value = {
    products,
    addProduct,
    deleteProduct,
    orders,
    placeOrder,
    markAsShipped,
    confirmDelivery,
    submitReview,
    isSeller,
    setIsSeller,
    notifications,
    markNotificationRead,
    buyerProfile,
    updateBuyerProfile,
    buyerAddress,
    updateBuyerAddress,
    sellerSubscription,
    upgradeSubscription
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
