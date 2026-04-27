export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return ''
  const md = await useStorage('data').getItem(`descriptions/${id}.md`)
  return md || ''
})
