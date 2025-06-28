// --- 1. Seletores de Elementos (Melhor Prática: Armazenar Referências) ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const userNameSpan = document.getElementById('userName');
const dashboardNav = document.getElementById('dashboard-nav'); // Nova referência para a navegação
const dashboardSectionsContainer = document.getElementById('dashboard-sections-container'); // Nova referência para o contêiner de seções
const logoutButton = document.querySelector('.logout-button');

const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

// Referências para os campos de email e senha do login
const loginEmailInput = loginForm.querySelector('input[type="email"]');
const loginPasswordInput = loginForm.querySelector('input[type="password"]');

// Referências para as mensagens de erro do login
const loginEmailError = document.getElementById('login-email-error');
const loginPasswordError = document.getElementById('login-password-error');

// Referências para os campos de registro
const registerFullNameInput = registerForm.querySelector('input[type="text"]');
const registerEmailInput = registerForm.querySelector('#register-email');
const registerPasswordInput = registerForm.querySelector('#register-password');

// Referências para as mensagens de erro do registro
const registerFullNameError = document.getElementById('register-name-error');
const registerEmailError = document.getElementById('register-email-error');
const registerPasswordError = document.getElementById('register-password-error');

// Referências do Modal Global
const globalModal = document.getElementById('global-modal');
const closeModalButton = document.querySelector('.modal .close-button');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

// Referência para a mensagem de feedback (toast)
const feedbackMessage = document.getElementById('feedback-message');

// Variáveis globais para gráficos
let wellnessChart = null;
let stressTrendChart = null;

// Dados simulados para lembretes do colaborador (agora dinâmico)
const simulatedReminders = [
    { id: 1, text: 'Tomar água (250ml a cada 2h)', icon: 'fas fa-check-circle', status: 'good' },
    { id: 2, text: 'Agendar consulta anual de rotina', icon: 'fas fa-exclamation-circle', status: 'warning' },
    { id: 3, text: 'Responder pesquisa de clima organizacional', icon: 'fas fa-info-circle', status: 'info' }
];

// --- 2. Funções de Utilitários ---

/**
 * Alterna a exibição entre o formulário de login e o formulário de registro.
 * @param {string} formToShow - O ID do formulário a ser exibido ('login-form' ou 'register-form').
 */
function toggleFormDisplay(formToShow) {
    if (formToShow === 'register-form') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerForm.querySelector('input[type="text"]').focus();
    } else { // formToShow === 'login-form'
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginForm.querySelector('input[type="email"]').focus();
    }
}

/**
 * Exibe ou oculta uma mensagem de validação e adiciona/remove a classe 'is-invalid'.
 * @param {HTMLElement} inputElement - O elemento de input a ser validado.
 * @param {HTMLElement} messageElement - O elemento onde a mensagem de erro será exibida.
 * @param {boolean} isValid - Se o campo é válido (true) ou inválido (false).
 * @param {string} message - A mensagem de erro a ser exibida se isValid for false.
 */
function displayValidationMessage(inputElement, messageElement, isValid, message = '') {
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        messageElement.textContent = '';
        messageElement.style.display = 'none';
    } else {
        inputElement.classList.add('is-invalid');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
    }
}

/**
 * Exibe uma mensagem de feedback (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo da mensagem ('success' ou 'error').
 */
function showFeedback(message, type = 'success') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message show'; // Reset classes
    if (type === 'error') {
        feedbackMessage.classList.add('error');
    } else {
        feedbackMessage.classList.remove('error');
    }

    setTimeout(() => {
        feedbackMessage.classList.remove('show');
    }, 3000); // Esconde após 3 segundos
}

/**
 * Abre o modal global com o título e conteúdo especificados.
 * @param {string} title - Título a ser exibido no cabeçalho do modal.
 * @param {string} contentHTML - Conteúdo HTML a ser injetado no corpo do modal.
 */
function openModal(title, contentHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHTML;
    globalModal.style.display = 'flex'; // Usar flex para centralizar o modal
    globalModal.scrollTop = 0; // Garante que o modal comece do topo ao ser aberto
    document.body.style.overflow = 'hidden'; // Evita rolagem do corpo
}

/**
 * Fecha o modal global.
 */
function closeModal() {
    globalModal.style.display = 'none';
    modalTitle.textContent = '';
    modalBody.innerHTML = '';
    document.body.style.overflow = ''; // Restaura rolagem do corpo
}

// --- 3. Manipuladores de Eventos ---

// Evento de Submissão do Formulário de Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    if (loginEmailInput.value === '' || !loginEmailInput.value.includes('@')) {
        displayValidationMessage(loginEmailInput, loginEmailError, false, 'Por favor, insira um email válido.');
        isValid = false;
    } else {
        displayValidationMessage(loginEmailInput, loginEmailError, true);
    }

    if (loginPasswordInput.value.length < 6) {
        displayValidationMessage(loginPasswordInput, loginPasswordError, false, 'A senha deve ter pelo menos 6 caracteres.');
        isValid = false;
    } else {
        displayValidationMessage(loginPasswordInput, loginPasswordError, true);
    }

    if (!isValid) {
        return;
    }

    const role = document.querySelector('input[name="role"]:checked')?.value || 'colaborador';
    const userName = loginEmailInput.value.split('@')[0];

    userNameSpan.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);

    authContainer.style.display = 'none';
    dashboard.style.display = 'flex'; // Usar flex para o layout do dashboard

    renderDashboard(role);
});

