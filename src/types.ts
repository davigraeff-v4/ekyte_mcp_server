/**
 * Ekyte MCP Server TypeScript Type Definitions
 */

// ============ Common Types ============

export interface EkyteWorkspace {
  id: number;
  name: string;
  active: number;
  access: number;
  avatarId: number | null;
  avatar: string | null;
  defaultLanguage?: string;
}

export interface EkyteUser {
  id: string;
  email: string;
  userName: string;
  avatarId?: number | null;
}

export interface EkyteTaskType {
  id: number;
  name: string;
  description: string;
  daysToStart: number;
  active: number;
  effort: number;
  workflowId: number;
  workflow: {
    id: number;
    name: string;
  };
  companyId: number;
  effortFormated: string;
  sequential: number;
  taskObject: number;
  phaseStartType: number;
  allocationType: number;
  ctcTaskTypeGroupId: number;
  ctcTaskTypeGroup: {
    id: number;
    name: string;
    sequential: number;
  };
}

export interface EkytePhase {
  id: number;
  name: string;
  sequential: number;
  active: number;
  hidden: number;
  isAnalysis: number;
  isPlanning: number;
  isApproval: number;
  avatarId: number | null;
  workflowId: number;
}

export interface EkyteTask {
  id: number;
  title: string;
  description: string;
  situation: number;
  allocationType: number;
  workspaceId: number;
  workspace: EkyteWorkspace;
  ctcTaskTypeId: number;
  ctcTaskType: {
    id: number;
    name: string;
    workflowId: number;
  };
  phaseId: number;
  phase: EkytePhase;
  executorId: string;
  executor: EkyteUser;
  coExecutorId: string | null;
  coExecutor: EkyteUser | null;
  priority: number;
  phaseStartDate: string;
  phaseDueDate: string;
  currentStartDate: string;
  currentDueDate: string;
  creationDate: string;
  originalDueDate: string;
  resolvedDate: string | null;
  quantity: number;
  estimatedTime: number;
  actualTime: number;
  createById: string;
  createBy: EkyteUser;
  tags: unknown[];
  artifacts: unknown[];
  ctcTaskProjectId: number | null;
  ctcTaskProject: unknown | null;
}

export interface EkyteTimeTracking {
  id?: number;
  typeTimeTracking: number;
  startDate: string;
  startDateTime: string;
  endDate: string;
  endDateTime: string;
  effort: number;
  comment: string;
  workspaceId: number;
  workspace: Partial<EkyteWorkspace>;
  type: number;
  ctcTaskId?: number;
  ctcTask?: Partial<EkyteTask>;
  ctcTaskTypeId?: number;
  ctcTaskType?: { id: number; name: string; workflowId?: number };
  phaseId?: number;
  phase?: Partial<EkytePhase>;
  manualTime?: string;
}

// ============ API Response Types ============

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// ============ Tool Response Types ============

export interface ToolListResponse<T> {
  total: number;
  count: number;
  page: number;
  items: T[];
  has_more: boolean;
  next_page: number | null;
}
