/**
 * Wraps a successful HTTP response (status 2xx)
 *
 * Provides convenient methods to parse the response body as JSON or handle errors.
 *
 * @typeParam R - Expected response body type when parsed as JSON
 */
export class SecuredSuccessResponse<R> {
  /**
   * Factory method to create a SecuredSuccessResponse
   *
   * @param response - HTTP response object
   * @returns SecuredSuccessResponse instance
   * @throws {BackendError} If response status indicates error
   */
  static create<R>(response: Response) {
    if (response.ok) {
      return new SecuredSuccessResponse<R>(response);
    }
    throw new Error("expected success response, but got errored");
  }

  /** HTTP status code of the response */
  get status() {
    return this.response.status;
  }

  private constructor(private readonly response: Response) {}

  /**
   * Parse response body as JSON
   *
   * @returns Parsed response data typed as R
   * @throws {BackendError} If JSON parsing fails
   */
  async toJson(): Promise<R> {
    return this.response.json().catch(() => {
      throw new Error("Cannot parse json response");
    });
  }
}

/**
 * Wraps an error HTTP response (status >= 400)
 *
 * Provides methods to parse error details as JSON or text.
 * Used for handling specific HTTP error codes (401, 403, 404, 429, etc.)
 *
 * @typeParam R - Expected error body type when parsed as JSON
 */
export class SecuredErrorResponse<R = any> {
  /**
   * Factory method to create a SecuredErrorResponse
   *
   * @param response - HTTP error response object
   * @returns SecuredErrorResponse instance
   * @throws {BackendError} If response status indicates success
   */
  static create<R>(response: Response) {
    if (!response.ok) {
      return new SecuredErrorResponse<R>(response);
    }
    throw new Error("expected error response, but got success");
  }

  /** HTTP status code of the error response */
  get status() {
    return this.response.status;
  }

  private constructor(private readonly response: Response) {}

  /**
   * Parse error response body as JSON
   *
   * @returns Parsed error data typed as R
   * @throws {BackendError} If JSON parsing fails
   */
  async toJson(): Promise<R> {
    return this.response.json().catch(() => {
      throw new Error("Cannot parse json response");
    });
  }

  /**
   * Parse error response body as text
   *
   * Useful for error messages that are not JSON formatted
   *
   * @returns Raw text content of the response
   * @throws {BackendError} If text parsing fails
   */
  async toText(): Promise<string> {
    return this.response.text().catch(() => {
      throw new Error("Cannot parse text response");
    });
  }
}

/**
 * Configuration for a secured HTTP request
 *
 * Provides request setup and error/success handling with automatic trace ID injection
 * for load balancer session stickiness.
 *
 * @typeParam B - Request body type
 * @typeParam JR - JSON response type on success
 * @typeParam R - Final result type after mapping (defaults to JR)
 *
 * @example
 * ```typescript
 * const config: SecuredFetchConfig<{amount: string}, TradeResponse> = {
 *   method: 'POST',
 *   host: 'https://api.example.com',
 *   path: '/trade',
 *   withCredentials: true,
 *   body: { amount: '1000000' },
 *   mapping: {
 *     success: (res) => res.toJson(),
 *     400: (err) => new Error('Bad request'),
 *     401: () => new SessionExpiredError(),
 *     429: () => new RateLimitError(),
 *     unknownError: (err) => new BackendError()
 *   }
 * };
 * ```
 */
export interface SecuredFetchConfig<B, JR, R = JR> {
  /** HTTP method: GET or POST */
  readonly method: "POST" | "GET" | "PUT" | "DELETE";
  /** API host URL (e.g., 'https://api.example.com') */
  readonly host: string;
  /** Request path (e.g., '/profile/seed/get') */
  readonly path: string;
  /** Include credentials (cookies) in request */
  readonly withCredentials: boolean;
  /** Request body (undefined for GET requests) */
  readonly body: B | undefined;
  /** Response handling handlers for each status code */
  readonly mapping: {
    /** Handler for successful responses (2xx status) */
    success: (response: SecuredSuccessResponse<JR>) => Promise<R> | R;
    /** Handler for 400 Bad Request */
    400?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 401 Unauthorized (session expired) */
    401?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 403 Forbidden (no permission) */
    403?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 404 Not Found */
    404?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 406 Not Acceptable (e.g., wrong TOTP) */
    406?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 429 Too Many Requests (rate limited) */
    429?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 500 Internal Server Error */
    500?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for 502 Bad Gateway */
    502?: <ER>(response: SecuredErrorResponse<ER>) => Error | Promise<R> | R;
    /** Handler for any other error status not explicitly mapped */
    unknownError?: <ER>(
      response: SecuredErrorResponse<ER>
    ) => Error | Promise<R> | R;
  };
}

