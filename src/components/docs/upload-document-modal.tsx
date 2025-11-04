import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2 } from 'lucide-react'

interface UploadDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  onSuccess: () => void
}

export const UploadDocumentModal = ({ 
  open, 
  onOpenChange, 
  projectId,
  onSuccess 
}: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo')
      return
    }

    try {
      setUploading(true)

      // 1. Obter user_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // 2. Upload para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${file.name}` 
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 3. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // 4. Detectar categoria
      const getCategory = (type: string) => {
        if (type.includes('pdf')) return 'PDF'
        if (type.includes('word') || type.includes('document')) return 'Word'
        if (type.includes('sheet') || type.includes('excel')) return 'Excel'
        if (type.includes('presentation') || type.includes('powerpoint')) return 'PowerPoint'
        if (type.includes('image')) return 'Image'
        return 'Other'
      }

      // 5. Preparar dados para inserção
      const documentData = {
        user_id: user.id,
        project_id: projectId || null,
        name: file.name,
        file_url: publicUrl,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        category: getCategory(file.type || ''),
      }

      // 6. Criar registro na tabela documents
      const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()

      if (insertError) {
        throw new Error(`Erro ao salvar documento: ${insertError.message}`)
      }

      toast.success('Documento enviado!', {
        description: `${file.name} foi adicionado com sucesso.`,
      })

      onSuccess()
      onOpenChange(false)
      setFile(null)
    } catch (err: any) {
      toast.error('Erro no upload', {
        description: err.message,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Documento</DialogTitle>
          <DialogDescription>
            Envie um arquivo para sua biblioteca de documentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setFile(null)
            }}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
