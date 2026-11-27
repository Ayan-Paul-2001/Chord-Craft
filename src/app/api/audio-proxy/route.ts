import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import net from 'net';
import { extractGoogleDriveId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ALLOWED_AUDIO_HOST_SUFFIXES = [
  'drive.google.com',
  'docs.google.com',
  'drive.usercontent.google.com',
  'googleusercontent.com',
  'res.cloudinary.com',
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'dl.dropboxusercontent.com',
  'cdn.pixabay.com',
  'soundcloud.com',
];

function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true; // 0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8
    if (a === 169 && b === 254) return true; // Link-local / Cloud Metadata (169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
    if (a >= 224) return true; // Multicast & reserved
    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80') ||
      lower.startsWith('::ffff:')
    ) {
      return true;
    }
    return false;
  }

  return true;
}

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  if (!lower || lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) {
    return false;
  }
  if (net.isIP(lower)) {
    return false;
  }
  return ALLOWED_AUDIO_HOST_SUFFIXES.some(
    (suffix) => lower === suffix || lower.endsWith(`.${suffix}`)
  );
}

async function validateSafeAudioUrl(rawUrl: string): Promise<URL | null> {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    if (!isAllowedHost(parsed.hostname)) return null;

    // Resolve DNS and reject any private/loopback/metadata IP (prevents DNS rebinding SSRF)
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    if (!addresses.length) return null;
    for (const addr of addresses) {
      if (isPrivateOrReservedIp(addr.address)) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let targetUrl = decodeURIComponent(rawUrl).trim();

    // Normalize Google Drive share link to direct download endpoint
    const gdriveId = extractGoogleDriveId(targetUrl);
    if (gdriveId) {
      targetUrl = `https://docs.google.com/uc?export=download&id=${gdriveId}`;
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const rangeHeader = req.headers.get('range');
    if (rangeHeader && /^bytes=\d*-\d*$/.test(rangeHeader.trim())) {
      headers['Range'] = rangeHeader.trim();
    }

    // Manually validate every redirect hop (max 3) to prevent SSRF redirect bypasses
    let currentUrl = targetUrl;
    let response: Response | null = null;

    for (let hop = 0; hop < 4; hop++) {
      const safeParsed = await validateSafeAudioUrl(currentUrl);
      if (!safeParsed) {
        return NextResponse.json(
          { error: 'Blocked: Audio URL host is not allowed or failed security validation.' },
          { status: 403 }
        );
      }

      const res = await fetch(safeParsed.toString(), {
        headers,
        redirect: 'manual',
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) {
          return NextResponse.json({ error: 'Invalid redirect from audio host' }, { status: 502 });
        }
        currentUrl = new URL(location, safeParsed).toString();
        continue;
      }

      response = res;
      break;
    }

    if (!response) {
      return NextResponse.json({ error: 'Too many redirects from audio source' }, { status: 502 });
    }

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        { error: `Audio source returned status ${response.status}` },
        { status: response.status }
      );
    }

    const rawContentType = (response.headers.get('content-type') || 'audio/mpeg').toLowerCase();
    // Never proxy executable HTML/JS documents through the audio endpoint
    if (rawContentType.includes('text/html') || rawContentType.includes('javascript')) {
      return NextResponse.json(
        { error: 'Target resource is not a streamable audio file.' },
        { status: 415 }
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', rawContentType.startsWith('audio/') || rawContentType.includes('octet-stream') ? rawContentType : 'audio/mpeg');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Cache-Control', 'private, max-age=3600');

    const contentLength = response.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = response.headers.get('content-range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new NextResponse(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to stream audio' },
      { status: 500 }
    );
  }
}
