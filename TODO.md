# TODO - Máscara automática de CPF

- [ ] Localizar todos os inputs de CPF/documento no frontend (feito: lista inicial por busca).
- [ ] Definir abordagem: manter estado com apenas dígitos e exibir máscara `###.###.###-##`.
- [ ] Implementar helper de máscara (se necessário) e garantir `formatCPF`/`unmask`.
- [ ] Atualizar componentes/páginas identificadas para usar máscara no `value` e armazenar apenas números no estado.
- [ ] Garantir que o payload enviado ao backend use apenas dígitos (CPF “unmasked”).
- [ ] Atualizar também filtros de CPF (campos de busca) para que exibam máscara e enviem dígitos.
- [ ] Rodar testes/lint/build (quando disponíveis) para validar compilação.

