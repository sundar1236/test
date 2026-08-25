export interface BrandingConfig {
  platformName: string;
  tagline: string;
  showFooter: boolean;
  footerText: string;
}

export interface ColorTokensConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
  success: string;
  warning: string;
  error: string;
  review: string;
}

export interface TypographyConfig {
  fontFamily: 'Inter' | 'Poppins' | 'Roboto' | 'System';
  baseFontSize: '13px' | '14px' | '16px';
  questionFontSize: '16px' | '18px' | '20px';
  optionFontSize: '14px' | '15px' | '16px';
}

export interface HeaderConfig {
  style: 'compact' | 'standard' | 'large';
  showStudentName: boolean;
  showExamTitle: boolean;
}

export interface TimerConfig {
  style: 'compact_badge' | 'prominent_card';
  position: 'top_right' | 'top_center';
  warningThresholdMins: number;
}

export interface QuestionPaletteConfig {
  position: 'right_sidebar' | 'bottom_drawer';
  badgeSize: 'small' | 'medium' | 'large';
  gridColumns: number;
}

export interface QuestionAreaConfig {
  padding: '16px' | '24px' | '32px';
  cardStyle: 'rounded_xl' | 'rounded_2xl' | 'minimal';
}

export interface AnswerOptionsConfig {
  layout: 'vertical' | 'compact_grid';
  spacing: '10px' | '14px' | '18px';
  borderStyle: 'thick_border' | 'thin_border';
}

export interface SectionTabsConfig {
  tabStyle: 'pill_tabs' | 'underline_tabs' | 'box_tabs';
}

export interface ExamLayoutConfig {
  mode: 'split_screen' | 'full_width';
}

export interface DesignSystemConfig {
  branding: BrandingConfig;
  colors: ColorTokensConfig;
  typography: TypographyConfig;
  header: HeaderConfig;
  timer: TimerConfig;
  questionPalette: QuestionPaletteConfig;
  questionArea: QuestionAreaConfig;
  answerOptions: AnswerOptionsConfig;
  sections: SectionTabsConfig;
  layout: ExamLayoutConfig;
}

export interface DesignConfigurationRecord {
  id?: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  versionNumber: number;
  configJson: DesignSystemConfig;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export const DEFAULT_DESIGN_SYSTEM_CONFIG: DesignSystemConfig = {
  branding: {
    platformName: 'BankClerk',
    tagline: 'Mock Test Platform',
    showFooter: true,
    footerText: '© 2024 BankClerk Exam Prep. All Rights Reserved.',
  },
  colors: {
    primary: '#0F4C81',
    secondary: '#2563EB',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#475569',
    borderColor: '#CBD5E1',
    success: '#15803D',
    warning: '#B45309',
    error: '#B91C1C',
    review: '#6B21A8',
  },
  typography: {
    fontFamily: 'Inter',
    baseFontSize: '14px',
    questionFontSize: '18px',
    optionFontSize: '15px',
  },
  header: {
    style: 'standard',
    showStudentName: true,
    showExamTitle: true,
  },
  timer: {
    style: 'compact_badge',
    position: 'top_right',
    warningThresholdMins: 10,
  },
  questionPalette: {
    position: 'right_sidebar',
    badgeSize: 'medium',
    gridColumns: 6,
  },
  questionArea: {
    padding: '24px',
    cardStyle: 'rounded_xl',
  },
  answerOptions: {
    layout: 'vertical',
    spacing: '14px',
    borderStyle: 'thick_border',
  },
  sections: {
    tabStyle: 'pill_tabs',
  },
  layout: {
    mode: 'split_screen',
  },
};
