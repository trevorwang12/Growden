"use client"

import { useEffect, useState, useRef } from 'react'
import { ErrorHandler, AppError } from '@/lib/error-handler'
import ErrorDisplay from '@/components/ErrorDisplay'
import SafeScriptExecutor from '@/components/SafeScriptExecutor'

// "Security is not a feature, it's a foundation." - Linus
// 安全的广告位组件 - 不执行任意HTML/脚本

interface AdSlotProps {
  position: 'header' | 'footer' | 'sidebar' | 'hero-bottom' | 'content-top' | 'game-details-bottom' | 'content-bottom' | 'recommendations-top'
  className?: string
}

interface SafeAdData {
  id: string
  position: string
  htmlContent?: string
  isActive: boolean
}

export default function SafeAdSlot({ position, className = '' }: AdSlotProps) {
  const [adData, setAdData] = useState<SafeAdData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const hasLoaded = useRef(false)
  
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      loadAdData()
    }

    const handleAdsUpdate = () => {
      loadAdData()
    }

    window.addEventListener('adsUpdated', handleAdsUpdate)

    return () => {
      window.removeEventListener('adsUpdated', handleAdsUpdate)
    }
  }, [position])
  
  const loadAdData = async () => {
    setIsLoading(true)
    setError(null)
    
    // 从安全的内容API获取广告
    const { data, error: fetchError } = await ErrorHandler.safeFetch(
      '/api/ads/content',
      {},
      `ad-${position}`
    )
    
    if (fetchError) {
      // 对于AbortError，静默处理，不显示错误
      if (fetchError.type === 'NETWORK' && fetchError.message.includes('aborted')) {
        setAdData(null)
      } else {
        ErrorHandler.logError(fetchError, `AdSlot-${position}`)
        setError(fetchError)
        setAdData(null)
      }
    } else {
      const ad = data?.find((ad: SafeAdData) => ad.position === position && ad.isActive)
      setAdData(ad || null)
    }
    
    setIsLoading(false)
  }
  
  if (isLoading) {
    return (
      <div className={`ad-slot ad-slot-${position} ${className}`}>
        <div className="ad-placeholder animate-pulse bg-gray-100 h-24 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading ad...</span>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`ad-slot ad-slot-${position} ${className}`}>
        <ErrorDisplay error={error} onRetry={loadAdData} />
      </div>
    )
  }
  
  if (!adData) {
    return null
  }
  
  // 渲染经过安全验证的广告内容
  return (
    <div className={`ad-slot ad-slot-${position} ${className}`}>
      {adData.htmlContent ? (
        <SafeScriptExecutor 
          htmlContent={adData.htmlContent}
          containerId={`ad-container-${adData.id}`}
        />
      ) : (
        <div className="ad-placeholder bg-gray-50 border-2 border-dashed border-gray-200 h-24 rounded flex items-center justify-center">
          <span className="text-gray-500 text-sm">Ad Space ({position})</span>
        </div>
      )}
    </div>
  )
}
