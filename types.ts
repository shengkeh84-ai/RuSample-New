

export enum Language {
  ZH = 'ZH',
  EN = 'EN',
  RU = 'RU'
}

export type ViewState = 'HOME' | 'CATEGORIES' | 'SEARCH' | 'AUTH' | 'BUYER_DASHBOARD' | 'SELLER_DASHBOARD';

export interface SubCategory {
  id: string;
  image: string;
  fallbackImage?: string;
}

export interface Category {
  id: string;
  subcategories: SubCategory[];
}

// New Data Types
export interface Review {
  id: string;
  orderId: string;
  buyerName: string;
  rating: number;
  content: string;
  date: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  stock: number;
  stockTaken: number;
  status: 'Active' | 'Draft' | 'Paused';
  platformLinks: {
    ozon?: string;
    wb?: string;
  };
  requirements: {
    photo: boolean;
    video: boolean;
  };
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  status: 'Pending' | 'Shipped' | 'Review_Pending' | 'Completed';
  date: string;
  shippingDeadline?: string; // Date + 5 days
  shippedAt?: string;
  deliveredAt?: string;
  reviewDeadline?: string; // DeliveredAt + 7 days
  review?: Review;
}

export interface Notification {
  id: string;
  userId: string; // 'current_buyer' or 'current_seller'
  type: 'SHIPMENT' | 'REVIEW_REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserProfile {
  fullName: string;
  displayName: string;
  gender: string;
  birthDate: string;
  bio: string;
}

export interface UserAddress {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface SellerSubscription {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
  plan: 'FREE' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
}

export interface TranslationContent {
  nav: {
    logo: string;
    searchPlaceholder: string;
    login: string;
    signup: string;
    categories: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaButton: string;
    badgeTrial: string;
    badgeUsers: string;
  };
  search: {
    resultsFor: string;
    noResults: string;
    total: string;
    results: string;
  };
  auth: {
    loginTitle: string;
    signupTitle: string;
    notMember: string;
    alreadyMember: string;
    registerLink: string;
    loginLink: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    submitLogin: string;
    submitSignup: string;
    continueGoogle: string;
    continueFacebook: string;
    continueApple: string;
    continueVK: string;
    leftHeadline: string;
    getAppButton: string;
    roleBuyer: string;
    roleSeller: string;
    // New Fields
  };
  seller: {
    dashboard: string;
    overview: string;
    products: string;
    orders: string;
    analytics: string;
    settings: string;
    createProduct: string;
    productTitle: string;
    productDesc: string;
    uploadMedia: string;
    uploadHint: string;
    quantity: string;
    platformLinks: string;
    ozonLink: string;
    wbLink: string;
    reviewReq: string;
    reqPhoto: string;
    reqVideo: string;
    publish: string;
    cancel: string;
    activeProducts: string;
    totalReviews: string;
    reviewRate: string;
    pendingOrders: string;
    customerRating: string;
    recentProducts: string;
    status: string;
    actions: string;
    viewReviews: string;
    shipBy: string;
    markShipped: string;
    profileSettings: string;
    shopName: string;
    shopNamePlaceholder: string;
    contactEmail: string;
    phoneNumber: string;
    saveChanges: string;
    security: string;
    changePassword: string;
    notifications: string;
    traffic: string;
    conversionRate: string;
    dailyViews: string;
    recentReviews: string;
    ratingDistribution: string;
    topProducts: string;
    totalViews: string;
    sampleRequests: string;
    avgRating: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    orderUpdates: string;
    reviewAlerts: string;
    marketingEmails: string;
    logout: string;
    // Membership
    membership: string;
    planStatus: string;
    daysRemaining: string;
    upgradeToPro: string;
    trialExpired: string;
    paymentRequired: string;
    monthlyPlan: string;
    yearlyPlan: string;
    selectPayment: string;
    payNow: string;
    bestValue: string;
    billingCycle: string;
    paymentMethods: {
      alipay: string;
      wechat: string;
      card: string;
    };
  };
  buyer: {
    dashboard: string;
    browse: string;
    mySamples: string;
    inbox: string;
    settings: string;
    requestSample: string;
    confirmReceipt: string;
    writeReview: string;
    reviewBy: string;
    daysLeft: string;
    overdue: string;
    reviewed: string;
    outOfStock: string;
    waitingShipment: string;
    welcomeBack: string;
    availableSamples: string;
    // Settings Sections
    profile: string;
    shippingAddress: string;
    security: string;
    notifications: string;
    // Profile Fields
    fullName: string;
    displayName: string;
    gender: string;
    birthDate: string;
    bio: string;
    // Address Fields
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    saveChanges: string;
    logout: string;
  };
  categories: {
    [key: string]: string;
  };
}