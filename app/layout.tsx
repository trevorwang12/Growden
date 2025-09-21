import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import HydrationErrorBoundary from '@/components/HydrationErrorBoundary'
import HydrationFix from '@/components/HydrationFix'
import SafePreloadManager from '@/components/optimization/SafePreloadManager'
import { CssOptimizer } from '@/components/optimization/CssOptimizer'
import SafeAnalytics from '@/components/SafeAnalytics'
import SafeVerificationTags from '@/components/SafeVerificationTags'
import SafeCustomHeadTags from '@/components/SafeCustomHeadTags'
import { SeoService } from '@/lib/seo-service'
import { CriticalCSS } from '@/components/CriticalCSS'
import { DeferredCSS, PreloadResources } from '@/components/DeferredCSS'
import './globals.css'

export const dynamic = 'force-dynamic'

// "Simplicity is the ultimate sophistication." - Leonardo (Linus would approve)
export async function generateMetadata(): Promise<Metadata> {
  return SeoService.generateMetadata()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        {/* 内嵌关键CSS - 解决220ms渲染阻塞 */}
        <CriticalCSS />

        {/* 预加载关键资源 */}
        <PreloadResources resources={[
          { href: '/api/homepage-optimized', as: 'fetch' },
        ]} />

        {/* 优化的字体加载 - 避免阻塞渲染 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        <SafeAnalytics />
        <SafeVerificationTags />
        <SafeCustomHeadTags />
      </head>
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <div id="__next" suppressHydrationWarning={true}>
          <HydrationErrorBoundary>
            <HydrationFix />
            <SafePreloadManager />
            <CssOptimizer />
            {children}
          </HydrationErrorBoundary>
        </div>
      </body>
    </html>
  )
}
