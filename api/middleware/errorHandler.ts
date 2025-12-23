import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error("=== Error Handler ===");
    console.error("Path:", req.path);
    console.error("Method:", req.method);
    console.error("Error:", err);
    console.error("====================");

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}
