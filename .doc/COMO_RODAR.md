# 🚀 COMO RODAR O PROJETO LOCALMENTE

## ⚠️ PROBLEMA ENCONTRADO

Você está recebendo erro `Network Error` porque:
- ❌ Backend não está rodando, OU
- ❌ Frontend não consegue acessar o backend

---

## ✅ SOLUÇÃO: RODAR BACKEND E FRONTEND

### 1️⃣ TERMINAL 1 - Backend (porta 3001)

```bash
cd C:\Users\aluno2025\Documents\sispatnaist-react-modern\backend

npm install

npm run dev
```

**Esperado:** Verá mensagens como:
```
[23:45:12] watching src
▲ [dev] Running server on port 3001...
Connected to MongoDB
```

---

### 2️⃣ TERMINAL 2 - Frontend (porta 3000)

```bash
cd C:\Users\aluno2025\Documents\sispatnaist-react-modern\frontend

npm install

npm run dev
```

**Esperado:** Verá mensagens como:
```
  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

---

## 🧪 VERIFICAR SE ESTÁ FUNCIONANDO

### No Frontend, abra DevTools (F12) e veja:

1. **Sem erros?** ✅ Sucesso!
2. **Error: Network Error?** ❌ Backend não está rodando
3. **Outras mensagens?** Compartilhe comigo

---

## 🔗 URLs IMPORTANTES

| Serviço | URL | Porta |
|---------|-----|-------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:3001/api | 3001 |
| MongoDB | Cloud Atlas | - |

---

## 🛠️ VERIFICAÇÃO RÁPIDA

### Para verificar se backend está rodando:
```bash
# Em outro terminal/PowerShell:
curl http://localhost:3001
```

Você deve ver uma resposta JSON com status `"success"`.

---

## 📝 ARQUIVO CRIADO

Criei `.env.local` no frontend com:
```
VITE_API_URL=http://localhost:3001/api
```

Isso garante que o frontend saiba onde encontrar o backend.

---

## ⚠️ IMPORTANTE

Se receber erro MongoDB:
- Verifique se tem internet (MongoDB está em Cloud)
- Verifique credenciais do `.env` do backend
- Crie um usuário local MongoDB em `localhost:27017`

---

## 🆘 SE AINDA NÃO FUNCIONAR

Após rodar backend + frontend, me diga:
1. Qual é a mensagem exata de erro no DevTools?
2. Você consegue fazer login na aplicação?
3. Aparece alguma mensagem no terminal do backend quando acessa `/acidentes`?

---

**Próximo passo:** Rode os dois terminais e acesse http://localhost:3000 🎯
