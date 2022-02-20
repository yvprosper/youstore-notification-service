import HttpStatus from "http-status-codes";
import BaseError from "./base";

class NotFoundError extends BaseError {
  constructor(message = "Resource not found", status = HttpStatus.NOT_FOUND, data: any) {
    super(message, status, data);
    this.name = "NotFoundError";
  }
}

export default NotFoundError;