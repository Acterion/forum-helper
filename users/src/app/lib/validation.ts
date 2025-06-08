import { ZodSchema, ZodError } from "zod";

/**
 * Validates data against a Zod schema and returns the result
 */
export function validateData<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validates data and throws an error if validation fails
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validates data and returns undefined if validation fails (useful for optional validation)
 */
export function validateOptional<T>(schema: ZodSchema<T>, data: unknown): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

/**
 * Helper to format Zod errors in a user-friendly way
 */
export function formatZodError(error: ZodError): string {
  return error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
}

/**
 * Validates JSON data before storing in database
 */
export function validateJsonField<T>(schema: ZodSchema<T>, data: unknown, fieldName: string): T {
  const result = validateData(schema, data);

  if (!result.success) {
    throw new Error(`Invalid ${fieldName} data: ${formatZodError(result.error)}`);
  }

  return result.data;
}
