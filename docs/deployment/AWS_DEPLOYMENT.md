# Deploying NEXORA AI on AWS (Free Tier)

NEXORA AI runs on AWS with GitHub Actions as the CI/CD system. Everything is defined in this repository:

| File | What it is |
| --- | --- |
| `infra/aws/nexora-stack.yml` | CloudFormation template: network, load balancer, server, database, registry, logs, alarms, budget, GitHub deploy role |
| `infra/aws/bootstrap.sh` | One-time setup: creates secrets, creates or updates the stack, prints the GitHub variables |
| `.github/workflows/ci.yml` | CI on every push and pull request: typecheck, tests, production build, Docker build |
| `.github/workflows/deploy-aws.yml` | CD after CI passes on `main`: build image, push to ECR, deploy to the server, smoke test |

## Architecture

```
 GitHub (push to main)
   │  CI: typecheck, tests, build, Docker build
   ▼
 GitHub Actions ──OIDC (no stored keys)──► IAM role ──► ECR (image)  ──► SSM Run Command
                                                                          │ deploy.sh <commit>
 Internet                                                                 ▼
   │ HTTP/HTTPS    ┌────────────── VPC 10.40.0.0/16 ───────────────────────────────────┐
   └──────────────►│ Public subnets (2 AZs)                                            │
                   │   Application Load Balancer ──► EC2 t3.micro (Docker, 1 instance)  │
                   │                                 Auto Scaling group: self-healing  │
                   │ Private subnets (2 AZs, no internet route)          │ 5432        │
                   │   RDS PostgreSQL 17 db.t4g.micro, 20 GB, encrypted ◄┘             │
                   └───────────────────────────────────────────────────────────────────┘
 Parameter Store: secrets   CloudWatch: logs + alarms   SNS + Budgets: email alerts
```

- **Database:** Amazon RDS PostgreSQL holds all app state (`STATE_STORE=postgres`) and the student profiles
  (`PROFILE_STORE=supabase`, which accepts any PostgreSQL connection string). It sits in private subnets and
  accepts connections only from the app server's security group. The connection uses SSL, verified against the
  Amazon RDS CA bundle baked into the image.
- **Network:** no NAT gateway (not in the Free Tier). The server lives in a public subnet so it can pull images
  and reach AI providers, but its security group accepts traffic only from the load balancer. No SSH port is
  open; use Session Manager instead.
- **Load:** the Application Load Balancer health-checks `/health/ready` and only sends traffic to a ready server.
  The Auto Scaling group keeps exactly one server running and replaces it if it fails.
- **Why one server:** the app keeps its working state in memory and saves it to PostgreSQL. Two copies would
  overwrite each other's data, so do not raise `MaxSize` above 1 until the state layer is changed.
- **Secrets:** SSM Parameter Store SecureStrings under `/nexora/prod/` (free, unlike Secrets Manager). The
  server reads them at deploy time and passes them to the container; they are never in the image or in Git.

## What it costs

AWS has two kinds of free account. Check yours under **Billing and Cost Management > Free Tier**.

- **Free plan** (accounts created from 15 July 2025): you get credits (up to USD 200) for six months, and
  everything here is paid from them. At list prices that is roughly **USD 45 to 55 a month with the load
  balancer** (the credits last about four months) or **USD 25 to 30 without it** (`--no-load-balancer`; the credits
  then cover the whole six months). Treat these as estimates; the budget alert tells you the real numbers.
- **12-month Free Tier** (older accounts): within the first 12 months these are free: 750 hours of a t2.micro
  (t3.micro where t2 does not exist), 750 hours of a db.t3/t4g.micro with 20 GB storage, 750 hours of an
  Application Load Balancer, 30 GB of EBS, 500 MB of ECR storage, 10 CloudWatch alarms, 5 GB of logs and 1,000
  SNS emails. Choose `--instance-type t2.micro` if your region has t2.

Things that can still cost money on either kind of account:

- **Public IPv4 addresses:** USD 0.005 per hour each. The free allowance covers one EC2 address; the load
  balancer uses two more (about USD 7 a month). Use `--no-load-balancer` to serve from a single Elastic IP.
- **More than one server, Multi-AZ, larger instances or more storage** than the template sets.
- **Database snapshots left after deleting the stack** (the template keeps a final snapshot on purpose).

