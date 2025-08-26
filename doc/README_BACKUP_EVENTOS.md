# 🛡️ Sistema de Backup e Exclusão Segura de Eventos

## 📋 Visão Geral

Este sistema fornece uma maneira **SEGURA** de fazer backup e apagar eventos do Firestore, com múltiplas camadas de proteção.

## 🔧 Instalação

```bash
# Instalar Firebase Admin SDK
npm install firebase-admin
```

## 📁 Scripts Disponíveis

### 1. 💾 `backup-events.js` - Apenas Backup
Faz backup completo de todos os eventos sem apagar nada.

```bash
node backup-events.js
```

**O que faz:**
- ✅ Busca todos os eventos do Firestore
- ✅ Salva em arquivo JSON com timestamp
- ✅ Verifica integridade do backup
- ✅ Preserva tipos de dados do Firestore (Timestamps, etc.)

### 2. 🔄 `restore-events.js` - Restaurar Backup
Restaura eventos a partir de um arquivo de backup.

```bash
node restore-events.js "caminho/para/backup.json"
```

**Exemplo:**
```bash
node restore-events.js "./backups/eventos_backup_2024-01-15_14-30-45.json"
```

### 3. 🛡️ `backup-and-delete-events.js` - Processo Completo (RECOMENDADO)
Faz backup E apaga os eventos de forma segura.

```bash
node backup-and-delete-events.js
```

**Processo em 4 etapas:**
1. 📥 Faz backup completo
2. 🔍 Verifica integridade do backup
3. ⚠️ Pede confirmação do usuário
4. 🗑️ Apaga os eventos

## 📂 Estrutura de Arquivos de Backup

```
backups/
└── eventos_backup_2024-01-15_14-30-45.json
```

### Formato do Backup:
```json
{
  "metadata": {
    "collection": "evento",
    "backupDate": "2024-01-15T14:30:45.123Z",
    "totalDocuments": 150,
    "firebaseProject": "onde-it-com"
  },
  "events": [
    {
      "id": "documento-id-1",
      "data": {
        "nome": "Nome do Evento",
        "data": {
          "_timestamp": true,
          "_seconds": 1705320645,
          "_nanoseconds": 123000000,
          "_dateString": "2024-01-15T14:30:45.123Z"
        },
        "categoria": "música",
        "local": "Maputo"
      }
    }
  ]
}
```

## 🛡️ Medidas de Segurança

### ✅ Proteções Implementadas:
- **Backup obrigatório** antes de qualquer exclusão
- **Verificação de integridade** do backup
- **Confirmação dupla** do usuário
- **Preservação de tipos de dados** do Firestore
- **Processamento em lotes** para evitar timeouts
- **Tratamento de erros** com mensagens claras

### ⚠️ Confirmações Necessárias:
1. Confirmação para fazer backup
2. Confirmação para apagar eventos (deve digitar 'SIM')

## 🚀 Uso Recomendado

### Para Apagar Todos os Eventos (SEGURO):
```bash
# Processo completo e seguro
node backup-and-delete-events.js
```

### Para Apenas Fazer Backup:
```bash
# Só backup, sem apagar nada
node backup-events.js
```

### Para Restaurar Eventos:
```bash
# Restaurar de um backup específico
node restore-events.js "./backups/eventos_backup_2024-01-15_14-30-45.json"
```

## 📊 Exemplo de Execução

```bash
$ node backup-and-delete-events.js

🛡️  SCRIPT SEGURO: Backup + Exclusão de Eventos do Firestore
📝 Este script fará backup ANTES de apagar qualquer coisa
⏱️  O processo pode demorar alguns minutos...

🚀 PROCESSO SEGURO: Backup + Exclusão de Eventos
==================================================

📋 ETAPA 1/4: Fazendo backup dos eventos...
🔍 Buscando todos os eventos para backup...
📊 Encontrados 150 eventos para backup.
📁 Diretório de backup criado: ./backups/
💾 Backup salvo com sucesso!
📄 Arquivo: /caminho/backups/eventos_backup_2024-01-15_14-30-45.json
📊 Total de eventos: 150
💿 Tamanho do arquivo: 2.45 MB

📋 ETAPA 2/4: Verificando integridade do backup...
🔍 Verificando integridade do backup...
✅ Backup verificado com sucesso!
   - Eventos no backup: 150
   - Data do backup: 2024-01-15T14:30:45.123Z

📋 ETAPA 3/4: Confirmação do usuário...
✅ Backup criado e verificado com sucesso!
📂 Local do backup: /caminho/backups/eventos_backup_2024-01-15_14-30-45.json

⚠️  CONFIRMAÇÃO FINAL: Deseja APAGAR TODOS os eventos agora?
   (O backup está seguro, mas a exclusão é IRREVERSÍVEL)
   Digite 'SIM' para confirmar: SIM

📋 ETAPA 4/4: Apagando eventos...
🗑️  Iniciando processo de exclusão...
📊 Apagando 150 eventos...
✅ Apagados 150/150 eventos...

🎉 PROCESSO CONCLUÍDO COM SUCESSO!
==================================================
✅ Eventos apagados: 150
💾 Backup salvo em: /caminho/backups/eventos_backup_2024-01-15_14-30-45.json

📋 Para restaurar os eventos (se necessário):
   node restore-events.js "/caminho/backups/eventos_backup_2024-01-15_14-30-45.json"

✨ Script finalizado com sucesso.
```

## 🚨 Troubleshooting

### Erro de Permissão
```
Error: permission-denied
```
**Solução:**
- Verifique as regras do Firestore
- Confirme que você tem permissões de leitura/escrita

### Erro de Módulo
```
Error: Cannot find module 'firebase-admin'
```
**Solução:**
```bash
npm install firebase-admin
```

### Backup Corrompido
Se um backup falhar na verificação:
- O script não permitirá a exclusão
- Tente fazer um novo backup
- Verifique o espaço em disco

## 📞 Suporte

Em caso de problemas:
1. Verifique as mensagens de erro no console
2. Confirme que o Firebase Admin SDK está instalado
3. Teste com um projeto de desenvolvimento primeiro

---

**⚠️ LEMBRE-SE: Sempre faça backup antes de apagar dados importantes!**

