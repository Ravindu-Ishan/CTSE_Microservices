import { NextResponse } from 'next/server';
import { asgardeo } from '@asgardeo/nextjs/server';
import type { UserRole } from '@/lib/types/user';

export const dynamic = 'force-dynamic';

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') return [v];
  return [];
}

function extractRole(claims: Record<string, unknown>): UserRole | null {
  // Collect all values from every claims field that could carry role/group info
  const all = [
    ...toArr(claims?.roles),
    ...toArr(claims?.['http://wso2.org/claims/roles']),
    ...toArr(claims?.groups),
  ];
  if (all.some((v) => ['ADMIN', 'admin', 'OTS_ADMIN'].includes(v))) return 'ADMIN';
  if (all.some((v) => ['STAFF', 'OTS_STAFF'].includes(v))) return 'STAFF';
  if (all.some((v) => ['END_USER', 'OTS_END_USER'].includes(v))) return 'END_USER';
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
