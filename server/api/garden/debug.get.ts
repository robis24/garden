export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    configured: {
      owner: !!config.GITHUB_OWNER,
      repo: !!config.GITHUB_REPO,
      token: !!config.GITHUB_TOKEN,
      branch: config.GITHUB_BRANCH,
      hasApiKey: !!config.GARDEN_API_KEY
    },
    values: {
      owner: config.GITHUB_OWNER,
      repo: config.GITHUB_REPO,
      branch: config.GITHUB_BRANCH
    }
  }
})
