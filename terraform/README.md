# Steps to take down resources and keep only datbaase running

## Step 1 — Apply first (breaks the EKS→RDS dependency in AWS)
```
terraform apply
```
This removes the EKS SG ingress rule from the RDS SG in AWS, sets publicly_accessible = true, and ensures RDS is fully standalone. Check the plan output before typing yes — you should see RDS SG being updated in-place, NOT destroyed.

## Step 2 — Destroy EKS only
```
terraform destroy -target="module.eks"
```
Before typing yes, verify the plan output contains only module.eks.* resources. If you see module.rds or module.ssm in the list, do not proceed and paste the plan here.

## Step 3 — Remove NAT Gateway
Add this to terraform.tfvars:

```
enable_nat_gateway = false
```
Then:
```
terraform apply
```
### Step 4 — Verify RDS is still up and accessible

Confirm RDS is still in Terraform state
```
terraform state list | grep rds
```
## Get the endpoint
```
terraform output
```
## or
```
terraform state show module.rds.aws_db_instance.main | grep -E "endpoint|publicly|status"
```