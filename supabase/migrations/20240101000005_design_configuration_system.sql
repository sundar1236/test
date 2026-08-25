-- Migration 20240101000005: Design Configuration System
-- Centralized Admin-Controlled UI Design Tokens & Versioning

CREATE TABLE IF NOT EXISTS public.design_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL DEFAULT 'Default Bank Clerk Design Theme',
  status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  version_number INT NOT NULL DEFAULT 1,
  config_json JSONB NOT NULL DEFAULT '{
    "branding": {
      "platformName": "BankClerk",
      "tagline": "Mock Test Platform",
      "showFooter": true,
      "footerText": "© 2024 BankClerk Exam Prep. All Rights Reserved."
    },
    "colors": {
      "primary": "#0F4C81",
      "secondary": "#2563EB",
      "background": "#F8FAFC",
      "surface": "#FFFFFF",
      "textMain": "#0F172A",
      "textMuted": "#475569",
      "borderColor": "#CBD5E1",
      "success": "#15803D",
      "warning": "#B45309",
      "error": "#B91C1C",
      "review": "#6B21A8"
    },
    "typography": {
      "fontFamily": "Inter",
      "baseFontSize": "14px",
      "questionFontSize": "18px",
      "optionFontSize": "15px"
    },
    "header": {
      "style": "standard",
      "showStudentName": true,
      "showExamTitle": true
    },
    "timer": {
      "style": "compact_badge",
      "position": "top_right",
      "warningThresholdMins": 10
    },
    "questionPalette": {
      "position": "right_sidebar",
      "badgeSize": "medium",
      "gridColumns": 6
    },
    "questionArea": {
      "padding": "24px",
      "cardStyle": "rounded_xl"
    },
    "answerOptions": {
      "layout": "vertical",
      "spacing": "14px",
      "borderStyle": "thick_border"
    },
    "sections": {
      "tabStyle": "pill_tabs"
    },
    "layout": {
      "mode": "split_screen"
    }
  }'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.design_configurations ENABLE ROW LEVEL SECURITY;

-- Everyone (including students & guests) can SELECT the published design configuration
DROP POLICY IF EXISTS "Everyone can view published design config" ON public.design_configurations;
CREATE POLICY "Everyone can view published design config" ON public.design_configurations
  FOR SELECT USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage all design configurations
DROP POLICY IF EXISTS "Admins can manage design configs" ON public.design_configurations;
CREATE POLICY "Admins can manage design configs" ON public.design_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Seed Default Published Design Configuration if table empty
INSERT INTO public.design_configurations (name, status, version_number, published_at)
SELECT 'Default Bank Clerk Design Theme', 'published', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.design_configurations WHERE status = 'published');
