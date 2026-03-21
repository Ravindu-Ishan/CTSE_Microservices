variable "name_prefix" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_endpoint" {
  type      = string
  sensitive = true
}

variable "wso2_admin_password" {
  type      = string
  sensitive = true
}

variable "wso2_client_id" {
  type      = string
  sensitive = true
}

variable "wso2_client_secret" {
  type      = string
  sensitive = true
}

variable "wso2_webhook_secret" {
  type      = string
  sensitive = true
}