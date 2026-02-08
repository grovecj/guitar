data "digitalocean_domain" "main" {
  name = var.domain
}

resource "digitalocean_record" "guitar" {
  domain = data.digitalocean_domain.main.id
  type   = "A"
  name   = var.subdomain
  value  = digitalocean_droplet.guitar.ipv4_address
  ttl    = 300
}
