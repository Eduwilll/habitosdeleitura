# Hábitos de Leitura 📚

Um aplicativo React Native para ajudar você a desenvolver e manter hábitos de leitura saudáveis. O aplicativo permite explorar livros, gerenciar sua biblioteca pessoal, acompanhar seu progresso de leitura e receber lembretes personalizados.

## ✨ Funcionalidades

- **Exploração de Livros**
  - Descubra livros populares no Brasil
  - Busca por título, autor ou gênero
  - Visualização detalhada de informações do livro
  - Categorização por gêneros literários

- **Biblioteca Pessoal**
  - Adicione livros à sua biblioteca
  - Organize por status (Lendo, Concluído, Para Ler)
  - Acompanhe seu progresso de leitura
  - Visualize estatísticas de leitura

- **Lembretes de Leitura**
  - Configure lembretes personalizados
  - Escolha dias e horários específicos
  - Notificações para manter o hábito

- **Perfil do Usuário**
  - Gerenciamento de conta
  - Estatísticas de leitura
  - Personalização de preferências

## 🚀 Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- SQLite (armazenamento local)
- Google Books API
- Expo Notifications
- Expo Router

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Expo CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas macOS)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Eduwilll/habitosdeleitura.git
cd habitosdeleitura
```

2. Instale as dependências:
   ```bash
   npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave da API do Google Books:
   ```
   GOOGLE_BOOKS_API_KEY=sua_chave_aqui
   ```

4. Inicie o projeto:
   ```bash
npm start
# ou
yarn start
```

## 📱 Executando o Aplicativo

### Android
```bash
npm run android
# ou
yarn android
```

### iOS
```bash
npm run ios
# ou
yarn ios
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa o aplicativo no Android
- `npm run ios` - Executa o aplicativo no iOS
- `npm run web` - Executa o aplicativo na web
- `npm run lint` - Executa a verificação de código
- `npm run reset-project` - Reseta o projeto para o estado inicial

## 📦 Estrutura do Projeto

```
habitosdeleitura/
├── .expo/                  # Configurações do Expo
├── .vscode/               # Configurações do VS Code
├── app/                   # Rotas e telas do aplicativo
│   ├── (auth)/           # Telas de autenticação
│   ├── (tabs)/           # Telas principais
│   └── book-details.tsx  # Tela de detalhes do livro
├── assets/               # Recursos estáticos (imagens, fontes, etc.)
├── components/           # Componentes reutilizáveis
├── constants/           # Constantes e configurações
├── contexts/            # Contextos do React
├── db-viewer-server/    # Servidor para visualização do banco de dados
├── hooks/               # Custom hooks do React
├── node_modules/        # Dependências do projeto
├── scripts/             # Scripts utilitários
├── services/            # Serviços e APIs
├── styles/              # Estilos globais
├── .gitignore          # Configuração do Git
├── app.json            # Configuração do Expo
├── copy-db.js          # Script para cópia do banco de dados
├── eas.json            # Configuração do EAS Build
├── eslint.config.js    # Configuração do ESLint
├── expo-env.d.ts       # Definições de tipos do Expo
├── package.json        # Dependências e scripts do projeto
├── tsconfig.json       # Configuração do TypeScript
└── README.md           # Documentação do projeto
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email ou abra uma issue no GitHub.

## 🙏 Agradecimentos

- Google Books API por fornecer dados de livros
- Comunidade Expo por suas ferramentas incríveis
- Todos os contribuidores do projeto

---
Desenvolvido com ❤️ para incentivar a leitura no Brasil
