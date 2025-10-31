import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'

export const exportWhiteboardToPNG = async (canvasElement: HTMLElement, name: string) => {
  try {
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    })

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Erro ao exportar')
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Exportado como PNG!')
    })
  } catch (err) {
    console.error('Export PNG error:', err)
    toast.error('Erro ao exportar PNG')
  }
}

export const exportWhiteboardToPDF = async (canvasElement: HTMLElement, name: string) => {
  try {
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${name}-${Date.now()}.pdf`)

    toast.success('Exportado como PDF!')
  } catch (err) {
    console.error('Export PDF error:', err)
    toast.error('Erro ao exportar PDF')
  }
}

export const copyWhiteboardToClipboard = async (canvasElement: HTMLElement) => {
  try {
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    })

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Erro ao copiar')
        return
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        toast.success('Copiado para área de transferência!')
      } catch (err) {
        toast.error('Erro ao copiar para área de transferência')
      }
    })
  } catch (err) {
    console.error('Copy to clipboard error:', err)
    toast.error('Erro ao copiar')
  }
}
