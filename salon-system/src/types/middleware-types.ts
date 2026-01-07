import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

// We define a flexible middleware type that accepts both Request and Event
export type NextMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => NextResponse | Promise<NextResponse | void>;

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;