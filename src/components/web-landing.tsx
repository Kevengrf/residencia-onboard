
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth-modal'
import { ArrowRight } from 'lucide-react'
import { LandingCarousel } from '@/components/landing-carousel'
import { ColorfulGrid } from '@/components/colorful-grid' // NEW IMPORT

import { MainNavbar } from '@/components/main-navbar'

export default function WebLanding() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <MainNavbar />

            {/* Removed misplaced import */}

            <main className="flex-1">
                <section className="py-20 md:py-32 relative overflow-hidden min-h-[600px] flex items-center">
                    {/* Background Carousel */}
                    <LandingCarousel />

                    {/* NEW: Colorful Grid Overlay */}
                    <ColorfulGrid />

                    {/* Darker Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm">
                            Residência Tecnológica do Porto Digital
                        </div>
                        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-sm">
                            Conexão Real com o <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31C58] via-[#2D5BFF] to-[#00C853]">
                                Mercado de Tecnologia
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                            A plataforma que une talentos, empresas e universidades para acelerar a formação e inovação no maior parque tecnológico urbano do país.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <AuthModal defaultTab="register">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-none bg-[#E31C58] hover:bg-[#C9184A] text-white shadow-lg transition-transform hover:scale-105 border-none">
                                    Quero ser Residente
                                </Button>
                            </AuthModal>
                            <AuthModal defaultTab="register">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-none bg-[#2D5BFF] hover:bg-[#1A44D6] text-white shadow-lg transition-transform hover:scale-105 border-none">
                                    Para Empresas
                                </Button>
                            </AuthModal>
                        </div>
                    </div>
                </section>

                {/* News & Events Section - "Acontece na Residência" */}
                <section className="py-24 bg-white dark:bg-black/20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                    Acontece na Residência
                                </h2>
                                <p className="text-black dark:text-white mt-2 text-lg font-medium">
                                    Fique por dentro dos marcos e eventos que transformam carreiras.
                                </p>
                            </div>
                            <Button variant="ghost" className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 group font-semibold">
                                Ver todas as notícias <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1: Coday */}
                            <div className="group relative overflow-hidden rounded-[2rem] h-[400px] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                                    <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        Demo Day
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Coday: Onde códigos viram conexões</h3>
                                    <p className="text-slate-300 line-clamp-3 mb-4">
                                        Os residentes apresentam suas soluções reais para o mercado em um evento que celebra a inovação e o encerramento do ciclo.
                                    </p>
                                    <span className="text-white font-medium text-sm flex items-center group-hover:underline decoration-yellow-400 underline-offset-4">
                                        Saiba mais <ArrowRight className="ml-2 w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Card 2: CoffeeTalk */}
                            <div className="group relative overflow-hidden rounded-[2rem] h-[400px] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#004d40] to-teal-900" />
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                                    <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        Carreira & Soft Skills
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">CoffeeTalk: Networking Descontraído</h3>
                                    <p className="text-slate-300 line-clamp-3 mb-4">
                                        Encontros mensais para desenvolver liderança, comunicação e inglês, conectando residentes a líderes do Porto Digital.
                                    </p>
                                    <span className="text-white font-medium text-sm flex items-center group-hover:underline decoration-emerald-400 underline-offset-4">
                                        Ver agenda <ArrowRight className="ml-2 w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Card 3: Expansion */}
                            <div className="group relative overflow-hidden rounded-[2rem] h-[400px] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2662&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                                    <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        Expansão Nacional
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Residência Pelo Brasil</h3>
                                    <p className="text-slate-300 line-clamp-3 mb-4">
                                        Levando a metodologia do Porto Digital para Sergipe, Paraíba e outros estados. Tecnologia como política pública de educação.
                                    </p>
                                    <span className="text-white font-medium text-sm flex items-center group-hover:underline decoration-blue-400 underline-offset-4">
                                        Conheça o impacto <ArrowRight className="ml-2 w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-[#0F172A] text-white">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-400">© 2024 Residência Onboard. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 font-medium">Realização:</span>
                        <img
                            src="https://www.portodigital.org/_nuxt/img/logo-negative.d9b5fd1.svg"
                            alt="Porto Digital"
                            className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </footer>
        </div>
    )
}
