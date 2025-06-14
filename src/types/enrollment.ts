// Stage Types
export interface Stage {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  order_number: number;
  plan_id: string;
  assignments_count: number;
  created_at: string;
  updated_at: string;
}

// Assignment Status
export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Assignment Types
export interface Assignment {
  assigned_at: string | number | Date;
  id: string;
  stage_id: string;
  teacher_id: string;
  teacher_email: string;
  teacher_name: string;
  details: string;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  email: string;
  full_name: string;
}
