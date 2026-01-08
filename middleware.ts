import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/error-404') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images');

  // ============================================
  // 1. Redirect unauthenticated users to signin
  // ============================================
  if (!user && !isPublicPath) {
    const redirectUrl = new URL('/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================
  // 2. Handle authenticated users
  // ============================================
  if (user) {
    // Get user profile to check role and onboarding status in ONE query
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role;

    // Check onboarding status (single query)
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('id, status, current_step')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Returns null if no case exists

    // ============================================
    // 2a. Redirect authenticated users away from auth pages
    // ============================================
    if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      if (onboardingCase?.status === 'approved') {
        // Onboarding complete, redirect to dashboard
        return NextResponse.redirect(new URL('/', req.url));
      } else {
        // Onboarding not complete, redirect to onboarding start
        return NextResponse.redirect(new URL('/onboarding/start', req.url));
      }
    }

    // ============================================
    // 2b. Allow admin users to access admin dashboard without onboarding
    // ============================================
    if (userRole === 'owner' && pathname.startsWith('/admin')) {
      // Admins can access admin routes even without approved onboarding
      return res;
    }

    // ============================================
    // 2c. Enforce mandatory onboarding for non-onboarding routes
    // ============================================
    if (!pathname.startsWith('/onboarding')) {
      // Case 1: User has incomplete onboarding (draft, in_progress, requires_update)
      if (
        onboardingCase &&
        ['draft', 'in_progress', 'requires_update'].includes(onboardingCase.status)
      ) {
        // Redirect to current step or start
        const resumePath = onboardingCase.current_step
          ? `/onboarding/${onboardingCase.current_step}`
          : '/onboarding/start';
        return NextResponse.redirect(new URL(resumePath, req.url));
      }

      // Case 2: User has pending_review case (waiting for admin approval)
      if (onboardingCase?.status === 'pending_review') {
        // Allow them to view the complete page showing their submission status
        return NextResponse.redirect(new URL('/onboarding/complete', req.url));
      }

      // Case 3: User has rejected case
      if (onboardingCase?.status === 'rejected') {
        // Show them the complete page with rejection message
        return NextResponse.redirect(new URL('/onboarding/complete', req.url));
      }

      // Case 4: User has approved case
      if (onboardingCase?.status === 'approved') {
        // Allow access to dashboard - onboarding is complete
        return res;
      }

      // Case 5: User has no onboarding case at all (new user)
      if (!onboardingCase) {
        // New user - redirect to start onboarding
        return NextResponse.redirect(new URL('/onboarding/start', req.url));
      }

      // Fallback: if we somehow get here, redirect to onboarding start
      return NextResponse.redirect(new URL('/onboarding/start', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
