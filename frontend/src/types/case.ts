export type CaseStatus = 'New' | 'Open' | 'Pending' | 'Resolved' | 'Closed';
export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CaseComment {
  _id: string;
  text: string;
  authorId: string;
  createdAt: string;
}

export interface Case {
  _id: string;
  caseNumber: string;
  subject: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  category: string;
  userId: string;
  comments: CaseComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  page?: number;
  limit?: number;
}

export interface CreateCaseInput {
  subject: string;
  description: string;
  priority: CasePriority;
  category: string;
}

export interface UpdateCaseInput {
  status?: CaseStatus;
  priority?: CasePriority;
  description?: string;
}
