resource "digitalocean_spaces_bucket" "guitar" {
  name   = "guitar-assets"
  region = var.region
  acl    = "private"
}
