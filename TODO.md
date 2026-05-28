# TODO - Auditoria Acidente (CPF + Tipo)

- [ ] Atualizar backend: `backend/src/controllers/acidenteController.ts`
  - [ ] No `CREATE`, incluir `detalhes.tipoAcidente` e `detalhes.cpfTrabalhador`.
  - [ ] No `UPDATE`, incluir `detalhes.tipoAcidente` e `detalhes.cpfTrabalhador`.
  - [ ] No `DELETE`, padronizar para `detalhes.tipoAcidente` e `detalhes.cpfTrabalhador`.
- [ ] Atualizar frontend: `frontend/src/pages/Admin/Auditoria.tsx`
  - [ ] No modal (Detalhes da Ação), adicionar renderização para `selectedLog.entidade === 'Acidente'` mostrando:
    - [ ] CPF do trabalhador (`selectedLog.detalhes?.cpfTrabalhador`)
    - [ ] Tipo do acidente (`selectedLog.detalhes?.tipoAcidente`)
- [x] Backend: logs do Acidente padronizados
  - [x] CREATE/UPDATE/DELETE com `detalhes.tipoAcidente` e `detalhes.cpfTrabalhador`.
- [x] Frontend: Auditoria modal com bloco `entidade === 'Acidente'`
  - [x] Exibe CPF do trabalhador e Tipo do acidente.
- [x] Validar (parcial)
  - [x] Build do frontend executado com sucesso (Vite).
  - [ ] Validar manualmente via UI:
    - [ ] Cadastrar um acidente (CREATE) e abrir Auditoria -> Detalhes: deve mostrar CPF + Tipo.
    - [ ] Editar um acidente (UPDATE) e abrir Auditoria -> Detalhes: deve mostrar CPF + Tipo.
    - [ ] Deletar um acidente (DELETE) e abrir Auditoria -> Detalhes: deve mostrar CPF + Tipo.



