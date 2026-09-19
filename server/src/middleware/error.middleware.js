// Global error handling middleware.
//
// Express recognizes this as an error middleware because
// it has FOUR parameters:
// error, req, res, next
const errorHandler = (error, req, res, next) => {

    // Log the actual error in terminal for debugging

    // If the error is our AppError, it will already
    // contain a statusCode such as 400 or 404.
    //
    // If it is an unexpected JavaScript/MySQL/etc. error,
    // statusCode probably won't exist, so use 500.
    const statusCode = error.statusCode || error.status ||
        (error.type === "entity.too.large" ? 413 : 500);

    // Known AppError → show our intentional message
    // Unknown/internal error → hide internal details
    const isExpectedClientError = statusCode >= 400 && statusCode < 500;
    const message = isExpectedClientError
        ? (error.type === "entity.parse.failed"
            ? "Invalid request body"
            : error.message)
        : "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
