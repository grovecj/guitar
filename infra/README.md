# Infrastructure

Terraform configuration for the Guitar app on Digital Ocean.

## Resources Provisioned

- **Droplet** — Ubuntu 24.04 with nginx, ufw, and certbot pre-installed
- **Managed PostgreSQL** — Single-node PG 16 cluster with a `guitar` database
- **Spaces Bucket** — S3-compatible object storage for assets
- **Firewall** — Allows SSH (22), HTTP (80), HTTPS (443) inbound only
- **DNS A Record** — `guitar.cartergrove.me` → Droplet IP
- **Database Firewall** — Only the Droplet can reach the database

## Prerequisites

1. A [Digital Ocean API token](https://cloud.digitalocean.com/account/api/tokens)
2. A [Spaces access key pair](https://cloud.digitalocean.com/account/api/spaces)
3. An SSH key added to your DO account (note its fingerprint)
4. The domain `cartergrove.me` added to DO DNS
5. A Spaces bucket named `guitar-tfstate` created manually (for Terraform state)

## Setup

```bash
cd infra

# Copy and fill in your credentials
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with real values

# Set backend credentials (Spaces keys for state storage)
export AWS_ACCESS_KEY_ID="your-spaces-access-id"
export AWS_SECRET_ACCESS_KEY="your-spaces-secret-key"

# Initialize and apply
terraform init
terraform plan
terraform apply
```

## State Backend

Terraform state is stored remotely in the `guitar-tfstate` Spaces bucket.
You must create this bucket manually before running `terraform init`:

```bash
doctl spaces create guitar-tfstate --region nyc3
```

## Estimated Monthly Cost

| Resource          | Size            | ~Cost   |
| ----------------- | --------------- | ------- |
| Droplet           | s-1vcpu-1gb     | $6/mo   |
| Managed Postgres  | db-s-1vcpu-1gb  | $15/mo  |
| Spaces            | 250 GB included | $5/mo   |
| **Total**         |                 | **~$26/mo** |
