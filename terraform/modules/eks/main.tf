# ============================================================
# EKS Module
# Creates EKS cluster with two managed node groups:
#   wso2     — t3.medium, for WSO2 IS and APIM
#   services — t3.small,  for NestJS microservices
# Also creates the IAM OIDC provider for GitHub Actions
# to assume roles without long-lived AWS keys.
# ============================================================

data "aws_caller_identity" "current" {}

# ----------------------------------------------------------------
# IAM role for EKS control plane
# ----------------------------------------------------------------
resource "aws_iam_role" "eks_cluster" {
  name = "${var.name_prefix}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# ----------------------------------------------------------------
# EKS Cluster
# ----------------------------------------------------------------
resource "aws_eks_cluster" "main" {
  name     = "${var.name_prefix}-cluster"
  version  = var.cluster_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# ----------------------------------------------------------------
# IAM role for EKS nodes
# ----------------------------------------------------------------
resource "aws_iam_role" "eks_node" {
  name = "${var.name_prefix}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_node_policy" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    # Allow nodes to read SSM parameters at pod startup
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess",
  ])
  role       = aws_iam_role.eks_node.name
  policy_arn = each.value
}

# ----------------------------------------------------------------
# Node group — WSO2 IS + APIM (t3.medium)
# min 0 / max 1 — scale to zero when not in use to save credits
# ----------------------------------------------------------------
resource "aws_eks_node_group" "wso2" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.name_prefix}-wso2"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  instance_types  = [var.wso2_instance_type]

  scaling_config {
    desired_size = 1
    min_size     = 0
    max_size     = 1
  }

  labels = {
    nodegroup = "wso2"
  }

  # Taint so only WSO2 pods land on this node group
  taint {
    key    = "workload"
    value  = "wso2"
    effect = "NO_SCHEDULE"
  }

  depends_on = [aws_iam_role_policy_attachment.eks_node_policy]
}

# ----------------------------------------------------------------
# Node group — NestJS services (t3.small)
# ----------------------------------------------------------------
resource "aws_eks_node_group" "services" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.name_prefix}-services"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  instance_types  = [var.services_instance_type]

  scaling_config {
    desired_size = 1
    min_size     = 0
    max_size     = 2
  }

  labels = {
    nodegroup = "services"
  }

  depends_on = [aws_iam_role_policy_attachment.eks_node_policy]
}

# ----------------------------------------------------------------
# Security group for nodes — referenced by RDS module
# ----------------------------------------------------------------
resource "aws_security_group" "eks_nodes" {
  name        = "${var.name_prefix}-eks-nodes-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-eks-nodes-sg"
  }
}

# ----------------------------------------------------------------
# OIDC Provider — enables GitHub Actions to assume IAM roles
# without long-lived AWS access keys (more secure)
# ----------------------------------------------------------------
data "tls_certificate" "eks_oidc" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# ----------------------------------------------------------------
# IAM role for GitHub Actions — assumed via OIDC, no static keys
# ----------------------------------------------------------------
resource "aws_iam_role" "github_actions" {
  name = "${var.name_prefix}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:Ravindu-Ishan/CTSE_Microservices:ref:refs/heads/master"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_eks" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# Inline policy — allow GitHub Actions to update EKS deployments
resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "eks-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = "*"
      }
    ]
  })
}

# ----------------------------------------------------------------
# Kafka node
# ----------------------------------------------------------------
resource "aws_eks_node_group" "kafka" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.name_prefix}-kafka"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  instance_types  = ["t3.small"]

  scaling_config {
    desired_size = 1
    min_size     = 0
    max_size     = 1
  }

  labels = {
    nodegroup = "kafka"
  }

  taint {
    key    = "workload"
    value  = "kafka"
    effect = "NO_SCHEDULE"
  }

  depends_on = [aws_iam_role_policy_attachment.eks_node_policy]
}