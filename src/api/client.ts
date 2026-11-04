export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code = 'API_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export interface RequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function appendQueryParams(path: string, params?: Record<string, unknown>): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  if (!qs) return path;
  return path + (path.includes('?') ? '&' : '?') + qs;
}

class ApiClient {
  private baseUrl = '/api/v1';
  private token: string | null = null;

  constructor() {
    // Check if token exists in session/local fallback
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  public async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized globally
      if (response.status === 401 && !path.includes('/auth/login')) {
        this.setToken(null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          const target = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?redirect=${target}`;
        }
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || `HTTP error ${response.status}`;
        const errorCode = data?.error?.code || 'HTTP_ERROR';
        throw new ApiError(errorMsg, errorCode, response.status);
      }

      // If wrapped in { success: true, data: ... }
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data as T;
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err?.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  /**
   * Accepts either plain headers or an axios-style `{ params, headers }` options object.
   * Several feature APIs pass `{ params }`; previously those were sent as HTTP headers
   * and the query filters were silently dropped.
   */
  private resolveRequestOptions(
    path: string,
    options?: RequestOptions | Record<string, string>
  ): { path: string; headers?: Record<string, string> } {
    if (!options) return { path };
    const maybe = options as RequestOptions;
    const isOptionsObject =
      Object.prototype.hasOwnProperty.call(options, 'params') ||
      (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof maybe.headers === 'object');
    if (!isOptionsObject) {
      return { path, headers: options as Record<string, string> };
    }
    return { path: appendQueryParams(path, maybe.params), headers: maybe.headers };
  }

  public get<T = any>(path: string, options?: RequestOptions | Record<string, string>): Promise<T> {
    const resolved = this.resolveRequestOptions(path, options);
    return this.request<T>(resolved.path, { method: 'GET', headers: resolved.headers });
  }

  public post<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(path: string, options?: RequestOptions | Record<string, string>): Promise<T> {
    const resolved = this.resolveRequestOptions(path, options);
    return this.request<T>(resolved.path, { method: 'DELETE', headers: resolved.headers });
  }
}

export const apiClient = new ApiClient();
