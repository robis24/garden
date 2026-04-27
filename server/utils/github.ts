export async function getGithubFile(path: string) {
  const config = useRuntimeConfig()
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = config

  try {
    const response = await $fetch<any>(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    
    return {
      content: Buffer.from(response.content, 'base64').toString('utf-8'),
      sha: response.sha
    }
  } catch (e: any) {
    if (e.status === 404) return null
    throw e
  }
}

export async function setGithubFile(path: string, content: string, message: string) {
  const config = useRuntimeConfig()
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = config

  // We hebben de huidige SHA nodig om te updaten
  const currentFile = await getGithubFile(path)

  return await $fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    },
    body: {
      message,
      content: Buffer.from(content).toString('base64'),
      sha: currentFile?.sha,
      branch: GITHUB_BRANCH
    }
  })
}
