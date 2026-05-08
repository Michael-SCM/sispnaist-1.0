# ANÁLISE DE GAP — Página Acidentes: PHP ↔ React

> Comparação entre o sistema PHP original (`sispnaist_php-main`) e a implementação React atual (`sispnaist 1.0`).
> Objetivo: identificar o que falta implementar no React para paridade funcional com o PHP.

---

## 1. ESTRUTURA DE DADOS — Comparação de Interfaces

### 1.1 Acidente de Trabalho

| Campo | PHP (AcidenteTrabalhoDTO) | React (IAcidente) | Status |
|---|---|---|---|
| `trabalhadorId` | `id_fk_trabalhador` | ✅ presente | OK |
| `dataAcidente` | `dt_acidente` | ✅ presente | OK |
| `horario` | `hr_acidente` | ✅ presente | OK |
| `horarioAposInicioJornada` | `hr_apos_inicio_jornada` | ✅ presente | OK |
| `tipoAcidente` | `id_fk_tipo_acidente` | ✅ presente | OK |
| `tipoTrauma` | `id_fk_tipo_trauma` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `agenteCausador` | `id_fk_agente_causador_trauma` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `parteCorpo` | `id_fk_parte_corpo` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `descricao` | `ds_acidente_trabalho` | ✅ presente | OK |
| `descricaoTrauma` | `ds_trauma` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `local` | — (não encontrado no PHP) | ✅ presente | OK |
| `estado` | `sg_estado` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `lesoes` | — (array manual) | ✅ presente | OK |
| `feriado` | — (não encontrado no PHP) | ✅ presente | OK |
| `comunicado` | — (não encontrado no PHP) | ✅ presente | OK |
| `dataComunicacao` | — (não encontrado no PHP) | ✅ presente | OK |
| `dataNotificacao` | `dt_notificacao` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `atendimentoMedico` | `in_atendimento_medico` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `dataAtendimento` | `dt_atendimento` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `horaAtendimento` | `hr_atendimento` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `unidadeAtendimento` | `nm_unidade_atendimento` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `internamento` | `in_internamento` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `duracaoInternamento` | `nr_duracao_provavel_internamento` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `catNas` | `in_cat_nas` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `registroPolicial` | `in_registro_policial` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `encaminhamentoJuntaMedica` | `in_encaminhamento_junta_medica` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `afastamento` | `in_afastamento_trabalhador` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `outrosTrabalhadoresAtingidos` | `in_outros_trabalhadores_atingidos` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `quantidadeTrabalhadoresAtingidos` | `nr_trabalhadores_atingidos` | ✅ presente (form), ❌ falta no `IAcidente` | **GAP** |
| `status` | — (não encontrado no PHP) | ✅ presente | OK |

### 1.2 Material Biológico (Acidente com Material Biológico)

| Campo | PHP (AcidenteMaterialBiologicoDTO) | React (IMaterialBiologico) | Status |
|---|---|---|---|
| `acidenteId` | `id_fk_acidente` | ✅ presente | OK |
| `tipoExposicao` | `id_fk_tipo_exposicao` | ✅ presente | OK |
| `materialOrganico` | `id_fk_material_organico` | ✅ presente | OK |
| `circunstanciaAcidente` | `id_fk_circunstancia_acidente` | ✅ presente | OK |
| `agente` | `id_fk_agente` | ✅ presente | OK |
| `equipamentoProtecao` | `id_fk_equipamento_protecao` | ✅ presente | OK |
| `sorologiaPaciente` | `id_fk_sorologia_paciente` | ✅ presente | OK |
| `sorologiaAcidentado` | `id_fk_sorologia_acidentado` | ✅ presente | OK |
| `conduta` | `id_fk_conduta` | ✅ presente | OK |
| `evolucaoCaso` | `id_fk_evolucaio` | ✅ presente | OK |
| `usoEPI` | `in_uso_epi` | ✅ presente | OK |
| `sorologiaFonte` | `in_sorologia_fonte` | ✅ presente | OK |
| `acompanhamentoPrEP` | `in_acompanhamento_prep` | ✅ presente | OK |
| `descAcompanhamentoPrEP` | `ds_acompanhamento_prep` | ✅ presente | OK |
| `descEncaminhamento` | `ds_encaminhamento` | ✅ presente | OK |
| `dataReavaliacao` | `dt_reavaliacao` | ✅ presente | OK |
| `efeitoColateralPermanente` | `in_efeito_colateral_permanece` | ✅ presente | OK |
| `descEfeitoColateralPermanente` | `ds_efeito_colateral_permanece` | ✅ presente | OK |

---

## 2. TIPO DE ACIDENTE — Catálogos vs. Tipos Fixos

### 2.1 Problema: Tipos do Acidente são strings fixas no React

O React usa um array fixo em `TIPOS_ACIDENTE`:
```typescript
const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Acidente Típico' },
  { value: 'Trajeto', label: 'Acidente de Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Acidente com Material Biológico', label: 'Material Biológico' },
  { value: 'Violência', label: 'Violência' },
];
```

