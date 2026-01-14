
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MobileFeed from '@/components/mobile-feed'
import WebLanding from '@/components/web-landing'

export default function Home() {
  const [isFeedVisible, setIsFeedVisible] = useState(false)

  // Handlers for swipe
  const onDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50
    // Swipe Right (drag x > threshold) -> Show Feed
    if (!isFeedVisible && info.offset.x > swipeThreshold) {
      setIsFeedVisible(true)
    }
    // Swipe Left (drag x < -threshold) -> Hide Feed (Show Landing)
    else if (isFeedVisible && info.offset.x < -swipeThreshold) {
      setIsFeedVisible(false)
    }
  }

  return (
    <>
      <div className="md:hidden h-screen w-screen overflow-hidden bg-background relative">
        <AnimatePresence initial={false}>
          {/* Landing Page Layer */}
          <motion.div
            key="landing"
            className="absolute inset-0 z-10 bg-background"
            animate={{ x: isFeedVisible ? '100%' : '0%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
          >
            <div className="h-full overflow-y-auto">
              <WebLanding />
              {/* Visual Hint for Swipe */}
              <div className="fixed left-0 top-1/2 -translate-y-1/2 w-8 h-24 flex items-center justify-center opacity-30 pointer-events-none z-50">
                <div className="animate-pulse bg-primary/20 h-full w-1 rounded-r-full" />
              </div>
            </div>
          </motion.div>

          {/* Video Feed Layer (Behind Landing) */}
          <motion.div
            key="feed"
            className="absolute inset-0 z-0 bg-black"
          >
            <MobileFeed />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden md:block">
        <WebLanding />
      </div>
    </>
  )
}
