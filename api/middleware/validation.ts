import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware for common request validations
 */

/**
 * Validates that required fields are present in request body
 */
export function validateRequired(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing: string[] = [];

        for (const field of fields) {
            if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                errors: missing.map(f => `${f} is required`),
            });
        }

        next();
    };
}

/**
 * Validates email format
 */
export function validateEmail(field: string = 'email') {
    return (req: Request, res: Response, next: NextFunction) => {
        const email = req.body[field];

        if (!email) {
            return next(); // Skip if not provided (use validateRequired for required fields)
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                errors: [`${field} must be a valid email address`],
            });
        }

        next();
    };
}

/**
 * Validates ID format (for params)
 */
export function validateId(paramName: string = 'id') {
    return (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[paramName];

        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
                errors: [`${paramName} is required`],
            });
        }

        next();
    };
}

/**
 * Sanitizes input by trimming whitespace
 */
export function sanitizeInput(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const field of fields) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = req.body[field].trim();
            }
        }
        next();
    };
}
