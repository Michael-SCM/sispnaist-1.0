# 📋 Formulário de Implementação — SISPNAIST

> Documento vivo que reúne o que falta implementar no projeto React (`sispnaist 1.0`) com base em `Doc/sispnaist_analise_e_melhorias.md`. O status é atualizado conforme as implementações avançam.

## ✅ Como ler esse formulário

- **❌** — Não implementado (a fazer).
- **🟡** — Parcialmente implementado (falta completar).
- **✅** — Concluído.

---

## 1. Funcionalidades / Melhorias de UX e Gestão (Seção 5.1)

| # | Tarefa | Status | Detalhes / Próximos passos |
|---|--------|--------|----------------------------|
| 1 | Alertas e notificações proativas | ✅ Concluído | Sistema de alertas em `/alertas`, sino no cabeçalho, e-mail automático, agendamento `node-cron`, regras configuráveis. |
| 2 | Personalização de dashboards | ❌ | Permitir que o gestor escolha KPIs e gráficos e salve preferências (ver `IPreferenciaUsuario.dashboardPadrao`). |
| 3 | Relatórios customizáveis (ad-hoc) | ❌ | Interface com seleção de campos, filtros e agrupamentos; exportações PDF/CSV já existem. |
| 4 | Visualização de dados georreferenciados | ❌ | Mapas para distribuição de acidentes, doenças e unidades de saúde. |
| 5 | Integração com ferramentas de BI | ❌ | Power BI / Tableau / conector de dados. |
| 6 | Módulo de gestão de documentos | 🟡 | Upload genérico existe (`ArquivoUpload`/`uploadController`); falta módulo dedicado a PGR/PCMSO/laudos com versionamento e prazos de validade. |

## 2. Melhorias de Segurança (Seção 5.2)

| # | Tarefa | Status | Detalhes / Próximos passos |
|---|--------|--------|----------------------------|
| 7 | **Autenticação de Dois Fatores (2FA)** | ✅ Concluído | Código OTP por e-mail. Obrigatório para `admin`/`gestor`, opcional para os demais. Config em "Minha Conta" → Segurança e Senha. Ver seção *Plano do 2FA* abaixo. |
| 8 | Políticas de senha robustas | 🟡 | Já: mínimo 8, complexidade, histórico e bloqueio de reuso (últimas 5). Falta: expiração/rotação periódica de senha. |
| 9 | Rate limiting | ✅ | `express-rate-limit` nas rotas de autenticação. |
| 10 | Validação de entrada | ✅ | `joi` (`validateRequest`) + `sanitizeBody`. |
| 11 | Auditoria de acesso a dados sensíveis | 🟡 | `AuditLog` + `auditMiddleware` prontos. Falta: registrar `LOGIN`/`LOGOUT` automaticamente e garantir imutabilidade/TTL. |
| 12 | Segregação de ambientes | 🟡 | Infra de deploy já separada (Vercel/Render/Atlas); revisar credenciais por ambiente. |
| 13 | Varredura de vulnerabilidades (SAST/DAST) | ❌ | Adicionar etapa de análise estática/dinâmica no pipeline. |

## 3. Melhorias de Performance (Seção 5.3)

| # | Tarefa | Status | Detalhes / Próximos passos |
|---|--------|--------|----------------------------|
| 14 | Otimização de consultas MongoDB | 🟡 | Revisar `AnalyticsService` (aggregates) e criar índices adicionais. |
| 15 | Cache distribuído (Redis) | ❌ | Avaliar uso de Redis para dados frequentemente acessados. |
| 16 | Otimização de assets / CDN | 🟡 | Otimizar imagens (WebP) e avaliar CDN para assets estáticos. |
| 17 | Paginação e lazy loading | ✅ | Já aplicado em listas e no carregamento de rotas. |
| 18 | Monitoramento de performance (APM) | ❌ | Integrar ferramenta de APM (Sentry, New Relic etc.). |

## 4. Integrações (Seções 4 e 5.4)

