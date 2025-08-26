#!/bin/bash

# Script para corrigir o build Docker em produção
# Execute este script no servidor de produção

echo "🔧 Corrigindo Dockerfile para Next.js..."

# Criar backup do Dockerfile atual (se existir)
if [ -f "Dockerfile" ]; then
    echo "📦 Fazendo backup do Dockerfile atual..."
    cp Dockerfile Dockerfile.backup.$(date +%Y%m%d_%H%M%S)
fi

# Criar novo Dockerfile correto
echo "✏️ Criando Dockerfile correto para Next.js..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e o package-lock.json para o container
COPY package*.json ./

# Instale as dependências de produção
RUN npm ci --only=production

# Copie o restante do código do projeto
COPY . .

# Construa o projeto Next.js
RUN npm run build

# Exponha a porta na qual a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
EOF

echo "✅ Dockerfile criado com sucesso!"

# Verificar se package.json tem scripts Next.js
echo ""
echo "🔍 Verificando scripts no package.json..."
if grep -q "next build" package.json; then
    echo "✅ Scripts Next.js encontrados!"
else
    echo "⚠️ AVISO: Scripts Next.js não encontrados no package.json!"
    echo "Verifique se o package.json está correto."
fi

# Verificar se next.config existe
echo ""
echo "🔍 Verificando configuração Next.js..."
if [ -f "next.config.mjs" ] || [ -f "next.config.js" ]; then
    echo "✅ Configuração Next.js encontrada!"
else
    echo "⚠️ AVISO: next.config não encontrado!"
fi

# Verificar se src/base.js existe
echo ""
echo "🔍 Verificando configuração Firebase..."
if [ -f "src/base.js" ]; then
    echo "✅ Arquivo src/base.js encontrado!"
else
    echo "⚠️ AVISO: src/base.js não encontrado!"
    echo "Crie o arquivo com as configurações do Firebase antes do build."
fi

echo ""
echo "📋 Próximos passos:"
echo "1. Execute: docker build -t onde-web:latest ."
echo "2. Execute: docker run -d --name onde-web -p 3000:3000 onde-web:latest"
echo ""
echo "🚀 Script concluído!"
