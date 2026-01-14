'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth-modal'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export function MainNavbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
    const [isAuthOpen, setIsAuthOpen] = useState(false)

    // Helper to close menu on click
    const handleLinkClick = () => setIsOpen(false)

    const openAuth = (tab: 'login' | 'register') => {
        setAuthTab(tab)
        setIsAuthOpen(true)
        setIsOpen(false) // Close mobile menu if open
    }

    const NavItems = () => (
        <>
            <Link
                href="/companies"
                onClick={handleLinkClick}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/companies' ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                Empresas
            </Link>
            <Link
                href="/ies/public"
                onClick={handleLinkClick}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/ies/public' ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                IES
            </Link>
            <Link
                href="/talents"
                onClick={handleLinkClick}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/talents' ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                Talentos
            </Link>
        </>
    )

    return (
        <>
            <AuthModal
                defaultTab={authTab}
                open={isAuthOpen}
                onOpenChange={setIsAuthOpen}
            />

            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={handleLinkClick}>
                            <img
                                src="https://media.licdn.com/dms/image/v2/D4D0BAQH-YKGfYKVx1g/company-logo_200_200/company-logo_200_200/0/1732814979793/residencia_tecnologica_logo?e=1770249600&v=beta&t=aaPk5TYmoWDiUeS8d5Lj12pXcD5pinGLNsegHpMZDBY"
                                alt="Residência Tecnológica"
                                className="h-9 w-auto"
                            />
                            <span className="hidden lg:inline-block font-semibold text-foreground">
                                Residência Tecnológica
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <NavItems />
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openAuth('login')}>Entrar</Button>
                            <Button size="sm" onClick={() => openAuth('register')}>Inscrever-se</Button>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                                <div className="flex flex-col gap-8 py-6">
                                    <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2">
                                        <img
                                            src="https://media.licdn.com/dms/image/v2/D4D0BAQH-YKGfYKVx1g/company-logo_200_200/company-logo_200_200/0/1732814979793/residencia_tecnologica_logo?e=1770249600&v=beta&t=aaPk5TYmoWDiUeS8d5Lj12pXcD5pinGLNsegHpMZDBY"
                                            alt="Logo"
                                            className="h-8 w-auto"
                                        />
                                        <span className="font-semibold">Residência</span>
                                    </Link>

                                    <nav className="flex flex-col gap-4">
                                        <NavItems />
                                    </nav>

                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button variant="outline" className="w-full" onClick={() => openAuth('login')}>Entrar</Button>
                                        <Button className="w-full" onClick={() => openAuth('register')}>Inscrever-se</Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </>
    )
}
