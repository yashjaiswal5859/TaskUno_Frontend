// User and Auth Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Product Owner' | 'Developer' | 'admin';
  organization_id?: number;
  organization_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  tokens: TokenResponse;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  organization_id: number;
  role: 'Product Owner' | 'Developer';
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'Product Owner' | 'Developer' | 'admin';
  organization: string;
  org_id?: number;
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  project_id?: number;
  createdDate?: string | Date;
  dueDate?: string | Date;
  assigned_to?: number;
  reporting_to?: number;
  project?: {
    id: number;
    title: string;
  };
  assigned_to_user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  reporting_to_user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface TaskCreate {
  title: string;
  description: string;
  status: string;
  project_id?: number;
  dueDate?: string | Date;
  assigned_to?: number;
  reporting_to?: number;
}

export interface TaskUpdate {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  project_id?: number;
  dueDate?: string | Date;
  assigned_to?: number;
  reporting_to?: number;
  status_change_reason?: string;
}

// Project Types
export interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  createdDate?: string | Date;
  dueDate?: string | Date;
  created_by_id?: number;
  created_by?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ProjectCreate {
  title: string;
  description: string;
  status: string;
  dueDate?: string | Date;
}

export interface ProjectUpdate {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string | Date;
}

// Redux State Types
export interface AuthState {
  user: AuthResponse | null;
  profile: User | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface RootState {
  auth: AuthState;
  taskData: TaskState;
  projectData: ProjectState;
  adminData: AdminState;
}

export interface TaskState {
  tasks: Task[];
  task: Task | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface ProjectState {
  projects: Project[];
  project: Project | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface AdminState {
  users: User[];
  tasks: Task[];
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

// Organization Chart Types
export interface OrganizationMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrganizationChart {
  organization_id: number;
  organization_name: string;
  product_owners: OrganizationMember[];
  developers: OrganizationMember[];
}

// API Error Types
export interface ApiError {
  response?: {
    status: number;
    data: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

