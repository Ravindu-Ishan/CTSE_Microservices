# ============================================================
# SSM Parameter Store Module
# Stores all secrets as SecureString (KMS encrypted).
# One database URL per microservice.
#
# DB name alignment:
#   create-schemas.sql creates: otss_wso2_iam
#   All WSO2 JDBC URLs point to: otss_wso2_iam (fixed from otss_wso2)
# ============================================================

locals {
  prefix = "/${var.name_prefix}"
}

# ----------------------------------------------------------------
# Database master credentials
# ----------------------------------------------------------------
resource "aws_ssm_parameter" "db_username" {
  name  = "${local.prefix}/db/username"
  type  = "SecureString"
  value = var.db_username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "${local.prefix}/db/password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "db_endpoint" {
  name  = "${local.prefix}/db/endpoint"
  type  = "SecureString"
  value = var.db_endpoint
}

# ----------------------------------------------------------------
# Per-service DATABASE_URL strings
# ----------------------------------------------------------------
resource "aws_ssm_parameter" "user_service_database_url" {
  name  = "${local.prefix}/user-service/database-url"
  type  = "SecureString"
  value = "postgresql://${var.db_username}:${var.db_password}@${var.db_endpoint}:5432/otss_user_service"
}

# Uncomment as each service is added
# resource "aws_ssm_parameter" "ticket_service_database_url" {
#   name  = "${local.prefix}/ticket-service/database-url"
#   type  = "SecureString"
#   value = "postgresql://${var.db_username}:${var.db_password}@${var.db_endpoint}:5432/otss_ticket_service"
# }

# resource "aws_ssm_parameter" "queue_service_database_url" {
#   name  = "${local.prefix}/queue-service/database-url"
#   type  = "SecureString"
#   value = "postgresql://${var.db_username}:${var.db_password}@${var.db_endpoint}:5432/otss_queue_service"
# }

# resource "aws_ssm_parameter" "notification_service_database_url" {
#   name  = "${local.prefix}/notification-service/database-url"
#   type  = "SecureString"
#   value = "postgresql://${var.db_username}:${var.db_password}@${var.db_endpoint}:5432/otss_notification_service"
# }

# ----------------------------------------------------------------
# WSO2 Identity Server secrets
# ----------------------------------------------------------------
resource "aws_ssm_parameter" "wso2_admin_password" {
  name  = "${local.prefix}/wso2/admin-password"
  type  = "SecureString"
  value = var.wso2_admin_password
}

resource "aws_ssm_parameter" "wso2_client_id" {
  name  = "${local.prefix}/wso2/client-id"
  type  = "SecureString"
  value = var.wso2_client_id
}

resource "aws_ssm_parameter" "wso2_client_secret" {
  name  = "${local.prefix}/wso2/client-secret"
  type  = "SecureString"
  value = var.wso2_client_secret
}

resource "aws_ssm_parameter" "wso2_webhook_secret" {
  name  = "${local.prefix}/wso2/webhook-secret"
  type  = "SecureString"
  value = var.wso2_webhook_secret
}

# Fixed: DB name aligned with create-schemas.sql (otss_wso2_iam not otss_wso2)
resource "aws_ssm_parameter" "wso2_identity_db_url" {
  name  = "${local.prefix}/wso2/identity-db-url"
  type  = "SecureString"
  value = "jdbc:postgresql://${var.db_endpoint}:5432/otss_wso2_iam?currentSchema=wso2_identity"
}

resource "aws_ssm_parameter" "wso2_shared_db_url" {
  name  = "${local.prefix}/wso2/shared-db-url"
  type  = "SecureString"
  value = "jdbc:postgresql://${var.db_endpoint}:5432/otss_wso2_iam?currentSchema=wso2_shared"
}

resource "aws_ssm_parameter" "wso2_consent_db_url" {
  name  = "${local.prefix}/wso2/consent-db-url"
  type  = "SecureString"
  value = "jdbc:postgresql://${var.db_endpoint}:5432/otss_wso2_iam?currentSchema=wso2_consent"
}
