export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')

  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or missing x-garden-key' })
  }

  const newElement = await readBody(event)
  
  // Haal huidige lijst op van GitHub
  const file = await getGithubFile('content/elements.json')
  let elements = file ? JSON.parse(file.content) : []
  
  // Voeg toe
  elements.push(newElement)
  
  await setGithubFile(
    'content/elements.json', 
    JSON.stringify(elements, null, 2), 
    `Add plant: ${newElement.title}`
  )

  return { success: true }
})
