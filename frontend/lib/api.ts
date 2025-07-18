// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Debug logging for environment
console.log('🔧 Environment Debug:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Auth helpers
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging
  console.log('🔗 API Request:', { url, method: options.method || 'GET', API_BASE_URL });
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);
  
  // Debug logging for response
  console.log('📡 API Response:', { 
    status: response.status, 
    statusText: response.statusText, 
    url: response.url,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', { status: response.status, errorData, url });
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Types
export interface VacationRequestPayload {
  start_date: string;
  end_date: string;
  business_days: number;
  reason?: string;
  emergency_contact: string;
}

export interface VacationRequestResponse {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  business_days: number;
  reason?: string;
  emergency_contact: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  approval_date?: string;
  approval_comment?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserStatsResponse {
  vacation_balance: number;
  requests_count: number;
  approved_count: number;
  pending_count: number;
  current_year: number;
}

// API functions
export const vacationAPI = {
  // Create new vacation request
  createRequest: (data: VacationRequestPayload): Promise<VacationRequestResponse> =>
    apiCall('/vacation-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get user's vacation requests
  getRequests: (page = 1, perPage = 10): Promise<{
    requests: VacationRequestResponse[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> =>
    apiCall(`/vacation-requests?page=${page}&per_page=${perPage}`),

  // Get user stats
  getStats: (): Promise<UserStatsResponse> =>
    apiCall('/vacation-requests/stats'),

  // Cancel vacation request
  cancelRequest: (id: string): Promise<VacationRequestResponse> =>
    apiCall(`/vacation-requests/${id}/cancel`, {
      method: 'PUT',
    }),
};

export const authAPI = {
  // Login
  login: (email: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      vacation_balance: number;
    };
  }> =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Refresh token
  refresh: (refreshToken: string): Promise<{ 
    access_token: string;
    token_type: string;
    expires_in: number;
  }> =>
    apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

export const managerAPI = {
  // Get pending requests for manager
  getPendingRequests: (page = 1, perPage = 10): Promise<{
    requests: VacationRequestResponse[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> =>
    apiCall(`/manager/pending-requests?page=${page}&per_page=${perPage}`),

  // Approve vacation request
  approveRequest: (id: string, comment?: string): Promise<VacationRequestResponse> =>
    apiCall(`/manager/approve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ comment: comment || '' }),
    }),

  // Reject vacation request
  rejectRequest: (id: string, comment: string): Promise<VacationRequestResponse> =>
    apiCall(`/manager/reject/${id}`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Get team calendar
  getTeamCalendar: (startDate?: string, endDate?: string): Promise<{
    start_date: string;
    end_date: string;
    entries: Array<{
      id: string;
      user_id: string;
      user_name: string;
      start_date: string;
      end_date: string;
      business_days: number;
      reason: string;
    }>;
    total: number;
  }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return apiCall(`/manager/team-calendar${query ? `?${query}` : ''}`);
  },

  // Get team stats
  getTeamStats: (): Promise<{
    team_members_count: number;
    pending_requests_count: number;
    approved_requests_count: number;
    total_vacation_days: number;
    current_year: number;
    team_members: Array<{
      id: string;
      name: string;
      email: string;
      vacation_balance: number;
      department: string;
    }>;
  }> =>
    apiCall('/manager/team-stats'),
};