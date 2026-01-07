import { MiddlewareFactory } from "../types/middleware-types"; // Updated path
import { NextMiddleware, NextResponse } from "next/server";

export function compose(
  middlewareFactories: MiddlewareFactory[],
  index = 0
): NextMiddleware {
  const current = middlewareFactories[index];

  if (current) {
    const next = compose(middlewareFactories, index + 1);
    return current(next);
  }

  return () => NextResponse.next();
}