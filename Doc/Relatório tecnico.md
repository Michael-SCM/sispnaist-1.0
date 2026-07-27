Relatório técnico de auditoria — SISPNAIST 1.0
Data da análise: 23 de julho de 2026
Escopo: código-fonte fornecido, frontend hospedado no Vercel, backend e mocks publicados no Render, configuração de integração e MongoDB Atlas.
Método: revisão estática do projeto, compilação e testes isolados, auditoria de dependências, comparação de contratos com os mocks e sondagens HTTP não destrutivas dos serviços públicos.

Conclusão executiva: a arquitetura contém uma base funcional promissora — frontend React/TypeScript, API Express/MongoDB, adaptadores para cinco integrações e mecanismos de segurança já iniciados. No momento da coleta, porém, a cadeia de produção está indisponível para fluxos autenticados e integrados: o backend informado e os quatro mocks configurados retornam serviço suspenso, enquanto o rewrite publicado no Vercel aponta para outro host, que retorna 404. A estabilização de infraestrutura e a revogação de credenciais expostas devem ocorrer antes de qualquer evolução funcional.

Este relatório descreve uma fotografia técnica do dia da coleta. O estado de hosts gerenciados pode mudar posteriormente; por isso, os testes de aceite propostos devem ser repetidos após cada correção.



1. Resumo de prioridades
Prioridade	Tema	Situação observada	Consequência	Ação inicial
P0 — crítica	Credencial administrativa exposta	backend/admin.txt está versionado e contém credencial de administrador em texto claro.	Possível acesso indevido caso a conta ou senha ainda estejam ativas/reutilizadas.	Bloquear ou redefinir a conta, rotacionar segredos e remover o arquivo do histórico Git.
P0 — crítica	Cadeia Vercel → API quebrada	O backend informado responde 503; o host do rewrite responde 404; /api/health no Vercel também responde 404. 1 2 3 4	Login, cadastro, área autenticada e integrações não funcionam de ponta a ponta.	Definir um único URL canônico de API, reativar/reimplantar o serviço e corrigir o rewrite.
P0 — crítica	Mocks públicos suspensos	CADSUS, SIH, CNES e SINAN configurados retornam 503 “Service Suspended”. 5 6 7 8	As integrações recém-implementadas falham em produção.	Reativar ou reimplantar cada mock e validar health checks antes de liberar o backend.
P1 — alta	e-Social sem URL de ambiente	O código suporta MS_ESOCIAL_API_URL, mas essa variável não está definida no ambiente analisado.	A integração e-Social falha mesmo que seu mock exista.	Criar e configurar a variável no Render; validar URL, token e health check.
P1 — alta	Qualidade bloqueada	Frontend compila, mas possui 112 erros de TypeScript; 1 de 45 testes do backend falha; não há testes de frontend.	O CI configurado deveria impedir deploys e a manutenção fica arriscada.	Corrigir tipagem, reparar o teste CADSUS e implantar gates obrigatórios.
P1 — alta	Dependências vulneráveis	Auditoria de produção: backend com 9 vulnerabilidades (3 altas) e frontend com 5 (2 altas).	Aumenta risco em componentes de rede, e-mail e parsing.	Atualizar dependências em branch própria, rodar regressão e publicar lockfiles revisados.
P1 — alta	Saúde do Atlas não integra readiness	O backend pode continuar servindo /health como OK após falha de conexão do Mongoose.	Um serviço aparentemente saudável pode falhar em todas as rotas de dados.	Separar liveness de readiness, aguardar Atlas antes de escutar e monitorar conexão.
P2 — média	Respostas de erro inconsistentes	SIH retorna message; CADSUS, CNES, e-Social e SINAN retornam mensagem; o cliente web lê apenas message.	O usuário recebe erro genérico em grande parte das integrações.	Padronizar contrato de erro e adicionar testes de UI.
P2 — média	Resiliência de integrações limitada	Cliente HTTP usa timeout de 60 s e até 3 retries, sem circuit breaker, budget de timeout ou métricas.	Uma indisponibilidade pode prolongar requisições e degradar a experiência.	Reduzir e orçar timeouts, usar backoff com jitter, circuit breaker e observabilidade.
P2 — média	Mocks não simulam controles reais	Todos aceitam chamadas sem token/chave; SINAN aceita POST e gera sequência apenas em memória.	Contratos de segurança, idempotência e persistência não são validados antes da produção.	Fortalecer mocks de staging e criar testes de contrato e falha.


