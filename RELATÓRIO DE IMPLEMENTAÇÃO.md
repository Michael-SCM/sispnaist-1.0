# Comparativo: Projeto PHP vs Projeto React/MongoDB

## Resumo Executivo

O projeto PHP original é um sistema completo de Gestão da Saúde do Trabalhador com **75+ módulos/funcionalidades**. O projeto React/MongoDB atual possui a estrutura base e as funcionalidades principais implementadas, mas ainda faltam muitos catálogos, submódulos do trabalhador e funcionalidades administrativas.

---

## ✅ Funcionalidades JÁ IMPLEMENTADAS no React

### Módulos Principais (CRUD Completo)
1. **Trabalhadores** (`frontend/src/pages/Trabalhadores/`)
   - Cadastro, edição, listagem, detalhes
   - Campos: dados pessoais, endereço, vínculo

2. **Acidentes** (`frontend/src/pages/Acidentes/`)
   - Cadastro, edição, listagem, detalhes
   - Tipos: Típico, Trajeto, Doença Ocupacional, Material Biológico, Violência

3. **Doenças** (`frontend/src/pages/Doencas/`)
   - Cadastro de doenças ocupacionais
   - Status ativo/inativo

4. **Vacinações** (`frontend/src/pages/Vacinacoes/`)
   - Controle de vacinas
   - Próximas doses

5. **Empresas** (`backend/src/controllers/empresaController.ts`)
   - CRUD de empresas

6. **Unidades** (`backend/src/controllers/unidadeController.ts`)
   - CRUD de unidades

7. **Usuários/Autenticação**
   - Login, registro, perfis (admin, gestor, trabalhador)
   - Autorização por perfil

8. **Dashboard**
   - Dashboard Admin/Gestor com KPIs e gráficos
   - Dashboard do Trabalhador (básico)

9. **Questionários** (`backend/src/controllers/questionarioController.ts`)
   - Estrutura base implementada

10. **Vídeo Aulas** (`backend/src/controllers/videoAulaController.ts`)
    - Estrutura base implementada

11. **Catálogos** (`backend/src/controllers/catalogoController.ts`)
    - Catálogos genéricos

12. **Email** (`backend/src/controllers/emailController.ts`)
    - Envio de emails

13. **Upload de Arquivos** (`backend/src/controllers/uploadController.ts`)
    - Upload de documentos

---

## ❌ Funcionalidades QUE FALTAM no React (existentes no PHP)

### 1. Submódulos do Trabalhador (Relacionamentos 1:N)
O PHP tem vários submódulos vinculados ao trabalhador que não existem no React:

| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 1 | `trabalhador_afastamento` | Afastamentos do trabalhador | 🔴 Alta |
| 2 | `trabalhador_dependentes` | Dependentes do trabalhador | 🔴 Alta |
| 3 | `trabalhador_vinculos` | Vínculos empregatícios detalhados | 🔴 Alta |
| 4 | `trabalhador_readaptacao` | Readaptação funcional | 🟡 Média |
| 5 | `trabalhador_processo_trabalho` | Processos de trabalho | 🟡 Média |
| 6 | `trabalhador_ocorrencia_violencia` | Ocorrências de violência | 🟡 Média |
| 7 | `trabalhador_informacoes` | Informações adicionais | 🟡 Média |

### 2. Módulo de Acidente Material Biológico (Separado)
O PHP separa o acidente de material biológico em um módulo próprio:

| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 8 | `acidente_material_biologico` | Acidentes com material biológico | 🔴 Alta |
| 9 | `sorologia_acidentado` | Sorologia do acidentado | 🔴 Alta |
| 10 | `sorologia_paciente` | Sorologia do paciente fonte | 🔴 Alta |

### 3. Evolução e Acompanhamento
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 11 | `evolucao_acidentado` | Evolução do acidentado | 🟡 Média |
| 12 | `evolucao_caso` | Evolução do caso | 🟡 Média |
| 13 | `regime_acompanhamento` | Regime de acompanhamento | 🟡 Média |

