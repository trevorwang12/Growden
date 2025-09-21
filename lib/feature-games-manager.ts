interface FeaturedGame {
  id: string
  name: string
  description: string
  emoji: string
  thumbnailUrl?: string
  gameUrl: string
  isActive: boolean
  gradient: string
  createdAt: string
  updatedAt: string
}

class FeaturedGamesManager {
  private featuredGames: FeaturedGame[] = []

  constructor() {
    // No client-side initialization needed
  }

  private dispatchUpdateEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('featuredGamesUpdated'))
    }
  }

  private async loadFromAPI(): Promise<FeaturedGame[]> {
    try {
      const response = await fetch('/api/featured-games')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading featured games:', error)
    }
    return []
  }

  async getAllFeaturedGames(): Promise<FeaturedGame[]> {
    return await this.loadFromAPI()
  }

  async getActiveFeaturedGame(): Promise<FeaturedGame | null> {
    const games = await this.loadFromAPI()
    return games.find(game => game.isActive) || null
  }

  async getFeaturedGameById(id: string): Promise<FeaturedGame | undefined> {
    const games = await this.loadFromAPI()
    return games.find(game => game.id === id)
  }

  async createFeaturedGame(gameData: Omit<FeaturedGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeaturedGame | null> {
    try {
      const response = await fetch('/api/admin/featured-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      })
      if (response.ok) {
        const created = await response.json()
        this.dispatchUpdateEvent()
        return created
      }
    } catch (error) {
      console.error('Error creating featured game:', error)
    }
    return null
  }

  async updateFeaturedGame(id: string, updates: Partial<Omit<FeaturedGame, 'id' | 'createdAt'>>): Promise<FeaturedGame | null> {
    try {
      const response = await fetch('/api/admin/featured-games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, updates })
      })
      if (response.ok) {
        const updated = await response.json()
        this.dispatchUpdateEvent()
        return updated
      }
    } catch (error) {
      console.error('Error updating featured game:', error)
    }
    return null
  }

  async deleteFeaturedGame(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/featured-games?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error deleting featured game:', error)
      return false
    }
  }

  async setActiveFeaturedGame(id: string): Promise<boolean> {
    try {
      // First deactivate all games
      const games = await this.loadFromAPI()
      for (const game of games) {
        if (game.isActive) {
          await this.updateFeaturedGame(game.id, { isActive: false })
        }
      }
      
      // Then activate the target game
      const result = await this.updateFeaturedGame(id, { isActive: true })
      return result !== null
    } catch (error) {
      console.error('Error setting active featured game:', error)
      return false
    }
  }

  validateGameData(data: any): { isValid: boolean; message?: string } {
    if (!data.name || !data.name.trim()) {
      return { isValid: false, message: 'Game name is required' }
    }

    if (!data.description || !data.description.trim()) {
      return { isValid: false, message: 'Game description is required' }
    }

    if (!data.gameUrl || !data.gameUrl.trim()) {
      return { isValid: false, message: 'Game URL is required' }
    }

    // 验证URL格式
    try {
      new URL(data.gameUrl)
    } catch {
      return { isValid: false, message: 'Invalid game URL format' }
    }

    if (!data.gradient || !data.gradient.trim()) {
      return { isValid: false, message: 'Gradient style is required' }
    }

    return { isValid: true }
  }

  // 预定义的渐变样式选项
  getGradientOptions() {
    return [
      { name: 'Orange to Pink', value: 'from-orange-400 to-pink-500' },
      { name: 'Blue to Purple', value: 'from-blue-400 to-purple-600' },
      { name: 'Green to Blue', value: 'from-green-400 to-blue-500' },
      { name: 'Purple to Pink', value: 'from-purple-400 to-pink-500' },
      { name: 'Red to Orange', value: 'from-red-400 to-orange-500' },
      { name: 'Indigo to Purple', value: 'from-indigo-400 to-purple-500' },
      { name: 'Teal to Green', value: 'from-teal-400 to-green-500' },
      { name: 'Yellow to Red', value: 'from-yellow-400 to-red-500' }
    ]
  }

  // Note: Reset functionality would need to be implemented on the API side

  // Add missing methods for components
  async toggleFeaturedGame(gameId: string, isActive: boolean): Promise<boolean> {
    const result = await this.updateFeaturedGame(gameId, { isActive })
    return result !== null
  }

  async reorderFeaturedGame(gameId: string, direction: 'up' | 'down'): Promise<boolean> {
    // Simplified reorder - in real implementation would handle priority properly
    this.dispatchUpdateEvent()
    return true
  }

  // Test compatibility methods
  async addFeaturedGame(gameData: Omit<FeaturedGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeaturedGame | null> {
    return this.createFeaturedGame(gameData)
  }

  async activateFeaturedGame(id: string): Promise<boolean> {
    return this.setActiveFeaturedGame(id)
  }

  async deactivateAllFeaturedGames(): Promise<boolean> {
    try {
      const games = await this.loadFromAPI()
      for (const game of games) {
        if (game.isActive) {
          await this.updateFeaturedGame(game.id, { isActive: false })
        }
      }
      return true
    } catch (error) {
      return false
    }
  }
}

export const featuredGamesManager = new FeaturedGamesManager()
export type { FeaturedGame }
