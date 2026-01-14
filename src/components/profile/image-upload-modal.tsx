'use client'

import { useState, useRef, ChangeEvent } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

interface ImageUploadModalProps {
    currentAvatarUrl: string | null
    onUploadComplete: (newUrl: string) => void
    userId: string
}

export function ImageUploadModal({ currentAvatarUrl, onUploadComplete, userId }: ImageUploadModalProps) {
    const [open, setOpen] = useState(false)
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [uploading, setUploading] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const { toast } = useToast()
    const supabase = createClient()

    function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }

    async function onUpload() {
        if (!imgRef.current || !completedCrop) return

        try {
            setUploading(true)

            // Get cropped canvas
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('No 2d context')

            const scaleX = imgRef.current.naturalWidth / imgRef.current.width
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height
            const pixelRatio = window.devicePixelRatio

            canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
            canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)

            ctx.scale(pixelRatio, pixelRatio)
            ctx.imageSmoothingQuality = 'high'

            const cropX = completedCrop.x * scaleX
            const cropY = completedCrop.y * scaleY
            const cropWidth = completedCrop.width * scaleX
            const cropHeight = completedCrop.height * scaleY

            ctx.drawImage(
                imgRef.current,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
            )

            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob)
                        else reject(new Error('Canvas is empty'))
                    },
                    'image/jpeg',
                    0.9,
                )
            })

            // Upload to Supabase
            const fileName = `${userId}-${Date.now()}.jpg`
            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            onUploadComplete(publicUrl)
            setOpen(false)
            toast({ title: 'Foto atualizada com sucesso!' })

        } catch (e) {
            console.error(e)
            toast({ title: 'Erro ao atualizar foto', variant: 'destructive' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-slate-100">
                        {currentAvatarUrl ? (
                            <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <Camera className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Atualizar Foto de Perfil</DialogTitle>
                    <DialogDescription>
                        Escolha uma imagem e corte para usar como sua foto de perfil.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                <p className="text-sm text-slate-500">Clique para selecionar</p>
                            </div>
                            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
                        </label>
                    </div>

                    {imgSrc && (
                        <div className="max-h-[300px] overflow-auto flex justify-center bg-black/10 rounded-md p-2">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-w-full"
                                />
                            </ReactCrop>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onUpload} disabled={!completedCrop || uploading}>
                        {uploading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        Salvar Foto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
