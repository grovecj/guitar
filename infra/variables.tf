variable "do_token" {
  description = "Digital Ocean API token"
  type        = string
  sensitive   = true
}

variable "do_spaces_access_id" {
  description = "Digital Ocean Spaces access key ID (for state backend + Spaces bucket)"
  type        = string
  sensitive   = true
}

variable "do_spaces_secret_key" {
  description = "Digital Ocean Spaces secret key"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Digital Ocean region"
  type        = string
  default     = "nyc3"
}

variable "domain" {
  description = "Root domain (must already exist in DO DNS)"
  type        = string
  default     = "cartergrove.me"
}

variable "subdomain" {
  description = "Subdomain for the app"
  type        = string
  default     = "guitar"
}

variable "droplet_size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "db_size" {
  description = "Managed database size slug"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "ssh_key_fingerprint" {
  description = "Fingerprint of the SSH key to add to the Droplet"
  type        = string
}

# GitHub
variable "github_token" {
  description = "GitHub personal access token (needs repo, admin:org scopes)"
  type        = string
  sensitive   = true
}

variable "claude_api_key" {
  description = "Anthropic Claude API key (stored as GitHub Actions secret)"
  type        = string
  sensitive   = true
}
