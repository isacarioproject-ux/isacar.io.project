# 📐 ResizableCard - Componente de Card Redimensionável

## 🎯 Visão Geral
Componente robusto e completo para criar cards redimensionáveis com handles em todas as bordas e cantos. Persiste dimensões no localStorage e oferece controle total sobre limites e comportamento.

---

## ✨ Features

### ✅ Implementado
- **8 Handles de Redimensionamento:**
  - 4 Bordas: Top, Right, Bottom, Left
  - 4 Cantos: Top-Right, Bottom-Right, Bottom-Left, Top-Left
  
- **Persistência:** localStorage automático com chave customizável

- **Limites Configuráveis:**
  - minWidth / minHeight
  - maxWidth / maxHeight
  - defaultWidth / defaultHeight

- **Visual Feedback:**
  - Hover: Background primary/20
  - Active: Background primary/30
  - Cursores apropriados (n-resize, se-resize, etc)
  - Indicadores visuais nos cantos

- **Performance:**
  - Sem re-renders desnecessários
  - Transições suaves
  - Overlay durante resize para evitar problemas

- **Flexibilidade:**
  - Habilitar/desabilitar handles específicos
  - Callback onResize
  - Totalmente tipado (TypeScript)

---

## 📖 Uso Básico

```tsx
import { ResizableCard } from '@/components/ui/resizable-card'

<ResizableCard
  minWidth={300}
  minHeight={200}
  maxWidth={1200}
  maxHeight={800}
  defaultWidth={450}
  defaultHeight={400}
  storageKey="my-card"
>
  <Card>
    {/* Seu conteúdo aqui */}
  </Card>
</ResizableCard>
```

---

## 🔧 Props

### Dimensões
```typescript
minWidth?: number          // Largura mínima (default: 300)
minHeight?: number         // Altura mínima (default: 200)
maxWidth?: number          // Largura máxima (default: 1200)
maxHeight?: number         // Altura máxima (default: 800)
defaultWidth?: number      // Largura inicial (default: 400)
defaultHeight?: number     // Altura inicial (default: 300)
```

### Persistência
```typescript
storageKey?: string        // Chave localStorage (ex: "docs-card-123")
                          // Se não fornecido, não persiste
```

### Callbacks
```typescript
onResize?: (width: number, height: number) => void
// Chamado sempre que dimensões mudam
```

### Controle de Handles
```typescript
enableResize?: {
  top?: boolean           // Borda superior
  right?: boolean         // Borda direita
  bottom?: boolean        // Borda inferior
  left?: boolean          // Borda esquerda
  topRight?: boolean      // Canto superior direito
  bottomRight?: boolean   // Canto inferior direito
  bottomLeft?: boolean    // Canto inferior esquerdo
  topLeft?: boolean       // Canto superior esquerdo
}
// Default: todos true
```

### Estilo
```typescript
className?: string         // Classes Tailwind adicionais
children: ReactNode        // Conteúdo do card
```

---

## 💡 Exemplos de Uso

### 1. Card Básico com Persistência
```tsx
<ResizableCard
  storageKey="docs-card-project-123"
  defaultWidth={450}
  defaultHeight={400}
>
  <DocsCard />
</ResizableCard>
```

### 2. Apenas Redimensionamento Horizontal
```tsx
<ResizableCard
  enableResize={{
    right: true,
    left: true,
    // Outros desabilitados
  }}
  minWidth={200}
  maxWidth={800}
>
  <Sidebar />
</ResizableCard>
```

### 3. Com Callback
```tsx
<ResizableCard
  onResize={(width, height) => {
    console.log(`Novo tamanho: ${width}x${height}`)
    // Atualizar outros componentes, etc
  }}
>
  <MyCard />
</ResizableCard>
```

### 4. Limites Customizados
```tsx
<ResizableCard
  minWidth={400}
  minHeight={300}
  maxWidth={1600}
  maxHeight={1200}
  defaultWidth={800}
  defaultHeight={600}
>
  <LargeCard />
</ResizableCard>
```

---

## 🎨 Aparência Visual

### Handles de Borda
- **Largura:** 1px (hover: 4px)
- **Cor:** Transparente → primary/20 (hover) → primary/30 (active)
- **Cursor:** Apropriado para direção

### Handles de Canto
- **Tamanho:** 4x4px
- **Visibilidade:** Invisíveis (opacity: 0) para manter arredondamento bonito
- **Cursor:** Diagonal apropriado
- **Funcionalidade:** Totalmente funcional mesmo invisível

### Durante Resize
- **Overlay:** Cobre todo o card (z-index 20)
- **Transições:** Desabilitadas para performance
- **Body:** user-select: none

