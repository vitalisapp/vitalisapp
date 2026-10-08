class AppError extends Error {
  constructor(message, status = 500, code = "UNKNOWN", details = undefined) {
    super(message);
    this.status = status;
    this.statusCode = status; // Express convention alias
    this.isOperational = true; // vs programmer bugs (crashes)
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}
module.exports = { AppError };
