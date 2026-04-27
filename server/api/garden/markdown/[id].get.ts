export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return ''

  const path = `content/descriptions/${id}.md`

  // Probeer GitHub
  try {
    const file = await getGithubFile(path)
    if (file) return file.content
  } catch (e) {}

  // Fallback naar build bestanden
  const md = await useStorage('data').getItem(`descriptions/${id}.md`)
  return md || ''
})
