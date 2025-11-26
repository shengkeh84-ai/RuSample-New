import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-6 lg:px-12 pt-12 pb-24 flex flex-col lg:flex-row items-center">
      
      {/* Left Content */}
      <div className="flex-1 z-10 lg:pr-12 text-center lg:text-left mt-10 lg:mt-0 relative">
        <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-sm">
          {t.hero.headline}
        </h1>
        
        <p className="text-white/90 text-lg leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-light">
          {t.hero.subheadline}
        </p>
        
        <div className="flex flex-col items-center lg:items-start gap-6">
          <button className="px-10 py-4 bg-white text-purple-600 rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform">
            {t.hero.ctaButton}
          </button>
          
          <div className="flex gap-4">
            <span className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm backdrop-blur-md font-medium hover:bg-white/20 transition-colors cursor-default">
              {t.hero.badgeTrial}
            </span>
            <span className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm backdrop-blur-md font-medium hover:bg-white/20 transition-colors cursor-default">
              {t.hero.badgeUsers}
            </span>
          </div>
        </div>
      </div>

      {/* Right Visuals - 1 Large, 3 Medium, 3 Small */}
      <div className="flex-1 relative w-full h-[600px] hidden lg:block">
         
         {/* Main Center Circle (Large) */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 lg:w-[22rem] lg:h-[22rem] rounded-full overflow-hidden border-[8px] border-white/20 shadow-2xl z-20 hover:scale-105 transition-transform duration-500 ring-1 ring-white/30 backdrop-blur-sm">
            <div className="w-full h-full bg-purple-900 relative">
               <img 
                  src="https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Model" 
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
            </div>
         </div>

         {/* --- 3 Medium Images --- */}
         
         {/* Medium 1: Camera (Top Right) */}
         <div className="absolute top-[8%] right-[12%] w-28 h-28 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg z-30 animate-float-slow bg-white hover:z-40 transition-all hover:scale-110">
            <img 
                src="https://images.pexels.com/photos/1203803/pexels-photo-1203803.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Camera" 
                className="w-full h-full object-cover"
            />
         </div>

         {/* Medium 2: Sneakers (Bottom Center) */}
         <div className="absolute bottom-[0%] left-[55%] transform -translate-x-1/2 w-28 h-28 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg z-30 animate-float bg-gray-100 hover:z-40 transition-all hover:scale-110">
             <img 
                src="https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Sneakers" 
                className="w-full h-full object-cover"
            />
         </div>

         {/* Medium 3: Skincare (Bottom Left) */}
         <div className="absolute bottom-[15%] left-[5%] w-28 h-28 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg z-30 animate-float-delayed bg-gray-100 hover:z-40 transition-all hover:scale-110">
            <img 
                src="https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Skincare" 
                className="w-full h-full object-cover"
            />
         </div>

         {/* --- 3 Small Images --- */}

         {/* Small 1: Headphones (Top Left) */}
         <div className="absolute top-[12%] left-[8%] w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg z-10 animate-float bg-gray-50 hover:z-30 transition-all hover:scale-110">
            <img 
                src="https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Headphones" 
                className="w-full h-full object-cover transform scale-110"
            />
         </div>

         {/* Small 2: Handbag (Right Edge) */}
         <div className="absolute top-[45%] right-[0%] w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg z-10 animate-float-slow bg-gray-50 hover:z-30 transition-all hover:scale-110">
             <img 
                src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Handbag" 
                className="w-full h-full object-cover"
            />
         </div>

         {/* Small 3: Makeup (Bottom Right) */}
         <div className="absolute bottom-[20%] right-[15%] w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg z-10 animate-float-delayed bg-black hover:z-30 transition-all hover:scale-110">
            <img 
                src="https://images.pexels.com/photos/1115128/pexels-photo-1115128.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Makeup" 
                className="w-full h-full object-cover"
            />
         </div>

      </div>
    </div>
  );
};

export default Hero;