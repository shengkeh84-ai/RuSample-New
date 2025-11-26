
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_DATA } from '../constants';
import { ChevronRight } from 'lucide-react';

const CategoryView: React.FC = () => {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(CATEGORY_DATA[0].id);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const selectedCategory = CATEGORY_DATA.find(c => c.id === selectedId);

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-80px)] bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">{t.nav.categories}</h2>
        </div>
        <div className="py-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {CATEGORY_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`w-full text-left px-6 py-3.5 flex items-center justify-between text-sm transition-colors ${
                selectedId === cat.id
                  ? 'bg-purple-50 text-purple-600 font-bold border-l-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
              }`}
            >
              <span>{t.categories[cat.id]}</span>
              {selectedId === cat.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-8 bg-[#F9FAFB] overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto">
            {selectedCategory && (
                <>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">{t.categories[selectedCategory.id]}</h2>
                
                {selectedCategory.subcategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {selectedCategory.subcategories.map((sub) => {
                        const isLoaded = loadedImages[sub.id];
                        return (
                            <div key={sub.id} className="flex flex-col items-center group cursor-pointer">
                                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#f8f9fa] border border-gray-200 relative mb-3 transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md">
                                    {/* Placeholder with shimmer effect */}
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
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <p>No subcategories available.</p>
                    </div>
                )}
                </>
            )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default CategoryView;
