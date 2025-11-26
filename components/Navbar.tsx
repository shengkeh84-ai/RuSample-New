
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { Menu, Globe, ChevronDown, Search, X } from 'lucide-react';

interface NavbarProps {
  onToggleCategories: () => void;
  isCategoriesOpen: boolean;
  onSearch: (query: string) => void;
  searchQuery: string;
  onLogin: () => void;
  onSignup: () => void;
  onHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onToggleCategories, 
  isCategoriesOpen, 
  onSearch, 
  searchQuery, 
  onLogin, 
  onSignup,
  onHome
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen);
  
  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(localSearch);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-4 w-full text-white relative z-50 shadow-sm max-w-[1600px] mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleCategories}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          {isCategoriesOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        <div 
          className="text-2xl font-bold italic tracking-wide cursor-pointer"
          onClick={onHome}
        >
          {t.nav.logo}
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
            </div>
            <input 
              type="text" 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder={t.nav.searchPlaceholder}
              className="w-full py-2.5 pl-10 pr-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
            />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onLogin}
          className="px-5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm text-sm font-medium"
        >
          {t.nav.login}
        </button>
        <button 
          onClick={onSignup}
          className="px-5 py-1.5 rounded-full bg-white text-purple-600 font-bold hover:bg-gray-100 transition-colors text-sm shadow-md"
        >
          {t.nav.signup}
        </button>
        
        {/* Language Selector */}
        <div className="relative ml-2">
          <button 
            onClick={toggleLangMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            <Globe size={16} />
            <span>{language}</span>
            <ChevronDown size={14} />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1 text-gray-800 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              {Object.values(Language).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangSelect(lang)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors ${language === lang ? 'text-purple-600 font-bold bg-purple-50' : ''}`}
                >
                  {lang === Language.ZH ? '中文' : lang === Language.EN ? 'English' : 'Русский'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
