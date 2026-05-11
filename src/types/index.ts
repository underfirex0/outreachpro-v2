export type LeadStatus = 'unsent' | 'sent' | 'replied' | 'interested' | 'not-interested' | 'not-sure';
export type LeadGroup = 'A' | 'B';
export type UserRole = 'admin' | 'manager' | 'agent_b';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  site?: string;
  group: LeadGroup;
  status: LeadStatus;
  sent_at?: string;
  replied_at?: string;
  notes?: string;
  created_at: string;
}

export interface Settings {
  id: number;
  msg_a: string;
  msg_b: string;
  send_delay: number;
  updated_at: string;
}

export interface UserRole_ {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Stats {
  total: number;
  sent: number;
  replied: number;
  interested: number;
  not_interested: number;
  not_sure: number;
  unsent: number;
  group_a: number;
  group_b: number;
  a_interested: number;
  b_interested: number;
  a_sent: number;
  b_sent: number;
}
