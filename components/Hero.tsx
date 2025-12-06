import React, { useState } from 'react';
import { Search, Menu, X, ChevronRight, Globe, Check, Star, Filter, ChevronDown } from 'lucide-react';

// === 1. 多语言支持类型定义 (保持原样) ===
type LangKey = 'RU' | 'EN' | 'CN';

// === 2. 界面静态文字翻译库 (保持原样) ===
const UI_TEXT = {
  RU: {
    heroTitle: <>Ваша<br />следующая<br />любимая<br />находка —<br />прямо здесь.</>,
    heroSubtitle: "Найдите это, попробуйте, а затем расскажите всему миру.",
    ctaButton: "Начать обзор",
    searchPlaceholder: "Поиск товаров или категорий...",
    login: "Войти",
    register: "Регистрация",
    categoriesTitle: "Категории",
    noSubcategories: "Нет подкатегорий",
    filters: "Фильтры",
    allCategories: "Все категории",
    results: "результатов",
    reviews: "отзывов"
  },
  EN: {
    heroTitle: <>Your<br />next<br />favorite<br />find —<br />is right here.</>,
    heroSubtitle: "Find it, try it, and then tell the whole world.",
    ctaButton: "Start Review",
    searchPlaceholder: "Search products or categories...",
    login: "Log In",
    register: "Sign Up",
    categoriesTitle: "Categories",
    noSubcategories: "No subcategories",
    filters: "Filters",
    allCategories: "All Categories",
    results: "results",
    reviews: "reviews"
  },
  CN: {
    heroTitle: <>您的<br />下一个<br />挚爱<br />发现 —<br />就在这里。</>,
    heroSubtitle: "发现它，体验它，然后分享给全世界。",
    ctaButton: "开始测评",
    searchPlaceholder: "搜索商品或品类...",
    login: "登录",
    register: "注册",
    categoriesTitle: "全部分类",
    noSubcategories: "暂无子分类",
    filters: "按类别筛选",
    allCategories: "所有类别",
    results: "条结果",
    reviews: "条评论"
  }
};

