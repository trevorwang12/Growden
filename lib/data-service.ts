// 统一数据服务 - 消除重复的文件读取逻辑
// "Bad programmers worry about the code. Good programmers worry about data structures." - Linus

import { promises as fs } from 'fs'
import path from 'path'

export class DataService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_TTL = 300000 // 5 minutes cache - 载荷优化：延长缓存时间

  // 轻量级游戏列表缓存 - 只包含必要字段
  private static lightGamesCache: any[] | null = null
  private static lightGamesCacheTime = 0

  // 核心方法：统一的文件读取和缓存
  private static async loadFromFile<T>(
    fileName: string, 
    defaultValue: T
  ): Promise<T> {
    const filePath = path.join(process.cwd(), 'data', fileName)
    const cacheKey = fileName
    
    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      
      // 更新缓存
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.warn(`Failed to load ${fileName}, using default:`, error)
      return defaultValue
    }
  }

  // 写入文件
  private static async saveToFile<T>(fileName: string, data: T): Promise<void> {
    const filePath = path.join(process.cwd(), 'data', fileName)
    const dirPath = path.dirname(filePath)
    
    // 确保目录存在
    await fs.mkdir(dirPath, { recursive: true })
    
    // 写入文件
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    
    // 清除缓存
    this.cache.delete(fileName)
  }

  // 具体的数据访问方法
  static async getHomepageContent() {
    const defaultContent = {
      hero: { isVisible: false, title: "GAMES", subtitle: "Best Online Gaming Platform", backgroundGradient: "from-blue-500 to-purple-600" },
      featuredGame: { isVisible: true, showPlayButton: true },
      newGames: { isVisible: true, title: "New Games", limit: 8, showViewAllButton: true },
      features: { isVisible: false, title: "Why Play With Us", sections: {} },
      whatIs: { isVisible: false, title: "What is Our Gaming Platform?", content: {} },
      howToPlay: { isVisible: false, title: "How to Get Started", steps: {} },
      whyChooseUs: { isVisible: false, title: "Why Choose Our Platform?", premiumSection: {}, communitySection: {} },
      faq: { isVisible: false, title: "Frequently Asked Questions", questions: [] },
      youMightAlsoLike: { isVisible: true },
      customHtmlSections: [],
      sectionOrder: { featuredGame: 0, newGames: 1, features: 2, whatIs: 3, howToPlay: 4, whyChooseUs: 5, faq: 6, youMightAlsoLike: 7 }
    }
    
    return this.loadFromFile('homepage-content.json', defaultContent)
  }

  static async saveHomepageContent(content: any) {
    return this.saveToFile('homepage-content.json', content)
  }

  static async getAds() {
    return this.loadFromFile<any[]>('ads.json', [])
  }

  static async saveAds(ads: any[]) {
    return this.saveToFile('ads.json', ads)
  }

  static async getGames() {
    return this.loadFromFile<any[]>('games.json', [])
  }

  static async getAllGames() {
    return this.getGames()
  }

  // 新增：轻量级游戏列表，只返回必要字段
  static async getLightweightGames(): Promise<any[]> {
    const now = Date.now()

    // 检查轻量级缓存
    if (this.lightGamesCache && now - this.lightGamesCacheTime < this.CACHE_TTL) {
      return this.lightGamesCache
    }

    const allGames = await this.getAllGames()

    // 只保留展示所需的最小字段集
    this.lightGamesCache = allGames.map(game => ({
      id: game.id,
      name: game.name,
      thumbnailUrl: game.thumbnailUrl,
      category: game.category,
      tags: game.tags?.slice(0, 3), // 只保留前3个标签
      rating: game.rating,
      viewCount: game.viewCount || game.views || 0,
      addedDate: game.addedDate,
      isActive: game.isActive,
      isFeatured: game.isFeatured
    }))

    this.lightGamesCacheTime = now
    return this.lightGamesCache
  }

  // 新增：单个游戏详情（按需加载）
  static async getGameById(gameId: string): Promise<any | null> {
    const allGames = await this.getAllGames()
    return allGames.find(game => game.id === gameId) || null
  }

  static async getFeaturedGames(): Promise<any[]> {
    const defaultFeatured: any[] = []
    return this.loadFromFile('featured-games.json', defaultFeatured)
  }

  static async getCategories() {
    return this.loadFromFile<any[]>('categories.json', [])
  }

  static async getSeoSettings() {
    const defaultSettings = {
      seoSettings: {
        siteName: 'Growden.io Free Play Grow A Garden',
        siteDescription: 'Grow a Garden in Growden.io! You can grow a garden of your dreams and unlock pets to help you grow a garden.',
        siteUrl: 'https://growden.net',
        siteLogo: '/favicon.svg',
        favicon: '/favicon.ico',
        keywords: ['Growden', 'browser games', 'free games', 'HTML5 games', 'casual games'],
        author: 'Growden.io',
        twitterHandle: '@growden',
        ogImage: '/og-image.png',
        ogTitle: 'Growden.io Free Play Grow A Garden',
        ogDescription: 'Grow a Garden in Growden.io! Play free online games.',
        metaTags: {
          viewport: 'width=device-width, initial-scale=1.0',
          themeColor: '#475569'
        }
      }
    }
    
    return this.loadFromFile('seo-settings.json', defaultSettings)
  }

  static async saveSeoSettings(settings: any) {
    return this.saveToFile('seo-settings.json', settings)
  }

  static async getFooterContent() {
    const defaultFooter = {
      socialLinks: [],
      legalLinks: [],
      companyInfo: {
        name: 'GAMES',
        description: 'Best Online Gaming Platform',
        address: '',
        email: 'contact@yourgamesite.com',
        phone: ''
      },
      customHtml: '',
      isVisible: true
    }
    
    return this.loadFromFile('footer-content.json', defaultFooter)
  }

  static async saveFooterContent(content: any) {
    return this.saveToFile('footer-content.json', content)
  }

  // 清除所有缓存
  static clearCache() {
    this.cache.clear()
    this.lightGamesCache = null
    this.lightGamesCacheTime = 0
  }
}
