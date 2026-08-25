import { supabase } from '../lib/supabase';
import {
  DesignSystemConfig,
  DesignConfigurationRecord,
  DEFAULT_DESIGN_SYSTEM_CONFIG
} from '../types/designConfig';

const DESIGN_LOCAL_CACHE_KEY = 'bankclerk_published_design_config';

export class DesignConfigService {
  /**
   * Fetches the active published design configuration from Supabase or local cache.
   */
  public async getPublishedDesignConfig(): Promise<DesignSystemConfig> {
    try {
      const { data, error } = await supabase
        .from('design_configurations')
        .select('*')
        .eq('status', 'published')
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.config_json) {
        const config = data.config_json as DesignSystemConfig;
        localStorage.setItem(DESIGN_LOCAL_CACHE_KEY, JSON.stringify(config));
        return config;
      }
    } catch {
      // Fallback
    }

    const cached = localStorage.getItem(DESIGN_LOCAL_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as DesignSystemConfig;
      } catch {
        // Fallthrough
      }
    }

    return DEFAULT_DESIGN_SYSTEM_CONFIG;
  }

  /**
   * Saves a draft design configuration.
   */
  public async saveDraftConfig(record: DesignConfigurationRecord): Promise<{ success: boolean; data?: DesignConfigurationRecord; error?: string }> {
    try {
      const payload = {
        name: record.name,
        status: 'draft',
        version_number: record.versionNumber || 1,
        config_json: record.configJson,
        updated_at: new Date().toISOString(),
      };

      let queryData;
      if (record.id) {
        const { data, error } = await supabase
          .from('design_configurations')
          .update(payload)
          .eq('id', record.id)
          .select()
          .single();

        if (error) throw error;
        queryData = data;
      } else {
        const { data, error } = await supabase
          .from('design_configurations')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        queryData = data;
      }

      return {
        success: true,
        data: {
          id: queryData.id,
          name: queryData.name,
          status: queryData.status,
          versionNumber: queryData.version_number,
          configJson: queryData.config_json,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to save design draft to database.',
      };
    }
  }

  /**
   * Publishes a design configuration version so it reaches student-facing UIs.
   */
  public async publishDesignConfig(record: DesignConfigurationRecord): Promise<{ success: boolean; data?: DesignConfigurationRecord; error?: string }> {
    try {
      const payload = {
        name: record.name,
        status: 'published',
        version_number: record.versionNumber + 1,
        config_json: record.configJson,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('design_configurations')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const published = {
        id: data.id,
        name: data.name,
        status: data.status,
        versionNumber: data.version_number,
        configJson: data.config_json,
      };

      localStorage.setItem(DESIGN_LOCAL_CACHE_KEY, JSON.stringify(data.config_json));

      return {
        success: true,
        data: published,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to publish design configuration to database.',
      };
    }
  }
}

export const designConfigService = new DesignConfigService();
