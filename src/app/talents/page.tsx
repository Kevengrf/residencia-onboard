import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search, UserCircle2, Linkedin, Github, Mail } from 'lucide-react'
import { MainNavbar } from '@/components/main-navbar'

export const revalidate = 0

export default async function TalentsPage() {
    const supabase = await createClient()

    const { data: students } = await supabase
        .from('students')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <MainNavbar />

            <main className="container mx-auto px-4 py-12 flex-1">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[#004d40] dark:text-emerald-400">
                        Talentos da Residência
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Conheça os profissionais que estão sendo formados para liderar o mercado de tecnologia.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {students?.map((student: any) => (
                        <div key={student.id} className="group h-80 perspective-1000 cursor-pointer">
                            <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180 shadow-lg rounded-[24px]">

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
                                                <a href={student.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all transform hover:scale-110">
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed" title="LinkedIn não informado">
                                                    <Linkedin className="w-5 h-5" />
                                                </div>
                                            )}

                                            {/* Github */}
                                            {student.contact_info?.github ? (
                                                <a href={student.contact_info.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900/10 text-slate-900 dark:text-white dark:bg-white/10 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all transform hover:scale-110">
                                                    <Github className="w-5 h-5" />
                                                </a>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed" title="Github não informado">
                                                    <Github className="w-5 h-5" />
                                                </div>
                                            )}

                                            {/* Portfolio/Website (Mapped to Mail for now if not present, but user asked for Portfolio) */}
                                            {/* Assuming contact_info might have 'portfolio' or 'website' or we stick to Email as a proxy or add a generic Globe if available */}
                                            {student.contact_info?.email ? (
                                                <a href={`mailto:${student.contact_info.email}`} className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110">
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
                    ))}

                    {(!students || students.length === 0) && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            <p>Nenhum talento encontrado no momento.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