O PHP usa `id_fk_tipo_acidente` que é um **ID de catálogo** (FK), não texto livre. No PHP, o tipo de acidente vem de uma tabela de catálogo (`ComboBox` ou similar).

**Isso significa que:**
- O React não está usando catálogos para tipo de acidente — usa strings fixas
- Se o PHP altera um nome de tipo no catálogo, o React fica desatualizado
- A consistência entre sistemas depende de manutenção manual

**Ação necessária:** Verificar no backend Node.js se existe catálogo de `tipoAcidente`. Se não existir, considerar criar ou manter a lista fixa temporariamente.

---

## 3. CAMPOS QUE PRECISAM SER ADICIONADOS AO `IAcidente` (types/index.ts)

Muitos campos existem nos formulários (`NovoAcidente.tsx`, `EditarAcidente.tsx`) e são preenchidos/enviados corretamente, mas **não estão declarados na interface `IAcidente`**. Isso causa uso de `as any` no service ao enviar para o backend.

**Adicionar ao `IAcidente` em `frontend/src/types/index.ts`:**

```typescript
export interface IAcidente {
  _id?: string;
  dataAcidente: string;
  horario?: string;
  horarioAposInicioJornada?: string;
  trabalhadorId: string;
  tipoAcidente: string;
  tipoTrauma?: string;
  agenteCausador?: string;
  parteCorpo?: string;
  descricao: string;
  descricaoTrauma?: string;
  local?: string;
  estado?: string; // UF
  lesoes?: string[];
  feriado?: boolean;
  comunicado?: boolean;
  dataComunicacao?: string;
  dataNotificacao?: string;
  atendimentoMedico?: boolean;
  dataAtendimento?: string;
  horaAtendimento?: string;
  unidadeAtendimento?: string;
  internamento?: boolean;
  duracaoInternamento?: number;
  catNas?: boolean;
  registroPolicial?: boolean;
  encaminhamentoJuntaMedica?: boolean;
  afastamento?: boolean;
  outrosTrabalhadoresAtingidos?: boolean;
  quantidadeTrabalhadoresAtingidos?: number;
  status?: 'Aberto' | 'Em Análise' | 'Fechado';
  dataCriacao?: string;
  dataAtualizacao?: string;
}
```

**Depois de atualizar o `IAcidente`:**
- Remover `as any` de `acidenteService.criar()` e `acidenteService.atualizar()`
- Garantir que o backend aceita todos esses campos

---

## 4. FALTA DE PAGINAÇÃO NA LISTA DE MATERIAL BIOLÓGICO

Na `ListaMaterialBiologico.tsx`, **não existe paginação** (elementos de UI para navegar entre páginas). Apenas a lista é renderizada sem controles de Anterior/Próximo nem informação de página atual / total de páginas.

**比对 PHP:** Não foi possível confirmar se o PHP tem paginação na lista de Material Biológico, mas é uma prática padrão.

**Ação necessária:** Adicionar controles de paginação equivalentes aos de `ListaAcidentes.tsx`.

---

## 5. HISTÓRICO DO REGISTRO EM `DetalhesAcidente.tsx`

O card "Histórico do Registro" em `DetalhesAcidente.tsx` (linha 352-367) mostra apenas:
- `dataCriacao`
- `dataAtualizacao`

O comentário B1 do arquivo `IMPLEMENTACAO_FALTAS_PAGINA_ACIDENTES.md` menciona que isso deveria integrar com endpoint de audit/ histórico real, **se existir no PHP**.

**Ação necessária:** Confirmar se o PHP tem tabela/página de histórico detalhado de alterações do acidente. Se sim, implementar consumo do endpoint de audit. Se não, renomear o card para "Datas do Registro" para não sugerir funcionalidade inexistente.

---

## 6. FLUXO: ACIDENTE TIPO "MATERIAL BIOLÓGICO" SEM STATE DE NAVEGAÇÃO

`NovoMaterialBiologico.tsx` usa `location.state?.acidenteId` para pré-preencher o formulário com o ID do acidente origem. Se o usuário acessar a página diretamente (sem navegar a partir dos detalhes do acidente), `stateAcidenteId` será `undefined`.

O formulário já tem seletor manual de acidentes, mas:
- Se o usuário navegar diretamente para `/acidentes/material-biologico/novo` sem state, precisa selecionar manualmente
- Isso está implementado (tem select de acidentes recentes), mas **não há fallback por query param**

**Ação necessária:** Adicionar suporte a `?acidenteId=<id>` como fallback para quando não há `location.state`. Isso pode ser feito lendo `useSearchParams()` do React Router.

---

## 7. BUSCA TEXTUAL EM `ListaAcidentes.tsx`

A busca textual do input está enviando `trabalhadorId` como filtro (linha 147), o que funciona para IDs mas **não é busca por descrição ou por texto livre**. O backend Node.js aparentemente não tem parâmetro de busca textual (`q`, `descricao`, etc.).

