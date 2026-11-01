import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

/** Serves admin-uploaded files stored in <cwd>/data/uploads at /media/<name>.
 *  Keeps uploads independent from the build output so they survive redeploys. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string[] }> },
) {
  const { file } = await params
  const safe = file
    .join('/')
    .replace(/\\/g, '/')
    .split('/')
    .filter((p) => p && p !== '.' && p !== '..')
    .join('/')

  if (!safe) {
    return new NextResponse('Not found', { status: 404 })
  }

  const base = path.join(process.cwd(), 'data', 'uploads')
  const abs = path.resolve(base, safe)
  if (!abs.startsWith(base + path.sep)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const data = await fs.readFile(abs)
    const ext = path.extname(abs).toLowerCase()
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
