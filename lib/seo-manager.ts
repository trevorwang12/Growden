import { sanitizeInput } from './security'

export interface SEOSettings {
  id: string
  siteName: string
  siteDescription: string
  siteUrl: string
  siteLogo: string
  favicon: string
  keywords: string[]
  author: string
  twitterHandle?: string
  ogImage: string
  ogTitle?: string
  ogDescription?: string
  robotsTxt: string
  structuredData: {
    enabled: boolean
    organizationType: 'Organization' | 'WebSite' | 'LocalBusiness'
    organizationName?: string
    organizationUrl?: string
    organizationLogo?: string
    sameAs?: string[]
  }
  googleAnalyticsId?: string
  googleAnalyticsTrackingCode?: string
  googleSearchConsoleId?: string
  googleSearchConsoleHtmlTag?: string
  bingWebmasterToolsId?: string
  yandexWebmasterToolsId?: string
  baiduWebmasterToolsId?: string
  customHeadTags?: string
  metaTags: {
    viewport: string
    themeColor: string
    msapplicationTileColor?: string
    appleMobileWebAppTitle?: string
    appleMobileWebAppCapable?: string
  }
  canonicalUrl?: string
  alternateLanguages?: Array<{
    lang: string
    url: string
  }>
  updatedAt: string
  createdAt: string
}

export interface GamePageSEO {
  titleTemplate: string // e.g., "{gameName} - Play Free Online | {siteName}"
  descriptionTemplate: string // e.g., "Play {gameName} for free! {gameDescription} Join thousands of players..."
  keywordsTemplate: string // e.g., "{gameName}, {category}, free game, online game"
  enableBreadcrumbs: boolean
  enableRichSnippets: boolean
  enableOpenGraph: boolean
  enableTwitterCards: boolean
}

export interface CategoryPageSEO {
  titleTemplate: string // e.g., "{categoryName} Games - Free Online | {siteName}"
  descriptionTemplate: string // e.g., "Play the best {categoryName} games for free..."
  keywordsTemplate: string
  enablePagination: boolean
}

class SEOManager {
  private seoSettings: SEOSettings | null = null
  private gamePageSEO: GamePageSEO | null = null
  private categoryPageSEO: CategoryPageSEO | null = null

  constructor() {
    // Initialize with defaults - will be loaded from API when needed
    this.seoSettings = this.getDefaultSEOSettings()
    this.gamePageSEO = this.getDefaultGamePageSEO()
    this.categoryPageSEO = this.getDefaultCategoryPageSEO()
  }

