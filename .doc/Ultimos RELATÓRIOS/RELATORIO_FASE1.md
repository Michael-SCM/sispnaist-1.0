# Relatório de Implementação - Fase 1 (Crítico)

> Atualizado em: 2026-04-27

---

## Parte 1: O que foi implementado (Afastamentos do Trabalhador)

### Resumo
Foi implementado o submódulo de **Afastamentos do Trabalhador** (`trabalhador_afastamento`), correspondente à tabela `tb_trabalhador_afastamento` do sistema PHP original. Este é um dos 3 submódulos críticos da Fase 1.

### Backend (já existia, ajustes mínimos)
| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `backend/src/models/TrabalhadorAfastamento.ts` | ✅ | Model MongoDB com campos: tipo, motivo, CID, datas, laudo, observações, ativo |
| `backend/src/controllers/submoduloTrabalhadorController.ts` | ✅ | Controller unificado para todos os submódulos (listar, obter, criar, atualizar, deletar) |
| `backend/src/routes/submodulosTrabalhador.ts` | ✅ | Rotas RESTful: `GET/POST/PUT/DELETE /api/trabalhadores/:id/afastamentos` |

### Frontend (implementado nesta tarefa)
| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `frontend/src/types/index.ts` | ✅ | Adicionada interface `ITrabalhadorAfastamento` |
| `frontend/src/services/submoduloTrabalhadorService.ts` | ✅ | Corrigido acesso à API; métodos CRUD para afastamentos |
| `frontend/src/pages/Trabalhadores/Afastamentos/ListaAfastamentos.tsx` | ✅ | Listagem com DataTable, filtros, ações (editar/remover) |
| `frontend/src/pages/Trabalhadores/Afastamentos/FormAfastamento.tsx` | ✅ | Formulário completo de criação/edição com validação |
| `frontend/src/pages/Trabalhadores/index.ts` | ✅ | Exportações dos novos componentes |
| `frontend/src/App.tsx` | ✅ | Adicionadas 3 novas rotas para afastamentos |
| `frontend/src/pages/Trabalhadores/DetalhesTrabalhador.tsx` | ✅ | Seção "Submódulos" com link para Afastamentos |

### Funcionalidades implementadas
- [x] Listar afastamentos por trabalhador (com status ativo/inativo)
- [x] Cadastrar novo afastamento (tipo, motivo, CID, datas, laudo, observações)
- [x] Editar afastamento existente
- [x] Remover afastamento (soft delete — marca como inativo)
- [x] Validação de datas (fim/retorno não podem ser anteriores ao início)
- [x] Navegação integrada na página de detalhes do trabalhador

### Observações técnicas
- O backend retorna os dados diretamente (sem wrapper `{ data: ... }`), diferente de outros controllers. O service do frontend foi ajustado para refletir isso.
- As opções de "Tipo" e "Motivo" estão hardcoded temporariamente. Deverão ser substituídas pelos catálogos `tipo_afastamento` e `motivo_afastamento` quando implementados.

---

## Parte 1.2: O que foi implementado (Dependentes do Trabalhador)

### Resumo
Foi implementado o submódulo de **Dependentes do Trabalhador** (`trabalhador_dependentes`), correspondente à tabela `tb_trabalhador_dependentes` do sistema PHP original. Este é o segundo dos 3 submódulos críticos da Fase 1.

### Backend (já existia, ajustes mínimos)
| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `backend/src/models/TrabalhadorDependente.ts` | ✅ | Model MongoDB com campos: nome, CPF, data nascimento, parentesco, dependente IR, ativo |
| `backend/src/controllers/submoduloTrabalhadorController.ts` | ✅ | Controller unificado — já suportava `dependentes` via mapeamento |
| `backend/src/routes/submodulosTrabalhador.ts` | ✅ | Rotas RESTful já existentes: `GET/POST/PUT/DELETE /api/trabalhadores/:id/dependentes` |

