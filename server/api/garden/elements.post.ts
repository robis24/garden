export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')

  // Alleen API key checken als deze is ingesteld
  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  
  // Opslaan naar GitHub
  await setGithubFile(
    'content/elements.json', 
    JSON.stringify(body, null, 2), 
    'Update garden elements via AI/API'
  )

  // Ook lokaal updaten in de Nitro cache voor snelle feedback (indien mogelijk)
  try {
    await useStorage('data').setItem('elements.json', body)
  } catch (e) {
    // In serverless omgevingen kan dit falen, dat is ok
  }

  return { success: true }
})