  private dispatchUpdateEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seoSettingsUpdated'))
    }
  }

  private async loadFromAPI(): Promise<{seoSettings: SEOSettings, gamePageSEO: GamePageSEO, categoryPageSEO: CategoryPageSEO}> {
    try {
      const response = await fetch('/api/admin/seo')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error)
    }
    return {
      seoSettings: this.getDefaultSEOSettings(),
      gamePageSEO: this.getDefaultGamePageSEO(),
      categoryPageSEO: this.getDefaultCategoryPageSEO()
    }
  }

  // saveSEOSettings now handled by API

  private getDefaultSEOSettings(): SEOSettings {
    const now = new Date().toISOString()
    return {
      id: 'main-seo-settings',
      siteName: 'GAMES',
      siteDescription: 'Best Online Gaming Platform - Play hundreds of free browser games',
      siteUrl: 'https://yourgamesite.com',
      siteLogo: '/placeholder-logo.png',
      favicon: '/favicon.ico',
      keywords: [
        'online games',
        'browser games',
        'free games',
        'HTML5 games',
        'web games',
        'casual games',
        'arcade games'
      ],
      author: 'Gaming Platform',
      twitterHandle: '@yourgames',
      ogImage: '/og-image.png',
      ogTitle: 'GAMES - Best Free Online Games',
      ogDescription: 'Play the best free online games. No download required!',
      robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://yourgamesite.com/sitemap.xml`,
      structuredData: {
        enabled: true,
        organizationType: 'WebSite',
        organizationName: 'GAMES',
        organizationUrl: 'https://yourgamesite.com',
        organizationLogo: '/placeholder-logo.png',
        sameAs: [
          'https://twitter.com/yourgames',
          'https://facebook.com/yourgames'
        ]
      },
      metaTags: {
        viewport: 'width=device-width, initial-scale=1.0',
        themeColor: '#475569',
        appleMobileWebAppTitle: 'GAMES',
        appleMobileWebAppCapable: 'yes'
      },
      createdAt: now,
      updatedAt: now
    }
  }

  private getDefaultGamePageSEO(): GamePageSEO {
    return {
      titleTemplate: '{gameName} - Play Free Online | {siteName}',
      descriptionTemplate: 'Play {gameName} for free online! {gameDescription} No download required - start playing now!',
      keywordsTemplate: '{gameName}, {category}, free game, online game, browser game',
      enableBreadcrumbs: true,
      enableRichSnippets: true,
      enableOpenGraph: true,
      enableTwitterCards: true
    }
  }

  private getDefaultCategoryPageSEO(): CategoryPageSEO {
    return {
      titleTemplate: '{categoryName} Games - Free Online | {siteName}',
      descriptionTemplate: 'Play the best {categoryName} games for free! Discover hundreds of exciting {categoryName} games.',
      keywordsTemplate: '{categoryName} games, free {categoryName}, online {categoryName}',
      enablePagination: true
    }
  }

  async getSEOSettings(): Promise<SEOSettings | null> {
    const data = await this.loadFromAPI()
    return data.seoSettings
  }

  async getGamePageSEO(): Promise<GamePageSEO | null> {
    const data = await this.loadFromAPI()
    return data.gamePageSEO
  }

  async getCategoryPageSEO(): Promise<CategoryPageSEO | null> {
    const data = await this.loadFromAPI()
    return data.categoryPageSEO
  }

  async updateSEOSettings(settings: Partial<SEOSettings>): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'seoSettings', updates: settings })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error updating SEO settings:', error)
      return false
    }
  }

  async updateGamePageSEO(settings: Partial<GamePageSEO>): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gamePageSEO', updates: settings })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error updating game page SEO:', error)
      return false
    }
  }

  async updateCategoryPageSEO(settings: Partial<CategoryPageSEO>): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'categoryPageSEO', updates: settings })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error updating category page SEO:', error)
      return false
    }
  }

  generateMetaTags(pageType: 'home' | 'game' | 'category', data?: any): string {
    if (!this.seoSettings) return ''
    
    const settings = this.seoSettings
    let tags = []
    
    // Basic meta tags
    tags.push(`<meta name="description" content="${settings.siteDescription}">`)
    tags.push(`<meta name="keywords" content="${settings.keywords.join(', ')}">`)
    tags.push(`<meta name="author" content="${settings.author}">`)
    tags.push(`<meta name="viewport" content="${settings.metaTags.viewport}">`)
    tags.push(`<meta name="theme-color" content="${settings.metaTags.themeColor}">`)
    
    // Open Graph tags
    tags.push(`<meta property="og:site_name" content="${settings.siteName}">`)
    tags.push(`<meta property="og:type" content="website">`)
    tags.push(`<meta property="og:image" content="${settings.siteUrl}${settings.ogImage}">`)
    
    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="summary_large_image">`)
    if (settings.twitterHandle) {
      tags.push(`<meta name="twitter:site" content="${settings.twitterHandle}">`)
    }
    
    // Apple mobile web app tags
    if (settings.metaTags.appleMobileWebAppTitle) {
      tags.push(`<meta name="apple-mobile-web-app-title" content="${settings.metaTags.appleMobileWebAppTitle}">`)
    }
    if (settings.metaTags.appleMobileWebAppCapable) {
      tags.push(`<meta name="mobile-web-app-capable" content="${settings.metaTags.appleMobileWebAppCapable}">`)
    }
    
    return tags.join('\n')
  }

  generateRobotsTxt(): string {
    return this.seoSettings?.robotsTxt || ''
  }

  generateStructuredData(): string {
    if (!this.seoSettings?.structuredData.enabled) return ''
    
    const { structuredData } = this.seoSettings
    
    const schema = {
      "@context": "https://schema.org",
      "@type": structuredData.organizationType,
      "name": structuredData.organizationName || this.seoSettings.siteName,
      "url": structuredData.organizationUrl || this.seoSettings.siteUrl,
      "logo": structuredData.organizationLogo || this.seoSettings.siteLogo,
      "sameAs": structuredData.sameAs || []
    }
    
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
  }

  validateSEOSettings(settings: Partial<SEOSettings>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (settings.siteName && settings.siteName.length < 2) {
      errors.push('Site name must be at least 2 characters long')
    }
    
    if (settings.siteDescription && (settings.siteDescription.length < 50 || settings.siteDescription.length > 160)) {
      errors.push('Site description should be between 50-160 characters')
    }
    
    if (settings.siteUrl && !settings.siteUrl.match(/^https?:\/\/.+/)) {
      errors.push('Site URL must be a valid URL')
    }
    
    if (settings.keywords && settings.keywords.length === 0) {
      errors.push('At least one keyword is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const seoManager = new SEOManager()
