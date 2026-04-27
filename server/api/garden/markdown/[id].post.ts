export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-garden-key')
  if (config.GARDEN_API_KEY && apiKey !== config.GARDEN_API_KEY) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!id) return { success: false }
  
  const { markdown } = body
  const path = `content/descriptions/${id}.md`

  if (markdown?.trim()) {
    await setGithubFile(path, markdown, `Update description for ${id}`)
    try { await useStorage('data').setItem(`descriptions/${id}.md`, markdown) } catch {}
  } else {
    // Voor verwijderen zouden we een delete call moeten doen, voor nu laten we het even zo
    // of we committen een leeg bestand.
  }
  
  return { success: true }
})
