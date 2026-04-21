# ============================================================
# Root — OTSS Infrastructure
# Wires VPC → EKS → RDS → SSM → myApplication modules.
# ============================================================

locals {
  name_prefix = "${var.project}-${var.environment}"
}

# ----------------------------------------------------------------
# VPC
# ----------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  name_prefix        = local.name_prefix
  aws_region         = var.aws_region
  vpc_cidr           = var.vpc_cidr
  enable_nat_gateway = var.enable_nat_gateway
}

# ----------------------------------------------------------------
# EKS
# ----------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  name_prefix            = local.name_prefix
  aws_region             = var.aws_region
  cluster_version        = var.eks_cluster_version
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  wso2_instance_type     = var.wso2_instance_type
  services_instance_type = var.services_instance_type
  developer_iam_arns     = var.developer_iam_arns
}

# ----------------------------------------------------------------
# RDS
# ----------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  db_instance_class  = var.db_instance_class
  db_username        = var.db_username
  db_password        = var.db_password
}

# ----------------------------------------------------------------
# SSM Parameter Store — all secrets
# ----------------------------------------------------------------
module "ssm" {
  source = "./modules/ssm"

  name_prefix         = local.name_prefix
  db_username         = var.db_username
  db_password         = var.db_password
  db_endpoint         = module.rds.db_endpoint
  wso2_admin_password = var.wso2_admin_password
  wso2_client_id      = var.wso2_client_id
  wso2_client_secret  = var.wso2_client_secret
  wso2_webhook_secret = var.wso2_webhook_secret
}

# ----------------------------------------------------------------
# myApplications — groups all OTSS resources in one console view
# Enables Resource Explorer + AppRegistry application.
# After applying: AWS Console → myApplications → otss-staging-app
# ----------------------------------------------------------------
module "myapplication" {
  source = "./modules/myapplication"

  name_prefix = local.name_prefix
  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region
}
