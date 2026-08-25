import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DesignSystemConfig,
  DEFAULT_DESIGN_SYSTEM_CONFIG
} from '../types/designConfig';
import { designConfigService } from '../services/designConfigService';

interface DesignContextType {
  designConfig: DesignSystemConfig;
  setPreviewConfig: (config: DesignSystemConfig | null) => void;
  previewConfig: DesignSystemConfig | null;
  refreshDesignConfig: () => Promise<void>;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedConfig, setPublishedConfig] = useState<DesignSystemConfig>(DEFAULT_DESIGN_SYSTEM_CONFIG);
  const [previewConfig, setPreviewConfig] = useState<DesignSystemConfig | null>(null);

  const activeConfig = previewConfig || publishedConfig;

  const refreshDesignConfig = async () => {
    try {
      const config = await designConfigService.getPublishedDesignConfig();
      setPublishedConfig(config);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshDesignConfig();
  }, []);

  // Inject Design Tokens into CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = activeConfig.colors;

    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-hover', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--bg-main', colors.background);
      root.style.setProperty('--bg-card', colors.surface);
      root.style.setProperty('--text-main', colors.textMain);
      root.style.setProperty('--text-muted', colors.textMuted);
      root.style.setProperty('--border-color', colors.borderColor);
      root.style.setProperty('--success', colors.success);
      root.style.setProperty('--warning', colors.warning);
      root.style.setProperty('--error', colors.error);
      root.style.setProperty('--purple', colors.review);
    }
  }, [activeConfig]);

  return (
    <DesignContext.Provider
      value={{
        designConfig: activeConfig,
        setPreviewConfig,
        previewConfig,
        refreshDesignConfig,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};
