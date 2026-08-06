// AppError is our own custom error class.
//
// "extends Error" means AppError inherits the normal
// behaviour of JavaScript's built-in Error class.
class AppError extends Error {

    // Whenever we write:
    //
    // new AppError("Vehicle not found", 404)
    //
    // this constructor automatically runs.
    constructor(message, statusCode) {

        // Error is the parent class.
        //
        // super(message) sends our message to the normal
        // JavaScript Error constructor.
        //
        // Because of this we still get normal Error features
        // like:
        // error.message
        // error.stack
        super(message);

        // statusCode is OUR custom property.
        //
        // Normal JavaScript Error doesn't know about
        // HTTP status codes, so we add it ourselves.
        //
        // Example:
        // error.statusCode → 404
        this.statusCode = statusCode;
    }
}

// Export the class so services/controllers/middleware
// can use AppError.
module.exports = AppError;