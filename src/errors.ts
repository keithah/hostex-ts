/**
 * Custom error classes for Hostex API
 */

export interface HostexErrorOptions {
  error_code?: number;
  request_id?: string;
  response_data?: any;
}

/**
 * Base error class for all Hostex-related errors
 */
export class HostexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HostexError';
    Object.setPrototypeOf(this, HostexError.prototype);
  }
}

/**
 * Raised when the Hostex API returns an error response
 */
export class HostexAPIError extends HostexError {
  error_code: number;
  request_id?: string;
  response_data?: any;

  constructor(message: string, options: HostexErrorOptions = {}) {
    super(message);
    this.name = 'HostexAPIError';
    this.error_code = options.error_code || 0;
    this.request_id = options.request_id;
    this.response_data = options.response_data || {};
    Object.setPrototypeOf(this, HostexAPIError.prototype);
  }

  toString(): string {
    return `Hostex API Error ${this.error_code}: ${this.message}`;
  }
}

/**
 * Raised when authentication fails (401 errors)
 */
export class AuthenticationError extends HostexAPIError {
  constructor(message: string = 'Authentication failed', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 401 });
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Raised when request validation fails (400 errors)
 */
export class ValidationError extends HostexAPIError {
  constructor(message: string = 'Request validation failed', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 400 });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Raised when a resource is not found (404 errors)
 */
export class NotFoundError extends HostexAPIError {
  constructor(message: string = 'Resource not found', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 404 });
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Raised when access is forbidden (403 errors)
 */
export class PermissionError extends HostexAPIError {
  constructor(message: string = 'Access forbidden', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 403 });
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Raised when HTTP method is not allowed (405 errors)
 */
export class MethodNotAllowedError extends HostexAPIError {
  constructor(message: string = 'Method not allowed', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 405 });
    this.name = 'MethodNotAllowedError';
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }
}

/**
 * Raised when there's a user account issue (420 errors)
 */
export class UserAccountError extends HostexAPIError {
  constructor(message: string = 'User account issue', options: HostexErrorOptions = {}) {
    super(message, { ...options, error_code: 420 });
    this.name = 'UserAccountError';
    Object.setPrototypeOf(this, UserAccountError.prototype);
  }
}

/**
 * Raised when rate limit is exceeded (429 errors)
 */
export class RateLimitError extends HostexAPIError {
  retry_after?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    options: HostexErrorOptions & { retry_after?: number } = {}
  ) {
    super(message, { ...options, error_code: 429 });
    this.name = 'RateLimitError';
    this.retry_after = options.retry_after;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  toString(): string {
    const base = super.toString();
    if (this.retry_after) {
      return `${base} (retry after ${this.retry_after} seconds)`;
    }
    return base;
  }
}

/**
 * Raised when the server encounters an error (5xx errors)
 */
export class ServerError extends HostexAPIError {
  constructor(message: string = 'Internal server error', options: HostexErrorOptions = {}) {
    const errorCode = options.error_code || 500;
    super(message, { ...options, error_code: errorCode });
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Raised when there are connection issues with the API
 */
export class ConnectionError extends HostexError {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

/**
 * Raised when requests timeout
 */
export class TimeoutError extends HostexError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Raised when client configuration is invalid
 */
export class InvalidConfigError extends HostexError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConfigError';
    Object.setPrototypeOf(this, InvalidConfigError.prototype);
  }
}

/**
 * Get appropriate error class for error code
 */
export function getErrorForCode(
  errorCode: number,
  errorMsg: string,
  options: HostexErrorOptions = {}
): HostexAPIError {
  const errorMap: Record<number, new (message: string, options: HostexErrorOptions) => HostexAPIError> = {
    400: ValidationError,
    401: AuthenticationError,
    403: PermissionError,
    404: NotFoundError,
    405: MethodNotAllowedError,
    420: UserAccountError,
    429: RateLimitError,
  };

  const ErrorClass = errorMap[errorCode];
  if (ErrorClass) {
    return new ErrorClass(errorMsg, options);
  }

  if (errorCode >= 500 && errorCode < 600) {
    return new ServerError(errorMsg, { ...options, error_code: errorCode });
  }

  return new HostexAPIError(errorMsg, { ...options, error_code: errorCode });
}