### 4. Catálogos/Parametrizações (Tabelas Auxiliares)
O PHP possui ~40 catálogos que alimentam dropdowns e listas. No React, alguns estão hardcoded ou não existem:

| # | Catálogo PHP | Usado em | Prioridade |
|---|-------------|----------|------------|
| 14 | `agente` | Acidentes | 🟢 Baixa |
| 15 | `causador_trauma` | Acidentes | 🟢 Baixa |
| 16 | `circunstancia_acidente` | Acidentes | 🟢 Baixa |
| 17 | `conduta` | Atendimentos | 🟢 Baixa |
| 18 | `desfecho` | Atendimentos | 🟢 Baixa |
| 19 | `equipamento_protecao` | Acidentes | 🟢 Baixa |
| 20 | `escolaridade` | Trabalhador | 🟡 Média |
| 21 | `estado_civil` | Trabalhador | 🟡 Média |
| 22 | `estado_vacinal` | Vacinação | 🟡 Média |
| 23 | `funcao` | Trabalhador/Vínculo | 🟡 Média |
| 24 | `genero` | Trabalhador | 🟡 Média |
| 25 | `grau_deficiencia` | Trabalhador | 🟢 Baixa |
| 26 | `grau_satisfacao` | Pesquisa | 🟢 Baixa |
| 27 | `jornada_trabalho` | Trabalhador | 🟡 Média |
| 28 | `material_organico` | Material Biológico | 🟢 Baixa |
| 29 | `meio_agressao` | Violência | 🟢 Baixa |
| 30 | `motivo_afastamento` | Afastamentos | 🟡 Média |
| 31 | `motivo_violencia` | Violência | 🟢 Baixa |
| 32 | `outro_vinculo` | Vínculos | 🟢 Baixa |
| 33 | `parte_corpo` | Acidentes | 🟢 Baixa |
| 34 | `raca_cor` | Trabalhador | 🟡 Média |
| 35 | `sexo` | Trabalhador | 🟡 Média |
| 36 | `situacao_trabalho` | Trabalhador | 🟡 Média |
| 37 | `tempo_deficiencia` | Trabalhador | 🟢 Baixa |
| 38 | `tipo_acidente` | Acidentes | 🟢 Baixa |
| 39 | `tipo_afastamento` | Afastamentos | 🟡 Média |
| 40 | `tipo_autor_violencia` | Violência | 🟢 Baixa |
| 41 | `tipo_deficiencia` | Trabalhador | 🟢 Baixa |
| 42 | `tipo_droga` | Exames | 🟢 Baixa |
| 43 | `tipo_exposicao` | Material Biológico | 🟢 Baixa |
| 44 | `tipo_sanguineo` | Trabalhador | 🟡 Média |
| 45 | `tipo_trauma` | Acidentes | 🟢 Baixa |
| 46 | `tipo_vinculo` | Vínculos | 🟡 Média |
| 47 | `tipo_violencia` | Violência | 🟢 Baixa |
| 48 | `tipo_violencia_sexual` | Violência | 🟢 Baixa |
| 49 | `turno_trabalho` | Trabalhador | 🟡 Média |

### 5. Administração e Gestão
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 50 | `funcionalidade` | Gestão de funcionalidades/menus | 🔴 Alta |
| 51 | `perfil` | Perfis de acesso (RBAC completo) | 🔴 Alta |
| 52 | `perfil_funcionalidade` | Permissões por perfil | 🔴 Alta |
| 53 | `usuario` | Gestão de usuários completa | 🔴 Alta |
| 54 | `usuario_acao` | Auditoria de ações do usuário | 🟡 Média |
| 55 | `monitoramento` | Logs e monitoramento de erros | 🟡 Média |
| 56 | `parametro` | Parâmetros do sistema | 🟡 Média |
| 57 | `preferencia_usuario` | Preferências do usuário | 🟢 Baixa |

### 6. Comunicação e Marketing
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 58 | `padrao_email` | Templates de email | 🟡 Média |
| 59 | `envio_email` | Envio de emails em massa | 🟡 Média |
| 60 | `rede_social` | Integração com redes sociais | 🟢 Baixa |
| 61 | `legislador` | Gestão de legisladores | 🟢 Baixa |
| 62 | `acao` | Ações/Campanhas | 🟢 Baixa |

