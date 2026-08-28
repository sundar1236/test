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
    const isValidUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminId);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData?.session?.user?.id;
      const effectiveAdminId = isValidUuid ? adminId : (sessionUserId || null);

      if (!effectiveAdminId) {
        console.warn('Skipping admin audit log insertion: No valid admin UUID session available.');
        return null;
      }

      const { data, error } = await supabase
        .from('admin_audit_logs')
        .insert({
          admin_id: effectiveAdminId,
          action,
          target_entity: targetEntity,
          target_id: targetId || null,
          details: details || null,
        })
        .select()
        .single();

      if (error) {
        console.warn('Admin audit log insert non-blocking warning:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Admin audit log non-blocking exception:', err);
      return null;
    }
  },
};
