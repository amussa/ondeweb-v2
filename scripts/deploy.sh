#!/bin/bash

# Script de Deploy - ONDE Web
# Uso: ./deploy.sh [development|production]

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="onde-web"
DOCKER_IMAGE="onde-web:latest"
CONTAINER_NAME="onde-web"
PORT=3000

# Função para imprimir com cor
print_color() {
    printf "${2}${1}${NC}\n"
}

# Verificar argumento
ENVIRONMENT=${1:-development}

print_color "🚀 Iniciando deploy para: $ENVIRONMENT" "$GREEN"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_color "❌ Docker não está instalado!" "$RED"
    exit 1
fi

# Verificar arquivo base.js
if [ ! -f "src/base.js" ]; then
    print_color "⚠️  Arquivo src/base.js não encontrado!" "$YELLOW"
    print_color "Por favor, crie o arquivo com as configurações do Firebase" "$YELLOW"
    exit 1
fi

# Verificar arquivo de ambiente
ENV_FILE=".env.$ENVIRONMENT.local"
if [ ! -f "$ENV_FILE" ]; then
    print_color "⚠️  Arquivo $ENV_FILE não encontrado!" "$YELLOW"
    print_color "Criando arquivo de exemplo..." "$YELLOW"
    echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here" > $ENV_FILE
fi

# Parar container existente
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    print_color "🛑 Parando container existente..." "$YELLOW"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Build da imagem
print_color "🔨 Construindo imagem Docker..." "$GREEN"
docker build -t $DOCKER_IMAGE .

if [ $? -ne 0 ]; then
    print_color "❌ Erro no build da imagem!" "$RED"
    exit 1
fi

# Executar container
print_color "🏃 Iniciando container..." "$GREEN"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    --env-file $ENV_FILE \
    --restart unless-stopped \
    $DOCKER_IMAGE

if [ $? -ne 0 ]; then
    print_color "❌ Erro ao iniciar container!" "$RED"
    exit 1
fi

# Aguardar container iniciar
print_color "⏳ Aguardando aplicação iniciar..." "$YELLOW"
sleep 10

# Verificar se está rodando
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    print_color "✅ Deploy concluído com sucesso!" "$GREEN"
    print_color "" "$NC"
    print_color "📊 Informações do Deploy:" "$GREEN"
    print_color "   Container: $CONTAINER_NAME" "$NC"
    print_color "   Porta: $PORT" "$NC"
    print_color "   URL: http://localhost:$PORT" "$NC"
    print_color "" "$NC"
    print_color "📝 Comandos úteis:" "$YELLOW"
    print_color "   Ver logs: docker logs -f $CONTAINER_NAME" "$NC"
    print_color "   Parar: docker stop $CONTAINER_NAME" "$NC"
    print_color "   Reiniciar: docker restart $CONTAINER_NAME" "$NC"
    print_color "" "$NC"
    print_color "🧹 Lembre-se de limpar o cache do navegador!" "$YELLOW"
    print_color "   No console: sessionStorage.clear()" "$NC"
else
    print_color "❌ Container não está rodando!" "$RED"
    print_color "Verificando logs..." "$YELLOW"
    docker logs $CONTAINER_NAME
    exit 1
fi
