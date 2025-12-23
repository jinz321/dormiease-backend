/**
 * Logger utility for consistent logging across the application
 * Automatically suppresses debug logs in production
 */

type LogLevel = 'info' | 'error' | 'debug' | 'warn';

class Logger {
    private isDevelopment = process.env.NODE_ENV !== 'production';

    /**
     * Log informational messages
     * Suppressed in production
     */
    info(message: string, meta?: any): void {
        if (this.isDevelopment) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
        }
    }

    /**
     * Log error messages
     * Always logged, even in production
     */
    error(message: string, error?: any): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }

    /**
     * Log debug messages
     * Only in development mode
     */
    debug(message: string, meta?: any): void {
        if (this.isDevelopment) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
        }
    }

    /**
     * Log warning messages
     */
    warn(message: string, meta?: any): void {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
    }
}

export default new Logger();
