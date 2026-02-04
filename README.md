# 🛋️ Estofaria — Sistema Web Completo

Sistema de site + painel administrativo para estofaria com portfolio, agenda, simulador de tecido com IA e notificações.

---

## Estrutura do Projeto

```
estofaria/
├── docker-compose.yml
├── .env.example
├── docker/
│   └── mysql-init.sql
├── backend/          
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js  
│       ├── db.js     
│       ├── middleware/
│       │   └── auth.js         
│       ├── routes/
│       │   ├── auth.js         
│       │   ├── portfolio.js    
│       │   ├── appointments.js 
│       │   ├── fabrics.js      
│       │   └── simulations.js  
│       └── utils/
│           └── upload.js       
└── frontend/                   
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   ├── index.html
    │   ├── manifest.json       
    │   └── serviceWorker.js   
    └── src/
        ├── App.js             
        ├── index.js
        ├── styles/
        │   └── global.css     
        ├── services/
        │   ├── api.js         
        │   └── swRegister.js   
        ├── components/
        │   ├── Navbar.js       
        │   ├── AdminLayout.js  
        │   └── WhatsAppButton.js
        └── pages/
            ├── Home.js         
            ├── Gallery.js      
            └── admin/
                ├── Login.js
                ├── Dashboard.js
                ├── Portfolio.js
                ├── Agenda.js
                ├── Simulator.js
                └── Fabrics.js
```

---

### 1. Pré-requisitos no servidor
- Docker + Docker Compose instalados
- Porta 80 e 443 livres (para o Traefik)
- Domínio apontando para o IP do servidor (DNS)

### 2. Clone e configure

```bash
# clone o projeto no servidor
git clone <seu-repo> /opt/estofaria
cd /opt/estofaria

# crie o .env a partir do exemplo
cp .env.example .env
```

### 3. Edite o `.env`

```bash
nano .env
```

Preenche:
- `DOMAIN` → seu domínio real (ex: `estofaria.com.br`)
- `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` → senhas fortes
- `JWT_SECRET` → gere com `openssl rand -hex 32`
- `OPENAI_API_KEY` → sua chave da OpenAI (necessária para o simulador)

### 4. Instale dependências do backend

```bash
cd backend
npm install
cd ..
```

### 5. Suba os containers

```bash
docker compose up -d --build
```

### 6. Verifique

```bash
docker compose ps
# todos devem estar "running"

# teste o backend
curl https://seu-dominio.com.br/api/health
# deve retornar: {"ok":true}
```

### 7. Primeiro acesso (criar usuário admin)

1. Acesse `https://seu-dominio.com.br/admin/login`
2. Clique **"Criar conta (primeiro uso)"**
3. Preenche nome, email e senha
4. Após criar, faz login normalmente

---

## Notificações (30 min antes)

O sistema usa **Service Worker + Notification API** (funciona como PWA no celular):

1. Ao fazer login no painel admin, o navegador pede permissão de notificação
2. O Service Worker chama `/api/appointments/upcoming` a cada 2 minutos
3. Se um agendamento está a ≤ 30 min → dispara notificação nativa
4. No celular: instale o site como app (botão "Adicionar à tela de início") para funcionar mesmo com a aba fechada

---

## Simulador de Tecido

Usa a API da **OpenAI** (GPT-4o + DALL·E 3):

1. O admin envia a foto do sofá do cliente e seleciona/envia o tecido
2. O backend envia ambas as imagens para o GPT-4o que descreve como ficaria
3. A descrição é usada pelo DALL·E 3 para gerar uma imagem realista
4. A imagem gerada é exibida ao lado das originais

> ⚠️ Cada simulação consome tokens da OpenAI. Custo médio: ~$0.05–0.10 por simulação.

---

## Comandos úteis

```bash
# ver logs
docker compose logs -f backend
docker compose logs -f frontend

# reiniciar um serviço
docker compose restart backend

# derrubar tudo
docker compose down

# backup do banco
docker exec estofaria_mysql mysqldump -u root -pSENHA estofaria > backup.sql
```

---

## Customização

| O que mudar | Onde |
-----------------------
| Número WhatsApp | `frontend/src/components/WhatsAppButton.js` → `WHATSAPP_NUMBER` |
| Nome da estofaria | `global.css` não precisa mudar; muda nos componentes onde aparece "Estofaria" |
| Cores do tema | `frontend/src/styles/global.css` → variáveis CSS `:root` |
| Serviços/categorias | `docker/mysql-init.sql` → tabela `categories` |

---

## Segurança

- Traefik cuida do SSL (Let's Encrypt automático)
- JWT com expiração de 7 dias
- Senhas hasheadas com bcrypt
- Uploads limitados a 10 MB, apenas imagens
- Backend rodan como usuário não-root no container
