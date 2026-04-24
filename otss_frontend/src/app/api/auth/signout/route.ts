import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { asgardeo } from '@asgardeo/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const client = await asgardeo();
    const sessionId = await client.getSessionId();

    if (sessionId) {
      const accessToken = await client.getAccessToken(sessionId);

      if (accessToken) {
        const wso2BaseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL;
        const clientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID;
        const clientSecret = process.env.ASGARDEO_CLIENT_SECRET;

        // Revoke the access token server-side so WSO2 invalidates it immediately
        await fetch(`${wso2BaseUrl}/oauth2/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: accessToken,
            token_type_hint: 'access_token',
            client_id: clientId ?? '',
            client_secret: clientSecret ?? '',
          }),
        });

        console.log('[/api/auth/signout] Access token revoked');
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const wso2BaseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL;
    const clientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID;

    const logoutUrl = `${wso2BaseUrl}/oidc/logout?${new URLSearchParams({
      post_logout_redirect_uri: appUrl,
      client_id: clientId ?? '',
      state: 'sign_out_success',
    })}`;

    // Clear all Asgardeo session cookies so the SDK no longer sees the user as signed in
    const cookieStore = await cookies();
    const response = NextResponse.json({ logoutUrl });
    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.toLowerCase().includes('asgardeo') || cookie.name.toLowerCase().includes('session')) {
        response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
        console.log(`[/api/auth/signout] Cleared cookie: ${cookie.name}`);
      }
    });

    return response;
  } catch (err) {
    console.error('[/api/auth/signout] Error:', err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return NextResponse.json({ logoutUrl: appUrl });
  }
}
