
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 确保 DOM 加载后再挂载
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Critical Error: Root element '#root' not found in DOM.");
}
