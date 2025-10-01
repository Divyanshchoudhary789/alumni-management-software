import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/alumni(.*)',
  '/events(.*)',
  '/communications(.*)',
  '/donations(.*)',
  '/mentorship(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/profile(.*)',
  '/api/alumni(.*)',
  '/api/events(.*)',
  '/api/communications(.*)',
  '/api/donations(.*)',
  '/api/mentorship(.*)',
  '/api/analytics(.*)',
  '/api/settings(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/settings/users(.*)',
  '/settings/system(.*)',
  '/analytics/admin(.*)',
  '/api/admin(.*)',
  '/api/auth/users(.*)',
  '/api/auth/role(.*)',
]);

// Define alumni-only routes (accessible by alumni and admin)
const isAlumniRoute = createRouteMatcher([
  '/alumni(.*)',
  '/events(.*)',
  '/mentorship(.*)',
  '/profile(.*)',
  '/api/alumni(.*)',
  '/api/events(.*)',
  '/api/mentorship(.*)',
]);

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/oauth-callback(.*)',
  '/api/webhooks(.*)',
  '/api/health',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in for protected routes
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from session claims or metadata
  const userRole = sessionClaims?.unsafeMetadata?.role || 
                   sessionClaims?.metadata?.role || 
                   'alumni';

  // Check admin access for admin routes
  if (isAdminRoute(req)) {
    if (userRole !== 'admin') {
      // Redirect non-admin users to dashboard with error
      const dashboardUrl = new URL('/dashboard', req.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      dashboardUrl.searchParams.set('message', 'Admin access required');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Check alumni access for alumni routes (admin can also access)
  if (isAlumniRoute(req)) {
    if (userRole !== 'alumni' && userRole !== 'admin') {
      const dashboardUrl = new URL('/dashboard', req.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      dashboardUrl.searchParams.set('message', 'Alumni access required');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Add comprehensive user info to headers for API routes
  if (pathname.startsWith('/api/') && userId) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-session-id', sessionClaims?.sid || '');
    
    // Add database user ID if available
    if (sessionClaims?.unsafeMetadata?.databaseId) {
      requestHeaders.set('x-database-user-id', sessionClaims.unsafeMetadata.databaseId);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};