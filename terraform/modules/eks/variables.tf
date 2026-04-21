variable "name_prefix"            { type = string }
variable "aws_region"             { type = string }
variable "cluster_version"        { type = string }
variable "vpc_id"                 { type = string }
variable "private_subnet_ids"     { type = list(string) }
variable "wso2_instance_type"     { type = string }
variable "services_instance_type" { type = string }
variable "developer_iam_arns"     { type = list(string) }
