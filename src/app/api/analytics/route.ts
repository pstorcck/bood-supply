import { NextRequest, NextResponse } from 'next/server'

const PROPERTY_ID = '531329134'

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const headerB64 = encode(header)
  const payloadB64 = encode(payload)
  const signingInput = `${headerB64}.${payloadB64}`
  const privateKeyPem = serviceAccount.private_key
  const keyData = privateKeyPem.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\n/g, '')
  const binaryKey = Buffer.from(keyData, 'base64')
  const cryptoKey = await crypto.subtle.importKey('pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, Buffer.from(signingInput))
  const signatureB64 = Buffer.from(signature).toString('base64url')
  const jwt = `${signingInput}.${signatureB64}`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

async function runReport(accessToken: string, body: any) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function runRealtimeReport(accessToken: string, body: any) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!keyBase64) return NextResponse.json({ error: 'No service account key' }, { status: 500 })
    const serviceAccount = JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf8'))
    const accessToken = await getAccessToken(serviceAccount)
    const dateRange = [{ startDate: '30daysAgo', endDate: 'today' }]
    const [usuariosData, paginasData, paisesData, dispositivosData, canalesData, sesionesData, realtimeData] = await Promise.all([
      runReport(accessToken, { dateRanges: dateRange, dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
      runReport(accessToken, { dateRanges: dateRange, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 10 }),
      runReport(accessToken, { dateRanges: dateRange, dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 10 }),
      runReport(accessToken, { dateRanges: dateRange, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }] }),
      runReport(accessToken, { dateRanges: dateRange, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 8 }),
      runReport(accessToken, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }, { startDate: '60daysAgo', endDate: '31daysAgo' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'newUsers' }] }),
      runRealtimeReport(accessToken, { dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }] }),
    ])
    return NextResponse.json({ usuariosData, paginasData, paisesData, dispositivosData, canalesData, sesionesData, realtimeData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
// force rebuild Mon Apr  6 14:58:12 CST 2026
