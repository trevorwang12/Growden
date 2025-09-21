"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Play, Users, Gamepad2 } from "lucide-react"
import { dataManager } from "@/lib/data-manager"
import { featuredGamesManager } from "@/lib/feature-games-manager"
import { homepageManager } from "@/lib/homepage-manager"
import { getGameImageAlt } from "@/lib/image-utils"
import AdSlot from "@/components/SafeAdSlot"
import GamePlayer from "@/components/GamePlayer"
import GameGallery from "@/components/GameGallery"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"
import InstantSearch from "@/components/InstantSearch"
import PageH1 from "@/components/PageH1"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import FriendlyLinks from "@/components/FriendlyLinks"

const formatRating = (rating: unknown, fallback: string) => {
  if (typeof rating === "number" && !Number.isNaN(rating)) {
    return rating.toFixed(1)
  }

  if (typeof rating === "string" && rating.trim() !== "") {
    return rating
  }

  return fallback
}

interface HomePageClientProps {
  initialFeaturedGame: any | null
  initialHotGames: any[]
  initialNewGames: any[]
  initialAllGames: any[]
  initialSeoData: any
  initialHomepageContent: any
}

export default function HomePageClient({
  initialFeaturedGame,
  initialHotGames,
  initialNewGames,
  initialAllGames,
  initialSeoData,
  initialHomepageContent,
}: HomePageClientProps) {
  const [featuredGame, setFeaturedGame] = useState<any>(initialFeaturedGame)
  const [featuredGameDataLoading, setFeaturedGameDataLoading] = useState(!initialFeaturedGame)
  const [isPlayingFeatured, setIsPlayingFeatured] = useState(false)
  const [featuredGameLoading, setFeaturedGameLoading] = useState(false)
  const [hotGames, setHotGames] = useState<any[]>(initialHotGames)
  const [newGames, setNewGames] = useState<any[]>(initialNewGames)
  const [allGames, setAllGames] = useState<any[]>(initialAllGames)
  const [seoData, setSeoData] = useState<any>(initialSeoData)
  const [homepageContent, setHomepageContent] = useState<any>(initialHomepageContent)
  const [loadingTipIndex, setLoadingTipIndex] = useState(0)

  const loadingTips = [
    "💡 Pro tip: Use arrow keys or WASD for better control!",
    "🎮 Did you know? This game supports multiple control schemes!",
    "⚡ Loading awesome graphics and smooth gameplay...",
    "🌟 Get ready for an epic gaming adventure!",
    "🎯 Tip: Check your internet connection for best experience!",
    "🚀 Preparing the ultimate gaming experience for you..."
  ]

  // Helper function to render sections based on order - currently not used but prepared for future dynamic ordering
  const renderSectionByType = (sectionType: string) => {
    if (!homepageContent) return null

    switch (sectionType) {
      case "featuredGame":
      case "newGames":
      case "features":
      case "whatIs":
      case "howToPlay":
      case "whyChooseUs":
      case "faq":
      case "gameGallery":
      case "youMightAlsoLike":
      default:
        return null
    }
  }

  // Render function for multiple custom HTML sections
  const renderCustomHtmlSections = () => {
    if (
      !Array.isArray(homepageContent?.customHtmlSections) ||
      homepageContent.customHtmlSections.length === 0
    )
      return null

    return (
      <>
        {homepageContent.customHtmlSections
          .filter((section: any) => section.isVisible)
          .map((section: any) => (
            <div key={section.id} className="mb-8">
              <div className="container mx-auto max-w-6xl px-4">
                {section.title && (
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    {section.title}
                  </h2>
                )}
                <div
                  className="custom-html-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </div>
          ))}
      </>
    )
  }

  // Get ordered sections
  const getOrderedSections = () => {
    if (!homepageContent?.sectionOrder) return []

    const sections = Object.entries(homepageContent.sectionOrder)
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .map(([sectionType]) => sectionType)

    return sections
  }

  // Load featured game and games data on component mount and listen for updates
  useEffect(() => {
    const loadFeaturedGame = async () => {
      try {
        const activeFeaturedGame = await featuredGamesManager.getActiveFeaturedGame()
        setFeaturedGame(activeFeaturedGame)
      } catch (error) {
        console.error("Failed to load featured game:", error)
        setFeaturedGame(null)
      } finally {
        setFeaturedGameDataLoading(false)
      }
    }

    const loadSEOData = async () => {
      try {
        const response = await fetch("/api/seo")
        if (response.ok) {
          const data = await response.json()
          setSeoData(data)
        }
      } catch (error) {
        console.error("Failed to load SEO data:", error)
      }
    }

    const loadGamesData = async () => {
      try {
        // 只调用一次 getAllGames，然后本地过滤
        const allGamesData = await dataManager.getAllGames()

        // 本地过滤和排序，消除重复API调用
        const activeGames = allGamesData.filter((game: any) => game.isActive)
        const hotGamesData = activeGames
          .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 8)
        const newGamesData = activeGames
          .sort(
            (a: any, b: any) =>
              new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
          )
          .slice(0, 8)

        setHotGames(hotGamesData)
        setNewGames(newGamesData)
        setAllGames(allGamesData)
      } catch (error) {
        console.error("Failed to load games data:", error)
        // Set empty arrays on error to prevent infinite loading
        setHotGames([])
        setNewGames([])
        setAllGames([])
      }
    }

    const loadHomepageContent = async () => {
      try {
        const content = await homepageManager.getContent()
        setHomepageContent(content)
      } catch (error) {
        console.error("Failed to load homepage content:", error)
      }
    }

    // Trigger async loads; initial state already seeded via props
    Promise.all([
      loadFeaturedGame(),
      loadGamesData(),
      loadHomepageContent(),
      loadSEOData(),
    ])

    // 监听featured games更新事件
    const handleFeaturedGamesUpdate = async () => {
      setFeaturedGameDataLoading(true)
      await loadFeaturedGame()
    }

    // 监听games更新事件
    const handleGamesUpdate = async () => {
      await loadGamesData()
    }

    // 监听homepage content更新事件
    const handleHomepageUpdate = async () => {
      await loadHomepageContent()
    }

    // 监听localStorage变化和自定义事件
    window.addEventListener("storage", handleFeaturedGamesUpdate)
    window.addEventListener("featuredGamesUpdated", handleFeaturedGamesUpdate)
    window.addEventListener("gamesUpdated", handleGamesUpdate)
    window.addEventListener("homepageUpdated", handleHomepageUpdate)

    return () => {
      window.removeEventListener("storage", handleFeaturedGamesUpdate)
      window.removeEventListener(
        "featuredGamesUpdated",
        handleFeaturedGamesUpdate
      )
      window.removeEventListener("gamesUpdated", handleGamesUpdate)
      window.removeEventListener("homepageUpdated", handleHomepageUpdate)
    }
  }, [])

  // Cycle through loading tips for featured game
  useEffect(() => {
    if (featuredGameLoading) {
      const interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [featuredGameLoading, loadingTips.length])

  const startFeaturedGame = async () => {
    setFeaturedGameLoading(true)

    // Simulate game loading time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setFeaturedGameLoading(false)
    setIsPlayingFeatured(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main H1 Title */}
        <PageH1
          pageType="homepage"
          data={{ siteName: seoData?.seoSettings?.siteName || "Growden.io Free Play Grow A Garden" }}
          className="text-center mb-8"
        />

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Game */}
            <div className="mb-8">
              {featuredGameDataLoading ? (
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white h-[600px] flex items-center justify-center relative overflow-hidden">
                  {/* Background Elements */}
                  <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full opacity-30 animate-bounce"></div>
                  <div className="absolute top-32 right-20 w-24 h-24 bg-white/20 rounded-full opacity-40 animate-pulse"></div>
                  <div className="absolute bottom-20 left-32 w-28 h-28 bg-white/15 rounded-full opacity-30 animate-ping"></div>

                  <div className="relative z-10 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto relative">
                        <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-3 bg-white/20 rounded-full animate-pulse flex items-center justify-center">
                          <Gamepad2 className="w-8 h-8 text-white animate-bounce" />
                        </div>
                      </div>

                      <div className="flex justify-center mt-6 space-x-1">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold animate-pulse">
                        Loading Featured Game...
                      </h2>
                      <p className="text-white/90 text-lg animate-pulse">
                        Discovering amazing games for you!
                      </p>
                      <div className="w-80 mx-auto bg-white/20 rounded-full h-3 mt-6">
                        <div className="bg-white h-3 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : featuredGame ? (
                <>
                  {/* Featured Game Player or Preview */}
                  {isPlayingFeatured && featuredGame.gameUrl ? (
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-auto">
                      <GamePlayer
                        gameUrl={featuredGame.gameUrl}
                        gameName={featuredGame.name}
                        gameId={featuredGame.id}
                        allowFullscreen={true}
                        showControls={true}
                      />
                    </div>
                  ) : featuredGameLoading ? (
                    <div
                      className={`bg-gradient-to-r ${featuredGame.gradient || "from-orange-400 to-pink-500"} rounded-lg text-white h-[600px] flex items-center justify-center relative overflow-hidden`}
                    >
                      {/* Floating Background Elements */}
                      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full opacity-30 animate-bounce"></div>
                      <div className="absolute top-32 right-20 w-24 h-24 bg-white/20 rounded-full opacity-40 animate-pulse"></div>
                      <div className="absolute bottom-20 left-32 w-28 h-28 bg-white/15 rounded-full opacity-30 animate-ping"></div>

                      <div className="relative z-10 text-center">
                        {/* Main Loading Animation */}
                        <div className="relative mb-6">
                          <div className="w-20 h-20 mx-auto relative">
                            {/* Outer rotating ring */}
                            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>

                            {/* Inner pulsing circle */}
                            <div className="absolute inset-3 bg-white/20 rounded-full animate-pulse flex items-center justify-center">
                              <Gamepad2 className="w-8 h-8 text-white animate-bounce" />
                            </div>
                          </div>

                          {/* Loading dots */}
                          <div className="flex justify-center mt-6 space-x-1">
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                            <div
                              className="w-3 h-3 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>

                        {/* Dynamic Loading Text */}
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold animate-pulse">
                            Loading {featuredGame.name}...
                          </h2>
                          <p className="text-white/90 text-lg animate-pulse">
                            Preparing your gaming experience!
                          </p>

                          {/* Progress bar */}
                          <div className="w-80 mx-auto bg-white/20 rounded-full h-3 mt-6">
                            <div className="bg-white h-3 rounded-full animate-pulse w-full"></div>
                          </div>

                          {/* Dynamic loading tips */}
                          <div className="mt-8 p-6 bg-white/10 rounded-xl backdrop-blur-sm max-w-md mx-auto">
                            <p className="text-white font-medium text-lg animate-pulse">
                              {loadingTips[loadingTipIndex]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`bg-gradient-to-r ${featuredGame.gradient || "from-orange-400 to-pink-500"} relative overflow-hidden rounded-lg text-white p-8 md:p-12`}
                    >
                      {featuredGame.thumbnailUrl && (
                        <img
                          src={featuredGame.thumbnailUrl}
                          alt={featuredGame.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-50"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
                        <div>
                          <h2 className="text-4xl font-bold mb-4">{featuredGame.name}</h2>
                          <p className="text-lg text-white/90 mb-6">
                            {featuredGame.description}
                          </p>
                          <Button
                            size="lg"
                            onClick={startFeaturedGame}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Play className="mr-2 h-5 w-5" /> Play Now
                          </Button>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                              <Gamepad2 className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">
                              Now Featuring
                            </h3>
                            <p className="text-white/90 mb-6">
                              Experience this hand-picked favorite from our
                              collection.
                            </p>
                            <div className="grid grid-cols-2 gap-4 w-full">
                              <div className="bg-white/10 rounded-xl p-4">
                                <p className="text-sm text-white/80">Category</p>
                                <p className="text-lg font-semibold">
                                  {featuredGame.category || "Arcade"}
                                </p>
                              </div>
                              <div className="bg-white/10 rounded-xl p-4">
                                <p className="text-sm text-white/80">Players</p>
                                <p className="text-lg font-semibold">★ 4.8</p>
                              </div>
                              <div className="bg-white/10 rounded-xl p-4 col-span-2">
                                <p className="text-sm text-white/80">Highlights</p>
                                <p className="text-lg font-semibold">
                                  Fast-paced · Browser Ready · Free to Play
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-56 h-56 bg-white/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Featured games coming soon!
                  </h2>
                  <p className="text-gray-600">
                    New featured games coming soon! Check back later for exciting
                    updates.
                  </p>
                </div>
              )}
            </div>

            {/* Hot Games Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Right Now
                </h2>
                <Link
                  href="/hot-games"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hotGames.length > 0 ? (
                  hotGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/game/${game.id}`}
                      className="group block h-full"
                    >
                      <Card className="relative h-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        <div className="relative z-10 p-4">
                          <div className="relative mb-4">
                            <img
                              src={game.thumbnailUrl || "/placeholder-game.png"}
                              alt={getGameImageAlt(game)}
                              className="h-40 w-full rounded-lg object-cover"
                              loading="lazy"
                            />
                            <Badge className="absolute top-3 left-3 bg-blue-600 text-white shadow-lg">
                              HOT
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {game.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {game.shortDescription || "Play now and join the fun!"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="ml-1 text-sm font-medium">
                                {formatRating(game.rating, "4.5")}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                              Play Now
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  [...Array(4)].map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="h-40 bg-gray-100 rounded-lg mb-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* Game Gallery Section */}
            {homepageContent?.gameGallery?.isVisible && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {homepageContent.gameGallery.title || "Game Gallery"}
                    </h2>
                    {homepageContent.gameGallery.subtitle && (
                      <p className="text-gray-600">
                        {homepageContent.gameGallery.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <GameGallery
                  displayMode={homepageContent.gameGallery.displayMode}
                  columns={homepageContent.gameGallery.columns}
                  showTitles={homepageContent.gameGallery.showTitles}
                  showDescriptions={homepageContent.gameGallery.showDescriptions}
                  images={homepageContent.gameGallery.images}
                />
              </section>
            )}

            {/* Custom HTML sections */}
            {renderCustomHtmlSections()}

            {/* Features Section */}
            {homepageContent?.features?.isVisible && (
              <div className="mb-12">
                <div className="grid md:grid-cols-2 gap-6">
                  {homepageContent.features.sections.instantPlay.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">
                        {homepageContent.features.sections.instantPlay.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {homepageContent.features.sections.instantPlay.description}
                      </p>
                    </div>
                  )}

                  {homepageContent.features.sections.freeGames.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">
                        {homepageContent.features.sections.freeGames.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {homepageContent.features.sections.freeGames.description}
                      </p>
                    </div>
                  )}

                  {homepageContent.features.sections.highQuality.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">
                        {homepageContent.features.sections.highQuality.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {homepageContent.features.sections.highQuality.description}
                      </p>
                    </div>
                  )}

                  {homepageContent.features.sections.multipleCategories.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gamepad2 className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">
                        {homepageContent.features.sections.multipleCategories.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {homepageContent.features.sections.multipleCategories.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What is Section */}
            {homepageContent?.whatIs?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {homepageContent.whatIs.title}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <p className="text-lg text-gray-700 mb-4">
                        {homepageContent.whatIs.content.mainText}
                      </p>
                      <p className="text-gray-600">
                        {homepageContent.whatIs.content.statsText}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg p-8 text-white text-center">
                      <h3 className="text-2xl font-bold mb-4">Join Millions of Players</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-3xl font-bold">
                            {homepageContent.whatIs.content.gamesCount}
                          </div>
                          <div className="text-sm opacity-90">Games Available</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold">
                            {homepageContent.whatIs.content.playersCount}
                          </div>
                          <div className="text-sm opacity-90">Active Players</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How to Play Section */}
            {homepageContent?.howToPlay?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {homepageContent.howToPlay.title}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        {homepageContent.howToPlay.steps.step1.title}
                      </h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step1.description}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-purple-600">
                          2
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        {homepageContent.howToPlay.steps.step2.title}
                      </h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step2.description}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          3
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        {homepageContent.howToPlay.steps.step3.title}
                      </h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step3.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Why Choose Us Section */}
            {homepageContent?.whyChooseUs?.isVisible && (
              <div className="mb-12">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    {homepageContent.whyChooseUs.title}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/10 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        {homepageContent.whyChooseUs.premiumSection.title}
                      </h3>
                      <ul className="space-y-3">
                        {homepageContent.whyChooseUs.premiumSection.features.map(
                          (feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-300 mr-2">✔</span>
                              <span>{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="bg-white/10 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        {homepageContent.whyChooseUs.communitySection.title}
                      </h3>
                      <ul className="space-y-3">
                        {homepageContent.whyChooseUs.communitySection.features.map(
                          (feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-300 mr-2">✔</span>
                              <span>{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {homepageContent?.faq?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {homepageContent.faq.title}
                  </h2>
                  <div className="space-y-4">
                    {homepageContent.faq.questions.map((faqItem: any, index: number) => (
                      <details
                        key={index}
                        className="group border border-gray-200 rounded-lg p-4"
                      >
                        <summary className="flex justify-between items-center cursor-pointer">
                          <span className="text-lg font-semibold text-gray-800">
                            {faqItem.question}
                          </span>
                          <span className="text-blue-600 group-open:hidden">+</span>
                          <span className="text-blue-600 hidden group-open:block">−</span>
                        </summary>
                        <p className="text-gray-600 mt-3">
                          {faqItem.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* You Might Also Like Section */}
            {homepageContent?.youMightAlsoLike?.isVisible && (
              <div className="mb-12">
                <YouMightAlsoLike
                  currentGameId={featuredGame?.id}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full md:w-80 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search games...
              </h2>
              <InstantSearch games={allGames} />
            </div>

            {/* Latest Games */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Latest games</h2>
                <Link
                  href="/new-games"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
              {newGames.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {newGames.slice(0, 8).map((game) => (
                    <Link
                      key={game.id}
                      href={`/game/${game.id}`}
                      className="group flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded">
                        <img
                          src={game.thumbnailUrl || "/placeholder-game.png"}
                          alt={getGameImageAlt(game)}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 text-center">
                        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                          {game.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {(game.category || 'New release')} · ⭐ {formatRating(game.rating, "4.6")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-3">
                      <div className="h-20 w-20 rounded bg-gray-100 animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Categories */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick categories
              </h2>
              <div className="space-y-3">
                {[
                  { name: "Action Games", href: "/search?category=action" },
                  { name: "Puzzle Games", href: "/search?category=puzzle" },
                  { name: "Adventure Games", href: "/search?category=adventure" },
                  { name: "Arcade Games", href: "/search?category=arcade" },
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-gray-800 font-medium">
                      {category.name}
                    </span>
                    <span className="text-blue-600 group-hover:text-blue-700">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ads Sidebar */}
            <AdSlot position="sidebar" className="bg-white border border-gray-200 rounded-lg p-4" />

            {/* Highlights */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Why choose Growden?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mt-1 mr-2">🎮</span>
                  <span>Instantly playable games — no downloads required</span>
                </li>
                <li className="flex items-start">
                  <span className="mt-1 mr-2">⭐</span>
                  <span>Curated collection with high-quality ratings</span>
                </li>
                <li className="flex items-start">
                  <span className="mt-1 mr-2">🌍</span>
                  <span>Play anywhere, on any device with a browser</span>
                </li>
              </ul>
            </div>

            {/* Friendly links */}
            <FriendlyLinks />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
