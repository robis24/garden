import type { GardenElement } from '~/composables/useGardenStore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')

  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or missing x-garden-key' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const file = await getGithubFile('content/elements.json')
  const elements: GardenElement[] = file ? JSON.parse(file.content) : []

  const title = elements.find(el => el.id === id)?.title ?? id
  const filtered = elements.filter(el => el.id !== id)

  await setGithubFile(
    'content/elements.json',
    JSON.stringify(filtered, null, 2),
    `Remove plant: ${title}`
  )

  return { success: true }
})
