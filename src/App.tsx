import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DesignProvider } from './context/DesignContext';
import { AppRoutes } from './AppRoutes';

const App: React.FC = () => {
  return (
    <AppProvider>
      <DesignProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DesignProvider>
    </AppProvider>
  );
};

export default App;
