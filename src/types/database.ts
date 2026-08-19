export type UserRole = 'guest' | 'student' | 'question_reviewer' | 'admin' | 'super_admin';
export type ExamPhase = 'prelims' | 'mains';
export type DifficultyLevel = 'easy' | 'moderate' | 'hard';
export type QuestionStatus = 'draft' | 'under_review' | 'validated' | 'published' | 'archived';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'auto_submitted';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          target_exam: string;
          joined_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      exams: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          icon_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exams']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['exams']['Insert']>;
      };
      sections: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sections']['Insert']>;
      };
      topics: {
        Row: {
          id: string;
          section_id: string;
          parent_topic_id: string | null;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          phase: ExamPhase;
          section_id: string;
          topic_id: string;
          source_id: string | null;
          question_text: string;
          difficulty: DifficultyLevel;
          explanation: string | null;
          status: QuestionStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_key: string;
          option_text: string;
          is_correct: boolean;
        };
        Insert: Omit<Database['public']['Tables']['question_options']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['question_options']['Insert']>;
      };
      question_validations: {
        Row: {
          id: string;
          question_id: string;
          reviewer_id: string | null;
          source_answer: string | null;
          ai_suggested_answer: string | null;
          ai_confidence_percent: number | null;
          review_notes: string | null;
          validated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['question_validations']['Row'], 'id' | 'validated_at'>;
        Update: Partial<Database['public']['Tables']['question_validations']['Insert']>;
      };
      mock_tests: {
        Row: {
          id: string;
          exam_id: string;
          title: string;
          duration_minutes: number;
          total_questions: number;
          total_marks: number;
          is_free_sample: boolean;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mock_tests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mock_tests']['Insert']>;
      };
      test_attempts: {
        Row: {
          id: string;
          user_id: string;
          mock_test_id: string;
          status: AttemptStatus;
          started_at: string;
          submitted_at: string | null;
          time_spent_seconds: number;
          total_score: number;
          max_score: number;
          accuracy_percent: number;
          estimated_percentile: number;
          attempted_count: number;
          correct_count: number;
          incorrect_count: number;
          skipped_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['test_attempts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['test_attempts']['Insert']>;
      };
      attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string | null;
          status: string;
          time_spent_seconds: number;
          is_correct: boolean | null;
          score_awarded: number;
        };
        Insert: Omit<Database['public']['Tables']['attempt_answers']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['attempt_answers']['Insert']>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
      user_topic_progress: {
        Row: {
          user_id: string;
          topic_id: string;
          total_questions_attempted: number;
          total_correct: number;
          accuracy_percent: number;
          last_practiced_at: string;
        };
        Insert: Database['public']['Tables']['user_topic_progress']['Row'];
        Update: Partial<Database['public']['Tables']['user_topic_progress']['Insert']>;
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_entity: string;
          target_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['admin_audit_logs']['Insert']>;
      };
    };
  };
}

// Domain Model Types
export type ProfileModel = Database['public']['Tables']['profiles']['Row'];
export type ExamModel = Database['public']['Tables']['exams']['Row'];
export type SectionModel = Database['public']['Tables']['sections']['Row'];
export type TopicModel = Database['public']['Tables']['topics']['Row'];
export type QuestionModel = Database['public']['Tables']['questions']['Row'];
export type QuestionOptionModel = Database['public']['Tables']['question_options']['Row'];
export type MockTestModel = Database['public']['Tables']['mock_tests']['Row'];
export type TestAttemptModel = Database['public']['Tables']['test_attempts']['Row'];
export type BookmarkModel = Database['public']['Tables']['bookmarks']['Row'];
