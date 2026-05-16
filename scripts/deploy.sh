#!/bin/bash
set -e

RESOURCE_GROUP="raid-log-rg"
LOCATION="koreacentral"
ACR_NAME="raidlogacr"
IMAGE_NAME="raid-log"
APP_PLAN="raid-log-plan"
APP_NAME="raid-log-app"
APP_URL="https://${APP_NAME}.azurewebsites.net"

echo "=== Azure 로그인 확인 ==="
az account show > /dev/null 2>&1 || az login

echo "=== 리소스 그룹 생성 ==="
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "=== Container Registry 생성 ==="
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

echo "=== Docker 이미지 빌드 & 푸시 ==="
az acr build --registry $ACR_NAME --image $IMAGE_NAME:latest .

echo "=== App Service Plan 생성 (Linux B1) ==="
az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

echo "=== Web App 생성 ==="
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --name $APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/$IMAGE_NAME:latest \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password "$ACR_PASSWORD"

echo ""
echo "=== 배포 완료 ==="
echo "URL: $APP_URL"
echo ""
echo "*** 다음 작업 필요 ***"
echo "1. login.html의 redirectUri를 ${APP_URL}/login.html 로 변경"
echo "2. Azure Portal 앱 등록 > 인증 > SPA에 ${APP_URL}/login.html 추가"
