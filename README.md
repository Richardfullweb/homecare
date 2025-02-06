# CareConnect - Plataforma de Cuidadores

![CareConnect Logo](public/assets/images/default-avatar.png)

CareConnect é uma plataforma inovadora que conecta cuidadores profissionais a clientes que necessitam de serviços de cuidado. Com uma interface moderna e funcionalidades completas, o sistema facilita o agendamento, pagamento e avaliação de serviços de cuidado.

## Funcionalidades Principais

### Para Clientes
- **Busca de Cuidadores**: Encontre cuidadores disponíveis com base em localização, especialização e avaliações
- **Agendamento**: Solicite agendamentos com data, horário e detalhes específicos
- **Pagamento**: Realize pagamentos seguros diretamente na plataforma
- **Avaliação**: Avalie os serviços recebidos após a conclusão
- **Dashboard**: Acompanhe seus agendamentos, pagamentos e histórico de serviços

### Para Cuidadores
- **Perfil Profissional**: Crie e gerencie seu perfil com informações profissionais
- **Agenda**: Gerencie seus agendamentos e disponibilidade
- **Notificações**: Receba notificações em tempo real sobre novos agendamentos
- **Pagamentos**: Acompanhe seus ganhos e recebimentos
- **Avaliações**: Veja e gerencie suas avaliações recebidas

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- Tailwind CSS
- Chakra UI
- React Router

### Backend
- Firebase Authentication
- Firestore Database
- Firebase Cloud Functions

### Ferramentas de Desenvolvimento
- Vite
- ESLint
- Prettier
- Husky

## Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- NPM ou Yarn
- Conta no Firebase

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/careconnect.git
   cd careconnect
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Adicione as credenciais do Firebase no arquivo `.env`
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
careconnect/
├── public/             # Arquivos estáticos
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços e APIs
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Utilitários
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
├── .env                # Variáveis de ambiente
├── firestore.rules     # Regras de segurança do Firestore
├── package.json        # Dependências e scripts
├── tailwind.config.js  # Configuração do Tailwind CSS
└── vite.config.ts      # Configuração do Vite
```

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Wagner - wagner@example.com

Link do Projeto: [https://github.com/seu-usuario/careconnect](https://github.com/seu-usuario/careconnect)
