const API = "https://api.github.com";

function repoInfo() {
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!repo || !token) {
    throw new Error("GITHUB_REPO / GITHUB_TOKEN are not configured");
  }
  return { repo, token, branch };
}

async function ghFetch(url, options = {}) {
  const { token } = repoInfo();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "bdo-gewinnspiel-app",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

// Reads a file's current sha + parsed JSON content straight from GitHub
// (the live source of truth, not the possibly-stale bundle this function
// instance was deployed with). Returns null if the file doesn't exist yet.
export async function getJsonFile(repoPath) {
  const { repo, branch } = repoInfo();
  const res = await ghFetch(
    `${API}/repos/${repo}/contents/${repoPath}?ref=${branch}`
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub getJsonFile failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { sha: data.sha, json: JSON.parse(content) };
}

// Creates or updates a JSON file in the repo, committing straight to the
// configured branch. Vercel's GitHub integration picks this commit up and
// redeploys automatically. Pass the sha you last read to avoid clobbering a
// concurrent write; omit it when creating a brand-new file.
export async function upsertJsonFile(repoPath, jsonValue, commitMessage, sha) {
  const { repo, branch } = repoInfo();
  const content = Buffer.from(JSON.stringify(jsonValue, null, 2) + "\n", "utf-8").toString(
    "base64"
  );
  const res = await ghFetch(`${API}/repos/${repo}/contents/${repoPath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: commitMessage,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub upsert failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function deleteJsonFile(repoPath, sha, commitMessage) {
  const { repo, branch } = repoInfo();
  const res = await ghFetch(`${API}/repos/${repo}/contents/${repoPath}`, {
    method: "DELETE",
    body: JSON.stringify({ message: commitMessage, sha, branch }),
  });
  if (!res.ok) {
    throw new Error(`GitHub delete failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
