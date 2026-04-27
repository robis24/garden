export async function getGithubFile(path: string) {
  const config = useRuntimeConfig()
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = config

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('Missing GitHub configuration:', { GITHUB_OWNER, GITHUB_REPO, hasToken: !!GITHUB_TOKEN })
    return null
  }

  try {
    const response = await $fetch<any>(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nuxt-Garden-App'
      }
    })
    
    return {
      content: Buffer.from(response.content, 'base64').toString('utf-8'),
      sha: response.sha
    }
  } catch (e: any) {
    if (e.status === 404) {
      console.warn(`File not found on GitHub: ${path} (branch: ${GITHUB_BRANCH})`)
      return null
    }
    console.error('GitHub API error:', e.data || e.message)
    throw e
  }
}

export async function setGithubFile(path: string, content: string, message: string) {
  const config = useRuntimeConfig()
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = config

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub configuration missing' })
  }

  const currentFile = await getGithubFile(path)

  return await $fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Nuxt-Garden-App'
    },
    body: {
      message,
      content: Buffer.from(content).toString('base64'),
      sha: currentFile?.sha,
      branch: GITHUB_BRANCH
    }
  })
}
