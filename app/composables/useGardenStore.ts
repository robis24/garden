export type GardenCategory = 'perennial' | 'biennial' | 'other'

export interface GardenElement {
  id: string
  x: number
  y: number
  title: string
  category: GardenCategory
  shape: 'circle' | 'rect' | 'diamond'
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  createdAt: number
}

export const SIZE_RADII: Record<GardenElement['size'], number> = {
  xs: 30,
  s:  55,
  m:  90,
  l:  150,
  xl: 240,
}

export interface GardenStore {
  elements: ComputedRef<GardenElement[]>
  loading: Ref<boolean>
  addElement: (data: Omit<GardenElement, 'id' | 'createdAt'>) => Promise<string>
  updateElement: (id: string, data: Partial<Omit<GardenElement, 'id' | 'createdAt'>>) => Promise<void>
  removeElement: (id: string) => Promise<void>
  getMarkdown: (id: string) => Promise<string>
  setMarkdown: (id: string, md: string) => Promise<void>
}

export function useGardenStore(): GardenStore {
  const elements = useState<Record<string, GardenElement>>('garden:elements', () => ({}))
  const loading = useState('garden:loading', () => true)
  const initialLoad = useState('garden:initialLoad', () => false)

  if (import.meta.client && !initialLoad.value) {
    initialLoad.value = true
    $fetch<GardenElement[]>('/api/garden/elements').then(data => {
      if (data) {
        elements.value = data.reduce((acc, el) => ({ ...acc, [el.id]: el }), {})
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  }

  async function addElement(data: Omit<GardenElement, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const newEl = { ...data, id, createdAt: Date.now() }
    // Optimistic update
    elements.value = { ...elements.value, [id]: newEl }
    
    await $fetch('/api/garden/elements', {
      method: 'POST',
      body: newEl
    })
    return id
  }

  async function updateElement(id: string, data: Partial<Omit<GardenElement, 'id' | 'createdAt'>>) {
    if (!elements.value[id]) return
    const updated = { ...elements.value[id], ...data }
    elements.value = { ...elements.value, [id]: updated }
    
    await $fetch(`/api/garden/elements/${id}`, {
      method: 'PATCH',
      body: data
    })
  }

  async function removeElement(id: string) {
    const { [id]: _, ...rest } = elements.value
    elements.value = rest
    
    await Promise.all([
      $fetch(`/api/garden/elements/${id}`, { method: 'DELETE' }),
      $fetch(`/api/garden/markdown/${id}`, { method: 'POST', body: { markdown: '' } })
    ])
  }

  async function getMarkdown(id: string): Promise<string> {
    return await $fetch<string>(`/api/garden/markdown/${id}`)
  }

  async function setMarkdown(id: string, md: string) {
    await $fetch(`/api/garden/markdown/${id}`, {
      method: 'POST',
      body: { markdown: md }
    })
  }

  return {
    elements: computed(() => Object.values(elements.value)),
    loading,
    addElement,
    updateElement,
    removeElement,
    getMarkdown,
    setMarkdown,
  }
}
