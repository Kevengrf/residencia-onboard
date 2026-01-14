
'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Check, X, Building2, MapPin, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export interface Job {
    id: string
    title: string
    description: string
    salary_range?: string
    location?: string
    type?: string
    company: {
        name: string
        logo_url?: string
    }
}

// Inner Card Component for Isolation
function JobCard({ job, index, isTop, onSwipe }: { job: Job, index: number, isTop: boolean, onSwipe: (dir: 'left' | 'right') => void }) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 100
        if (info.offset.x > threshold) {
            onSwipe('right')
        } else if (info.offset.x < -threshold) {
            onSwipe('left')
        }
    }

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                zIndex: 100 - index,
                scale: isTop ? 1 : 0.95,
                y: isTop ? 0 : 20,
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20, opacity: 1 }}
            exit={{ x: x.get() < 0 ? -1000 : 1000, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 bg-card rounded-3xl shadow-xl border overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-2xl transition-shadow"
        >
            {/* Visual Feedback Overlays */}
            {isTop && (
                <>
                    <motion.div style={{ opacity: useTransform(x, [50, 150], [0, 1]) }} className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-15deg] z-20 pointer-events-none">
                        <span className="text-3xl font-black text-green-500 uppercase tracking-widest">QUERO</span>
                    </motion.div>
                    <motion.div style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }} className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[15deg] z-20 pointer-events-none">
                        <span className="text-3xl font-black text-red-500 uppercase tracking-widest">PASSO</span>
                    </motion.div>
                </>
            )}

            {/* Card Content */}
            <div className="flex flex-col h-full pointer-events-none select-none">
                {/* Header / Company Info */}
                <div className="p-6 bg-muted/30 border-b">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-1">
                            {job.company.logo_url ? <img src={job.company.logo_url} className="w-full h-full object-contain" /> : <Building2 className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company.name}</p>
                        </div>
                    </div>
                </div>

                {/* Main Details */}
                <div className="flex-1 p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {job.type && <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{job.type}</span>}
                        {job.location && (
                            <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3 mr-1" /> {job.location}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
                        {job.description}
                    </p>

                    {job.salary_range && (
                        <div className="mt-auto pt-4 flex items-center text-green-600 font-medium">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary_range}
                        </div>
                    )}
                </div>

                {/* Footer Actions Hint */}
                <div className="p-4 bg-muted/10 border-t flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><X className="w-4 h-4" /> Deslize esq.</div>
                    <div className="flex items-center gap-1">Deslize dir. <Check className="w-4 h-4" /></div>
                </div>
            </div>
        </motion.div>
    )
}

export default function JobMatchDeck({ jobs: initialJobs, studentId }: { jobs: Job[], studentId: string }) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs)
    const supabase = createClient()

    // Sync state if props change (optional, but good for resets)
    useEffect(() => {
        setJobs(initialJobs)
    }, [initialJobs])

    const swipe = async (direction: 'right' | 'left') => {
        if (jobs.length === 0) return

        const currentJob = jobs[0]

        // Optimistic UI Update
        setJobs(prev => prev.slice(1))

        if (direction === 'right') {
            try {
                const { error } = await supabase.from('job_applications').insert({
                    job_id: currentJob.id,
                    student_id: studentId,
                    status: 'applied'
                })

                if (error) {
                    console.error('Supabase Error:', error)
                    alert('Erro ao se candidatar: ' + error.message)
                } else {
                    console.log('Applied to', currentJob.title)
                }
            } catch (error: any) {
                console.error('Error applying:', error)
            }
        }
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-muted/10 rounded-3xl border-2 border-dashed">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Todas as vagas vistas!</h3>
                <p className="text-muted-foreground text-sm max-w-[250px]">Volte mais tarde para novas oportunidades ou confira suas candidaturas.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full max-w-sm mx-auto h-[65vh] perspective-1000">
            <AnimatePresence>
                {jobs.map((job, index) => {
                    if (index > 1) return null // Limit to top 2 cards
                    return (
                        <JobCard
                            key={job.id}
                            job={job}
                            index={index}
                            isTop={index === 0}
                            onSwipe={swipe}
                        />
                    )
                })}
            </AnimatePresence>

            {/* Manual Controls */}
            <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-6 z-10">
                <button
                    onClick={() => swipe('left')}
                    className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full shadow-lg border flex items-center justify-center text-red-500 hover:scale-110 transition-transform focus:outline-none hover:bg-red-50"
                    aria-label="Dislike"
                >
                    <X className="w-8 h-8" />
                </button>
                <button
                    onClick={() => swipe('right')}
                    className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full shadow-lg border flex items-center justify-center text-green-500 hover:scale-110 transition-transform focus:outline-none hover:bg-green-50"
                    aria-label="Like"
                >
                    <Check className="w-8 h-8" />
                </button>
            </div>
        </div>
    )
}