---

## 🔄 Persistência

### Como Funciona
1. **Carregamento:**
   - Tenta ler `localStorage.getItem('resizable-card-{storageKey}')`
   - Parse JSON com fallback para defaults
   - Aplica limites min/max

2. **Salvamento:**
   - Salva automaticamente após cada resize
   - JSON: `{ width: number, height: number }`
   - Apenas se `storageKey` fornecido

### Exemplo de Dados Salvos
```json
{
  "width": 550,
  "height": 450
}
```

---

## 🚀 Performance

### Otimizações
- **useCallback:** Handlers memoizados
- **Event Listeners:** Adicionados/removidos corretamente
- **Transições:** Desabilitadas durante resize
- **Overlay:** Previne problemas com iframes/canvas

### Boas Práticas
```tsx
// ✅ BOM: storageKey único por instância
<ResizableCard storageKey={`card-${id}`}>

// ❌ RUIM: storageKey compartilhado
<ResizableCard storageKey="card">
```

---

## 🎯 Casos de Uso

### 1. Cards de Documentos
```tsx
<ResizableCard
  storageKey={`docs-card-${projectId}`}
  minWidth={320}
  defaultWidth={450}
>
  <DocsCard projectId={projectId} />
</ResizableCard>
```

### 2. Cards Financeiros
```tsx
<ResizableCard
  storageKey={`finance-card-${workspaceId}`}
  minWidth={320}
  defaultWidth={450}
>
  <FinanceCard workspaceId={workspaceId} />
</ResizableCard>
```

### 3. Sidebars
```tsx
<ResizableCard
  enableResize={{ right: true }}
  minWidth={200}
  maxWidth={400}
  defaultWidth={280}
  storageKey="sidebar"
>
  <Sidebar />
</ResizableCard>
```

### 4. Modais Redimensionáveis
```tsx
<Dialog>
  <DialogContent>
    <ResizableCard
      minWidth={400}
      minHeight={300}
      storageKey="modal-settings"
    >
      <SettingsContent />
    </ResizableCard>
  </DialogContent>
</Dialog>
```

---

## 🔐 Segurança

### localStorage
- **Try/Catch:** Parse JSON com fallback
- **Validação:** Limites min/max sempre aplicados
- **Sanitização:** Apenas números aceitos

### Event Listeners
- **Cleanup:** Removidos no mouseup
- **Body Styles:** Restaurados após resize
- **Memory Leaks:** Prevenidos com cleanup correto

---

## 🎨 Customização

### Cores dos Handles
Edite em `resizable-card.tsx`:
```tsx
// Hover
handleHoverClass = "hover:bg-primary/20"

// Active
handleActiveClass = "bg-primary/30"

// Indicadores de canto
<div className="... bg-primary/40 ..." />
```

### Tamanhos dos Handles
```tsx
// Bordas
className="... h-1 ..."  // Vertical
className="... w-1 ..."  // Horizontal

// Cantos (invisíveis)
className="... w-4 h-4 opacity-0 ..."  // Área clicável invisível
```

---

## ✅ Checklist de Implementação

- [x] 8 handles (4 bordas + 4 cantos)
- [x] Persistência localStorage
- [x] Limites min/max
- [x] Cursores apropriados
- [x] Feedback visual (hover/active)
- [x] Callback onResize
- [x] Habilitar/desabilitar handles
- [x] TypeScript completo
- [x] Performance otimizada
- [x] Overlay durante resize
- [x] Cleanup de event listeners
- [x] Validação de dimensões
- [x] Fallback para defaults
- [x] Transições suaves
- [x] Responsivo

---

## 🐛 Troubleshooting

### Card não redimensiona
- ✅ Verificar se `enableResize` está correto
- ✅ Verificar z-index de elementos sobrepondo handles
- ✅ Verificar se card tem position: relative

### Dimensões não persistem
- ✅ Verificar se `storageKey` está definido
- ✅ Verificar localStorage no DevTools
- ✅ Verificar se há erros no console

### Performance ruim
- ✅ Verificar se há re-renders desnecessários
- ✅ Usar storageKey único por instância
- ✅ Evitar callbacks pesados em onResize

---

## 📚 Referências

- **dnd-kit:** Inspiração para drag & drop
- **react-resizable:** Referência de API
- **Tailwind CSS:** Sistema de design

---

## 🚀 Próximas Melhorias (Futuro)

- [ ] Snap to grid
- [ ] Aspect ratio lock
- [ ] Double-click para reset
- [ ] Animação ao atingir limites
- [ ] Touch support melhorado
- [ ] Resize em grupo
- [ ] Undo/Redo de dimensões
