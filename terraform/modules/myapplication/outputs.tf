output "application_id" {
  description = "AppRegistry application ID"
  value       = aws_servicecatalogappregistry_application.main.id
}

output "application_arn" {
  description = "AppRegistry application ARN"
  value       = aws_servicecatalogappregistry_application.main.arn
}
