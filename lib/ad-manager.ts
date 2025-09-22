interface AdSlot {
  id: string
  name: string
  htmlContent: string
  isActive: boolean
  position: 'header' | 'footer' | 'sidebar' | 'hero-bottom' | 'content-top' | 'game-details-bottom' | 'content-bottom' | 'recommendations-top'
  createdAt: string
  updatedAt: string
}

class AdManager {
  private ads: AdSlot[] = []

  constructor() {
    // No client-side initialization needed
  }

  private dispatchUpdateEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adsUpdated'))
    }
  }

  private async loadFromAPI(): Promise<AdSlot[]> {
    try {
      const response = await fetch('/api/ads')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading ads:', error)
    }
    return []
  }

  // saveAds is now handled by API

  async getAllAds(): Promise<AdSlot[]> {
    // For admin purposes, use the admin API directly
    try {
      const response = await fetch('/api/admin/ads')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading ads from admin API:', error)
    }
    return []
  }

  async getActiveAds(position?: 'header' | 'footer' | 'sidebar' | 'hero-bottom' | 'content-top' | 'game-details-bottom' | 'content-bottom' | 'recommendations-top'): Promise<AdSlot[]> {
    const ads = await this.loadFromAPI()
    return ads.filter(ad => {
      const isActive = ad.isActive
      const matchesPosition = position ? ad.position === position : true
      return isActive && matchesPosition
    })
  }

  async getAdById(id: string): Promise<AdSlot | undefined> {
    const ads = await this.loadFromAPI()
    return ads.find(ad => ad.id === id)
  }

  async createAd(adData: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSlot | null> {
    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData)
      })
      if (response.ok) {
        const created = await response.json()
        this.dispatchUpdateEvent()
        return created
      }
    } catch (error) {
      console.error('Error creating ad:', error)
    }
    return null
  }

  async updateAd(id: string, updates: Partial<Omit<AdSlot, 'id' | 'createdAt'>>): Promise<AdSlot | null> {
    try {
      const response = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: id, updates })
      })
      if (response.ok) {
        const updated = await response.json()
        this.dispatchUpdateEvent()
        return updated
      }
    } catch (error) {
      console.error('Error updating ad:', error)
    }
    return null
  }

  async deleteAd(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/ads?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error deleting ad:', error)
      return false
    }
  }

  async toggleAdStatus(id: string): Promise<AdSlot | null> {
    const ad = await this.getAdById(id)
    if (!ad) return null
    
    return await this.updateAd(id, { isActive: !ad.isActive })
  }

  resetToDefaultAds(): void {
    this.ads = [
      {
        id: 'header-banner',
        name: 'Header Banner',
        htmlContent: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 20px; border-radius: 8px;"><h3 style="margin: 0 0 10px 0;">🎮 Welcome to GAMES Platform!</h3><p style="margin: 0;">Discover thousands of free games - Play instantly in your browser</p></div>',
        isActive: true,
        position: 'header',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'hero-bottom-ad',
        name: 'Hero Bottom Advertisement',
        htmlContent: '<div style="background: linear-gradient(45deg, #ff9a56 0%, #ff6b95 100%); color: white; text-align: center; padding: 24px; border-radius: 12px; box-shadow: 0 4px 15px rgba(255, 107, 149, 0.3);"><h3 style="margin: 0 0 12px 0; font-size: 1.5rem;">🌟 Featured Game Spotlight!</h3><p style="margin: 0 0 16px 0; opacity: 0.9;">Try the hottest games trending now</p><div style="display: inline-block; background: white; color: #ff6b95; padding: 8px 20px; border-radius: 25px; font-weight: bold; text-decoration: none; cursor: pointer;">Play Now</div></div>',
        isActive: true,
        position: 'hero-bottom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'content-top-ad',
        name: 'Content Top Advertisement',
        htmlContent: '<div style="background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%); color: white; text-align: center; padding: 20px; border-radius: 10px; margin: 16px 0;"><h3 style="margin: 0 0 8px 0; font-size: 1.3rem;">⚡ Gaming News & Updates</h3><p style="margin: 0; opacity: 0.95; font-size: 0.9rem;">Stay updated with the latest gaming trends and releases</p></div>',
        isActive: true,
        position: 'content-top',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'game-details-bottom-ad',
        name: 'Game Details Bottom Ad',
        htmlContent: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 24px; border-radius: 12px; margin: 20px 0;"><h3 style="margin: 0 0 12px 0; font-size: 1.4rem;">🎯 More Games Like This</h3><p style="margin: 0 0 16px 0; opacity: 0.9;">Discover similar games you might enjoy</p><div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 24px; border-radius: 25px; font-weight: bold; border: 2px solid rgba(255,255,255,0.3);">Browse Games</div></div>',
        isActive: true,
        position: 'game-details-bottom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'content-bottom-ad',
        name: 'Content Bottom Advertisement',
        htmlContent: '<div style="background: linear-gradient(45deg, #2196F3 0%, #21CBF3 100%); color: white; text-align: center; padding: 20px; border-radius: 10px; margin: 16px 0;"><h3 style="margin: 0 0 8px 0; font-size: 1.2rem;">🚀 Join Our Gaming Community</h3><p style="margin: 0; opacity: 0.95; font-size: 0.9rem;">Connect with millions of gamers worldwide</p></div>',
        isActive: true,
        position: 'content-bottom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sidebar-ad',
        name: 'Sidebar Advertisement',
        htmlContent: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px; border-radius: 8px; margin: 8px 0;"><h4 style="margin: 0 0 8px 0; font-size: 1.1rem;">📢 Special Offer!</h4><p style="margin: 0 0 12px 0; font-size: 0.85rem; opacity: 0.9;">Get premium gaming experience</p><div style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold;">Learn More</div></div>',
        isActive: true,
        position: 'sidebar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    // saveAds is now handled by API
  }

  validateHtmlContent(content: string): { isValid: boolean; message?: string } {
    // 基本的HTML验证
    if (!content.trim()) {
      return { isValid: false, message: 'Ad content cannot be empty' }
    }

    // 允许的广告网络域名
    const trustedAdDomains = [
      'googlesyndication.com',
      'google.com',
      'doubleclick.net',
      'media.net',
      'propellerads.com',
      'revenuecpmgate.com',
      'adsystem.com',
      'googletagmanager.com',
      'googletagservices.com',
      'highperformanceformat.com'
    ]

    // 检查脚本标签
    const scriptMatches = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi)
    if (scriptMatches) {
      for (const script of scriptMatches) {
        // 检查是否有 src 属性
        const srcMatch = script.match(/src\s*=\s*["']([^"']+)["']/i)
        if (srcMatch) {
          const src = srcMatch[1]
          // 检查是否来自可信域名
          const isFromTrustedDomain = trustedAdDomains.some(domain => 
            src.includes(domain) || src.includes(`//${domain}`) || src.includes(`https://${domain}`)
          )
          if (!isFromTrustedDomain) {
            return { isValid: false, message: `Script from untrusted domain: ${src}` }
          }
        } else {
          // 检查内联脚本是否安全（只包含配置变量，不包含危险代码）
          const scriptContent = script.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          
          // Debug: 记录脚本内容用于调试
          if (process.env.NODE_ENV === 'development') {
            console.log('[Ad Validation] Inline script content:', JSON.stringify(scriptContent))
          }
          
          // 允许的内联脚本模式（广告配置变量）
          const safeInlinePatterns = [
            /^\s*atOptions\s*=\s*\{[\s\S]*\}\s*;?\s*$/im,  // atOptions配置
            /^\s*var\s+\w+\s*=\s*\{[\s\S]*\}\s*;?\s*$/im, // var声明配置
            /^\s*window\.\w+\s*=\s*\{[\s\S]*\}\s*;?\s*$/im, // window属性配置
            /^\s*(var\s+)?\w+\s*=\s*\{[\s\S]*\}\s*;?\s*$/im // 通用配置变量
          ]
          
          const isSafeInline = safeInlinePatterns.some(pattern => {
            const matches = pattern.test(scriptContent)
            if (process.env.NODE_ENV === 'development') {
              console.log('[Ad Validation] Pattern test:', pattern.toString(), '-> matches:', matches)
            }
            return matches
          })
          
          if (!isSafeInline) {
            return { isValid: false, message: `Inline script contains potentially unsafe code. Content: ${scriptContent.substring(0, 100)}...` }
          }
        }
      }
    }

    // 检查其他危险模式
    const dangerousPatterns = [
      /javascript:/gi,
      /\son\w+\s*=/gi  // 修复：确保on前面有空格或属性分隔符，避免匹配options等词汇
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        return { isValid: false, message: 'Ad content contains potentially unsafe elements' }
      }
    }

    return { isValid: true }
  }

  // Methods for AdSlot component compatibility
  async getAdSlot(position: string): Promise<{ id: string; position: string; content: string; enabled: boolean; createdAt: string; updatedAt: string } | null> {
    const ads = await this.loadFromAPI()
    const ad = ads.find(a => a.position === position && a.isActive)
    if (!ad) return null
    
    return {
      id: ad.id,
      position: ad.position,
      content: ad.htmlContent,
      enabled: ad.isActive,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt
    }
  }

  trackImpression(position: string): void {
    console.log(`Ad impression tracked for position: ${position}`)
    // In a real application, you would send this to analytics
  }

  trackClick(position: string): void {
    console.log(`Ad click tracked for position: ${position}`)
    // In a real application, you would send this to analytics
  }

  isValidPosition(position: string): boolean {
    const validPositions = ['header', 'footer', 'sidebar', 'hero-bottom', 'content-top', 'game-details-bottom', 'content-bottom', 'recommendations-top']
    return validPositions.includes(position)
  }

  // Add missing methods for components
  async toggleAd(adId: string, isActive: boolean): Promise<boolean> {
    const result = await this.updateAd(adId, { isActive })
    return result !== null
  }

  // Alias methods for backward compatibility
  async addAdSlot(adData: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSlot | null> {
    return this.createAd(adData)
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    return await this.deleteAd(id)
  }

  async updateAdSlot(id: string, updates: any): Promise<AdSlot | null> {
    // Map enabled to isActive for compatibility
    const mappedUpdates = { ...updates }
    if ('enabled' in updates) {
      mappedUpdates.isActive = updates.enabled
      delete mappedUpdates.enabled
    }
    if ('content' in updates) {
      mappedUpdates.htmlContent = updates.content
      delete mappedUpdates.content
    }
    
    return await this.updateAd(id, mappedUpdates)
  }

  // Additional methods for test compatibility
  async getAllAdSlots(): Promise<AdSlot[]> {
    return await this.getAllAds()
  }

  async getActiveAdSlots(position?: string): Promise<Array<{ id: string; position: string; enabled: boolean; content: string; createdAt: string; updatedAt: string }>> {
    const activeAds = await this.getActiveAds(position as any)
    return activeAds.map(ad => ({
      id: ad.id,
      position: ad.position,
      enabled: ad.isActive,
      content: ad.htmlContent,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt
    }))
  }
}

export const adManager = new AdManager()
export type { AdSlot }
