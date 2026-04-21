# ============================================================
# RDS Module
# Single PostgreSQL db.t3.micro instance.
# Multiple logical databases created via init scripts.
# Publicly accessible — no dependency on EKS.
# ============================================================

# ----------------------------------------------------------------
# Subnet group — must include public subnets for publicly_accessible
# to work (AWS requires a route to IGW on the host subnet)
# ----------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.public_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-group"
  }
}

# ----------------------------------------------------------------
# Security group — standalone, no reference to EKS
# ----------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "Allow PostgreSQL access from EKS nodes and externally"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL public access"
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

  # Public endpoint — reachable from outside AWS
  publicly_accessible = true

  # Backups disabled for staging
  backup_retention_period = 0
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  deletion_protection = true
  skip_final_snapshot = true   # set false in production

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}
