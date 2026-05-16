#!/bin/bash
# 최초 1회만 실행. App Service + GitHub Secret 값 출력.
set -e

RESOURCE_GROUP="sangheun-test-personal-krc-rg001-629"
ACR_NAME="raidlogacr"
IMAGE_NAME="raid-log"
APP_PLAN="raid-log-plan"
APP_NAME="raid-log-app"

echo "=== App Service Plan 생성 ==="
az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

echo "=== Web App 생성 ==="
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --name $APP_NAME \
  --deployment-container-image-name nginx \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password "$ACR_PASSWORD"

echo "=== GitHub Actions용 Service Principal 생성 ==="
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SP_JSON=$(az ad sp create-for-rbac \
  --name "raid-log-github-actions" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth)

echo ""
echo "======================================================"
echo "GitHub > Settings > Secrets > Actions 에 추가하세요"
echo "======================================================"
echo "Secret 이름: AZURE_CREDENTIALS"
echo "Secret 값:"
echo "$SP_JSON"
echo ""
echo "배포 URL: https://$APP_NAME.azurewebsites.net"
