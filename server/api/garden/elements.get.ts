export default defineEventHandler(async () => {
  // Probeer eerst via GitHub voor de meest verse data
  try {
    const file = await getGithubFile('content/elements.json')
    if (file) return JSON.parse(file.content)
  } catch (e) {
    console.error('GitHub fetch failed, falling back to local storage', e)
  }

  // Fallback naar de Nitro storage (bestanden die in de build zitten)
  const elements = await useStorage('data').getItem('elements.json')
  return elements || []
})
