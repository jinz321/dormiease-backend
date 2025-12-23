/**
 * Common TypeScript interfaces for API requests and responses
 */

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

/**
 * Standard paginated response format
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

/**
 * Standard API error response
 */
export interface ApiError {
    success: false;
    message: string;
    errors?: string[];
    code?: string;
}

/**
 * Standard API success response
 */
export interface ApiSuccess<T = any> {
    success: true;
    message?: string;
    data?: T;
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number
): PaginatedResponse<T> {
    return {
        data,
        total,
        limit,
        offset,
        hasMore: offset + data.length < total,
    };
}

/**
 * Helper to parse pagination params from request query
 */
export function parsePaginationParams(query: any): { limit: number; offset: number } {
    const limit = query.limit ? parseInt(query.limit, 10) : 50; // Default 50 items
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    return {
        limit: Math.min(Math.max(limit, 1), 100), // Clamp between 1-100
        offset: Math.max(offset, 0), // Ensure non-negative
    };
}
