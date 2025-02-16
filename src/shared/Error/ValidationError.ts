// filepath: /c:/Users/carlo/repositories/stockFlow-wms/src/utils/CustomError.ts
export class ValidationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  constructor(message: string, error: unknown, public code?: number) {
    super(message);
    this.name = "APIError";
    this.code = code;
  }
}