### Frontend (implementado nesta tarefa)
| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `frontend/src/types/index.ts` | ✅ | Atualizada interface `ITrabalhadorDependente` com `dependentIR` e `parentesco` obrigatório |
| `frontend/src/services/submoduloTrabalhadorService.ts` | ✅ | Corrigido acesso à API para resposta direta; métodos CRUD para dependentes |
| `frontend/src/pages/Trabalhadores/Dependentes/ListaDependentes.tsx` | ✅ | Listagem com DataTable, filtros, colunas (nome, CPF, nascimento, parentesco, dependente IR, status), ações (editar/remover) |
| `frontend/src/pages/Trabalhadores/Dependentes/FormDependente.tsx` | ✅ | Formulário completo de criação/edição com validação e campos: nome, CPF, data nascimento, parentesco (select), dependente IR (checkbox), ativo |
| `frontend/src/pages/Trabalhadores/index.ts` | ✅ | Exportações dos novos componentes |
| `frontend/src/App.tsx` | ✅ | Adicionadas 3 novas rotas para dependentes |
| `frontend/src/pages/Trabalhadores/DetalhesTrabalhador.tsx` | ✅ | Seção "Submódulos" com link para Dependentes |

### Funcionalidades implementadas
- [x] Listar dependentes por trabalhador (com status ativo/inativo)
- [x] Cadastrar novo dependente (nome, CPF, data nascimento, parentesco, dependente IR)
- [x] Editar dependente existente
- [x] Remover dependente (soft delete — marca como inativo)
- [x] Navegação integrada na página de detalhes do trabalhador

### Observações técnicas
- O service de dependentes foi corrigido para refletir o formato de resposta direta do backend (igual aos afastamentos).
- As opções de "Parentesco" estão hardcoded temporariamente. Deverão ser substituídas por catálogo quando implementado.

---

## Parte 2: Relatório completo da Fase 1 — O que falta implementar

> Baseado no RELATÓRIO DE IMPLEMENTAÇÃO original

### 1. Submódulos do Trabalhador (Relacionamentos 1:N)

#### 1.1 Afastamentos do Trabalhador (`trabalhador_afastamento`) — ✅ IMPLEMENTADO
- [x] Backend: Model, Controller, Rotas
- [x] Frontend: Tipos, Service, Páginas (Listar, Criar, Editar), Rotas, Integração

#### 1.2 Dependentes do Trabalhador (`trabalhador_dependentes`) — ✅ IMPLEMENTADO
- [x] Backend: Verificar model `TrabalhadorDependente.ts`
- [x] Backend: Controller já existe (submoduloTrabalhadorController)
- [x] Backend: Rotas já existem
- [x] Frontend: Tipos (`ITrabalhadorDependente` atualizado)
- [x] Frontend: Service corrigido (resposta direta do backend)
- [x] Frontend: Criar páginas: `ListaDependentes`, `FormDependente`
- [x] Frontend: Adicionar rotas em `App.tsx`
- [x] Frontend: Adicionar link em `DetalhesTrabalhador.tsx`

#### 1.3 Vínculos Empregatícios Detalhados (`trabalhador_vinculos`) — ⏳ PENDENTE
- [ ] Backend: Criar model `TrabalhadorVinculo.ts`
- [ ] Backend: Adicionar ao controller unificado
- [ ] Backend: Adicionar ao mapeamento de rotas
- [ ] Frontend: Criar tipos `ITrabalhadorVinculo`
- [ ] Frontend: Criar service/métodos
- [ ] Frontend: Criar páginas: `ListaVinculos`, `FormVinculo`
- [ ] Frontend: Adicionar rotas
- [ ] Frontend: Adicionar link em detalhes do trabalhador
- [ ] Integrar com catálogos: `tipo_vinculo`, `funcao`, `jornada_trabalho`, `turno_trabalho`

---

### 2. Módulo de Acidente com Material Biológico

#### 2.1 Acidente Material Biológico (`acidente_material_biologico`) — ⏳ PENDENTE
- [ ] Definir se será coleção separada ou extensão da coleção Acidente
- [ ] Criar/atualizar model com campos específicos (tipo exposição, material orgânico, procedimento)
- [ ] Criar controller específico
- [ ] Criar rotas
- [ ] Criar service no frontend
- [ ] Criar páginas: Listagem, Cadastro/Edição, Detalhes

