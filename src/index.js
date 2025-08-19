import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import configManager from './helpers/api_apphub/configManager';
import { configureStore } from './redux/store';

// 在模块加载时就开始预加载配置，这是最早的时机
configManager.preload();

const RootApp = () => {
  useEffect(() => {
    // 确保配置预加载已启动（模块加载时已开始）
    if (!configManager.config && !configManager.configPromise) {
      configManager.preload();
    }
  }, []);

  return (
    <React.StrictMode>
      <Provider store={configureStore({})}>
        <App />
      </Provider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootApp />);