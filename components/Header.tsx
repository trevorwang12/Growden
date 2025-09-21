'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Gamepad2 } from "lucide-react"

interface SEOSettings {
  siteName?: string
  siteDescription?: string
}

export default function Header() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    siteName: 'GAMES',
    siteDescription: 'Best Online Gaming Platform'
  })

  useEffect(() => {
    const loadSEOSettings = async () => {
      try {
        const response = await fetch('/api/seo')
        if (response.ok) {
          const data = await response.json()
          if (data.seoSettings) {
            setSeoSettings({
              siteName: data.seoSettings.siteName || 'GAMES',
              siteDescription: data.seoSettings.siteDescription || 'Best Online Gaming Platform'
            })
          }
        }
      } catch (error) {
        console.log('SEO settings load error:', error)
      }
    }

    loadSEOSettings()

    // 监听SEO设置更新
    const handleSEOUpdate = async () => {
      await loadSEOSettings()
    }

    window.addEventListener('seoSettingsUpdated', handleSEOUpdate)

    return () => {
      window.removeEventListener('seoSettingsUpdated', handleSEOUpdate)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-blue-600" />
            <Link href="/" className="text-lg font-bold text-gray-800 hover:text-blue-600">
              {seoSettings.siteName}
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              Home
            </Link>
            <Link href="/new-games" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              New Games
            </Link>
            <Link href="/hot-games" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              Hot Games
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
