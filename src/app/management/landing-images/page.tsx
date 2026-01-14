'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Trash2, Upload, GripVertical, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface LandingImage {
    id: string
    image_url: string
    order_index: number
    is_active: boolean
}

export default function LandingImagesManagement() {
    const [images, setImages] = useState<LandingImage[]>([])
    const [uploading, setUploading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        const { data, error } = await supabase
            .from('landing_images')
            .select('*')
            .order('order_index')

        if (data) setImages(data)
    }

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('landing_bucket')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('landing_bucket')
                .getPublicUrl(filePath)

            // 2. Insert into DB
            const { error: dbError } = await supabase
                .from('landing_images')
                .insert([{
                    image_url: publicUrl,
                    order_index: images.length + 1
                }])

            if (dbError) throw dbError

            toast({ title: 'Sucesso', description: 'Imagem adicionada ao carrossel.' })
            fetchImages()
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao fazer upload.', variant: 'destructive' })
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from('landing_images')
            .update({ is_active: !currentState })
            .eq('id', id)

        if (!error) fetchImages()
    }

    const deleteImage = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja remover esta imagem?')) return

        // Extract filename if it matches our bucket pattern
        // Note: We won't try to delete from 'public/carousel' local paths, only bucket ones
        // But removing the DB entry is the most important part.

        const { error } = await supabase
            .from('landing_images')
            .delete()
            .eq('id', id)

        if (!error) {
            fetchImages()
            toast({ title: 'Imagem removida' })
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Carrossel da Home</h1>
                    <p className="text-muted-foreground">Adicione e gerencie as fotos de fundo da página inicial.</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="upload-slide"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="upload-slide">
                        <Button asChild disabled={uploading} className="cursor-pointer">
                            <span>
                                <Upload className="mr-2 w-4 h-4" />
                                {uploading ? 'Enviando...' : 'Adicionar Foto'}
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            <div className="grid gap-4">
                {images.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                        Nenhuma imagem no carrossel. Adicione a primeira!
                    </div>
                ) : (
                    images.map((img, index) => (
                        <Card key={img.id} className="p-4 flex items-center gap-4 group hover:border-primary/50 transition-colors">
                            <div className="text-muted-foreground font-mono w-6 text-center">
                                #{index + 1}
                            </div>

                            <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-slate-100 border">
                                <img src={img.image_url} alt="Slide" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate font-mono">{img.image_url}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={img.is_active}
                                        onCheckedChange={() => toggleActive(img.id, img.is_active)}
                                    />
                                    <span className={`text-sm ${img.is_active ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                                        {img.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteImage(img.id, img.image_url)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
