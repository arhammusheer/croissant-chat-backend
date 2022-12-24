import { Response } from "express";

class HttpError {
  httpStatusCode: number;
  errorCode: string;
  message: string;
  constructor(httpStatusCode: number, errorCode: string, message: string) {
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.message = message;
  }
}

enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER = 500,
}

/*
  Where the errors are declared. If you need a new error, insert it here.
*/
export const error = {
  // Registration flow errors
  INVALID_EMAIL: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Invalid email"
  ),
  INVALID_PASSWORD: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Invalid Passoword"
  ),
  EMAIL_AND_PASSOWORD_REQUIRED: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Email and password are required"
  ),
  USER_ALREADY_EXISTS: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "User already exists"
  ),

  // Authentication flow errors
  INVALID_CREDENTIALS: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "Invalid credentials"
  ),
  USER_NOT_FOUND: new HttpError(
    HttpStatusCode.NOT_FOUND,
    "not_found",
    "User not found"
  ),
  NO_TOKEN_PROVIDED: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "No token provided"
  ),
  BEARER_TOKEN_MISSING: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "Bearer token missing"
  ),
  INVALID_TOKEN: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "Invalid token"
  ),
  INVALID_PROVIDER: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Invalid provider"
  ),
  INVALID_CODE: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Invalid code"
  ),
  TOO_MANY_REQUESTS: new HttpError(
    HttpStatusCode.TOO_MANY_REQUESTS,
    "too_many_requests",
    "Too many requests"
  ),

  // Room errors
  ROOM_NAME_REQUIRED: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Room name is required"
  ),
  LAT_LONG_REQUIRED: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Latitude and longitude are required"
  ),
  LAT_LONG_MUST_BE_NUMBERS: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Latitude and longitude must be numbers"
  ),
  LAT_LONG_MUST_BE_BETWEEN_MINUS_90_AND_90: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Latitude and longitude must be between -90 and 90"
  ),
  LAT_LONG_MUST_BE_BETWEEN_MINUS_180_AND_180: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Latitude and longitude must be between -180 and 180"
  ),

  // Message errors
  MESSAGE_REQUIRED: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Message is required"
  ),
  MESSAGE_TOO_LONG: new HttpError(
    HttpStatusCode.BAD_REQUEST,
    "validation_error",
    "Message is too long"
  ),
  ROOM_NOT_FOUND: new HttpError(
    HttpStatusCode.NOT_FOUND,
    "not_found",
    "Room not found"
  ),
  USER_NOT_IN_ROOM: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "User not in room"
  ),
  MESSAGE_NOT_FOUND: new HttpError(
    HttpStatusCode.NOT_FOUND,
    "not_found",
    "Message not found"
  ),
  MESSAGE_OWNERSHIP: new HttpError(
    HttpStatusCode.UNAUTHORIZED,
    "access_denied",
    "Message ownership invalid"
  ),
};

export const sendHttpError = (res: Response, error: HttpError) => {
  res.status(error.httpStatusCode).send({
    errorCode: error.errorCode,
    message: error.message,
  });
};
