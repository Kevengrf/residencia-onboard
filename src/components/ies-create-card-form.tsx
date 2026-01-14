
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateCardForm({ iesId }: { iesId: string }) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState('news')
    const [imageUrl, setImageUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('ies_cards')
                .insert({
                    ies_id: iesId,
                    title,
                    content,
                    type,
                    image_url: imageUrl || null
                })

            if (error) throw error

            setTitle('')
            setContent('')
            setImageUrl('')
            router.refresh()
        } catch (error) {
            console.error('Error creating card:', error)
            alert('Erro ao criar destaque.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Input
                placeholder="Título do Destaque"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />
            <Textarea
                placeholder="Descrição/Conteúdo..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="resize-none"
            />
            <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="news">Notícia</SelectItem>
                    <SelectItem value="highlight">Destaque</SelectItem>
                    <SelectItem value="achievement">Conquista</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex gap-2">
                <Input
                    placeholder="URL da Imagem (Opcional)"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="text-xs"
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Publicar
            </Button>
        </form>
    )
}
