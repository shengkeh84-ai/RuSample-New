import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Heart } from 'lucide-react';

interface SearchViewProps {
  query: string;
}

const SearchView: React.FC<SearchViewProps> = ({ query }) => {
  const { t } = useLanguage();
  const { products } = useData();

  const lowerQuery = query.toLowerCase();
  
  const filteredProducts = products.filter(p => 
    p.status === 'Active' && (
        p.title.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    )
  );

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header Info */}
        <div className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t.search.resultsFor}: <span className="text-purple-600">"{query}"</span>
            </h1>
            <p className="text-gray-500 text-sm">
                {t.search.total} {filteredProducts.length} {t.search.results}
            </p>
        </div>

        {/* Results Grid */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full">
                                <Heart size={16} className="text-gray-400" />
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {product.stock - product.stockTaken} left
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="text-xs text-purple-600 font-bold uppercase mb-1">{t.categories[product.category] || product.category}</div>
                            <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.title}</h4>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description}</p>
                            
                            <div className="flex items-center gap-1">
                                {product.platformLinks.ozon && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">OZON</span>
                                )}
                                {product.platformLinks.wb && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100">WB</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center mt-32">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                    {t.search.noResults}
                </p>
                <p className="text-gray-400 text-sm mt-2">Try checking your spelling or use different keywords.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;