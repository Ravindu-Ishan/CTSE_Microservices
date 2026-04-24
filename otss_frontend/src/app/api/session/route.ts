import { NextResponse } from 'next/server';
import { asgardeo } from '@asgardeo/nextjs/server';
import type { UserRole } from '@/lib/types/user';

export const dynamic = 'force-dynamic';

function extractRole(claims: Record<string, unknown>): UserRole | null {
  const raw = claims?.roles ?? claims?.['http://wso2.org/claims/roles'] ?? claims?.groups;
  const arr = (Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []) as string[];
  // Direct role names (if WSO2 returns them directly)
  if (arr.includes('ADMIN') || arr.includes('admin')) return 'ADMIN';
  if (arr.includes('STAFF') || arr.includes('OTS_STAFF')) return 'STAFF';
  if (arr.includes('END_USER') || arr.includes('OTS_END_USER')) return 'END_USER';
  return null;
}

export async function GET() {
  try {
    const client = await asgardeo();
    const sessionId = await client.getSessionId();

    if (!sessionId) {
      console.log('[/api/session] No active session');
      return NextResponse.json({ isSignedIn: false });
    }

    const accessToken = await client.getAccessToken(sessionId);

    // Use the OIDC userinfo endpoint — the standard way to get user claims.
    // WSO2 validates the access token and returns the claims it has for this user.
    const wso2BaseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL;
    if (!wso2BaseUrl) throw new Error('NEXT_PUBLIC_ASGARDEO_BASE_URL is not set');

    // Strip /oauth2/token suffix if present — the base URL is the issuer for SDK discovery,
    // but the userinfo endpoint lives at the host root /oauth2/userinfo.
    const userInfoRes = await fetch(`${wso2BaseUrl}/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      console.error(`[/api/session] userinfo endpoint returned ${userInfoRes.status}`);
      return NextResponse.json({ isSignedIn: false });
    }

    const claims = await userInfoRes.json() as Record<string, unknown>;
    console.log('[/api/session] userinfo claims:', JSON.stringify(claims));

    const role = extractRole(claims);
    const email = String(claims?.email ?? '');
    const displayName = String(claims?.preferred_username ?? claims?.username ?? claims?.sub ?? email);

    console.log(`[/api/session] Resolved — email=${email} role=${role} displayName=${displayName}`);

    return NextResponse.json({ isSignedIn: true, accessToken, role, email, displayName });
  } catch (err) {
    console.error('[/api/session] Error:', err);
    return NextResponse.json({ isSignedIn: false });
  }
}
