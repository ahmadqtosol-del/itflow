
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.jsx';
import { useUiStore } from './store/uiStore';


function ThemeRoot() {
  const theme = useUiStore(
    (state) => state.theme
  );

  useEffect(() => {
    const safeTheme =
      theme === 'light'
        ? 'light'
        : 'dark';

    document.documentElement.setAttribute(
      'data-theme',
      safeTheme
    );

    document.documentElement.style.colorScheme =
      safeTheme;
  }, [theme]);

  return <App />;
}


createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <ThemeRoot />
  </StrictMode>
);
