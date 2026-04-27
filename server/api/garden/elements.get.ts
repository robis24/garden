import type { GardenElement } from '~/composables/useGardenStore'

export default defineEventHandler(async (): Promise<GardenElement[]> => {
  try {
    const file = await getGithubFile('content/elements.json')
    if (file) return JSON.parse(file.content) as GardenElement[]
  } catch (e) {
    console.error('GitHub fetch failed, falling back to local storage', e)
  }

  const elements = await useStorage('data').getItem<GardenElement[]>('elements.json')
  return elements ?? []
})
