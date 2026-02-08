data "digitalocean_ssh_key" "default" {
  name = "default"
}

resource "digitalocean_droplet" "guitar" {
  name     = "guitar"
  image    = "ubuntu-24-04-x64"
  size     = var.droplet_size
  region   = var.region
  ssh_keys = [var.ssh_key_fingerprint]

  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail

    # Basic server setup
    apt-get update
    apt-get install -y ufw nginx certbot python3-certbot-nginx

    # Firewall
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw --force enable
  EOF

  tags = ["guitar", "web"]
}
