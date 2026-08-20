import { supabase } from '../lib/supabase';

export const adminService = {
  async getValidationQueue() {
    const { data, error } = await supabase
      .from('question_validations')
      .select('*, questions(*, question_options(*), exams(title), sections(name), topics(title))')
      .order('validated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAuditLogs(search?: string) {
    let query = supabase
      .from('admin_audit_logs')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`action.ilike.%${search}%,target_entity.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async logAdminAction(adminId: string, action: string, targetEntity: string, targetId?: string, details?: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        action,
        target_entity: targetEntity,
        target_id: targetId || null,
        details: details || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
