# ============================================================
# RDS Module
# Single PostgreSQL db.t3.micro instance.
# Multiple logical databases created via init scripts.
# Publicly accessible for external dev/admin access.
# ============================================================

# ----------------------------------------------------------------
# Subnet group — must include public subnets for publicly_accessible
# to work (AWS requires a route to IGW on the host subnet)
# ----------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = concat(var.public_subnet_ids, var.private_subnet_ids)

  tags = {
    Name = "${var.name_prefix}-db-subnet-group"
  }
}

# ----------------------------------------------------------------
# Security group — EKS nodes + external access on port 5432
# ----------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "Allow PostgreSQL access from EKS nodes and externally"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from EKS nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_node_sg_id]
  }

  ingress {
    description = "PostgreSQL external access (staging only)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-rds-sg"
  }
}

# ----------------------------------------------------------------
# RDS PostgreSQL instance
# ----------------------------------------------------------------
resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  engine         = "postgres"
  engine_version = "17.7"
  instance_class = var.db_instance_class

  username = var.db_username
  password = var.db_password

  # Storage — 20GB is the free tier maximum
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp2"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Publicly accessible — allows external connections (e.g. DBeaver, psql from dev machines)
  publicly_accessible = true

  # Backups — 7 day retention
  backup_retention_period = 0
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Prevent accidental deletion
  deletion_protection = false  # set true in production
  skip_final_snapshot = true   # set false in production

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}
