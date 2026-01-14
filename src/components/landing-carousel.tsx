'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function LandingCarousel() {
    const [images, setImages] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchImages = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('landing_images')
                .select('image_url')
                .eq('is_active', true)
                .order('order_index')

            if (data && data.length > 0) {
                setImages(data.map((img: { image_url: string }) => img.image_url))
            }
        }
        fetchImages()
    }, [])

    useEffect(() => {
        if (images.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length)
        }, 5000) // 5 seconds per slide

        return () => clearInterval(interval)
    }, [images])

    if (images.length === 0) return null

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {images.map((img, index) => (
                <div
                    key={img}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ backgroundImage: `url(${img})` }}
                />
            ))}
            {/* Gradient Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-[2px]" />
        </div>
    )
}
