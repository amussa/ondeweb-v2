# 🧹 Limpeza de Cache - Instruções

## ⚠️ IMPORTANTE
Após a correção do bug, é necessário limpar o cache do navegador para ver os eventos corretamente.

## 📝 Como Limpar o Cache

### Opção 1: Limpar TODO o SessionStorage
Abra o console do navegador (F12) e execute:
```javascript
sessionStorage.clear();
```

### Opção 2: Limpar apenas cache de eventos
Execute no console:
```javascript
sessionStorage.removeItem('events');
sessionStorage.removeItem('topEvents');
sessionStorage.removeItem('popularEvents');
sessionStorage.removeItem('allEvents');
```

### Opção 3: Recarregar com cache limpo
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`

## ✅ Verificação
Após limpar o cache e recarregar a página, os eventos devem aparecer corretamente.

## 🔄 Se ainda não aparecerem eventos
1. Verifique se o servidor de desenvolvimento está rodando (`npm run dev`)
2. Verifique a conexão com o Firebase
3. Abra o console e procure por erros
4. Certifique-se de que existem eventos com data futura no Firebase

