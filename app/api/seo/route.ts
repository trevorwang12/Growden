import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DEFAULT_SEO = {
  seoSettings: {
    siteName: 'Growden.io Free Play Grow A Garden',
    siteDescription: 'Grow a Garden in Growden.io! You can grow a garden of your dreams and unlock pets to help you grow a garden.',
    siteKeywords: 'Growden, browser games, free games, HTML5 games, casual games',
    siteAuthor: 'Growden.io Team',
    ogImage: '/og-image.png',
    twitterCard: 'summary_large_image',
    favicon: '/favicon.ico'
  }
}

async function loadFromFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seo-settings.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.log('Failed to load SEO data from file, using default:', error)
    return DEFAULT_SEO
  }
}

export async function GET() {
  try {
    const seoData = await loadFromFile()
    return NextResponse.json(seoData)
  } catch (error) {
    console.error('Error fetching SEO data:', error)
    return NextResponse.json(DEFAULT_SEO, { status: 200 })
  }
}
