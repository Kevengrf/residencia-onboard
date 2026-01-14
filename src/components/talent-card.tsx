'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { UserCircle2, Linkedin, Github, Mail } from 'lucide-react'

export function TalentCard({ student }: { student: any }) {
    const [isFlipped, setIsFlipped] = useState(false)

    // Mobile: Click to toggle. Desktop: Hover handles it via CSS, but click can also work.
    // To support "Hover on Desktop" AND "Click on Mobile" without conflict:
    // We can use CSS hover for desktop (`group-hover`) and a class for mobile.
    // Or simpler: Just use click for both? User asked specifically: "Hover on web, click on mobile".

    // Strategy:
    // 1. Keep `group-hover:rotate-y-180` for Desktop.
    // 2. Add `rotate-y-180` class conditionally based on state.
    // 3. Toggle state on click.

    // Issue: If I click on desktop, it might lock it in flipped state.
    // Better Strategy:
    // Use a wrapper that detects touch capabilities or simply allow both.
    // If I click, I toggle 'flipped'. If I hover, I toggle 'flipped' (via CSS).
    // The safest way for hybrid is to separate styles. 
    // Let's use `onClick` to toggle a state `isFlipped`.
    // And apply styles: `transform: isFlipped ? rotateY(180deg) : rotateY(0deg)`
    // BUT user wants Hover on Web.

    // Solution:
    // Add `group` class.
    // Desktop: `group-hover:rotate-y-180` works fine.
    // Mobile: No hover. We add a class `.is-flipped` which applies `rotate-y-180`.
    // We toggle `.is-flipped` on click.

    return (
        <div
            className="group h-80 perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-700 transform-style-3d shadow-lg rounded-[24px] ${isFlipped ? 'rotate-y-180' : 'group-hover:rotate-y-180'}`}>

                {/* FRONT SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-[#004d40] to-teal-600 dark:from-emerald-900 dark:to-teal-900 opacity-90 -z-10" />

                    <div className="w-28 h-28 rounded-full border-4 border-white dark:border-zinc-800 shadow-md bg-white overflow-hidden mb-4 flex-shrink-0">
                        {student.profiles?.avatar_url ? (
                            <img
                                src={student.profiles.avatar_url}
                                alt={student.profiles.full_name || 'Aluno'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                <UserCircle2 className="w-16 h-16" />
                            </div>
                        )}
                    </div>

                    <div className="text-center px-4">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1 mb-1">
                            {student.profiles?.full_name || 'Usuário'}
                        </h3>
                        <p className="text-sm font-medium text-[#004d40] dark:text-emerald-400 truncate uppercase tracking-wider">
                            {student.main_role || 'Residente'}
                        </p>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-zinc-950 rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-center text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#004d40] dark:bg-emerald-600"></div>

                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Contatos e Detalhes</h4>

                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</span>
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="px-3">
                                {student.status === 'active' ? 'Ativo' : student.status}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Período</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {student.residency_period}º Período
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex justify-center gap-4">
                            {/* LinkedIn */}
                            {student.contact_info?.linkedin ? (
                                <a
                                    href={student.contact_info.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all transform hover:scale-110"
                                    onClick={(e) => e.stopPropagation()} // Prevent card flip when clicking link
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed" title="LinkedIn não informado">
                                    <Linkedin className="w-5 h-5" />
                                </div>
                            )}

                            {/* Github */}
                            {student.contact_info?.github ? (
                                <a
                                    href={student.contact_info.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-slate-900/10 text-slate-900 dark:text-white dark:bg-white/10 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all transform hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Github className="w-5 h-5" />
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed" title="Github não informado">
                                    <Github className="w-5 h-5" />
                                </div>
                            )}

                            {/* Portfolio/Email */}
                            {student.contact_info?.email ? (
                                <a
                                    href={`mailto:${student.contact_info.email}`}
                                    className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Mail className="w-5 h-5" />
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed" title="Email não informado">
                                    <Mail className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
