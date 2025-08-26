# 🚀 Guia de Deployment em Produção - ONDE Web

## 📋 Pré-requisitos

- Docker instalado (versão 20.10+)
- Docker Compose (opcional, mas recomendado)
- Arquivo `src/base.js` configurado com credenciais Firebase
- Variáveis de ambiente configuradas

## 🔧 Preparação do Ambiente

### 1. Configurar Variáveis de Ambiente

Criar arquivo `.env.production.local`:
```bash
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_api_aqui

# Configurações Next.js (opcional)
NODE_ENV=production
```

### 2. Configurar Firebase

Certifique-se de que o arquivo `src/base.js` existe com a configuração:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx",
  projectId: "xxx",
  storageBucket: "xxx",
  messagingSenderId: "xxx",
  appId: "xxx"
};

const app = initializeApp(firebaseConfig);
export const firebase = {
  firestore: () => getFirestore(app),
  storage: () => getStorage(app)
};
```

## 🐳 Build com Docker

### Opção 1: Build e Run Direto

#### 1.1 Construir a imagem Docker
```bash
docker build -t onde-web:latest .
```

#### 1.2 Executar o container
```bash
docker run -d \
  --name onde-web \
  -p 3000:3000 \
  --env-file .env.production.local \
  onde-web:latest
```

#### 1.3 Verificar logs
```bash
docker logs -f onde-web
```

### Opção 2: Usando Docker Compose (Recomendado)

#### 2.1 Criar arquivo `docker-compose.yml`
```yaml
version: '3.8'

services:
  onde-web:
    build: .
    container_name: onde-web
    ports:
      - "3000:3000"
    env_file:
      - .env.production.local
    restart: unless-stopped
    volumes:
      - ./src/base.js:/app/src/base.js:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### 2.2 Build e iniciar com Docker Compose
```bash
# Build e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

## 📦 Build Manual (Sem Docker)

### 1. Instalar dependências
```bash
npm install
```

### 2. Build de produção
```bash
npm run build
```

### 3. Iniciar servidor de produção
```bash
npm start
```

## 🔍 Verificação da Aplicação

### 1. Verificar se está rodando
```bash
# Com Docker
docker ps | grep onde-web

# Verificar saúde
curl http://localhost:3000
```

### 2. Acessar aplicação
Abrir navegador em: `http://localhost:3000`

## 🛠️ Comandos Úteis Docker

### Gestão de Containers
```bash
# Ver containers rodando
docker ps

# Ver todos containers
docker ps -a

# Parar container
docker stop onde-web

# Iniciar container
docker start onde-web

# Remover container
docker rm onde-web

# Ver logs em tempo real
docker logs -f onde-web
```

### Gestão de Imagens
```bash
# Listar imagens
docker images

# Remover imagem
docker rmi onde-web:latest

# Limpar imagens não utilizadas
docker image prune
```

### Debug e Troubleshooting
```bash
# Entrar no container
docker exec -it onde-web sh

# Ver uso de recursos
docker stats onde-web

# Inspecionar container
docker inspect onde-web
```

## 🔐 Considerações de Segurança

### 1. Variáveis Sensíveis
- **NUNCA** commitar `.env.production.local`
- **NUNCA** commitar `src/base.js` com credenciais reais
- Usar secrets management em produção (AWS Secrets, Azure Key Vault, etc.)

### 2. Dockerfile Otimizado
Para produção, considere este Dockerfile otimizado:

```dockerfile
# Multi-stage build para reduzir tamanho
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Imagem final
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoramento

### Health Check
```bash
# Verificar saúde da aplicação
curl -f http://localhost:3000/api/health || exit 1
```

### Logs
```bash
# Salvar logs em arquivo
docker logs onde-web > onde-web.log 2>&1

# Ver últimas 100 linhas
docker logs --tail 100 onde-web
```

## 🚨 Troubleshooting Comum

### Problema: Container não inicia
```bash
# Verificar logs
docker logs onde-web

# Verificar se porta está em uso
lsof -i :3000
```

### Problema: Erro de build
```bash
# Limpar cache Docker
docker system prune -a

# Rebuild sem cache
docker build --no-cache -t onde-web:latest .
```

### Problema: Aplicação não conecta ao Firebase
- Verificar se `src/base.js` existe e está correto
- Verificar credenciais Firebase
- Verificar regras de firewall

## 🔄 CI/CD Pipeline (GitHub Actions)

Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t onde-web:latest .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker tag onde-web:latest ${{ secrets.DOCKER_USERNAME }}/onde-web:latest
        docker push ${{ secrets.DOCKER_USERNAME }}/onde-web:latest
```

## 📈 Performance em Produção

### 1. Otimizações Next.js
```javascript
// next.config.mjs
module.exports = {
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    minimumCacheTTL: 60,
  },
}
```

### 2. Cache Strategy
- SessionStorage para dados frequentes
- CDN para assets estáticos
- Firebase cache rules

### 3. Nginx Reverse Proxy (Opcional)
```nginx
server {
    listen 80;
    server_name onde.co.mz;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎯 Checklist de Deploy

- [ ] Arquivo `src/base.js` configurado
- [ ] Variáveis de ambiente definidas
- [ ] Build local testado (`npm run build`)
- [ ] Docker instalado e funcionando
- [ ] Porta 3000 disponível
- [ ] Backup da base de dados realizado
- [ ] SSL/HTTPS configurado (produção)
- [ ] Domínio configurado
- [ ] Monitoramento configurado
- [ ] Plano de rollback preparado

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker logs onde-web`
2. Verificar documentação: `/doc/DOCUMENTACAO_ONDE.md`
3. Limpar cache do navegador: `sessionStorage.clear()`

---

*Última atualização: Dezembro 2024*
