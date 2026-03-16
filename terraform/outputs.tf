output "eks_cluster_name" {
  description = "EKS cluster name — needed for kubectl and GitHub Actions secret"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  description = "RDS instance endpoint — used in deployment.toml for production"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "aws_region" {
  description = "Deployed region — needed for GitHub Actions secret"
  value       = var.aws_region
}
