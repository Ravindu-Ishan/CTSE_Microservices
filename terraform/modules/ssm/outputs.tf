output "user_service_database_url_param" {
  value = aws_ssm_parameter.user_service_database_url.name
}

output "wso2_identity_db_url_param" {
  value = aws_ssm_parameter.wso2_identity_db_url.name
}
