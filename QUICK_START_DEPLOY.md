# 🚀 Quick Start - Deploy em Produção

## ⚡ Passos Rápidos (5 minutos)

### 1️⃣ Preparar Configurações

```bash
# Criar arquivo Firebase (OBRIGATÓRIO)
# Copie o conteúdo do Firebase Console para src/base.js
touch src/base.js

# Criar arquivo de variáveis de ambiente
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui" > .env.production.local
```

### 2️⃣ Deploy Automático (Recomendado)

```bash
# Opção A: Usar script automático
./deploy.sh production

# Opção B: Usar Docker Compose
docker-compose up -d --build
```

### 3️⃣ Deploy Manual

```bash
# Build da imagem
docker build -t onde-web:latest .

# Executar container
docker run -d \
  --name onde-web \
  -p 3000:3000 \
  --env-file .env.production.local \
  onde-web:latest
```

## ✅ Verificar Deploy

```bash
# Ver se está rodando
docker ps | grep onde-web

# Ver logs
docker logs -f onde-web

# Testar aplicação
curl http://localhost:3000
```

## 🌐 Acessar Aplicação

Abrir no navegador: **http://localhost:3000**

## ⚠️ Importante

1. **Limpar cache do navegador após deploy:**
   ```javascript
   // No console do navegador (F12)
   sessionStorage.clear()
   ```

2. **Arquivos necessários:**
   - ✅ `src/base.js` - Configuração Firebase
   - ✅ `.env.production.local` - Variáveis de ambiente
   - ✅ Docker instalado

## 🛑 Comandos de Gestão

```bash
# Parar aplicação
docker stop onde-web

# Reiniciar aplicação
docker restart onde-web

# Remover container
docker rm onde-web

# Ver uso de recursos
docker stats onde-web
```

## 📝 Estrutura de Arquivos para Deploy

```
ondeweb-v2/
├── Dockerfile              ✅ (já existe)
├── docker-compose.yml      ✅ (criado)
├── .dockerignore          ✅ (criado)
├── deploy.sh              ✅ (criado)
├── src/base.js            ⚠️  (você precisa criar)
└── .env.production.local  ⚠️  (você precisa criar)
```

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| Container não inicia | `docker logs onde-web` para ver erro |
| Porta em uso | `lsof -i :3000` e matar processo |
| Build falha | `docker system prune -a` e tentar novamente |
| Eventos não aparecem | Limpar cache: `sessionStorage.clear()` |

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `DEPLOYMENT_GUIDE.md` - Guia completo de deployment
- `doc/DOCUMENTACAO_ONDE.md` - Documentação técnica do projeto

---

**Tempo estimado:** 5-10 minutos para primeiro deploy
