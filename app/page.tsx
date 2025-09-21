import HomePageClient from '@/components/HomePageClient'
import { DataService } from '@/lib/data-service'

interface FeaturedGame {
  id: string
  name: string
  description: string
  thumbnailUrl?: string
  gameUrl?: string
  gradient?: string
  category?: string
  isActive: boolean
}

async function getInitialData() {
  const [seoData, homepageContent, allGamesRaw, featuredGames] = await Promise.all([
    DataService.getSeoSettings(),
    DataService.getHomepageContent(),
    DataService.getLightweightGames(),
    DataService.getFeaturedGames(),
  ])

  const activeGames = allGamesRaw.filter((game) => game.isActive)

  const hotGames = [...activeGames]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 8)

  const newGames = [...activeGames]
    .sort((a, b) => {
      const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
      const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 8)

  const featuredGame = (featuredGames.find((game: FeaturedGame) => game.isActive) || null) as
    | FeaturedGame
    | null

  return {
    seoData,
    homepageContent,
    allGames: activeGames,
    hotGames,
    newGames,
    featuredGame,
  }
}

export default async function HomePage() {
  const {
    seoData,
    homepageContent,
    allGames,
    hotGames,
    newGames,
    featuredGame,
  } = await getInitialData()

  return (
    <HomePageClient
      initialFeaturedGame={featuredGame}
      initialHotGames={hotGames}
      initialNewGames={newGames}
      initialAllGames={allGames}
      initialSeoData={seoData}
      initialHomepageContent={homepageContent}
    />
  )
}
