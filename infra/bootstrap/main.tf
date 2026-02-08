terraform {
  required_version = ">= 1.5"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.34"
    }
  }

  # Local state only — this is intentional.
  # This config exists solely to create the Spaces bucket
  # that the main config uses as its remote state backend.
}

variable "do_token" {
  description = "Digital Ocean API token"
  type        = string
  sensitive   = true
}

variable "do_spaces_access_id" {
  description = "Digital Ocean Spaces access key ID"
  type        = string
  sensitive   = true
}

variable "do_spaces_secret_key" {
  description = "Digital Ocean Spaces secret key"
  type        = string
  sensitive   = true
}

provider "digitalocean" {
  token             = var.do_token
  spaces_access_id  = var.do_spaces_access_id
  spaces_secret_key = var.do_spaces_secret_key
}

resource "digitalocean_spaces_bucket" "tfstate" {
  name   = "guitar-tfstate"
  region = "nyc3"
  acl    = "private"

  versioning {
    enabled = true
  }
}

output "bucket_name" {
  value = digitalocean_spaces_bucket.tfstate.name
}
