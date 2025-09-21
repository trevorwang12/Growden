interface HomepageSection {
  id: string
  name: string
  isVisible: boolean
  order: number
  updatedAt: string
}

interface SectionOrder {
  [key: string]: number
}

export interface CustomHtmlSection {
  id: string
  title: string
  content: string
  isVisible: boolean
}

export interface GameGalleryImage {
  id: string
  src: string
  title: string
  description?: string
  gameUrl?: string
}

export interface GameGallerySection {
  isVisible: boolean
  title: string
  subtitle?: string
  displayMode: 'grid' | 'carousel'
  columns: 2 | 3 | 4
  showTitles: boolean
  showDescriptions: boolean
  images: GameGalleryImage[]
}

interface HomepageContent {
  hero: {
    isVisible: boolean
    title: string
    subtitle: string
    backgroundGradient: string
  }
  featuredGame: {
    isVisible: boolean
    showPlayButton: boolean
  }
  newGames: {
    isVisible: boolean
    title: string
    limit: number
    showViewAllButton: boolean
  }
  features: {
    isVisible: boolean
    title: string
    sections: {
      instantPlay: { isVisible: boolean, title: string, description: string }
      freeGames: { isVisible: boolean, title: string, description: string }
      highQuality: { isVisible: boolean, title: string, description: string }
      multipleCategories: { isVisible: boolean, title: string, description: string }
    }
  }
  whatIs: {
    isVisible: boolean
    title: string
    content: {
      mainText: string
      statsText: string
      gamesCount: string
      playersCount: string
    }
  }
  howToPlay: {
    isVisible: boolean
    title: string
    steps: {
      step1: { title: string, description: string }
      step2: { title: string, description: string }
      step3: { title: string, description: string }
    }
  }
  whyChooseUs: {
    isVisible: boolean
    title: string
    premiumSection: {
      title: string
      features: string[]
    }
    communitySection: {
      title: string
      features: string[]
    }
  }
  faq: {
    isVisible: boolean
    title: string
    questions: {
      question: string
      answer: string
    }[]
  }
  gameGallery: GameGallerySection
  youMightAlsoLike: {
    isVisible: boolean
  }
  customHtmlSections: CustomHtmlSection[]
  sectionOrder: SectionOrder
}

const STORAGE_KEY = 'homepage-content'

class HomepageManager {
  private content: HomepageContent

  constructor() {
    this.content = this.getDefaultContent()
  }

