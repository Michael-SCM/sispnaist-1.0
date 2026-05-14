# Análise de Funcionalidades Faltantes (PHP -> React/Node)

Após comparar o projeto legado em PHP (`sispnaist_php-main`) com o projeto atual em React e Node.js (`sispnaist 1.0`), identifiquei que o "esqueleto" e grande parte dos módulos já foram migrados e estão online (como Acidentes, Trabalhadores, Doenças, etc.). 

No entanto, há **lacunas importantes** de funcionalidades que existiam no PHP, algumas das quais já possuem rotas no seu backend em Node, mas **não possuem telas no frontend (React)**, e outras que não foram portadas para a nova versão ainda.

---

## 1. Módulos com Backend Pronto, mas sem Interface (Frontend)
Os seguintes módulos já possuem controladores e rotas implementadas no seu servidor Node.js (Render), mas ainda **não existem telas no Vercel (React)** para utilizá-los:

*   **Módulo de Questionários / Pesquisas:**
    *   *No PHP:* Pastas `questionario`, `questionario_alternativa`, `questionario_item`.
    *   *No Backend (Node):* `questionarioController.ts` e rotas `/api/questionarios`.
    *   *Falta no Frontend:* Telas para criar questionários (Admin) e telas para os usuários responderem aos questionários.
*   **Módulo de Vídeo Aulas (Ensino/Educação):**
    *   *No PHP:* Pasta `video_aula`.
    *   *No Backend (Node):* `videoAulaController.ts` e rotas `/api/video-aulas`.
    *   *Falta no Frontend:* Painel para cadastrar/editar vídeos e uma tela (player) para os usuários assistirem e contabilizar visualizações.
*   **Cadastro de Servidor / Funcionário:**
    *   *No PHP:* Pasta `servidor_funcionario`.
    *   *No Backend (Node):* `servidorFuncionarioController.ts` e rotas `/api/servidores`.
    *   *Falta no Frontend:* Embora exista a aba de "Trabalhadores", a tabela específica de "Servidor/Funcionário" (que guarda situação funcional, lotação, etc.) não possui interface ou aba dedicada no frontend atual.
*   **Parâmetros do Sistema e Preferências:**
    *   *No PHP:* Pastas `parametro` e `preferencia_usuario`.
    *   *No Backend (Node):* `parametroController.ts` e `preferenciaController.ts`.
    *   *Falta no Frontend:* Painel de controle no Admin para ajustar parâmetros do sistema e uma tela de perfil para o usuário ajustar suas preferências.

---

## 2. Módulos e Telas Existentes no PHP, mas Ausentes no Sistema Novo
As seguintes funcionalidades existiam nas views do projeto PHP, mas não foram encontradas na estrutura do novo sistema (nem no frontend, nem no backend):

*   **Paineis Específicos de Gestão:**
    *   *No PHP:* Pastas `painel_gestor` e `painel_gestor_lideranca`.
    *   *Falta:* Telas de dashboard exclusivas com métricas filtradas para os perfis de Gestor e Liderança. O React atualmente tem apenas um `Dashboard.tsx` genérico.
*   **Meu Painel / Meu Perfil:**
    *   *No PHP:* Pastas `meu_painel` e `perfil`.
    *   *Falta:* Uma área restrita para o usuário logado (ex: Trabalhador) visualizar seus próprios dados, seus afastamentos, suas vacinas e alterar sua senha/dados pessoais.
*   **Gestão de Perfis de Acesso Avançada (AMI):**
    *   *No PHP:* Pasta `ami_perfil`.
    *   *Falta:* O sistema atual de React possui `AtosMunicipais`, mas parece faltar o controle de perfis atrelado especificamente aos Atos Municipais de Inovação (AMI).

---

## 🚀 Próximos Passos Sugeridos

Para finalizar 100% da parte funcional equivalente ao PHP, sugiro a seguinte ordem de implementação:

1.  **Criar as páginas do Frontend para o que já existe no Backend:**
    *   Telas de `Vídeo Aulas` (CRUD + Visualização).
    *   Telas de `Questionários` (CRUD + Formulário de Resposta).
    *   Área de `Preferências do Usuário` e `Parâmetros de Admin`.
2.  **Desenvolver no Node e React as telas de Gestor/Liderança:**
    *   Adaptar o Dashboard atual ou criar novas rotas para a visão de liderança (Painel Gestor).
3.  **Criar a área "Meu Perfil":**
    *   Onde o usuário normal pode visualizar seu histórico no sistema.

Qual desses módulos você gostaria que começássemos a implementar primeiro no frontend em React?
