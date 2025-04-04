#!/bin/bash
set -euo pipefail

# Uso:
# ./update-sg.sh add <group-id> <port> <cidr>
# ./update-sg.sh remove <group-id> <port> <cidr>

if [ "$#" -ne 4 ]; then
  echo "Uso: $0 add|remove <group-id> <port> <cidr>" >&2
  exit 1
fi

ACTION=$1
GROUP_ID=$2
PORT=$3
CIDR=$4

if [ "$ACTION" = "add" ]; then
  echo "Adicionando regra no Security Group..."
  aws ec2 authorize-security-group-ingress \
    --group-id "$GROUP_ID" \
    --protocol tcp \
    --port "$PORT" \
    --cidr "$CIDR" > /dev/null 2>&1
elif [ "$ACTION" = "remove" ]; then
  echo "Removendo regra no Security Group..."
  aws ec2 revoke-security-group-ingress \
    --group-id "$GROUP_ID" \
    --protocol tcp \
    --port "$PORT" \
    --cidr "$CIDR" > /dev/null 2>&1
else
  echo "Ação inválida: use add ou remove" >&2
  exit 1
fi
