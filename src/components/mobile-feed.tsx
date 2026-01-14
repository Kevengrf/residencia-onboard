
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function MobileFeed() {
    const [videos, setVideos] = useState([
        {
            id: 1,
            title: 'Residência Onboard',
            description: 'Bem-vindo ao Porto Digital! 🚀 #Recife #Tech',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
            user: { name: 'Porto Digital', avatar: '' },
            likes: 120,
            comments: 45
        },
        {
            id: 2,
            title: 'Projeto Inovação',
            description: 'Veja o que nossos alunos estão criando. 💡',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Placeholder
            user: { name: 'CESAR School', avatar: '' },
            likes: 89,
            comments: 12
        }
    ])

    return (
        <div className="h-[100dvh] w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
            {videos.map((video) => (
                <div key={video.id} className="h-full w-full relative snap-start">
                    {/* Video Player */}
                    <video
                        src={video.url}
                        className="h-full w-full object-cover"
                        loop
                        muted // Auto-play usually requires muted first interaction
                        playsInline
                        autoPlay
                    />

                    {/* Overlay UI */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                        <div className="flex items-end justify-between">
                            <div className="flex-1 mr-12">
                                <h3 className="font-bold text-lg mb-1">@{video.user.name}</h3>
                                <h4 className="font-semibold text-sm mb-2">{video.title}</h4>
                                <p className="text-sm opacity-90 line-clamp-2">{video.description}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 items-center absolute right-4 bottom-20">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-white">
                                            <AvatarImage src={video.user.avatar} />
                                            <AvatarFallback className="text-black font-bold">PD</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5">
                                            <Plus size={12} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                        <Heart size={28} />
                                    </Button>
                                    <span className="text-xs font-semibold">{video.likes}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                        <MessageCircle size={28} />
                                    </Button>
                                    <span className="text-xs font-semibold">{video.comments}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                        <Share2 size={28} />
                                    </Button>
                                    <span className="text-xs font-semibold">Share</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
