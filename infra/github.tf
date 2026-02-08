resource "github_repository" "guitar" {
  name        = "guitar"
  description = "Guitar practice web app — tuner, AI-generated backing tracks, and guided practice sessions. Built with SvelteKit, Go, Tone.js, and Claude API."

  visibility = "public"

  has_issues   = true
  has_projects = false
  has_wiki     = false

  delete_branch_on_merge    = true
  allow_squash_merge        = true
  allow_merge_commit        = false
  allow_rebase_merge        = true
  squash_merge_commit_title = "PR_TITLE"

  topics = ["guitar", "svelte", "sveltekit", "go", "tailwindcss", "tone-js", "claude-api", "practice"]
}

resource "github_branch_protection" "main" {
  repository_id = github_repository.guitar.node_id
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 0
    dismiss_stale_reviews           = true
  }

  required_status_checks {
    strict = true
    contexts = [
      "lint-frontend",
      "lint-backend",
      "build",
    ]
  }

  enforce_admins = false
}

# CI/CD secrets — Digital Ocean
resource "github_actions_secret" "do_token" {
  repository      = github_repository.guitar.name
  secret_name     = "DO_TOKEN"
  plaintext_value = var.do_token
}

resource "github_actions_secret" "do_spaces_access_id" {
  repository      = github_repository.guitar.name
  secret_name     = "DO_SPACES_ACCESS_ID"
  plaintext_value = var.do_spaces_access_id
}

resource "github_actions_secret" "do_spaces_secret_key" {
  repository      = github_repository.guitar.name
  secret_name     = "DO_SPACES_SECRET_KEY"
  plaintext_value = var.do_spaces_secret_key
}

resource "github_actions_secret" "ssh_key_fingerprint" {
  repository      = github_repository.guitar.name
  secret_name     = "SSH_KEY_FINGERPRINT"
  plaintext_value = var.ssh_key_fingerprint
}

# CI/CD secrets — Claude API
resource "github_actions_secret" "claude_api_key" {
  repository      = github_repository.guitar.name
  secret_name     = "CLAUDE_API_KEY"
  plaintext_value = var.claude_api_key
}