// === 3. 终极完整分类数据 (保持原样) ===
const CATEGORIES = [
  {
    id: 'beauty',
    name: { RU: 'Красота', EN: 'Beauty', CN: '美丽' },
    subcategories: [
      { name: { RU: 'Косметические наборы', EN: 'Beauty Sets', CN: '美容套装' }, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=200&fit=crop' },
      { name: { RU: 'Инструменты', EN: 'Tools', CN: '工具' }, image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8ae?w=200&h=200&fit=crop' },
      { name: { RU: 'Уход за телом', EN: 'Body', CN: '身体护理' }, image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=200&h=200&fit=crop' },
      { name: { RU: 'Для глаз', EN: 'Eyes', CN: '眼部' }, image: 'https://images.unsplash.com/photo-1583001931096-959e9ad7b535?w=200&h=200&fit=crop' },
      { name: { RU: 'Для лица', EN: 'Face', CN: '面部' }, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=200&fit=crop' },
      { name: { RU: 'Волосы', EN: 'Hair', CN: '头发' }, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200&h=200&fit=crop' },
      { name: { RU: 'Губы', EN: 'Lips', CN: '唇部' }, image: 'https://images.unsplash.com/photo-158649577744-4413f21062fa?w=200&h=200&fit=crop' },
      { name: { RU: 'Ногти', EN: 'Nails', CN: '指甲' }, image: 'https://images.unsplash.com/photo-1632973547721-e0a6c764e43e?w=200&h=200&fit=crop' },
      { name: { RU: 'Уход за кожей', EN: 'Skincare', CN: '护肤' }, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop' },
      { name: { RU: 'Парфюмерия', EN: 'Fragrance', CN: '香水' }, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'business',
    name: { RU: 'Бизнес и офис', EN: 'Business', CN: '商业与办公' },
    subcategories: [
      { name: { RU: 'Канцелярия', EN: 'Supplies', CN: '办公用品' }, image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&h=200&fit=crop' },
      { name: { RU: 'Офисная мебель', EN: 'Furniture', CN: '办公家具' }, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop' },
      { name: { RU: 'Принтеры', EN: 'Printers', CN: '打印机' }, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=200&fit=crop' },
      { name: { RU: 'Упаковка', EN: 'Packaging', CN: '包装' }, image: 'https://images.unsplash.com/photo-1622650095861-c6928e367468?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'grocery',
    name: { RU: 'Продукты питания', EN: 'Grocery', CN: '食品杂货' },
    subcategories: [
      { name: { RU: 'Снеки и сладости', EN: 'Snacks', CN: '零食' }, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop' },
      { name: { RU: 'Бакалея', EN: 'Pantry', CN: '食品' }, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop' },
      { name: { RU: 'Органическая еда', EN: 'Organic', CN: '有机食品' }, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
      { name: { RU: 'Завтраки', EN: 'Breakfast', CN: '早餐' }, image: 'https://images.unsplash.com/photo-1522036666962-d99ba42cb233?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'sports',
    name: { RU: 'Спорт и фитнес', EN: 'Sports', CN: '运动' },
    subcategories: [
      { name: { RU: 'Фитнес дома', EN: 'Fitness', CN: '居家健身' }, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { name: { RU: 'Йога', EN: 'Yoga', CN: '瑜伽' }, image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=200&h=200&fit=crop' },
      { name: { RU: 'Велоспорт', EN: 'Cycling', CN: '骑行' }, image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200&h=200&fit=crop' },
      { name: { RU: 'Туризм', EN: 'Camping', CN: '露营' }, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&h=200&fit=crop' },
      { name: { RU: 'Спортивная одежда', EN: 'Sportswear', CN: '运动服饰' }, image: 'https://images.unsplash.com/photo-1515152285253-294747734152?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'toys',
    name: { RU: 'Игрушки', EN: 'Toys', CN: '玩具' },
    subcategories: [
      { name: { RU: 'Конструкторы', EN: 'Building Sets', CN: '积木' }, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=200&h=200&fit=crop' },
      { name: { RU: 'Куклы', EN: 'Dolls', CN: '玩偶' }, image: 'https://images.unsplash.com/photo-1534062863776-6927a445472e?w=200&h=200&fit=crop' },
      { name: { RU: 'Настольные игры', EN: 'Board Games', CN: '桌游' }, image: 'https://images.unsplash.com/photo-1610890716171-6b1f9f443299?w=200&h=200&fit=crop' },
      { name: { RU: 'Обучение', EN: 'Learning', CN: '益智' }, image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'personal_care',
    name: { RU: 'Личная гигиена', EN: 'Personal Care', CN: '个人护理' },
    subcategories: [
      { name: { RU: 'Уход за телом', EN: 'Body Care', CN: '身体护理' }, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
      { name: { RU: 'Бритье', EN: 'Shaving', CN: '剃须' }, image: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=200&h=200&fit=crop' },
      { name: { RU: 'Уход за полостью рта', EN: 'Oral Care', CN: '口腔护理' }, image: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=200&h=200&fit=crop' },
      { name: { RU: 'Дезодоранты', EN: 'Deodorants', CN: '除臭剂' }, image: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'beverages',
    name: { RU: 'Напитки', EN: 'Beverages', CN: '饮料' },
    subcategories: [
      { name: { RU: 'Кофе', EN: 'Coffee', CN: '咖啡' }, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200&h=200&fit=crop' },
      { name: { RU: 'Чай', EN: 'Tea', CN: '茶' }, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop' },
      { name: { RU: 'Соки', EN: 'Juices', CN: '果汁' }, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop' },
      { name: { RU: 'Вода', EN: 'Water', CN: '水' }, image: 'https://images.unsplash.com/photo-1564419434663-c49967363849?w=200&h=200&fit=crop' },
      { name: { RU: 'Алкоголь', EN: 'Alcohol', CN: '酒类' }, image: 'https://images.unsplash.com/photo-1569348981442-7061d436a30c?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'health',
    name: { RU: 'Здоровье', EN: 'Health', CN: '健康' },
    subcategories: [
      { name: { RU: 'Витамины', EN: 'Vitamins', CN: '维生素' }, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
      { name: { RU: 'Аптечка', EN: 'First Aid', CN: '急救' }, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop' },
      { name: { RU: 'Массажеры', EN: 'Massagers', CN: '按摩器' }, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=200&h=200&fit=crop' },
      { name: { RU: 'Диетическое питание', EN: 'Diet Nutrition', CN: '膳食营养' }, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'pets',
    name: { RU: 'Зоотовары', EN: 'Pets', CN: '宠物' },
    subcategories: [
      { name: { RU: 'Для собак', EN: 'Dogs', CN: '狗' }, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop' },
      { name: { RU: 'Для кошек', EN: 'Cats', CN: '猫' }, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop' },
      { name: { RU: 'Рыбки', EN: 'Fish', CN: '鱼' }, image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&h=200&fit=crop' },
      { name: { RU: 'Птицы', EN: 'Birds', CN: '鸟' }, image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'new_parent',
    name: { RU: 'Для малышей', EN: 'New Parent', CN: '母婴' },
    subcategories: [
      { name: { RU: 'Подгузники', EN: 'Diapers', CN: '尿布' }, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=200&fit=crop' },
      { name: { RU: 'Кормление', EN: 'Feeding', CN: '喂养' }, image: 'https://images.unsplash.com/photo-1547847494-b770d892a00c?w=200&h=200&fit=crop' },
      { name: { RU: 'Коляски', EN: 'Strollers', CN: '婴儿车' }, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=200&fit=crop' },
      { name: { RU: 'Детская комната', EN: 'Nursery', CN: '婴儿房' }, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'retailers',
    name: { RU: 'Услуги и Сервисы', EN: 'Retailers & Services', CN: '服务与零售' },
    subcategories: [
      { name: { RU: 'Доставка еды', EN: 'Food Delivery', CN: '外卖配送' }, image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=200&h=200&fit=crop' },
      { name: { RU: 'Путешествия', EN: 'Travel', CN: '旅行' }, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=200&fit=crop' },
      { name: { RU: 'Финансы', EN: 'Finance', CN: '金融' }, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop' },
      { name: { RU: 'Обучение', EN: 'Education', CN: '教育' }, image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'vehicles',
    name: { RU: 'Автотовары', EN: 'Vehicles', CN: '车辆配件' },
    subcategories: [
      { name: { RU: 'Аксессуары', EN: 'Accessories', CN: '配件' }, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop' },
      { name: { RU: 'Электроника', EN: 'Electronics', CN: '车载电子' }, image: 'https://images.unsplash.com/photo-1592853625601-bb9d23da126e?w=200&h=200&fit=crop' },
      { name: { RU: 'Уход за авто', EN: 'Car Care', CN: '汽车保养' }, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=200&h=200&fit=crop' },
      { name: { RU: 'Инструменты', EN: 'Tools', CN: '工具' }, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'home',
    name: { RU: 'Дом и сад', EN: 'Home & Garden', CN: '家居与园艺' },
    subcategories: [
      { name: { RU: 'Мебель', EN: 'Furniture', CN: '家具' }, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop' },
      { name: { RU: 'Кухня', EN: 'Kitchen', CN: '厨房' }, image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200&h=200&fit=crop' },
      { name: { RU: 'Декор', EN: 'Decor', CN: '装饰' }, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop' },
      { name: { RU: 'Садоводство', EN: 'Gardening', CN: '园艺' }, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop' },
      { name: { RU: 'Постельное белье', EN: 'Bedding', CN: '床上用品' }, image: 'https://images.unsplash.com/photo-1522771753014-df70f1c270c4?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'apparel',
    name: { RU: 'Одежда и мода', EN: 'Apparel', CN: '服装与配饰' },
    subcategories: [
      { name: { RU: 'Женская одежда', EN: 'Women', CN: '女装' }, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop' },
      { name: { RU: 'Мужская одежда', EN: 'Men', CN: '男装' }, image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=200&h=200&fit=crop' },
      { name: { RU: 'Обувь', EN: 'Shoes', CN: '鞋履' }, image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=200&h=200&fit=crop' },
      { name: { RU: 'Сумки', EN: 'Bags', CN: '包袋' }, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop' },
      { name: { RU: 'Часы', EN: 'Watches', CN: '手表' }, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'arts',
    name: { RU: 'Хобби и творчество', EN: 'Arts & Crafts', CN: '艺术与工艺' },
    subcategories: [
      { name: { RU: 'Рисование', EN: 'Painting', CN: '绘画' }, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop' },
      { name: { RU: 'Рукоделие', EN: 'Crafts', CN: '手工' }, image: 'https://images.unsplash.com/photo-1456081790379-3963e6563d88?w=200&h=200&fit=crop' },
      { name: { RU: 'Музыка', EN: 'Music', CN: '音乐' }, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop' },
      { name: { RU: 'Фотография', EN: 'Photography', CN: '摄影' }, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop' },
    ]
  },
  {
    id: 'electronics',
    name: { RU: 'Электроника', EN: 'Electronics', CN: '电子产品' },
    subcategories: [
      { name: { RU: 'Смартфоны', EN: 'Phones', CN: '手机' }, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
      { name: { RU: 'Ноутбуки', EN: 'Laptops', CN: '笔记本' }, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
      { name: { RU: 'Наушники', EN: 'Headphones', CN: '耳机' }, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
      { name: { RU: 'Гейминг', EN: 'Gaming', CN: '游戏' }, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=200&fit=crop' },
      { name: { RU: 'Умный дом', EN: 'Smart Home', CN: '智能家居' }, image: 'https://images.unsplash.com/photo-1558002038-1091a1661116?w=200&h=200&fit=crop' },
    ]
  },
];

// === 4. 新增：模拟产品数据 (用于展示产品列表) ===
const MOCK_PRODUCTS = [
  { id: 1, name: 'Advanced Night Repair', brand: 'Estée Lauder', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop', rating: 4.8, reviews: 12543 },
  { id: 2, name: 'Double Serum', brand: 'Clarins', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop', rating: 4.7, reviews: 8932 },
  { id: 3, name: 'Hydra Beauty Micro Crème', brand: 'Chanel', image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300&h=300&fit=crop', rating: 4.9, reviews: 5421 },
  { id: 4, name: 'Facial Treatment Essence', brand: 'SK-II', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=300&h=300&fit=crop', rating: 4.6, reviews: 15670 },
  { id: 5, name: 'Crème de la Mer', brand: 'La Mer', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=300&h=300&fit=crop', rating: 4.8, reviews: 9876 },
  { id: 6, name: 'Ultra Facial Cream', brand: 'Kiehl\'s', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=300&h=300&fit=crop', rating: 4.7, reviews: 21340 },
  { id: 7, name: 'Génifique Serum', brand: 'Lancôme', image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=300&h=300&fit=crop', rating: 4.8, reviews: 14500 },
  { id: 8, name: 'Mineral 89', brand: 'Vichy', image: 'https://images.unsplash.com/photo-1556228578-f6820c78a159?w=300&h=300&fit=crop', rating: 4.5, reviews: 11200 },
];

const Hero: React.FC = () => {
  // === 状态控制 ===
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  
  // === 新增：控制是否显示产品详情页以及当前选中的子分类 ===
  const [selectedSubcategory, setSelectedSubcategory] = useState<{name: string, parentName: string} | null>(null);

  // === 语言切换状态模块 ===
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LangKey>('RU'); // 默认为俄语

  const languages = [
    { code: 'RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'EN', label: 'English', flag: '🇺🇸' },
    { code: 'CN', label: '中文', flag: '🇨🇳' },
  ];
  
  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];
  const t = UI_TEXT[currentLang]; // 获取当前语言的静态文本

  // === 处理子分类点击事件 (核心新功能) ===
  const handleSubcategoryClick = (subName: string, parentName: string) => {
    setSelectedSubcategory({ name: subName, parentName: parentName });
    setIsMenuOpen(false); // 关闭大菜单
  };

  // === 渲染顶部导航栏 (复用组件以保持一致性) ===
  const renderNavbar = (isLight: boolean = false) => (
    <nav className={`flex items-center justify-between px-6 py-4 w-full max-w-[1920px] mx-auto border-b ${isLight ? 'bg-white text-gray-800 border-gray-200' : 'text-white border-transparent'}`}>
       
       {/* 左侧：菜单图标 + Logo */}
       <div className="flex items-center gap-4 w-1/4">
         <Menu 
           className="w-8 h-8 cursor-pointer hover:opacity-80" 
           onClick={() => {
              setIsMenuOpen(true);
              // 如果想在点击菜单时重置回首页，取消注释下面这行
              // setSelectedSubcategory(null); 
           }}
         />
         <span className={`text-2xl font-bold italic font-serif tracking-tight cursor-pointer ${isLight ? 'text-[#7B41F3]' : ''}`} onClick={() => setSelectedSubcategory(null)}>
           influenster
         </span>
       </div>

       {/* 中间：搜索框 */}
       <div className="flex-1 flex justify-center px-4">
         <div className="relative w-full max-w-2xl">
           <input
             type="text"
             placeholder={t.searchPlaceholder}
             className={`w-full py-3 pl-6 pr-12 rounded-full focus:outline-none shadow-lg text-lg ${isLight ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'text-gray-800'}`}
           />
           <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7B41F3] p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition">
              <Search className="w-5 h-5 text-white" />
           </div>
         </div>
       </div>

       {/* 右侧：登录/注册 + 语言切换 */}
       <div className="flex items-center justify-end gap-6 w-1/4 text-sm font-bold">
         
         {/* === 语言切换模块 (功能激活) === */}
         <div className="relative mr-2">
           <button 
             onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
             className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
           >
             <Globe className="w-5 h-5" />
             <span className="uppercase">{currentLang}</span>
           </button>
           
           {/* 下拉菜单 */}
           {isLangMenuOpen && (
             <div className="absolute top-full right-0 mt-2 w-40 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 origin-top-right">
               {languages.map((lang) => (
                 <button
                   key={lang.code}
                   onClick={() => {
                     setCurrentLang(lang.code as LangKey); // 切换语言
                     setIsLangMenuOpen(false); // 关闭菜单
                   }}
                   className={`w-full text-left px-5 py-3 hover:bg-purple-50 flex items-center gap-3 transition ${currentLang === lang.code ? 'text-[#7B41F3] font-bold' : ''}`}
                 >
                   <span className="text-lg">{lang.flag}</span>
                   <span>{lang.label}</span>
                 </button>
               ))}
             </div>
           )}
         </div>

         <a href="#" className="hidden md:block hover:underline">{t.login}</a>
         <button className={`px-6 py-2 rounded-full hover:bg-opacity-90 transition shadow-md ${isLight ? 'bg-[#7B41F3] text-white' : 'bg-white text-[#7B41F3]'}`}>
           {t.register}
         </button>
       </div>
     </nav>
  );

  // === 如果有子分类被选中，渲染【产品列表视图】 (新功能区域) ===
  if (selectedSubcategory) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        {renderNavbar(true)} {/* 使用亮色导航栏 */}
        
        {/* 全屏分类菜单 (保持原样，随时可以呼出) */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex bg-gray-100 text-gray-800">
             {/* 此处代码与下面原始代码完全一致，为了不改动逻辑，我们需要重复渲染这个 Overlay */}
             <div className="w-1/3 md:w-1/4 lg:w-1/5 bg-white h-full border-r border-gray-200 overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-xl text-[#7B41F3]">{t.categoriesTitle}</span>
                <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ul className="flex-1 py-4">
                {CATEGORIES.map((category) => (
                  <li 
                    key={category.id}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`px-6 py-4 cursor-pointer flex items-center justify-between transition-colors ${
                      activeCategoryId === category.id 
                        ? 'bg-[#7B41F3] text-white font-medium' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>{category.name[currentLang]}</span>
                    {activeCategoryId === category.id && <ChevronRight className="w-4 h-4" />}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 h-full overflow-y-auto bg-gray-50 p-8 md:p-12 relative">
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-8 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 transition">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-3xl font-bold mb-8 text-gray-800">{activeCategoryData.name[currentLang]}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {activeCategoryData.subcategories && activeCategoryData.subcategories.map((sub, index) => (
                    <div key={index} onClick={() => handleSubcategoryClick(sub.name[currentLang], activeCategoryData.name[currentLang])} className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group">
                      <div className="h-40 overflow-hidden bg-gray-200">
                        {sub.image && <img src={sub.image} alt={sub.name[currentLang]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>}
                      </div>
                      <div className="p-4 text-center font-medium text-gray-700">{sub.name[currentLang]}</div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 (左右布局) */}
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 py-8 flex gap-8">
          
          {/* 左侧：多级分类侧边栏 (模仿图3结构) */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> {t.filters}
              </h3>
              
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 cursor-pointer hover:text-[#7B41F3] flex items-center justify-between">
                  {t.allCategories}
                  <ChevronDown className="w-4 h-4" />
                </div>
                
                {/* 模拟的层级结构：Level 1 -> Level 2 (Selected) -> Level 3 -> Level 4 */}
                <div className="pl-4 border-l-2 border-gray-200 ml-1 space-y-3 mt-2">
                  <div className="text-gray-600 hover:text-[#7B41F3] cursor-pointer">{selectedSubcategory.parentName}</div>
                  
                  {/* 当前选中的子分类 */}
                  <div className="font-bold text-[#7B41F3] flex items-center justify-between cursor-pointer bg-white p-2 rounded shadow-sm">
                    {selectedSubcategory.name}
                    <Check className="w-4 h-4" />
                  </div>

                  {/* 模拟 Level 3 和 Level 4 (因为原数据没有，这里做静态展示以满足需求) */}
                  <div className="pl-4 space-y-2 border-l border-gray-200 ml-2">
                    <div className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">Premium Collection</div>
                    <div className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">Best Sellers</div>
                    <div className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">New Arrivals</div>
                    
                    {/* Level 4 */}
                    <div className="pl-4 mt-1 space-y-1 border-l border-gray-200 ml-1">
                       <div className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Special Edition</div>
                       <div className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Limited Stock</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：产品网格 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
               <h1 className="text-3xl font-bold">{selectedSubcategory.name}</h1>
               <span className="text-gray-500">{MOCK_PRODUCTS.length} {t.results}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {MOCK_PRODUCTS.map((product) => (
                <div key={product.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 group bg-white">
                  <div className="h-64 overflow-hidden relative bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md shadow text-xs font-bold text-gray-800">
                      {product.brand}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 leading-tight group-hover:text-[#7B41F3] transition">{product.name}</h3>
                    
                    <div className="flex items-center gap-1 mt-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2 font-medium">{product.rating}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">({product.reviews} {t.reviews})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === 原始的 Hero 返回 (如果没有选中子分类，显示默认紫色首页) ===
  return (
    <div className="bg-[#7B41F3] h-auto text-white font-sans w-full relative">
      
      {/* ================= 全屏分类菜单 (Overlay) ================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex bg-gray-100 text-gray-800">
          
          {/* 左侧：主类目列表 */}
          <div className="w-1/3 md:w-1/4 lg:w-1/5 bg-white h-full border-r border-gray-200 overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-xl text-[#7B41F3]">{t.categoriesTitle}</span>
              <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <ul className="flex-1 py-4">
              {CATEGORIES.map((category) => (
                <li 
                  key={category.id}
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`px-6 py-4 cursor-pointer flex items-center justify-between transition-colors ${
                    activeCategoryId === category.id 
                      ? 'bg-[#7B41F3] text-white font-medium' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {/* 动态显示分类名称 */}
                  <span>{category.name[currentLang]}</span>
                  {activeCategoryId === category.id && <ChevronRight className="w-4 h-4" />}
                </li>
              ))}
            </ul>
          </div>

          {/* 右侧：子类目展示区 */}
          <div className="flex-1 h-full overflow-y-auto bg-gray-50 p-8 md:p-12 relative">
             <button 
                onClick={() => setIsMenuOpen(false)} 
                className="absolute top-6 right-8 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

            {/* 动态显示当前选中的大分类标题 */}
            <h2 className="text-3xl font-bold mb-8 text-gray-800">{activeCategoryData.name[currentLang]}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeCategoryData.subcategories && activeCategoryData.subcategories.length > 0 ? (
                activeCategoryData.subcategories.map((sub, index) => (
                  <div key={index} 
                    /* === 新增点击事件：跳转到产品列表 === */
                    onClick={() => handleSubcategoryClick(sub.name[currentLang], activeCategoryData.name[currentLang])}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                  >
                    <div className="h-40 overflow-hidden bg-gray-200">
                      {sub.image && (
                        <img 
                          src={sub.image} 
                          alt={sub.name[currentLang]} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}
                    </div>
                    <div className="p-4 text-center font-medium text-gray-700">
                      {/* 动态显示子分类名称 */}
                      {sub.name[currentLang]}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 col-span-full">{t.noSubcategories}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 导航栏 (Navbar) 使用原逻辑 ================= */}
      {renderNavbar(false)}

      {/* ================= 主体内容区 (保持原样) ================= */}
      <main className="w-full max-w-[1920px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center relative pb-32">
        
        {/* 左侧：文案 (动态翻译) */}
        <div className="md:w-[45%] z-20 mt-10 md:mt-0 relative pl-0 md:pl-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8">
            {t.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-10 tracking-wide max-w-md">
            {t.heroSubtitle}
          </p>

          <button className="bg-white text-[#7B41F3] text-xl font-bold px-16 py-5 rounded-full shadow-xl hover:bg-gray-100 transition transform hover:scale-105 mb-12">
            {t.ctaButton}
          </button>

          {/* App 下载按钮 */}
          <div className="flex gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
              alt="Download on the App Store" 
              className="h-12 cursor-pointer hover:opacity-90 transition"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Get it on Google Play" 
              className="h-12 cursor-pointer hover:opacity-90 transition"
            />
          </div>
        </div>

        {/* 右侧：圆形图片 (保持原样) */}
        <div className="md:w-[55%] h-[600px] md:h-[800px] relative mt-0 hidden md:block transform translate-x-10 lg:translate-x-0">
            {/* 1. 右上角 */}
            <div className="absolute top-[5%] right-[25%] w-48 h-48 lg:w-56 lg:h-56 rounded-full border-[6px] border-[#7B41F3] overflow-hidden z-20 shadow-2xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=300&fit=crop" className="w-full h-full object-cover" />
            </div>
            {/* 2. 最右侧 */}
            <div className="absolute top-[30%] right-[-5%] w-56 h-56 lg:w-64 lg:h-64 rounded-full border-[6px] border-[#7B41F3] overflow-hidden z-10 shadow-2xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop" className="w-full h-full object-cover" />
            </div>
            {/* 3. 中间下方大图 */}
            <div className="absolute bottom-[5%] left-[15%] w-72 h-72 lg:w-96 lg:h-96 rounded-full border-[8px] border-[#7B41F3] overflow-hidden z-30 shadow-2xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" />
            </div>
            {/* 4. 左侧小图 */}
            <div className="absolute top-[25%] left-[5%] w-32 h-32 lg:w-40 lg:h-40 rounded-full border-[4px] border-[#7B41F3] overflow-hidden z-0 shadow-xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop" />
            </div>
            
            {/* 5. 顶部中间 - 妆容特写 (位置已修复) */}
            <div className="absolute -top-[5%] left-[30%] w-40 h-40 lg:w-48 lg:h-48 rounded-full border-[5px] border-[#7B41F3] overflow-hidden z-10 shadow-xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=300&h=300&fit=crop" className="w-full h-full object-cover" />
            </div>
            {/* 6. 右下角 - 自拍女孩 */}
            <div className="absolute -bottom-[5%] right-[5%] w-48 h-48 lg:w-56 lg:h-56 rounded-full border-[6px] border-[#7B41F3] overflow-hidden z-20 shadow-2xl hover:scale-105 transition">
              <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover" alt="Selfie with product" />
            </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;