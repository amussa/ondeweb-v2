# 🔧 Correção do Build em Produção

## ❌ Problema Identificado

O Dockerfile em produção está configurado incorretamente:
- Está tentando usar **Vite** em vez de **Next.js**
- Tem um diretório errado: `WORKDIR /app/web` (não existe)
- Está procurando por `index.html` (projeto Vite) em vez de páginas Next.js

## ✅ Solução Imediata

### Opção 1: Usar o Dockerfile Correto (Recomendado)

```bash
# No servidor de produção, navegue até o diretório do projeto
cd /app/onde/web

# Crie um novo Dockerfile correto
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Faça o build novamente
docker build -t onde-web:latest .
```

### Opção 2: Copiar do Repositório

```bash
# Clone ou pull as últimas alterações
git pull origin main

# Use o Dockerfile do repositório
cp Dockerfile.production Dockerfile

# Build
docker build -t onde-web:latest .
```

## 📝 Verificar package.json

Certifique-se de que o `package.json` tem os scripts corretos:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🚀 Comandos Completos para Deploy

```bash
# 1. Parar container existente (se houver)
docker stop onde-web || true
docker rm onde-web || true

# 2. Criar Dockerfile correto
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF

# 3. Build da imagem
docker build -t onde-web:latest .

# 4. Executar container
docker run -d \
  --name onde-web \
  -p 3000:3000 \
  --restart unless-stopped \
  onde-web:latest

# 5. Verificar logs
docker logs -f onde-web
```

## ⚠️ Checklist Antes do Build

- [ ] Arquivo `src/base.js` existe com configurações Firebase
- [ ] `package.json` tem scripts Next.js (não Vite)
- [ ] Não existe diretório `/web` dentro do projeto
- [ ] Usando Node 18 Alpine (não Node 20)

## 🔍 Debug

Se ainda tiver problemas:

```bash
# Verificar estrutura do diretório
ls -la

# Verificar package.json
cat package.json | grep scripts -A 5

# Verificar se é projeto Next.js
ls next.config.mjs

# Limpar cache Docker
docker system prune -a
```

## 📁 Estrutura Esperada

```
/app/onde/web/
├── Dockerfile
├── package.json
├── package-lock.json
├── next.config.mjs
├── src/
│   ├── app/
│   ├── components/
│   └── base.js
└── public/
```

## 🆘 Solução Alternativa (Build Manual)

Se o Docker continuar com problemas:

```bash
# Build manual sem Docker
npm ci
npm run build

# Executar diretamente
npm start

# Ou usar PM2
npm install -g pm2
pm2 start npm --name "onde-web" -- start
```