#### 2.2 Sorologia do Acidentado (`sorologia_acidentado`) — ⏳ PENDENTE
- [ ] Criar model `SorologiaAcidentado.ts`
- [ ] Criar controller, rotas, service frontend
- [ ] Criar páginas para registro de exames sorológicos
- [ ] Vincular ao acidente de material biológico

#### 2.3 Sorologia do Paciente Fonte (`sorologia_paciente`) — ⏳ PENDENTE
- [ ] Criar model `SorologiaPaciente.ts`
- [ ] Criar controller, rotas, service frontend
- [ ] Criar páginas para registro de exames do paciente fonte
- [ ] Vincular ao acidente de material biológico

---

### 3. Catálogos Essenciais do Trabalhador

| # | Catálogo | Status | Usado em |
|---|----------|--------|----------|
| 1 | `escolaridade` | ⏳ Pendente | Trabalhador |
| 2 | `estado_civil` | ⏳ Pendente | Trabalhador |
| 3 | `raca_cor` | ⏳ Pendente | Trabalhador |
| 4 | `sexo` | ⏳ Pendente | Trabalhador |
| 5 | `tipo_sanguineo` | ⏳ Pendente | Trabalhador |
| 6 | `funcao` | ⏳ Pendente | Vínculos |
| 7 | `jornada_trabalho` | ⏳ Pendente | Vínculos |
| 8 | `turno_trabalho` | ⏳ Pendente | Vínculos |
| 9 | `situacao_trabalho` | ⏳ Pendente | Trabalhador |

Tarefas por catálogo:
- [ ] Criar model/seeder no backend
- [ ] Criar rotas de CRUD
- [ ] Criar service no frontend
- [ ] Substituir campo hardcoded no formulário de Trabalhador

---

### 4. RBAC Completo (Controle de Acesso Baseado em Perfil)

#### 4.1 Gestão de Perfis (`perfil`) — ⏳ PENDENTE
- [ ] Criar model `Perfil.ts`
- [ ] Criar controller `perfilController.ts`
- [ ] Criar rotas `perfis.ts`
- [ ] Criar service e páginas no frontend

#### 4.2 Gestão de Funcionalidades/Menus (`funcionalidade`) — ⏳ PENDENTE
- [ ] Criar model `Funcionalidade.ts`
- [ ] Criar controller, rotas, service e páginas

#### 4.3 Permissões por Perfil (`perfil_funcionalidade`) — ⏳ PENDENTE
- [ ] Criar model `PerfilFuncionalidade.ts`
- [ ] Criar controller, rotas, service
- [ ] Criar página de associação de funcionalidades a perfis

#### 4.4 Integração com Autenticação — ⏳ PENDENTE
- [ ] Atualizar `AuthService` para carregar permissões do usuário logado
- [ ] Atualizar middleware `auth.ts` para verificar permissões por rota
- [ ] Atualizar frontend: hook `useAuth`, `ProtectedRoute`, menus e botões

#### 4.5 Gestão de Usuários Completa — ⏳ PENDENTE
- [ ] Expandir controller `userController.ts` (atribuir perfil, filtros, ativar/desativar)
- [ ] Atualizar páginas de usuários no frontend
- [ ] Vincular usuário a empresa/unidade

---

## Resumo de Status da Fase 1

| Categoria | Total | Implementado | Pendente |
|-----------|-------|--------------|----------|
| Submódulos do Trabalhador | 3 | 2 (Afastamentos, Dependentes) | 1 (Vínculos) |
| Material Biológico | 3 | 0 | 3 |
| Catálogos Essenciais | 9 | 0 | 9 |
| RBAC Completo | 4 módulos | 0 | 4 |

**Progresso geral da Fase 1:** ~2 de 19 itens principais implementados (~11%)

---

## Próximos passos recomendados

1. **Vínculos do Trabalhador** — último submódulo pendente; requer criação do model e integração com catálogos
2. **Catálogos essenciais** — escolaridade, estado civil, raça/cor, sexo, tipo sanguíneo (podem ser feitos em lote)
3. **Material Biológico** — requer decisão arquitetural (coleção separada vs extensão)
4. **RBAC** — requer planejamento mais detalhado de permissões

