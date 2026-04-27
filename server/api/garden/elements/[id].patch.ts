import type { GardenElement } from '~/composables/useGardenStore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')

  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or missing x-garden-key' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const patch = await readBody<Partial<Omit<GardenElement, 'id' | 'createdAt'>>>(event)

  const file = await getGithubFile('content/elements.json')
  const elements: GardenElement[] = file ? JSON.parse(file.content) : []

  const idx = elements.findIndex(el => el.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Element not found' })

  const updated = { ...elements[idx]!, ...patch }
  elements[idx] = updated

  await setGithubFile(
    'content/elements.json',
    JSON.stringify(elements, null, 2),
    `Update plant: ${updated.title}`
  )

  return { success: true }
})
