import { FirebaseError } from "firebase/app";
import { APIError, ValidationError } from "./ValidationError";

export * from "./ValidationError";
export * from "./formatError";

// Add a function to convert Firebase errors to human-readable messages
export const getHumanReadableError = (
  error: unknown,
  t: (key: string) => string
): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return t("You don't have permission to perform this action");
      case "not-found":
        return t("The requested data was not found");
      case "already-exists":
        return t("This item already exists");
      case "invalid-argument":
        return t("Invalid data provided. Please check your inputs");
      case "failed-precondition":
        return t("Operation failed due to system constraints");
      case "resource-exhausted":
        return t("System is temporarily unavailable. Please try again later");
      case "unauthenticated":
        return t("Please log in to continue");
      case "deadline-exceeded":
        return t("Operation timed out. Please try again");
      case "unavailable":
        return t("Service is temporarily unavailable");
      case "data-loss":
        return t("Data corruption detected. Please contact support");
      case "unknown":
        return t("An unexpected error occurred. Please try again");
      default:
        // Handle Firestore specific errors
        if (error.message.includes("MALFORMED")) {
          return t(
            "Invalid data format. Please check your inputs and try again"
          );
        }
        if (error.message.includes("undefined")) {
          return t(
            "Some required data is missing. Please fill all required fields"
          );
        }
        return t("An error occurred while processing your request");
    }
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Handle common error patterns
    if (error.message.includes("network")) {
      return t("Network error. Please check your connection");
    }
    if (error.message.includes("timeout")) {
      return t("Request timed out. Please try again");
    }
    return error.message;
  }

  return t("An unexpected error occurred");
};
