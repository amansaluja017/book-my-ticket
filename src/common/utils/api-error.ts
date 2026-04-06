class ApiError extends Error {
  public status;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "bad request") {
    return new ApiError(400, message);
  }

  static connectionError(message = "connection error") {
    return new ApiError(529, message);
  }

  static internalError(
    message = "Internal Error: Something wrong from server side",
  ) {
    return new ApiError(502, message);
  }

  static unauthorized(message = "unauthorized") {
    return new ApiError(401, message);
  }

  static notFound(message = "Invalid data") {
    return new ApiError(404, message);
  }
}

export default ApiError;
