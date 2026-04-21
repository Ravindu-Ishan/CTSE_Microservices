# Accessing WSO2 Applications via Port Forwarding

Local access to WSO2 IS and WSO2 APIM running in EKS using kubectl port-forwarding.
No ingress or load balancer configuration required.

---

## Prerequisites

### 1. Tools

- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- Your IAM user must be listed in `developer_iam_arns` in `terraform/terraform.tfvars`

### 2. Configure AWS credentials

```bash
aws configure
```

Provide your AWS Access Key ID, Secret Access Key, and set region to `ap-southeast-1`.

Verify your identity:

```bash
aws sts get-caller-identity
```

### 3. Update kubeconfig

```bash
aws eks update-kubeconfig --region ap-southeast-1 --name otss-staging-cluster
```

Verify cluster access:

```bash
kubectl get nodes
```

### 4. Add hosts file entries (one-time setup)

WSO2 applications use internal hostnames. You must map them to localhost so your browser resolves them correctly.

**Windows** — open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add:

```
127.0.0.1 wso2is.otss.internal
127.0.0.1 wso2apim.otss.internal
```

After saving, flush DNS:

```bash
ipconfig /flushdns
```

**Linux / macOS** — edit `/etc/hosts` with sudo and add the same two lines.

### 5. Windows only — run terminals as Administrator

Port 443 requires elevated privileges on Windows. All port-forward commands below must be run in a terminal opened as Administrator (right-click → Run as administrator).

---

## WSO2 Identity Server (IAM)

WSO2 IS redirects OAuth2 login flows to port 443 after authentication. You must run **two simultaneous port-forwards** — one on 9443 for the console and one on 443 to catch the OAuth2 redirect.

### Step 1 — Open two Administrator terminals and run one command in each

**Terminal 1:**
```bash
kubectl port-forward svc/wso2-is-identity-server 9443:9443 -n otss
```

**Terminal 2:**
```bash
kubectl port-forward svc/wso2-is-identity-server 443:9443 -n otss
```

Keep both terminals open for the duration of your session.

### Step 2 — Access the console

| Console | URL |
|---------|-----|
| Management Console | https://wso2is.otss.internal/console |
| Carbon Console | https://wso2is.otss.internal/carbon |

Login with the admin credentials stored in `WSO2_ADMIN_PASSWORD` (see `terraform/terraform.tfvars` or AWS SSM Parameter Store under `/otss-staging/wso2/admin-password`).

> Your browser will show a certificate warning — this is expected as WSO2 uses a self-signed cert by default. Proceed past it.

---

## WSO2 API Manager

APIM also redirects OAuth2 portal login to port 443. Same two-terminal approach applies.

### Step 1 — Open two Administrator terminals and run one command in each

**Terminal 1:**
```bash
kubectl port-forward svc/wso2-apim-wso2am-all-in-one-am-service-1 9443:9443 -n otss
```

**Terminal 2:**
```bash
kubectl port-forward svc/wso2-apim-wso2am-all-in-one-am-service-1 443:9443 -n otss
```

Keep both terminals open for the duration of your session.

### Step 2 — Access the portals

| Portal | URL |
|--------|-----|
| Publisher | https://wso2apim.otss.internal/publisher |
| Developer Portal | https://wso2apim.otss.internal/devportal |
| Admin Portal | https://wso2apim.otss.internal/admin |
| Carbon Console | https://wso2apim.otss.internal/carbon |

Login with the admin credentials stored in `APIM_ADMIN_PASSWORD` (same value as `WSO2_ADMIN_PASSWORD`).

> Your browser will show a certificate warning — proceed past it.

---

## Accessing Both Simultaneously

IS and APIM both require port 443 for OAuth2 redirects. Two processes cannot bind to the same port, so you have two options:

### Option A — Switch between them (simplest)

1. Stop all port-forward terminals (Ctrl+C)
2. Start the port-forwards for the other application

### Option B — Run all simultaneously with Caddy (4 terminals)

Caddy acts as a reverse proxy that owns port 443 and routes by hostname, so IS, APIM management, and the APIM gateway are all reachable at the same time. When using this option you do **not** need the 443 port-forward from the sections above — Caddy replaces it.

**Install Caddy:**
```bash
winget install caddyserver.caddy
```

**Add all entries to your hosts file:**
```
127.0.0.1 wso2is.otss.internal
127.0.0.1 wso2apim.otss.internal
127.0.0.1 wso2apim-gw.otss.internal
```

Then flush DNS: `ipconfig /flushdns`

**Terminal 1 — IS management on 19443:**
```bash
kubectl port-forward svc/wso2-is-identity-server 19443:9443 -n otss
```

**Terminal 2 — APIM management on 29443:**
```bash
kubectl port-forward svc/wso2-apim-wso2am-all-in-one-am-service 29443:9443 -n otss
```

**Terminal 3 — APIM gateway on 39443:**
```bash
kubectl port-forward svc/wso2-apim-wso2am-all-in-one-am-service 39443:8243 -n otss
```

**Terminal 4 — Caddy (run as Administrator):**
```bash
caddy run
```

Caddy reads the `Caddyfile` in the repo root and routes all three hostnames on port 443. Keep all four terminals open.

> Caddy cannot talk to Kubernetes directly — Terminals 1, 2, and 3 must remain running.

**Access links:**
```
APIM:
Publisher:         https://wso2apim.otss.internal/publisher
Developer Portal:  https://wso2apim.otss.internal/devportal
Admin Portal:      https://wso2apim.otss.internal/admin
Carbon Console:    https://wso2apim.otss.internal/carbon
Gateway (Try-It):  https://wso2apim-gw.otss.internal

IS:
Management Console: https://wso2is.otss.internal/console
Carbon Console:     https://wso2is.otss.internal/carbon
```
---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `bind: An attempt was made to access a socket in a way forbidden` | Terminal is not running as Administrator |
| `wso2is.otss.internal` resolves incorrectly | Run `ipconfig /flushdns` after editing hosts file |
| `ERR_CONNECTION_REFUSED` | Port-forward is not running — check both terminals |
| `Unable to connect to the server` in kubectl | Run `aws eks update-kubeconfig` again |
| Login redirects to a broken URL | Port 443 port-forward is missing — start Terminal 2 |
| `wsasend: An established connection was aborted` | Normal on Windows during OAuth2 redirect — login still completes |
