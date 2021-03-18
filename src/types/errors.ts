export interface ErrorContext {
  originService: string;
  originModule: string;
  additionalContext?: any;
}

export class GrankError extends Error {
  isGrankError = true;

  context: ErrorContext;
  statusCode: number = 500;
}

export class FlowNotStarted extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "FlowNotStarted";
    this.statusCode = 401;
    this.context = context;
  }
}

export class CodeDoesntMatch extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "CodeDoesntMatch";
    this.statusCode = 403;

    this.context = context;
  }
}

export class TokenExpired extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "TokenExpired";
    this.statusCode = 401;

    this.context = context;
  }
}

export class TokenFlooded extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "TokenFlooded";
    this.statusCode = 401;

    this.context = context;
  }
}

export class InternalError extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "InternalError";
    this.statusCode = 500;

    this.context = context;
  }
}

export class IncorrectArgsError extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "IncorrectArgsError";
    this.statusCode = 403;

    this.context = context;
  }
}

export class UnauthorizedError extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "UnauthorizedError";
    this.statusCode = 401;

    this.context = context;
  }
}

export class NoPermissionError extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "NoPermissionError";
    this.statusCode = 403;

    this.context = context;
  }
}

export class UsernameTakenError extends GrankError {
  constructor(message: any, context: ErrorContext) {
    super(message);

    this.name = "UsernameTakenError";
    this.statusCode = 403;

    this.context = context;
  }
}

const errors = {
  FlowNotStarted,
  CodeDoesntMatch,
  TokenExpired,
  TokenFlooded,
  InternalError,
  IncorrectArgsError,
  NoPermissionError,
  UsernameTakenError,
};

export default errors;
