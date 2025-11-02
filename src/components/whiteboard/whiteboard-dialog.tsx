import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ReactNode, MouseEvent as ReactMouseEvent, FocusEvent as ReactFocusEvent, SVGProps } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useWhiteboard } from '@/hooks/use-whiteboard'
import { WhiteboardCheckbox } from './whiteboard-checkbox'
import { WhiteboardNote } from './whiteboard-note'
import { WhiteboardText } from './whiteboard-text'
import { WhiteboardBox } from './whiteboard-box'
import { WhiteboardCircle } from './whiteboard-circle'
import { WhiteboardTriangle } from './whiteboard-triangle'
import { WhiteboardDiamond } from './whiteboard-diamond'
import { WhiteboardHexagon } from './whiteboard-hexagon'
import { WhiteboardStar } from './whiteboard-star'
import { WhiteboardPentagon } from './whiteboard-pentagon'
import { WhiteboardTrapezoid } from './whiteboard-trapezoid'
import { WhiteboardCloud } from './whiteboard-cloud'
import { WhiteboardSpeech } from './whiteboard-speech'
import { WhiteboardHeart } from './whiteboard-heart'
import { WhiteboardLine } from './whiteboard-line'
import { WhiteboardArrow } from './whiteboard-arrow'
import { WhiteboardPen } from './whiteboard-pen'
import { WhiteboardImage } from './whiteboard-image'
import { WhiteboardItem } from '@/types/whiteboard'
import { CollaboratorCursor } from './collaborator-cursor'
import { ZoomControls } from './zoom-controls'
import { ShareDialog } from './share-dialog'
import { Input } from '@/components/ui/input'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSeparator,
  MenubarRadioGroup,
  MenubarRadioItem
} from '@/components/ui/menubar'
import FuturisticToolbar, { ToolItem } from './futuristic-toolbar'
import { useWhiteboardPresence } from '@/hooks/use-whiteboard-presence'
import { useWhiteboardCollaborators } from '@/hooks/use-whiteboard-collaborators'
import { AddCollaboratorsDialog } from './add-collaborators-dialog'
import { CollaboratorsAvatars } from './collaborators-avatars'
import { exportWhiteboardToPNG, exportWhiteboardToPDF, copyWhiteboardToClipboard } from '@/lib/whiteboard-export'
import { 
  CheckSquare, 
  StickyNote, 
  Type, 
  Square,
  Pen,
  Shapes,
  ArrowRight, 
  Loader2, 
  Diamond as DiamondIcon,
  Hexagon as HexagonIcon,
  Star,
  Pentagon as PentagonIcon,
  Cloud,
  MessageCircle,
  Heart,
  X,
  MousePointer2,
  Hand,
  Triangle,
  ArrowUp,
  Image as ImageIcon,
  Box,
  Smile,
  Circle,
  Minus,
  MoreVertical,
  Check,
  CloudOff,
  RefreshCcw,
  Undo,
  Redo,
  Download,
  Copy,
  FileImage,
  FileText,
  Share2,
  Users,
  ZoomIn,
  ZoomOut,
  Eraser,
  SlidersHorizontal,
  Palette,
  Highlighter,
  CaseSensitive,
  Bold,
  TextCursorInput,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  Menu
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { toast } from 'sonner'

interface Props {
  projectId?: string
  whiteboardId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TrapezoidIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M7 4h10l3 16H4z" fill="currentColor" stroke="none" />
  </svg>
)

interface ToolbarSubmenuButtonProps {
  label: string
  isActive: boolean
  onToggle: () => void
  renderTrigger: (context: { isActive: boolean; onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void }) => ReactNode
  children: ReactNode
}

const ToolbarSubmenuButton = ({ label, isActive, onToggle, renderTrigger, children }: ToolbarSubmenuButtonProps) => {
  const handleClick = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onToggle()
  }, [onToggle])

  const trigger = renderTrigger({ isActive, onClick: handleClick })

  return (
    <div className="relative flex">
      {isActive ? (
        trigger
      ) : (
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      )}

      {isActive && (
        <div className="absolute bottom-11 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border/40 bg-background/95 p-1 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-lg">
          {children}
        </div>
      )}
    </div>
  )
}

const DEFAULT_FONT_FAMILY = 'Inter, system-ui, sans-serif'
const DEFAULT_FONT_WEIGHT = 500
const DEFAULT_FONT_SIZE = 14

