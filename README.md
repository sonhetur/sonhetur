# SonheTur — Sistema Web e Painel Administrativo de Viagens e Turismo

Plataforma profissional, moderna, elegante e responsiva desenvolvida para a agência de viagens **SonheTur**, especializada em turismo, excursões e experiências de viagem com embarque e atuação no **Vale do Aço, Minas Gerais**.

---

## 1. Identidade e Regras Institucionais

- **Nome da Empresa:** SonheTur
- **E-mail Administrativo:** sonhetur@gmail.com
- **Telefone / WhatsApp de Atendimento:** (31) 9912-6011
- **Região de Atuação:** Vale do Aço, Minas Gerais
- **Cores Oficiais:** Azul Marinho Profundo (`#071A33`), Azul Petróleo (`#0B2545`), Azul Acento (`#2D6FA3`) e Dourado Sutil (`#D4AF37`).
- **Diretriz de Integridade de Dados:** O sistema não utiliza dados inventados (sem viagens fictícias, fotos falsas de viagens, avaliações ou depoimentos fabricados). Todas as seções públicas possuem estados vazios elegantes preparados para receber os roteiros oficiais cadastrados pela administração.

---

## 2. Acesso à Área Administrativa

O painel administrativo foi projetado para ser seguro, prático e reservado:

1. **Acesso Direto:**
   - Clique no link discreto **"Área Administrativa"** no rodapé do site ou acerte a rota com `#admin` na URL (ex: `https://seu-dominio/#admin`).
2. **Primeiro Acesso (Setup de Senha Master):**
   - O e-mail administrativo oficial é `sonhetur@gmail.com`.
   - No primeiro acesso, o sistema detecta que nenhuma senha inicial foi definida e abre a tela de **Criação de Senha Administrativa**.
   - Defina uma senha segura de no mínimo 6 caracteres.
   - A senha é gravada de forma criptografada usando algoritmo criptográfico seguro (PBKDF2 com Salt aleatório de 16 bytes e 10.000 iterações). **Nenhuma senha em texto puro é armazenada ou exposta no código-fonte**.
3. **Logins Futuros:**
   - Insira o e-mail `sonhetur@gmail.com` e a senha definida.
   - A sessão é mantida por token seguro em `sessionStorage`.
4. **Troca de Senha:**
   - Pode ser realizada a qualquer momento no menu **Configurações** do painel administrativo.

---

## 3. Funcionalidades do Painel Administrativo

O painel oferece controle total sobre todos os dados do site:

- **Dashboard:**
  - Métricas em tempo real de viagens publicadas, rascunhos, encerradas e mensagens de contato.
  - Acesso rápido aos contatos recentes e viagens cadastradas.
- **Gerenciador de Viagens (CRUD Completo):**
  - Cadastro de título, destino, resumo, descrição completa e foto principal (URL ou upload direto).
  - Galeria de fotos adicionais.
  - Datas de ida, volta e duração formatada (dias/noites).
  - Ponto de embarque no Vale do Aço (ex: Ipatinga, Coronel Fabriciano, Timóteo).
  - Valor (R$) e número de vagas disponíveis.
  - Roteiro programado dia a dia.
  - Itens inclusos (transporte, hospedagem, café, seguro, guia, etc.) e não inclusos.
  - Formas de pagamento, observações e status (**Rascunho**, **Publicada** ou **Encerrada**).
  - Pré-visualização da viagem no site.
- **Gerenciador de Destinos:**
  - Criação e organização de destinos turísticos com imagem de capa e descrição.
- **Gerenciador de Banners:**
  - Configuração do carrossel/banner principal do topo do site.
  - Título de impacto, subtítulo, botão com chamada para ação, link e status ativo/inativo.
- **Gerenciador de Conteúdo Institucional:**
  - Edição do slogan, texto principal da página inicial, texto institucional "Sobre a SonheTur", missão, visão e diferenciais.
- **Central de Contatos e Mensagens:**
  - Recebimento de mensagens enviadas pelo formulário público do site.
  - Vinculação automática com a viagem de interesse do cliente.
  - Botão de **Resposta Rápida via WhatsApp**, abrindo conversa com texto pré-formatado com o nome do cliente e a viagem consultada.
  - Gestão de status da mensagem: *Nova*, *Lida* e *Respondida*.
- **Configurações Gerais:**
  - Atualização dos dados de contato (telefone, WhatsApp, e-mail institucional, endereço/cidade).
  - Redes sociais (Instagram, Facebook).
  - Alteração da senha de acesso administrativo.

---

## 4. Funcionalidades Públicas para os Clientes

- **Página Inicial:**
  - Apresentação sofisticada da marca SonheTur com foco no turismo de excursão no Vale do Aço.
  - Busca e filtro dinâmico de viagens por destino.
- **Cards de Viagens:**
  - Indicadores visuais de status (*Vagas Abertas*, *Últimas Vagas*, *Encerrada*).
  - Detalhes de embarque, duração, datas e preço formatado em Reais (R$).
  - Botão direto **"Tenho Interesse"**, que abre o WhatsApp oficial com mensagem pronta indicando o nome da viagem.
  - Botão **"Ver Detalhes"**, que abre a página completa da viagem.
- **Página de Detalhes da Viagem:**
  - Galeria de fotos, cronograma detalhado do roteiro, lista de inclusos/não inclusos, dados de embarque e formas de pagamento.
  - Botão fixo de contato e reserva pelo WhatsApp.
- **Seção Sobre a Empresa:**
  - Apresentação dos pilares de segurança, conforto, organização e atendimento personalizado.
- **Formulário de Contato:**
  - Envio de dúvidas com validação de campos e integração de envio para o banco de dados do painel.
- **Botão Flutuante do WhatsApp:**
  - Acesso imediato ao canal oficial de atendimento em qualquer dispositivo.

---

## 5. Estrutura Técnica

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React Icons.
- **Backend:** Node.js Express integrado ao Vite.
- **Persistência de Dados:** Arquivo de armazenamento seguro `data/store.json` com backup automático e inicialização com os dados oficiais da SonheTur.
- **Segurança:** Criptografia PBKDF2 com Salt para credenciais, sanitização de requisições e isolamento de rotas administrativas com verificação de Bearer token.
