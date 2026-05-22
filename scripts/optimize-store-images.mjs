/**
 * Genera WebP optimizados para la galería del Store (thumbs + full).
 * Ejecutar: node scripts/optimize-store-images.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const THUMB_WIDTH = 360
const FULL_WIDTH = 1200

const jobs = [
  { src: 'public/Poster', thumb: 'public/Poster/thumbs', full: 'public/Poster/full' },
  { src: 'public/stiker', thumb: 'public/stiker/thumbs', full: 'public/stiker/full' },
]

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function optimizeFile(srcPath, thumbPath, fullPath) {
  const input = sharp(srcPath)
  const meta = await input.metadata()
  const baseKb = Math.round((await fs.promises.stat(srcPath)).size / 1024)

  await sharp(srcPath)
    .rotate()
    .resize(THUMB_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 80, effort: 4 })
    .toFile(thumbPath)

  await sharp(srcPath)
    .rotate()
    .resize(FULL_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 85, effort: 4 })
    .toFile(fullPath)

  const thumbKb = Math.round((await fs.promises.stat(thumbPath)).size / 1024)
  const fullKb = Math.round((await fs.promises.stat(fullPath)).size / 1024)
  console.log(
    `${path.basename(srcPath)}: ${baseKb}KB PNG → thumb ${thumbKb}KB / full ${fullKb}KB WebP (${meta.width}×${meta.height})`,
  )
}

async function run() {
  for (const job of jobs) {
    const srcDir = path.join(root, job.src)
    const thumbDir = path.join(root, job.thumb)
    const fullDir = path.join(root, job.full)
    await ensureDir(thumbDir)
    await ensureDir(fullDir)

    const files = (await fs.promises.readdir(srcDir)).filter((f) => f.endsWith('.png'))
    for (const file of files) {
      const base = file.replace(/\.png$/i, '')
      await optimizeFile(
        path.join(srcDir, file),
        path.join(thumbDir, `${base}.webp`),
        path.join(fullDir, `${base}.webp`),
      )
    }
  }
  console.log('Listo: thumbs y full WebP generados.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