export const WhiteboardDialog = ({ projectId, whiteboardId, open, onOpenChange }: Props) => {
  const { t } = useI18n()
  const [fullscreen, setFullscreen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'pink' | 'blue' | 'green'>('yellow')
  const [selectedShapeColor, setSelectedShapeColor] = useState<'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red' | 'yellow' | 'cyan' | 'gray'>('blue')
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showTopToolbar, setShowTopToolbar] = useState(false)
  const [showRightToolbar, setShowRightToolbar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showShapesMenu, setShowShapesMenu] = useState(false)
  const [showArrowMenu, setShowArrowMenu] = useState(false)
  const [showPenMenu, setShowPenMenu] = useState(false)
  const [arrowStrokeWidth, setArrowStrokeWidth] = useState<number>(2)
  const [strokeHistory, setStrokeHistory] = useState<number[]>([2, 4, 6])
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT_FAMILY)
  const [fontWeight, setFontWeight] = useState<number>(DEFAULT_FONT_WEIGHT)
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE)
  const [penMode, setPenMode] = useState<'draw' | 'erase'>('draw')
  const [penType, setPenType] = useState<'pen' | 'marker'>('pen')
  const [penSmoothing, setPenSmoothing] = useState<number>(1)
  const [selectedPenId, setSelectedPenId] = useState<string | null>(null)
  const [activeTextId, setActiveTextId] = useState<string | null>(null)
  const [activeShapeSubmenu, setActiveShapeSubmenu] = useState<'shape' | 'colors' | null>(null)
  const [activeArrowSubmenu, setActiveArrowSubmenu] = useState<'style' | 'thickness' | 'colors' | null>(null)

  const [lastShapeType, setLastShapeType] = useState<
    'box' | 'circle' | 'triangle' | 'line' | 'diamond' | 'hexagon' | 'star' | 'pentagon' | 'trapezoid' | 'cloud' | 'speech' | 'heart'
  >('box')
  const [userId, setUserId] = useState<string | undefined>()
  const [localItems, setLocalItems] = useState<WhiteboardItem[]>([])
  const penDrawingIdRef = useRef<string | null>(null)
  const penDrawingTypeRef = useRef<'pen' | 'marker'>('pen')
  const [activePenSubmenu, setActivePenSubmenu] = useState<'type' | 'thickness' | 'colors' | 'smoothing' | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [whiteboardName, setWhiteboardName] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  // Flag para evitar "ping-pong" entre estado local e item quando mudança vem do UI
  const updatingTextFromUIRef = useRef(false)

  const MIN_PEN_DELTA = 0.5
  const imageInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { whiteboard, loading, saving, hasChanges, addItem, updateItem, deleteItem, save, toggleFavorite, undo, redo, canUndo, canRedo, uploadImage } = useWhiteboard({ projectId, whiteboardId })
  // Safe wrappers para funcionar sem DB
  const addItemSafe = useCallback((item: WhiteboardItem) => {
    if (whiteboard) return addItem(item)
    setLocalItems(prev => [...prev, item])
  }, [whiteboard, addItem])

  const updateItemSafe = useCallback((id: string, updates: Partial<WhiteboardItem>) => {
    if (whiteboard) return updateItem(id, updates)
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [whiteboard, updateItem])

  const deleteItemSafe = useCallback((id: string) => {
    if (whiteboard) return deleteItem(id)
    setLocalItems(prev => prev.filter(i => i.id !== id))
  }, [whiteboard, deleteItem])

  // Real-time presence (online users)
  const { collaborators: onlineCollaborators, updateCursor } = useWhiteboardPresence(whiteboard?.id, userId)

  // All collaborators (with access)
  const { collaborators: allCollaborators, loading: loadingCollaborators } = useWhiteboardCollaborators(
    whiteboard?.id,
    whiteboard?.user_id
  )

  const allItems = useMemo(() => whiteboard?.items ?? localItems, [whiteboard?.items, localItems])

  const penItems = useMemo(() => allItems.filter(item => item.type === 'pen'), [allItems])

  const statusState = useMemo(() => {
    if (saving) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: 'Salvando...',
        tone: 'muted' as const,
        interactive: false as const,
        action: undefined,
      }
    }

    if (!saving && hasChanges) {
      return {
        icon: <RefreshCcw className="h-4 w-4" />,
        label: 'Salvar alterações agora',
        tone: 'warning' as const,
        interactive: true as const,
        action: save,
      }
    }

    if (!saving && !hasChanges && whiteboard) {
      return {
        icon: <Check className="h-4 w-4" />,
        label: 'Tudo salvo',
        tone: 'success' as const,
        interactive: false as const,
        action: undefined,
      }
    }

    return null
  }, [saving, hasChanges, whiteboard, save])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id)
      } catch (err: any) {
        // Auth indisponível: seguir sem usuário para não quebrar o fluxo
        setUserId(undefined)
        console.warn('⚠️ Supabase Auth offline. Undo/Redo funcionando localmente.')
        if (err?.message?.includes('Failed to fetch')) {
          console.info('💡 Veja SUPABASE_SETUP.md para corrigir ERR_CONNECTION_CLOSED')
        }
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (whiteboard?.name) {
      setWhiteboardName(whiteboard.name)
    }
  }, [whiteboard?.name])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    console.log('WhiteboardDialog - open changed:', open);
    console.log('WhiteboardDialog - projectId:', projectId);
  }, [open, projectId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem'
      })
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'Tamanho máximo: 5MB'
      })
      return
    }

    setUploadingImage(true)
    const imageUrl = await uploadImage(file)
    
    if (imageUrl) {
      addItem({
        id: nanoid(),
        type: 'image',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        imageUrl,
        width: 200,
        height: 200
      })
      toast.success('Imagem adicionada com sucesso!')
    }
    
    setUploadingImage(false)
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleImageClick = useCallback(() => {
    if (uploadingImage) return
    
    // Garantir que o input existe e está acessível
    if (imageInputRef.current) {
      // Reset do input antes de abrir (para permitir upload da mesma imagem novamente)
      imageInputRef.current.value = ''
      
      // Trigger click em input file
      try {
        imageInputRef.current.click()
      } catch (error) {
        console.error('Erro ao abrir seletor de imagem:', error)
        toast.error('Erro ao abrir seletor de imagem')
      }
    }
  }, [uploadingImage])


  const handleExportPNG = async () => {
    if (!canvasRef.current) return
    await exportWhiteboardToPNG(canvasRef.current, whiteboard?.name || 'whiteboard')
  }

  const handleExportPDF = async () => {
    if (!canvasRef.current) return
    await exportWhiteboardToPDF(canvasRef.current, whiteboard?.name || 'whiteboard')
  }

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return
    await copyWhiteboardToClipboard(canvasRef.current)
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (clientX - rect.left - pan.x) / zoom
    const y = (clientY - rect.top - pan.y) / zoom
    updateCursor(x, y)

    // Handle Panning
    if (isPanning && selectedTool === 'hand') {
      const dx = clientX - panStart.x
      const dy = clientY - panStart.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      setPanStart({ x: clientX, y: clientY })
    } else if (isDrawing && selectedTool === 'pen' && penDrawingIdRef.current) {
      // adicionar ponto ao traço atual
      const id = penDrawingIdRef.current
      const item = allItems.find(i => i.id === id)
      const prevPoints = item?.points || []
      const smoothing = Math.max(1, penSmoothing)
      const lastPoint = prevPoints[prevPoints.length - 1]
      const smoothedPoint = lastPoint
        ? {
            x: (lastPoint.x * (smoothing - 1) + x) / smoothing,
            y: (lastPoint.y * (smoothing - 1) + y) / smoothing,
          }
        : { x, y }
      if (lastPoint) {
        const dx = smoothedPoint.x - lastPoint.x
        const dy = smoothedPoint.y - lastPoint.y
        if (dx * dx + dy * dy < MIN_PEN_DELTA * MIN_PEN_DELTA) {
          return
        }
      }
      const nextPoints = [...prevPoints, smoothedPoint]
      const drawingType = (item?.penStyle as 'pen' | 'marker' | undefined) ?? penDrawingTypeRef.current ?? 'pen'
      const { strokeWidth, opacity } = getPenAttributes(drawingType)
      updateItemSafe(id, {
        points: nextPoints,
        strokeWidth,
        opacity,
        penStyle: drawingType,
      })
    } else if (isErasing && selectedTool === 'pen') {
      eraseAtPoint(x, y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX, e.clientY)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'hand') {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    } else if (selectedTool === 'pen') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      if (!canvasRef.current) return
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      if (penMode === 'erase') {
        setIsErasing(true)
        eraseAtPoint(x, y)
      } else {
        const id = nanoid()
        penDrawingIdRef.current = id
        const drawingType = penType
        penDrawingTypeRef.current = drawingType
        const { strokeWidth, opacity } = getPenAttributes(drawingType)
        addItemSafe({
          id,
          type: 'pen',
          position: { x: 0, y: 0 },
          points: [{ x, y }],
          shapeColor: selectedShapeColor,
          strokeWidth,
          opacity,
          penStyle: drawingType,
        } as WhiteboardItem)
        setSelectedPenId(id)
        setIsDrawing(true)
      }
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    if (isDrawing) {
      setIsDrawing(false)
      penDrawingIdRef.current = null
    }
    if (isErasing) {
      setIsErasing(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return

    if (selectedTool === 'hand') {
      setIsPanning(true)
      setPanStart({ x: touch.clientX, y: touch.clientY })
    } else if (selectedTool === 'pen') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (touch.clientX - rect.left - pan.x) / zoom
      const y = (touch.clientY - rect.top - pan.y) / zoom
      if (penMode === 'erase') {
        setIsErasing(true)
        eraseAtPoint(x, y)
      } else {
        const id = nanoid()
        penDrawingIdRef.current = id
        const initialStroke = penType === 'marker' ? Math.max(arrowStrokeWidth * 1.8, 6) : arrowStrokeWidth
        addItemSafe({
          id,
          type: 'pen',
          position: { x: 0, y: 0 },
          points: [{ x, y }],
          shapeColor: selectedShapeColor,
          strokeWidth: initialStroke,
          opacity: penType === 'marker' ? 0.35 : 1,
        } as WhiteboardItem)
        setSelectedPenId(id)
        setIsDrawing(true)
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return

    handlePointerMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      setIsPanning(false)
      if (isDrawing) {
        setIsDrawing(false)
        penDrawingIdRef.current = null
      }
      if (isErasing) {
        setIsErasing(false)
      }
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.3))
  }

  const handleZoomReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleTitleSave = async () => {
    if (!whiteboard || !whiteboardName.trim()) return
    setEditingTitle(false)
    // Aqui você pode adicionar lógica para salvar no backend
    toast.success('Título atualizado!')
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setEditingTitle(false)
      setWhiteboardName(whiteboard?.name || '')
    }
  }

  const colors = [
    { name: 'yellow', class: 'bg-yellow-400' },
    { name: 'pink', class: 'bg-pink-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'green', class: 'bg-green-400' },
  ]

  const fontFamilies = [
    { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { label: 'Roboto', value: 'Roboto, system-ui, sans-serif' },
    { label: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
  ]

  const fontWeights = [300, 400, 500, 600, 700]
  const fontSizes = [12, 14, 16, 18, 20, 24, 32]

  const closeMenus = useCallback(() => {
    setShowShapesMenu(false)
    setShowArrowMenu(false)
    setShowPenMenu(false)
  }, [])

  const handleShapeSubmenuToggle = useCallback((submenu: 'shape' | 'colors') => {
    setActiveShapeSubmenu(prev => (prev === submenu ? null : submenu))
  }, [])

  const smoothingOptions = [
    { label: 'Baixa', value: 1 },
    { label: 'Média', value: 3 },
    { label: 'Alta', value: 5 },
  ]

  const getPenAttributes = useCallback((type: 'pen' | 'marker') => {
    if (type === 'marker') {
      return {
        strokeWidth: Math.max(arrowStrokeWidth * 3, 12),
        opacity: 0.45,
      }
    }

    return {
      strokeWidth: arrowStrokeWidth,
      opacity: 1,
    }
  }, [arrowStrokeWidth])

  const handlePenSubmenuToggle = useCallback((submenu: 'type' | 'thickness' | 'colors' | 'smoothing') => {
    setActivePenSubmenu(prev => (prev === submenu ? null : submenu))
    if (submenu !== 'type') {
      setPenMode('draw')
    }
  }, [])

  const handleTextFocus = useCallback((item: WhiteboardItem) => {
    // Ao focar um texto existente, garantir que o menubar de texto apareça
    if (selectedTool !== 'text') {
      setSelectedTool('text')
    }
    setActiveTextId(item.id)
    setFontFamily(item.fontFamily ?? DEFAULT_FONT_FAMILY)
    setFontWeight(item.fontWeight ?? DEFAULT_FONT_WEIGHT)
    setFontSize(item.fontSize ?? DEFAULT_FONT_SIZE)
  }, [selectedTool])

  const handleTextBlur = useCallback((event?: ReactFocusEvent<HTMLInputElement>) => {
    const relatedTarget = event?.relatedTarget as HTMLElement | null
    if (relatedTarget?.closest('[data-text-menubar="true"]')) {
      return
    }

    setActiveTextId(null)
  }, [])

  useEffect(() => {
    if (!showPenMenu) {
      setActivePenSubmenu(null)
    }
  }, [showPenMenu])

  useEffect(() => {
    if (penMode === 'erase') {
      setActivePenSubmenu(null)
    }
  }, [penMode])

  useEffect(() => {
    if (selectedTool !== 'text') {
      setActiveTextId(null)
    }
  }, [selectedTool])

  useEffect(() => {
    if (!activeTextId) return

    const activeItem = allItems.find(item => item.id === activeTextId && item.type === 'text')
    if (!activeItem) return

    // Se a mudança veio do UI, ignorar uma rodada de sync para não desfazer a seleção do usuário
    if (updatingTextFromUIRef.current) {
      return
    }

    const nextFamily = activeItem.fontFamily ?? DEFAULT_FONT_FAMILY
    const nextWeight = activeItem.fontWeight ?? DEFAULT_FONT_WEIGHT
    const nextSize = activeItem.fontSize ?? DEFAULT_FONT_SIZE

    if (fontFamily !== nextFamily) {
      setFontFamily(nextFamily)
    }
    if (fontWeight !== nextWeight) {
      setFontWeight(nextWeight)
    }
    if (fontSize !== nextSize) {
      setFontSize(nextSize)
    }
  }, [activeTextId, allItems, fontFamily, fontWeight, fontSize])

  useEffect(() => {
    if (!activeTextId) return

    const activeItem = allItems.find(item => item.id === activeTextId && item.type === 'text')
    if (!activeItem) return

    const updates: Partial<WhiteboardItem> = {}

    if ((activeItem.fontFamily ?? DEFAULT_FONT_FAMILY) !== fontFamily) {
      updates.fontFamily = fontFamily
    }
    if ((activeItem.fontWeight ?? DEFAULT_FONT_WEIGHT) !== fontWeight) {
      updates.fontWeight = fontWeight
    }
    if ((activeItem.fontSize ?? DEFAULT_FONT_SIZE) !== fontSize) {
      updates.fontSize = fontSize
    }

    if (Object.keys(updates).length > 0) {
      updateItemSafe(activeTextId, updates)
    }
    // Libera o guard assim que o item refletir (roda a cada render; suficiente para um frame)
    if (updatingTextFromUIRef.current) {
      updatingTextFromUIRef.current = false
    }
  }, [activeTextId, allItems, fontFamily, fontWeight, fontSize, updateItemSafe])

  const handleStrokeWidthChange = useCallback((width: number) => {
    setArrowStrokeWidth(width)
    setStrokeHistory(prev => [width, ...prev.filter(w => w !== width)].slice(0, 5))
  }, [])

  const eraseAtPoint = useCallback((x: number, y: number) => {
    const threshold = 20 / zoom
    const radiusSq = threshold * threshold
    const target = penItems.find(item => (item.points || []).some(pt => {
      const dx = pt.x - x
      const dy = pt.y - y
      return dx * dx + dy * dy <= radiusSq
    }))
    if (target) {
      deleteItemSafe(target.id)
    }
  }, [penItems, deleteItemSafe, zoom])

  const handleAdd = useCallback((type: 'checkbox' | 'note' | 'text' | 'box' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'pentagon' | 'trapezoid' | 'cloud' | 'speech' | 'heart' | 'line' | 'arrow' | 'pen') => {
    closeMenus()
    const baseItem = {
      id: nanoid(),
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
    }

    if (type === 'note') {
      addItemSafe({ ...baseItem, content: '', color: selectedColor })
    } else if (type === 'checkbox') {
      addItemSafe({ ...baseItem, content: '', checked: false })
    } else if (type === 'box') {
      setLastShapeType('box')
      addItemSafe({ ...baseItem, width: 200, height: 150 })
    } else if (type === 'circle') {
      setLastShapeType('circle')
      addItemSafe({ ...baseItem, radius: 50, shapeColor: selectedShapeColor })
    } else if (type === 'triangle') {
      setLastShapeType('triangle')
      addItemSafe({ ...baseItem, width: 100, height: 100, shapeColor: selectedShapeColor })
    } else if (type === 'diamond') {
      setLastShapeType('diamond')
      addItemSafe({ ...baseItem, width: 140, height: 140, shapeColor: selectedShapeColor })
    } else if (type === 'hexagon') {
      setLastShapeType('hexagon')
      addItemSafe({ ...baseItem, width: 160, height: 140, shapeColor: selectedShapeColor })
    } else if (type === 'star') {
      setLastShapeType('star')
      addItemSafe({ ...baseItem, width: 160, height: 160, shapeColor: selectedShapeColor })
    } else if (type === 'pentagon') {
      setLastShapeType('pentagon')
      addItemSafe({ ...baseItem, width: 160, height: 150, shapeColor: selectedShapeColor })
    } else if (type === 'trapezoid') {
      setLastShapeType('trapezoid')
      addItemSafe({ ...baseItem, width: 200, height: 120, shapeColor: selectedShapeColor })
    } else if (type === 'cloud') {
      setLastShapeType('cloud')
      addItemSafe({ ...baseItem, width: 200, height: 120, shapeColor: selectedShapeColor })
    } else if (type === 'speech') {
      setLastShapeType('speech')
      addItemSafe({ ...baseItem, width: 200, height: 140, shapeColor: selectedShapeColor })
    } else if (type === 'heart') {
      setLastShapeType('heart')
      addItemSafe({ ...baseItem, width: 160, height: 150, shapeColor: selectedShapeColor })
    } else if (type === 'line') {
      setLastShapeType('line')
      addItemSafe({ ...baseItem, width: 150, shapeColor: selectedShapeColor, strokeWidth: arrowStrokeWidth })
    } else if (type === 'arrow') {
      addItemSafe({ 
        ...baseItem, 
        points: [{ x: 0, y: 0 }, { x: 150, y: 0 }],
        shapeColor: selectedShapeColor,
        strokeWidth: arrowStrokeWidth
      })
    } else if (type === 'text') {
      addItemSafe({ ...baseItem, content: '', fontFamily, fontWeight, fontSize })
      setActiveTextId(baseItem.id)
    } else if (type === 'pen') {
      addItemSafe({ ...baseItem, points: [], shapeColor: selectedShapeColor, strokeWidth: arrowStrokeWidth })
    } else {
      addItemSafe({ ...baseItem, content: '' })
    }
    toast.success(`Adicionado!`)
  }, [closeMenus, addItemSafe, selectedColor, selectedShapeColor, fontFamily, fontWeight, fontSize, arrowStrokeWidth])

  const shapeColors = [
    { name: 'blue' as const, class: 'bg-blue-500' },
    { name: 'green' as const, class: 'bg-green-500' },
    { name: 'purple' as const, class: 'bg-purple-500' },
    { name: 'pink' as const, class: 'bg-pink-500' },
    { name: 'orange' as const, class: 'bg-orange-500' },
    { name: 'red' as const, class: 'bg-red-500' },
    { name: 'yellow' as const, class: 'bg-yellow-500' },
    { name: 'cyan' as const, class: 'bg-cyan-500' },
    { name: 'gray' as const, class: 'bg-gray-500' },
  ]

  const shapeOptions = [
    {
      type: 'box' as const,
      Icon: Square,
      label: 'Retângulo',
      shortcut: 'R',
    },
    {
      type: 'circle' as const,
      Icon: Circle,
      label: 'Círculo',
      shortcut: 'O',
    },
    {
      type: 'triangle' as const,
      Icon: Triangle,
      label: 'Triângulo',
      shortcut: 'T',
    },
    {
      type: 'diamond' as const,
      Icon: DiamondIcon,
      label: 'Losango',
      shortcut: 'M',
    },
    {
      type: 'hexagon' as const,
      Icon: HexagonIcon,
      label: 'Hexágono',
      shortcut: 'H',
    },
    {
      type: 'star' as const,
      Icon: Star,
      label: 'Estrela',
      shortcut: 'S',
    },
    {
      type: 'pentagon' as const,
      Icon: PentagonIcon,
      label: 'Pentágono',
      shortcut: 'P',
    },
    {
      type: 'trapezoid' as const,
      Icon: TrapezoidIcon,
      label: 'Trapézio',
      shortcut: 'Z',
    },
    {
      type: 'cloud' as const,
      Icon: Cloud,
      label: 'Nuvem',
      shortcut: 'C',
    },
    {
      type: 'speech' as const,
      Icon: MessageCircle,
      label: 'Balão',
      shortcut: 'B',
    },
    {
      type: 'heart' as const,
      Icon: Heart,
      label: 'Coração',
      shortcut: 'A',
    },
  ]

  const arrowStyleOptions: { style: 'triangle' | 'bar' | 'diamond' | 'line'; label: string }[] = [
    { style: 'triangle', label: 'Triangular' },
    { style: 'bar', label: 'Barra' },
    { style: 'diamond', label: 'Diamante' },
    { style: 'line', label: 'Linha' },
  ]

  const strokePresets = [2, 3, 4, 6]

  const penTypeOptions = [
    {
      type: 'pen' as const,
      Icon: Pen,
      label: 'Caneta',
      shortcut: 'D',
    },
    {
      type: 'marker' as const,
      Icon: Highlighter,
      label: 'Marcador',
      shortcut: 'M',
    },
  ]

  const renderArrowStyleIcon = (style: 'triangle' | 'bar' | 'diamond' | 'line') => {
    return (
      <svg viewBox="0 0 32 16" className="h-4 w-8 text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="8" x2="24" y2="8" strokeLinecap="round" />
        {style === 'triangle' && <polygon points="24,8 19,11 19,5" fill="currentColor" stroke="none" />}
        {style === 'bar' && <line x1="24" y1="4" x2="24" y2="12" strokeLinecap="round" />}
        {style === 'diamond' && <polyline points="24,8 20,11 16,8 20,5 24,8" strokeLinejoin="round" />}
      </svg>
    )
  }

  const colorDotClass = "h-2 w-2 sm:h-3 sm:w-3 rounded-full border border-border/30 transition-all"

  const strokeOptions = useMemo(() => {
    const combined = Array.from(new Set([...strokeHistory, ...strokePresets])).slice(0, 6)
    return combined.sort((a, b) => a - b)
  }, [strokeHistory])

  const smoothingLabel = useMemo(() => {
    return smoothingOptions.find(opt => opt.value === penSmoothing)?.label ?? 'Personalizado'
  }, [penSmoothing])

  const isEraserActive = selectedTool === 'pen' && penMode === 'erase'

  useEffect(() => {
    if (!showShapesMenu) {
      setActiveShapeSubmenu(null)
    }
  }, [showShapesMenu])

  useEffect(() => {
    if (!showArrowMenu) {
      setActiveArrowSubmenu(null)
    }
  }, [showArrowMenu])


  // Toolbar tools - 3D Futurista estilo FigJam
  const tools: ToolItem[] = [
    { id: 'select', icon: <MousePointer2 size={24} />, label: t('common.select') || 'Selecionar' },
    { id: 'hand', icon: <Hand size={24} />, label: t('common.move') || 'Mover Canvas' },
    { id: 'checkbox', icon: <CheckSquare size={24} />, label: t('whiteboard.toolbar.checkbox'), action: () => handleAdd('checkbox') },
    { id: 'note', icon: <StickyNote size={24} />, label: t('whiteboard.toolbar.postit'), action: () => handleAdd('note') },
    { id: 'text', icon: <Type size={24} />, label: t('whiteboard.toolbar.text'), action: () => handleAdd('text') },
    { id: 'pen', icon: <Pen size={24} />, label: t('whiteboard.toolbar.draw') || 'Caneta' },
    // Botão único de Formas
    { id: 'shapes', icon: <Shapes size={24} />, label: t('whiteboard.toolbar.shape') },
    // Botão de seta com submenu
    { id: 'arrow', icon: <ArrowRight size={24} />, label: t('whiteboard.toolbar.arrow') },
    { 
      id: 'image', 
      icon: uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />, 
      label: uploadingImage ? t('common.saving') : t('whiteboard.toolbar.image'), 
      action: handleImageClick,
      disabled: uploadingImage 
    },
    { id: 'undo', icon: <Undo size={24} />, label: t('common.undo') || 'Desfazer', action: () => undo(), disabled: !canUndo },
    { id: 'redo', icon: <Redo size={24} />, label: t('common.redo') || 'Refazer', action: () => redo(), disabled: !canRedo },
  ]

  const handleToolSelect = (toolId: string) => {
    // Executa undo/redo imediatamente e não altera a ferramenta ativa
    if (toolId === 'undo') { undo(); return }
    if (toolId === 'redo') { redo(); return }
    if (toolId === 'shapes') {
      setSelectedTool(toolId)
      setShowArrowMenu(false)
      setShowPenMenu(false)
      setShowShapesMenu(prev => !prev)
      return
    }
    if (toolId === 'arrow') {
      setSelectedTool(toolId)
      setShowShapesMenu(false)
      setShowPenMenu(false)
      setShowArrowMenu(prev => !prev)
      return
    }
    if (toolId === 'pen') {
      setSelectedTool('pen')
      setShowShapesMenu(false)
      setShowArrowMenu(false)
      setShowPenMenu(prev => !prev)
      setPenMode('draw')
      return
    }

    // Text tool behavior (mobile-friendly):
    // - If re-tapping Text while no active text, reselect the most recent text instead of creating a new one.
    if (toolId === 'text') {
      const hadTextSelected = selectedTool === 'text'
      setSelectedTool('text')
      closeMenus()

      if (hadTextSelected && !activeTextId) {
        const texts = allItems.filter(i => i.type === 'text')
        const last = texts.length > 0 ? texts[texts.length - 1] : null
        if (last) {
          setActiveTextId(last.id)
          setFontFamily(last.fontFamily ?? DEFAULT_FONT_FAMILY)
          setFontWeight(last.fontWeight ?? DEFAULT_FONT_WEIGHT)
          setFontSize(last.fontSize ?? DEFAULT_FONT_SIZE)
          return
        }
      }
    }

    closeMenus()
    setSelectedTool(toolId)
    if (toolId !== 'pen') {
      setPenMode('draw')
      setActivePenSubmenu(null)
    }

    const tool = tools.find(t => t.id === toolId)
    if (tool?.action) {
      tool.action()
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "transition-all p-0 flex flex-col [&>button]:hidden",
        fullscreen ? "max-w-[100vw] h-[100vh] w-[100vw] rounded-none" : "max-w-7xl h-[90vh]"
      )}>
        {/* DialogTitle para acessibilidade - sempre presente */}
        <DialogTitle className="sr-only">{whiteboardName || 'Whiteboard'}</DialogTitle>
        
        {/* Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden bg-muted/20 relative"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{
            touchAction: selectedTool === 'hand' || selectedTool === 'pen' ? 'none' : 'manipulation',
            cursor: selectedTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : selectedTool === 'select' ? 'default' : 'crosshair'
          }}
        >
          {/* Toggle Button - Top Toolbar (Mobile) */}
          {isMobile && (
            <motion.button
              type="button"
              onClick={() => setShowTopToolbar(!showTopToolbar)}
              className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/30 bg-background/95 text-muted-foreground shadow-lg backdrop-blur-md transition hover:text-foreground"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              aria-label={showTopToolbar ? 'Ocultar toolbar superior' : 'Mostrar toolbar superior'}
            >
              {showTopToolbar ? <ChevronUp className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </motion.button>
          )}

          {/* Toolbar Esquerda */}
          <AnimatePresence>
            {(showTopToolbar || !isMobile) && (
              <motion.div
                role="toolbar"
                className="absolute left-4 top-4 z-10 flex min-w-0 items-center gap-0 rounded-full border border-border/30 bg-background/95 px-0 py-0 shadow-lg backdrop-blur-md md:flex"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <div className="relative min-w-[140px] max-w-[220px] truncate sm:max-w-[280px]">
                  <button
                    type="button"
                    onClick={() => setEditingTitle(true)}
                    className={cn(
                      'flex min-h-[32px] w-full items-center truncate text-left text-sm font-medium text-foreground/90 transition hover:text-foreground sm:text-base',
                      editingTitle && 'pointer-events-none opacity-0'
                    )}
                  >
                    {whiteboardName || 'Sem título'}
                  </button>
                  {editingTitle && (
                    <Input
                      value={whiteboardName}
                      onChange={(e) => setWhiteboardName(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                      className="absolute left-0 right-0 h-8 rounded-full bg-background text-sm sm:text-base shadow-sm"
                    />
                  )}
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleFavorite()}
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-transform duration-150 hover:scale-110 active:scale-95 hover:text-yellow-500',
                          whiteboard?.is_favorite && 'text-yellow-500'
                        )}
                        aria-label={whiteboard?.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star className={cn('h-4 w-4', whiteboard?.is_favorite && 'fill-current')} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {whiteboard?.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {statusState && (
                  <motion.div
                    key={statusState.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={!statusState.interactive}
                            onClick={statusState.interactive ? statusState.action : undefined}
                            className={cn(
                              'inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-muted-foreground/80 transition-transform duration-150',
                              statusState.tone === 'success' && 'text-emerald-500',
                              statusState.tone === 'warning' && 'text-orange-500',
                              statusState.tone === 'muted' && 'text-foreground/60',
                              statusState.interactive && 'hover:scale-110 active:scale-95 hover:text-primary'
                            )}
                          >
                            {statusState.icon}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {statusState.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button - Right Toolbar (Mobile) */}
          {isMobile && (
            <motion.button
              type="button"
              onClick={() => setShowRightToolbar(!showRightToolbar)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/30 bg-background/95 text-muted-foreground shadow-lg backdrop-blur-md transition hover:text-foreground"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              aria-label={showRightToolbar ? 'Ocultar toolbar direito' : 'Mostrar toolbar direito'}
            >
              {showRightToolbar ? <ChevronUp className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </motion.button>
          )}

          {/* Toolbar Direita */}
          <AnimatePresence>
            {(showRightToolbar || !isMobile) && (
              <motion.div
                role="toolbar"
                className="absolute right-4 top-4 z-10 flex flex-wrap items-center rounded-full border border-border/30 bg-background/95 shadow-lg backdrop-blur-md md:flex"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
              {/* Mostrar avatares de todos os colaboradores */}
              {allCollaborators.length > 0 && (
                <div className="px-2">
                  <CollaboratorsAvatars
                    collaborators={allCollaborators.map(c => ({
                      id: c.id,
                      email: c.email,
                      name: c.name,
                      avatar: c.avatar,
                      online: onlineCollaborators.some(oc => oc.id === c.id)
                    }))}
                    maxVisible={3}
                    size="md"
                  />
                </div>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowCollaborators(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20"
                      aria-label="Gerenciar colaboradores"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Colaboradores</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Gerenciar Colaboradores
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowShare(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20"
                      aria-label="Compartilhar whiteboard"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('whiteboard.share')}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Compartilhar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setFullscreen(!fullscreen)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-150 hover:scale-110 active:scale-95 hover:text-foreground"
                      aria-label={fullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
                    >
                      {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {fullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Botão Fechar - Visível apenas no Mobile */}
              {isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-150 hover:scale-110 active:scale-95 hover:text-destructive"
                        aria-label="Fechar whiteboard"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Fechar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-150 hover:scale-110 active:scale-95 hover:text-foreground"
                    aria-label="Exportar whiteboard"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleExportPNG} className="text-sm">
                    <FileImage className="mr-2 h-4 w-4" />
                    Exportar PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="text-sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyToClipboard} className="text-sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão Fechar - Visível apenas no Desktop */}
              {!isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-150 hover:scale-110 active:scale-95 hover:text-destructive"
                        aria-label="Fechar whiteboard"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Fechar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div 
              ref={canvasRef}
              className="relative w-[3000px] h-[2000px]" 
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)',
                backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              {(whiteboard?.items ?? localItems).map(item => {
                switch (item.type) {
                  case 'checkbox':
                    return <WhiteboardCheckbox key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'note':
                    return <WhiteboardNote key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'text':
                    return (
                      <WhiteboardText
                        key={item.id}
                        item={item}
                        onUpdate={updateItemSafe}
                        onDelete={deleteItemSafe}
                        onFocus={handleTextFocus}
                        onBlur={handleTextBlur}
                        isActive={activeTextId === item.id}
                        overrideFontFamily={fontFamily}
                        overrideFontWeight={fontWeight}
                        overrideFontSize={fontSize}
                      />
                    )
                  case 'box':
                    return <WhiteboardBox key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'circle':
                    return <WhiteboardCircle key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'triangle':
                    return <WhiteboardTriangle key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'diamond':
                    return <WhiteboardDiamond key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'hexagon':
                    return <WhiteboardHexagon key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'star':
                    return <WhiteboardStar key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'pentagon':
                    return <WhiteboardPentagon key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'trapezoid':
                    return <WhiteboardTrapezoid key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'cloud':
                    return <WhiteboardCloud key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'speech':
                    return <WhiteboardSpeech key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'heart':
                    return <WhiteboardHeart key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'line':
                    return <WhiteboardLine key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'arrow':
                    return <WhiteboardArrow key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'pen':
                    return <WhiteboardPen key={item.id} item={item} onUpdate={updateItemSafe} onDelete={deleteItemSafe} />
                  case 'image':
                    return <WhiteboardImage key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} />
                  default:
                    return null
                }
              })}

              {whiteboard?.items.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-4">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.3, y: 0 }} transition={{ delay: 0 }}>
                        <CheckSquare size={32} className="text-blue-500" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.3, y: 0 }} transition={{ delay: 0.1 }}>
                        <StickyNote size={32} className="text-yellow-500" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.3, y: 0 }} transition={{ delay: 0.2 }}>
                        <Type size={32} className="text-foreground" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Clique nos ícones abaixo para começar
                    </p>
                  </div>
                </div>
              )}

              {/* Cursores dos Colaboradores em Real-time */}
              {onlineCollaborators.map((collab) => (
                <CollaboratorCursor key={collab.id} collaborator={collab} />
              ))}
            </div>
          )}

          {/* Zoom Controls - Canto Inferior Esquerdo */}
          {!loading && (
            <ZoomControls
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
            />
          )}
        </div>

        {/* Toolbar Inferior - 3D Futurista estilo FigJam */}
        <FuturisticToolbar
          tools={tools}
          activeTool={selectedTool}
          onToolSelect={handleToolSelect}
        />

        {/* Paletas de Cores - Fixed acima do toolbar */}
        <AnimatePresence>
          {selectedTool === 'note' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] max-w-[260px] w-[calc(100%-2.5rem)] sm:w-auto bg-background/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-xl border border-border/60 flex items-center justify-center gap-1"
            >
              {colors.map((color, i) => (
                <motion.button
                  key={color.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color.name as any)}
                  className={cn(
                    "h-3 w-3 rounded-full border border-border/30 transition-all",
                    color.class,
                    selectedColor === color.name 
                      ? "border-foreground ring-1 ring-offset-[1px] ring-foreground/90" 
                      : "border-transparent"
                  )}
                  title={color.name}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menus flutuantes com TooltipProvider */}
        <TooltipProvider disableHoverableContent>
          {showShapesMenu && (
            <Popover open={showShapesMenu} onOpenChange={setShowShapesMenu}>
              <PopoverAnchor className="fixed bottom-12 left-1/2 -translate-x-1/2 sm:bottom-[62px]" />
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-[calc(100vw-28px)] sm:w-auto max-w-[320px] p-0 border border-border/45 bg-background/95 backdrop-blur-lg rounded-2xl shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
              >
                <Menubar className="mx-auto flex h-9 items-center gap-1.5 rounded-2xl border border-border/40 bg-background/95 px-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur-lg">
                  <ToolbarSubmenuButton
                    label="Formas"
                    isActive={activeShapeSubmenu === 'shape'}
                    onToggle={() => handleShapeSubmenuToggle('shape')}
                    renderTrigger={({ isActive, onClick }) => {
                      const lastOption = shapeOptions.find(option => option.type === lastShapeType) ?? shapeOptions[0]
                      return (
                        <button
                          type="button"
                          aria-pressed={isActive}
                          onClick={onClick}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border transition",
                            isActive
                              ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                              : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                          )}
                          aria-label={`Adicionar ${lastOption.label}`}
                        >
                          <lastOption.Icon className="h-3.5 w-3.5" />
                        </button>
                      )
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {shapeOptions.map(option => {
                        const button = (
                          <button
                            key={option.type}
                            onClick={() => handleAdd(option.type)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              lastShapeType === option.type
                                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_3px_10px_rgba(99,102,241,0.35)]"
                                : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                            aria-label={option.label}
                            type="button"
                          >
                            <option.Icon className="h-4 w-4" />
                          </button>
                        )

                        return lastShapeType === option.type ? (
                          <div key={option.type}>{button}</div>
                        ) : (
                          <Tooltip key={option.type} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {option.label}
                              <span className="ml-2 text-[10px] uppercase text-primary-foreground/80">{option.shortcut}</span>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>

                  <ToolbarSubmenuButton
                    label="Cores"
                    isActive={activeShapeSubmenu === 'colors'}
                    onToggle={() => handleShapeSubmenuToggle('colors')}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                        aria-label="Selecionar cor da forma"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span
                          className={cn(
                            "absolute -bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-background/90",
                            shapeColors.find(color => color.name === selectedShapeColor)?.class ?? ''
                          )}
                        />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {shapeColors.map(color => {
                        const isActive = selectedShapeColor === color.name
                        const button = (
                          <button
                            key={color.name}
                            onClick={() => setSelectedShapeColor(color.name)}
                            className={cn(
                              "h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              color.class,
                              isActive ? "ring-2 ring-offset-[1px] ring-primary" : "border-border/40 hover:scale-[1.04]"
                            )}
                            aria-label={`Cor ${color.name}`}
                            type="button"
                          />
                        )

                        return isActive ? (
                          <div key={color.name}>{button}</div>
                        ) : (
                          <Tooltip key={color.name} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs capitalize">
                              {color.name}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>
                </Menubar>
              </PopoverContent>
            </Popover>
          )}

          {showArrowMenu && (
            <Popover open={showArrowMenu} onOpenChange={setShowArrowMenu}>
              <PopoverAnchor className="fixed bottom-12 left-1/2 -translate-x-1/2 sm:bottom-[62px]" />
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-[calc(100vw-28px)] sm:w-auto max-w-[360px] p-0 border border-border/45 bg-background/95 backdrop-blur-lg rounded-2xl shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
              >
                <Menubar className="mx-auto flex h-9 items-center gap-1.5 rounded-2xl border border-border/40 bg-background/95 px-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur-lg">
                  <ToolbarSubmenuButton
                    label="Estilo"
                    isActive={activeArrowSubmenu === 'style'}
                    onToggle={() => setActiveArrowSubmenu(prev => (prev === 'style' ? null : 'style'))}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                        aria-label="Escolher estilo da seta"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {arrowStyleOptions.map(option => (
                        <Tooltip key={option.style} delayDuration={150}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                addItemSafe({
                                  id: nanoid(),
                                  type: 'arrow',
                                  position: { x: 120 + Math.random() * 160, y: 120 + Math.random() * 160 },
                                  points: [{ x: 0, y: 0 }, { x: 150, y: 0 }],
                                  shapeColor: selectedShapeColor,
                                  arrowStyle: option.style,
                                  strokeWidth: arrowStrokeWidth,
                                })
                                setShowArrowMenu(false)
                              }}
                              className="group flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/10 hover:bg-background transition"
                              type="button"
                            >
                              {renderArrowStyleIcon(option.style)}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {option.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </ToolbarSubmenuButton>

                  <ToolbarSubmenuButton
                    label="Espessura"
                    isActive={activeArrowSubmenu === 'thickness'}
                    onToggle={() => setActiveArrowSubmenu(prev => (prev === 'thickness' ? null : 'thickness'))}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                        aria-label="Definir espessura da seta"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {strokeOptions.map(width => (
                        <Tooltip key={`arrow-stroke-${width}`}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleStrokeWidthChange(width)}
                              className={cn(
                                "px-3 h-8 rounded-full border text-xs transition",
                                arrowStrokeWidth === width
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/30 border-border/60 hover:bg-background"
                              )}
                              type="button"
                            >
                              {width}px
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Espessura {width}px
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </ToolbarSubmenuButton>

                  <ToolbarSubmenuButton
                    label="Cores"
                    isActive={activeArrowSubmenu === 'colors'}
                    onToggle={() => setActiveArrowSubmenu(prev => (prev === 'colors' ? null : 'colors'))}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                        aria-label="Selecionar cor da seta"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span
                          className={cn(
                            "absolute -bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-background/90",
                            shapeColors.find(color => color.name === selectedShapeColor)?.class ?? ''
                          )}
                        />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {shapeColors.map(color => {
                        const isActive = selectedShapeColor === color.name
                        const button = (
                          <button
                            key={color.name}
                            onClick={() => setSelectedShapeColor(color.name)}
                            className={cn(
                              colorDotClass,
                              color.class,
                              isActive ? "border-foreground ring-1 ring-offset-[1px] ring-foreground/90" : "border-transparent"
                            )}
                            aria-label={`Cor ${color.name}`}
                            type="button"
                          />
                        )

                        return isActive ? (
                          <div key={color.name}>{button}</div>
                        ) : (
                          <Tooltip key={color.name} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs capitalize">
                              {color.name}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>
                </Menubar>
              </PopoverContent>
            </Popover>
          )}

          {showPenMenu && (
            <Popover open={showPenMenu} onOpenChange={setShowPenMenu}>
              <PopoverAnchor className="fixed bottom-12 left-1/2 -translate-x-1/2 sm:bottom-[62px]" />
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-[calc(100vw-28px)] sm:w-auto max-w-[360px] border-none bg-transparent p-0 shadow-none"
              >
                <Menubar className="mx-auto flex h-9 items-center gap-1.5 rounded-2xl border border-border/40 bg-background/95 px-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur-lg">
                  <ToolbarSubmenuButton
                    label="Modo Caneta"
                    isActive={activePenSubmenu === 'type'}
                    onToggle={() => handlePenSubmenuToggle('type')}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive || penMode === 'draw'
                            ? penType === 'marker'
                              ? "border-primary/40 bg-primary/15 text-primary shadow-[0_12px_28px_rgba(99,102,241,0.3)]"
                              : "border-transparent bg-gradient-to-br from-primary/80 via-primary to-primary/70 text-primary-foreground shadow-[0_12px_28px_rgba(99,102,241,0.35)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                      >
                        <Pen className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-px">
                      {penTypeOptions.map(option => {
                        const isActive = penType === option.type
                        const button = (
                          <button
                            key={option.type}
                            onClick={() => setPenType(option.type)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              isActive
                                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_3px_10px_rgba(99,102,241,0.35)]"
                                : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                            aria-label={option.label}
                            type="button"
                          >
                            <option.Icon className="h-4 w-4" />
                          </button>
                        )

                        return isActive ? (
                          <div key={option.type}>{button}</div>
                        ) : (
                          <Tooltip key={option.type} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {option.label}
                              <span className="ml-2 text-[10px] uppercase text-primary/70">{option.shortcut}</span>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>

                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setPenMode('erase')
                          setSelectedTool('pen')
                          setActivePenSubmenu(null)
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                          isEraserActive
                            ? "border-transparent bg-gradient-to-br from-primary/80 via-primary to-primary/70 text-primary-foreground shadow-[0_12px_28px_rgba(99,102,241,0.35)]"
                            : "border-border/40 bg-muted/35 text-muted-foreground hover:bg-muted/55 hover:text-foreground"
                        )}
                        aria-label="Ativar modo borracha"
                      >
                        <Eraser className={cn("h-3.5 w-3.5", isEraserActive ? "drop-shadow-[0_4px_10px_rgba(99,102,241,0.45)]" : "")} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Modo Borracha (E)
                    </TooltipContent>
                  </Tooltip>

                  <ToolbarSubmenuButton
                    label="Espessura"
                    isActive={activePenSubmenu === 'thickness'}
                    onToggle={() => handlePenSubmenuToggle('thickness')}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-px">
                      {strokeOptions.map(width => {
                        const isActive = arrowStrokeWidth === width
                        const button = (
                          <button
                            key={`stroke-${width}`}
                            onClick={() => handleStrokeWidthChange(width)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              isActive
                                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_3px_10px_rgba(99,102,241,0.35)]"
                                : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                            aria-label={`Espessura ${width}px`}
                            type="button"
                          >
                            <span className="relative flex h-3 w-4 items-center justify-center">
                              <span
                                className="block w-3 rounded-full bg-foreground"
                                style={{ height: `${Math.min(width, 4)}px` }}
                              />
                            </span>
                          </button>
                        )

                        return isActive ? (
                          <div key={`stroke-${width}`}>{button}</div>
                        ) : (
                          <Tooltip key={`stroke-${width}`} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Espessura {width}px
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>

                  <ToolbarSubmenuButton
                    label="Paleta de cores"
                    isActive={activePenSubmenu === 'colors'}
                    onToggle={() => handlePenSubmenuToggle('colors')}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span
                          className={cn(
                            "absolute -bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-background/90",
                            shapeColors.find(color => color.name === selectedShapeColor)?.class ?? ''
                          )}
                        />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-px overflow-x-auto">
                      <div className="flex items-center gap-px">
                        {shapeColors.slice(0, 8).map(color => {
                          const isActive = selectedShapeColor === color.name
                          const button = (
                            <button
                              key={color.name}
                              onClick={() => setSelectedShapeColor(color.name)}
                              className={cn(
                                "h-7 w-7 rounded-full border border-border/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                                color.class,
                                isActive ? "ring-2 ring-offset-[1px] ring-primary" : "hover:scale-[1.04]"
                              )}
                              aria-label={`Cor ${color.name}`}
                              type="button"
                            />
                          )

                          return isActive ? (
                            <div key={color.name}>{button}</div>
                          ) : (
                            <Tooltip key={color.name} delayDuration={120}>
                              <TooltipTrigger asChild>{button}</TooltipTrigger>
                              <TooltipContent side="top" className="text-xs capitalize">
                                {color.name}
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                      {shapeColors.length > 8 && (
                        <div className="flex items-center gap-px">
                          {shapeColors.slice(8).map(color => {
                            const isActive = selectedShapeColor === color.name
                            const button = (
                              <button
                                key={color.name}
                                onClick={() => setSelectedShapeColor(color.name)}
                                className={cn(
                                  "h-7 w-7 rounded-full border border-border/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                                  color.class,
                                  isActive ? "ring-2 ring-offset-[1px] ring-primary" : "hover:scale-[1.04]"
                                )}
                                aria-label={`Cor ${color.name}`}
                                type="button"
                              />
                            )

                            return isActive ? (
                              <div key={color.name}>{button}</div>
                            ) : (
                              <Tooltip key={color.name} delayDuration={120}>
                                <TooltipTrigger asChild>{button}</TooltipTrigger>
                                <TooltipContent side="top" className="text-xs capitalize">
                                  {color.name}
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </ToolbarSubmenuButton>

                  <ToolbarSubmenuButton
                    label={`Suavização (${smoothingLabel})`}
                    isActive={activePenSubmenu === 'smoothing'}
                    onToggle={() => handlePenSubmenuToggle('smoothing')}
                    renderTrigger={({ isActive, onClick }) => (
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={onClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_12px_24px_rgba(99,102,241,0.28)]"
                            : "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
                        )}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    <div className="flex items-center gap-px">
                      {smoothingOptions.map(option => {
                        const isActive = penSmoothing === option.value
                        const button = (
                          <button
                            key={option.value}
                            onClick={() => setPenSmoothing(option.value)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              isActive
                                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_3px_10px_rgba(99,102,241,0.35)]"
                                : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                            aria-label={`Suavização ${option.label}`}
                            type="button"
                          >
                            <span className="text-[10px] font-semibold">{option.value}x</span>
                          </button>
                        )

                        return isActive ? (
                          <div key={option.value}>{button}</div>
                        ) : (
                          <Tooltip key={option.value} delayDuration={120}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {option.label}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </ToolbarSubmenuButton>
                </Menubar>
              </PopoverContent>
            </Popover>
          )}
        </TooltipProvider>

        {/* Menu compacto para texto */}
        <AnimatePresence>
          {selectedTool === 'text' && activeTextId && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[85]"
            >
              <Menubar
                data-text-menubar="true"
                className="flex h-9 items-center gap-0.5 rounded-2xl border border-border/45 bg-background/95 px-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.16)] backdrop-blur-lg"
              >
                <MenubarMenu>
                  <MenubarTrigger className="gap-1 px-2 py-1.5 text-xs">
                    <TextCursorInput className="h-3 w-3" />
                    <span className="hidden sm:inline font-medium">Fonte</span>
                  </MenubarTrigger>
                  <MenubarContent side="top" align="center" sideOffset={10} className="min-w-[12rem] px-1.5 py-1.5" data-text-menubar="true">
                    <MenubarRadioGroup
                      value={fontFamily}
                      onValueChange={(value) => { updatingTextFromUIRef.current = true; setFontFamily(value) }}
                      className="space-y-0.5"
                    >
                      {fontFamilies.map(option => (
                        <MenubarRadioItem key={option.value} value={option.value} className="flex items-center justify-between rounded-md pl-5 pr-2 py-1 text-xs leading-tight">
                          <span style={{ fontFamily: option.value }}>{option.label}</span>
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarSeparator className="hidden sm:block h-5" />

                <MenubarMenu>
                  <MenubarTrigger className="gap-1 px-2 py-1.5 text-xs">
                    <Bold className="h-3 w-3" />
                    <span className="hidden sm:inline font-medium">Peso</span>
                  </MenubarTrigger>
                  <MenubarContent side="top" align="center" sideOffset={10} className="min-w-[10rem] px-1.5 py-1.5" data-text-menubar="true">
                    <MenubarRadioGroup
                      value={String(fontWeight)}
                      onValueChange={(value) => { updatingTextFromUIRef.current = true; setFontWeight(Number(value)) }}
                      className="space-y-0.5"
                    >
                      {fontWeights.map(weight => (
                        <MenubarRadioItem key={weight} value={String(weight)} className="rounded-md pl-5 pr-2 py-1 text-xs leading-tight">
                          <span style={{ fontWeight: weight }} className="uppercase tracking-wide">
                            {weight}
                          </span>
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarSeparator className="hidden sm:block h-5" />

                <MenubarMenu>
                  <MenubarTrigger className="gap-1 px-2 py-1.5 text-xs">
                    <CaseSensitive className="h-3 w-3" />
                    <span className="hidden sm:inline font-medium">Tamanho</span>
                  </MenubarTrigger>
                  <MenubarContent side="top" align="center" sideOffset={10} className="min-w-[9rem] px-1.5 py-1.5" data-text-menubar="true">
                    <MenubarRadioGroup
                      value={String(fontSize)}
                      onValueChange={(value) => { updatingTextFromUIRef.current = true; setFontSize(Number(value)) }}
                      className="space-y-0.5"
                    >
                      {fontSizes.map(size => (
                        <MenubarRadioItem key={size} value={String(size)} className="rounded-md pl-5 pr-2 py-1 text-xs leading-tight">
                          {size}px
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input hidden para upload de imagem */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ 
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
            opacity: 0,
            pointerEvents: 'none'
          }}
          onChange={handleImageUpload}
          disabled={uploadingImage}
          aria-label="Upload de imagem"
          tabIndex={-1}
        />
      </DialogContent>

      {/* Share Dialog */}
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        whiteboardId={whiteboard?.id}
        whiteboardName={whiteboardName}
      />

      {/* Add Collaborators Dialog */}
      <AddCollaboratorsDialog
        open={showCollaborators}
        onOpenChange={setShowCollaborators}
        whiteboardId={whiteboard?.id}
        whiteboardName={whiteboardName}
        ownerId={whiteboard?.user_id}
      />
    </Dialog>
  )
}
