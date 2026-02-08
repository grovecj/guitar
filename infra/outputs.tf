output "droplet_ip" {
  description = "Public IP of the Guitar Droplet"
  value       = digitalocean_droplet.guitar.ipv4_address
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.subdomain}.${var.domain}"
}

output "database_uri" {
  description = "PostgreSQL connection URI"
  value       = digitalocean_database_cluster.guitar.uri
  sensitive   = true
}

output "database_host" {
  description = "PostgreSQL host"
  value       = digitalocean_database_cluster.guitar.host
}

output "database_port" {
  description = "PostgreSQL port"
  value       = digitalocean_database_cluster.guitar.port
}

output "spaces_bucket_name" {
  description = "Spaces bucket name"
  value       = digitalocean_spaces_bucket.guitar.name
}

output "spaces_endpoint" {
  description = "Spaces bucket endpoint"
  value       = digitalocean_spaces_bucket.guitar.bucket_domain_name
}