3. O que já está bem encaminhado
O projeto não deve ser refeito. Há componentes sólidos que devem ser preservados e estabilizados.

Componente	Pontos positivos observados	Como aproveitar
Arquitetura de integrações	Serviços separados para CADSUS, SIH, CNES, e-Social e SINAN, com adaptadores para normalizar dados externos.	Manter a separação e formalizar contratos/DTOs para cada integração.
Cliente HTTP externo	Centraliza URL base, Authorization, X-API-Key, timeout e retries.	Evoluir o mesmo cliente com métricas, circuit breaker e política de timeout por serviço.
Segurança HTTP	Há CORS com lista permitida, Helmet, rate limit, cookies e proteção CSRF.	Manter os controles e cobri-los com testes automatizados de autenticação/CSRF/CORS.
Pipeline de CI	O workflow prevê build, testes, type-check e npm audit antes de deploy.	Torná-lo o único caminho de promoção para produção e remover bypasses.
Cobertura unitária inicial	A execução com cobertura atingiu 89,24% de statements no conjunto testado.	Expandir a cobertura para rotas, autorização, banco, SINAN, frontend e cenários de erro.
Rewrites same-origin	A ideia de expor /api/* pelo Vercel reduz complexidade de CORS/cookies no navegador.	Manter essa estratégia, mas corrigir destino e validar health checks automaticamente.
Leitura importante: a cobertura atual não significa que o sistema está pronto para produção. Ela está concentrada sobretudo em quatro serviços e validações; não substitui testes ponta a ponta nem a verificação real dos serviços publicados.



4. Análise específica das integrações recentes
4.1 Contratos básicos: coerentes localmente
Foi feita uma validação isolada dos cinco mocks, iniciados localmente a partir das pastas fornecidas. CADSUS, SIH, CNES, e-Social e SINAN responderam às rotas que o backend chama; o POST de notificação do SINAN retornou HTTP 201. Portanto, os caminhos principais estão alinhados:

Integração	Caminho consumido pelo backend	Caminho disponível no mock	Resultado local
CADSUS	/cadsus/usuarios/:cpfOuCns	Igual	Consulta retornou 200.
SIH	/internacoes/:cns	Igual	Consulta retornou 200.
CNES	/cnes/estabelecimentos/:codigo	Igual	Consulta retornou 200.
e-Social	/api/v1/esocial/eventos/:cpf	Igual	Consulta retornou 200.
SINAN	/sinan/notificacoes/:cpfOuCns e /sinan/notificar	Igual	Consulta 200 e notificação 201.
Isso é um bom sinal para o desenvolvimento, mas não resolve o problema de produção: os serviços publicamente configurados estão suspensos e a URL e-Social não foi configurada.

4.2 Limites dos mocks atuais
Os mocks servem como dublês de dados e ajudam a desenvolver telas/adaptadores, mas ainda não representam um ambiente de integração robusto. Durante a validação local, todas as rotas aceitaram chamadas sem credenciais. O mock SINAN também aceitou uma escrita sem autenticação e guardou apenas estado em memória.

Lacuna do mock	Risco de não testar	Melhoria recomendada
Sem autenticação	A integração passa no desenvolvimento, mas falha ou fica insegura no ambiente real.	Validar Authorization e/ou X-API-Key, com credenciais distintas por ambiente.
Sem persistência	Reexecuções e reinícios não refletem comportamento de dados reais.	Usar base de teste descartável ou armazenamento temporário explícito em staging.
Sem idempotência	Duplicidade de eventos, especialmente em SINAN, não é detectada.	Exigir chave de idempotência e simular resposta de duplicidade.
Sem erros realistas	Timeout, 429, 500, payload inválido e schema drift não são exercitados.	Criar cenários selecionáveis de falha e testes automatizados para cada um.
Sem limites de tráfego	Rate limit e backpressure do provedor não são previstos.	Simular 429 e incluir cabeçalhos de rate limit.
URLs públicas suspensas	Testes integrados não podem rodar.	Usar staging persistente, health checks e monitoramento externo.
4.3 Erros e experiência do usuário
O frontend busca mensagens em responseData.message. Porém, os controladores de CADSUS, CNES, e-Social e SINAN retornam mensagem, enquanto SIH retorna message. Esta divergência fará a interface mostrar um erro genérico de Axios em vários casos, mesmo quando o backend produz uma mensagem útil.

A correção deve ser feita em duas frentes: padronizar o backend e tornar o cliente web tolerante durante a migração.

// Contrato recomendado para todas as APIs
{
  status: 'error',
  code: 'INTEGRATION_UNAVAILABLE',
  message: 'Sistema externo indisponível no momento.',
  requestId: '...'
}
 
// Compatibilidade temporária no frontend
const errorMessage =
  responseData?.message ?? responseData?.mensagem ?? error.message ?? 'Erro na requisição';

Após a migração, remova mensagem dos controladores e escreva testes para 400, 401, 404, 429, 502, 503, 504 e payload externo inválido.

4.4 Timeouts, retry e indisponibilidade
O cliente de integrações inicia com timeout de 60 segundos e até três retries lineares para 429, 502, 503, timeout e falhas de rede. Com shouldResetTimeout ativo, o limite teórico de uma requisição com quatro tentativas pode se aproximar de 246 segundos (quatro janelas de 60 s mais atrasos de 1+2+3 s), dependendo do ponto em que cada tentativa falha. Esse tempo é incompatível com a expectativa de uma tela web e pode fazer o navegador desistir antes do backend concluir.

Recomenda-se definir uma política por dependência: por exemplo, timeout de conexão curto, timeout total de operação entre 8 e 15 segundos, no máximo uma repetição para leitura idempotente, backoff exponencial com jitter e circuit breaker. Em caso de circuito aberto, a API deve responder rapidamente com 503 padronizado e uma orientação ao usuário, sem reter threads/requisições por minutos.



5. Segurança, segredos e dados sensíveis
5.1 Ação imediata: credencial administrativa
Foi encontrado um arquivo versionado, backend/admin.txt, contendo credencial explícita de administrador. O conteúdo não é reproduzido aqui. Essa situação deve ser tratada como exposição de segredo.

A remoção de um arquivo do diretório de trabalho não é suficiente: a credencial pode permanecer no histórico Git, em clones, caches e artefatos de CI.

Siga esta ordem, pois a rotação deve ocorrer antes ou junto da limpeza do histórico:

1Desabilite ou redefina imediatamente a conta administrativa associada, verificando se ela existe no Atlas e se foi utilizada.
2Rotacione JWT secrets, credenciais do MongoDB Atlas, chaves de e-mail e tokens/chaves das integrações caso tenham sido reutilizados ou compartilhados.
3Remova o arquivo do repositório atual com git rm backend/admin.txt e inclua-o no .gitignore se ele ainda for necessário localmente — preferencialmente, substitua-o por instrução sem credenciais.
4Limpe o histórico com uma ferramenta adequada, como git filter-repo, após criar backup e alinhar com todos os colaboradores. Exemplo conceitual: git filter-repo --path backend/admin.txt --invert-paths.
5Force a atualização dos remotos somente após comunicar a equipe e exigir novos clones. Revogue credenciais antigas mesmo após a limpeza.
6Execute varredura abrangente de segredos em todo o repositório e no histórico; a checagem manual atual restringe-se a backend/src e frontend/src, portanto não teria detectado esse arquivo.

O arquivo backend/.env está ignorado e não consta no HEAD, o que é positivo. Contudo, ele acompanha o ZIP analisado. Não há evidência de exposição pública apenas por isso; ainda assim, se o pacote foi compartilhado em canais não controlados, trate os valores como potencialmente comprometidos e faça rotação preventiva.

5.2 Atlas e proteção operacional
Como o sistema processa identificadores pessoais e dados ligados à saúde e ao trabalho, a proteção operacional do Atlas precisa ser tratada como requisito técnico de primeira classe. Isto não é um parecer jurídico, mas os seguintes controles reduzem risco técnico:

Controle	Implementação prática
Princípio do menor privilégio	Criar usuário de banco exclusivo para a API, sem permissões administrativas globais.
Restrição de rede	Permitir somente redes/egress autorizados; evitar deixar o banco exposto de forma ampla quando houver alternativa.
Rotação e inventário	Manter segredos somente no gerenciador de ambiente do Render; documentar proprietário, data de rotação e finalidade.
Redação de logs	Nunca registrar CPF, CNS, tokens, conexão MongoDB, cookies ou payloads clínicos completos em logs de produção.
Backup e restauração	Habilitar backup compatível com o plano, definir RPO/RTO e executar uma restauração de teste.
Trilhas de auditoria	Registrar quem acessou/alterou registros, com requestId, sem duplicar dados sensíveis no log.


6. Backend, Atlas e health checks
A função de conexão atual captura o erro de Atlas, agenda nova tentativa e retorna sem propagar a falha. Em seguida, app.ts pode executar seeds e o servidor já pode responder 200 em /health, embora o Mongoose não esteja conectado. Isso produz um falso positivo operacional.

A solução recomendada é separar os conceitos:

Endpoint/estado	Objetivo	Deve depender do Atlas?
/health ou /live	Informar que o processo Node está em execução.	Não.
/ready	Informar que a API está apta a receber tráfego de negócio.	Sim; deve validar conexão do Mongoose e dependências mínimas.
Métrica/monitor	Informar latência, erros e estado de integrações.	Não deve bloquear o processo, mas deve expor status por dependência.
O servidor deve fazer await connectDB() antes de iniciar app.listen(). Se a conexão inicial falhar, o processo deve encerrar com código diferente de zero para que o Render reinicie ou alerte, em vez de servir uma API parcialmente disponível. Reconexão posterior pode ser tratada por eventos de conexão do Mongoose, mas seeds só devem executar após conexão confirmada.

No render.yaml, inclua explicitamente um health check, por exemplo healthCheckPath: /ready, depois de implementar esse endpoint. A liveness pode permanecer em /health; não faça a liveness depender dos mocks, pois isso transformaria uma dependência externa em reinício desnecessário do backend.



7. Qualidade, testes e dependências
7.1 Situação das validações executadas
Área	Resultado	Próxima providência
Backend TypeScript	Build concluído.	Manter como gate obrigatório.
Backend Jest	44 de 45 testes passaram.	Corrigir o teste CADSUS antes de qualquer promoção.
Backend cobertura	89,24% statements / 86,4% branches nos arquivos exercitados.	Definir meta por camada e cobrir rotas, autorização, banco e SINAN.
Frontend build	Vite gerou bundle.	Não considerar o build isolado como aprovação de qualidade.
Frontend type-check	112 erros.	Corrigir todos; o workflow CI já prevê bloqueio por type-check.
Lint	Não foi encontrada configuração ESLint executável na validação.	Versionar eslint.config.* ou .eslintrc.* e transformar avisos relevantes em falhas.
Frontend testes	Não há script de testes no package.json.	Adicionar Vitest + Testing Library e Playwright/Cypress para fluxos críticos.
Dependências	9 vulnerabilidades no backend e 5 no frontend, incluindo severidades altas.	Atualizar, testar e revisar breaking changes.
O teste CADSUS falha porque ele espera que createApiClient seja chamado, mas o serviço singleton é criado durante o import; a chamada ocorre antes da asserção. Refatore os serviços para aceitar um cliente HTTP via construtor/fábrica, ou ajuste o ciclo de imports/mocks. A primeira opção é preferível, pois torna o código mais testável e permite políticas diferentes por provedor.

7.2 Passo a passo de atualização de dependências
7Crie uma branch exclusiva, como chore/security-dependencies-2026-07.
8Em backend e frontend, rode primeiro npm audit fix sem --force.
9Revise package.json e package-lock.json; não aplique atualizações principais cegamente.
10Rode npm run build, npm test, npm run type-check e npm run lint em ambos os projetos.
11Para qualquer atualização maior que exija --force, abra PR separado, leia notas de versão e cubra o comportamento afetado com testes.
12Faça deploy primeiro em staging, execute a matriz de integração e somente então promova para produção.

A atualização merece atenção especial para axios, nodemailer, joi, express/qs e react-router-dom, pois a auditoria local apontou vulnerabilidades em seus intervalos instalados ou transitivos.



8. Roteiro recomendado de execução
Etapa 0 — Contenção e recuperação de acesso (hoje)
13Revogar/redefinir a credencial administrativa exposta e verificar logs de autenticação/auditoria.
14Rotacionar JWT_SECRET, refresh secret, credencial Atlas, senha/chave de e-mail e tokens de integração que possam ter acompanhado arquivos compartilhados.
15Remover backend/admin.txt do repositório e do histórico, atualizar .gitignore e executar varredura de segredos no repositório inteiro.
16Verificar no Atlas se existe conta administrativa de teste/seed em produção; remover contas de demonstração e exigir senha forte no primeiro uso.

Critério de aceite: nenhum segredo ativo permanece em arquivo versionado; a conta exposta não autentica mais; histórico e pipeline passam em scan de segredo.

Etapa 1 — Restabelecer a cadeia de produção (hoje/amanhã)
17No painel do Render, localize os serviços pelo nome e confirme qual deles é o backend oficial. Não escolha pelo hostname apenas.
18Reative, reimplante ou recrie o backend oficial; confirme que a rota raiz e /health retornam JSON da API.
19Reative/reimplante CADSUS, SIH, CNES, SINAN e e-Social. Registre os URLs finais numa tabela de inventário de ambientes.
20No Render do backend, configure todas as variáveis necessárias: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN, as cinco URLs MS_*_API_URL e os tokens/chaves correspondentes. Configure especificamente MS_ESOCIAL_API_URL, hoje ausente no ambiente analisado.
21Atualize frontend/vercel.json para apontar exatamente para o backend oficial. Mantenha o destino com /api/$1 se o backend continuar expondo as rotas nesse prefixo.
22Faça deploy do frontend após o backend e valide: /api/health, login, refresh token e uma rota autenticada.

Critério de aceite: https://sispnaist-1-0.vercel.app/api/health retorna 200 e o mesmo timestamp/formato do endpoint https://<backend-oficial>/api/health.

Etapa 2 — Tornar o serviço realmente pronto (1–3 dias)
23Refatore a conexão Atlas para falhar de forma explícita na inicialização e iniciar o listener somente após conexão confirmada.
24Implemente /live e /ready; configure health check do Render para /ready.
25Adicione logs estruturados, requestId e métricas por dependência — duração, status, timeout, retry e circuito aberto — sem registrar PII.
26Crie monitoramento externo para frontend, /ready, /api/health e health checks de cada mock. Configure alerta para 5xx, latência e disponibilidade.
27Centralize URLs e nomes de ambientes em uma matriz documentada: desenvolvimento, staging e produção. Não use URLs de mock como se fossem produção real.

Critério de aceite: desligar temporariamente Atlas em staging torna /ready indisponível; /live continua respondendo; alertas são disparados; recuperação é visível nos logs.

Etapa 3 — Endurecer as integrações (3–5 dias)
28Padronize a resposta de sucesso/erro e corrija o fallback de mensagem no frontend.
29Crie uma interface para cada provedor e injete ApiClient/configuração no construtor do serviço; remova dependência de singletons globais em testes.
30Defina timeout total, retry, backoff com jitter e circuit breaker por integração. Consultas podem repetir de modo limitado; operações de escrita não devem ser repetidas sem idempotência.
31Adicione schema validation para respostas externas (por exemplo, Joi/Zod), pois um payload malformado não deve chegar às telas ou ao Atlas.
32No SINAN, adote Idempotency-Key, trate duplicidade e teste reenvio após timeout.
33Proteja mocks de staging com token/chave e introduza modos de falha controlados: 401, 404, 429, 500, 503, timeout, JSON inválido e dados ausentes.

Critério de aceite: a matriz abaixo roda automaticamente em staging e não aceita regressão.

Cenário	Resultado esperado
Consulta válida em cada integração	Dados adaptados no contrato interno e resposta 200.
Registro não encontrado	404 com code e message padronizados.
Provedor 429/503	Retry limitado, telemetria registrada e resposta rápida/explicável.
Timeout	Sem espera excessiva; 504 ou 503 padronizado conforme política.
Token inválido no mock	401/403, sem vazamento de detalhes.
JSON inválido do provedor	502/503 controlado, sem quebra da tela.
Reenvio SINAN	Nenhuma duplicidade; resposta idempotente.
Etapa 4 — Qualidade e entrega confiável (5–10 dias)
34Corrija os 112 erros de TypeScript do frontend por domínio/módulo, sem desligar o type-check.
35Corrija o teste CADSUS e adicione testes para SINAN, rotas, controladores, autenticação, RBAC, CSRF, upload, Atlas em falha e erro de integração.
36Adicione testes de frontend: componentes/serviços com Vitest, e2e de login e importação com Playwright ou Cypress.
37Versione configuração do ESLint e Prettier; faça lint, type-check, testes, cobertura mínima e npm audit bloquearem a promoção.
38Garanta que Vercel e Render façam deploy somente a partir do commit aprovado pelo CI. Investigue por que o artefato publicado não condiz com o gate de type-check atual.
39Atualize dependências em PRs pequenos, com changelog e regressão em staging.

Critério de aceite: nenhuma etapa de CI é ignorada; zero erros de type-check; testes críticos verdes; deploy recebe somente artefato de commit aprovado.

Etapa 5 — Governança contínua (após estabilização)
40Mantenha inventário de integrações com dono, URL por ambiente, método de autenticação, SLA, dados trafegados e plano de fallback.
41Execute revisão mensal de dependências e de segredos; execute exercícios trimestrais de restauração do Atlas.
42Documente retenção, exportação, auditoria e resposta a incidentes para os dados tratados. Para requisitos regulatórios específicos, valide o desenho com o responsável de segurança/privacidade e assessoria jurídica da organização.
43Faça uma revisão de segurança antes de substituir mocks por APIs reais, especialmente para CPF, CNS, dados de saúde e notificações.



9. Ordem prática de execução
Se houver pouco tempo, execute na seguinte ordem e não pule o primeiro bloco:

Ordem	Entrega	Motivo
1	Revogação de credenciais + remoção do arquivo exposto	Reduz o risco mais grave imediatamente.
2	Reativação do backend e correção do rewrite Vercel	Restaura a espinha dorsal do sistema.
3	Reativação/configuração dos cinco mocks, incluindo e-Social	Permite testar as integrações novamente.
4	Health/readiness Atlas e monitoramento	Evita falso “OK” e acelera diagnóstico.
5	Contratos de erro, timeout/retry e idempotência	Torna a integração previsível para usuário e operação.
6	TypeScript, testes, lint e CI obrigatório	Impede que regressões retornem à produção.
7	Dependências, governança e hardening dos mocks	Consolida segurança e sustentabilidade.


10. Limites da auditoria
A análise foi feita de forma não destrutiva e não alterou Render, Vercel, Atlas ou credenciais. Não houve acesso aos painéis desses provedores, aos logs de produção, ao repositório remoto, aos workflows em execução nem aos dados do MongoDB. Por essa razão, o relatório identifica resultados observáveis e riscos no código, mas não atribui a causa administrativa da suspensão dos serviços. A confirmação final de plano, cobrança, ownership, variáveis ativas, logs e regras de rede deve ser feita nos respectivos painéis.



Referências públicas
Evidências locais entregues com este relatório
Além deste documento, foram preservados os registros de disponibilidade, contratos locais e validações de qualidade em arquivos de apoio. Eles não contêm valores de segredo e permitem reproduzir os principais achados: achados_tecnicos.md, achados_ambiente_publico.md, http_probe_2026-07-23.txt e local_mock_contract_result.txt.