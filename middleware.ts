import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
})

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}