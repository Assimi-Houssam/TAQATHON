export enum AppRole {
  // Bids roles
  MANAGE_ALL_BIDS = 'manage_all_bids',
  READ_OWN_BIDS = 'read_own_bids',
  READ_OTHER_BIDS = 'read_other_bids',
  MODIFY_OWN_BIDS = 'modify_own_bids',
  CREATE_BIDS = 'create_bids',
  READ_ALL_BIDS = 'read_all_bids',

  // Chats roles
  MANAGE_ALL_CHATS = 'manage_all_chats',
  READ_OWN_CHATS = 'read_own_chats',
  READ_OTHER_CHATS = 'read_other_chats',
  WRITE_OWN_CHATS = 'write_own_chats',
  CREATE_CHATS = 'create_chats',
  MODIFY_OWN_CHATS = 'modify_own_chats',

  // Users roles
  MANAGE_ALL_USERS = 'manage_all_users',
  READ_OWN_PROFILE = 'read_own_profile',
  READ_OTHER_PROFILES = 'read_other_profiles',
  MODIFY_OWN_PROFILE = 'modify_own_profile',
  MANAGE_AGENTS = 'manage_agents',
  MANAGE_SUPPLIERS = 'manage_suppliers',
  CREATE_SUPPLIERS = 'create_suppliers',
  READ_ALL_AGENTS = 'read_all_agents',
  READ_ALL_SUPPLIERS = 'read_all_suppliers',
  MODIFY_OWN_ANSWER = 'modify_own_answer',

  // Purchase requests roles
  MANAGE_ALL_PURCHASE_REQUESTS = 'manage_all_purchase_requests',
  READ_OWN_PURCHASE_REQUESTS = 'read_own_purchase_requests',
  READ_OTHER_PURCHASE_REQUESTS = 'read_other_purchase_requests',
  MODIFY_OWN_PURCHASE_REQUESTS = 'modify_own_purchase_requests',
  CREATE_PURCHASE_REQUESTS = 'create_purchase_requests',
  READ_ALL_PURCHASE_REQUESTS = 'read_all_purchase_requests',

  // Companies roles
  MANAGE_ALL_COMPANIES = 'manage_all_companies',
  READ_OWN_COMPANY = 'read_own_company',
  READ_OTHER_COMPANIES = 'read_other_companies',
  MODIFY_OWN_COMPANY = 'modify_own_company',
  CREATE_COMPANY = 'create_company',
  READ_ALL_COMPANIES = 'read_all_companies',

  // Notifications roles
  MANAGE_ALL_NOTIFICATIONS = 'manage_all_notifications',
  READ_OWN_NOTIFICATIONS = 'read_own_notifications',
  MODIFY_OWN_NOTIFICATIONS = 'modify_own_notifications',
  CREATE_NOTIFICATIONS = 'create_notifications',

  // Feedback roles
  CREATE_FEEDBACK = 'create_feedback',
  MODIFY_OWN_FEEDBACK = 'modify_own_feedback',
  READ_ALL_FEEDBACKS = 'read_all_feedbacks',
  READ_OWN_FEEDBACKS = 'read_own_feedbacks',

  // Todo management
  CREATE_TODO = 'create_todo',
  MODIFY_OWN_TODO = 'modify_own_todo',

  // Question management
  MANAGE_QUESTIONS = 'manage_questions',
  CREATE_QUESTIONS = 'create_questions',
  UPDATE_QUESTIONS = 'update_questions',
  DELETE_QUESTIONS = 'delete_questions',

  // Logs
  READ_ALL_LOGS = 'read_all_logs',
  READ_OWN_LOGS = 'read_own_logs',

  // Reports
  MANAGE_ALL_REPORTS = 'manage_all_reports',
  READ_OWN_REPORTS = 'read_own_reports',
  READ_ALL_REPORTS = 'read_all_reports',
  CREATE_REPORT = 'create_report',
  CLOSE_REPORT = 'close_report',
} 