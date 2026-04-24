import { NextRequest } from 'next/server';
import { asgardeoMiddleware, createRouteMatcher } from '@asgardeo/nextjs/middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/staff(.*)',
  '/admin(.*)',
]);

export default asgardeoMiddleware(async (asgardeo, req: NextRequest) => {
  const url = req.nextUrl;
  const hasCode = url.searchParams.has('code');
  const hasState = url.searchParams.has('state');
  const isSignedIn = asgardeo.isSignedIn();

  console.log(`[Asgardeo] ${req.method} ${url.pathname} | signedIn=${isSignedIn} | oauthCallback=${hasCode && hasState}`);

  if (hasCode && hasState) {
    console.log(`[Asgardeo] OAuth callback detected on ${url.pathname} — code exchange will be handled client-side`);
  }

  if (isProtectedRoute(req)) {
    console.log(`[Asgardeo] Protected route: ${url.pathname} | signedIn=${isSignedIn}`);
    if (!isSignedIn) {
      console.log(`[Asgardeo] Unauthenticated — redirecting to /auth/login`);
    }
    const result = await asgardeo.protectRoute({ redirect: '/auth/login' });
    if (result) return result;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
