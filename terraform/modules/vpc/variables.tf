variable "name_prefix"         { type = string }
variable "aws_region"          { type = string }
variable "vpc_cidr"            { type = string }
variable "enable_nat_gateway"  {
  type        = bool
  default     = true
  description = "Set false when EKS is not running to eliminate NAT Gateway cost"
}
