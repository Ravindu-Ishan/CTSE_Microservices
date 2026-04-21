variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name — used in resource naming and tags"
  type        = string
  default     = "staging"
}

variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "otss"
}

# ----------------------------------------------------------------
# VPC
# ----------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "enable_nat_gateway" {
  description = "Set false when EKS is not running to eliminate NAT Gateway cost"
  type        = bool
  default     = true
}

# ----------------------------------------------------------------
# EKS
# ----------------------------------------------------------------
variable "eks_cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.31"
}

variable "developer_iam_arns" {
  description = "List of IAM user/role ARNs granted cluster-admin kubectl access"
  type        = list(string)
  default     = []
}

variable "wso2_instance_type" {
  description = "EC2 instance type for WSO2 IS + APIM node group"
  type        = string
  default     = "t3.medium"
}

variable "services_instance_type" {
  description = "EC2 instance type for NestJS services node group"
  type        = string
  default     = "t3.small"
}

# ----------------------------------------------------------------
# RDS
# ----------------------------------------------------------------
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "otssadmin"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password — set in terraform.tfvars, never hardcoded"
  type        = string
  sensitive   = true
}

# ----------------------------------------------------------------
# WSO2 secrets — stored in SSM Parameter Store
# ----------------------------------------------------------------
variable "wso2_admin_password" {
  description = "WSO2 IS admin password"
  type        = string
  sensitive   = true
}

variable "wso2_client_id" {
  description = "WSO2 OAuth2 service account client ID"
  type        = string
  sensitive   = true
}

variable "wso2_client_secret" {
  description = "WSO2 OAuth2 service account client secret"
  type        = string
  sensitive   = true
}

variable "wso2_webhook_secret" {
  description = "HMAC secret for WSO2 webhook verification"
  type        = string
  sensitive   = true
}
