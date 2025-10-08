import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'


export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // console.log('middleware just ran')

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/sign-up'

  // We don't wanna get the user everytime we update the session on the
  // middleware. Only get it if
  //   A) you're trying to log in or sign up afetr having logged in, or
  //   B) you're going to home route and don't have any notes yet (no search
  //      params)
  if (isAuthRoute) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('Trying to hit login or signup after having logged in; redirecting to home')
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SUPABASE_URL))
    }
  }

  const { searchParams, pathname } = new URL(request.url)
  if (!searchParams.get('noteId') && pathname === '/') {
    const { data: { user } } = await supabase.auth.getUser()
    // There's no known id in the search params, and we're on the home screen, and
    // there's a user, we need to set a note id (if they have any node id, load
    // the most recent one, else load a new note).
    if (user) {
      // You can't use prisma in middleware bc Next operates in an Edge
      // environment which is different than a typical NodeJS environment.
      const { newestNoteId } = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/fetch-newest-note?userId=${user.id}`)
        .then(res => res.json())

      if (newestNoteId) {
        const url = request.nextUrl.clone()
        url.searchParams.set('noteId', newestNoteId)
        return NextResponse.redirect(url)
      } else {
        const { noteId } = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/create-new-note?userId=${user.id}`,
          {
            method: 'POST',
            headers: {
              "Content-Type": 'application/json'
            }
          }
        ).then(res => res.json())
        const url = request.nextUrl.clone()
        url.searchParams.set('noteId', noteId)
        return NextResponse.redirect(url)
      }
    }
  }
  return supabaseResponse
}