# TODO - Correção “Acompanhamento” não seleciona na edição (Readaptação)

## Passos
- [ ] 1) Ajustar frontend: normalizar `acompanhamento` e `grauSatisfacao` ao carregar a readaptação (trim + NFKC)
- [ ] 2) Ajustar frontend (opcional mas recomendado): normalizar ao submeter também para não gravar valores sujos
- [ ] 3) Ajustar backend: normalizar `acompanhamento`, `grauSatisfacao` e demais campos de string sensíveis ao salvar/atualizar `readaptacoes`
- [ ] 4) Rodar build/lint e executar testes básicos (backend start e frontend start)
- [ ] 5) Validar no Vercel/Render: abrir uma readaptação existente em `/editar` e confirmar que o `<select>` mostra o valor selecionado

