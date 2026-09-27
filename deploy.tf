terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "cloudflare" {
  # read token from $CLOUDFLARE_API_TOKEN
}

variable "CLOUDFLARE_ACCOUNT_ID" {
  # read account id from $TF_VAR_CLOUDFLARE_ACCOUNT_ID
  type = string
}

variable "CLOUDFLARE_ZONE_ID" {
  # resolved by the GitHub Actions workflow for novoagatto.com
  type = string
}

variable "ACCESS_ALLOWED_EMAIL" {
  # read from GitHub Actions secret ACCESS_ALLOWED_EMAIL
  type      = string
  sensitive = true
}

variable "enable_do_migration" {
  type    = bool
  default = false
}

resource "cloudflare_d1_database" "uptimeflare_d1" {
  account_id = var.CLOUDFLARE_ACCOUNT_ID
  name       = "uptimeflare_d1"
  read_replication = {
    mode = "auto"
  }
}

resource "cloudflare_workers_script" "uptimeflare_worker" {
  account_id         = var.CLOUDFLARE_ACCOUNT_ID
  script_name        = "uptimeflare_worker"
  main_module        = "worker/dist/index.js"
  content_file       = "worker/dist/index.js"
  content_sha256     = filesha256("worker/dist/index.js")
  compatibility_date = "2025-04-02"
  compatibility_flags = ["nodejs_compat"]

  observability = {
    enabled = true
    logs = {
      enabled         = true
      invocation_logs = true
    }
  }

  migrations = var.enable_do_migration ? {
    new_tag            = "v1"
    new_sqlite_classes = ["RemoteChecker"]
  } : null

  bindings = [{
    name       = "REMOTE_CHECKER_DO"
    class_name = "RemoteChecker"
    type       = "durable_object_namespace"
    }, {
    name = "UPTIMEFLARE_D1"
    type = "d1"
    id   = cloudflare_d1_database.uptimeflare_d1.id
  }]
}

resource "cloudflare_workers_cron_trigger" "uptimeflare_worker_cron" {
  account_id  = var.CLOUDFLARE_ACCOUNT_ID
  script_name = cloudflare_workers_script.uptimeflare_worker.script_name
  schedules = [{
    cron = "* * * * *" # every 1 minute
  }]
}

resource "cloudflare_pages_project" "uptimeflare" {
  account_id        = var.CLOUDFLARE_ACCOUNT_ID
  name              = "uptimeflare"
  production_branch = "main"

  deployment_configs = {
    # Cloudflare provider requires a preview config.
    preview = {
      fail_open = false
    }
    production = {
      d1_databases = {
        UPTIMEFLARE_D1 = {
          id = cloudflare_d1_database.uptimeflare_d1.id
        }
      }
      compatibility_date  = "2025-04-02"
      compatibility_flags = ["nodejs_compat"]
      fail_open           = false
    }
  }

  # Cloudflare provider requires a build config.
  build_config = {
    root_dir = "/"
  }
}

# Attach the private status hostname to the Pages project first. Access must be
# created only after the custom domain exists, otherwise Pages domain validation
# can fail.
resource "cloudflare_pages_domain" "uptimeflare_status" {
  account_id   = var.CLOUDFLARE_ACCOUNT_ID
  project_name = cloudflare_pages_project.uptimeflare.name
  name         = "status.novoagatto.com"

  depends_on = [cloudflare_pages_project.uptimeflare]
}

resource "cloudflare_dns_record" "uptimeflare_status" {
  zone_id = var.CLOUDFLARE_ZONE_ID
  name    = "status.novoagatto.com"
  type    = "CNAME"
  content = cloudflare_pages_project.uptimeflare.subdomain
  ttl     = 1
  proxied = true
  comment = "UptimeFlare Cloudflare Pages"

  depends_on = [cloudflare_pages_domain.uptimeflare_status]
}

# Protect the custom hostname with Cloudflare Access. The policy is inline so
# the whole Access configuration is managed as one Terraform resource.
resource "cloudflare_zero_trust_access_application" "uptimeflare_status" {
  account_id  = var.CLOUDFLARE_ACCOUNT_ID
  name        = "Miau Infrastructure Status"
  type        = "self_hosted"
  domain      = "status.novoagatto.com"
  session_duration = "24h"

  app_launcher_visible      = false
  auto_redirect_to_identity = false

  policies = [{
    name       = "Allow status owner"
    decision   = "allow"
    precedence = 1
    include = [{
      email = {
        email = var.ACCESS_ALLOWED_EMAIL
      }
    }]
  }]

  depends_on = [
    cloudflare_pages_domain.uptimeflare_status,
    cloudflare_dns_record.uptimeflare_status,
  ]
}