The stack creates a monthly budget alert (default USD 1) that emails you at 80% of actual spend and when the
forecast passes it. GitHub Actions is free for public repositories (2,000 minutes a month for private ones).

## First-time setup (about 20 minutes, mostly waiting)

1. **Open AWS CloudShell** (the `>_` icon in the AWS console's top bar) in the region you want, for example
   `ap-south-1` (Mumbai). CloudShell is free and already signed in.
2. **Run the bootstrap script:**

   ```bash
   git clone https://github.com/Pavankalyan2006/Student-Dashboard.git
   ```

   ```bash
   cd Student-Dashboard && bash infra/aws/bootstrap.sh --email you@example.com --region ap-south-1
   ```

   It asks for a Gemini API key (optional, hidden as you type), then creates the stack. The database takes 10 to
   15 minutes. Add `--no-load-balancer` to skip the load balancer.
3. **Confirm the email** AWS sends to that address, so budget and health alerts reach you.
4. **Add the four variables** the script prints in GitHub: repository **Settings > Secrets and variables >
   Actions > Variables**: `AWS_REGION`, `AWS_DEPLOY_ROLE_ARN`, `ECR_REPOSITORY`, `APP_URL`. They are not secrets:
   the role can only be assumed by this repository's `main` branch.
5. **Deploy:** push to `main`, or run **Actions > Deploy to AWS > Run workflow**. Open `APP_URL` when it finishes.

## Everyday work

- **Pull request:** CI runs typecheck, tests, the production build and a Docker build.
- **Merge to main:** CI runs again; when it passes, *Deploy to AWS* builds the image tagged with the commit,
  pushes it to ECR (plus `latest`), and runs `/opt/nexora/deploy.sh <commit>` on the server through Systems
  Manager. The server starts the new container, waits for `/health/ready`, and **rolls back to the previous
  image automatically** if the new one never gets healthy. The workflow then checks `APP_URL/health/ready`.
- **Roll back by hand:** in the Actions tab, re-run an older successful *Deploy to AWS* run, or run on the server
  `sudo /opt/nexora/deploy.sh <older-commit-sha>`.
- **Change a setting or secret:** edit it in Parameter Store under `/nexora/prod/` (for example
  `GEMINI_API_KEY`, `CORS_ORIGINS`, `ADMIN_BOOTSTRAP_PASSWORD`), then redeploy. Every parameter there becomes an
  environment variable of the same name.
- **Logs:** CloudWatch Logs, group `/nexora/prod/app` (kept 14 days).
- **Shell on the server:** EC2 console > the instance > **Connect > Session Manager**. No SSH key needed.
- **Infrastructure changes:** edit `infra/aws/nexora-stack.yml`, then run the bootstrap script again; it updates
  the stack in place and keeps the secrets.

## HTTPS with your own domain

1. Request a free public certificate in **AWS Certificate Manager** (same region) for your domain and validate it.
2. Run the bootstrap script again with `--certificate-arn <arn> --domain app.example.com`.
3. Point a CNAME for the domain at the `LoadBalancerDnsName` stack output, and set the `APP_URL` variable in
   GitHub to `https://app.example.com`.

## Database

- Automated daily backups with 1-day retention (the Free Tier limit). Take a manual snapshot in the RDS console
  before risky changes.
- Schema migrations in `supabase/migrations/` run automatically when the app starts.
  `20261108000000_postgres_compat.sql` adds the two Supabase roles and `auth.jwt()` on plain PostgreSQL so the
  Phase 5 migration also runs on RDS; on Supabase it does nothing.
- Deletion protection is on. To delete the database, turn it off in the RDS console first.

## Tearing it down

```bash
aws rds modify-db-instance --db-instance-identifier nexora-prod-db --no-deletion-protection --apply-immediately --region ap-south-1
```

```bash
aws cloudformation delete-stack --stack-name nexora-prod --region ap-south-1
```

A final database snapshot is kept; delete it in the RDS console if you no longer need it. Delete the ECR images
first if the stack reports that the repository is not empty. The Parameter Store values stay until you delete them.

## Before going public

- The seeded demo student `student@btech.edu` uses the password `Password123!`, which is in the source code.
  Anyone can sign in as that student on a public deployment. Remove or change that account before sharing the URL.
- Set `ADMIN_BOOTSTRAP_PASSWORD` in Parameter Store only if you need the admin account; otherwise it gets a random
  password and cannot be used.
