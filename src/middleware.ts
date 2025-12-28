import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip tracking for API routes, static files, and admin paths to reduce Firestore writes
  const path = request.nextUrl.pathname;
  const shouldSkipTracking = 
    path.startsWith('/api/') ||
    path.includes('.') ||
    path.startsWith('/_next') ||
    path.startsWith('/admin');

  if (!shouldSkipTracking) {
    // Add visit tracking header - will be processed client-side
    const response = NextResponse.next();
    response.headers.set('x-track-visit', path);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
