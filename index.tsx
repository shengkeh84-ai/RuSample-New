import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 引入缺失的“外壳”（Context Providers）
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* 给 App 加上语言和数据的外壳 */}
    <LanguageProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </LanguageProvider>
  </React.StrictMode>
);