/**
 * Make authenticated HTTP requests with automatic session stickiness and error handling
 *
 * Performs HTTP requests with several important features:
 * - Automatically injects trace ID header for load balancer session affinity
 * - Handles different HTTP status codes with custom handlers
 * - Wraps responses in SecuredSuccessResponse/SecuredErrorResponse classes
 * - Automatically throws SessionExpiredError on 401 (if no handler provided)
 * - Handles JSON and FormData request bodies
 * - Converts network errors to BackendError
 *
 * The trace ID ensures that all requests from the same browser client are routed
 * to the same backend server in a load-balanced environment, maintaining session state.
 *
 * @typeParam B - Request body type
 * @typeParam JR - JSON response type on success
 * @typeParam R - Final result type after mapping (defaults to JR)
 *
 * @param config - Request configuration including method, URL, body, and handlers
 * @returns Mapped response result of type R
 * @throws {BackendError} On network errors or unhandled error status codes
 * @throws {SessionExpiredError} On 401 if no custom 401 handler is provided
 * @throws {Error} Any error thrown by status code handlers
 *
 * @example
 * ```typescript
 * // Simple GET request
 * const data = await securedFetch<undefined, ProfileData>({
 *   method: 'GET',
 *   host: 'https://api.example.com',
 *   path: '/profile',
 *   withCredentials: true,
 *   body: undefined,
 *   mapping: {
 *     success: (res) => res.toJson()
 *   }
 * });
 *
 * // POST with error handling
 * const result = await securedFetch<TradeRequest, TradeResponse>({
 *   method: 'POST',
 *   host: 'https://api.example.com',
 *   path: '/trade',
 *   withCredentials: true,
 *   body: { amount: '1000000', assetId: 'token-123' },
 *   mapping: {
 *     success: (res) => res.toJson(),
 *     400: () => new Error('Invalid trade parameters'),
 *     401: () => new Error('Session expired'),
 *     429: () => new Error('Too many requests, please retry later')
 *   }
 * });
 *
 * // Disable trace ID for specific requests
 * const noTraceResult = await securedFetch<undefined, Data>({
 *   method: 'GET',
 *   host: 'https://api.example.com',
 *   path: '/public-data',
 *   withCredentials: false,
 *   body: undefined,
 *   disableTrace: true,
 *   mapping: {
 *     success: (res) => res.toJson()
 *   }
 * });
 * ```
 */
export const securedFetch = async <B, JR, R = JR>({
  method,
  host,
  path,
  withCredentials,
  mapping,
  body,
}: SecuredFetchConfig<B, JR, R>): Promise<R> => {
  const contentHeaders =
    body instanceof FormData
      ? undefined
      : { "content-type": "application/json" };
  let response: Response;
  try {
    if (method === "GET" || method === "DELETE") {
      response = await fetch(`${host}${path}`, {
        method,
        credentials: withCredentials ? "include" : undefined,
        headers: undefined,
      });
    } else {
      response = await fetch(`${host}${path}`, {
        body:
          body instanceof FormData
            ? body
            : body
            ? JSON.stringify(body)
            : undefined,
        credentials: withCredentials ? "include" : undefined,
        method,
        headers: contentHeaders,
      });
    }
  } catch (error) {
    throw new Error(
      await Promise.resolve(error).then((error) => {
        if (error instanceof Error) {
          return error.message;
        }
        if (typeof error === "string") {
          return error;
        }
        if (error instanceof Object) {
          return JSON.stringify(error);
        }
        return "unknown error";
      })
    );
  }
  if (response.ok) {
    return mapping.success(SecuredSuccessResponse.create(response));
  }

  if (response.status === 401) {
    const error401Factory = mapping["401"];
    if (!error401Factory) {
      throw new Error("session expired");
    }
    const error401FactoryResult = error401Factory(
      SecuredErrorResponse.create(response)
    );
    if (error401FactoryResult instanceof Error) {
      throw error401FactoryResult;
    }
    return error401FactoryResult;
  }

  const anyErrorFactory =
    // @ts-expect-error - mapping is a dictionary with string keys
    mapping[response.status.toString()] || mapping.unknownError;

  if (!anyErrorFactory) {
    throw new Error(
      await response
        .text()
        .then((text) => text || response.statusText || "unknown error")
        .catch(() => response.statusText || "unknown error")
    );
  }

  const anyErrorFactoryResult = anyErrorFactory(
    SecuredErrorResponse.create(response)
  );

  if (anyErrorFactoryResult instanceof Error) {
    throw anyErrorFactoryResult;
  }
  return anyErrorFactoryResult;
};
