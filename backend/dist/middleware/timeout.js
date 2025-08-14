"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutMiddleware = void 0;
const timeoutMiddleware = (timeoutMs = 30000) => {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                console.error(`⏰ Request timeout after ${timeoutMs}ms:`, req.method, req.url);
                res.status(408).json({
                    success: false,
                    message: 'Request timeout. Please try again.'
                });
            }
        }, timeoutMs);
        // Clear timeout when response is sent
        res.on('finish', () => {
            clearTimeout(timeout);
        });
        res.on('close', () => {
            clearTimeout(timeout);
        });
        next();
    };
};
exports.timeoutMiddleware = timeoutMiddleware;
//# sourceMappingURL=timeout.js.map