FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e o package-lock.json para o container
COPY package*.json ./

# Instale as dependências
RUN npm ci --only=production

# Copie o restante do código do projeto
COPY . .

# Construa o projeto Next.js
RUN npm run build

# Exponha a porta na qual a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
