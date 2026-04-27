export default defineEventHandler(async () => {
  const elements = await useStorage('data').getItem('elements.json')
  return elements || []
})
