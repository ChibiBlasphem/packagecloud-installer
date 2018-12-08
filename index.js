const path = require('path')
const os = require('os')
const fs = require('fs')
const { promisify } = require('util')
const axios = require('axios')

module.exports = async function createNpmrc(repoPath) {
  if (!repoPath) {
    console.error('Repo path must be specified, ie: node index.js username/repo')
    process.exit(1)
  }

  const homedir = os.homedir()
  const pathToRepoModule = path.resolve(homedir, '.packagecloud-installer', 'repositories.json')
  
  let repositories
  try {
    repositories = require(pathToRepoModule)
  } catch (e) {
    console.log('Repositories not found')
    process.exit()
  }

  const uniqueId = os.hostname()
  const npmrcPath = path.resolve(process.cwd(), '.npmrc')

  if (fs.existsSync(npmrcPath)) {
    console.log('File already exists')
    process.exit(1)
  }

  try {
    const { tokenUrl, repoUrl } = repositories[repoPath]
    const { data: token } = await axios.post(tokenUrl, `name=${uniqueId}`)

    const authUrl = repoUrl.replace(/^https?:/, '')

    const contents =
      "always-auth=true\n" +
      `registry=${repoUrl}\n` +
      `${authUrl}:_authToken=${token}`

    await promisify(fs.writeFile)(npmrcPath, contents)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error(`Module '${repoPath}' not found`)
    } else {
      console.error(e.message)
    }
    process.exit(1)
  }
}