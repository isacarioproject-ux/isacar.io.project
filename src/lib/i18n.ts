// Sistema i18n completo - Suporte PT-BR, EN, ES
export type Locale = 'pt-BR' | 'en' | 'es'

interface Translations {
  [key: string]: {
    [locale in Locale]: string
  }
}

// ⚠️ IMPORTANTE: Este arquivo contém traduções PARCIAIS
// Para adicionar mais, edite este arquivo e adicione novas chaves no formato:
// 'categoria.chave': { 'pt-BR': 'Texto PT', 'en': 'Text EN', 'es': 'Texto ES' }

const translations: Translations = {
  // ===== NAVIGATION =====
  'nav.dashboard': { 'pt-BR': 'Painel', 'en': 'Dashboard', 'es': 'Panel' },
  'nav.projects': { 'pt-BR': 'Projetos', 'en': 'Projects', 'es': 'Proyectos' },
  'nav.documents': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'nav.team': { 'pt-BR': 'Equipe', 'en': 'Team', 'es': 'Equipo' },
  'nav.analytics': { 'pt-BR': 'Analytics', 'en': 'Analytics', 'es': 'Análisis' },
  'nav.invites': { 'pt-BR': 'Convites', 'en': 'Invites', 'es': 'Invitaciones' },
  'nav.settings': { 'pt-BR': 'Configurações', 'en': 'Settings', 'es': 'Configuración' },

  // ===== COMMON =====
  'common.loading': { 'pt-BR': 'Carregando...', 'en': 'Loading...', 'es': 'Cargando...' },
  'common.error': { 'pt-BR': 'Erro', 'en': 'Error', 'es': 'Error' },
  'common.success': { 'pt-BR': 'Sucesso', 'en': 'Success', 'es': 'Éxito' },
  'common.save': { 'pt-BR': 'Salvar', 'en': 'Save', 'es': 'Guardar' },
  'common.cancel': { 'pt-BR': 'Cancelar', 'en': 'Cancel', 'es': 'Cancelar' },
  'common.close': { 'pt-BR': 'Fechar', 'en': 'Close', 'es': 'Cerrar' },
  'common.delete': { 'pt-BR': 'Excluir', 'en': 'Delete', 'es': 'Eliminar' },
  'common.edit': { 'pt-BR': 'Editar', 'en': 'Edit', 'es': 'Editar' },
  'common.create': { 'pt-BR': 'Criar', 'en': 'Create', 'es': 'Crear' },
  'common.search': { 'pt-BR': 'Buscar', 'en': 'Search', 'es': 'Buscar' },
  'common.noResults': { 'pt-BR': 'Nenhum resultado encontrado', 'en': 'No results found', 'es': 'No se encontraron resultados' },
  'common.user': { 'pt-BR': 'Usuário', 'en': 'User', 'es': 'Usuario' },
  'common.saving': { 'pt-BR': 'Salvando...', 'en': 'Saving...', 'es': 'Guardando...' },
  'common.undo': { 'pt-BR': 'Desfazer', 'en': 'Undo', 'es': 'Deshacer' },
  'common.redo': { 'pt-BR': 'Refazer', 'en': 'Redo', 'es': 'Rehacer' },
  'common.select': { 'pt-BR': 'Selecionar', 'en': 'Select', 'es': 'Seleccionar' },
  'common.move': { 'pt-BR': 'Mover', 'en': 'Move', 'es': 'Mover' },
  'common.now': { 'pt-BR': 'Agora', 'en': 'Now', 'es': 'Ahora' },
  'common.minutesAgo': { 'pt-BR': 'm atrás', 'en': 'm ago', 'es': 'm atrás' },
  'common.hoursAgo': { 'pt-BR': 'h atrás', 'en': 'h ago', 'es': 'h atrás' },
  'common.daysAgo': { 'pt-BR': 'd atrás', 'en': 'd ago', 'es': 'd atrás' },
  'common.created': { 'pt-BR': 'Criado com sucesso!', 'en': 'Created successfully!', 'es': '¡Creado exitosamente!' },
  'common.updated': { 'pt-BR': 'Atualizado com sucesso!', 'en': 'Updated successfully!', 'es': '¡Actualizado exitosamente!' },

  // ===== AUTH =====
  'auth.login': { 'pt-BR': 'Entrar', 'en': 'Sign In', 'es': 'Iniciar sesión' },
  'auth.register': { 'pt-BR': 'Cadastrar', 'en': 'Sign Up', 'es': 'Registrarse' },
  'auth.logout': { 'pt-BR': 'Sair', 'en': 'Sign Out', 'es': 'Cerrar sesión' },
  'auth.email': { 'pt-BR': 'Email', 'en': 'Email', 'es': 'Correo electrónico' },
  'auth.password': { 'pt-BR': 'Senha', 'en': 'Password', 'es': 'Contraseña' },
  'auth.confirmPassword': { 'pt-BR': 'Confirmar senha', 'en': 'Confirm password', 'es': 'Confirmar contraseña' },
  'auth.fullName': { 'pt-BR': 'Nome completo', 'en': 'Full name', 'es': 'Nombre completo' },
  'auth.rememberMe': { 'pt-BR': 'Lembrar-me', 'en': 'Remember me', 'es': 'Recordarme' },
  'auth.acceptTerms': { 'pt-BR': 'Aceito os termos e condições', 'en': 'I accept the terms and conditions', 'es': 'Acepto los términos y condiciones' },
  'auth.forgotPassword': { 'pt-BR': 'Esqueceu a senha?', 'en': 'Forgot password?', 'es': '¿Olvidaste tu contraseña?' },
  'auth.resetPassword': { 'pt-BR': 'Recuperar Senha', 'en': 'Reset Password', 'es': 'Recuperar Contraseña' },
  'auth.resetInstructions': { 'pt-BR': 'Digite seu email para receber instruções', 'en': 'Enter your email to receive instructions', 'es': 'Ingresa tu correo para recibir instrucciones' },
  'auth.sendResetEmail': { 'pt-BR': 'Enviar email de recuperação', 'en': 'Send reset email', 'es': 'Enviar correo de recuperación' },
  'auth.backToLogin': { 'pt-BR': 'Voltar para login', 'en': 'Back to login', 'es': 'Volver al inicio' },
  'auth.orContinueWith': { 'pt-BR': 'ou continue com', 'en': 'or continue with', 'es': 'o continúa con' },
  'auth.loginWith': { 'pt-BR': 'Entrar com', 'en': 'Sign in with', 'es': 'Iniciar con' },
  'auth.validationError': { 'pt-BR': 'Erro de validação', 'en': 'Validation error', 'es': 'Error de validación' },
  'auth.fillCorrectly': { 'pt-BR': 'Preencha os campos corretamente', 'en': 'Fill in the fields correctly', 'es': 'Complete los campos correctamente' },
  'auth.loginError': { 'pt-BR': 'Erro ao fazer login', 'en': 'Error logging in', 'es': 'Error al iniciar sesión' },
  'auth.registerError': { 'pt-BR': 'Erro ao criar conta', 'en': 'Error creating account', 'es': 'Error al crear cuenta' },
  'auth.sessionError': { 'pt-BR': 'Não foi possível iniciar a sessão. Tente novamente.', 'en': 'Could not start session. Try again.', 'es': 'No se pudo iniciar sesión. Intenta de nuevo.' },
  'auth.loginSuccess': { 'pt-BR': 'Login realizado!', 'en': 'Login successful!', 'es': '¡Inicio de sesión exitoso!' },
  'auth.registerSuccess': { 'pt-BR': 'Conta criada com sucesso!', 'en': 'Account created successfully!', 'es': '¡Cuenta creada exitosamente!' },
  'auth.redirecting': { 'pt-BR': 'Redirecionando para o dashboard...', 'en': 'Redirecting to dashboard...', 'es': 'Redirigiendo al panel...' },
  'auth.checkEmail': { 'pt-BR': 'Verifique seu email para confirmar a conta.', 'en': 'Check your email to confirm your account.', 'es': 'Verifica tu correo para confirmar tu cuenta.' },
  'auth.unexpectedError': { 'pt-BR': 'Erro inesperado', 'en': 'Unexpected error', 'es': 'Error inesperado' },
  'auth.resetEmailSent': { 'pt-BR': 'Email enviado!', 'en': 'Email sent!', 'es': '¡Correo enviado!' },
  'auth.resetEmailCheck': { 'pt-BR': 'Verifique sua caixa de entrada para redefinir sua senha', 'en': 'Check your inbox to reset your password', 'es': 'Verifica tu bandeja de entrada para restablecer tu contraseña' },
  'auth.passwordRequirements': { 'pt-BR': 'Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial', 'en': 'Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special', 'es': 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 especial' },
  'auth.loggingIn': { 'pt-BR': 'Entrando...', 'en': 'Signing in...', 'es': 'Iniciando sesión...' },
  'auth.creatingAccount': { 'pt-BR': 'Criando conta...', 'en': 'Creating account...', 'es': 'Creando cuenta...' },
  'auth.sending': { 'pt-BR': 'Enviando...', 'en': 'Sending...', 'es': 'Enviando...' },
  'auth.alreadyHaveAccount': { 'pt-BR': 'Já tem uma conta?', 'en': 'Already have an account?', 'es': '¿Ya tienes una cuenta?' },
  'auth.noAccount': { 'pt-BR': 'Não tem uma conta?', 'en': "Don't have an account?", 'es': '¿No tienes una cuenta?' },

  // ===== PROJECTS =====
  'projects.title': { 'pt-BR': 'Projetos', 'en': 'Projects', 'es': 'Proyectos' },
  'projects.new': { 'pt-BR': 'Novo Projeto', 'en': 'New Project', 'es': 'Nuevo Proyecto' },
  'projects.create': { 'pt-BR': 'Criar Projeto', 'en': 'Create Project', 'es': 'Crear Proyecto' },
  'projects.edit': { 'pt-BR': 'Editar Projeto', 'en': 'Edit Project', 'es': 'Editar Proyecto' },
  'projects.name': { 'pt-BR': 'Nome do projeto', 'en': 'Project name', 'es': 'Nombre del proyecto' },
  'projects.description': { 'pt-BR': 'Descrição', 'en': 'Description', 'es': 'Descripción' },
  'projects.status': { 'pt-BR': 'Status', 'en': 'Status', 'es': 'Estado' },
  'projects.progress': { 'pt-BR': 'Progresso', 'en': 'Progress', 'es': 'Progreso' },
  'projects.client': { 'pt-BR': 'Cliente', 'en': 'Client', 'es': 'Cliente' },
  'projects.noProjects': { 'pt-BR': 'Nenhum projeto encontrado', 'en': 'No projects found', 'es': 'No se encontraron proyectos' },
  'projects.createFirst': { 'pt-BR': 'Crie seu primeiro projeto', 'en': 'Create your first project', 'es': 'Crea tu primer proyecto' },
  'projects.filter.all': { 'pt-BR': 'Todos', 'en': 'All', 'es': 'Todos' },
  'projects.filter.active': { 'pt-BR': 'Em Andamento', 'en': 'In Progress', 'es': 'En Progreso' },
  'projects.filter.completed': { 'pt-BR': 'Concluídos', 'en': 'Completed', 'es': 'Completados' },
  'projects.filter.paused': { 'pt-BR': 'Pausados', 'en': 'Paused', 'es': 'Pausados' },
  'projects.deleted': { 'pt-BR': 'Projeto excluído', 'en': 'Project deleted', 'es': 'Proyecto eliminado' },
  'projects.created': { 'pt-BR': 'Projeto criado com sucesso!', 'en': 'Project created successfully!', 'es': '¡Proyecto creado exitosamente!' },
  'projects.updated': { 'pt-BR': 'Projeto atualizado com sucesso!', 'en': 'Project updated successfully!', 'es': '¡Proyecto actualizado exitosamente!' },
  'projects.fillRequired': { 'pt-BR': 'Preencha todos os campos obrigatórios', 'en': 'Fill in all required fields', 'es': 'Complete todos los campos requeridos' },
  'projects.manage': { 'pt-BR': 'Gerencie todos os seus projetos', 'en': 'Manage all your projects', 'es': 'Gestiona todos tus proyectos' },
  'projects.deleting': { 'pt-BR': 'Excluindo projeto...', 'en': 'Deleting project...', 'es': 'Eliminando proyecto...' },
  'projects.deleteError': { 'pt-BR': 'Erro ao excluir projeto', 'en': 'Error deleting project', 'es': 'Error al eliminar proyecto' },
  'projects.stats.total': { 'pt-BR': 'Total de Projetos', 'en': 'Total Projects', 'es': 'Proyectos Totales' },
  'projects.stats.inProgress': { 'pt-BR': 'Em Andamento', 'en': 'In Progress', 'es': 'En Progreso' },
  'projects.stats.completed': { 'pt-BR': 'Concluídos', 'en': 'Completed', 'es': 'Completados' },
  'projects.empty.title': { 'pt-BR': 'Nenhum projeto ainda', 'en': 'No projects yet', 'es': 'Aún no hay proyectos' },
  'projects.empty.description': { 'pt-BR': 'Crie seu primeiro projeto para começar a organizar seu trabalho', 'en': 'Create your first project to start organizing your work', 'es': 'Crea tu primer proyecto para comenzar a organizar tu trabajo' },
  'projects.empty.action': { 'pt-BR': 'Criar Primeiro Projeto', 'en': 'Create First Project', 'es': 'Crear Primer Proyecto' },
  'projects.validationError': { 'pt-BR': 'Verifique os campos e tente novamente', 'en': 'Check the fields and try again', 'es': 'Verifica los campos e intenta de nuevo' },
  'projects.saveError': { 'pt-BR': 'Erro ao salvar projeto. Tente novamente mais tarde.', 'en': 'Error saving project. Try again later.', 'es': 'Error al guardar proyecto. Intenta más tarde.' },

  // ===== DOCUMENTS =====
  'documents.title': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'documents.upload': { 'pt-BR': 'Fazer Upload', 'en': 'Upload', 'es': 'Subir' },
  'documents.uploadNew': { 'pt-BR': 'Enviar Novo Documento', 'en': 'Upload New Document', 'es': 'Subir Nuevo Documento' },
  'documents.name': { 'pt-BR': 'Nome do documento', 'en': 'Document name', 'es': 'Nombre del documento' },
  'documents.category': { 'pt-BR': 'Categoria', 'en': 'Category', 'es': 'Categoría' },
  'documents.noDocuments': { 'pt-BR': 'Nenhum documento encontrado', 'en': 'No documents found', 'es': 'No se encontraron documentos' },
  'documents.uploadFirst': { 'pt-BR': 'Faça upload do seu primeiro documento', 'en': 'Upload your first document', 'es': 'Sube tu primer documento' },
  'documents.manage': { 'pt-BR': 'Todos os seus documentos organizados', 'en': 'All your documents organized', 'es': 'Todos tus documentos organizados' },
  'documents.deleteConfirm': { 'pt-BR': 'Tem certeza que deseja excluir este documento?', 'en': 'Are you sure you want to delete this document?', 'es': '¿Estás seguro de que quieres eliminar este documento?' },
  'documents.search': { 'pt-BR': 'Buscar documentos...', 'en': 'Search documents...', 'es': 'Buscar documentos...' },
  'documents.stats.total': { 'pt-BR': 'Total', 'en': 'Total', 'es': 'Total' },
  'documents.stats.totalDesc': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'documents.stats.storage': { 'pt-BR': 'Armazenamento', 'en': 'Storage', 'es': 'Almacenamiento' },
  'documents.stats.storageDesc': { 'pt-BR': 'Total usado', 'en': 'Total used', 'es': 'Total usado' },
  'documents.stats.thisWeek': { 'pt-BR': 'Esta Semana', 'en': 'This Week', 'es': 'Esta Semana' },
  'documents.stats.thisWeekDesc': { 'pt-BR': 'Novos uploads', 'en': 'New uploads', 'es': 'Nuevas subidas' },
  'documents.stats.shared': { 'pt-BR': 'Compartilhados', 'en': 'Shared', 'es': 'Compartidos' },
  'documents.stats.sharedDesc': { 'pt-BR': 'Com a equipe', 'en': 'With team', 'es': 'Con el equipo' },
  'documents.empty.title': { 'pt-BR': 'Nenhum documento ainda', 'en': 'No documents yet', 'es': 'Aún no hay documentos' },
  'documents.empty.description': { 'pt-BR': 'Faça upload de PDFs, documentos Word, planilhas Excel e mais', 'en': 'Upload PDFs, Word documents, Excel spreadsheets and more', 'es': 'Sube PDFs, documentos Word, hojas de cálculo Excel y más' },
  'documents.uploading': { 'pt-BR': 'Fazendo upload...', 'en': 'Uploading...', 'es': 'Subiendo...' },
  'documents.selectedFile': { 'pt-BR': 'Arquivo selecionado', 'en': 'Selected file', 'es': 'Archivo seleccionado' },
  'documents.acceptedTypes': { 'pt-BR': 'Tipos aceitos: PDF, Word, Excel, PowerPoint, Imagens', 'en': 'Accepted types: PDF, Word, Excel, PowerPoint, Images', 'es': 'Tipos aceptados: PDF, Word, Excel, PowerPoint, Imágenes' },
  'documents.created': { 'pt-BR': 'Documento criado com sucesso!', 'en': 'Document created successfully!', 'es': '¡Documento creado exitosamente!' },
  'documents.updated': { 'pt-BR': 'Documento atualizado com sucesso!', 'en': 'Document updated successfully!', 'es': '¡Documento actualizado exitosamente!' },
  'documents.saveError': { 'pt-BR': 'Erro ao salvar documento', 'en': 'Error saving document', 'es': 'Error al guardar documento' },

  // ===== TEAM =====
  'team.title': { 'pt-BR': 'Equipe', 'en': 'Team', 'es': 'Equipo' },
  'team.members': { 'pt-BR': 'Membros', 'en': 'Members', 'es': 'Miembros' },
  'team.invite': { 'pt-BR': 'Convidar Membro', 'en': 'Invite Member', 'es': 'Invitar Miembro' },
  'team.inviteNew': { 'pt-BR': 'Convidar Novo Membro', 'en': 'Invite New Member', 'es': 'Invitar Nuevo Miembro' },
  'team.noMembers': { 'pt-BR': 'Nenhum membro encontrado', 'en': 'No members found', 'es': 'No se encontraron miembros' },
  'team.inviteFirst': { 'pt-BR': 'Convide seu primeiro membro', 'en': 'Invite your first member', 'es': 'Invita a tu primer miembro' },
  'team.role': { 'pt-BR': 'Cargo', 'en': 'Role', 'es': 'Rol' },
  'team.sendInvite': { 'pt-BR': 'Enviar Convite', 'en': 'Send Invite', 'es': 'Enviar Invitación' },
  'team.inviteSent': { 'pt-BR': 'Convite enviado!', 'en': 'Invite sent!', 'es': '¡Invitación enviada!' },
  'team.inviteSentDescription': { 'pt-BR': 'O convite foi enviado para o email informado', 'en': 'The invite has been sent to the provided email', 'es': 'La invitación ha sido enviada al correo proporcionado' },
  'team.removeConfirm': { 'pt-BR': 'Tem certeza que deseja remover este membro?', 'en': 'Are you sure you want to remove this member?', 'es': '¿Estás seguro de que quieres eliminar este miembro?' },
  'team.manage': { 'pt-BR': 'Gerencie os membros dos seus projetos', 'en': 'Manage your project members', 'es': 'Gestiona los miembros de tus proyectos' },
  'team.selectProject': { 'pt-BR': 'Selecione um projeto', 'en': 'Select a project', 'es': 'Selecciona un proyecto' },
  'team.searchMembers': { 'pt-BR': 'Buscar membros...', 'en': 'Search members...', 'es': 'Buscar miembros...' },
  'team.selectProjectTitle': { 'pt-BR': 'Selecione um projeto', 'en': 'Select a project', 'es': 'Selecciona un proyecto' },
  'team.selectProjectDesc': { 'pt-BR': 'Escolha um projeto acima para gerenciar seus membros e convites', 'en': 'Choose a project above to manage its members and invites', 'es': 'Elige un proyecto arriba para gestionar sus miembros e invitaciones' },
  'team.stats.active': { 'pt-BR': 'Membros Ativos', 'en': 'Active Members', 'es': 'Miembros Activos' },
  'team.stats.thisMonth': { 'pt-BR': '+{count} este mês', 'en': '+{count} this month', 'es': '+{count} este mes' },
  'team.stats.pending': { 'pt-BR': 'Convites Pendentes', 'en': 'Pending Invites', 'es': 'Invitaciones Pendientes' },
  'team.stats.pendingDesc': { 'pt-BR': 'Aguardando resposta', 'en': 'Awaiting response', 'es': 'Esperando respuesta' },

  // ===== INVITES =====
  'invites.title': { 'pt-BR': 'Convites', 'en': 'Invites', 'es': 'Invitaciones' },
  'invites.pending': { 'pt-BR': 'Convites Pendentes', 'en': 'Pending Invites', 'es': 'Invitaciones Pendientes' },
  'invites.accept': { 'pt-BR': 'Aceitar', 'en': 'Accept', 'es': 'Aceptar' },
  'invites.decline': { 'pt-BR': 'Recusar', 'en': 'Decline', 'es': 'Rechazar' },
  'invites.from': { 'pt-BR': 'De', 'en': 'From', 'es': 'De' },
  'invites.as': { 'pt-BR': 'Como', 'en': 'As', 'es': 'Como' },
  'invites.noInvites': { 'pt-BR': 'Nenhum convite pendente', 'en': 'No pending invites', 'es': 'No hay invitaciones pendientes' },
  'invites.accepted': { 'pt-BR': 'Convite aceito!', 'en': 'Invite accepted!', 'es': '¡Invitación aceptada!' },
  'invites.declined': { 'pt-BR': 'Convite recusado', 'en': 'Invite declined', 'es': 'Invitación rechazada' },
  'invites.acceptedDescription': { 'pt-BR': 'Você agora faz parte do projeto.', 'en': 'You are now part of the project.', 'es': 'Ahora eres parte del proyecto.' },
  'invites.errorAccept': { 'pt-BR': 'Erro ao aceitar convite', 'en': 'Error accepting invite', 'es': 'Error al aceptar invitación' },
  'invites.tryAgain': { 'pt-BR': 'Tente novamente mais tarde.', 'en': 'Try again later.', 'es': 'Intenta de nuevo más tarde.' },
  'invites.manage': { 'pt-BR': 'Gerencie os convites de projetos que você recebeu', 'en': 'Manage project invites you received', 'es': 'Gestiona las invitaciones de proyectos que recibiste' },
  'invites.errorLoading': { 'pt-BR': 'Erro ao carregar convites', 'en': 'Error loading invites', 'es': 'Error al cargar invitaciones' },
  'invites.noInvitesDesc': { 'pt-BR': 'Você não tem convites de projetos no momento. Quando alguém te convidar para um projeto, aparecerá aqui.', 'en': 'You have no project invites at the moment. When someone invites you to a project, it will appear here.', 'es': 'No tienes invitaciones de proyectos en este momento. Cuando alguien te invite a un proyecto, aparecerá aquí.' },
  'invites.invitedTo': { 'pt-BR': 'Você foi convidado para participar destes projetos', 'en': 'You have been invited to participate in these projects', 'es': 'Has sido invitado a participar en estos proyectos' },
  'invites.declining': { 'pt-BR': 'Recusando convite...', 'en': 'Declining invite...', 'es': 'Rechazando invitación...' },
  'invites.declinedSuccess': { 'pt-BR': 'Convite recusado', 'en': 'Invite declined', 'es': 'Invitación rechazada' },
  'invites.errorDecline': { 'pt-BR': 'Erro ao recusar convite', 'en': 'Error declining invite', 'es': 'Error al rechazar invitación' },

  // ===== ROLES =====
  'roles.owner': { 'pt-BR': 'Proprietário', 'en': 'Owner', 'es': 'Propietario' },
  'roles.admin': { 'pt-BR': 'Administrador', 'en': 'Admin', 'es': 'Administrador' },
  'roles.editor': { 'pt-BR': 'Editor', 'en': 'Editor', 'es': 'Editor' },
  'roles.viewer': { 'pt-BR': 'Visualizador', 'en': 'Viewer', 'es': 'Visualizador' },

  // ===== PREFERENCES =====
  'preferences.title': { 'pt-BR': 'Preferências', 'en': 'Preferences', 'es': 'Preferencias' },

  // ===== DASHBOARD =====
  'dashboard.welcome': { 'pt-BR': 'Bem-vindo de volta', 'en': 'Welcome back', 'es': 'Bienvenido de nuevo' },
  'dashboard.overview': { 'pt-BR': 'Visão geral', 'en': 'Overview', 'es': 'Resumen' },
  'dashboard.recentProjects': { 'pt-BR': 'Projetos Recentes', 'en': 'Recent Projects', 'es': 'Proyectos Recientes' },
  'dashboard.viewAll': { 'pt-BR': 'Ver todos', 'en': 'View all', 'es': 'Ver todos' },
  'dashboard.stats.totalProjects': { 'pt-BR': 'Total de Projetos', 'en': 'Total Projects', 'es': 'Proyectos Totales' },
  'dashboard.stats.inProgress': { 'pt-BR': '{count} em andamento', 'en': '{count} in progress', 'es': '{count} en progreso' },
  'dashboard.stats.documents': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'dashboard.stats.teamMembers': { 'pt-BR': 'Membros da Equipe', 'en': 'Team Members', 'es': 'Miembros del Equipo' },
  'dashboard.stats.activeMembers': { 'pt-BR': '{count} ativos', 'en': '{count} active', 'es': '{count} activos' },
  'dashboard.stats.newThisWeek': { 'pt-BR': 'Novos Esta Semana', 'en': 'New This Week', 'es': 'Nuevos Esta Semana' },
  'dashboard.stats.docsAdded': { 'pt-BR': 'Documentos adicionados', 'en': 'Documents added', 'es': 'Documentos agregados' },
  'dashboard.charts.projectsByStatus': { 'pt-BR': 'Projetos por Status', 'en': 'Projects by Status', 'es': 'Proyectos por Estado' },
  'dashboard.charts.projectsDistribution': { 'pt-BR': 'Distribuição atual dos seus projetos', 'en': 'Current distribution of your projects', 'es': 'Distribución actual de tus proyectos' },
  'dashboard.status.planning': { 'pt-BR': 'Planejamento', 'en': 'Planning', 'es': 'Planificación' },
  'dashboard.status.inProgress': { 'pt-BR': 'Em Andamento', 'en': 'In Progress', 'es': 'En Progreso' },
  'dashboard.status.completed': { 'pt-BR': 'Concluído', 'en': 'Completed', 'es': 'Completado' },
  'dashboard.status.onHold': { 'pt-BR': 'Pausado', 'en': 'On Hold', 'es': 'Pausado' },
  'dashboard.charts.documentsByCategory': { 'pt-BR': 'Documentos por Categoria', 'en': 'Documents by Category', 'es': 'Documentos por Categoría' },
  'dashboard.charts.documentsTypes': { 'pt-BR': 'Tipos de documentos mais usados', 'en': 'Most used document types', 'es': 'Tipos de documentos más usados' },
  'dashboard.tabs.overview': { 'pt-BR': 'Visão Geral', 'en': 'Overview', 'es': 'Visión General' },
  'dashboard.tabs.recentActivity': { 'pt-BR': 'Atividade Recente', 'en': 'Recent Activity', 'es': 'Actividad Reciente' },
  'dashboard.activity.title': { 'pt-BR': 'Atividade Recente', 'en': 'Recent Activity', 'es': 'Actividad Reciente' },
  'dashboard.activity.description': { 'pt-BR': 'Últimas atualizações nos seus projetos', 'en': 'Latest updates in your projects', 'es': 'Últimas actualizaciones en tus proyectos' },
  'dashboard.activity.empty': { 'pt-BR': 'Nenhuma atividade recente', 'en': 'No recent activity', 'es': 'No hay actividad reciente' },
  'dashboard.activity.emptyDesc': { 'pt-BR': 'Crie projetos ou documentos para ver atividades aqui', 'en': 'Create projects or documents to see activities here', 'es': 'Crea proyectos o documentos para ver actividades aquí' },
  'dashboard.activity.created': { 'pt-BR': 'criado', 'en': 'created', 'es': 'creado' },
  'dashboard.activity.updated': { 'pt-BR': 'atualizado', 'en': 'updated', 'es': 'actualizado' },
  'dashboard.activity.deleted': { 'pt-BR': 'deletado', 'en': 'deleted', 'es': 'eliminado' },
  'dashboard.activity.was': { 'pt-BR': 'foi', 'en': 'was', 'es': 'fue' },
  'dashboard.tabs.management': { 'pt-BR': 'Gestão', 'en': 'Management', 'es': 'Gestión' },
  'dashboard.management.title': { 'pt-BR': 'Gestão Empresarial', 'en': 'Business Management', 'es': 'Gestión Empresarial' },
  'dashboard.management.description': { 'pt-BR': 'Gerencie tarefas, planos e jornadas', 'en': 'Manage tasks, plans and journeys', 'es': 'Gestiona tareas, planes y jornadas' },
  'dashboard.management.tasks.title': { 'pt-BR': 'Tarefas da Empresa', 'en': 'Company Tasks', 'es': 'Tareas de la Empresa' },
  'dashboard.management.tasks.description': { 'pt-BR': 'Acompanhe as tarefas em andamento', 'en': 'Track ongoing tasks', 'es': 'Sigue las tareas en curso' },
  'dashboard.management.plans.title': { 'pt-BR': 'Planos da Empresa', 'en': 'Company Plans', 'es': 'Planes de la Empresa' },
  'dashboard.management.plans.description': { 'pt-BR': 'Visualize os planos estratégicos', 'en': 'View strategic plans', 'es': 'Visualiza los planes estratégicos' },
  'dashboard.management.journey.title': { 'pt-BR': 'Estrutura da Jornada', 'en': 'Journey Structure', 'es': 'Estructura del Viaje' },
  'dashboard.management.journey.description': { 'pt-BR': 'Mapeie a jornada do cliente', 'en': 'Map the customer journey', 'es': 'Mapea el viaje del cliente' },
  'dashboard.management.tabs.recent': { 'pt-BR': 'Recente', 'en': 'Recent', 'es': 'Reciente' },
  'dashboard.management.tabs.favorites': { 'pt-BR': 'Favoritos', 'en': 'Favorites', 'es': 'Favoritos' },
  'dashboard.management.tabs.createdByMe': { 'pt-BR': 'Criado por Mim', 'en': 'Created by Me', 'es': 'Creado por Mí' },
  'dashboard.management.search': { 'pt-BR': 'Buscar...', 'en': 'Search...', 'es': 'Buscar...' },
  'dashboard.management.noResults': { 'pt-BR': 'Nenhum resultado encontrado', 'en': 'No results found', 'es': 'No se encontraron resultados' },
  'dashboard.management.table.name': { 'pt-BR': 'Nome', 'en': 'Name', 'es': 'Nombre' },
  'dashboard.management.table.team': { 'pt-BR': 'Equipe', 'en': 'Team', 'es': 'Equipo' },
  'dashboard.management.table.tech': { 'pt-BR': 'Tecnologia', 'en': 'Technology', 'es': 'Tecnología' },
  'dashboard.management.table.createdAt': { 'pt-BR': 'Criado em', 'en': 'Created at', 'es': 'Creado en' },
  'dashboard.management.table.contributors': { 'pt-BR': 'Colaboradores', 'en': 'Contributors', 'es': 'Colaboradores' },
  'dashboard.management.table.status': { 'pt-BR': 'Status', 'en': 'Status', 'es': 'Estado' },
  'dashboard.management.table.actions': { 'pt-BR': 'Ações', 'en': 'Actions', 'es': 'Acciones' },
  'dashboard.management.favorite': { 'pt-BR': 'Favoritar', 'en': 'Favorite', 'es': 'Favorito' },
  'dashboard.management.unfavorite': { 'pt-BR': 'Remover dos favoritos', 'en': 'Unfavorite', 'es': 'Quitar de favoritos' },
  'dashboard.management.edit': { 'pt-BR': 'Editar', 'en': 'Edit', 'es': 'Editar' },
  'dashboard.management.addedToFavorites': { 'pt-BR': 'Adicionado aos favoritos!', 'en': 'Added to favorites!', 'es': '¡Agregado a favoritos!' },
  'dashboard.management.removedFromFavorites': { 'pt-BR': 'Removido dos favoritos!', 'en': 'Removed from favorites!', 'es': '¡Eliminado de favoritos!' },
  'dashboard.management.filters': { 'pt-BR': 'Filtros', 'en': 'Filters', 'es': 'Filtros' },
  'dashboard.management.filterByStatus': { 'pt-BR': 'Filtrar por Status', 'en': 'Filter by Status', 'es': 'Filtrar por Estado' },
  'dashboard.management.filterByTech': { 'pt-BR': 'Filtrar por Tecnologia', 'en': 'Filter by Technology', 'es': 'Filtrar por Tecnología' },
  'dashboard.management.allStatuses': { 'pt-BR': 'Todos os status', 'en': 'All statuses', 'es': 'Todos los estados' },
  'dashboard.management.allTechs': { 'pt-BR': 'Todas as tecnologias', 'en': 'All technologies', 'es': 'Todas las tecnologías' },
  'dashboard.management.status.active': { 'pt-BR': 'Ativo', 'en': 'Active', 'es': 'Activo' },
  'dashboard.management.status.inProgress': { 'pt-BR': 'Em Progresso', 'en': 'In Progress', 'es': 'En Progreso' },
  'dashboard.management.status.onHold': { 'pt-BR': 'Pausado', 'en': 'On Hold', 'es': 'Pausado' },
  'dashboard.management.pagination.page': { 'pt-BR': 'Página', 'en': 'Page', 'es': 'Página' },
  'dashboard.management.pagination.of': { 'pt-BR': 'de', 'en': 'of', 'es': 'de' },
  'dashboard.management.pagination.rowsPerPage': { 'pt-BR': 'Linhas por página', 'en': 'Rows per page', 'es': 'Filas por página' },
  'dashboard.management.pagination.showing': { 'pt-BR': 'Mostrando', 'en': 'Showing', 'es': 'Mostrando' },
  'dashboard.management.pagination.to': { 'pt-BR': 'a', 'en': 'to', 'es': 'a' },
  'dashboard.management.pagination.results': { 'pt-BR': 'resultados', 'en': 'results', 'es': 'resultados' },
  'dashboard.management.dialog.title': { 'pt-BR': 'Editar Projeto', 'en': 'Edit Project', 'es': 'Editar Proyecto' },
  'dashboard.management.dialog.name': { 'pt-BR': 'Nome do Projeto', 'en': 'Project Name', 'es': 'Nombre del Proyecto' },
  'dashboard.management.dialog.namePlaceholder': { 'pt-BR': 'Digite o nome do projeto', 'en': 'Enter project name', 'es': 'Ingrese el nombre del proyecto' },
  'dashboard.management.dialog.team': { 'pt-BR': 'Equipe', 'en': 'Team', 'es': 'Equipo' },
  'dashboard.management.dialog.teamPlaceholder': { 'pt-BR': 'Digite o nome da equipe', 'en': 'Enter team name', 'es': 'Ingrese el nombre del equipo' },
  'dashboard.management.dialog.tech': { 'pt-BR': 'Tecnologia', 'en': 'Technology', 'es': 'Tecnología' },
  'dashboard.management.dialog.techPlaceholder': { 'pt-BR': 'Digite a tecnologia', 'en': 'Enter technology', 'es': 'Ingrese la tecnología' },
  'dashboard.management.dialog.status': { 'pt-BR': 'Status', 'en': 'Status', 'es': 'Estado' },
  'dashboard.management.dialog.repository': { 'pt-BR': 'Repositório', 'en': 'Repository', 'es': 'Repositorio' },
  'dashboard.management.dialog.repositoryPlaceholder': { 'pt-BR': 'https://github.com/...', 'en': 'https://github.com/...', 'es': 'https://github.com/...' },
  'dashboard.management.dialog.cancel': { 'pt-BR': 'Cancelar', 'en': 'Cancel', 'es': 'Cancelar' },
  'dashboard.management.dialog.save': { 'pt-BR': 'Salvar Alterações', 'en': 'Save Changes', 'es': 'Guardar Cambios' },
  'dashboard.management.dialog.saving': { 'pt-BR': 'Salvando...', 'en': 'Saving...', 'es': 'Guardando...' },
  'dashboard.management.dialog.success': { 'pt-BR': 'Projeto atualizado com sucesso!', 'en': 'Project updated successfully!', 'es': '¡Proyecto actualizado exitosamente!' },
  'dashboard.management.dialog.error': { 'pt-BR': 'Erro ao atualizar projeto', 'en': 'Error updating project', 'es': 'Error al actualizar proyecto' },

  // ===== WHITEBOARD =====
  'whiteboard.title': { 'pt-BR': 'Whiteboard', 'en': 'Whiteboard', 'es': 'Pizarra' },
  'whiteboard.save': { 'pt-BR': 'Salvar', 'en': 'Save', 'es': 'Guardar' },
  'whiteboard.saved': { 'pt-BR': 'Salvo!', 'en': 'Saved!', 'es': '¡Guardado!' },
  'whiteboard.savedSuccess': { 'pt-BR': 'Whiteboard salvo com sucesso', 'en': 'Whiteboard saved successfully', 'es': 'Pizarra guardada exitosamente' },
  'whiteboard.errorSaving': { 'pt-BR': 'Erro ao salvar', 'en': 'Error saving', 'es': 'Error al guardar' },
  'whiteboard.favorite': { 'pt-BR': 'Favoritar', 'en': 'Favorite', 'es': 'Favorito' },
  'whiteboard.unfavorite': { 'pt-BR': 'Remover dos favoritos', 'en': 'Unfavorite', 'es': 'Quitar de favoritos' },
  'whiteboard.addedToFavorites': { 'pt-BR': 'Adicionado aos favoritos!', 'en': 'Added to favorites!', 'es': '¡Agregado a favoritos!' },
  'whiteboard.removedFromFavorites': { 'pt-BR': 'Removido dos favoritos!', 'en': 'Removed from favorites!', 'es': '¡Eliminado de favoritos!' },
  'whiteboard.share': { 'pt-BR': 'Compartilhar', 'en': 'Share', 'es': 'Compartir' },
  'whiteboard.shareWith': { 'pt-BR': 'Compartilhar com', 'en': 'Share with', 'es': 'Compartir con' },
  'whiteboard.rename': { 'pt-BR': 'Renomear', 'en': 'Rename', 'es': 'Renombrar' },
  'whiteboard.fullscreen': { 'pt-BR': 'Tela cheia', 'en': 'Fullscreen', 'es': 'Pantalla completa' },
  'whiteboard.exitFullscreen': { 'pt-BR': 'Sair da tela cheia', 'en': 'Exit fullscreen', 'es': 'Salir de pantalla completa' },
  'whiteboard.close': { 'pt-BR': 'Fechar whiteboard', 'en': 'Close whiteboard', 'es': 'Cerrar pizarra' },
  
  // Toolbar
  'whiteboard.toolbar.checkbox': { 'pt-BR': 'Checkbox', 'en': 'Checkbox', 'es': 'Casilla' },
  'whiteboard.toolbar.postit': { 'pt-BR': 'Post-it', 'en': 'Post-it', 'es': 'Nota adhesiva' },
  'whiteboard.toolbar.text': { 'pt-BR': 'Texto', 'en': 'Text', 'es': 'Texto' },
  'whiteboard.toolbar.box': { 'pt-BR': 'Caixa', 'en': 'Box', 'es': 'Caja' },
  'whiteboard.toolbar.arrow': { 'pt-BR': 'Seta', 'en': 'Arrow', 'es': 'Flecha' },
  'whiteboard.toolbar.image': { 'pt-BR': 'Imagem', 'en': 'Image', 'es': 'Imagen' },
  'whiteboard.toolbar.shape': { 'pt-BR': 'Forma', 'en': 'Shape', 'es': 'Forma' },
  'whiteboard.toolbar.draw': { 'pt-BR': 'Desenhar', 'en': 'Draw', 'es': 'Dibujar' },
  'whiteboard.toolbar.models': { 'pt-BR': 'Modelos', 'en': 'Templates', 'es': 'Plantillas' },
  
  // Items
  'whiteboard.item.task': { 'pt-BR': 'Tarefa...', 'en': 'Task...', 'es': 'Tarea...' },
  'whiteboard.item.note': { 'pt-BR': 'Nota...', 'en': 'Note...', 'es': 'Nota...' },
  'whiteboard.item.text': { 'pt-BR': 'Texto...', 'en': 'Text...', 'es': 'Texto...' },
  
  // Canvas
  'whiteboard.canvas.empty': { 'pt-BR': 'Canvas vazio. Adicione elementos usando a barra acima.', 'en': 'Empty canvas. Add elements using the toolbar above.', 'es': 'Lienzo vacío. Agregue elementos usando la barra superior.' },
  'whiteboard.canvas.dragToMove': { 'pt-BR': 'Arraste para mover • Clique para editar', 'en': 'Drag to move • Click to edit', 'es': 'Arrastrar para mover • Clic para editar' },
  
  // Collaborators
  'whiteboard.collaborators.online': { 'pt-BR': 'online', 'en': 'online', 'es': 'en línea' },
  'whiteboard.collaborators.viewing': { 'pt-BR': 'Visualizando', 'en': 'Viewing', 'es': 'Viendo' },

  // ===== SEARCH =====
  'search.title': { 'pt-BR': 'Busca Global', 'en': 'Global Search', 'es': 'Búsqueda Global' },
  'search.placeholder': { 'pt-BR': 'Buscar páginas, projetos, documentos...', 'en': 'Search pages, projects, documents...', 'es': 'Buscar páginas, proyectos, documentos...' },
  'search.noResults': { 'pt-BR': 'Nenhum resultado encontrado', 'en': 'No results found', 'es': 'No se encontraron resultados' },
  'search.pages': { 'pt-BR': 'Páginas', 'en': 'Pages', 'es': 'Páginas' },

  // ===== SETTINGS =====
  'settings.title': { 'pt-BR': 'Configurações', 'en': 'Settings', 'es': 'Configuración' },
  'settings.profile': { 'pt-BR': 'Perfil', 'en': 'Profile', 'es': 'Perfil' },
  'settings.notifications': { 'pt-BR': 'Notificações', 'en': 'Notifications', 'es': 'Notificaciones' },
  'settings.preferences': { 'pt-BR': 'Preferências', 'en': 'Preferences', 'es': 'Preferencias' },
  'settings.billing': { 'pt-BR': 'Faturamento', 'en': 'Billing', 'es': 'Facturación' },
  'settings.language': { 'pt-BR': 'Idioma', 'en': 'Language', 'es': 'Idioma' },
  'settings.description': { 'pt-BR': 'Segurança, idioma, região e preferências avançadas', 'en': 'Security, language, region and advanced preferences', 'es': 'Seguridad, idioma, región y preferencias avanzadas' },
  'settings.save': { 'pt-BR': 'Salvar', 'en': 'Save', 'es': 'Guardar' },
  'settings.saving': { 'pt-BR': 'Salvando...', 'en': 'Saving...', 'es': 'Guardando...' },
  'settings.saved': { 'pt-BR': 'Configurações salvas com sucesso!', 'en': 'Settings saved successfully!', 'es': '¡Configuración guardada exitosamente!' },
  'settings.saveFailed': { 'pt-BR': 'Erro ao salvar configurações', 'en': 'Failed to save settings', 'es': 'Error al guardar configuración' },
  'settings.languageDesc': { 'pt-BR': 'Idioma da interface e notificações', 'en': 'Interface and notifications language', 'es': 'Idioma de la interfaz y notificaciones' },
  'settings.security': { 'pt-BR': 'Segurança', 'en': 'Security', 'es': 'Seguridad' },
  'settings.securityDesc': { 'pt-BR': 'Proteja sua conta com medidas de segurança adicionais', 'en': 'Protect your account with additional security measures', 'es': 'Protege tu cuenta con medidas de seguridad adicionales' },
  'settings.languageRegion': { 'pt-BR': 'Idioma e Região', 'en': 'Language & Region', 'es': 'Idioma y Región' },
  'settings.languageRegionDesc': { 'pt-BR': 'Personalize idioma, fuso horário e formato de data', 'en': 'Customize language, timezone and date format', 'es': 'Personaliza idioma, zona horaria y formato de fecha' },
  'settings.twoFactor': { 'pt-BR': 'Autenticação de Dois Fatores (2FA)', 'en': 'Two-Factor Authentication (2FA)', 'es': 'Autenticación de Dos Factores (2FA)' },
  'settings.twoFactorDesc': { 'pt-BR': 'Adicione uma camada extra de segurança', 'en': 'Add an extra layer of security', 'es': 'Añade una capa extra de seguridad' },
  'settings.twoFactorActive': { 'pt-BR': '2FA Ativado', 'en': '2FA Enabled', 'es': '2FA Activado' },
  'settings.twoFactorActiveDesc': { 'pt-BR': 'Sua conta está protegida com autenticação de dois fatores', 'en': 'Your account is protected with two-factor authentication', 'es': 'Tu cuenta está protegida con autenticación de dos factores' },
  'settings.configureApp': { 'pt-BR': 'Configurar Aplicativo', 'en': 'Configure App', 'es': 'Configurar Aplicación' },
  'settings.sessionTimeout': { 'pt-BR': 'Tempo de Sessão', 'en': 'Session Timeout', 'es': 'Tiempo de Sesión' },
  'settings.timeout15': { 'pt-BR': '15 minutos', 'en': '15 minutes', 'es': '15 minutos' },
  'settings.timeout30': { 'pt-BR': '30 minutos', 'en': '30 minutes', 'es': '30 minutos' },
  'settings.timeout60': { 'pt-BR': '1 hora', 'en': '1 hour', 'es': '1 hora' },
  'settings.timeout120': { 'pt-BR': '2 horas', 'en': '2 hours', 'es': '2 horas' },
  'settings.timeoutNever': { 'pt-BR': 'Nunca expirar', 'en': 'Never expire', 'es': 'Nunca expirar' },
  'settings.sessionTimeoutDesc': { 'pt-BR': 'Tempo de inatividade antes de desconectar automaticamente', 'en': 'Inactivity time before automatically disconnecting', 'es': 'Tiempo de inactividad antes de desconectar automáticamente' },
  'settings.loginNotifications': { 'pt-BR': 'Notificações de Login', 'en': 'Login Notifications', 'es': 'Notificaciones de Inicio de Sesión' },
  'settings.loginNotificationsDesc': { 'pt-BR': 'Avise quando houver login de novo dispositivo', 'en': 'Notify when there is a login from a new device', 'es': 'Notifica cuando hay inicio de sesión desde un nuevo dispositivo' },
  'settings.suspiciousActivity': { 'pt-BR': 'Alertas de Atividade Suspeita', 'en': 'Suspicious Activity Alerts', 'es': 'Alertas de Actividad Sospechosa' },
  'settings.suspiciousActivityDesc': { 'pt-BR': 'Detectar e notificar atividades incomuns', 'en': 'Detect and notify unusual activities', 'es': 'Detectar y notificar actividades inusuales' },
  'settings.timezone': { 'pt-BR': 'Fuso Horário', 'en': 'Timezone', 'es': 'Zona Horaria' },
  'settings.dateFormat': { 'pt-BR': 'Formato de Data', 'en': 'Date Format', 'es': 'Formato de Fecha' },
  'settings.timeFormat': { 'pt-BR': 'Formato de Hora', 'en': 'Time Format', 'es': 'Formato de Hora' },
  'settings.dangerZone': { 'pt-BR': 'Zona de Perigo', 'en': 'Danger Zone', 'es': 'Zona de Peligro' },
  'settings.dangerZoneDesc': { 'pt-BR': 'Ações irreversíveis que afetam sua conta', 'en': 'Irreversible actions that affect your account', 'es': 'Acciones irreversibles que afectan tu cuenta' },
  'settings.signOutAll': { 'pt-BR': 'Desconectar Todos os Dispositivos', 'en': 'Sign Out All Devices', 'es': 'Cerrar Sesión en Todos los Dispositivos' },
  'settings.signOutAllDesc': { 'pt-BR': 'Encerra todas as sessões ativas exceto a atual', 'en': 'Ends all active sessions except the current one', 'es': 'Finaliza todas las sesiones activas excepto la actual' },
  'settings.signOut': { 'pt-BR': 'Desconectar', 'en': 'Sign Out', 'es': 'Cerrar Sesión' },
  'settings.signOutAllTitle': { 'pt-BR': 'Desconectar todos os dispositivos?', 'en': 'Sign out all devices?', 'es': '¿Cerrar sesión en todos los dispositivos?' },
  'settings.signOutAllConfirm': { 'pt-BR': 'Você será desconectado de todos os dispositivos e precisará fazer login novamente.', 'en': 'You will be signed out of all devices and will need to log in again.', 'es': 'Se cerrará tu sesión en todos los dispositivos y necesitarás iniciar sesión nuevamente.' },
  'settings.deleteAccount': { 'pt-BR': 'Excluir Conta', 'en': 'Delete Account', 'es': 'Eliminar Cuenta' },
  'settings.deleteAccountDesc': { 'pt-BR': 'Exclui permanentemente sua conta e todos os dados', 'en': 'Permanently deletes your account and all data', 'es': 'Elimina permanentemente tu cuenta y todos los datos' },
  'settings.deleteAccountTitle': { 'pt-BR': 'Tem certeza absoluta?', 'en': 'Are you absolutely sure?', 'es': '¿Estás completamente seguro?' },
  'settings.deleteAccountConfirm': { 'pt-BR': 'Esta ação NÃO PODE ser desfeita. Isso irá excluir permanentemente sua conta, todos os seus projetos, documentos e remover todos os dados de nossos servidores.', 'en': 'This action CANNOT be undone. This will permanently delete your account, all your projects, documents and remove all data from our servers.', 'es': 'Esta acción NO PUEDE deshacerse. Esto eliminará permanentemente tu cuenta, todos tus proyectos, documentos y removerá todos los datos de nuestros servidores.' },
  'settings.deleting': { 'pt-BR': 'Excluindo...', 'en': 'Deleting...', 'es': 'Eliminando...' },
  'settings.deleteAccountButton': { 'pt-BR': 'Sim, excluir minha conta', 'en': 'Yes, delete my account', 'es': 'Sí, eliminar mi cuenta' },
  
  // Profile
  'profile.title': { 'pt-BR': 'Perfil', 'en': 'Profile', 'es': 'Perfil' },
  'profile.description': { 'pt-BR': 'Gerencie suas informações pessoais e preferências', 'en': 'Manage your personal information and preferences', 'es': 'Gestiona tu información personal y preferencias' },
  'profile.personalInfo': { 'pt-BR': 'Informações Pessoais', 'en': 'Personal Information', 'es': 'Información Personal' },
  'profile.personalInfoDesc': { 'pt-BR': 'Atualize suas informações de perfil', 'en': 'Update your profile information', 'es': 'Actualiza tu información de perfil' },
  'profile.fullName': { 'pt-BR': 'Nome completo', 'en': 'Full name', 'es': 'Nombre completo' },
  'profile.email': { 'pt-BR': 'Email', 'en': 'Email', 'es': 'Correo electrónico' },
  'profile.bio': { 'pt-BR': 'Bio', 'en': 'Bio', 'es': 'Bio' },
  'profile.bioPlaceholder': { 'pt-BR': 'Conte um pouco sobre você...', 'en': 'Tell us about yourself...', 'es': 'Cuéntanos sobre ti...' },
  'profile.userNotFound': { 'pt-BR': 'Usuário não encontrado', 'en': 'User not found', 'es': 'Usuario no encontrado' },
  'profile.errorLoading': { 'pt-BR': 'Erro ao carregar perfil', 'en': 'Error loading profile', 'es': 'Error al cargar perfil' },
  'profile.saved': { 'pt-BR': 'Perfil atualizado!', 'en': 'Profile updated!', 'es': '¡Perfil actualizado!' },
  'profile.savedDesc': { 'pt-BR': 'Suas informações foram salvas com sucesso.', 'en': 'Your information was saved successfully.', 'es': 'Tu información fue guardada exitosamente.' },
  'profile.errorSaving': { 'pt-BR': 'Erro ao salvar', 'en': 'Error saving', 'es': 'Error al guardar' },
  'profile.passwordMismatch': { 'pt-BR': 'Senhas não coincidem', 'en': 'Passwords do not match', 'es': 'Las contraseñas no coinciden' },
  'profile.passwordMismatchDesc': { 'pt-BR': 'A nova senha e a confirmação devem ser iguais.', 'en': 'The new password and confirmation must be the same.', 'es': 'La nueva contraseña y la confirmación deben ser iguales.' },
  'profile.passwordTooShort': { 'pt-BR': 'Senha muito curta', 'en': 'Password too short', 'es': 'Contraseña muy corta' },
  'profile.passwordTooShortDesc': { 'pt-BR': 'A senha deve ter pelo menos 8 caracteres.', 'en': 'Password must be at least 8 characters.', 'es': 'La contraseña debe tener al menos 8 caracteres.' },
  'profile.passwordChanged': { 'pt-BR': 'Senha alterada!', 'en': 'Password changed!', 'es': '¡Contraseña cambiada!' },
  'profile.passwordChangedDesc': { 'pt-BR': 'Sua senha foi atualizada com sucesso.', 'en': 'Your password was updated successfully.', 'es': 'Tu contraseña fue actualizada exitosamente.' },
  'profile.passwordError': { 'pt-BR': 'Erro ao alterar senha', 'en': 'Error changing password', 'es': 'Error al cambiar contraseña' },
  'profile.changePassword': { 'pt-BR': 'Alterar Senha', 'en': 'Change Password', 'es': 'Cambiar Contraseña' },
  'profile.currentPassword': { 'pt-BR': 'Senha atual', 'en': 'Current password', 'es': 'Contraseña actual' },
  'profile.newPassword': { 'pt-BR': 'Nova senha', 'en': 'New password', 'es': 'Nueva contraseña' },
  'profile.confirmNewPassword': { 'pt-BR': 'Confirmar nova senha', 'en': 'Confirm new password', 'es': 'Confirmar nueva contraseña' },
  'profile.clickToChange': { 'pt-BR': 'Clique para alterar sua foto', 'en': 'Click to change your photo', 'es': 'Haz clic para cambiar tu foto' },
  'profile.noName': { 'pt-BR': 'Sem nome', 'en': 'No name', 'es': 'Sin nombre' },
  'profile.photoUrl': { 'pt-BR': 'URL da Foto', 'en': 'Photo URL', 'es': 'URL de la foto' },
  'profile.pasteUrlOrUpload': { 'pt-BR': 'Cole a URL de uma imagem ou faça upload', 'en': 'Paste an image URL or upload', 'es': 'Pega una URL de imagen o sube' },
  'profile.fullNamePlaceholder': { 'pt-BR': 'João Silva', 'en': 'John Doe', 'es': 'Juan Pérez' },
  'profile.emailCannotChange': { 'pt-BR': 'O email não pode ser alterado diretamente. Entre em contato com o suporte.', 'en': 'Email cannot be changed directly. Contact support.', 'es': 'El correo no se puede cambiar directamente. Contacta con soporte.' },
  'profile.maxChars': { 'pt-BR': 'Máximo 500 caracteres. {current}/500', 'en': 'Maximum 500 characters. {current}/500', 'es': 'Máximo 500 caracteres. {current}/500' },
  'profile.changePasswordDesc': { 'pt-BR': 'Atualize sua senha regularmente para manter sua conta segura', 'en': 'Update your password regularly to keep your account secure', 'es': 'Actualiza tu contraseña regularmente para mantener tu cuenta segura' },
  'profile.minChars': { 'pt-BR': 'Mínimo 8 caracteres', 'en': 'Minimum 8 characters', 'es': 'Mínimo 8 caracteres' },
  'profile.typeAgain': { 'pt-BR': 'Digite novamente', 'en': 'Type again', 'es': 'Escribe de nuevo' },
  'profile.securityTip': { 'pt-BR': 'Dica de segurança', 'en': 'Security tip', 'es': 'Consejo de seguridad' },
  'profile.securityTipDesc': { 'pt-BR': 'Use uma combinação de letras maiúsculas e minúsculas, números e caracteres especiais.', 'en': 'Use a combination of uppercase and lowercase letters, numbers and special characters.', 'es': 'Usa una combinación de letras mayúsculas y minúsculas, números y caracteres especiales.' },
  'profile.changing': { 'pt-BR': 'Alterando...', 'en': 'Changing...', 'es': 'Cambiando...' },
  'profile.changePasswordButton': { 'pt-BR': 'Alterar Senha', 'en': 'Change Password', 'es': 'Cambiar Contraseña' },
  'profile.phone': { 'pt-BR': 'Telefone', 'en': 'Phone', 'es': 'Teléfono' },
  'profile.location': { 'pt-BR': 'Localização', 'en': 'Location', 'es': 'Ubicación' },
  'profile.avatar': { 'pt-BR': 'Avatar', 'en': 'Avatar', 'es': 'Avatar' },
  'profile.changeAvatar': { 'pt-BR': 'Alterar avatar', 'en': 'Change avatar', 'es': 'Cambiar avatar' },
  
  // Notifications
  'notifications.title': { 'pt-BR': 'Notificações', 'en': 'Notifications', 'es': 'Notificaciones' },
  'notifications.description': { 'pt-BR': 'Configure como você deseja ser notificado', 'en': 'Configure how you want to be notified', 'es': 'Configura cómo quieres ser notificado' },
  'notifications.email': { 'pt-BR': 'Email', 'en': 'Email', 'es': 'Correo' },
  'notifications.emailDesc': { 'pt-BR': 'Receba notificações por email', 'en': 'Receive notifications by email', 'es': 'Recibe notificaciones por correo' },
  'notifications.saved': { 'pt-BR': 'Configurações salvas com sucesso!', 'en': 'Settings saved successfully!', 'es': '¡Configuración guardada exitosamente!' },
  'notifications.errorSaving': { 'pt-BR': 'Erro ao salvar configurações', 'en': 'Error saving settings', 'es': 'Error al guardar configuración' },
  'notifications.saveChanges': { 'pt-BR': 'Salvar Alterações', 'en': 'Save Changes', 'es': 'Guardar Cambios' },
  'notifications.emailNotifications': { 'pt-BR': 'Notificações por Email', 'en': 'Email Notifications', 'es': 'Notificaciones por Correo' },
  'notifications.emailNotificationsDesc': { 'pt-BR': 'Receba atualizações importantes por email', 'en': 'Receive important updates by email', 'es': 'Recibe actualizaciones importantes por correo' },
  'notifications.appNotifications': { 'pt-BR': 'Notificações no App', 'en': 'In-App Notifications', 'es': 'Notificaciones en la App' },
  'notifications.appNotificationsDesc': { 'pt-BR': 'Notificações que aparecem enquanto você usa o app', 'en': 'Notifications that appear while you use the app', 'es': 'Notificaciones que aparecen mientras usas la app' },
  'notifications.newProjects': { 'pt-BR': 'Novos Projetos', 'en': 'New Projects', 'es': 'Nuevos Proyectos' },
  'notifications.newProjectsDesc': { 'pt-BR': 'Quando um novo projeto é criado ou você é adicionado a um', 'en': 'When a new project is created or you are added to one', 'es': 'Cuando se crea un nuevo proyecto o te agregan a uno' },
  'notifications.documents': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'notifications.documentsDesc': { 'pt-BR': 'Quando documentos são adicionados ou compartilhados com você', 'en': 'When documents are added or shared with you', 'es': 'Cuando se agregan o comparten documentos contigo' },
  'notifications.team': { 'pt-BR': 'Equipe', 'en': 'Team', 'es': 'Equipo' },
  'notifications.teamDesc': { 'pt-BR': 'Convites de equipe e mudanças de membros', 'en': 'Team invites and member changes', 'es': 'Invitaciones de equipo y cambios de miembros' },
  'notifications.deadlines': { 'pt-BR': 'Prazos', 'en': 'Deadlines', 'es': 'Plazos' },
  'notifications.deadlinesDesc': { 'pt-BR': 'Lembretes de prazos próximos e vencidos', 'en': 'Reminders of upcoming and overdue deadlines', 'es': 'Recordatorios de plazos próximos y vencidos' },
  'notifications.mentions': { 'pt-BR': 'Menções', 'en': 'Mentions', 'es': 'Menciones' },
  'notifications.mentionsDesc': { 'pt-BR': 'Quando alguém menciona você em um comentário', 'en': 'When someone mentions you in a comment', 'es': 'Cuando alguien te menciona en un comentario' },
  'notifications.security': { 'pt-BR': 'Segurança', 'en': 'Security', 'es': 'Seguridad' },
  'notifications.securityDesc': { 'pt-BR': 'Alertas de segurança e atividades suspeitas', 'en': 'Security alerts and suspicious activities', 'es': 'Alertas de seguridad y actividades sospechosas' },
  'notifications.projects': { 'pt-BR': 'Projetos', 'en': 'Projects', 'es': 'Proyectos' },
  'notifications.projectsDesc': { 'pt-BR': 'Atualizações sobre projetos que você participa', 'en': 'Updates about projects you participate in', 'es': 'Actualizaciones sobre proyectos en los que participas' },
  'notifications.comments': { 'pt-BR': 'Comentários', 'en': 'Comments', 'es': 'Comentarios' },
  'notifications.commentsDesc': { 'pt-BR': 'Novos comentários em projetos e documentos', 'en': 'New comments on projects and documents', 'es': 'Nuevos comentarios en proyectos y documentos' },
  'notifications.marketing': { 'pt-BR': 'Marketing e Comunicações', 'en': 'Marketing & Communications', 'es': 'Marketing y Comunicaciones' },
  'notifications.marketingDesc': { 'pt-BR': 'Emails promocionais e atualizações de produto', 'en': 'Promotional emails and product updates', 'es': 'Correos promocionales y actualizaciones de producto' },
  'notifications.newsletter': { 'pt-BR': 'Newsletter', 'en': 'Newsletter', 'es': 'Newsletter' },
  'notifications.newsletterDesc': { 'pt-BR': 'Novidades, tendências e melhores práticas mensais', 'en': 'Monthly news, trends and best practices', 'es': 'Noticias mensuales, tendencias y mejores prácticas' },
  'notifications.productUpdates': { 'pt-BR': 'Atualizações de Produto', 'en': 'Product Updates', 'es': 'Actualizaciones de Producto' },
  'notifications.productUpdatesDesc': { 'pt-BR': 'Novos recursos e melhorias da plataforma', 'en': 'New features and platform improvements', 'es': 'Nuevas funciones y mejoras de la plataforma' },
  'notifications.tips': { 'pt-BR': 'Dicas e Tutoriais', 'en': 'Tips & Tutorials', 'es': 'Consejos y Tutoriales' },
  'notifications.tipsDesc': { 'pt-BR': 'Aprenda a usar melhor a plataforma', 'en': 'Learn to use the platform better', 'es': 'Aprende a usar mejor la plataforma' },
  'notifications.system': { 'pt-BR': 'Sistema', 'en': 'System', 'es': 'Sistema' },
  'notifications.systemDesc': { 'pt-BR': 'Notificações importantes do sistema', 'en': 'Important system notifications', 'es': 'Notificaciones importantes del sistema' },
  'notifications.maintenance': { 'pt-BR': 'Manutenção', 'en': 'Maintenance', 'es': 'Mantenimiento' },
  'notifications.maintenanceDesc': { 'pt-BR': 'Avisos de manutenção programada e downtime', 'en': 'Scheduled maintenance and downtime notices', 'es': 'Avisos de mantenimiento programado y tiempo de inactividad' },
  'notifications.systemUpdates': { 'pt-BR': 'Atualizações do Sistema', 'en': 'System Updates', 'es': 'Actualizaciones del Sistema' },
  'notifications.systemUpdatesDesc': { 'pt-BR': 'Mudanças importantes e patches de segurança', 'en': 'Important changes and security patches', 'es': 'Cambios importantes y parches de seguridad' },
  'notifications.critical': { 'pt-BR': 'Notificações Críticas', 'en': 'Critical Notifications', 'es': 'Notificaciones Críticas' },
  'notifications.criticalDesc': { 'pt-BR': 'Alertas de segurança e manutenção crítica sempre serão enviados, independentemente das suas configurações.', 'en': 'Security alerts and critical maintenance will always be sent, regardless of your settings.', 'es': 'Las alertas de seguridad y mantenimiento crítico siempre se enviarán, independientemente de tu configuración.' },
  'notifications.disableAll': { 'pt-BR': 'Desativar todas as notificações', 'en': 'Disable all notifications', 'es': 'Desactivar todas las notificaciones' },
  'notifications.reactivateAnytime': { 'pt-BR': 'Você pode reativar a qualquer momento', 'en': 'You can reactivate anytime', 'es': 'Puedes reactivar en cualquier momento' },
  'notifications.disableAllButton': { 'pt-BR': 'Desativar Tudo', 'en': 'Disable All', 'es': 'Desactivar Todo' },
  'notifications.allDisabled': { 'pt-BR': 'Notificações desativadas', 'en': 'Notifications disabled', 'es': 'Notificaciones desactivadas' },
  'notifications.securityRemains': { 'pt-BR': 'Notificações de segurança e manutenção crítica permanecem ativas', 'en': 'Security and critical maintenance notifications remain active', 'es': 'Las notificaciones de seguridad y mantenimiento crítico permanecen activas' },
  
  // Billing
  'billing.title': { 'pt-BR': 'Faturamento', 'en': 'Billing', 'es': 'Facturación' },
  'billing.description': { 'pt-BR': 'Gerencie seu plano e método de pagamento', 'en': 'Manage your plan and payment method', 'es': 'Gestiona tu plan y método de pago' },
  'billing.currentPlan': { 'pt-BR': 'Plano Atual', 'en': 'Current Plan', 'es': 'Plan Actual' },
  'billing.upgrade': { 'pt-BR': 'Fazer Upgrade', 'en': 'Upgrade', 'es': 'Mejorar' },
  'billing.downgrade': { 'pt-BR': 'Fazer Downgrade', 'en': 'Downgrade', 'es': 'Reducir' },
  'billing.cancel': { 'pt-BR': 'Cancelar Plano', 'en': 'Cancel Plan', 'es': 'Cancelar Plan' },
  'billing.paymentMethod': { 'pt-BR': 'Método de Pagamento', 'en': 'Payment Method', 'es': 'Método de Pago' },
  'billing.addCard': { 'pt-BR': 'Adicionar Cartão', 'en': 'Add Card', 'es': 'Agregar Tarjeta' },
  'billing.invoices': { 'pt-BR': 'Faturas', 'en': 'Invoices', 'es': 'Facturas' },
  'billing.downloadInvoice': { 'pt-BR': 'Baixar Fatura', 'en': 'Download Invoice', 'es': 'Descargar Factura' },
  'billing.free': { 'pt-BR': 'Gratuito', 'en': 'Free', 'es': 'Gratis' },
  'billing.pro': { 'pt-BR': 'Pro', 'en': 'Pro', 'es': 'Pro' },
  'billing.enterprise': { 'pt-BR': 'Enterprise', 'en': 'Enterprise', 'es': 'Enterprise' },
  'billing.month': { 'pt-BR': '/mês', 'en': '/month', 'es': '/mes' },
  'billing.year': { 'pt-BR': '/ano', 'en': '/year', 'es': '/año' },
  'billing.currentPlanDesc': { 'pt-BR': 'Você está no plano {plan}', 'en': 'You are on the {plan} plan', 'es': 'Estás en el plan {plan}' },
  'billing.nextCharge': { 'pt-BR': 'Próxima cobrança', 'en': 'Next charge', 'es': 'Próximo cargo' },
  'billing.members': { 'pt-BR': 'Membros', 'en': 'Members', 'es': 'Miembros' },
  'billing.used': { 'pt-BR': '{percent}% usado', 'en': '{percent}% used', 'es': '{percent}% usado' },
  'billing.storage': { 'pt-BR': 'Armazenamento', 'en': 'Storage', 'es': 'Almacenamiento' },
  'billing.storageUsed': { 'pt-BR': '{percent}% de {total} GB', 'en': '{percent}% of {total} GB', 'es': '{percent}% de {total} GB' },
  'billing.monthly': { 'pt-BR': 'Mensal', 'en': 'Monthly', 'es': 'Mensual' },
  'billing.yearly': { 'pt-BR': 'Anual', 'en': 'Yearly', 'es': 'Anual' },
  'billing.popular': { 'pt-BR': 'Popular', 'en': 'Popular', 'es': 'Popular' },
  'billing.custom': { 'pt-BR': 'Personalizado', 'en': 'Custom', 'es': 'Personalizado' },
  'billing.contactSales': { 'pt-BR': 'Falar com Vendas', 'en': 'Contact Sales', 'es': 'Contactar Ventas' },
  'billing.paymentMethodDesc': { 'pt-BR': 'Gerencie seus cartões e métodos de pagamento', 'en': 'Manage your cards and payment methods', 'es': 'Gestiona tus tarjetas y métodos de pago' },
  'billing.expiresIn': { 'pt-BR': 'Expira em', 'en': 'Expires in', 'es': 'Expira en' },
  'billing.change': { 'pt-BR': 'Alterar', 'en': 'Change', 'es': 'Cambiar' },
  'billing.addNewMethod': { 'pt-BR': '+ Adicionar Novo Método', 'en': '+ Add New Method', 'es': '+ Agregar Nuevo Método' },
  'billing.invoiceHistory': { 'pt-BR': 'Histórico de Faturas', 'en': 'Invoice History', 'es': 'Historial de Facturas' },
  'billing.invoiceHistoryDesc': { 'pt-BR': 'Baixe suas faturas anteriores', 'en': 'Download your previous invoices', 'es': 'Descarga tus facturas anteriores' },
  'billing.paid': { 'pt-BR': 'Pago', 'en': 'Paid', 'es': 'Pagado' },
  'billing.faq': { 'pt-BR': 'Perguntas Frequentes', 'en': 'Frequently Asked Questions', 'es': 'Preguntas Frecuentes' },
  'billing.faq1Question': { 'pt-BR': 'Posso cancelar a qualquer momento?', 'en': 'Can I cancel at any time?', 'es': '¿Puedo cancelar en cualquier momento?' },
  'billing.faq1Answer': { 'pt-BR': 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.', 'en': 'Yes! You can cancel your subscription at any time without additional fees.', 'es': '¡Sí! Puedes cancelar tu suscripción en cualquier momento sin cargos adicionales.' },
  'billing.faq2Question': { 'pt-BR': 'O que acontece quando eu cancelo?', 'en': 'What happens when I cancel?', 'es': '¿Qué sucede cuando cancelo?' },
  'billing.faq2Answer': { 'pt-BR': 'Você terá acesso até o final do período pago. Seus dados serão mantidos por 30 dias.', 'en': 'You will have access until the end of the paid period. Your data will be kept for 30 days.', 'es': 'Tendrás acceso hasta el final del período pagado. Tus datos se mantendrán durante 30 días.' },
  'billing.faq3Question': { 'pt-BR': 'Posso fazer upgrade/downgrade?', 'en': 'Can I upgrade/downgrade?', 'es': '¿Puedo mejorar/reducir el plan?' },
  'billing.faq3Answer': { 'pt-BR': 'Sim! Mudanças de plano são proporcionais e refletidas na próxima fatura.', 'en': 'Yes! Plan changes are prorated and reflected in the next invoice.', 'es': '¡Sí! Los cambios de plan son proporcionales y se reflejan en la próxima factura.' },
  
  // Plan Names
  'billing.planFree': { 'pt-BR': 'Grátis', 'en': 'Free', 'es': 'Gratis' },
  'billing.planPro': { 'pt-BR': 'Pro', 'en': 'Pro', 'es': 'Pro' },
  'billing.planBusiness': { 'pt-BR': 'Business', 'en': 'Business', 'es': 'Business' },
  'billing.planEnterprise': { 'pt-BR': 'Enterprise', 'en': 'Enterprise', 'es': 'Enterprise' },
  
  // Plan Descriptions
  'billing.planFreeDesc': { 'pt-BR': 'Perfeito para começar', 'en': 'Perfect to get started', 'es': 'Perfecto para comenzar' },
  'billing.planProDesc': { 'pt-BR': 'Para equipes pequenas', 'en': 'For small teams', 'es': 'Para equipos pequeños' },
  'billing.planBusinessDesc': { 'pt-BR': 'Para empresas em crescimento', 'en': 'For growing companies', 'es': 'Para empresas en crecimiento' },
  'billing.planEnterpriseDesc': { 'pt-BR': 'Para grandes organizações', 'en': 'For large organizations', 'es': 'Para grandes organizaciones' },
  
  // Free Plan Features
  'billing.grátis.feature0': { 'pt-BR': '3 projetos', 'en': '3 projects', 'es': '3 proyectos' },
  'billing.grátis.feature1': { 'pt-BR': '50 documentos', 'en': '50 documents', 'es': '50 documentos' },
  'billing.grátis.feature2': { 'pt-BR': '1 GB de armazenamento', 'en': '1 GB storage', 'es': '1 GB de almacenamiento' },
  'billing.grátis.feature3': { 'pt-BR': 'Até 2 membros', 'en': 'Up to 2 members', 'es': 'Hasta 2 miembros' },
  'billing.grátis.feature4': { 'pt-BR': 'Suporte por email', 'en': 'Email support', 'es': 'Soporte por correo' },
  'billing.grátis.limit0': { 'pt-BR': 'Sem analytics avançado', 'en': 'No advanced analytics', 'es': 'Sin análisis avanzado' },
  'billing.grátis.limit1': { 'pt-BR': 'Sem exportação', 'en': 'No export', 'es': 'Sin exportación' },
  
  // Pro Plan Features
  'billing.pro.feature0': { 'pt-BR': 'Projetos ilimitados', 'en': 'Unlimited projects', 'es': 'Proyectos ilimitados' },
  'billing.pro.feature1': { 'pt-BR': 'Documentos ilimitados', 'en': 'Unlimited documents', 'es': 'Documentos ilimitados' },
  'billing.pro.feature2': { 'pt-BR': '50 GB de armazenamento', 'en': '50 GB storage', 'es': '50 GB de almacenamiento' },
  'billing.pro.feature3': { 'pt-BR': 'Até 10 membros', 'en': 'Up to 10 members', 'es': 'Hasta 10 miembros' },
  'billing.pro.feature4': { 'pt-BR': 'Analytics avançado', 'en': 'Advanced analytics', 'es': 'Análisis avanzado' },
  'billing.pro.feature5': { 'pt-BR': 'Exportação CSV/JSON', 'en': 'CSV/JSON export', 'es': 'Exportación CSV/JSON' },
  'billing.pro.feature6': { 'pt-BR': 'Suporte prioritário', 'en': 'Priority support', 'es': 'Soporte prioritario' },
  'billing.pro.feature7': { 'pt-BR': 'API access', 'en': 'API access', 'es': 'Acceso API' },
  
  // Business Plan Features
  'billing.business.feature0': { 'pt-BR': 'Tudo do Pro +', 'en': 'Everything in Pro +', 'es': 'Todo de Pro +' },
  'billing.business.feature1': { 'pt-BR': '200 GB de armazenamento', 'en': '200 GB storage', 'es': '200 GB de almacenamiento' },
  'billing.business.feature2': { 'pt-BR': 'Membros ilimitados', 'en': 'Unlimited members', 'es': 'Miembros ilimitados' },
  'billing.business.feature3': { 'pt-BR': 'Branding customizado', 'en': 'Custom branding', 'es': 'Marca personalizada' },
  'billing.business.feature4': { 'pt-BR': 'SSO (Single Sign-On)', 'en': 'SSO (Single Sign-On)', 'es': 'SSO (Single Sign-On)' },
  'billing.business.feature5': { 'pt-BR': 'Backup automático', 'en': 'Automatic backup', 'es': 'Respaldo automático' },
  'billing.business.feature6': { 'pt-BR': 'Suporte 24/7', 'en': '24/7 support', 'es': 'Soporte 24/7' },
  'billing.business.feature7': { 'pt-BR': 'Gerente de conta dedicado', 'en': 'Dedicated account manager', 'es': 'Gerente de cuenta dedicado' },
  
  // Enterprise Plan Features
  'billing.enterprise.feature0': { 'pt-BR': 'Tudo do Business +', 'en': 'Everything in Business +', 'es': 'Todo de Business +' },
  'billing.enterprise.feature1': { 'pt-BR': 'Armazenamento ilimitado', 'en': 'Unlimited storage', 'es': 'Almacenamiento ilimitado' },
  'billing.enterprise.feature2': { 'pt-BR': 'On-premise deployment', 'en': 'On-premise deployment', 'es': 'Implementación local' },
  'billing.enterprise.feature3': { 'pt-BR': 'SLA 99.9%', 'en': 'SLA 99.9%', 'es': 'SLA 99.9%' },
  'billing.enterprise.feature4': { 'pt-BR': 'Auditoria de segurança', 'en': 'Security audit', 'es': 'Auditoría de seguridad' },
  'billing.enterprise.feature5': { 'pt-BR': 'Treinamento personalizado', 'en': 'Custom training', 'es': 'Entrenamiento personalizado' },
  'billing.enterprise.feature6': { 'pt-BR': 'Integrações customizadas', 'en': 'Custom integrations', 'es': 'Integraciones personalizadas' },
  'billing.enterprise.feature7': { 'pt-BR': 'Contrato anual', 'en': 'Annual contract', 'es': 'Contrato anual' },
  
  // Billing dialogs & actions
  'billing.methodAdded': { 'pt-BR': 'Método adicionado!', 'en': 'Method added!', 'es': '¡Método agregado!' },
  'billing.methodUpdated': { 'pt-BR': 'Método atualizado!', 'en': 'Method updated!', 'es': '¡Método actualizado!' },
  'billing.cardInvalid': { 'pt-BR': 'Informe um cartão válido', 'en': 'Enter a valid card number', 'es': 'Ingrese una tarjeta válida' },
  'billing.noPaymentMethods': { 'pt-BR': 'Nenhum método de pagamento cadastrado ainda.', 'en': 'No payment methods added yet.', 'es': 'Aún no hay métodos de pago agregados.' },
  'billing.noInvoices': { 'pt-BR': 'Nenhuma fatura encontrada.', 'en': 'No invoices found.', 'es': 'No se encontraron facturas.' },
  'billing.noInvoicePdf': { 'pt-BR': 'PDF não disponível para esta fatura.', 'en': 'PDF is not available for this invoice.', 'es': 'El PDF no está disponible para esta factura.' },
  'billing.addNewMethodTitle': { 'pt-BR': 'Adicionar método de pagamento', 'en': 'Add payment method', 'es': 'Agregar método de pago' },
  'billing.addNewMethodDesc': { 'pt-BR': 'Informe os dados do cartão que deseja utilizar.', 'en': 'Enter the card details you want to use.', 'es': 'Ingrese los datos de la tarjeta que desea usar.' },
  'billing.cardNumber': { 'pt-BR': 'Número do cartão', 'en': 'Card number', 'es': 'Número de tarjeta' },
  'billing.expMonth': { 'pt-BR': 'Mês de vencimento', 'en': 'Expiration month', 'es': 'Mes de expiración' },
  'billing.expYear': { 'pt-BR': 'Ano de vencimento', 'en': 'Expiration year', 'es': 'Año de expiración' },
  'billing.saveMethod': { 'pt-BR': 'Salvar método', 'en': 'Save method', 'es': 'Guardar método' },
  'billing.changeMethodTitle': { 'pt-BR': 'Alterar método padrão', 'en': 'Change default method', 'es': 'Cambiar método predeterminado' },
  'billing.changeMethodDesc': { 'pt-BR': 'Selecione qual método ficará como padrão para cobranças.', 'en': 'Choose which method will be the default for billing.', 'es': 'Elija qué método será el predeterminado para los cobros.' },
  'billing.current': { 'pt-BR': 'Atual', 'en': 'Current', 'es': 'Actual' },
  'billing.makeDefault': { 'pt-BR': 'Definir como padrão', 'en': 'Make default', 'es': 'Definir como predeterminado' },
  'billing.pending': { 'pt-BR': 'Pendente', 'en': 'Pending', 'es': 'Pendiente' },
  'billing.failed': { 'pt-BR': 'Falhou', 'en': 'Failed', 'es': 'Fallido' },
  
  // Analytics
  'analytics.title': { 'pt-BR': 'Analytics', 'en': 'Analytics', 'es': 'Análisis' },
  'analytics.overview': { 'pt-BR': 'Visão Geral', 'en': 'Overview', 'es': 'Resumen' },
  'analytics.performance': { 'pt-BR': 'Desempenho', 'en': 'Performance', 'es': 'Rendimiento' },
  'analytics.trends': { 'pt-BR': 'Tendências', 'en': 'Trends', 'es': 'Tendencias' },
  'analytics.reports': { 'pt-BR': 'Relatórios', 'en': 'Reports', 'es': 'Informes' },
  'analytics.export': { 'pt-BR': 'Exportar', 'en': 'Export', 'es': 'Exportar' },
  'analytics.description': { 'pt-BR': 'Métricas detalhadas e análises por período', 'en': 'Detailed metrics and period analysis', 'es': 'Métricas detalladas y análisis por período' },
  'analytics.period.7d': { 'pt-BR': '7 dias', 'en': '7 days', 'es': '7 días' },
  'analytics.period.30d': { 'pt-BR': '30 dias', 'en': '30 days', 'es': '30 días' },
  'analytics.period.90d': { 'pt-BR': '90 dias', 'en': '90 days', 'es': '90 días' },
  'analytics.period.1y': { 'pt-BR': '1 ano', 'en': '1 year', 'es': '1 año' },
  'analytics.period.all': { 'pt-BR': 'Tudo', 'en': 'All', 'es': 'Todo' },
  'analytics.errorLoading': { 'pt-BR': 'Erro ao carregar analytics', 'en': 'Error loading analytics', 'es': 'Error al cargar análisis' },
  'analytics.monthlyComparison': { 'pt-BR': 'Comparação Mensal', 'en': 'Monthly Comparison', 'es': 'Comparación Mensual' },
  'analytics.thisVsPrevious': { 'pt-BR': 'Este mês vs Mês anterior', 'en': 'This month vs Previous month', 'es': 'Este mes vs Mes anterior' },
  'analytics.stats.projects': { 'pt-BR': 'Projetos', 'en': 'Projects', 'es': 'Proyectos' },
  'analytics.stats.documents': { 'pt-BR': 'Documentos', 'en': 'Documents', 'es': 'Documentos' },
  'analytics.stats.storage': { 'pt-BR': 'Armazenamento', 'en': 'Storage', 'es': 'Almacenamiento' },
  'analytics.stats.completionRate': { 'pt-BR': 'Taxa de Conclusão', 'en': 'Completion Rate', 'es': 'Tasa de Finalización' },
  'analytics.stats.allProjects': { 'pt-BR': 'de todos os projetos', 'en': 'of all projects', 'es': 'de todos los proyectos' },
  'analytics.stats.vsPrevious': { 'pt-BR': 'vs {value} no mês anterior', 'en': 'vs {value} in previous month', 'es': 'vs {value} en el mes anterior' },
}

class I18n {
  private locale: Locale = 'pt-BR'

  constructor() {
    const savedLocale = localStorage.getItem('isacar:locale') as Locale
    if (savedLocale && (savedLocale === 'pt-BR' || savedLocale === 'en' || savedLocale === 'es')) {
      this.locale = savedLocale
    } else {
      const browserLang = navigator.language
      if (browserLang.startsWith('en')) {
        this.locale = 'en'
      } else if (browserLang.startsWith('es')) {
        this.locale = 'es'
      } else {
        this.locale = 'pt-BR'
      }
    }
  }

  translate(key: string, params?: Record<string, any>): string {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    let result = translation[this.locale] || translation['pt-BR'] || key
    
    // Interpolate parameters
    if (params) {
      Object.keys(params).forEach(paramKey => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]))
      })
    }
    
    return result
  }

  setLocale(locale: Locale, saveToSupabase = true) {
    this.locale = locale
    localStorage.setItem('isacar:locale', locale)
    
    if (saveToSupabase) {
      this.saveToSupabase(locale).catch(err => {
        console.warn('Failed to save locale to Supabase:', err)
      })
    }
    
    window.dispatchEvent(new CustomEvent('localechange'))
  }

  async saveToSupabase(locale: Locale) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await supabase.auth.updateUser({
        data: { locale }
      })
    } catch (error) {
      console.error('Error saving locale to Supabase:', error)
      throw error
    }
  }

  async loadFromSupabase(): Promise<Locale | null> {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const userLocale = user.user_metadata?.locale as Locale
      if (userLocale && (userLocale === 'pt-BR' || userLocale === 'en' || userLocale === 'es')) {
        return userLocale
      }
      
      return null
    } catch (error) {
      console.error('Error loading locale from Supabase:', error)
      return null
    }
  }

  getLocale(): Locale {
    return this.locale
  }
}

export const i18n = new I18n()
