import { queryClient } from "./queryClient";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  url: string, 
  options: RequestInit = {}
): Promise<any> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || response.statusText);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

// Convenience methods
export const api = {
  get: (url: string, options?: RequestInit) => 
    apiRequest(url, { method: 'GET', ...options }),
    
  post: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  put: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  patch: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  delete: (url: string, options?: RequestInit) => 
    apiRequest(url, { method: 'DELETE', ...options }),
};

// React Query integration helpers
export function invalidateQueries(queryKey: string | string[]) {
  return queryClient.invalidateQueries({ 
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
  });
}

export function setQueryData(queryKey: string | string[], data: any) {
  return queryClient.setQueryData(
    Array.isArray(queryKey) ? queryKey : [queryKey], 
    data
  );
}

// Error handling utility
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Retry utility for failed requests
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
}

// Request timeout utility
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}
