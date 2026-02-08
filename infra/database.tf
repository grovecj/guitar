resource "digitalocean_database_cluster" "guitar" {
  name       = "guitar-db"
  engine     = "pg"
  version    = "16"
  size       = var.db_size
  region     = var.region
  node_count = 1
}

resource "digitalocean_database_db" "guitar" {
  cluster_id = digitalocean_database_cluster.guitar.id
  name       = "guitar"
}

resource "digitalocean_database_firewall" "guitar" {
  cluster_id = digitalocean_database_cluster.guitar.id

  rule {
    type  = "droplet"
    value = digitalocean_droplet.guitar.id
  }
}