// Evento de Submissão do Formulário de Registro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    if (registerFullNameInput.value.trim() === '') {
        displayValidationMessage(registerFullNameInput, registerFullNameError, false, 'Por favor, preencha o nome completo.');
        isValid = false;
    } else {
        displayValidationMessage(registerFullNameInput, registerFullNameError, true);
    }

    if (registerEmailInput.value === '' || !registerEmailInput.value.includes('@')) {
        displayValidationMessage(registerEmailInput, registerEmailError, false, 'Por favor, insira um email válido para cadastro.');
        isValid = false;
    } else {
        displayValidationMessage(registerEmailInput, registerEmailError, true);
    }

    if (registerPasswordInput.value.length < 8) {
        displayValidationMessage(registerPasswordInput, registerPasswordError, false, 'A senha para cadastro deve ter pelo menos 8 caracteres.');
        isValid = false;
    } else {
        displayValidationMessage(registerPasswordInput, registerPasswordError, true);
    }

    if (!isValid) {
        return;
    }

    console.log('Dados de Registro:', {
        fullName: registerFullNameInput.value,
        email: registerEmailInput.value,
        password: registerPasswordInput.value
    });

    showFeedback("Cadastro realizado com sucesso! Agora você pode fazer login.", 'success');
    toggleFormDisplay('login-form');

    registerFullNameInput.value = '';
    registerEmailInput.value = '';
    registerPasswordInput.value = '';

    displayValidationMessage(registerFullNameInput, registerFullNameError, true);
    displayValidationMessage(registerEmailInput, registerEmailError, true);
    displayValidationMessage(registerPasswordInput, registerPasswordError, true);
});

// Evento de Logout
logoutButton.addEventListener('click', () => {
    dashboard.style.display = 'none';
    authContainer.style.display = 'flex';
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
    loginEmailInput.focus();

    displayValidationMessage(loginEmailInput, loginEmailError, true);
    displayValidationMessage(loginPasswordInput, loginPasswordError, true);

    // Destruir gráficos ao sair para evitar vazamento de memória ou erros
    if (wellnessChart) wellnessChart.destroy();
    if (stressTrendChart) stressTrendChart.destroy();
});

// Event listeners para os links de alternância de formulário
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFormDisplay('register-form');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFormDisplay('login-form');
});

// Event listener para fechar o modal
closeModalButton.addEventListener('click', closeModal);
globalModal.addEventListener('click', (e) => {
    if (e.target === globalModal) { // Fecha apenas se clicar no overlay
        closeModal();
    }
});


// --- 4. Renderização do Dashboard e Conteúdo Modular ---

// Dados simulados para o dashboard do gerente
const simulatedEmployees = [
    { id: 1, name: 'João Silva', email: 'joao.silva@empresa.com', role: 'Desenvolvedor', status: 'Ativo', wellbeing: 'Bom', needs: 'Feedback regular' },
    { id: 2, name: 'Maria Souza', email: 'maria.souza@empresa.com', role: 'Designer', status: 'Ativo', wellbeing: 'Excelente', needs: 'Oportunidades de liderança' },
    { id: 3, name: 'Carlos Santos', email: 'carlos.santos@empresa.com', role: 'Analista QA', status: 'Ativo', wellbeing: 'Atenção', needs: 'Redução de carga de trabalho' },
    { id: 4, name: 'Ana Costa', email: 'ana.costa@empresa.com', role: 'Gerente de Projeto', status: 'Ativo', wellbeing: 'Bom', needs: 'Recursos adicionais' },
    { id: 5, name: 'Fernanda Lima', email: 'fernanda.lima@empresa.com', role: 'RH', status: 'Ativo', wellbeing: 'Bom', needs: 'Autonomia em projetos' },
];

/**
 * Função principal para renderizar o dashboard.
 * @param {string} role - O papel do usuário.
 */
function renderDashboard(role) {
    dashboardSectionsContainer.innerHTML = ''; // Limpa o conteúdo existente
    dashboardNav.innerHTML = ''; // Limpa a navegação existente

    const navItems = [];
    let defaultSectionId = '';

    if (role === 'colaborador') {
        navItems.push(
            { id: 'colaborador-overview', icon: 'fas fa-home', text: 'Visão Geral' },
            { id: 'colaborador-profile', icon: 'fas fa-user-circle', text: 'Meu Perfil' },
            { id: 'colaborador-trainings', icon: 'fas fa-graduation-cap', text: 'Treinamentos' },
            { id: 'colaborador-tips', icon: 'fas fa-lightbulb', text: 'Dicas de Inclusão' }
        );
        defaultSectionId = 'colaborador-overview';
    } else if (role === 'gerente') {
        navItems.push(
            { id: 'manager-overview', icon: 'fas fa-tachometer-alt', text: 'Visão Geral' },
            { id: 'manager-charts', icon: 'fas fa-chart-line', text: 'Análises' },
            { id: 'manager-employees', icon: 'fas fa-users', text: 'Gestão Colaboradores' },
            { id: 'manager-settings', icon: 'fas fa-cog', text: 'Configurações' }
        );
        defaultSectionId = 'manager-overview';
    }

    // Renderiza a navegação
    navItems.forEach(item => {
        const navItemElement = document.createElement('div');
        navItemElement.classList.add('dashboard-nav-item');
        navItemElement.setAttribute('data-section', item.id);
        navItemElement.innerHTML = `<i class="${item.icon}"></i> <span>${item.text}</span>`;
        navItemElement.addEventListener('click', () => showDashboardSection(item.id, role));
        dashboardNav.appendChild(navItemElement);
    });

    // Mostra a seção padrão
    showDashboardSection(defaultSectionId, role);
}

/**
 * Mostra a seção do dashboard correspondente ao ID e esconde as outras.
 * @param {string} sectionId - O ID da seção a ser exibida.
 * @param {string} role - O papel do usuário para determinar o conteúdo.
 */
