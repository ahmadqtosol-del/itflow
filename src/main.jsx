import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { useUiStore } from './store/uiStore';

function ThemeRoot() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeRoot />
  </StrictMode>
);
