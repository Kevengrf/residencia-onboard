
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Globe, MapPin } from 'lucide-react'
import { MainNavbar } from '@/components/main-navbar'

export const revalidate = 0

export default async function CompaniesPage() {
    const supabase = await createClient()

    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'approved')
        .order('name')



    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <MainNavbar />


            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Nossas Empresas Parceiras</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Conheça as empresas que estão transformando o ecossistema e buscando novos talentos no Porto Digital.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {companies?.map((company) => (
                        <Link
                            key={company.id}
                            href={`/companies/${company.id}`}
                            className="group flex flex-col items-center text-center focus:outline-none"
                        >
                            <div className="relative w-40 h-40 rounded-full bg-white shadow-md border-4 border-white dark:border-white/10 flex items-center justify-center p-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl overflow-hidden mb-4">
                                {company.logo_url ? (
                                    <img
                                        src={company.logo_url}
                                        alt={company.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <Building2 className="w-16 h-16 text-slate-300" />
                                )}
                            </div>

                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 px-2">
                                {company.name}
                            </h3>
                        </Link>
                    ))}

                    {(!companies || companies.length === 0) && (
                        <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-muted-foreground">Nenhuma empresa aprovada encontrada no momento.</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

