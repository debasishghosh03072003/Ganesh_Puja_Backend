import { NextResponse } from 'next/server';

export interface ApiResponseOptions<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  status?: number;
}

export function apiResponse<T = any>({
  success,
  message = success ? 'Success' : 'An error occurred',
  data = null as any,
  errors = null,
  status = success ? 200 : 400,
}: ApiResponseOptions<T>) {
  const body: Record<string, any> = {
    success,
    message,
  };

  if (success) {
    body.data = data;
  } else {
    body.errors = errors;
  }

  return NextResponse.json(body, { status });
}

export function apiSuccess<T = any>(data: T, message = 'Success', status = 200) {
  return apiResponse({ success: true, data, message, status });
}

export function apiError(message = 'Request failed', errors: any = null, status = 400) {
  return apiResponse({ success: false, message, errors, status });
}

export function apiUnauthorized(message = 'Unauthorized access') {
  return apiResponse({ success: false, message, status: 401 });
}

export function apiForbidden(message = 'Forbidden action') {
  return apiResponse({ success: false, message, status: 403 });
}

export function apiNotFound(message = 'Resource not found') {
  return apiResponse({ success: false, message, status: 404 });
}

export function apiServerError(message = 'Internal server error', errors: any = null) {
  return apiResponse({ success: false, message, errors, status: 500 });
}
