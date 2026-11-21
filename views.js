
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;').replace(/`/g, '&#96;');
}

const authShowcase = () => `
    <aside class="auth-showcase">
        <p class="page-eyebrow">ORION / SECURE ACCESS</p>
        <h1>One trusted workspace for coordinated work.</h1>
        <p>Manage assignments, submit verified progress, and keep organization activity in one secure place.</p>
        <div class="auth-points">
            <div><span>01</span><strong>Clear ownership</strong></div>
            <div><span>02</span><strong>Reviewed progress</strong></div>
            <div><span>03</span><strong>Scoped access</strong></div>
        </div>
    </aside>
`;

export const Views = {
    renderTaskRow: (task, workers = []) => `
        <div class="task-row-3d task-compact-row" data-task-id="${escapeHtml(task.id)}">
            <div>
                <div class="task-row-title" style="font-weight: 600; color: var(--text-primary);">${escapeHtml(task.title)}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(task.projectName ? `${task.projectName} (#${task.projectId})` : `Project #${task.projectId}`)}</div>
                ${task.description ? `<div class="task-row-desc" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">${escapeHtml(task.description)}</div>` : ''}
                <div style="margin-top: 0.25rem; display: flex; gap: 0.4rem; align-items: center;">
                    <span class="task-row-priority" style="font-size: 0.7rem; padding: 0.1rem 0.35rem; border-radius: 4px; background: rgba(255,255,255,0.08); text-transform: uppercase;">${escapeHtml(task.priority || 'normal')}</span>
                    ${task.deadline ? `<span class="task-row-deadline" style="font-size: 0.72rem; color: var(--text-muted);">Due: ${escapeHtml(task.deadline)}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right;">
                <span class="status-pill ${task.status === 'Completed' ? 'status-pill--complete' : 'status-pill--active'} task-row-status">${escapeHtml(task.status)}</span>
                <div class="task-row-progress" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">${Number(task.progress) || 0}%</div>
            </div>
            <div class="task-actions" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm edit-task-btn"
                    data-task-id="${escapeHtml(task.id)}"
                    data-title="${escapeHtml(task.title)}"
                    data-description="${escapeHtml(task.description || '')}"
                    data-status="${escapeHtml(task.status)}"
                    data-priority="${escapeHtml(task.priority || 'normal')}"
                    data-deadline="${escapeHtml(task.deadline || '')}"
                    data-progress="${Number(task.progress) || 0}">Edit</button>
                <select class="form-input form-input-sm reassign-task-select" data-task-id="${escapeHtml(task.id)}" style="font-size: 0.78rem; padding: 0.2rem 0.4rem; width: auto; display: inline-block;">
                    <option value="" disabled selected>Reassign...</option>
                    ${workers.map(w => `
                        <option value="${escapeHtml(w.id)}" ${Number(w.id) === Number(task.assignedTo) ? 'disabled' : ''}>
                            ${escapeHtml(w.name || w.username)}${Number(w.id) === Number(task.assignedTo) ? ' (Current)' : ''}
                        </option>
                    `).join('')}
                </select>
                <button class="btn btn-danger btn-sm delete-task-btn" data-task-id="${escapeHtml(task.id)}" data-title="${escapeHtml(task.title)}">Delete</button>
            </div>
            <details class="subtask-create"><summary>Add subtask</summary><form class="create-subtask-form" data-task-id="${escapeHtml(task.id)}"><label>Title<input name="title" class="form-input" required maxlength="200"></label><label>Assign to<select name="assignedTo" class="form-input" required>${workers.map(w=>`<option value="${escapeHtml(w.id)}">${escapeHtml(w.name||w.username)}</option>`).join('')}</select></label><button class="btn btn-outline btn-sm" type="submit">Create</button></form></details>
        </div>
        ${(task.subtasks||[]).map(s=>`<div class="subtask-row"><div><strong>${escapeHtml(s.title)}</strong><span class="status-pill">${escapeHtml(s.status)}</span><p class="field-hint">${escapeHtml(s.submissionText||'Awaiting worker submission')}</p></div>${s.status==='submitted'?`<button class="btn btn-success btn-sm review-subtask-btn" data-subtask-id="${escapeHtml(s.id)}" data-action="approve">Approve</button><button class="btn btn-danger btn-sm review-subtask-btn" data-subtask-id="${escapeHtml(s.id)}" data-action="reject">Return</button>`:''}</div>`).join('')}
    `,

    landing: () => `
        <div class="hero-section-enhanced">
            <div class="hero-container">
                <div class="hero-left">
                    <div class="status-indicator">
                        <span class="status-dot-green"></span> PROJECT · TASK · APPROVAL WORKFLOWS
                    </div>
                    <h1 class="hero-title-enhanced">ORION <span style="color: var(--accent);">PRIME</span></h1>
                    <p class="hero-subtitle-enhanced">
                        Centralized high-integrity system oversight for national intelligence and operations. 
                        Streamlining coordination across secure data channels, verified progress reports, and multi-tenant resource boundaries.
                    </p>
                    <div class="hero-actions">
                        <a href="#/login" class="btn btn-primary btn-glow">INITIALIZE PORTAL</a>
                        <a href="#/about" class="btn btn-outline">SYSTEM ARCHITECTURE</a>
                    </div>
                </div>
                <div class="hero-right">
                    <div id="canvas3d-container">
                        <div class="canvas-glow"></div>
                    </div>
                </div>
            </div>
            <div class="page-actions" style="justify-content:center; margin-top:2rem;">
                <a href="#/create-organization" class="btn btn-primary">Create an organization</a>
                <a href="#/admin" class="btn btn-outline">Website administrator portal</a>
            </div>
        </div>

        <div class="app-container" style="min-height: auto; padding-bottom: 2rem;">
            <div class="widgets-row">
                <div class="widget-card float-anim">
                    <div class="widget-icon">ORG</div>
                    <div class="widget-stat stat-animate">Verified</div>
                    <div>Organization onboarding</div>
                </div>
                <div class="widget-card float-anim">
                    <div class="widget-icon">TASK</div>
                    <div class="widget-stat stat-animate">Reviewed</div>
                    <div>Subtask progress</div>
                </div>
                <div class="widget-card float-anim">
                    <div class="widget-icon">ACCESS</div>
                    <div class="widget-stat stat-animate">Scoped</div>
                    <div>Organization access</div>
                </div>
            </div>
        </div>

        <div class="features-section">
            <span class="section-tag">Capabilities Overview</span>
            <h2 class="section-title">Operational Core Modules</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon-wrapper" aria-hidden="true">01</div>
                    <h3 class="feature-title">Multi-Tenant Vault Matrix</h3>
                    <p class="feature-desc">Organization membership and tenant-scoped queries keep project and task access within the verified organization.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-wrapper" aria-hidden="true">02</div>
                    <h3 class="feature-title">Live Node Synchronization</h3>
                    <p class="feature-desc">Approved reports and subtasks update project progress and create a visible activity record.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-wrapper" aria-hidden="true">03</div>
                    <h3 class="feature-title">Role-Based Integrity Rules</h3>
                    <p class="feature-desc">Distinct permission layers: Worker submissions, Manager approval workflows, and Executive-level analytical oversight.</p>
                </div>
            </div>
        </div>
    `,

    login: ({ enableDemoAccounts = false, next = null } = {}) => {
        let noticeHtml = '';
        if (next === 'schemes') {
            noticeHtml = `
                <div class="auth-notice-banner" style="background: rgba(208, 173, 99, 0.12); border: 1px solid rgba(208, 173, 99, 0.35); border-radius: var(--radius-sm, 6px); padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--accent); display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span><strong>Authentication Required:</strong> Please sign in to view and evaluate Government Schemes for your organization.</span>
                </div>`;
        } else if (next === 'organizations') {
            noticeHtml = `
                <div class="auth-notice-banner" style="background: rgba(208, 173, 99, 0.12); border: 1px solid rgba(208, 173, 99, 0.35); border-radius: var(--radius-sm, 6px); padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--accent); display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span><strong>Authentication Required:</strong> Please sign in to manage organizations.</span>
                </div>`;
        }

        return `
        <div class="auth-layout">
            ${authShowcase()}
            <div class="card auth-card" style="animation: scaleIn var(--dur-modal) var(--ease-smooth) forwards;">
                ${noticeHtml}
                <p class="page-eyebrow auth-card-eyebrow">RETURNING PERSONNEL</p>
                <h2 class="auth-heading">System Login</h2>
                <form id="login-form" novalidate>
                    <div class="form-group">
                        <label for="login-username">Email or username</label>
                        <input type="text" id="login-username" name="username" class="form-input" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" name="password" class="form-input" autocomplete="current-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">AUTHENTICATE</button>

                    <div style="text-align: center; font-size: 0.9rem;">
                        <span style="color: var(--text-secondary);">New Personnel?</span>
                        <a href="#/register" id="toggle-register" style="color: var(--accent); text-decoration: none; font-weight: 600;"> Create Access ID</a>
                    </div>
                    <div style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem;">
                        <a href="#/reset" style="color: var(--text-muted); text-decoration: underline;">Forgot Password?</a>
                    </div>
                    <p id="login-error" style="color: var(--error); text-align: center; margin-top: 1rem;"></p>
                </form>

                ${enableDemoAccounts ? `
                <div class="demo-credentials-section">
                    <div class="demo-credentials-divider">
                        <span>DEMO ACCOUNTS</span>
                    </div>
                    <p class="demo-credentials-hint">Click any card below to auto-fill and log in instantly.</p>
                    <div class="demo-credentials-grid">
                        <button type="button" class="demo-credential-card demo-credential--admin" data-demo-user="admin@orion.demo" data-demo-pass="Admin@1234">
                            <span class="demo-credential-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4"/></svg>
                            </span>
                            <span class="demo-credential-role">Platform Admin</span>
                            <span class="demo-credential-name">Arjun Mehta</span>
                            <span class="demo-credential-email">admin@orion.demo</span>
                            <span class="demo-credential-pass">Admin@1234</span>
                        </button>
                        <button type="button" class="demo-credential-card demo-credential--manager" data-demo-user="manager@orion.demo" data-demo-pass="Manager@1234">
                            <span class="demo-credential-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                            </span>
                            <span class="demo-credential-role">Manager</span>
                            <span class="demo-credential-name">Priya Sharma</span>
                            <span class="demo-credential-email">manager@orion.demo</span>
                            <span class="demo-credential-pass">Manager@1234</span>
                        </button>
                        <button type="button" class="demo-credential-card demo-credential--worker" data-demo-user="worker@orion.demo" data-demo-pass="Worker@1234">
                            <span class="demo-credential-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </span>
                            <span class="demo-credential-role">Worker</span>
                            <span class="demo-credential-name">Rahul Verma</span>
                            <span class="demo-credential-email">worker@orion.demo</span>
                            <span class="demo-credential-pass">Worker@1234</span>
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    },

    register: () => `
        <div class="auth-layout">
            ${authShowcase()}
            <div class="card auth-card" style="animation: scaleIn var(--dur-modal) var(--ease-smooth) forwards;">
                <p class="page-eyebrow auth-card-eyebrow">NEW PERSONNEL</p>
                <h2 class="auth-heading">Create your account</h2>
                <form id="register-form" novalidate aria-describedby="register-error">
                    <div class="form-group">
                        <label for="reg-name">Full name</label>
                        <input type="text" id="reg-name" name="name" class="form-input" autocomplete="name" required aria-invalid="false" aria-describedby="error-name">
                        <p class="field-error" id="error-name"></p>
                    </div>
                    <p class="form-hint">New accounts start as team members. Organization administrators are assigned after verification.</p>
                    <div class="form-group">
                        <label for="reg-email">Email</label>
                        <input type="email" id="reg-email" name="username" class="form-input" autocomplete="email" required aria-invalid="false" aria-describedby="error-username">
                        <p class="field-error" id="error-username"></p>
                    </div>
                    <div class="form-group">
                        <label for="reg-password">Password</label>
                        <input type="password" name="password" id="reg-password" class="form-input" autocomplete="new-password" required aria-invalid="false" aria-describedby="error-password">
                        <p class="field-error" id="error-password"></p>
                    </div>
                    <div class="form-group">
                        <label for="reg-confirm-password">Confirm password</label>
                        <input type="password" name="confirmPassword" id="reg-confirm-password" class="form-input" autocomplete="new-password" required aria-invalid="false" aria-describedby="error-confirmPassword">
                        <p class="field-error" id="error-confirmPassword"></p>
                    </div>
                    <div class="form-group password-toggle-row">
                        <input type="checkbox" id="show-password">
                        <label for="show-password">Show password</label>
                    </div>
                    <button type="submit" id="reg-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">CREATE ACCOUNT</button>

                    <div style="text-align: center;">
                        <a href="#/login" id="back-to-login" style="color: var(--text-muted);">Cancel / Back to Login</a>
                    </div>
                    <p id="register-error" class="form-error" role="alert" aria-live="polite"></p>
                </form>
            </div>
        </div>
    `,

    resetPassword: () => `
        <div class="auth-layout">
            ${authShowcase()}
            <div class="card auth-card" style="animation: scaleIn var(--dur-modal) var(--ease-smooth) forwards;">
                <p class="page-eyebrow auth-card-eyebrow">ACCOUNT RECOVERY</p>
                <h2 class="auth-heading">Reset Password</h2>

                <form id="reset-request-form">
                    <div class="form-group">
                        <label for="reset-email">Email address</label>
                        <input type="email" id="reset-email" name="email" class="form-input" autocomplete="email" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">SEND RESET LINK</button>
                </form>
                <form id="reset-confirm-form" hidden style="margin-top: 1rem;">
                    <div class="form-group">
                        <label for="reset-new-password">New password</label>
                        <input type="password" id="reset-new-password" name="newPassword" class="form-input" autocomplete="new-password" minlength="8" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">RESET PASSWORD</button>
                </form>

                <p id="reset-status" role="status" aria-live="polite" style="text-align: center; margin-top: 1rem;"></p>
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="#/login" style="color: var(--text-muted);">Back to Login</a>
                </div>
            </div>
        </div>
    `,

    about: () => `
        <div class="content-page main-container">
            <header class="page-heading">
                <p class="page-eyebrow">PLATFORM PROFILE</p>
                <h1>About Project Orion</h1>
                <p class="page-lead">
                Project Orion is a centralized government productivity suite designed for high-security environments.
                Version 3.0 now includes Institution Management, Organization Enrollment, and an AI-powered Assistant.
                </p>
            </header>

            <div class="architecture-panel card">
                <div class="page-section-heading">
                    <div><p class="page-eyebrow">BUILT FOR TRUST</p><h2>System architecture</h2></div>
                    <span class="architecture-version">ORION 3.0</span>
                </div>
                <div class="architecture-grid">
                    <article><span>01 / BACKEND</span><strong>Node.js + Express</strong><p>Lightweight services for secure workflow operations.</p></article>
                    <article><span>02 / DATA</span><strong>SQLite</strong><p>Local persistence with salted scrypt password hashes.</p></article>
                    <article><span>03 / EXPERIENCE</span><strong>Vanilla JavaScript</strong><p>A responsive single-page interface with no client framework dependency.</p></article>
                    <article><span>04 / ACCESS</span><strong>Role-based controls</strong><p>Scoped permissions for workers, managers, and platform administrators.</p></article>
                </div>
            </div>

            <div class="page-actions">
                <a href="#/" class="btn btn-outline">&larr; Return Home</a>
            </div>
        </div>
    `,

    manual: () => `
        <div class="content-page main-container">
            <header class="page-heading">
                <p class="page-eyebrow">QUICK REFERENCE</p>
                <h1>User Manual</h1>
                <p class="page-lead">A practical guide to roles, organization access, and daily workflows.</p>
            </header>

            <div class="manual-grid">
            <article class="card guide-card">
                <span class="guide-index">01 / ACCESS</span>
                <h3>User roles</h3>
                <p><strong>Worker:</strong> Can view assigned tasks, submit reports or subtasks, and join a verified organization with an invite code.</p>
                <p><strong>Manager:</strong> An organization administrator who can create projects, assign tasks, issue invites, and review submissions.</p>
                <p><strong>Platform administrator:</strong> Can verify organization applications and access platform oversight tools.</p>
            </article>

            <article class="card guide-card">
                <span class="guide-index">02 / VERIFICATION</span>
                <h3>Register an organization</h3>
                <p>Open <strong>Organizations</strong> from the dashboard and submit the organization name, official contact, and type. A platform administrator must verify the application before the organization becomes available.</p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem; color: var(--text-secondary);">
                    <li>Applications can be approved, rejected, or returned for more details.</li>
                    <li>Approval assigns the applicant as organization administrator.</li>
                </ul>
            </article>

            <article class="card guide-card">
                <span class="guide-index">03 / MEMBERSHIP</span>
                <h3>Join an organization</h3>
                <p>Organization administrators create an invite from the Organizations page. Workers enter the code in the dashboard. Codes have a use limit and expiration date.</p>
                <p>For tasks with subtasks, workers submit each subtask for review. Approved subtask weights calculate task progress; report-based progress remains available for tasks without subtasks.</p>
            </article>

            <article class="card guide-card">
                <span class="guide-index">04 / SUPPORT</span>
                <h3>Troubleshooting</h3>
                <p>If you encounter login issues, ensure you have a stable network connection to the secure server.</p>
                <p>For critical errors, contact IT Support at <code style="color: var(--accent);">admin@orion.gov</code>.</p>
            </article>
            </div>

            <div class="page-actions">
                <a href="#/" class="btn btn-outline">&larr; Return Home</a>
            </div>
        </div>
    `,

    dashboard: (data) => {
        const { currentUser, projects = [], updates = [], myTasks = [], allTasks = [] } = data || {};
        const user = currentUser || {};
        const nameStr = String(user.name || user.username || 'U').trim();
        const initials = escapeHtml(
            nameStr.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
        );

        let navTabs = `
            <a href="#/dashboard" class="btn btn-outline nav-tab-btn active" style="display:flex; align-items:center; gap:6px;">
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24"><path fill="currentColor" d="M3,13H11V3H3V13M3,21H11V15H3V21M13,21H21V11H13V21M13,3V9H21V3H13Z" /></svg> Overview
            </a>
        `;

        if (user.role === 'manager' || user.role === 'exec') {
            navTabs += `<a href="#/institutions" class="btn btn-outline nav-tab-btn" style="display:flex; align-items:center; gap:6px;">
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z" /></svg> Institutions
            </a>`;
        }
        navTabs += `<a href="#/organizations" class="btn btn-outline nav-tab-btn" style="display:flex; align-items:center; gap:6px;">Organizations</a>`;
        if (user.role === 'manager' || user.role === 'exec' || user.role === 'admin' || user.isPlatformAdmin) {
            navTabs += `<a href="#/schemes" class="btn btn-outline nav-tab-btn" style="display:flex; align-items:center; gap:6px;">
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg> Schemes
            </a>`;
        }
        if (user.role === 'exec') {
            navTabs += `<a href="#/oversight" class="btn btn-outline nav-tab-btn" style="display:flex; align-items:center; gap:6px;">
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg> Oversight
            </a>`;
        }

        let headerHTML = `
            <div class="main-container">
                <!-- Top Right User Controls -->
                <div class="user-controls" style="position: absolute; top: 20px; right: 24px;">
                    <div style="text-align: right;">
                        <div class="user-name">${escapeHtml(user.name || user.username || 'Personnel')}</div>
                        <div class="user-role">${escapeHtml(user.role || 'Unassigned')}</div>
                    </div>
                    <div class="user-avatar">${initials}</div>
                    <button id="logout-btn" class="btn btn-outline btn-sm">LOGOUT</button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; margin-top: 4rem;">
                    <div>
                        <h1>Dashboard</h1>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                            ${navTabs}
                        </div>
                    </div>
                </div>

                <!-- Deadline Warning Widget -->
                <div id="deadline-warning" class="deadline-warning" style="display: none;">
                    Deadline approaching — Some tasks are due within 3 days
                </div>
        `;

        let mainHTML = '';

        if (user.role === 'worker') {
            const availableInstitutions = data.availableInstitutions || [];
            const currentOrg = data.currentOrganization || null;

            let orgHTML = '';
            if (currentOrg) {
                orgHTML = `
                    <div class="org-badge">${escapeHtml(currentOrg.name)}</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem;">${escapeHtml(currentOrg.type)} · ${escapeHtml(currentOrg.contact || 'No contact')}</div>
                `;
            } else {
                orgHTML = `
                    <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.88rem;">Join a verified organization using an active invitation code.</p>
                    
                    <div>
                        <label for="organization-invite-code" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 0.5rem;">Join with Invite Code</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input id="organization-invite-code" class="form-input" autocomplete="off" maxlength="100" placeholder="Enter invite code" style="flex: 1; margin-bottom: 0;" aria-describedby="organization-invite-error">
                            <button id="join-org-btn" class="btn btn-primary btn-sm" type="button">JOIN CODE</button>
                        </div>
                        <p id="organization-invite-error" class="field-error" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;" role="alert"></p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <a href="#/organizations" class="btn btn-outline btn-sm">Apply / check status</a>
                    </div>
                `;
            }

            mainHTML = `
                <div class="dashboard-grid view">
                    <div class="card card-3d" style="grid-column: span 2;">
                        <h3>My Tasks</h3>
                        ${(myTasks || []).map(t => {
                            const badgeState = t.latestReportStatus || 'none';
                            const badgeLabel = t.latestReportStatus
                                ? t.latestReportStatus.charAt(0).toUpperCase() + t.latestReportStatus.slice(1)
                                : 'No Report';
                            const lastRejection = t.latestReportStatus === 'rejected' ? (t.latestReviewComment || '') : '';
                            return `
                            <div class="task-row-3d" style="background: var(--bg-input); border: 1px solid var(--glass-border); padding: 1rem; margin-bottom: 0.5rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(t.title)}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(t.projectName ? `${t.projectName} (ID: ${t.projectId})` : `Project ID: ${t.projectId}`)}</div>
                                    ${t.deadline ? `<div style="font-size: 0.8rem; color: var(--error);">Due: ${escapeHtml(new Date(t.deadline).toLocaleDateString())}</div>` : ''}
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="text-align: right;">
                                        <span class="status-pill ${t.status === 'Completed' ? 'status-pill--complete' : 'status-pill--active'}">${escapeHtml(t.status)}</span>
                                        <div class="progress-container" style="width: 100px;">
                                            <div class="progress-bar" style="--progress-scale: ${Math.max(0, Math.min(Number(t.progress) || 0, 100)) / 100}"></div>
                                        </div>
                                        <span id="report-badge-${t.id}" class="report-state-badge report-state-${badgeState}">${escapeHtml(badgeLabel)}</span>
                                    </div>
                                    ${t.subtasks && t.subtasks.length ? '' : (t.status !== 'Completed'
                                        ? `<button class="btn btn-primary btn-sm report-open-btn" data-task-id="${escapeHtml(t.id)}" data-current-progress="${Number(t.progress) || 0}" data-last-rejected-comment="${escapeHtml(lastRejection)}">Submit Report</button>`
                                        : '<span class="success-text">Completed</span>')}
                                </div>
                            </div>
                            ${(t.subtasks || []).map(s => `<div class="subtask-row"><div><strong>${escapeHtml(s.title)}</strong><span class="status-pill">${escapeHtml(s.status)}</span>${s.reviewComment ? `<p class="field-hint">${escapeHtml(s.reviewComment)}</p>` : ''}</div>${s.status !== 'approved' ? `<input class="form-input subtask-note" data-subtask-id="${escapeHtml(s.id)}" aria-label="Completion note for ${escapeHtml(s.title)}" placeholder="Completion note" ${s.status === 'submitted' ? 'disabled' : ''}><button type="button" class="btn btn-outline btn-sm submit-subtask-btn" data-subtask-id="${escapeHtml(s.id)}" ${s.status === 'submitted' ? 'disabled' : ''}>Submit</button>` : '<span class="success-text">Approved</span>'}</div>`).join('')}
                        `;
                        }).join('') || '<p style="color: var(--text-muted);">No active tasks assigned.</p>'}
                    </div>
                    <div class="card card-3d">
                        <h3>My Organization</h3>
                        ${orgHTML}
                    </div>
                    <div class="card card-3d">
                        <h3>Notifications</h3>
                        <p style="color: var(--text-muted);">No new direct messages.</p>
                    </div>
                </div>
                <div id="report-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="card card-3d modal-animate-in" style="width: 100%; max-width: 560px; position: relative;">
                        <button id="close-report-modal-btn" class="modal-close">&times;</button>
                        <h2 style="margin-bottom: 1rem;">Submit Progress Report</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Progress is updated only after manager approval.</p>
                        <form id="submit-report-form">
                            <input type="hidden" name="taskId" />
                            <div class="form-group">
                                <label>Proposed Progress (%)</label>
                                <input type="number" name="proposedProgress" class="form-input" min="0" max="100" step="1" required />
                            </div>
                            <div class="form-group">
                                <label>Evidence / Comment</label>
                                <textarea name="reportText" class="form-input" rows="4" placeholder="Describe completed work or attach context..." required></textarea>
                            </div>
                            <button id="submit-report-btn" type="submit" class="btn btn-primary" style="width: 100%;">SUBMIT FOR APPROVAL</button>
                            <p id="report-submit-error" style="color: var(--error); margin-top: 0.75rem;"></p>
                        </form>
                    </div>
                </div>
                <!-- Closure of main-container -->
                </div>
            `;
        } else if (currentUser.role === 'manager') {
            mainHTML = `
                <div style="margin-bottom: 1.5rem; display: flex; gap: 0.75rem;">
                   <button id="create-task-btn" class="btn btn-primary">+ Create New Task</button>
                   <button id="create-project-btn" class="btn btn-outline">+ Create Project</button>
                </div>

                <!-- Task Modal -->
                <div id="task-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="card modal-animate-in" style="width: 100%; max-width: 500px; position: relative;">
                        <button id="close-modal-btn" class="modal-close">&times;</button>
                        <h2 style="margin-bottom: 1.5rem;">Assign New Task</h2>
                        <form id="create-task-form">
                            <div class="form-group">
                                <label>Task Title</label>
                                <input type="text" name="title" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Deadline</label>
                                <input type="date" name="deadline" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Project</label>
                                <select name="projectId" class="form-input">
                                    ${projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Assign To Worker</label>
                                <select name="assignedTo" class="form-input">
                                    ${(data.workers || []).map(w => `<option value="${escapeHtml(w.id)}">${escapeHtml(w.name)}</option>`).join('')}
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">ASSIGN TASK</button>
                        </form>
                    </div>
                </div>

                <!-- Project Modal -->
                <div id="project-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="card modal-animate-in" style="width: 100%; max-width: 500px; position: relative;">
                        <button id="close-project-modal-btn" class="modal-close">&times;</button>
                        <h2 style="margin-bottom: 1.5rem;">Create New Project</h2>
                        <form id="create-project-form">
                            <div class="form-group">
                                <label>Project Name</label>
                                <input type="text" name="name" class="form-input" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">LAUNCH PROJECT</button>
                        </form>
                    </div>
                </div>

                <!-- Edit Task Modal -->
                <div id="edit-task-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="card modal-animate-in" style="width: 100%; max-width: 500px; position: relative;">
                        <button id="close-edit-task-modal-btn" class="modal-close">&times;</button>
                        <h2 style="margin-bottom: 1.5rem;">Edit Task</h2>
                        <div id="edit-task-error" class="form-error" style="display: none; margin-bottom: 1rem;"></div>
                        <form id="edit-task-form">
                            <input type="hidden" name="taskId" id="edit-task-id">
                            <div class="form-group">
                                <label>Task Title</label>
                                <input type="text" name="title" id="edit-task-title" class="form-input" required maxlength="200">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" id="edit-task-description" class="form-input" rows="3" maxlength="2000"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" id="edit-task-status" class="form-input">
                                    <option value="In Planning">In Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select name="priority" id="edit-task-priority" class="form-input">
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Deadline</label>
                                <input type="date" name="deadline" id="edit-task-deadline" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Progress (%)</label>
                                <input type="number" name="progress" id="edit-task-progress" class="form-input" min="0" max="100">
                            </div>
                            <button type="submit" id="edit-task-submit-btn" class="btn btn-primary" style="width: 100%;">SAVE CHANGES</button>
                        </form>
                    </div>
                </div>

                <!-- Delete Task Confirmation Modal -->
                <div id="delete-task-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="card modal-animate-in" style="width: 100%; max-width: 440px; position: relative;">
                        <button id="close-delete-task-modal-btn" class="modal-close">&times;</button>
                        <h2 style="margin-bottom: 1rem; color: var(--danger, #ef4444);">Delete Task</h2>
                        <p id="delete-task-prompt" style="color: var(--text-secondary); margin-bottom: 1.5rem;">Are you sure you want to delete this task? All associated subtasks and reports will be permanently removed.</p>
                        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                            <button id="cancel-delete-task-btn" class="btn btn-outline" type="button">Cancel</button>
                            <button id="confirm-delete-task-btn" class="btn btn-danger" type="button">Delete Task</button>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid view">
                    <div class="card card-3d" style="grid-column: span 2;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <h3 style="margin-bottom: 0;">Active Projects Oversight</h3>
        <button id="export-projects-btn" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" title="Export projects to CSV">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
        </button>
    </div>
                         ${projects.length > 0 ? projects.map(p => `
                            <div style="margin-bottom: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                    <strong>${escapeHtml(p.name)}</strong>
                                    <span class="stat-animate">${Number(p.progress) || 0}%</span>
                                </div>
                                <div class="progress-container">
                                    <div class="progress-bar" style="--progress-scale: ${Math.max(0, Math.min(Number(p.progress) || 0, 100)) / 100}"></div>
                                </div>
                                <div style="display: flex; justify-content: flex-end; margin-top: 0.4rem;">
                                    <button class="btn btn-outline btn-sm export-project-pdf-btn" data-project-id="${escapeHtml(p.id)}" style="padding: 0.15rem 0.45rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;" title="Export Project PDF Report">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                        PDF Report
                                    </button>
                                </div>
                            </div>
                        `).join('') : '<p style="color: var(--text-muted);">No active projects. Create one above.</p>'}
                    </div>
                                        <div class="card card-3d">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                            <h3 style="margin-bottom: 0;">Tasks I've Assigned</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span id="task-count-badge" style="font-size: 0.78rem; color: var(--text-muted);">${allTasks.length} loaded</span>
        <button id="export-tasks-btn" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" title="Export filtered tasks to CSV">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
        </button>
    </div>
                        </div>
                        <div class="tasks-filter-bar" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                            <input type="text" id="task-search-input" class="form-input form-input-sm" placeholder="Search tasks..." style="flex: 1; min-width: 140px; font-size: 0.78rem; padding: 0.25rem 0.5rem;">
                            <select id="task-status-filter" class="form-input form-input-sm" style="width: auto; font-size: 0.78rem; padding: 0.25rem 0.5rem;">
                                <option value="">All Statuses</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div id="tasks-container" class="tasks-container">
                            ${allTasks.length > 0 ? allTasks.map(task => Views.renderTaskRow(task, data.workers || [])).join('') : '<p style="color: var(--text-muted);" class="no-tasks-msg">No active assigned tasks.</p>'}
                        </div>
                        <div style="text-align: center; margin-top: 1rem;">
                            <button id="load-more-tasks-btn" class="btn btn-outline btn-sm" ${allTasks.length >= 20 ? '' : 'style="display: none;"'}>Load More Tasks</button>
                        </div>
                    </div>
                    <div class="card card-3d">
                        <h3>Pending Report Approvals</h3>
                        ${(data.pendingReports || []).length > 0 ? data.pendingReports.map(r => `
                            <div class="pending-report-row" style="margin-bottom: 0.75rem;">
                                <div class="feed-meta">${escapeHtml(new Date(r.createdAt).toLocaleString())} · ${escapeHtml(r.submittedByName || 'Worker')}</div>
                                <div style="font-weight: 600; color: var(--text-primary); margin: 0.25rem 0;">${escapeHtml(r.taskTitle)}</div>
                                <div style="font-size: 0.82rem; color: var(--text-secondary);">Proposed: ${Number(r.proposedProgress) || 0}%</div>
                                ${r.reportText ? `<p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.35rem 0;">${escapeHtml(r.reportText)}</p>` : ''}
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                    <button class="btn btn-success btn-sm review-report-btn" data-report-id="${escapeHtml(r.id)}" data-action="approve">Approve</button>
                                    <button class="btn btn-danger btn-sm review-report-btn" data-report-id="${escapeHtml(r.id)}" data-action="reject">Reject</button>
                                </div>
                            </div>
                        `).join('') : '<p style="color: var(--text-muted);">No pending reports in your review queue.</p>'}
                    </div>
                    <div class="card card-3d">
                        <h3>Team Activity</h3>
                        ${updates.length > 0 ? updates.slice(0, 5).map(u => `
                            <div class="feed-item">
                                <div class="feed-meta">${escapeHtml(new Date(u.timestamp).toLocaleTimeString())} · ${escapeHtml(u.author)}</div>
                                <div style="color: var(--text-secondary);">${escapeHtml(u.text)}</div>
                            </div>
                        `).join('') : '<p style="color: var(--text-muted);">No recent activity.</p>'}
                    </div>
                </div>
                <!-- Closure of main-container -->
                </div>
            `;
        } else if (user.role === 'exec') {
            const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0;
            mainHTML = `
                <div class="dashboard-grid view">
                    <div class="card card-3d">
                        <h3>Global Project Health</h3>
                        <div class="stat-animate" style="font-size: 4rem; font-weight: 700; color: var(--accent); text-align: center; padding: 1rem 0;">
                            ${avgProgress}%
                        </div>
                        <p style="text-align: center; color: var(--text-muted);">Average across all ${projects.length} active initiatives.</p>
                    </div>
                    <div class="card card-3d" style="grid-column: span 2;">
                        <h3>Live Feed</h3>
                        <div id="live-feed">
                             ${updates.map(u => `
                                <div class="feed-item">
                                    <div class="feed-meta">${escapeHtml(new Date(u.timestamp).toLocaleString())} · ${escapeHtml(u.author)}</div>
                                    <div style="color: var(--text-secondary);">${escapeHtml(u.text)}</div>
                                </div>
                            `).join('') || '<p style="color: var(--text-muted);">No activity yet.</p>'}
                        </div>
                    </div>
                </div>
                <!-- Closure of main-container -->
                </div>
            `;
        } else {
            mainHTML = `
                <div class="dashboard-grid view">
                    <div class="card">
                        <h3>Welcome</h3>
                        <p style="color: var(--text-muted);">Please contact your system administrator to configure permissions.</p>
                    </div>
                </div>
                <!-- Closure of main-container -->
                </div>
            `;
        }

        return headerHTML + mainHTML;
    },

    oversight: (data) => `
        <div class="main-container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div class="card" style="animation: fadeUp var(--dur-page-in) var(--ease-smooth) forwards;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Executive Oversight</h2>
                    <a href="#/dashboard" class="btn btn-outline btn-sm">Back to Dashboard</a>
                </div>

                <div style="overflow-x: auto;">
                    <table class="oversight-table">
                        <thead>
                            <tr>
                                <th>Task Title</th>
                                <th>Assigned Worker</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(data.allTasks || []).length ? (data.allTasks || []).map(t => {
        const worker = (data.allUsers || []).find(u => Number(u.id) === Number(t.assignedTo));
        return `
                                <tr>
                                    <td style="font-weight: 500;">${escapeHtml(t.title)}</td>
                                    <td>${worker ? escapeHtml(worker.name) : '<span style="color:var(--text-muted)">Unassigned</span>'}</td>
                                    <td>${t.deadline ? escapeHtml(t.deadline) : '<span style="color:var(--text-muted)">None</span>'}</td>
                                    <td><span class="status-pill ${t.status === 'Completed' ? 'status-pill--complete' : 'status-pill--active'}">${escapeHtml(t.status)}</span></td>
                                    <td>
                                        <div style="display:flex;align-items:center;gap:0.5rem;">
                                            <div class="progress-container" style="width:80px;margin:0;"><div class="progress-bar" style="--progress-scale:${Math.max(0, Math.min(Number(t.progress) || 0, 100)) / 100}"></div></div>
                                            <span style="font-size:0.82rem;">${Number(t.progress) || 0}%</span>
                                        </div>
                                    </td>
                                </tr>
                                `;
    }).join('') : '<tr><td colspan="5" class="empty-state">No tasks are available in this organization yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    institutions: (list) => `
        <div class="dashboard-grid" style="padding-top: 2rem;">
            <div class="card" style="grid-column: span 2;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>Registered Institutions</h2>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <a href="#/organizations" class="btn btn-primary btn-sm">+ Apply for Organization</a>
                        <a href="#/dashboard" class="btn btn-outline btn-sm">Back to Dashboard</a>
                    </div>
                </div>

                <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <input type="text" id="inst-search" class="form-input" placeholder="Search government entities..." style="margin-bottom: 0; flex: 1;">
                    <button id="search-btn" class="btn btn-primary">Search</button>
                </div>

                <div id="inst-list">
                    ${(list || []).length ? (list || []).map(i => `
                        <div class="inst-row">
                            <div class="inst-name">${escapeHtml(i.name)}</div>
                            <div class="inst-meta">
                                <span>Type: ${escapeHtml(i.type)}</span>
                                <span>Contact: ${escapeHtml(i.contact)}</span>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-state">No verified organizations match this search.</p>'}
                </div>
            </div>

            <div class="card">
                <h3>Verified organization access</h3>
                <p>Organizations become available after a platform administrator verifies an application.</p>
                <a href="#/organizations" class="btn btn-primary">Apply / manage invites</a>
            </div>
        </div>

        <!-- Register Institution Modal -->
        <div id="register-inst-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
            <div class="card card-3d modal-animate-in" style="width: 100%; max-width: 520px; position: relative;">
                <button id="close-register-inst-modal-btn" class="modal-close" type="button">&times;</button>
                <h2 style="margin-bottom: 0.5rem;">Register Institution</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.88rem;">Directly register a new approved institution.</p>
                <form id="register-institution-form">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="inst-name-input" style="display: block; font-weight: 600; margin-bottom: 0.25rem;">Institution Name *</label>
                        <input id="inst-name-input" name="name" class="form-input" required maxlength="200" placeholder="e.g. National Aeronautics Centre" />
                        <p id="inst-name-error" class="field-error" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;"></p>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="inst-type-input" style="display: block; font-weight: 600; margin-bottom: 0.25rem;">Institution Type *</label>
                        <select id="inst-type-input" name="type" class="form-input" required>
                            <option value="">Select type...</option>
                            <option value="Government">Government</option>
                            <option value="Public agency">Public agency</option>
                            <option value="Defence">Defence</option>
                            <option value="Contractor">Contractor</option>
                            <option value="Utility">Utility</option>
                            <option value="NGO">NGO</option>
                            <option value="Research Institute">Research Institute</option>
                        </select>
                        <p id="inst-type-error" class="field-error" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;"></p>
                    </div>
                    <div class="form-group" style="margin-bottom: 1.25rem;">
                        <label for="inst-contact-input" style="display: block; font-weight: 600; margin-bottom: 0.25rem;">Contact (Email or Phone)</label>
                        <input id="inst-contact-input" name="contact" class="form-input" maxlength="254" placeholder="e.g. contact@nac.gov" />
                        <p id="inst-contact-error" class="field-error" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;"></p>
                    </div>
                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                        <button type="button" id="cancel-register-inst-btn" class="btn btn-outline">Cancel</button>
                        <button type="submit" id="submit-register-inst-btn" class="btn btn-primary">Register Institution</button>
                    </div>
                    <p id="register-inst-form-error" style="color: var(--error); margin-top: 0.75rem; font-size: 0.85rem;"></p>
                </form>
            </div>
        </div>
    `,

    createOrganization: (user = null) => `
        <div class="content-page main-container">
            <header class="page-heading">
                <p class="page-eyebrow">ORGANIZATION ONBOARDING</p>
                <h1>Create an organization</h1>
                <p class="page-lead">Submit an organization for verification. Once approved, your account becomes its administrator and you can invite your team.</p>
            </header>
            <div class="architecture-grid">
                <article class="feature-card"><span class="feature-icon-wrapper">01</span><h3>Apply</h3><p>Share the legal name, organization type, and an official contact.</p></article>
                <article class="feature-card"><span class="feature-icon-wrapper">02</span><h3>Verify</h3><p>A website administrator reviews the application and may request more details.</p></article>
                <article class="feature-card"><span class="feature-icon-wrapper">03</span><h3>Invite</h3><p>After approval, create expiring invitations for your team members.</p></article>
            </div>
            <section class="card portal-section" style="margin-top:1.5rem;">
                <h2>${user ? 'Continue your organization application' : 'Start your organization application'}</h2>
                <p>${user ? 'Your application and organization invitations are available in the organization workspace.' : 'Create a personal account first. The organization application is tied to its applicant so you can track verification and manage invites.'}</p>
                <div class="page-actions">
                    ${user ? '<a href="#/organizations" class="btn btn-primary">Open organization workspace</a>' : '<a href="#/register?next=organizations" class="btn btn-primary">Create account to apply</a><a href="#/login?next=organizations" class="btn btn-outline">Sign in</a>'}
                    <a href="#/admin" class="btn btn-outline">Website administrator access</a>
                </div>
            </section>
        </div>
    `,

    adminPortal: (user = null, admins = []) => `
        <div class="content-page main-container">
            <header class="page-heading">
                <p class="page-eyebrow">ORION CONTROL DESK</p>
                <h1>Website administration</h1>
                <p class="page-lead">Sign in with a platform administrator account to review organizations and manage administrator access.</p>
            </header>
            ${!user ? `
                <section class="card auth-card">
                    <h2 class="auth-heading">Administrator login</h2>
                    <form id="admin-login-form" novalidate>
                        <div class="form-group"><label for="admin-login-email">Email or username</label><input id="admin-login-email" name="username" class="form-input" autocomplete="username" required></div>
                        <div class="form-group"><label for="admin-login-password">Password</label><input id="admin-login-password" name="password" class="form-input" type="password" autocomplete="current-password" required></div>
                        <button type="submit" class="btn btn-primary">Sign in</button>
                        <p id="admin-login-error" class="form-error" role="alert" aria-live="polite"></p>
                    </form>
                    <p class="form-hint">First website administrator? Create the initial account with the secure <code>npm run bootstrap-admin</code> command on the server.</p>
                </section>
            ` : !user.isPlatformAdmin ? `
                <section class="card auth-card">
                    <h2>Administrator access required</h2>
                    <p>This account does not have website administrator permissions.</p>
                    <a href="#/dashboard" class="btn btn-outline">Return to dashboard</a>
                </section>
            ` : `
                <div class="dashboard-grid">
                    <section class="card portal-section">
                        <div class="portal-heading"><div><p class="eyebrow">ACCESS CONTROL</p><h2>Website administrators</h2></div><span class="status-pill">${admins.length} active</span></div>
                        <div class="admin-list">${admins.length ? admins.map((admin) => `<article class="application-row"><div><strong>${escapeHtml(admin.name || admin.username)}</strong><p>${escapeHtml(admin.username)}</p></div><span class="status-pill">Platform admin</span></article>`).join('') : '<p class="empty-state">No administrator accounts found.</p>'}</div>
                    </section>
                    <section class="card portal-section">
                        <p class="eyebrow">INVITE A COLLEAGUE</p><h2>Create website administrator</h2>
                        <p>Set an initial password and share it securely. The new administrator can use password recovery to change it.</p>
                        <form id="admin-create-form" class="form-grid">
                            <label>Name<input name="name" class="form-input" autocomplete="name" maxlength="100" required></label>
                            <label>Email<input name="email" class="form-input" type="email" autocomplete="email" maxlength="254" required></label>
                            <label class="form-grid-wide">Initial password<input name="password" class="form-input" type="password" autocomplete="new-password" minlength="8" required></label>
                            <button type="submit" class="btn btn-primary">Create administrator</button>
                            <p id="admin-create-status" class="form-error" role="status" aria-live="polite"></p>
                        </form>
                    </section>
                </div>
                <div class="page-actions"><a href="#/organizations" class="btn btn-outline">Review organization applications</a><a href="#/dashboard" class="btn btn-outline">Dashboard</a></div>
            `}
        </div>
    `,

    organizations: (user, application, applications = [], invites = []) => {
        const inviteRows = invites.length ? invites.map((invite) => `
            <article class="invite-row">
                <div><strong>${Number(invite.usedCount)}/${Number(invite.maxUses)} uses</strong><p>Expires ${escapeHtml(new Date(invite.expiresAt).toLocaleDateString())} · ${invite.revokedAt ? 'Revoked' : Number(invite.expiresAt) <= Date.now() ? 'Expired' : 'Active'}</p></div>
                ${!invite.revokedAt && Number(invite.expiresAt) > Date.now() && Number(invite.usedCount) < Number(invite.maxUses) ? `<button class="btn btn-danger btn-sm revoke-invite-btn" data-invite-id="${escapeHtml(invite.id)}">Revoke</button>` : ''}
            </article>
        `).join('') : '<p class="empty-state">No invites have been created.</p>';
        return `
        <div class="dashboard-grid view" style="padding-top:2rem;">
            <div class="card" style="grid-column:span 2;">
                <div class="portal-heading"><div><p class="eyebrow">ORGANIZATION ACCESS</p><h2>Verification & invitations</h2></div><a href="#/dashboard" class="btn btn-outline">Dashboard</a></div>
                ${user && user.role === 'manager' ? `<section class="portal-section"><h3>Invite your team</h3><p>Codes are stored as hashes and shown only once when created.</p><form id="invite-form" class="inline-form"><label>Maximum uses<input class="form-input" name="maxUses" type="number" min="1" max="1000" value="1" required></label><label>Expires in days<input class="form-input" name="expiresInDays" type="number" min="1" max="90" value="7" required></label><button class="btn btn-primary" type="submit">Create invite</button></form><p id="invite-result" role="status" class="success-text"></p><div id="organization-invites">${inviteRows}</div></section>` : ''}
                ${application && application.status ? `<section class="portal-section"><h3>Latest application: ${escapeHtml(application.legalName)}</h3><p>Status: <strong>${escapeHtml(String(application.status).replace(/_/g,' '))}</strong></p>${application.reviewComment ? `<p>${escapeHtml(application.reviewComment)}</p>` : ''}</section>` : ''}
                ${!application || application.status === 'more_information_required' ? `<section class="portal-section"><h3>Apply to register an organization</h3><form id="organization-application-form" class="form-grid"><label>Legal organization name<input name="legalName" class="form-input" required maxlength="254"></label><label>Organization type<select name="type" class="form-input"><option>Government</option><option>Public agency</option><option>Defence</option><option>Contractor</option><option>Utility</option><option>NGO</option></select></label><label>Official email<input name="officialEmail" class="form-input" type="email" required maxlength="254"></label><label>Contact person<input name="contactName" class="form-input" required maxlength="254"></label><label>Contact role<input name="contactRole" class="form-input" maxlength="120"></label><label>Website<input name="website" class="form-input" type="url" maxlength="254"></label><label class="form-grid-wide">Description<textarea name="description" class="form-input" rows="3" maxlength="2000"></textarea></label><button type="submit" class="btn btn-primary">Submit for verification</button><p id="application-error" class="form-error" role="alert"></p></form></section>` : ''}
                ${user && user.isPlatformAdmin ? `<section class="portal-section"><h3>Verification queue</h3><div id="organization-application-list">${applications.length ? applications.map(item=>`<article class="application-row"><div><strong>${escapeHtml(item.legalName)}</strong><p>${escapeHtml(item.type)} · ${escapeHtml(item.officialEmail)} · ${escapeHtml(item.contactName)}</p><p>${escapeHtml(item.description||'')}</p><span class="status-pill">${escapeHtml(String(item.status).replace(/_/g,' '))}</span></div><div class="application-actions"><button class="btn btn-success btn-sm application-review-btn" data-id="${escapeHtml(item.id)}" data-action="approve">Approve</button><button class="btn btn-danger btn-sm application-review-btn" data-id="${escapeHtml(item.id)}" data-action="reject">Reject</button><button class="btn btn-outline btn-sm application-review-btn" data-id="${escapeHtml(item.id)}" data-action="more_information_required">Request details</button></div></article>`).join(''):'<p>No organization applications are waiting for review.</p>'}</div></section>` : ''}
            </div>
        </div>
    `;
    },

    schemes: (schemes = [], projects = [], selectedProjectId = null, projectSchemes = null, user = null) => {
        const canApply = user && (user.role === 'manager' || user.role === 'exec');
        const displaySchemes = projectSchemes && projectSchemes.length ? projectSchemes : schemes;

        return `
        <div class="main-container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <header class="page-heading">
                <p class="page-eyebrow">NATIONAL PRODUCTIVITY &amp; SUBSIDY INITIATIVES</p>
                <h1>Scheme Eligibility Pre-Check &amp; Compliance Tracker</h1>
                <p class="page-lead">Match your organization's projects with verified national grants, PLI subsidies, and deep-tech policy incentives.</p>
            </header>

            <div class="disclaimer-banner" style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 1rem; margin-top: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 0.75rem; align-items: flex-start;">
                <span style="font-size: 1.25rem; line-height: 1;">ℹ️</span>
                <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                    <strong style="color: var(--text-primary);">Official Portal Notice:</strong>
                    ORION provides internal eligibility pre-checks, milestone matching, and compliance readiness tracking. ORION does not directly disburse funds or submit statutory filings. All official subsidy applications must be filed directly through the respective ministry portal. Clicking <strong>Track &amp; Open Official Portal</strong> records internal preparation and launches the official government website.
                </div>
            </div>

            <div class="card card-3d" style="margin-top: 1rem; margin-bottom: 2rem;">
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: space-between;">
                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; flex: 1;">
                        <label for="scheme-project-select" style="font-weight: 600; font-size: 0.9rem; min-width: 140px;">Select Project:</label>
                        <select id="scheme-project-select" class="form-input" style="max-width: 400px; flex: 1;">
                            <option value="">-- Choose a Project to Evaluate Eligibility --</option>
                            ${projects.map(p => `
                                <option value="${escapeHtml(p.id)}" ${Number(selectedProjectId) === Number(p.id) ? 'selected' : ''}>
                                    ${escapeHtml(p.name)} (${Number(p.progress) || 0}% progress · ${escapeHtml(p.status || 'Active')})
                                </option>
                            `).join('')}
                        </select>
                        <button id="btn-check-scheme-match" class="btn btn-primary" ${!projects.length ? 'disabled' : ''}>Check Match</button>
                    </div>
                    ${selectedProjectId ? `
                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                            Evaluating Project <strong>#${escapeHtml(selectedProjectId)}</strong>
                        </div>
                    ` : ''}
                </div>
                ${!projects.length ? `
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.75rem;">
                        No active organization projects found. Create or join a project from the Dashboard to evaluate scheme eligibility.
                    </p>
                ` : ''}
            </div>

            <div id="schemes-loading" style="display: none; text-align: center; padding: 2rem;">
                <span class="loading-spinner"></span>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Evaluating rule-based eligibility match...</p>
            </div>

            <div id="schemes-container">
                <div class="schemes-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
                    ${displaySchemes.length ? displaySchemes.map(s => {
                        const score = Number(s.matchScore) || 0;
                        const scoreColor = score >= 70 ? 'var(--success, #10b981)' : score >= 40 ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #94a3b8)';
                        const isApplied = s.applicationStatus === 'applied' || s.applicationStatus === 'approved' || s.applicationStatus === 'under_review';
                        
                        return `
                        <div class="card scheme-card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border);">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                    <span class="status-pill status-pill--active" style="text-transform: uppercase;">${escapeHtml(s.sector)}</span>
                                    <span style="font-weight: 700; color: var(--accent); font-size: 1.1rem;">
                                        ${s.subsidyPercentage ? `${s.subsidyPercentage}% Subsidy` : 'Grant'}
                                    </span>
                                </div>
                                <h3 style="margin-bottom: 0.25rem; color: var(--text-primary); font-size: 1.15rem;">${escapeHtml(s.title)}</h3>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(s.ministry)}</p>
                                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">${escapeHtml(s.description)}</p>

                                <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 1rem;">
                                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Eligibility Criteria</div>
                                    <div style="font-size: 0.82rem; color: var(--text-primary); margin-top: 0.25rem;">${escapeHtml(s.eligibilityCriteria)}</div>
                                </div>

                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
                                    <span>${s.isSampleData ? '<strong style="color:var(--warning);">[Sample Data]</strong>' : '<strong style="color:var(--success);">✓ Verified Official Scheme</strong>'}</span>
                                    ${s.sourceUrl ? `<a href="${escapeHtml(s.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">Official Source ↗</a>` : ''}
                                </div>

                                ${selectedProjectId ? `
                                    <div class="scheme-match-box" style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <span style="font-size: 0.82rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Eligibility Score</span>
                                            <span style="font-size: 1.25rem; font-weight: 800; color: ${scoreColor};">${score}%</span>
                                        </div>
                                        <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 0.75rem;">
                                            <div style="width: ${score}%; height: 100%; background: ${scoreColor}; transition: width 0.4s ease;"></div>
                                        </div>
                                        ${s.rules && s.rules.length ? `
                                            <div style="font-size: 0.78rem; color: var(--text-secondary);">
                                                ${s.rules.map(r => `
                                                    <div style="margin-bottom: 0.25rem; display: flex; gap: 6px; align-items: flex-start;">
                                                        <span style="color: ${r.matched ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'}; font-weight: 700;">
                                                            ${r.matched ? '✓' : '✗'}
                                                        </span>
                                                        <span><strong>${escapeHtml(r.name)}</strong>: ${escapeHtml(r.reason)}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                        ${s.unknownCriteria && s.unknownCriteria.length ? `
                                            <div style="margin-top: 0.75rem; padding-top: 0.65rem; border-top: 1px dashed var(--border); font-size: 0.75rem;">
                                                <div style="font-weight: 600; text-transform: uppercase; margin-bottom: 0.4rem; color: var(--text-muted);">Compliance &amp; Audit Readiness:</div>
                                                ${s.unknownCriteria.map(u => {
                                                    const statusLabel = u.status === 'verified' ? '✓ Verified' : u.status === 'self_verified' ? '✓ Self-Verified' : u.status === 'in_progress' ? '⏳ In Progress' : u.status === 'missing' ? '❌ Missing' : '⚠️ Pending';
                                                    const statusColor = (u.status === 'verified' || u.status === 'self_verified') ? 'var(--success, #10b981)' : u.status === 'in_progress' ? 'var(--warning, #f59e0b)' : u.status === 'missing' ? 'var(--danger, #ef4444)' : 'var(--text-muted, #94a3b8)';
                                                    return `
                                                        <div style="margin-bottom: 0.5rem; padding: 0.45rem 0.6rem; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid var(--border);">
                                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; gap: 0.5rem; flex-wrap: wrap;">
                                                                <span style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem;">${escapeHtml(u.criterion)}</span>
                                                                ${selectedProjectId && canApply ? `
                                                                    <select class="form-input form-input-sm scheme-readiness-select" data-project-id="${escapeHtml(selectedProjectId)}" data-scheme-id="${escapeHtml(s.id)}" data-criterion-key="${escapeHtml(u.criterionKey || '')}" style="font-size: 0.75rem; padding: 2px 6px; width: auto; height: auto;">
                                                                        <option value="pending" ${u.status === 'pending' || u.status === 'unknown' ? 'selected' : ''}>Pending</option>
                                                                        <option value="in_progress" ${u.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                                                        <option value="self_verified" ${u.status === 'self_verified' ? 'selected' : ''}>Self-Verified</option>
                                                                        <option value="verified" ${u.status === 'verified' ? 'selected' : ''}>Verified</option>
                                                                        <option value="missing" ${u.status === 'missing' ? 'selected' : ''}>Missing</option>
                                                                    </select>
                                                                ` : `
                                                                    <span style="color: ${statusColor}; font-weight: 600; font-size: 0.75rem;">${statusLabel}</span>
                                                                `}
                                                            </div>
                                                            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${escapeHtml(u.reason)}</div>
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>

                            <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 0.5rem;">
                                <a href="${escapeHtml(s.portalUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Portal ↗</a>
                                <div>
                                    ${selectedProjectId ? (
                                        isApplied ? `
                                            <span class="status-pill status-pill--complete" style="font-weight: 600;">✓ TRACKED (PORTAL ACTIVE)</span>
                                        ` : canApply ? `
                                            <button class="btn btn-primary btn-sm apply-scheme-btn" data-project-id="${escapeHtml(selectedProjectId)}" data-scheme-id="${escapeHtml(s.id)}" data-portal-url="${escapeHtml(s.portalUrl || '')}">
                                                Mark Tracked &amp; Open Official Portal ↗
                                            </button>
                                        ` : `
                                            <span style="font-size: 0.75rem; color: var(--text-muted);">Manager required to track</span>
                                        `
                                    ) : `
                                        <button class="btn btn-outline btn-sm check-scheme-match-prompt-btn" data-scheme-id="${escapeHtml(s.id)}">
                                            Select Project to Match
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('') : '<p class="empty-state">No government schemes are currently active.</p>'}
                </div>
            </div>
        </div>
        `;
    },

};
