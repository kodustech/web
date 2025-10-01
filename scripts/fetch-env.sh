#!/bin/bash

ENVIRONMENT=$1

# Lista de todas as chaves que você precisa
KEYS=(
    "/prod/kodus-web/WEB_HOSTNAME_API"
    "/prod/kodus-web/WEB_NEXTAUTH_SECRET"
    "/prod/kodus-web/NEXTAUTH_URL"

    "/prod/kodus-web/WEB_GITHUB_INSTALL_URL"
    "/prod/kodus-web/WEB_JIRA_SCOPES"
    "/prod/kodus-web/WEB_TERMS_AND_CONDITIONS"

    "/prod/kodus-web/WEB_RULE_FILES_DOCS"
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
