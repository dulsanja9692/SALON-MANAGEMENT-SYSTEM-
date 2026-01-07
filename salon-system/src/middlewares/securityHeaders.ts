import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory, NextMiddleware } from "../types/middleware-types";

export const withSecurityHeaders: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // 1. Run the chain
    const res = await next(request, _next);

    // 2. Add headers if response exists
    if (res instanceof NextResponse) {
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.headers.set("Pragma", "no-cache");
      return res;
    }

    return res;
  };
};