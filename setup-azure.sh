#!/bin/bash
# 최초 1회만 실행. Azure 리소스 생성 + GitHub Secret 값 출력.
set -e

RESOURCE_GROUP="sangheun-test-personal-krc-rg001-629"
ACR_NAME="raidlogacr"
IMAGE_NAME="raid-log"
APP_PLAN="raid-log-plan"
APP_NAME="raid-log-app"

# ACR은 이미 생성된 경우 스킵
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true 2>/dev/null || echo "ACR already exists, skipping."

az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
# 초기 이미지는 nginx placeholder — GitHub Actions 첫 실행 시 실제 이미지로 교체됨
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --name $APP_NAME \
  --deployment-container-image-name nginx \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password "$ACR_PASSWORD"

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
echo ""
echo "추가 작업:"
echo "1. login.html의 redirectUri를 https://$APP_NAME.azurewebsites.net/login.html 로 변경"
echo "2. Azure Portal 앱 등록 > 인증 > SPA에 https://$APP_NAME.azurewebsites.net/login.html 추가"