| # | Tarefa | Status | Detalhes / Próximos passos |
|---|--------|--------|----------------------------|
| 19 | Transição mocks → APIs reais (CADSUS, CNES, SIH, SINAN, e-Social) | 🟡 | Mocks prontos e env `MS_*` já preparados. Falta credenciamento e adaptadores reais (RNDS/gov.br, providores e-Social). |
| 20 | Integração com sistemas de RH | ❌ | Importação automática de trabalhadores, vínculos, cargos e setores. |
| 21 | Integração com sistemas de SST | ❌ | Importar avaliações de risco, inspeções, treinamentos, EPIs. |
| 22 | Plataforma de treinamento online | ✅ Concluído | Videoaulas, quizzes e certificados. |
| 23 | Dados climáticos/ambientais | ❌ | Temperatura, umidade, poluição para análise de risco. |
| 24 | Dados demográficos detalhados | ❌ | Faixa etária, tempo de serviço etc. |
| 25 | APIs de geocodificação | ❌ | Padronizar/validar endereços e analytics espaciais. |

---

## 🔐 Plano do 2FA (Autenticação de Dois Fatores) — implementado

**Decisões de projeto**
- Método: **código OTP de 6 dígitos por e-mail** (reaproveita o serviço híbrido Brevo → Resend → Gmail).
- Obrigatório: **`admin` e `gestor`**. Opcional: `trabalhador` e `saude` (toggle na interface).
- Local de configuração: página **Minha Conta** → nova seção **Segurança e Senha**, que também permite **trocar a senha com confirmação por e-mail**.

### Modelo de dados
Novos campos em `usuarios` (`User.ts`):
```javascript
doisFatoresHabilitado: Boolean  // se o usuário ativou o 2FA
codigo2FA: String              // hash (bcrypt) do código OTP vigente (select:false)
codigo2FAExpira: Date          // validade do código (select:false)
ultimaTrocaSenha: Date         // data da última troca de senha (política futura de rotação)
```

### Fluxo de login (2 etapas)
1. **`POST /auth/login`** valida e-mail + senha.
   - Se o 2FA **não** estiver habilitado → emite `accessToken`/`refreshToken` + cookies (fluxo atual).
   - Se estiver habilitado → retorna `{ needs2FA: true, preAuthToken }` (JWT `type:'2fa'`, expira em 10 min) **sem** tokens de acesso; o frontend exibe o 2º passo.
2. **`POST /auth/2fa/enviar-codigo`** gera o OTP, salva o hash com validade de 5 min e envia por e-mail.
3. **`POST /auth/2fa/verificar`** recebe `preAuthToken + codigo`, valida o hash e emite `accessToken`/`refreshToken` + cookies.
   - Para **`admin`/`gestor`**: mesmo que `doisFatoresHabilitado` seja `false`, o login ainda exige o código (garantia de 2ª etapa).

### Endpoints
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/auth/2fa/enviar-codigo` | público (pós-login) | Envia o OTP para o e-mail do usuário. |
| POST | `/auth/2fa/verificar` | público (pós-login) | Valida o OTP e conclui o login. |
| POST | `/auth/2fa/habilitar` | autenticado | Gera e envia código para confirmar a ativação. |
| POST | `/auth/2fa/confirmar` | autenticado | Valida o código e ativa `doisFatoresHabilitado = true`. |
| POST | `/auth/2fa/desabilitar` | autenticado | Exige senha atual + código; define `false`. |
| POST | `/auth/change-password` | autenticado | Exige código de e-mail antes de aplicar a nova senha. |

### E-mail
- Nova função `send2FACodigoEmail(email, codigo)` em `backend/src/utils/emailService.ts`, seguindo o mesmo híbrido Brevo → Resend → Gmail das demais mensagens. Em dev, o código também é impresso no console para facilitar os testes.

### Segurança aplicada
- `rate-limit` específico para os endpoints de 2FA (`/auth/2fa/verificar`) e de troca de senha.
- Código armazenado apenas como **hash (bcrypt)** e com **expiração** de 5 minutos.
- O usuário **não recebe tokens de acesso** antes de validar o segundo fator (`preAuthToken` expira em 10 min).
- **Pendente:** auditoria automática de `LOGIN` (2 passos) e eventos de 2FA — ainda não emite `AuditLog` (o `AuditLog`/`auditMiddleware` já existem; item 11 da seção 5.2 permanece 🟡).

### Teste manual
1. Faça login em **Minha Conta → Segurança e Senha →** ative o toggle **"Autenticação de dois fatores (e-mail)"** e confirme o código recebido.
2. Encerre a sessão e tente logar novamente → o sistema deve pedir o código enviado por e-mail antes de liberar o acesso.
3. Repita o fluxo para uma conta de perfil `trabalhador`: sem o toggle ativo, o login ocorre normalmente.
4. Troque a senha pela seção de segurança, validando o código recebido por e-mail.

---

*Última atualização: 04/08/2026.*