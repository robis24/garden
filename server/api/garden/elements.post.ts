export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')

  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  
  // Accept both direct array or { elements: [...] } object
  const elements = Array.isArray(body) ? body : body.elements

  if (!Array.isArray(elements)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input: expected array of elements' })
  }
  
  await setGithubFile(
    'content/elements.json', 
    JSON.stringify(elements, null, 2), 
    'Update garden elements via AI/API'
  )

  try {
    await useStorage('data').setItem('elements.json', elements)
  } catch (e) {}

  return { success: true }
})
