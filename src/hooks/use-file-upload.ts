import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UseFileUploadReturn {
  uploading: boolean
  progress: UploadProgress | null
  error: Error | null
  uploadFile: (file: File, folder?: string) => Promise<string | null>
  deleteFile: (filePath: string) => Promise<boolean>
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const uploadFile = async (file: File, folder: string = 'documents'): Promise<string | null> => {
    try {
      setUploading(true)
      setError(null)
      setProgress({ loaded: 0, total: file.size, percentage: 0 })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload do arquivo
      const { data, error: uploadError } = await supabase.storage
        .from('isacar-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('isacar-files')
        .getPublicUrl(data.path)

      setProgress({ loaded: file.size, total: file.size, percentage: 100 })
      
      return urlData.publicUrl
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError(err instanceof Error ? err : new Error('Erro ao fazer upload'))
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(null), 1000)
    }
  }

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      // Extrair path do arquivo da URL
      const urlParts = filePath.split('/storage/v1/object/public/isacar-files/')
      if (urlParts.length < 2) {
        throw new Error('URL inválida')
      }
      
      const path = urlParts[1]
      
      const { error: deleteError } = await supabase.storage
        .from('isacar-files')
        .remove([path])

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err)
      setError(err instanceof Error ? err : new Error('Erro ao deletar arquivo'))
      return false
    }
  }

  return {
    uploading,
    progress,
    error,
    uploadFile,
    deleteFile,
  }
}