  private dispatchUpdateEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('homepageUpdated'))
    }
  }

  private async loadFromAPI(): Promise<HomepageContent> {
    try {
      const response = await fetch('/api/homepage')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading homepage content:', error)
    }
    return this.getDefaultContent()
  }

  private getDefaultContent(): HomepageContent {
    return {
      hero: {
        isVisible: false, // Hero section is handled by featured games manager
        title: "GAMES",
        subtitle: "Best Online Gaming Platform",
        backgroundGradient: "from-blue-500 to-purple-600"
      },
      featuredGame: {
        isVisible: true,
        showPlayButton: true
      },
      newGames: {
        isVisible: true,
        title: "New Games",
        limit: 8,
        showViewAllButton: true
      },
      features: {
        isVisible: true,
        title: "Why Play With Us",
        sections: {
          instantPlay: {
            isVisible: true,
            title: "Instant Play",
            description: "No downloads required. Play games directly in your browser."
          },
          freeGames: {
            isVisible: true,
            title: "Free Games",
            description: "100% free to play. No hidden fees or subscriptions."
          },
          highQuality: {
            isVisible: true,
            title: "High Quality",
            description: "Carefully curated games with excellent ratings and reviews."
          },
          multipleCategories: {
            isVisible: true,
            title: "Multiple Categories",
            description: "Action, puzzle, strategy, casual - something for everyone."
          }
        }
      },
      whatIs: {
        isVisible: true,
        title: "What is Our Gaming Platform?",
        content: {
          mainText: "Our platform is a comprehensive online gaming destination that brings you the best browser-based games from around the world. We've carefully selected each game to ensure quality, entertainment value, and seamless gameplay experience.",
          statsText: "From classic arcade games to modern indie creations, our library spans multiple genres and difficulty levels, making it perfect for both casual players and gaming enthusiasts.",
          gamesCount: "500+",
          playersCount: "1M+"
        }
      },
      howToPlay: {
        isVisible: true,
        title: "How to Get Started",
        steps: {
          step1: {
            title: "Browse Games",
            description: "Explore our collection of games by category, popularity, or search for specific titles."
          },
          step2: {
            title: "Click & Play",
            description: "Simply click on any game to start playing instantly. No registration or download required."
          },
          step3: {
            title: "Enjoy Gaming",
            description: "Have fun playing your favorite games and discover new ones to add to your collection."
          }
        }
      },
      whyChooseUs: {
        isVisible: true,
        title: "Why Choose Our Platform?",
        premiumSection: {
          title: "Premium Gaming Experience",
          features: [
            "Ad-free gaming with minimal interruptions",
            "Regular updates with new games added weekly",
            "Cross-platform compatibility on all devices"
          ]
        },
        communitySection: {
          title: "Community & Safety",
          features: [
            "Safe and secure platform with no malware",
            "Family-friendly content suitable for all ages",
            "24/7 customer support and community help"
          ]
        }
      },
      faq: {
        isVisible: true,
        title: "Frequently Asked Questions",
        questions: [
          {
            question: "Do I need to create an account to play games?",
            answer: "No account required! You can start playing any game immediately without registration. However, creating an account allows you to save your progress and favorite games."
          },
          {
            question: "Are all games completely free?",
            answer: "Yes, all games on our platform are 100% free to play. We don't charge for access to any games, and there are no hidden fees or premium subscriptions required."
          },
          {
            question: "Do games work on mobile devices?",
            answer: "Most of our games are mobile-friendly and work great on smartphones and tablets. Games automatically adapt to your screen size for the best playing experience."
          },
          {
            question: "How often do you add new games?",
            answer: "We add new games regularly, typically several new titles each week. Check our \"New Games\" section to discover the latest additions to our collection."
          },
          {
            question: "Can I suggest games to be added?",
            answer: "Absolutely! We love hearing from our community. Contact us through our support page to suggest games you'd like to see added to our platform."
          }
        ]
      },
      gameGallery: {
        isVisible: false,
        title: "Game Gallery",
        subtitle: "Discover Amazing Games",
        displayMode: 'grid' as const,
        columns: 3 as const,
        showTitles: true,
        showDescriptions: true,
        images: []
      },
      youMightAlsoLike: {
        isVisible: true
      },
      customHtml: {
        isVisible: false,
        title: "Custom Section",
        content: "<div class=\"text-center p-8\">\n  <h3 class=\"text-2xl font-bold mb-4\">Welcome to Our Gaming Platform</h3>\n  <p class=\"text-gray-600\">Customize this section with your own HTML content.</p>\n</div>"
      },
      customHtmlSections: [],
      sectionOrder: {
        featuredGame: 0,
        newGames: 1,
        features: 2,
        whatIs: 3,
        howToPlay: 4,
        whyChooseUs: 5,
        faq: 6,
        gameGallery: 7,
        youMightAlsoLike: 8,
        customHtml: 8
      }
    }
  }

  // Storage methods now handled by API

  // Get methods
  async getContent(): Promise<HomepageContent> {
    return await this.loadFromAPI()
  }

  async getSection(sectionName: keyof HomepageContent): Promise<any> {
    const content = await this.loadFromAPI()
    return content[sectionName]
  }

  // Save entire content
  async saveContent(content: HomepageContent): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', content })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error saving homepage content:', error)
      return false
    }
  }

  // Update methods
  async updateSection(sectionName: keyof HomepageContent, updates: any): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionName, updates })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error updating homepage section:', error)
      return false
    }
  }

  async updateSectionVisibility(sectionName: keyof HomepageContent, isVisible: boolean): Promise<boolean> {
    try {
      return await this.updateSection(sectionName, { isVisible })
    } catch (error) {
      console.error('Error updating section visibility:', error)
      return false
    }
  }

  async updateSectionOrder(newOrder: SectionOrder): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'sectionOrder', updates: newOrder })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error updating section order:', error)
      return false
    }
  }

  // Specific update methods
  updateNewGamesLimit(limit: number): Promise<boolean> {
    return this.updateSection('newGames', { limit })
  }

  updateFeaturesSection(features: any): Promise<boolean> {
    return this.updateSection('features', features)
  }

  updateFAQ(questions: { question: string, answer: string }[]): Promise<boolean> {
    return this.updateSection('faq', { questions })
  }

  // Reset to defaults
  async resetToDefaults(): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })
      if (response.ok) {
        this.dispatchUpdateEvent()
      }
      return response.ok
    } catch (error) {
      console.error('Error resetting to defaults:', error)
      return false
    }
  }

  // Get sections list for admin interface
  async getSectionsList(): Promise<{ id: keyof HomepageContent, name: string, isVisible: boolean, order: number }[]> {
    const content = await this.getContent()
    
    // Check if content is properly loaded
    if (!content) {
      return []
    }
    
    const sections = [
      { id: 'featuredGame' as keyof HomepageContent, name: 'Featured Game', isVisible: content.featuredGame?.isVisible || false },
      { id: 'newGames' as keyof HomepageContent, name: 'New Games Section', isVisible: content.newGames?.isVisible || false },
      { id: 'features' as keyof HomepageContent, name: 'Features Section', isVisible: content.features?.isVisible || false },
      { id: 'whatIs' as keyof HomepageContent, name: 'What Is Section', isVisible: content.whatIs?.isVisible || false },
      { id: 'howToPlay' as keyof HomepageContent, name: 'How to Play Section', isVisible: content.howToPlay?.isVisible || false },
      { id: 'whyChooseUs' as keyof HomepageContent, name: 'Why Choose Us Section', isVisible: content.whyChooseUs?.isVisible || false },
      { id: 'faq' as keyof HomepageContent, name: 'FAQ Section', isVisible: content.faq?.isVisible || false },
      { id: 'gameGallery' as keyof HomepageContent, name: 'Game Gallery', isVisible: content.gameGallery?.isVisible || false },
      { id: 'youMightAlsoLike' as keyof HomepageContent, name: 'You Might Also Like', isVisible: content.youMightAlsoLike?.isVisible || false }
    ]

    // Add individual custom HTML sections
    if (Array.isArray(content.customHtmlSections)) {
      content.customHtmlSections.forEach((section, index) => {
        sections.push({
          id: `customHtmlSection_${section.id}` as keyof HomepageContent,
          name: `Custom HTML: ${section.title}`,
          isVisible: section.isVisible,
          order: 100 + index // Place after other sections
        })
      })
    }
    
    // Ensure sectionOrder exists, if not create default order
    const sectionOrder = content.sectionOrder || {
      featuredGame: 0,
      newGames: 1,
      features: 2,
      whatIs: 3,
      howToPlay: 4,
      whyChooseUs: 5,
      faq: 6,
      youMightAlsoLike: 7
    }
    
    return sections.map(section => ({
      ...section,
      order: sectionOrder[section.id as string] || 0
    })).sort((a, b) => a.order - b.order)
  }
}

export const homepageManager = new HomepageManager()
export type { HomepageContent }
