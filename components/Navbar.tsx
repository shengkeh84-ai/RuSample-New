import React from 'react';
import { Search } from 'lucide-react'; // 确保你安装了 lucide-react

const Hero: React.FC = () => {
  return (
    <div className="bg-[#7B41F3] min-h-screen text-white overflow-hidden relative">
      {/* ================= 顶部导航栏 (模拟) ================= */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="text-2xl font-bold italic font-serif">influenster</div>
        
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full py-2 pl-4 pr-10 rounded-full text-gray-800 focus:outline-none"
          />
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:underline hidden sm:block">Войти</a>
          <button className="bg-white text-[#7B41F3] px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition">
            Регистрация
          </button>
        </div>
      </header>

      {/* ================= 主要内容区 ================= */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-20 max-w-7xl mx-auto">
        
        {/* 左侧：文案和按钮 */}
        <div className="md:w-1/2 z-10 space-y-8 mt-12 md:mt-0 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Ваша следующая <br />
            любимая находка <br />
            — прямо здесь.
          </h1>
          
          <p className="text-xl font-light opacity-90">
            Найдите это, попробуйте, а затем расскажите всему миру.
          </p>

          <div>
            <button className="bg-white text-[#7B41F3] text-lg font-bold px-12 py-4 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
              Начать обзор
            </button>
          </div>

          {/* App Store / Google Play 徽章 */}
          <div className="flex gap-4 pt-4 justify-center md:justify-start">
            {/* 这里用黑色方块模拟，你可以替换成真实的图片 */}
            <div className="bg-black h-12 w-36 rounded-md border border-white/30 flex items-center justify-center cursor-pointer">
                <span className="text-xs font-bold">App Store</span>
            </div>
            <div className="bg-black h-12 w-36 rounded-md border border-white/30 flex items-center justify-center cursor-pointer">
                <span className="text-xs font-bold">Google Play</span>
            </div>
          </div>
        </div>

        {/* 右侧：圆形图片拼贴 */}
        <div className="md:w-1/2 relative h-[400px] md:h-[600px] w-full">
          {/* 我们用带颜色的圆圈模拟图片，你可以把 url('') 里的链接换成真实的图片链接 */}
          
          {/* 右上大图 */}
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#9161F5] overflow-hidden shadow-xl bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/random/300x300/?portrait,woman')"}}></div>
          
          {/* 中间偏上 */}
          <div className="absolute top-20 right-[45%] w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#9161F5] overflow-hidden shadow-xl bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/random/300x300/?product,beauty')"}}></div>

          {/* 中间大图 */}
          <div className="absolute top-1/3 left-10 md:left-0 w-56 h-56 md:w-72 md:h-72 rounded-full border-4 border-[#9161F5] overflow-hidden shadow-2xl bg-cover bg-center z-20" style={{backgroundImage: "url('https://source.unsplash.com/random/400x400/?portrait,smiling')"}}></div>
          
          {/* 右下 */}
          <div className="absolute bottom-10 right-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#9161F5] overflow-hidden shadow-xl bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/random/300x300/?hand,cream')"}}></div>

          {/* 左下小图 */}
          <div className="absolute bottom-0 left-1/4 w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#9161F5] overflow-hidden shadow-xl bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/random/300x300/?man,fashion')"}}></div>
        </div>
      </main>
    </div>
  );
};

export default Hero;