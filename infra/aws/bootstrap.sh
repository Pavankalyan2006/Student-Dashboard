#!/usr/bin/env bash
# One-time setup of NEXORA AI on AWS. Run it in AWS CloudShell (free, already signed in to your account):
#
#   git clone https://github.com/Pavankalyan2006/Student-Dashboard.git && cd Student-Dashboard
#   bash infra/aws/bootstrap.sh --email you@example.com --region ap-south-1
#
# It is safe to run again: existing secrets are kept and the stack is updated in place.
#
# What it does:
#   1. Creates the app's secrets in SSM Parameter Store (SecureString, free) unless they already exist:
#      DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, GITHUB_TOKEN_ENCRYPTION_KEY, CERTIFICATE_SIGNING_SALT.
#      Optionally stores your GEMINI_API_KEY (asked for without echoing it).
#   2. Creates or updates the CloudFormation stack in infra/aws/nexora-stack.yml.
#   3. Prints the four GitHub repository variables the deploy workflow needs.
set -euo pipefail

PROJECT=nexora
ENVIRONMENT=prod
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-}}"
EMAIL=""
ALB=true
INSTANCE_TYPE=t3.micro
BUDGET=1
CERT_ARN=""
DOMAIN=""
REPO="Pavankalyan2006/Student-Dashboard"

usage() {
  cat <<USAGE
Usage: bash infra/aws/bootstrap.sh --email you@example.com [options]
  --region REGION          AWS region (default: the CloudShell region)
  --no-load-balancer       Serve from the instance's Elastic IP instead of an Application Load Balancer
  --instance-type TYPE     t3.micro (default) or t2.micro, whichever your Free Tier covers
  --budget USD             Monthly budget alert threshold (default 1)
  --certificate-arn ARN    ACM certificate for HTTPS (needs --domain)
  --domain NAME            Domain for HTTPS, e.g. app.example.com
  --repo OWNER/NAME        GitHub repository allowed to deploy (default $REPO)
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --region) REGION="$2"; shift 2 ;;
    --email) EMAIL="$2"; shift 2 ;;
    --no-load-balancer) ALB=false; shift ;;
    --instance-type) INSTANCE_TYPE="$2"; shift 2 ;;
    --budget) BUDGET="$2"; shift 2 ;;
    --certificate-arn) CERT_ARN="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

[ -n "$EMAIL" ] || { echo "--email is required (budget and health alerts go there)."; exit 1; }
[ -n "$REGION" ] || { echo "--region is required."; exit 1; }
command -v aws >/dev/null || { echo "The AWS CLI is needed. CloudShell has it already."; exit 1; }

STACK="$PROJECT-$ENVIRONMENT"
PARAM_PATH="/$PROJECT/$ENVIRONMENT"
HERE="$(cd "$(dirname "$0")" && pwd)"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
echo "Account $ACCOUNT, region $REGION, stack $STACK"

put_secret_if_missing() {
  local name="$1" value="$2"
  if aws ssm get-parameter --region "$REGION" --name "$PARAM_PATH/$name" >/dev/null 2>&1; then
    echo "  $name: kept existing value"
  else
    aws ssm put-parameter --region "$REGION" --name "$PARAM_PATH/$name" --type SecureString --value "$value" >/dev/null
    echo "  $name: created"
  fi
}

echo "Secrets in Parameter Store under $PARAM_PATH"
put_secret_if_missing DB_PASSWORD "$(openssl rand -hex 24)"
put_secret_if_missing JWT_SECRET "$(openssl rand -hex 48)"
put_secret_if_missing JWT_REFRESH_SECRET "$(openssl rand -hex 48)"
put_secret_if_missing GITHUB_TOKEN_ENCRYPTION_KEY "$(openssl rand -hex 32)"
put_secret_if_missing CERTIFICATE_SIGNING_SALT "$(openssl rand -hex 32)"

if ! aws ssm get-parameter --region "$REGION" --name "$PARAM_PATH/GEMINI_API_KEY" >/dev/null 2>&1; then
  read -r -s -p "Gemini API key for the AI features (press Enter to skip and add it later): " GEMINI_KEY || true
  echo
  if [ -n "${GEMINI_KEY:-}" ]; then
    aws ssm put-parameter --region "$REGION" --name "$PARAM_PATH/GEMINI_API_KEY" --type SecureString --value "$GEMINI_KEY" >/dev/null
    aws ssm put-parameter --region "$REGION" --name "$PARAM_PATH/AI_PROVIDER" --type String --value gemini --overwrite >/dev/null
    echo "  GEMINI_API_KEY: stored"
  fi
  unset GEMINI_KEY
fi

# The GitHub OIDC provider can exist only once per account.
if aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[].Arn' --output text | grep -q 'token.actions.githubusercontent.com'; then
  CREATE_OIDC=false
else
  CREATE_OIDC=true
fi

echo "Deploying CloudFormation stack $STACK (the database takes 10 to 15 minutes the first time)..."
aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK" \
  --template-file "$HERE/nexora-stack.yml" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --tags Project="$PROJECT" Environment="$ENVIRONMENT" \
  --parameter-overrides \
    ProjectName="$PROJECT" \
    Environment="$ENVIRONMENT" \
    GitHubRepository="$REPO" \
    CreateGitHubOidcProvider="$CREATE_OIDC" \
    InstanceType="$INSTANCE_TYPE" \
    EnableLoadBalancer="$ALB" \
    CertificateArn="$CERT_ARN" \
    AppDomainName="$DOMAIN" \
    AlertEmail="$EMAIL" \
    MonthlyBudgetUSD="$BUDGET"

out() { aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }

cat <<DONE

Done. Confirm the subscription email AWS just sent to $EMAIL so alerts reach you.

Add these in GitHub: repository Settings > Secrets and variables > Actions > Variables tab:
  AWS_REGION           $REGION
  AWS_DEPLOY_ROLE_ARN  $(out GitHubDeployRoleArn)
  ECR_REPOSITORY       $(out EcrRepositoryName)
  APP_URL              $(out AppUrl)

Then push to main (or run the "Deploy to AWS" workflow by hand). The first deploy starts the app at:
  $(out AppUrl)
DONE
