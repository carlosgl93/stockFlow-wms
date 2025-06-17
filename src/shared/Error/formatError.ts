import { APIError, ValidationError } from "./ValidationError";

// Add types for error and context
export type ErrorContext = Record<string, unknown>;
export type ErrorLike = Error & {
  code?: string;
  stack?: string;
  message: string;
};

export function formatError(
  functionName: string,
  error: unknown,
  context?: ErrorContext
): string {
  let message = `[${functionName}] `;
  if (error instanceof ValidationError || error instanceof APIError) {
    message += error.message;
  } else if (error instanceof Error) {
    message += error.message;
  } else if (typeof error === "object" && error && "message" in error) {
    message += String((error as { message: unknown }).message);
  } else {
    message += "Unknown error";
  }
  if (context && Object.keys(context).length > 0) {
    try {
      message += ` | Context: ${JSON.stringify(context)}`;
    } catch {
      message += " | Context: [unserializable]";
    }
  }
  if (
    error &&
    typeof error === "object" &&
    "stack" in error &&
    typeof (error as { stack?: unknown }).stack === "string"
  ) {
    message += ` | Stack: ${(error as { stack: string }).stack}`;
  }
  return message;
}
