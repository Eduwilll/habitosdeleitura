export const strings = {
    // Auth
    auth: {
      login: {
        title: 'Nome do Aplicativo',
        userPlaceholder: 'Usuario',
        passwordPlaceholder: 'Senha',
        loginButton: 'Entrar',
        registerLink: 'Não tem uma conta? Registre-se',
        errorEmptyFields: 'Preencha todos os campos',
        errorInvalidCredentials: 'Credenciais inválidas',
        errorLoginFailed: 'Falha ao fazer login',
      },
      register: {
        title: 'Registro',
        usernamePlaceholder: 'Nome de usuário',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Senha',
        confirmPasswordPlaceholder: 'Confirmar senha',
        registerButton: 'Registrar',
        loginLink: 'Já tem uma conta? Entre',
        errorEmptyFields: 'Preencha todos os campos',
        errorPasswordsDontMatch: 'As senhas não coincidem',
        errorRegistrationFailed: 'Falha ao registrar',
      },
    },
  
    // Profile
    profile: {
      title: 'Perfil',
      accountInfo: 'Informações da Conta',
      username: 'Nome de Usuário',
      email: 'Email',
      logout: {
        button: 'Sair',
        confirmTitle: 'Sair',
        confirmMessage: 'Tem certeza que deseja sair?',
        cancel: 'Cancelar',
        confirm: 'Sair',
      },
    },
  
    // Library
    library: {
      title: 'Biblioteca',
      addBook: 'Adicionar Livro',
      searchPlaceholder: 'Buscar livros...',
      noBooks: 'Nenhum livro encontrado',
      errorLoadingBooks: 'Falha ao carregar livros da biblioteca.',
      errorUpdatingStatus: 'Falha ao atualizar status do livro.',
      errorRemovingBook: 'Falha ao remover livro da biblioteca.',
      filters: {
        all: 'Todos',
        reading: 'Lendo',
        completed: 'Concluídos',
        toRead: 'Para Ler'
      },
      bookDetails: {
        title: 'Detalhes do Livro',
        author: 'Autor',
        pages: 'Páginas',
        currentPage: 'Página Atual',
        progress: 'Progresso',
        lastRead: 'Última Leitura',
        readingTime: 'Tempo de Leitura',
        save: 'Salvar',
        delete: 'Excluir',
        deleteConfirmTitle: 'Excluir Livro',
        deleteConfirmMessage: 'Tem certeza que deseja excluir este livro?',
        deleteConfirmCancel: 'Cancelar',
        deleteConfirmDelete: 'Excluir',
      },
    },
  
    // Reading Reminders
    reminders: {
      title: 'Lembretes de Leitura',
      addReminder: 'Adicionar Lembrete',
      editReminder: 'Editar Lembrete',
      deleteReminder: 'Excluir Lembrete',
      time: 'Horário',
      days: 'Dias',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      deleteConfirmTitle: 'Excluir Lembrete',
      deleteConfirmMessage: 'Tem certeza que deseja excluir este lembrete?',
      deleteConfirmCancel: 'Cancelar',
      deleteConfirmDelete: 'Excluir',
      notificationTitle: 'Hora de Ler!',
      notificationBody: 'Hora de ler seu livro!',
    },
  
    // Common
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      search: 'Buscar',
      noResults: 'Nenhum resultado encontrado',
    },
  } as const;
  
  // Type for accessing strings
  export type StringKeys = keyof typeof strings;