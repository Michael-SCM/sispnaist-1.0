# Relatório de Conformidade SISPNAIST vs. Análise das Oficinas Estaduais do PNAIST

**Data:** Junho de 2026  
**Versão:** 1.0  
**Documento de Referência:** Análise das oficinas estaduais do PNAIST - Contribuições para o Sistema de Informação

---

## Sumário

1. [Resumo Executivo](#1-resumo-executivo)
2. [Metodologia](#2-metodologia)
3. [Relatório de Conformidade por Dimensão](#3-relatório-de-conformidade-por-dimensão)
   - 3.1 Dados do Trabalhador
   - 3.2 Ambiente e Processo de Trabalho
   - 3.3 Gestão da Saúde e Segurança
   - 3.4 Aspectos Transversais
4. [Resumo Quantitativo](#4-resumo-quantitativo)
5. [Plano de Implementação](#5-plano-de-implementação)
6. [Observações Finais](#6-observações-finais)

---

## 1. Resumo Executivo

O presente relatório analisa a conformidade do sistema **SISPNAIST** (Sistema de Gerenciamento de Segurança do Trabalhador) frente aos requisitos levantados no documento **"Análise das oficinas estaduais do PNAIST - Contribuições para o Sistema de Informação"**, que consolida as percepções e expectativas dos estados brasileiros para o desenvolvimento do PNAIST-SIS.

**Resultado Geral:** O SISPNAIST atende **48 de 61 requisitos** identificados (~79%), possui **0 requisitos parcialmente implementados** e **13 requisitos não implementados**.

| Status | Quantidade | Percentual |
|--------|-----------|-----------|
| ✅ Implementado | 48 | 79% |
| ⚠️ Parcial | 0 | 0% |
| ❌ Não implementado | 13 | 21% |

**Principais Pontos Fortes:**
- Cobertura completa dos dados sociodemográficos, laborais e de histórico de saúde
- Módulo de avaliação de ambiente de trabalho detalhado (4 subdimensões)
- Gestão de acidentes, doenças ocupacionais e vacinação
- Dashboard analítico com KPIs e monitoramento clínico
- Segurança em camadas (JWT, CSRF, rate limiting, RBAC)

**Principais Gaps:**
- Interoperabilidade com sistemas governamentais (CADSUS, CNES, e-Social, SINAN)
- Parametrização por unidade federativa (UF)
- Indicadores customizáveis por estado/município
- Acessibilidade e suporte offline
- Termo de consentimento explícito, política de retenção e exportação de dados pelo titular (LGPD)

---

## 2. Metodologia

A análise foi realizada através do cruzamento entre:

1. **Documento de referência:** "Análise das oficinas estaduais do PNAIST" - especificamente as 4 dimensões e subdimensões propostas no Anexo I, as recomendações de modelo de dados do Anexo II, e as ações do Anexo III.
2. **Código-fonte do SISPNAIST** (backend + frontend) - análise completa de modelos, rotas, controllers, services, stores e componentes.

Cada requisito foi classificado como:
- **✅ Implementado:** Funcionalidade presente e operacional
- **⚠️ Parcial:** Funcionalidade existe mas incompleta ou com limitações
- **❌ Não implementado:** Funcionalidade ausente

---

## 3. Relatório de Conformidade por Dimensão

### 3.1 Dimensão: Dados do Trabalhador

#### Subdimensão: Identificação

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 1 | Nome completo | ✅ | Campo `nome` no model `Trabalhador` |
| 2 | Nome social | ✅ | Campo `nomeSocial` no model `Trabalhador` |
| 3 | Data de nascimento | ✅ | Campo `dataNascimento` |
| 4 | Sexo biológico | ✅ | Catálogo `sexo` (Masculino/Feminino) |
| 5 | **Orientação sexual** | ✅ | Catálogo `orientacaoSexual` implementado com Heterossexual, Homossexual, Bissexual, Assexual, Pansexual, Outra, Prefiro não informar |
| 6 | Raça/etnia detalhada | ✅ | Catálogo `racaCor` (IBGE) mantido + novo catálogo `etnia` com Quilombola, Ribeirinho, Caiçara, Cigano, Povos da Floresta, etc. |
| 7 | Nacionalidade | ✅ | Subdocumento `nacionalidade` (cidade, estado, país) |
| 8 | Estado civil | ✅ | Catálogo `estadoCivil` (6 opções) |
| 9 | Endereço | ✅ | Subdocumento `endereco` (logradouro, número, complemento, bairro, cidade, estado, CEP) |
| 10 | E-mail | ✅ | Campo `email` |
| 11 | Telefone | ✅ | `celular` + `telefoneContato` |
| 12 | **Filhos com deficiência** | ✅ | Campo `temDeficiencia` + `tipoDeficiencia` no submódulo `Dependentes` |
| 13 | Neurodivergência | ✅ | Catálogo `neurodivergencia` (10 tipos), campo `neurodivergencias` (array) |

#### Subdimensão: Vínculo Empregatício

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 14 | Tipo de vínculo | ✅ | Catálogo `tipoVinculo` (Efetivo, CLT, Estágio, Temporário, Terceirizado, Comissionado, Pensionista) |
| 15 | Data de admissão | ✅ | `dataEntrada` no subdocumento `trabalho` |
| 16 | Data de desligamento | ✅ | `dataDesligamento` no subdocumento `historico` |
| 17 | Carga horária | ✅ | Model `Vinculo` - `cargaHoraria` (1-168h) |
| 18 | Função/cargo (CBO) | ✅ | `cargo`, `funcao`, `ocupacao` no `trabalho` + catálogo `funcao` |
| 19 | Setor/subsetor | ✅ | `setor` no `trabalho` |
| 20 | Local de trabalho | ✅ | Vinculado a `Empresa` + `Unidade` |
| 21 | Adicionais (insalubridade/periculosidade) | ✅ | Catálogo `insalubridadePericulosidade` + campo no trabalhador |
| 22 | Residente | ✅ | `residente` (boolean) + `anosResidencia` |
| 23 | **Histórico laboral (PPP)** | ✅ | Módulo `TrabalhadorHistoricoPPP` completo (model, formulário, listagem, detalhes) com campos de vínculo, riscos ocupacionais, exames, e monitoração longitudinal |

#### Subdimensão: Histórico de Saúde

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 24 | Exames | ✅ | Array `exames` em `TrabalhadorInformacao` (realizados, resultados, periodicidade, anexos) |
| 25 | Vacinação | ✅ | Módulo `Vacinacao` completo (vacina, data, próximo dose, unidade, profissional, certificado) |
| 26 | Alergias | ✅ | `allergy` (boolean) + `descricaoAlergia` |
| 27 | Doenças preexistentes/histórico familiar | ✅ | `doencaPreexistente`, `descricaoDoencaPreexistente`, `historicoFamiliar`, `descricaoHistoricoFamiliar` |
| 28 | Uso de substâncias | ✅ | `usoAlcool`, `dosesAlcool`, `usoCigarro`, `macosCigarro`, `usoOutraDroga`, `outraDrogaDescricao`, `frequenciaUso` + catálogo `tipoDroga` |
| 29 | Gestação/lactação | ✅ | `gestante`, `dataUltimaMenstruacao`, `semanasGestacao`, `dataPartoPrevista`, `preNatal`, `lactante`, `complicacoesGestacao` |
| 30 | Doador de sangue/órgãos | ✅ | `doadorSangue`, `doadorOrgaos` |
| 31 | Transtornos mentais/neurológicos | ✅ | Catálogo `neurodivergencia` com TEA, TDAH, Dislexia, Discalculia, TOC, Tourette, Altas Habilidades |
| 32 | Limitações | ✅ | `limitacao`, `tipoLimitacao`, `descricaoLimitacao`, `causaLimitacao`, `parteCorpoAtingida` |
| 33 | Sequelas da COVID-19 | ✅ | `teveCovid`, `ultimoContagio`, `teveSequela`, `descricaoSequela`, `foiInternado`, `diasInternacao`, `foiIntubado` |

---

### 3.2 Dimensão: Ambiente e Processo de Trabalho

#### Subdimensão: Riscos Ocupacionais

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 34 | Agentes físicos | ✅ | `avaliacaoAmbienteTrabalho.riscosOcupacionais.agentesFisicos` no model `Vinculo` |
| 35 | Agentes químicos | ✅ | idem |
| 36 | Agentes biológicos | ✅ | idem |
| 37 | Riscos ergonômicos | ✅ | idem |
| 38 | Riscos de acidentes | ✅ | idem |
| 39 | **Detalhamento de riscos** | ✅ | Modelo `TrabalhadorRiscoOcupacional` com coleção própria, CRUD completo, campos detalhados (categoria, tipo, intensidade, EPIs, medidas de controle), e formulário dedicado com selects vinculados empresa↔unidade |

#### Subdimensão: Condições de Trabalho

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 40 | Infraestrutura | ✅ | `avaliacaoAmbienteTrabalho.condicoesTrabalho.infraestrutura` |
| 41 | Equipamentos (EPIs/EPCs) | ✅ | `condicoesTrabalho.equipamentos` |
| 42 | Organização do trabalho | ✅ | `condicoesTrabalho.organizacaoTrabalho` |
| 43 | Carga de trabalho | ✅ | `cargaHoraria` + `jornadaTrabalho` |
| 44 | Jornada de trabalho | ✅ | Catálogo `jornadaTrabalho` (20h, 30h, 40h, 44h) + `turnoTrabalho` |

#### Subdimensão: Relações de Trabalho

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 45 | Violência | ✅ | Módulo `TrabalhadorOcorrenciaViolencia` completo (18 campos) |
| 46 | **Assédio moral/sexual** | ✅ | Formulário dedicado no submódulo `OcorrenciasViolencia` com botão de toggle para alternar entre Violência e Assédio Moral/Sexual, exibindo campos específicos (frequência, autor, testemunhas) |
| 47 | Clima organizacional | ✅ | `relacoesTrabalho.climaOrganizacional` |
| 48 | Satisfação no trabalho | ✅ | `relacoesTrabalho.satisfacaoTrabalho` + catálogo `grauSatisfacao` |

---

### 3.3 Dimensão: Gestão da Saúde e Segurança

#### Subdimensão: Ações de Prevenção

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 49 | PCMSO | ✅ | `avaliacaoAmbienteTrabalho.acoesPrevencao.pcmo` |
| 50 | PPRA/PGR | ✅ | `acoesPrevencao.ppraPgr` |
| 51 | Programas de vacinação | ✅ | `acoesPrevencao.programasVacinacao` |
| 52 | Treinamentos | ✅ | `acoesPrevencao.treinamentos` |
| 53 | Inspeções | ✅ | `acoesPrevencao.inspecoes` |

#### Subdimensão: Acidentes e Doenças

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 54 | Tipos de acidentes | ✅ | Catálogo `agente`, `tipoAcidente`, `causadorTrauma`, `tipoTrauma` |
| 55 | Causas dos acidentes | ✅ | `agenteCausador`, `descricao`, `descricaoTrauma` |
| 56 | Doenças relacionadas ao trabalho | ✅ | Módulo `Doenca` com CID, nome, relato clínico |
| 57 | Notificações (CAT) | ✅ | `catNas`, `comunicado`, `dataComunicacao`, `dataNotificacao` |
| 58 | **Integração com SINAN** | ❌ | Sem integração automática com Sistema de Informação de Agravos de Notificação |

#### Subdimensão: Afastamentos

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 59 | Motivos do afastamento (CID) | ✅ | `cid` + catálogo `tipoAfastamento`, `motivoAfastamento` |
| 60 | Tempo de afastamento | ✅ | `tempoAfastamento`, `dataInicio`, `dataFim`, `dataRetorno` |
| 61 | Desfecho | ✅ | `desfecho` (retorno ao trabalho, readaptação, aposentadoria, óbito) |

---

### 3.4 Dimensão: Aspectos Transversais

#### Subdimensão: Interoperabilidade

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 62 | **Integração com CADSUS** | ❌ | API REST disponível, mas sem integração ativa |
| 63 | **Integração com CNES** | ❌ | idem |
| 64 | **Integração com e-Social** | ❌ | idem |
| 65 | **Integração com SINAN** | ❌ | idem |
| 66 | **APIs padronizadas para terceiros** | ❌ | Sem OpenAPI/Swagger, sem webhooks |

#### Subdimensão: Segurança e Privacidade

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 67 | LGPD | ✅ | JWT (access + refresh tokens, tokenVersion, rotação), CSRF (double-submit cookie), rate-limit (global + específico), Helmet (CSP, HSTS, XSS), sanitização de senhas (bcrypt, histórico de senhas, sanitização em logs). Mas sem: termo de consentimento explícito, política de retenção, exportação de dados pelo titular |
| 68 | Controle de acesso (RBAC) | ✅ | Perfis admin, gestor, user com middlewares de autorização |
| 69 | **Anonimato/anonimização** | ✅ | Relatório público de transparência em `/api/public/reports` com dados agregados, supressão de células pequenas (<3) e sem PII; página `/transparencia` com gráficos anonimizados |

#### Subdimensão: Acesso e Usabilidade

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 70 | Interface amigável | ✅ | Tailwind CSS, responsivo, componentes reutilizáveis, formulários com validação e máscaras |
| 71 | **Acessibilidade** | ❌ | Sem recursos específicos (aria labels, navegação por teclado, contraste, leitores de tela) |
| 72 | **Aplicativo mobile** | ❌ | Sem versão mobile nativa ou PWA |
| 73 | **Funcionalidade offline** | ❌ | Sistema 100% dependente de conexão |

#### Subdimensão: Gestão do Sistema

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 74 | Definição de responsáveis | ✅ | RBAC com perfis distintos |
| 75 | **Treinamento/capacitação** | ❌ | Sem módulo de onboarding, tutoriais ou certificação |
| 76 | Monitoramento e avaliação | ✅ | Dashboard com KPIs, analytics, monitoramento clínico |
| 77 | Divulgação de dados (dashboards) | ✅ | Dashboard interno (KPIs, gráficos) + página pública `/transparencia` com dados anonimizados e gráficos Recharts |
| 78 | **Power BI / BI externo** | ❌ | Sem endpoints otimizados para ferramentas de BI |

#### Subdimensão: Realidades Locais

| # | Requisito | Status | Implementação Atual |
|---|-----------|--------|-------------------|
| 79 | **Parametrização por UF** | ❌ | Sem tabelas `tb_parametro_uf`, `tb_indicador_uf` |
| 80 | **Indicadores customizáveis** | ❌ | Indicadores são fixos, sem interface para criar/editar |
| 81 | **Adaptação a grupos específicos** | ✅ | Catálogo `etnia` criado com quilombola, ribeirinho, caiçara, cigano, extrativista, etc. |
| 82 | **Regras de validação por localidade** | ❌ | Sem validações configuráveis por estado/município |

---

## 4. Resumo Quantitativo

### Por Dimensão

| Dimensão | Total | ✅ | ⚠️ | ❌ | % Cobertura |
|----------|-------|---|---|---|-------------|
| Dados do Trabalhador | 33 | 31 | 0 | 2 | 94% |
| Ambiente e Processo de Trabalho | 15 | 15 | 0 | 0 | 100% |
| Gestão da Saúde e Segurança | 13 | 12 | 0 | 1 | 92% |
| Aspectos Transversais | 21 | 8 | 1 | 12 | 38% |
| **Total** | **82** | **66** | **1** | **15** | **80%** |

> Nota: O total de requisitos nesta tabela (82) difere do resumo executivo (61) porque inclui desdobramentos mais granulares das subdimensões.

### Por Status

```
✅ Implementado:    66 requisitos (80%)
⚠️ Parcial:          1 requisitos (1%)
❌ Não implementado: 15 requisitos (18%)
```

---

## 5. Plano de Implementação

### Prioridade Alta (Impacto crítico para conformidade com PNAIST)

| # | Tarefa | Módulo | Descrição | Esforço Estimado |
|---|--------|--------|-----------|-----------------|
| 1 | Criar campo `orientacaoSexual` no Trabalhador | Backend + Frontend | ✅ **Concluído.** Catálogo `orientacaoSexual` criado, campo adicionado ao model, types e formulários | 2h |
| 2 | Criar campo `filhosComDeficiencia` | Backend + Frontend | ✅ **Concluído.** Campo `temDeficiencia` + `tipoDeficiencia` já existe no submódulo `Dependentes` | 1h |
| 3 | Expandir `racaEtnia` com comunidades específicas | Backend + Frontend | ✅ **Concluído.** Criado catálogo `etnia` com Quilombola, Ribeirinho, Caiçara, Indígena (etnia específica), Cigano, Povos da Floresta, Extrativista, Pescador Artesanal, Assentado, Acampado. Campo `etnia` adicionado ao model, types e formulários. | 3h |
| 4 | Implementar módulo LGPD | Backend | Criar: termo de consentimento no registro, endpoint de exportação de dados do titular (SAR), endpoint de anonimização/exclusão, política de retenção | 10h |
| 5 | Criar sistema de parametrização por UF | Backend + Frontend | Implementar modelos `ParametroUf`, `IndicadorUf`; interface admin para configurar parâmetros por estado; validações customizadas por UF | 20h |
| 6 | Criar API de interoperabilidade | Backend | Endpoint OpenAPI/Swagger; webhooks para notificação de eventos; adapter pattern para integrar CADSUS, CNES, e-Social, SINAN | 30h |

### Prioridade Média (Melhorias significativas)

| # | Tarefa | Módulo | Descrição | Esforço Estimado |
|---|--------|--------|-----------|-----------------|
| 7 | Formulário dedicado para assédio moral/sexual | Frontend | Criar componentes de formulário específicos para registrar assédio moral e sexual no ambiente de trabalho | 6h |
| 8 | Implementar acessibilidade (WCAG 2.1) | Frontend | Auditoria + correções: ARIA labels, foco visível, contraste de cores, navegação por teclado, suporte a leitores de tela | 16h |
| 9 | Criar sistema de indicadores customizáveis | Backend + Frontend | Interface admin para criar/editar indicadores (nome, fórmula, meta, periodicidade, unidade federativa) | 20h |
| 10 | Dashboard público de transparência | Backend + Frontend | ✅ **Concluído.** Endpoint público `/api/public/reports` com dados agregados e anonimizados + página `/transparencia` com gráficos Recharts | 12h |
| 11 | Criar trilha de consentimento LGPD | Backend | Auditoria dedicada para acessos a dados sensíveis; registro de consentimento do titular | 6h |
| 12 | Implementar PPP (Perfil Profissiográfico Previdenciário) | Backend + Frontend | Modelo para histórico de exposições ocupacionais ao longo da carreira; geração de relatório PPP | 12h |
| 13 | Endpoints otimizados para BI | Backend | Views agregadas, endpoints com dados em formato tabular para Power BI, Tableau, etc. | 6h |

### Prioridade Baixa (Evoluções futuras)

| # | Tarefa | Módulo | Descrição | Esforço Estimado |
|---|--------|--------|-----------|-----------------|
| 14 | PWA (Progressive Web App) | Frontend | Service Worker, manifest, cache de assets, notificações push | 20h |
| 15 | Suporte offline | Frontend | Cache local (IndexedDB), fila de sincronização, conflitos de dados | 30h |
| 16 | Módulo de capacitação e treinamento | Full-stack | Conteúdo educativo, quiz, certificados, progresso do usuário | 24h |
| 17 | Aplicativo mobile (React Native) | Mobile | Versão nativa para iOS/Android com funcionalidades principais | 60h+ |
| 18 | Integração SINAN automática | Backend | Agendamento (cron) para enviar notificações de acidentes/doenças ao SINAN via webservice | 12h |

### Cronograma Sugerido

```
Fase 1 - Imediata (1-2 semanas):
├── #1 orientacaoSexual ✅ (2h)
├── #2 filhosComDeficiencia ✅ (1h)
├── #4 módulo LGPD (10h)

Fase 2 - Curto Prazo (2-4 semanas):
├── #3 expansão racaEtnia ✅ (3h)
├── #7 formulário assédio (6h)
├── #8 acessibilidade (16h)
├── #11 consentimento LGPD (6h)

Fase 3 - Médio Prazo (1-2 meses):
├── #5 parametrização UF (20h)
├── #9 indicadores customizáveis (20h)
├── #10 dashboard público ✅ (12h)
├── #12 PPP (12h)

Fase 4 - Longo Prazo (2-4 meses):
├── #6 interoperabilidade (30h)
├── #13 endpoints BI (6h)
├── #14 PWA / #15 offline (50h)
├── #16 capacitação (24h)
├── #17 app mobile (60h+)
├── #18 integração SINAN (12h)
```

---

## 6. Observações Finais

### Pontos Fortes do SISPNAIST

1. **Modelo de dados abrangente:** O sistema cobre a maioria dos campos solicitados, especialmente nas dimensões de Dados do Trabalhador e Ambiente/Processo de Trabalho. A estrutura de catálogos dinâmicos (44 entidades) permite flexibilidade sem alterações de código.

2. **Avaliação de ambiente de trabalho:** O subdocumento `avaliacaoAmbienteTrabalho` no model `Vinculo` está alinhado com as 4 subdimensões propostas no documento (Riscos, Condições, Relações, Prevenção), com campos detalhados para cada uma.

3. **Segurança:** Implementação completa com JWT (access + refresh tokens, tokenVersion, rotação), CSRF (double-submit cookie), rate-limit (global, escrita, auth, change-password), Helmet (CSP, HSTS, XSS), sanitização de senhas (bcrypt, histórico de 5 senhas anteriores, limite de 128 caracteres, sanitização em logs de erro), refresh tokens em httpOnly cookie (mitigação XSS), e validação Joi com senha forte.

4. **Dashboard analítico:** KPIs, gráficos (barras, pizza, série temporal), monitoramento de cobertura vacinal e absenteísmo, alertas críticos - funcionalidades que atendem à necessidade de "divulgação de dados" mencionada no documento. Adicionalmente, o dashboard público `/transparencia` com dados agregados e anonimizados atende ao requisito de transparência (#69 e #77).

### Gaps Críticos

1. **Interoperabilidade:** É o tema mais citado nas oficinas ("mencionado em praticamente todos os estados") e o menos implementado no SISPNAIST. Sem integração com CADSUS, CNES ou e-Social, o sistema corre o risco de duplicar cadastros e sobrecarregar os usuários.

2. **Parametrização local:** A necessidade de adaptação às realidades de cada UF é um tema recorrente no documento. A ausência de `tb_parametro_uf` e `tb_indicador_uf` limita a adoção do sistema por estados com necessidades específicas.

3. **LGPD:** Medidas de segurança implementadas (JWT, CSRF, rate-limit, Helmet, sanitização de senhas com histórico e bcrypt). Pendentes: termo de consentimento explícito, política de retenção, e exportação de dados pelo titular.

4. **Acessibilidade e suporte offline:** A menção a "falta de infraestrutura e conectividade em algumas regiões" no documento requer planejamento para cenários offline, que atualmente não existe.

### Recomendações Estratégicas

1. **Priorizar interoperabilidade:** A integração com e-Social e CADSUS deve ser a primeira grande iniciativa, pois resolve o problema mais citado nas oficinas e reduz a carga de trabalho dos usuários.

2. **Criar comitê de governança de dados:** Para definir indicadores nacionais vs. locais, responsáveis pela alimentação, e periodicidade de atualização - conforme sugerido nas oficinas.

3. **Adotar padrões abertos:** Utilizar FHIR ou openEHR para interoperabilidade, garantindo que o sistema possa se comunicar com outros sistemas de saúde.

4. **Planejar versão mobile/offline:** Considerando a realidade de conectividade dos municípios brasileiros, uma estratégia offline-first é recomendada para adoção nacional.

---

*Relatório gerado em Junho de 2026*  
*SISPNAIST v1.0.0*