### 7. Endereço e Localização
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 63 | `bairro` | Cadastro de bairros | 🟢 Baixa |
| 64 | `logradouro` | Cadastro de logradouros | 🟢 Baixa |
| 65 | `endereco_correios` | Integração com Correios | 🟢 Baixa |
| 66 | `municipio` | Cadastro de municípios | 🟢 Baixa |

### 8. Questionários (Mais Completo no PHP)
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 67 | `questionario` | Estrutura de questionários | 🟡 Média |
| 68 | `questionario_item` | Itens/perguntas | 🟡 Média |
| 69 | `questionario_alternativa` | Alternativas de resposta | 🟡 Média |

### 9. Dashboards e Painéis
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 70 | `meu_painel` | Painel pessoal do usuário | 🟡 Média |
| 71 | `painel_gestor` | Painel específico do gestor | 🟡 Média |
| 72 | `painel_gestor_lideranca` | Painel de liderança | 🟢 Baixa |

### 10. Outros
| # | Módulo PHP | Descrição | Prioridade |
|---|-----------|-----------|------------|
| 73 | `servidor_funcionario` | Gestão de servidores | 🟢 Baixa |
| 74 | `arquivo_upload` | Gestão de uploads | 🟡 Média |
| 75 | `video_aula` | Vídeo aulas (parcial no React) | 🟢 Baixa |

---

## 📊 Estatísticas

| Categoria | Qtde PHP | Qtde React | Faltam |
|-----------|----------|------------|--------|
| **Módulos Principais** | 15 | 8 | 7 |
| **Submódulos Trabalhador** | 7 | 0 | 7 |
| **Catálogos/Tabelas Auxiliares** | ~40 | ~5 | ~35 |
| **Administração/Segurança** | 8 | 3 | 5 |
| **Dashboards/Painéis** | 4 | 2 | 2 |
| **Comunicação** | 5 | 2 | 3 |
| **Total** | **~79** | **~20** | **~59** |

---

## 🎯 Recomendações de Prioridade

### Fase 1 - Crítico (Impede uso em produção)
1. **Submódulos do Trabalhador**: Afastamentos, Dependentes, Vínculos
2. **Acidente Material Biológico**: Módulo separado com sorologias
3. **Catálogos Essenciais**: Escolaridade, Estado Civil, Raça/Cor, Sexo, Tipo Sanguíneo
4. **RBAC Completo**: Perfis, Funcionalidades, Permissões

### Fase 2 - Importante (Melhora usabilidade)
1. Evolução do Acidentado/Caso
2. Catálogos de Acidentes: Agente, Causador Trauma, Parte Corpo, Tipo Trauma
3. Padrão de Email e Envio
4. Meu Painel (dashboard pessoal detalhado)

### Fase 3 - Desejável (Funcionalidades avançadas)
1. Painel Gestor com Liderança
2. Questionários completos (itens e alternativas)
3. Monitoramento e Auditoria
4. Integração com Correios
5. Ações/Campanhas

---

## 🔧 Notas Técnicas

### Diferenças de Arquitetura
| Aspecto | PHP | React |
|---------|-----|-------|
| **Banco de Dados** | MySQL/PostgreSQL (relacional) | MongoDB (NoSQL) |
| **Frontend** | ExtJS + PHP puro | React + TypeScript |
| **Autenticação** | Sessão PHP | JWT |
| **Permissões** | RBAC completo por perfil/funcionalidade | Básico (admin/gestor/trabalhador) |
| **Relatórios** | PHPExcel integrado | Não implementado |
| **Email** | Envio manual e automático | Estrutura base |

### Migração de Dados
- Os catálogos do PHP precisam ser convertidos para documentos MongoDB ou enums
- O relacionamento Trabalhador → Dependentes/Afastamentos/Vínculos precisa ser modelado como subdocumentos ou coleções separadas
- O módulo de Acidente Material Biológico precisa de uma coleção própria ou extensão da coleção Acidente

