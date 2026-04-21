# Cost-saving teardown — keep RDS running, destroy everything else

> **Rule:** Never run `terraform destroy` without `-target`. It will delete RDS and all data.
> The VPC must stay up — it hosts the Internet Gateway that makes RDS reachable from pgAdmin4.

---

## Tear down (save costs, keep RDS accessible)

### Step 1 — Destroy EKS (control plane + all node groups)
```
terraform destroy -target=module.eks
```
Before confirming, verify the plan shows only `module.eks.*` resources. If you see `module.rds` or `module.vpc` in the list, do not proceed.

### Step 2 — Disable NAT Gateway (~$32/month saving)
In `terraform.tfvars`, set:
```
enable_nat_gateway = false
```
Then:
```
terraform apply -target=module.vpc
```

### Step 3 — Verify RDS is still reachable
```
terraform state list | grep rds
terraform output rds_endpoint
```
Connect from pgAdmin4 using the same endpoint as before — it should still be accessible.

---

## Bring everything back up

### Step 1 — Re-enable NAT Gateway
In `terraform.tfvars`, set:
```
enable_nat_gateway = true
```
Then:
```
terraform apply -target=module.vpc
```

### Step 2 — Apply everything
```
terraform apply
```
This recreates EKS, node groups, access entries, and all remaining resources.

---

## What stays running (and costs money) during teardown
| Resource | Cost | Why kept |
|---|---|---|
| VPC, subnets, IGW, route tables | Free | Required for RDS external access |
| RDS db.t3.micro | Free tier / ~$15/mo | Preserves databases and schemas |
| SSM parameters | ~$0 | Preserves secrets |

## What gets destroyed
| Resource | Monthly saving |
|---|---|
| EKS control plane | ~$72 |
| EC2 nodes (3 node groups) | ~$30–60 |
| NAT Gateway | ~$32 |
