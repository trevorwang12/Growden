import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT_DIR = path.resolve('public')
const VALID_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else {
      yield fullPath
    }
  }
}

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const tmpPath = `${filePath}.tmp`
  const image = sharp(filePath, { failOnError: false })

  switch (ext) {
    case '.png':
      await image.png({ quality: 80, compressionLevel: 9, adaptiveFiltering: true }).toFile(tmpPath)
      break
    case '.jpg':
    case '.jpeg':
      await image.jpeg({ quality: 80, mozjpeg: true }).toFile(tmpPath)
      break
    case '.webp':
      await image.webp({ quality: 75 }).toFile(tmpPath)
      break
    default:
      return
  }

  await fs.rename(tmpPath, filePath)
}

async function main() {
  for await (const filePath of walk(ROOT_DIR)) {
    const ext = path.extname(filePath).toLowerCase()
    if (!VALID_EXT.has(ext)) continue

    try {
      await compressFile(filePath)
      console.log(`Compressed: ${path.relative(process.cwd(), filePath)}`)
    } catch (err) {
      console.warn(`Skip ${filePath}:`, err.message)
      try {
        await fs.unlink(`${filePath}.tmp`)
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
