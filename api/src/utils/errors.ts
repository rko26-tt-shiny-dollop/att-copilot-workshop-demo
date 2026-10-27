import type { Response } from "express";

/** Domain error carrying an HTTP status code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (entity: string, id: number | string): ApiError =>
  new ApiError(404, `${entity} ${id} not found`);

export const badRequest = (message: string): ApiError =>
  new ApiError(400, message);

/** Send a consistent JSON error response. */
export function sendError(res: Response, err: unknown): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
