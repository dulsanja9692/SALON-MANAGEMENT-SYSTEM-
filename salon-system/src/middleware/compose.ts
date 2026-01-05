import { NextResponse, NextRequest } from 'next/server';
export type MiddlewareFactory = (middleware: (req: NextRequest) => Promise<NextResponse | null>) => (req: NextRequest) => Promise<NextResponse | null>;

export function compose(functions: MiddlewareFactory[], index = 0): (req: NextRequest) => Promise<NextResponse | null> {
  const current = functions[index];
  if (current) {
    const next = compose(functions, index + 1);
    return current(next);
  }
  return () => Promise.resolve(null);
}