**Situação atual:** A busca por texto no input não realiza busca por descrição do acidente. Apenas passa o valor digitado como `trabalhadorId`, o que raramente vai encontrar resultados.

**Ação necessária:** Confirmar com o backend se existe endpoint que suporta busca por descrição (`q`/`search`/`descricao`). Se existir, implementar. Se não existir, considerar implementar no backend (criar filtro `descricao` no service de acidentes).

---

## 8. PAGINAÇÃO ESTENDIDA — UX (`ListaAcidentes.tsx`)

A paginação atual renderiza **todas as páginas** como botões (linha 358: `Array.from({ length: pages })`). Se houver 50 páginas, serão renderizados 50 botões.

**Recomendado:** Implementar janela de paginação (ex.: mostrar `currentPage-2 .. currentPage+2`) com elipses `...` quando aplicável.

---

## 9. MAPA DE ARQUIVOS A VERIFICAR/MODIFICAR

| Arquivo | Ação | Status |
|---|---|---|
| `frontend/src/types/index.ts` | Atualizar `IAcidente` com campos faltantes | ✅ Implementado |
| `frontend/src/services/acidenteService.ts` | Remover `as any` após atualizar `IAcidente` | ✅ Implementado |
| `frontend/src/pages/Acidentes/ListaMaterialBiologico.tsx` | Adicionar paginação | ✅ Implementado |
| `frontend/src/pages/Acidentes/DetalhesAcidente.tsx` | Clarificar/implementar histórico | ✅ Implementado (renomeado para "Datas do Registro") |
| `frontend/src/pages/Acidentes/NovoMaterialBiologico.tsx` | Adicionar suporte a query param `acidenteId` | ✅ Implementado |
| `frontend/src/pages/Acidentes/ListaAcidentes.tsx` | Implementar busca textual real ou remover promise | ✅ Implementado |
| `frontend/src/pages/Acidentes/ListaAcidentes.tsx` | Janela de paginação | ✅ Implementado |
| `frontend/src/pages/Acidentes/NovoAcidente.tsx` | Verificar se catálogo de tipoAcidente existe no backend | ✅ Confirmado existente |
| `frontend/src/pages/Acidentes/EditarAcidente.tsx` | Verificar se catálogo de tipoAcidente existe no backend | ✅ Confirmado existente |

---

## 10. CONFIRMAÇÃO: BACKEND NODE.JS

O backend Node.js (MongoDB) **já possui todos os campos** no schema `Acidente.ts` (`backend/src/models/Acidente.ts`):

```
tipoTrauma, agenteCausador, parteCorpo, descricaoTrauma,
estado, dataNotificacao, atendimentoMedico, dataAtendimento,
horaAtendimento, unidadeAtendimento, internamento, duracaoInternamento,
catNas, registroPolicial, encaminhamentoJuntaMedica, afastamento,
outrosTrabalhadoresAtingidos, quantidadeTrabalhadoresAtingidos
```

Todos esses campos existem no model MongoDB. **O gap é exclusivamente no frontend**: a interface `IAcidente` no TypeScript não declara esses campos, causando uso de `as any` na comunicação com o backend.

**Filtros aceitos pelo backend na listagem:**
- `tipoAcidente`
- `status`
- `trabalhadorId`
- `dataInicio`
- `dataFim`

**Não existe busca textual** (`q`, `descricao`, `search`). A busca por texto no input de `ListaAcidentes` está enviando o valor como `trabalhadorId`, o que não produz resultados úteis a menos que o usuário digite um ID de MongoDB.

---

## 11. RESUMO EXECUTIVO FINAL

| # | Item | Status | Esforço |
|---|---|---|---|
| 1 | Atualizar `IAcidente` em `types/index.ts` com campos faltantes | ✅ Implementado | Baixo |
| 2 | Remover `as any` nos services após atualizar `IAcidente` | ✅ Implementado | Baixo |
| 3 | Implementar busca textual real ou remover funcionalidade inconsistente | ✅ Implementado | Médio |
| 4 | Adicionar paginação em `ListaMaterialBiologico.tsx` | ✅ Implementado | Médio |
| 5 | Implementar query param `acidenteId` em `NovoMaterialBiologico.tsx` | ✅ Implementado | Baixo |
| 6 | Verificar/integrar histórico do registro com endpoint de audit | ✅ Implementado (renomeado para "Datas do Registro", sem acesso a audit) | Médio |
| 7 | Implementar janela de paginação em `ListaAcidentes.tsx` | ✅ Implementado | Médio |
| 8 | Avaliar uso de catálogo vs. string fixa para `tipoAcidente` | ✅ Confirmado (catálogo existe) | Alto |

**A ação número 1 é a de maior impacto com menor esforço:** basta adicionar ~17 campos opcionais na interface `IAcidente`. Após isso, os serviços podem perder o `as any` e o frontend estará tipicamente correto.