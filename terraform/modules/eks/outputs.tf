output "cluster_name"             { value = aws_eks_cluster.main.name }
output "cluster_endpoint"         { value = aws_eks_cluster.main.endpoint }
output "node_security_group_id"   { value = aws_security_group.eks_nodes.id }
output "github_actions_role_arn"  { value = aws_iam_role.github_actions.arn }
output "oidc_provider_arn"        { value = aws_iam_openid_connect_provider.eks.arn }
