export const CONFIG = Object.freeze({
  supabaseUrl: 'https://jgkucychrtbbeqscpwob.supabase.co',
  supabaseKey: 'sb_publishable_3nrRYH8KgwUXcQEpjGSMHw_Z3px-tYz',
  workspaceId: 'eastern-air',
  build: 'brain-v4-0.1',
});

export const STATUS_OPTIONS = ['inbox','assigned','working','waiting','follow_up','needs_review','snoozed','done'];
export const ATTENTION_OPTIONS = ['background','watch','action','waiting','review','risk','resolved'];
export const PRIORITY_OPTIONS = ['critical','high','medium','low'];
export const SCHEDULE_IMPACT_OPTIONS = ['critical','high','medium','low','none'];
export const CONFIDENCE_OPTIONS = ['confirmed','source_says','calculated','inferred','needs_verification'];
