
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterCompanyPage() {
    const [step, setStep] = useState(1) // 1: User Account, 2: Company Details
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form Data
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')

    const [companyName, setCompanyName] = useState('')
    const [description, setDescription] = useState('')
    const [website, setWebsite] = useState('')

    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'company',
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                // Note: If email confirmation is enabled, user might not be signed in immediately.
                // We assume for this flow that session is created (auto-confirm or user manually verifies first).
                // If session is null, we can't create the company yet.

                if (!authData.session) {
                    alert('Cadastro realizado! Por favor, verifique seu email para confirmar a conta antes de continuar o cadastro da empresa.')
                    router.push('/login')
                    return
                }

                // 2. Create Company
                const { data: companyData, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        name: companyName,
                        description: description,
                        website: website,
                        status: 'pending' // Enforced by default but good to be explicit if allowed
                    })
                    .select()
                    .single()

                if (companyError) throw companyError

                // 3. Link Company to User Profile
                if (companyData) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ company_id: companyData.id })
                        .eq('id', authData.user.id)

                    if (profileError) throw profileError
                }

                router.push('/company') // Redirect to dashboard
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Cadastro de Empresa</CardTitle>
                    <CardDescription>
                        Cadastre sua empresa para acessar o banco de talentos.
                        {step === 1 ? ' Passo 1: Dados de Acesso' : ' Passo 2: Dados da Empresa'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Step 1: User Info */}
                        <div className={step === 1 ? 'grid gap-4' : 'hidden'}>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Responsável</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    required={step === 1}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="voce@empresa.com"
                                    required={step === 1}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={step === 1}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Step 2: Company Info */}
                        <div className={step === 2 ? 'grid gap-4' : 'hidden'}>
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Nome da Empresa</Label>
                                <Input
                                    id="companyName"
                                    type="text"
                                    placeholder="Nome da Startup/Empresa"
                                    required={step === 2}
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://suaempresa.com"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição Breve</Label>
                                <Textarea
                                    id="description"
                                    placeholder="O que sua empresa faz?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {step === 2 && (
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                Voltar
                            </Button>
                        )}
                        {step === 1 ? (
                            <Button className="w-full" type="button" onClick={() => setStep(2)}>
                                Próximo
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="w-full ml-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finalizar Cadastro
                            </Button>
                        )}

                    </CardFooter>
                </form>
                <div className="text-center text-sm mb-6">
                    Já tem conta? <Link href="/login" className="underline">Entrar</Link>
                </div>
            </Card>
        </div>
    )
}
