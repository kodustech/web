#!/bin/bash

ENVIRONMENT=$1

# Lista de todas as chaves que você precisa
KEYS=(
    "/prod/kodus-web/WEB_HOSTNAME_API"
    "/prod/kodus-web/WEB_JWT_SECRET_KEY"
    "/prod/kodus-web/WEB_NEXTAUTH_SECRET"
    "/prod/kodus-web/NEXTAUTH_URL"

    "/prod/kodus-web/SLACK_HOSTAME"

    "/prod/kodus-web/WEB_CONNECTION_DISCORD"
    "/prod/kodus-web/WEB_DISCORD_HOSTNAME"

    "/prod/kodus-web/WEB_CONNECTION_SLACK"
    "/prod/kodus-web/GLOBAL_JIRA_CLIENT_ID"
    "/prod/kodus-web/GLOBAL_JIRA_REDIRECT_URL"
    "/prod/kodus-web/GLOBAL_GITHUB_CLIENT_ID"
    "/prod/kodus-web/GLOBAL_GITHUB_REDIRECT_URL"
    "/prod/kodus-web/WEB_GITHUB_INSTALL_URL"
    "/prod/kodus-web/WEB_JIRA_SCOPES"
    "/prod/kodus-web/WEB_TERMS_AND_CONDITIONS"
)

# Lista de todas as chaves que você precisa

ENV_FILE=".env.$ENVIRONMENT"

# Limpe o arquivo .env existente ou crie um novo
> $ENV_FILE

# Busque cada chave e adicione-a ao arquivo .env
for KEY in "${KEYS[@]}"; do
  VALUE=$(aws ssm get-parameter --name "$KEY" --with-decryption --query "Parameter.Value" --output text)
  echo "${KEY##*/}=$VALUE" >> $ENV_FILE
done
