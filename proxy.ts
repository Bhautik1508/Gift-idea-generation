import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAdminAuth, getConfiguredAdminCredentials, isAdminPath } from '@/lib/adminAuth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    const result = checkAdminAuth(
      request.headers.get('authorization'),
      getConfiguredAdminCredentials()
    );
    if (!result.ok) {
      const body =
        result.status === 503
          ? 'Admin is not configured on this deployment.'
          : 'Authentication required.';
      return new NextResponse(body, { status: result.status, headers: result.headers });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