function showDashboardSection(sectionId, role) {
    // Esconde todas as seções e remove a classe 'active' da navegação
    document.querySelectorAll('.content-section').forEach(section => {
        section.remove(); // Remove para que possam ser recriadas ou injetadas
    });
    document.querySelectorAll('.dashboard-nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });

    // Adiciona a classe 'active' ao item de navegação clicado
    const activeNavItem = document.querySelector(`.dashboard-nav-item[data-section="${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Injeta o HTML da seção correspondente
    let sectionHTML = '';
    let sectionTitle = '';
    let sectionIcon = '';

    if (role === 'colaborador') {
        switch (sectionId) {
            case 'colaborador-overview':
                sectionTitle = 'Visão Geral';
                sectionIcon = 'fas fa-home';
                sectionHTML = getColaboradorOverviewHTML();
                break;
            case 'colaborador-profile':
                sectionTitle = 'Meu Perfil';
                sectionIcon = 'fas fa-user-circle';
                sectionHTML = getColaboradorProfileHTML();
                break;
            case 'colaborador-trainings':
                sectionTitle = 'Treinamentos';
                sectionIcon = 'fas fa-graduation-cap';
                sectionHTML = getColaboradorTrainingsHTML();
                break;
            case 'colaborador-tips':
                sectionTitle = 'Dicas de Inclusão';
                sectionIcon = 'fas fa-lightbulb';
                sectionHTML = getColaboradorTipsHTML();
                break;
            default:
                sectionTitle = 'Seção Não Encontrada';
                sectionHTML = '<p>O conteúdo desta seção não está disponível.</p>';
        }
    } else if (role === 'gerente') {
        switch (sectionId) {
            case 'manager-overview':
                sectionTitle = 'Visão Geral do Gerente';
                sectionIcon = 'fas fa-tachometer-alt';
                sectionHTML = getManagerOverviewHTML();
                break;
            case 'manager-charts':
                sectionTitle = 'Análises de Bem-Estar';
                sectionIcon = 'fas fa-chart-line';
                sectionHTML = getManagerChartsHTML();
                break;
            case 'manager-employees':
                sectionTitle = 'Gestão de Colaboradores';
                sectionIcon = 'fas fa-users';
                sectionHTML = getManagerEmployeeManagementHTML();
                break;
            case 'manager-settings':
                sectionTitle = 'Configurações do Sistema';
                sectionIcon = 'fas fa-cog';
                sectionHTML = getManagerSettingsHTML();
                break;
            default:
                sectionTitle = 'Seção Não Encontrada';
                sectionHTML = '<p>O conteúdo desta seção não está disponível.</p>';
        }
    }

    // Cria a seção e injeta o conteúdo
    const sectionElement = document.createElement('section');
    sectionElement.classList.add('content-section', 'active');
    sectionElement.innerHTML = `
        <h2 class="section-title"><i class="${sectionIcon}"></i> ${sectionTitle}</h2>
        ${sectionHTML}
    `;
    dashboardSectionsContainer.appendChild(sectionElement);

    // Inicializa gráficos se a seção de gráficos estiver ativa
    if (sectionId === 'manager-charts') {
        initializeCharts();
    }
    // Adiciona event listeners específicos para a seção
    addSectionSpecificEventListeners(sectionId, role); // Passa o role para listeners específicos
}

// --- Funções para Gerar HTML de Cada Seção (Colaborador) ---

function getColaboradorOverviewHTML() {
    let remindersListHTML = simulatedReminders.map(reminder => `
        <li><i class="${reminder.icon} ${reminder.status === 'warning' ? 'text-warning' : ''}"></i> ${reminder.text}</li>
    `).join('');

    return `
        <section class="cards-grid">
            <div class="card">
                <h2><i class="fas fa-bullhorn"></i> Avisos da Empresa</h2>
                <p><strong>27 de Junho, 2025:</strong> Reunião Geral da Empresa sobre o novo projeto de IA. Verifique seu e-mail para o link.</p>
                <p><strong>20 de Junho, 2025:</strong> Lançamento do novo programa de bem-estar. Acesse a seção 'Treinamentos' para saber mais!</p>
            </div>
            <div class="card">
                <h2><i class="fas fa-clipboard-list"></i> Meus Lembretes</h2>
                <ul>
                    ${remindersListHTML}
                </ul>
                <button class="btn-dashboard" data-action="open-add-reminder-modal">Adicionar Lembrete</button>
            </div>
            <div class="card">
                <h2><i class="fas fa-external-link-alt"></i> Acesso Rápido</h2>
                <button class="btn-dashboard" data-action="navigate" data-target-section="colaborador-trainings">Treinamentos</button>
                <button class="btn-dashboard" data-action="navigate" data-target-section="colaborador-profile">Meu Perfil</button>
                <button class="btn-dashboard" data-action="open-support-modal">Suporte Técnico</button>
            </div>
        </section>

        <section class="details">
            <h2><i class="fas fa-lightbulb"></i> Dica do Dia</h2>
            <p>"Pequenas pausas ao longo do dia aumentam a produtividade e reduzem a fadiga mental. Que tal um café ou um alongamento agora?"</p>
            <h2><i class="fas fa-robot"></i> Sugestões de Autocuidado (IA)</h2>
            <p>Seu registro de humor indica um leve cansaço. Sugiro uma playlist relaxante e 15 minutos de olhos fechados.</p>
        </section>
    `;
}

function getColaboradorProfileHTML() {
    return `
        <form id="profile-form">
            <p>Mantenha seu perfil atualizado para que possamos oferecer suporte e recursos personalizados.</p>
            <div class="form-grid-2">
                <div class="form-group">
                    <label for="profile-name">Nome Completo</label>
                    <input type="text" id="profile-name" value="Nome do Colaborador" disabled>
                </div>
                <div class="form-group">
                    <label for="profile-email">Email Corporativo</label>
                    <input type="email" id="profile-email" value="colaborador@empresa.com" disabled>
                </div>
            </div>
            <div class="form-group">
                <label for="profile-phone">Telefone</label>
                <input type="tel" id="profile-phone" value="(XX) XXXXX-XXXX">
            </div>
            <div class="form-group">
                <label for="profile-department">Departamento</label>
                <select id="profile-department">
                    <option value="TI">Tecnologia da Informação</option>
                    <option value="RH" selected>Recursos Humanos</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Marketing">Marketing</option>
                </select>
            </div>
            <div class="form-group">
                <label for="profile-preferences">Preferências de Comunicação</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="pref-email" checked><i class="fas fa-envelope"></i> Email</label>
                    <label><input type="checkbox" id="pref-sms"><i class="fas fa-sms"></i> SMS</label>
                    <label><input type="checkbox" id="pref-app" checked><i class="fas fa-mobile-alt"></i> Notificações App</label>
                </div>
            </div>
            <div class="form-group">
                <label for="profile-notes">Notas Pessoais sobre Inclusão</label>
                <textarea id="profile-notes" placeholder="Ex: Preferência por comunicação escrita, necessidade de cadeira ergonômica, etc."></textarea>
            </div>
            <button type="submit" class="btn-primary" id="save-profile-btn"><i class="fas fa-save"></i> Salvar Alterações</button>
        </form>
    `;
}

function getColaboradorTrainingsHTML() {
    return `
        <p>Acesse aqui os treinamentos disponíveis para o seu desenvolvimento e bem-estar.</p>
        <div class="training-grid">
            <div class="training-card">
                <h3><i class="fas fa-brain"></i> Treinamento de Consciência Inclusiva</h3>
                <p>Entenda a importância da diversidade e inclusão no ambiente de trabalho.</p>
                <button class="btn-dashboard btn-secondary" data-action="open-training-modal" data-training-id="1">Iniciar Curso</button>
            </div>
            <div class="training-card">
                <h3><i class="fas fa-hand-holding-heart"></i> Gestão do Estresse e Bem-Estar</h3>
                <p>Técnicas e práticas para gerenciar o estresse e promover sua saúde mental.</p>
                <button class="btn-dashboard btn-secondary" data-action="open-training-modal" data-training-id="2">Continuar</button>
            </div>
            <div class="training-card">
                <h3><i class="fas fa-comments"></i> Comunicação Não-Violenta</h3>
                <p>Aprenda a se comunicar de forma mais eficaz e empática com seus colegas.</p>
                <button class="btn-dashboard btn-secondary" data-action="open-training-modal" data-training-id="3">Ver Detalhes</button>
            </div>
        </div>
    `;
}

function getColaboradorTipsHTML() {
    return `
        <p>Dicas valiosas para um ambiente de trabalho mais inclusivo e acolhedor para todos.</p>
        <div class="tips-grid">
            <div class="tip-card">
                <h3><i class="fas fa-universal-access"></i> Acessibilidade Digital</h3>
                <p>Utilize legendas em vídeos e descrições de imagens para tornar o conteúdo acessível.</p>
            </div>
            <div class="tip-card">
                <h3><i class="fas fa-ear"></i> Escuta Ativa</h3>
                <p>Pratique a escuta ativa para entender verdadeiramente as perspectivas dos colegas.</p>
            </div>
            <div class="tip-card">
                <h3><i class="fas fa-users-cog"></i> Adaptações Simples</h3>
                <p>Pequenas adaptações no ambiente podem fazer grande diferença na inclusão.</p>
            </div>
        </div>
    `;
}

// --- Funções para Gerar HTML de Cada Seção (Gerente) ---

function getManagerOverviewHTML() {
    return `
        <section class="cards-grid">
            <div class="card">
                <h2><i class="fas fa-chart-bar"></i> Bem-Estar Geral da Equipe</h2>
                <p><strong>85%</strong> da equipe reporta bem-estar "Bom" ou "Excelente".</p>
                <p class="text-warning"><strong>1</strong> colaborador requer atenção imediata.</p>
                <button class="btn-dashboard" data-action="navigate" data-target-section="manager-charts">Ver Análises Detalhadas</button>
            </div>
            <div class="card">
                <h2><i class="fas fa-bell"></i> Alertas e Ações Recomendadas</h2>
                <ul>
                    <li><i class="fas fa-exclamation-triangle text-warning"></i> **Alerta:** João Silva com indicadores de fadiga.</li>
                    <li><i class="fas fa-lightbulb"></i> **Recomendação:** Reunião individual de check-in com Carlos Santos.</li>
                    <li><i class="fas fa-calendar-alt"></i> **Próximo Evento:** Workshop de Liderança Inclusiva (15/07).</li>
                </ul>
                <button class="btn-dashboard btn-danger" data-action="open-alerts-modal">Resolver Alertas</button>
            </div>
            <div class="card">
                <h2><i class="fas fa-medal"></i> Destaques e Progresso</h2>
                <p>A equipe de Desenvolvimento completou <strong>100%</strong> dos treinamentos de inclusão.</p>
                <p>Redução de <strong>15%</strong> nas queixas de comunicação nos últimos 3 meses.</p>
                <button class="btn-dashboard btn-info" data-action="open-reports-modal">Ver Relatórios Completos</button>
            </div>
        </section>

        <section class="details">
            <h2><i class="fas fa-robot"></i> Ações Sugeridas pela IA</h2>
            <div class="suggestion-list">
                <div class="suggestion-item">
                    <h3><i class="fas fa-comment-dots"></i> Agendar Sessão de Feedback</h3>
                    <p>Sugestão de agendar feedback 1:1 com João Silva para abordar a fadiga e oferecer suporte. A IA detectou uma queda na performance e humor nos últimos 7 dias.</p>
                    <button class="btn-dashboard" data-action="open-schedule-modal" data-schedule-type="feedback">Agendar Agora</button>
                </div>
                <div class="suggestion-item">
                    <h3><i class="fas fa-handshake"></i> Promover Integração de Novos Colaboradores</h3>
                    <p>Recomendação para organizar um evento de integração para os 2 novos membros da equipe. Foco em atividades que estimulem a colaboração e a empatia.</p>
                    <button class="btn-dashboard btn-secondary" data-action="open-schedule-modal" data-schedule-type="event">Planejar Evento</button>
                </div>
            </div>
        </section>
    `;
}

function getManagerChartsHTML() {
    return `
        <p>Acompanhe as métricas de bem-estar e inclusão da sua equipe em tempo real.</p>
        <div class="chart-section">
            <h2><i class="fas fa-chart-pie"></i> Distribuição do Bem-Estar da Equipe</h2>
            <div class="chart-container">
                <canvas id="wellnessChart"></canvas>
            </div>
            <p class="chart-description">Gráfico de pizza mostrando a proporção de colaboradores por nível de bem-estar.</p>
        </div>

        <div class="chart-section mt-xl">
            <h2><i class="fas fa-chart-line"></i> Tendência de Estresse na Equipe (Últimos 6 meses)</h2>
            <div class="chart-container">
                <canvas id="stressTrendChart"></canvas>
            </div>
            <p class="chart-description">Gráfico de linha mostrando a média do nível de estresse da equipe ao longo do tempo.</p>
        </div>
    `;
}

function getManagerEmployeeManagementHTML() {
    // Tabela de colaboradores
    let employeesTableHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Cargo</th>
                        <th>Status</th>
                        <th>Bem-Estar</th>
                        <th>Necessidades</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    simulatedEmployees.forEach(emp => {
        const wellbeingClass = emp.wellbeing === 'Bom' || emp.wellbeing === 'Excelente' ? 'status-good' : emp.wellbeing === 'Atenção' ? 'status-warning' : 'status-critical';
        employeesTableHTML += `
            <tr>
                <td data-label="ID">${emp.id}</td>
                <td data-label="Nome">${emp.name}</td>
                <td data-label="Email">${emp.email}</td>
                <td data-label="Cargo">${emp.role}</td>
                <td data-label="Status">${emp.status}</td>
                <td data-label="Bem-Estar"><span class="status-badge ${wellbeingClass}">${emp.wellbeing}</span></td>
                <td data-label="Necessidades">${emp.needs}</td>
                <td data-label="Ações">
                    <button class="btn-action-small btn-view" data-employee-id="${emp.id}"><i class="fas fa-eye"></i> Ver</button>
                    <button class="btn-action-small btn-edit" data-employee-id="${emp.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-action-small btn-delete" data-employee-id="${emp.id}"><i class="fas fa-trash"></i> Excluir</button>
                </td>
            </tr>
        `;
    });

    employeesTableHTML += `
                </tbody>
            </table>
        </div>
        <button class="btn-primary mt-xl" id="add-employee-btn"><i class="fas fa-user-plus"></i> Adicionar Novo Colaborador</button>
    `;
    return employeesTableHTML;
}

function getManagerSettingsHTML() {
    return `
        <p>Ajuste as configurações gerais do sistema, permissões de usuários e notificações.</p>
        <form id="settings-form">
            <div class="form-group">
                <label for="system-name">Nome do Sistema</label>
                <input type="text" id="system-name" value="SEI - Sistema Eletrônico de Inclusão">
            </div>
            <div class="form-group">
                <label for="notifications-toggle">Habilitar Notificações Globais</label>
                <input type="checkbox" id="notifications-toggle" checked style="width: auto; margin-left: 10px;">
            </div>
            <div class="form-group">
                <label for="default-role">Função Padrão para Novos Cadastros</label>
                <select id="default-role">
                    <option value="colaborador">Colaborador</option>
                    <option value="visitante">Visitante</option>
                </select>
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-cogs"></i> Salvar Configurações</button>
        </form>
        <div class="mt-xl">
          <p>Para gerenciamento avançado de usuários e permissões, consulte a documentação da API.</p>
        </div>
    `;
}

// --- Funções de Inicialização de Gráficos (Chart.js) ---

function initializeCharts() {
    // Destrói instâncias anteriores para evitar duplicação ou erros
    if (wellnessChart) wellnessChart.destroy();
    if (stressTrendChart) stressTrendChart.destroy();

    // Gráfico de Pizza: Distribuição do Bem-Estar da Equipe
    const wellnessCtx = document.getElementById('wellnessChart');
    if (wellnessCtx) {
        wellnessChart = new Chart(wellnessCtx, {
            type: 'pie',
            data: {
                labels: ['Bom', 'Excelente', 'Atenção'],
                datasets: [{
                    data: [3, 1, 1], // Dados simulados: 3 Bom, 1 Excelente, 1 Atenção (baseado em simulatedEmployees)
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)', // Bom (verde claro)
                        'rgba(54, 162, 235, 0.8)', // Excelente (azul)
                        'rgba(255, 206, 86, 0.8)'  // Atenção (amarelo)
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: 'Distribuição do Bem-Estar da Equipe'
                    }
                }
            }
        });
    }

    // Gráfico de Linha: Tendência de Estresse na Equipe
    const stressTrendCtx = document.getElementById('stressTrendChart');
    if (stressTrendCtx) {
        stressTrendChart = new Chart(stressTrendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Nível Médio de Estresse',
                    data: [65, 59, 80, 81, 56, 75], // Dados simulados
                    fill: true,
                    borderColor: 'rgba(255, 99, 132, 1)', // Vermelho
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Vermelho claro para a área
                    tension: 0.3, // Curva suave
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Não exibir a legenda do dataset
                    },
                    title: {
                        display: false,
                        text: 'Tendência de Estresse na Equipe'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100, // Escala de 0 a 100 para nível de estresse
                        title: {
                            display: true,
                            text: 'Nível de Estresse (0-100)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Mês'
                        }
                    }
                }
            }
        });
    }
}

// --- Funções para Conteúdo de Modais ---

function getAddReminderModalHTML() {
    return `
        <form id="add-reminder-form">
            <div class="form-group">
                <label for="reminder-text">Lembrete</label>
                <input type="text" id="reminder-text" placeholder="Ex: Fazer exercício, Ligação importante" required>
            </div>
            <div class="form-group">
                <label for="reminder-type">Tipo de Lembrete</label>
                <select id="reminder-type">
                    <option value="good">Geral (Info)</option>
                    <option value="warning">Atenção (Alerta)</option>
                </select>
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-plus-circle"></i> Adicionar Lembrete</button>
        </form>
    `;
}

function getSupportModalHTML() {
    return `
        <form id="support-form">
            <p>Por favor, descreva seu problema ou solicitação de suporte. Entraremos em contato em breve.</p>
            <div class="form-group">
                <label for="support-subject">Assunto</label>
                <input type="text" id="support-subject" placeholder="Ex: Problema com login, Dúvida sobre treinamentos" required>
            </div>
            <div class="form-group">
                <label for="support-message">Mensagem</label>
                <textarea id="support-message" rows="5" placeholder="Descreva detalhadamente o que você precisa." required></textarea>
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> Enviar Solicitação</button>
        </form>
    `;
}

function getTrainingModalHTML(trainingId) {
    const trainings = {
        1: {
            title: 'Treinamento de Consciência Inclusiva',
            description: 'Este curso essencial explora os princípios da diversidade, equidade e inclusão, capacitando você a criar um ambiente de trabalho mais acolhedor e produtivo para todos. Aborda temas como vieses inconscientes, comunicação inclusiva e acessibilidade.',
            status: 'Em andamento',
            progress: '30%',
            details: `
                <p><strong>Duração:</strong> 4 horas</p>
                <p><strong>Módulos:</strong> 5</p>
                <p><strong>Instrutor:</strong> Dra. Ana Paula Costa</p>
                <p><strong>Seu Progresso:</strong> <span style="font-weight: bold; color: green;">${'30% Concluído'}</span></p>
                <div style="background-color: #e0e0e0; border-radius: 5px; height: 10px; margin-top: 5px;">
                    <div style="width: 30%; background-color: #26A69A; height: 100%; border-radius: 5px;"></div>
                </div>
            `
        },
        2: {
            title: 'Gestão do Estresse e Bem-Estar',
            description: 'Aprenda técnicas e estratégias eficazes para gerenciar o estresse no dia a dia, promover a saúde mental e melhorar sua qualidade de vida. Inclui exercícios de mindfulness e respiração.',
            status: 'Não Iniciado',
            progress: '0%',
            details: `
                <p><strong>Duração:</strong> 3 horas</p>
                <p><strong>Módulos:</strong> 4</p>
                <p><strong>Instrutor:</strong> Psic. Ricardo Alves</p>
                <p><strong>Seu Progresso:</strong> <span style="font-weight: bold; color: gray;">${'Não Iniciado'}</span></p>
                <div style="background-color: #e0e0e0; border-radius: 5px; height: 10px; margin-top: 5px;">
                    <div style="width: 0%; background-color: #26A69A; height: 100%; border-radius: 5px;"></div>
                </div>
            `
        },
        3: {
            title: 'Comunicação Não-Violenta',
            description: 'Desenvolva habilidades para se comunicar de forma mais empática, construtiva e assertiva, reduzindo conflitos e fortalecendo relacionamentos interpessoais.',
            status: 'Concluído',
            progress: '100%',
            details: `
                <p><strong>Duração:</strong> 2.5 horas</p>
                <p><strong>Módulos:</strong> 3</p>
                <p><strong>Instrutor:</strong> Soci. Patrícia Mendes</p>
                <p><strong>Seu Progresso:</strong> <span style="font-weight: bold; color: #26A69A;">${'100% Concluído'} <i class="fas fa-check-circle"></i></span></p>
                <div style="background-color: #e0e0e0; border-radius: 5px; height: 10px; margin-top: 5px;">
                    <div style="width: 100%; background-color: #26A69A; height: 100%; border-radius: 5px;"></div>
                </div>
            `
        }
    };

    const training = trainings[trainingId];
    if (!training) return '<p>Treinamento não encontrado.</p>';

    return `
        <h3 style="font-size: 1.3rem; color: var(--color-brand-primary); margin-bottom: 10px;">${training.title}</h3>
        <p>${training.description}</p>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--color-border-light);">
            <h4>Detalhes do Curso:</h4>
            ${training.details}
        </div>
        <button class="btn-primary" style="margin-top: 20px;">
            <i class="fas fa-play-circle"></i> ${training.status === 'Concluído' ? 'Revisar Curso' : training.status === 'Em andamento' ? 'Continuar Curso' : 'Iniciar Curso'}
        </button>
    `;
}

// --- Listeners Específicos da Seção (para elementos injetados) ---
function addSectionSpecificEventListeners(sectionId, role) {
    if (sectionId === 'colaborador-overview') {
        const addReminderBtn = document.querySelector('[data-action="open-add-reminder-modal"]');
        if (addReminderBtn) {
            addReminderBtn.addEventListener('click', () => {
                openModal('Adicionar Novo Lembrete', getAddReminderModalHTML());
                const addReminderForm = document.getElementById('add-reminder-form');
                if (addReminderForm) {
                    addReminderForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const reminderText = document.getElementById('reminder-text').value;
                        const reminderType = document.getElementById('reminder-type').value;

                        if (reminderText.trim() !== '') {
                            const newReminder = {
                                id: simulatedReminders.length > 0 ? Math.max(...simulatedReminders.map(r => r.id)) + 1 : 1,
                                text: reminderText,
                                icon: reminderType === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle',
                                status: reminderType
                            };
                            simulatedReminders.push(newReminder);
                            showFeedback('Lembrete adicionado com sucesso!', 'success');
                            closeModal();
                            // Recarrega a seção para mostrar o novo lembrete
                            showDashboardSection('colaborador-overview', role);
                        } else {
                            showFeedback('Por favor, digite o texto do lembrete.', 'error');
                        }
                    });
                }
            });
        }

        const supportBtn = document.querySelector('[data-action="open-support-modal"]');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                openModal('Suporte Técnico', getSupportModalHTML());
                const supportForm = document.getElementById('support-form');
                if (supportForm) {
                    supportForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const subject = document.getElementById('support-subject').value;
                        const message = document.getElementById('support-message').value;
                        console.log('Solicitação de suporte enviada:', { subject, message });
                        showFeedback('Sua solicitação de suporte foi enviada! Entraremos em contato.', 'success');
                        closeModal();
                    });
                }
            });
        }

        // Lidar com botões de navegação rápida nos cards
        document.querySelectorAll('.btn-dashboard[data-action="navigate"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetSection = e.currentTarget.getAttribute('data-target-section');
                showDashboardSection(targetSection, role);
            });
        });

    } else if (sectionId === 'colaborador-profile') {
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showFeedback("Perfil salvo com sucesso!", 'success');
                // Em um sistema real, aqui você enviaria os dados para um backend.
                console.log("Perfil Salvo (simulado)");
            });
        }
    } else if (sectionId === 'colaborador-trainings') {
        document.querySelectorAll('[data-action="open-training-modal"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const trainingId = e.currentTarget.getAttribute('data-training-id');
                openModal('Detalhes do Treinamento', getTrainingModalHTML(trainingId));
                // Event listener para o botão dentro do modal (Iniciar/Continuar/Revisar)
                const modalActionBtn = document.querySelector('#global-modal .btn-primary');
                if (modalActionBtn) {
                    modalActionBtn.addEventListener('click', () => {
                        showFeedback(`Simulando ação para o treinamento ${trainingId}!`, 'success');
                        closeModal();
                        // Em um cenário real, você redirecionaria para a página do curso ou iniciaria o player
                    });
                }
            });
        });
    } else if (sectionId === 'manager-overview') {
        // Implementar funcionalidade para "Resolver Alertas"
        const resolveAlertsBtn = document.querySelector('[data-action="open-alerts-modal"]');
        if (resolveAlertsBtn) {
            resolveAlertsBtn.addEventListener('click', () => {
                const alertsContent = `
                    <p>Aqui você veria uma lista de alertas ativos na equipe e poderia marcar como resolvido.</p>
                    <ul>
                        <li><input type="checkbox" id="alert1"><label for="alert1">Alerta: João Silva com fadiga (detectado pela IA)</label></li>
                        <li><input type="checkbox" id="alert2"><label for="alert2">Reunião de check-in pendente com Carlos Santos</label></li>
                    </ul>
                    <button class="btn-primary" style="margin-top: 20px;"><i class="fas fa-check-double"></i> Marcar Selecionados como Resolvidos</button>
                `;
                openModal('Gerenciar Alertas', alertsContent);

                // Listener para o botão de "Marcar como Resolvido" dentro do modal
                const markResolvedBtn = document.querySelector('#global-modal .btn-primary');
                if (markResolvedBtn) {
                    markResolvedBtn.addEventListener('click', () => {
                        showFeedback('Alertas selecionados marcados como resolvidos! (simulado)', 'success');
                        closeModal();
                        // Em um sistema real, aqui você faria a atualização no backend
                    });
                }
            });
        }

        // Implementar funcionalidade para "Ver Relatórios Completos"
        const viewReportsBtn = document.querySelector('[data-action="open-reports-modal"]');
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', () => {
                const reportsContent = `
                    <p>Esta seção apresentaria relatórios detalhados sobre bem-estar, inclusão, produtividade e engajamento da equipe.</p>
                    <ul>
                        <li><i class="fas fa-file-pdf"></i> <a href="#" onclick="showFeedback('Abrindo Relatório de Engajamento... (simulado)'); return false;">Relatório de Engajamento Q2 2025</a></li>
                        <li><i class="fas fa-file-chart-pie"></i> <a href="#" onclick="showFeedback('Abrindo Análise de Diversidade... (simulado)'); return false;">Análise de Diversidade e Inclusão</a></li>
                        <li><i class="fas fa-file-excel"></i> <a href="#" onclick="showFeedback('Exportando Dados de Bem-Estar... (simulado)'); return false;">Exportar Dados de Bem-Estar (CSV)</a></li>
                    </ul>
                `;
                openModal('Relatórios Completos', reportsContent);
            });
        }

        // Implementar funcionalidade para "Agendar Agora" / "Planejar Evento" (Sugestões da IA)
        document.querySelectorAll('[data-action="open-schedule-modal"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const scheduleType = e.currentTarget.getAttribute('data-schedule-type');
                let modalTitleText = '';
                let formContent = '';

                if (scheduleType === 'feedback') {
                    modalTitleText = 'Agendar Sessão de Feedback';
                    formContent = `
                        <form id="schedule-feedback-form">
                            <div class="form-group">
                                <label for="feedback-employee">Colaborador</label>
                                <input type="text" id="feedback-employee" value="João Silva" disabled>
                            </div>
                            <div class="form-group">
                                <label for="feedback-date">Data</label>
                                <input type="date" id="feedback-date" required>
                            </div>
                            <div class="form-group">
                                <label for="feedback-time">Hora</label>
                                <input type="time" id="feedback-time" required>
                            </div>
                            <div class="form-group">
                                <label for="feedback-notes">Assunto / Notas</label>
                                <textarea id="feedback-notes" rows="3">Abordar indicadores de fadiga e oferecer suporte.</textarea>
                            </div>
                            <button type="submit" class="btn-primary"><i class="fas fa-calendar-plus"></i> Confirmar Agendamento</button>
                        </form>
                    `;
                } else if (scheduleType === 'event') {
                    modalTitleText = 'Planejar Evento de Integração';
                    formContent = `
                        <form id="schedule-event-form">
                            <div class="form-group">
                                <label for="event-name">Nome do Evento</label>
                                <input type="text" id="event-name" value="Integração de Novos Membros" required>
                            </div>
                            <div class="form-group">
                                <label for="event-date">Data</label>
                                <input type="date" id="event-date" required>
                            </div>
                            <div class="form-group">
                                <label for="event-location">Local</label>
                                <input type="text" id="event-location" value="Sala de Reuniões Alpha" required>
                            </div>
                            <div class="form-group">
                                <label for="event-description">Descrição</label>
                                <textarea id="event-description" rows="3">Atividades para promover colaboração e empatia entre os novos e atuais colaboradores.</textarea>
                            </div>
                            <button type="submit" class="btn-primary"><i class="fas fa-calendar-check"></i> Criar Evento</button>
                        </form>
                    `;
                }
                openModal(modalTitleText, formContent);

                // Adicionar listeners aos formulários dentro do modal
                const scheduleFeedbackForm = document.getElementById('schedule-feedback-form');
                if (scheduleFeedbackForm) {
                    scheduleFeedbackForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        console.log('Feedback agendado:');
                        showFeedback('Sessão de feedback agendada com sucesso! (simulado)', 'success');
                        closeModal();
                    });
                }
                const scheduleEventForm = document.getElementById('schedule-event-form');
                if (scheduleEventForm) {
                    scheduleEventForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        console.log('Evento planejado:');
                        showFeedback('Evento de integração criado com sucesso! (simulado)', 'success');
                        closeModal();
                    });
                }
            });
        });

        // Lidar com botões de navegação rápida nos cards
        document.querySelectorAll('.btn-dashboard[data-action="navigate"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetSection = e.currentTarget.getAttribute('data-target-section');
                showDashboardSection(targetSection, role);
            });
        });

    } else if (sectionId === 'manager-employees') {
        // Event listeners para botões da tabela de colaboradores
        document.querySelectorAll('.btn-action-small').forEach(button => {
            button.addEventListener('click', (e) => {
                const employeeId = e.currentTarget.getAttribute('data-employee-id');
                const action = e.currentTarget.textContent.trim().toLowerCase().includes('ver') ? 'view' :
                               e.currentTarget.textContent.trim().toLowerCase().includes('editar') ? 'edit' : 'delete';

                if (action === 'view' || action === 'edit') {
                    const employee = simulatedEmployees.find(emp => emp.id == employeeId);
                    if (employee) {
                        let modalContent = '';
                        if (action === 'view') {
                            modalContent = `
                                <p><strong>Nome:</strong> ${employee.name}</p>
                                <p><strong>Email:</strong> ${employee.email}</p>
                                <p><strong>Cargo:</strong> ${employee.role}</p>
                                <p><strong>Status:</strong> ${employee.status}</p>
                                <p><strong>Bem-Estar:</strong> ${employee.wellbeing}</p>
                                <p><strong>Necessidades:</strong> ${employee.needs}</p>
                            `;
                            openModal(`Detalhes de ${employee.name}`, modalContent);
                        } else { // edit
                            modalContent = `
                                <form id="edit-employee-form">
                                    <div class="form-group">
                                        <label for="edit-name">Nome</label>
                                        <input type="text" id="edit-name" value="${employee.name}" disabled>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-email">Email</label>
                                        <input type="email" id="edit-email" value="${employee.email}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-role">Cargo</label>
                                        <input type="text" id="edit-role" value="${employee.role}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-wellbeing">Bem-Estar</label>
                                        <select id="edit-wellbeing">
                                            <option value="Bom" ${employee.wellbeing === 'Bom' ? 'selected' : ''}>Bom</option>
                                            <option value="Excelente" ${employee.wellbeing === 'Excelente' ? 'selected' : ''}>Excelente</option>
                                            <option value="Atenção" ${employee.wellbeing === 'Atenção' ? 'selected' : ''}>Atenção</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-needs">Necessidades</label>
                                        <textarea id="edit-needs">${employee.needs}</textarea>
                                    </div>
                                    <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Salvar Alterações</button>
                                </form>
                            `;
                            openModal(`Editar Colaborador: ${employee.name}`, modalContent);

                            // Adicionar listener ao formulário dentro do modal
                            const editEmployeeForm = document.getElementById('edit-employee-form');
                            if(editEmployeeForm) {
                                editEmployeeForm.addEventListener('submit', (e) => {
                                    e.preventDefault();
                                    showFeedback(`Informações de ${employee.name} salvas! (simulado)`, 'success');
                                    closeModal();
                                    // Em um sistema real, você enviaria os dados atualizados para o backend
                                    console.log(`Dados atualizados para ${employee.name}:`, {
                                        email: document.getElementById('edit-email').value,
                                        role: document.getElementById('edit-role').value,
                                        wellbeing: document.getElementById('edit-wellbeing').value,
                                        needs: document.getElementById('edit-needs').value
                                    });
                                    // Recarrega a seção para refletir as mudanças (simulado)
                                    showDashboardSection('manager-employees', role);
                                });
                            }
                        }
                    }
                } else if (action === 'delete') {
                    if (confirm(`Tem certeza que deseja excluir o colaborador ID ${employeeId}?`)) {
                        const index = simulatedEmployees.findIndex(emp => emp.id == employeeId);
                        if (index > -1) {
                            const deletedEmployeeName = simulatedEmployees[index].name;
                            simulatedEmployees.splice(index, 1); // Remove do array simulado
                            showFeedback(`${deletedEmployeeName} foi excluído com sucesso! (simulado)`, 'success');
                            // Recarrega a seção para refletir a exclusão
                            showDashboardSection('manager-employees', role);
                        }
                    }
                }
            });
        });

        // Listener para o botão "Adicionar Novo Colaborador"
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                const addEmployeeFormHTML = `
                    <form id="add-employee-form">
                        <div class="form-group">
                            <label for="new-name">Nome Completo</label>
                            <input type="text" id="new-name" required>
                        </div>
                        <div class="form-group">
                            <label for="new-email">Email</label>
                            <input type="email" id="new-email" required>
                        </div>
                        <div class="form-group">
                            <label for="new-role">Cargo</label>
                            <input type="text" id="new-role" required>
                        </div>
                        <div class="form-group">
                            <label for="new-wellbeing">Bem-Estar Inicial</label>
                            <select id="new-wellbeing" required>
                                <option value="Bom">Bom</option>
                                <option value="Excelente">Excelente</option>
                                <option value="Atenção">Atenção</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-needs">Necessidades Iniciais</label>
                            <textarea id="new-needs"></textarea>
                        </div>
                        <button type="submit" class="btn-primary"><i class="fas fa-plus-circle"></i> Adicionar Colaborador</button>
                    </form>
                `;
                openModal('Adicionar Novo Colaborador', addEmployeeFormHTML);

                const addEmployeeForm = document.getElementById('add-employee-form');
                if (addEmployeeForm) {
                    addEmployeeForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const newEmployee = {
                            id: simulatedEmployees.length > 0 ? Math.max(...simulatedEmployees.map(emp => emp.id)) + 1 : 1,
                            name: document.getElementById('new-name').value,
                            email: document.getElementById('new-email').value,
                            role: document.getElementById('new-role').value,
                            status: 'Ativo',
                            wellbeing: document.getElementById('new-wellbeing').value,
                            needs: document.getElementById('new-needs').value,
                        };
                        simulatedEmployees.push(newEmployee);
                        showFeedback(`${newEmployee.name} adicionado(a) com sucesso! (simulado)`, 'success');
                        closeModal();
                        // Recarrega a seção para mostrar o novo colaborador
                        showDashboardSection('manager-employees', role);
                    });
                }
            });
        }
    } else if (sectionId === 'manager-settings') {
      const settingsForm = document.getElementById('settings-form');
      if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
          e.preventDefault();
          showFeedback("Configurações salvas com sucesso! (simulado)", 'success');
          console.log("Configurações salvas (simulado)");
        });
      }
    }
}


// --- 5. Inicialização (Estado Inicial) ---
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const authContainer = document.getElementById('auth-container');

    // Mostra a tela de boas-vindas por um tempo e depois a esconde
    setTimeout(() => {
        welcomeScreen.classList.add('fade-out'); // Inicia a transição de saída
        welcomeScreen.addEventListener('transitionend', () => {
            welcomeScreen.style.display = 'none'; // Esconde completamente após a transição
            authContainer.style.display = 'flex'; // Mostra o container de autenticação
            toggleFormDisplay('login-form'); // Garante que o formulário de login esteja ativo
        }, { once: true }); // Garante que o listener seja removido após uma execução
    }, 3000); // Exibe a tela de boas-vindas por 3 segundos (ajuste conforme preferir)
});