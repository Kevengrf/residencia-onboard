
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { Building2, GraduationCap, LayoutDashboard, Users, UserCog } from 'lucide-react'

type UserRole = 'student' | 'company' | 'ies' | 'management' | 'support'

export function AuthModal({
    children,
    defaultTab = 'login',
    id,
    open,
    onOpenChange
}: {
    children?: React.ReactNode,
    defaultTab?: 'login' | 'register',
    id?: string,
    open?: boolean,
    onOpenChange?: (open: boolean) => void
}) {
    const [activeRole, setActiveRole] = useState<UserRole>('student')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Login State
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Register State
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regPeriod, setRegPeriod] = useState('1') // Default to 1st period

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            })
            if (error) throw error
            if (data.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
                const role = profile?.role || 'student'
                router.push(`/${role}`)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
                options: {
                    data: {
                        full_name: regName,
                        role: activeRole,
                        residency_period: activeRole === 'student' ? parseInt(regPeriod) : 1
                    }
                }
            })
            if (error) throw error
            alert('Cadastro realizado! Verifique seu email.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Only render Trigger if children exist
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent id={id} className="sm:max-w-[450px] p-0 border-0 overflow-hidden bg-transparent shadow-2xl [&>button]:text-zinc-400 [&>button]:hover:text-white [&>button]:top-6 [&>button]:right-6 [&>button]:z-50 ring-0 outline-none">
                {/* Visual Header / Brand Area */}
                <div className="bg-zinc-950 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                    <div className="relative z-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white">Acesse o Portal</DialogTitle>
                        <DialogDescription className="text-zinc-400 mt-2 text-base">
                            Entre ou crie sua conta para começar.
                        </DialogDescription>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 pt-6">
                    {/* Role Selector styled as Segmented Control */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
                        {[
                            { id: 'student', label: 'Aluno', icon: Users },
                            { id: 'company', label: 'Empresa', icon: Building2 },
                            { id: 'ies', label: 'IES', icon: GraduationCap },
                            { id: 'management', label: 'Gestão', icon: LayoutDashboard },
                            // { id: 'support', label: 'Suporte', icon: UserCog }
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setActiveRole(role.id as UserRole)}
                                className={`
                                    flex flex-col items-center justify-center py-2.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200
                                    ${activeRole === role.id
                                        ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm scale-[1.02]'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}
                                `}
                            >
                                <role.icon className={`w-4 h-4 mb-1 ${activeRole === role.id ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`} />
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center border border-red-100">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent p-0 border-b border-zinc-100 dark:border-zinc-800 h-auto gap-4 rounded-none">
                            <TabsTrigger
                                value="login"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 text-zinc-500 data-[state=active]:text-blue-600 transition-all font-medium"
                            >
                                Entrar
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 text-zinc-500 data-[state=active]:text-blue-600 transition-all font-medium"
                            >
                                Criar Conta
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 mt-2 font-medium shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all hover:scale-[1.01]" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Acessar Portal
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                            <form onSubmit={handleRegister} className="space-y-4">
                                {activeRole === 'company' && (
                                    <div className="text-xs bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                                        <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>Cadastro sujeito à aprovação da gestão.</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Nome Completo {activeRole === 'company' && '(Responsável)'}</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-email" className="text-zinc-700 dark:text-zinc-300">Email Profissional</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password" className="text-zinc-700 dark:text-zinc-300">Criar Senha</Label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        required
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20 mt-2 transition-all hover:scale-[1.01]" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Conta {activeRole === 'student' ? 'Aluno' : activeRole === 'company' ? 'Empresa' : activeRole.toUpperCase()}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
