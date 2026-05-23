import { Octokit } from "@octokit/rest"

const owner = process.env.GITHUB_REPO_OWNER ?? "David-tech-creator"
const repo = process.env.GITHUB_REPO_NAME ?? "Rajnak-recipes"
const branch = process.env.GITHUB_REPO_BRANCH ?? "main"

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error(
      "Missing GITHUB_TOKEN. Add a Personal Access Token (Contents: read & write on this repo) to your Vercel env vars to enable recipe authoring.",
    )
  }
  return new Octokit({ auth: token })
}

/**
 * Read an existing file from the repo. Returns `null` if it doesn't exist.
 */
async function getFile(path: string): Promise<{ sha: string; content: string } | null> {
  const octokit = getOctokit()
  try {
    const res = await octokit.repos.getContent({ owner, repo, path, ref: branch })
    const data = res.data
    if (Array.isArray(data) || data.type !== "file") return null
    const content = Buffer.from(data.content, "base64").toString("utf8")
    return { sha: data.sha, content }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
      return null
    }
    throw err
  }
}

/**
 * Create or update a single file on the repo's main branch.
 */
export async function commitFile({
  path,
  content,
  message,
  author,
}: {
  path: string
  content: string
  message: string
  author?: { name: string; email: string }
}): Promise<void> {
  await commitBuffer({
    path,
    buffer: Buffer.from(content, "utf8"),
    message,
    author,
  })
}

/**
 * Commit a raw binary buffer (image, PDF, etc.) under the same auth flow.
 */
export async function commitBuffer({
  path,
  buffer,
  message,
  author,
}: {
  path: string
  buffer: Buffer
  message: string
  author?: { name: string; email: string }
}): Promise<void> {
  const octokit = getOctokit()
  const existing = await getFile(path)
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: buffer.toString("base64"),
    sha: existing?.sha,
    author,
    committer: author,
  })
}

/**
 * Delete a file on the repo's main branch.
 */
export async function deleteFile({
  path,
  message,
  author,
}: {
  path: string
  message: string
  author?: { name: string; email: string }
}): Promise<void> {
  const octokit = getOctokit()
  const existing = await getFile(path)
  if (!existing) return
  await octokit.repos.deleteFile({
    owner,
    repo,
    path,
    branch,
    message,
    sha: existing.sha,
    author,
    committer: author,
  })
}
