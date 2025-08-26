# 🗑️ Como Apagar Todos os Eventos do Firestore

## ⚠️ ATENÇÃO IMPORTANTE

**Esta operação é IRREVERSÍVEL!** Todos os eventos serão apagados permanentemente do Firestore.

## 📋 Pré-requisitos

1. **Node.js instalado** (versão 14 ou superior)
2. **Credenciais Firebase configuradas**
3. **Permissões de escrita** na coleção 'evento' do Firestore

## 🔧 Configuração

### 1. Configurar Credenciais Firebase

Edite o arquivo `src/base.js` e substitua os valores `xxx` pelas suas credenciais reais do Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-real",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id-real",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Como obter as credenciais:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone da engrenagem)
4. Role até **"Seus aplicativos"** > **"Aplicativos da Web"**
5. Copie as configurações

### 2. Instalar Dependências (se necessário)

```bash
npm install firebase
```

## 🚀 Executar o Script

### Opção 1: Firebase v8 (Compatibilidade)
```bash
node delete-all-events.js
```

### Opção 2: Firebase v9+ (Moderno)
```bash
node delete-all-events-v9.js
```

## 📝 O que o Script Faz

1. **Conecta ao Firestore** usando suas credenciais
2. **Busca todos os eventos** na coleção 'evento'
3. **Mostra quantos eventos** foram encontrados
4. **Pede confirmação** (você deve digitar 'SIM')
5. **Apaga em lotes** de 500 documentos por vez
6. **Mostra progresso** durante a operação
7. **Confirma conclusão** quando terminar

## 🛡️ Medidas de Segurança

- ✅ **Confirmação obrigatória**: Você deve digitar 'SIM' para confirmar
- ✅ **Processamento em lotes**: Evita timeouts em grandes volumes
- ✅ **Tratamento de erros**: Mostra mensagens claras em caso de problemas
- ✅ **Verificação de permissões**: Alerta sobre problemas de acesso

## 🔍 Verificar Resultados

Após executar o script, você pode verificar no Firebase Console:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá para **Firestore Database**
3. Navegue até a coleção **'evento'**
4. Deve estar vazia ou não existir mais

## 🚨 Possíveis Erros

### Erro de Permissão
```
Error: permission-denied
```
**Solução:**
- Verifique se suas credenciais estão corretas
- Confirme que você tem permissão de escrita na coleção
- Revise as regras de segurança do Firestore

### Erro de Configuração
```
Error: Firebase configuration invalid
```
**Solução:**
- Verifique se todos os campos do `firebaseConfig` estão preenchidos
- Confirme que o `projectId` está correto

### Erro de Rede
```
Error: network-request-failed
```
**Solução:**
- Verifique sua conexão com a internet
- Tente novamente após alguns minutos

## 🔄 Reverter (Restaurar Eventos)

**IMPORTANTE:** Não há como reverter esta operação automaticamente!

Se você precisar restaurar os eventos:
1. **Backup**: Use um backup anterior do Firestore
2. **Re-importação**: Importe os dados de uma fonte externa
3. **Recriação manual**: Recrie os eventos manualmente

## 📞 Suporte

Se encontrar problemas:
1. Verifique as mensagens de erro no console
2. Confirme que todas as configurações estão corretas
3. Teste com um projeto Firebase de desenvolvimento primeiro

---

**⚠️ LEMBRE-SE: Esta operação é IRREVERSÍVEL! Faça backup se necessário.**

