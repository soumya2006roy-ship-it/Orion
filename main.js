import { store } from './data_store.js';
import { Router } from './router.js';
import { Views } from './views.js';

const app = document.getElementById('app');


let currentUser = null;




const toast = (() => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    return {
        show(message, type = 'info', duration = 3500) {
            const labels = { success: 'SUCCESS', error: 'ERROR', info: 'INFO' };
            const el = document.createElement('div');
            el.className = `toast toast--${type}`;
            const icon = document.createElement('span');
            icon.className = 'toast-icon';
            icon.textContent = labels[type] || labels.info;
            const text = document.createElement('span');
            text.textContent = String(message || '');
            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'toast-dismiss';
            dismissBtn.setAttribute('aria-label', 'Dismiss');
            dismissBtn.innerHTML = '&times;';
            el.append(icon, text, dismissBtn);
            container.appendChild(el);

            const dismiss = () => {
                el.classList.add('removing');
                setTimeout(() => el.remove(), getMotionDuration('--dur-toast-out', 250));
            };

            el.querySelector('.toast-dismiss').addEventListener('click', dismiss);
            setTimeout(dismiss, duration);
        },
        success(msg) { this.show(msg, 'success'); },
        error(msg)   { this.show(msg, 'error'); },
        info(msg)    { this.show(msg, 'info'); },
    };
})();




const getProgressBar = () => {
    let bar = document.getElementById('top-loading-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'top-loading-bar';
        bar.className = 'top-progress-bar';
        document.body.appendChild(bar);
    }
    return bar;
};

const startLoadingProgress = () => {
    const bar = getProgressBar();
    bar.className = 'top-progress-bar';
    void bar.offsetWidth;
    bar.classList.add('loading');
};

const finishLoadingProgress = () => {
    const bar = getProgressBar();
    bar.classList.remove('loading');
    bar.classList.add('finished');
};

const animateStats = () => {
    document.querySelectorAll('.stat-animate').forEach(el => {
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)(%?)$/);
        if (!match) return;
        const target = parseInt(match[1], 10);
        const suffix = match[2];
        let current = 0;
        const duration = 1200;
        const startTime = performance.now();
        
        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            current = Math.floor(ease * target);
            el.textContent = `${current}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = text;
            }
        };
        requestAnimationFrame(update);
    });
};

let landing3D = {
    renderer: null,
    scene: null,
    camera: null,
    animationFrameId: null,
    handleResize: null,
    handleMouseMove: null
};

function cleanLanding3D() {
    if (landing3D.animationFrameId) {
        cancelAnimationFrame(landing3D.animationFrameId);
        landing3D.animationFrameId = null;
    }
    if (landing3D.handleResize) {
        window.removeEventListener('resize', landing3D.handleResize);
        landing3D.handleResize = null;
    }
    if (landing3D.handleMouseMove) {
        window.removeEventListener('pointermove', landing3D.handleMouseMove);
        landing3D.handleMouseMove = null;
    }
    if (landing3D.renderer) {
        try {
            if (landing3D.renderer.domElement && landing3D.renderer.domElement.parentElement) {
                landing3D.renderer.domElement.parentElement.removeChild(landing3D.renderer.domElement);
            }
            landing3D.renderer.dispose();
        } catch (e) {}
        landing3D.renderer = null;
    }
    landing3D.scene = null;
    landing3D.camera = null;
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (window.THREE) {
            resolve(window.THREE);
            return;
        }
        let script = document.querySelector(`script[src="${url}"]`);
        if (script) {
            const onScriptLoad = () => {
                script.removeEventListener('load', onScriptLoad);
                resolve(window.THREE);
            };
            script.addEventListener('load', onScriptLoad);
            script.addEventListener('error', reject);
            return;
        }
        script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(window.THREE);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function renderSvgFallback(container) {
    if (!container || container.querySelector('svg.orbit-fallback') || container.querySelector('canvas')) return;
    container.innerHTML = `
        <div class="canvas-glow"></div>
        <svg class="orbit-fallback" viewBox="0 0 400 400" width="100%" height="100%" style="display:block; max-width:400px; margin:auto;" aria-label="Orbital System Visualization">
            <defs>
                <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#d0ad63" stop-opacity="0.25"/>
                    <stop offset="70%" stop-color="#0a192f" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#050c18" stop-opacity="0.95"/>
                </radialGradient>
            </defs>
            <circle cx="200" cy="200" r="80" fill="url(#globeGrad)" stroke="#d0ad63" stroke-width="1.5" stroke-dasharray="4,4"/>
            <ellipse cx="200" cy="200" rx="140" ry="45" fill="none" stroke="#d0ad63" stroke-width="1" stroke-opacity="0.4" transform="rotate(-20 200 200)"/>
            <ellipse cx="200" cy="200" rx="160" ry="55" fill="none" stroke="#d0ad63" stroke-width="1" stroke-opacity="0.3" transform="rotate(25 200 200)"/>
            <circle cx="200" cy="200" r="16" fill="#d0ad63" fill-opacity="0.8"/>
            <circle cx="310" cy="160" r="5" fill="#d0ad63"/>
            <circle cx="80" cy="230" r="4" fill="#6366f1"/>
        </svg>
    `;
}

async function initLanding3D() {
    cleanLanding3D();

    const container = document.getElementById('canvas3d-container');
    if (!container) return;

    try {
        let THREE = window.THREE;
        if (!THREE) {
            try {
                THREE = await loadScript('/public/vendor/three.min.js');
            } catch (_localErr) {
                THREE = null;
            }
        }
        if (!THREE || !document.getElementById('canvas3d-container')) {
            renderSvgFallback(container);
            return;
        }

        const width = container.clientWidth || 450;
        const height = container.clientHeight || 450;

        const scene = new THREE.Scene();
        landing3D.scene = scene;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 18;
        landing3D.camera = camera;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        landing3D.renderer = renderer;

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        const geometry = new THREE.SphereGeometry(5, 24, 24);
        const material = new THREE.MeshBasicMaterial({
            color: 0xd0ad63,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const sphere = new THREE.Mesh(geometry, material);
        globeGroup.add(sphere);

        const pointsMat = new THREE.PointsMaterial({
            color: 0xedcf83,
            size: 0.12,
            transparent: true,
            opacity: 0.8
        });
        const points = new THREE.Points(geometry, pointsMat);
        globeGroup.add(points);

        const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xd0ad63,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        globeGroup.add(core);

        const orbitsGroup = new THREE.Group();
        globeGroup.add(orbitsGroup);

        const numOrbits = 3;
        const satelliteMeshes = [];

        for (let i = 0; i < numOrbits; i++) {
            const radius = 6.2 + i * 0.8;
            const segments = 64;
            const ringGeo = new THREE.BufferGeometry();
            const positions = [];
            
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
            }
            
            ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            const ringMat = new THREE.LineBasicMaterial({
                color: 0x92702e,
                transparent: true,
                opacity: 0.15 + (i * 0.05)
            });
            const ring = new THREE.Line(ringGeo, ringMat);
            
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            orbitsGroup.add(ring);

            const satGeo = new THREE.SphereGeometry(0.18, 8, 8);
            const satMat = new THREE.MeshBasicMaterial({
                color: 0xedcf83,
                transparent: true,
                opacity: 0.9
            });
            const satellite = new THREE.Mesh(satGeo, satMat);
            orbitsGroup.add(satellite);
            
            satelliteMeshes.push({
                mesh: satellite,
                radius,
                speed: 0.012 + Math.random() * 0.008,
                angle: Math.random() * Math.PI * 2,
                rotX: ring.rotation.x,
                rotY: ring.rotation.y
            });
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const handleMouseMove = (event) => {
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            targetX = (x / rect.width) * 0.4;
            targetY = (y / rect.height) * 0.4;
        };
        window.addEventListener('pointermove', handleMouseMove);
        landing3D.handleMouseMove = handleMouseMove;

        const handleResize = () => {
            if (!container || !renderer.domElement.parentElement) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);
        landing3D.handleResize = handleResize;

        const animate = () => {
            if (!renderer.domElement.parentElement) {
                cleanLanding3D();
                return;
            }

            landing3D.animationFrameId = requestAnimationFrame(animate);

            globeGroup.rotation.y += 0.002;
            globeGroup.rotation.x += 0.0005;

            core.rotation.y -= 0.005;

            satelliteMeshes.forEach(sat => {
                sat.angle += sat.speed;
                const posX = Math.cos(sat.angle) * sat.radius;
                const posZ = Math.sin(sat.angle) * sat.radius;
                
                const vector = new THREE.Vector3(posX, 0, posZ);
                vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.rotX);
                vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), sat.rotY);
                
                sat.mesh.position.copy(vector);
            });

            currentX += (targetX - currentX) * 0.05;
            currentY += (targetY - currentY) * 0.05;
            globeGroup.rotation.y += currentX * 0.05;
            globeGroup.rotation.x += currentY * 0.05;

            renderer.render(scene, camera);
        };

        animate();

    } catch (err) {
        console.warn('Three.js init failed, falling back to SVG:', err);
        renderSvgFallback(container);
    }
}

let currentViewCleanup = null;

export function registerViewCleanup(cleanupFn) {
    if (typeof currentViewCleanup === 'function') {
        try { currentViewCleanup(); } catch (e) { console.warn('Previous view cleanup error:', e); }
    }
    currentViewCleanup = cleanupFn;
}

const render = (html) => {
    if (typeof currentViewCleanup === 'function') {
        try { currentViewCleanup(); } catch (e) { console.warn('View cleanup error:', e); }
        currentViewCleanup = null;
    }
    startLoadingProgress();
    const currentHeight = app.getBoundingClientRect().height;
    app.classList.add('page-exit');
    app.style.minHeight = `${currentHeight}px`;

    const exitDuration = getMotionDuration('--dur-page-out', 500);
    return new Promise((resolve) => {
        window.setTimeout(() => {
            app.classList.remove('page-exit', 'route-transition-enter');
            app.innerHTML = html;

            requestAnimationFrame(() => {
                app.classList.add('route-transition-enter');

                requestAnimationFrame(() => {
                    document.querySelectorAll('.dashboard-grid, .widgets-row, .features-grid').forEach(grid => {
                        grid.classList.add('stagger-in');
                    });
                    animateStats();
                });
            });

            apply3DMotion();
            applyRippleEffect();
            setupAiAssistant();

            if (document.getElementById('canvas3d-container')) {
                initLanding3D();
            } else {
                cleanLanding3D();
            }

            finishLoadingProgress();
            const enterDuration = getMotionDuration('--dur-page-in', 950);
            window.setTimeout(() => {
                app.style.minHeight = '';
                resolve();
            }, enterDuration);
        }, exitDuration);
    });
};

function getMotionDuration(variable, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount)) return fallback;
    return value.endsWith('ms') ? amount : amount * 1000;
}




function applyRippleEffect() {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
        if (btn.dataset.rippleBound) return;
        btn.dataset.rippleBound = '1';
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), getMotionDuration('--dur-ripple', 500));
        });
    });
}




const routes = {
    '#/': async () => {
        await render(Views.landing());
    },
    '#/about': async () => {
        await render(Views.about());
    },
    '#/manual': async () => {
        await render(Views.manual());
    },
    '#/schemes': async () => {
        if (!currentUser) {
            showToast('Please sign in to access Government Schemes & Subsidies', 'info');
            window.location.hash = '#/login?next=schemes';
            return;
        }

        const canAccess = currentUser.role === 'manager' ||
            currentUser.role === 'exec' ||
            currentUser.role === 'admin' ||
            Boolean(currentUser.isPlatformAdmin);

        if (!canAccess) {
            showToast('Access restricted: Government Schemes are only accessible to organization managers and administrators.', 'warning');
            window.location.hash = '#/dashboard';
            return;
        }

        let projects = [];
        try {
            const dashData = await store.dashboard(currentUser.id);
            projects = dashData.allProjects || [];
        } catch (_e) {}

        let schemes = [];
        try {
            schemes = await store.getSchemes();
        } catch (err) {
            console.error('Failed to load schemes:', err);
        }

        let selectedProjectId = projects.length ? projects[0].id : null;
        let evaluatedSchemes = null;

        if (selectedProjectId) {
            try {
                evaluatedSchemes = await store.getProjectSchemes(selectedProjectId);
            } catch (err) {
                console.warn('Failed to pre-evaluate project schemes:', err);
            }
        }

        const renderSchemesPage = async () => {
            await render(Views.schemes(schemes, projects, selectedProjectId, evaluatedSchemes, currentUser));

            const projectSelect = document.getElementById('scheme-project-select');
            const checkMatchBtn = document.getElementById('btn-check-scheme-match');
            const loadingIndicator = document.getElementById('schemes-loading');
            const schemesContainer = document.getElementById('schemes-container');

            const performMatchCheck = async (projId) => {
                if (!projId) {
                    evaluatedSchemes = null;
                    selectedProjectId = null;
                    await renderSchemesPage();
                    return;
                }
                selectedProjectId = projId;
                if (loadingIndicator) loadingIndicator.style.display = 'block';
                if (schemesContainer) schemesContainer.style.opacity = '0.5';
                try {
                    evaluatedSchemes = await store.getProjectSchemes(projId);
                } catch (err) {
                    showToast(err.message || 'Failed to match schemes', 'error');
                } finally {
                    await renderSchemesPage();
                }
            };

            if (projectSelect) {
                projectSelect.addEventListener('change', (e) => {
                    performMatchCheck(e.target.value);
                });
            }

            if (checkMatchBtn) {
                checkMatchBtn.addEventListener('click', () => {
                    performMatchCheck(projectSelect ? projectSelect.value : selectedProjectId);
                });
            }

            document.querySelectorAll('.apply-scheme-btn').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    const schemeId = e.currentTarget.dataset.schemeId;
                    const projId = e.currentTarget.dataset.projectId;
                    const portalUrl = e.currentTarget.dataset.portalUrl;
                    e.currentTarget.disabled = true;
                    e.currentTarget.textContent = 'Recording...';

                    try {
                        const res = await store.applyForScheme(projId, schemeId);
                        showToast(res.message || 'Internal tracking active. Opening official portal...');
                        if (portalUrl && portalUrl.startsWith('http')) {
                            window.open(portalUrl, '_blank', 'noopener,noreferrer');
                        }
                        evaluatedSchemes = await store.getProjectSchemes(projId);
                        await renderSchemesPage();
                    } catch (err) {
                        showToast(err.message || 'Failed to record tracking', 'error');
                        e.currentTarget.disabled = false;
                        e.currentTarget.textContent = 'Mark Tracked & Open Official Portal ↗';
                    }
                });
            });

            document.querySelectorAll('.scheme-readiness-select').forEach((select) => {
                select.addEventListener('change', async (e) => {
                    const sel = e.target;
                    const projId = sel.dataset.projectId;
                    const schemeId = sel.dataset.schemeId;
                    const criterionKey = sel.dataset.criterionKey;
                    const newStatus = sel.value;
                    sel.disabled = true;

                    try {
                        await store.updateSchemeReadiness(projId, schemeId, criterionKey, newStatus);
                        showToast('Compliance readiness updated');
                        sel.disabled = false;
                        // Localized DOM update: update background evaluatedSchemes cache without destroying DOM state
                        store.getProjectSchemes(projId).then((updated) => {
                            evaluatedSchemes = updated;
                        }).catch(() => {});
                    } catch (err) {
                        showToast(err.message || 'Failed to update readiness', 'error');
                        sel.disabled = false;
                    }
                });
            });

            document.querySelectorAll('.check-scheme-match-prompt-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    if (projectSelect) {
                        projectSelect.focus();
                        projectSelect.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        };

        await renderSchemesPage();
    },
    '#/login': async () => {
        const next = new URLSearchParams(window.location.hash.split('?')[1] || '').get('next');
        const resolveDestination = (target) => {
            if (target === 'organizations') return '#/organizations';
            if (target === 'schemes') return '#/schemes';
            return '#/dashboard';
        };

        if (currentUser) {
            window.location.hash = resolveDestination(next);
            return;
        }
        const clientConfig = await store.getConfig().catch(() => ({}));
        await render(Views.login({ enableDemoAccounts: Boolean(clientConfig.enableDemoAccounts), next }));

        const form = document.getElementById('login-form');
        const errorMsg = document.getElementById('login-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Authenticating...';
            btn.disabled = true;

            try {
                const username = form.username.value;
                const password = form.password.value;

                const user = await store.login(username, password);
                if (user) {
                    currentUser = user;
                    updateAuthUI();
                    toast.success(`Welcome back, ${user.name || user.username}!`);
                    const currentNext = new URLSearchParams(window.location.hash.split('?')[1] || '').get('next') || next;
                    window.location.hash = resolveDestination(currentNext);
                } else {
                    errorMsg.textContent = 'Invalid credentials.';
                    btn.textContent = 'AUTHENTICATE';
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                errorMsg.textContent = 'Login Error: ' + err.message;
                btn.textContent = 'AUTHENTICATE';
                btn.disabled = false;
            }
        });

        const toggleRegister = document.getElementById('toggle-register');
        if (toggleRegister) {
            toggleRegister.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '#/register';
            });
        }

        // ── Demo credential quick-login cards ────────────────────────
        document.querySelectorAll('.demo-credential-card').forEach(card => {
            card.addEventListener('click', async () => {
                const demoUser = card.dataset.demoUser;
                const demoPass = card.dataset.demoPass;
                if (!demoUser || !demoPass) return;

                // Fill the form fields visually
                const usernameInput = document.getElementById('login-username');
                const passwordInput = document.getElementById('login-password');
                if (usernameInput) usernameInput.value = demoUser;
                if (passwordInput) passwordInput.value = demoPass;

                // Visual feedback — highlight selected card
                document.querySelectorAll('.demo-credential-card').forEach(c => c.classList.remove('demo-credential--active'));
                card.classList.add('demo-credential--active');

                const btn = form.querySelector('button[type="submit"]');
                btn.textContent = 'Authenticating...';
                btn.disabled = true;
                errorMsg.textContent = '';

                try {
                    const user = await store.login(demoUser, demoPass);
                    if (user) {
                        currentUser = user;
                        updateAuthUI();
                        toast.success('Welcome, ' + (user.name || user.username) + '! (Demo ' + card.querySelector('.demo-credential-role').textContent + ')');
                        const currentNext = new URLSearchParams(window.location.hash.split('?')[1] || '').get('next') || next;
                        window.location.hash = resolveDestination(currentNext);
                    } else {
                        errorMsg.textContent = 'Demo login failed — run "node seed_demo.js" to create accounts.';
                        btn.textContent = 'AUTHENTICATE';
                        btn.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    errorMsg.textContent = 'Demo login error: ' + err.message;
                    btn.textContent = 'AUTHENTICATE';
                    btn.disabled = false;
                }
            });
        });
    },
    '#/register': async () => {
        if (currentUser) {
            window.location.hash = '#/dashboard';
            return;
        }
        await render(Views.register());
        setupRegisterPage();
    },
    '#/create-organization': async () => {
        await render(Views.createOrganization(currentUser));
    },
    '#/admin': async () => {
        if (!currentUser) {
            await render(Views.adminPortal());
            const form = document.getElementById('admin-login-form');
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const button = form.querySelector('button[type="submit"]');
                const error = document.getElementById('admin-login-error');
                button.disabled = true;
                error.textContent = '';
                try {
                    const user = await store.login(form.elements.username.value, form.elements.password.value);
                    if (!user) throw new Error('Invalid administrator credentials.');
                    currentUser = user;
                    updateAuthUI();
                    if (user.isPlatformAdmin) {
                        toast.success('Administrator signed in.');
                    }
                    await routes['#/admin']();
                } catch (err) {
                    error.textContent = err.message || 'Could not sign in.';
                    button.disabled = false;
                }
            });
            return;
        }
        let admins = [];
        if (currentUser.isPlatformAdmin) {
            try { admins = await store.getPlatformAdmins(); }
            catch (error) { toast.error(error.message || 'Could not load administrators.'); }
        }
        await render(Views.adminPortal(currentUser, admins));
        const createForm = document.getElementById('admin-create-form');
        if (createForm) createForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = createForm.querySelector('button[type="submit"]');
            const status = document.getElementById('admin-create-status');
            const formData = new FormData(createForm);
            button.disabled = true;
            status.textContent = '';
            try {
                await store.createPlatformAdmin(Object.fromEntries(formData.entries()));
                toast.success('Website administrator created.');
                await routes['#/admin']();
            } catch (error) {
                status.textContent = error.message || 'Could not create website administrator.';
                button.disabled = false;
            }
        });
    },
    '#/reset': async () => {
        currentUser = null;
        updateAuthUI();
        await render(Views.resetPassword());
        const token = new URLSearchParams(window.location.hash.split('?')[1] || '').get('token');
        const requestForm = document.getElementById('reset-request-form');
        const confirmForm = document.getElementById('reset-confirm-form');
        const status = document.getElementById('reset-status');
        requestForm.hidden = Boolean(token);
        confirmForm.hidden = !token;
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = requestForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            status.textContent = '';
            try {
                const result = await store.requestPasswordReset(requestForm.elements.email.value);
                status.textContent = result.message;
                status.className = 'auth-success';
            } catch (error) {
                status.textContent = error.message;
                status.className = 'form-error';
            } finally { btn.disabled = false; }
        });
        confirmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = confirmForm.querySelector('button[type="submit"]');
            const password = confirmForm.elements.newPassword.value;
            btn.disabled = true;
            status.textContent = '';
            if (password.length < 8) {
                status.textContent = 'Use at least 8 characters for your password.';
                btn.disabled = false;
                return;
            }
            try {
                await store.confirmPasswordReset(token, password);
                toast.success('Password reset successfully. Please log in.');
                window.location.hash = '#/login';
            } catch (error) {
                status.textContent = error.message;
                status.className = 'form-error';
            } finally { btn.disabled = false; }
        });
    },
    '#/dashboard': () => {
        if (!currentUser) {
            window.location.hash = '#/login';
            return;
        }
        const data = store.getDashboardData(currentUser);
        Promise.resolve(data).then(async realData => {
            if (realData && realData.unauthorized) {
                currentUser = null;

                updateAuthUI();
                toast.error('Session expired or invalid. Please authenticate again.');
                window.location.hash = '#/login';
                return;
            }
            if (realData && realData.accessDenied) {
                toast.error('Organization administrator access requires verification. Review your status or submit an application.');
                window.location.hash = '#/organizations';
                return;
            }
            if (realData && realData.currentUser) {
                currentUser = { ...currentUser, ...realData.currentUser };
                updateAuthUI();
            }
            let viewData = realData;
            if (currentUser.role === 'manager') {
                const ownedTasks = (realData.allTasks || []).filter(
                    (task) => Number(task.createdBy) === Number(currentUser.id)
                );
                viewData = {
                    ...realData,
                    allTasks: ownedTasks,
                    projects: realData.projects || []
                };
            }
            await render(Views.dashboard(viewData));

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    if (currentUser) {
                        try { sessionStorage.removeItem(`orion_ai_history_${currentUser.id}`); } catch (_e) {}
                    }
                    await store.logout();
                    currentUser = null;
                    if (router && typeof router.clearScrollPositions === 'function') {
                        router.clearScrollPositions();
                    }
                    updateAuthUI();
                    toast.info('You have been logged out.');
                    window.location.hash = '#/';
                });
            }

            if ((realData.myTasks || realData.allTasks)) {
                const tasks = realData.myTasks || realData.allTasks;
                const approaching = tasks.some(t => {
                    if (!t.deadline || String(t.status || '').toLowerCase() === 'completed') return false;
                    const due = new Date(t.deadline);
                    const now = new Date();
                    const diff = (due - now) / (1000 * 60 * 60 * 24);
                    return diff < 3;
                });

                if (approaching) {
                    const warn = document.getElementById('deadline-warning');
                    if (warn) warn.style.display = 'flex';
                }
            }

            if (currentUser.role === 'manager') {
                const taskModal = document.getElementById('task-modal');
                const openTaskBtn = document.getElementById('create-task-btn');
                const closeTaskBtn = document.getElementById('close-modal-btn');
                const taskForm = document.getElementById('create-task-form');

                if (openTaskBtn) {
                    openTaskBtn.addEventListener('click', () => { taskModal.style.display = 'flex'; });
                    closeTaskBtn.addEventListener('click', () => { taskModal.style.display = 'none'; });

                    taskForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const fd = new FormData(taskForm);
                        const success = await store.createTask(
                            fd.get('title'),
                            fd.get('projectId'),
                            fd.get('assignedTo'),
                            fd.get('deadline'),
                            currentUser.id
                        );
                        if (success) {
                            toast.success('Task assigned successfully');
                            taskModal.style.display = 'none';
                            routes['#/dashboard']();
                        } else {
                            toast.error('Failed to assign task');
                        }
                    });
                }

                const projModal = document.getElementById('project-modal');
                const openProjBtn = document.getElementById('create-project-btn');
                const closeProjBtn = document.getElementById('close-project-modal-btn');
                const projForm = document.getElementById('create-project-form');

                if (openProjBtn) {
                    openProjBtn.addEventListener('click', () => { projModal.style.display = 'flex'; });
                    closeProjBtn.addEventListener('click', () => { projModal.style.display = 'none'; });

                    projForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const fd = new FormData(projForm);
                        const success = await store.createProject(fd.get('name'));
                        if (success) {
                            toast.success('Project launched successfully');
                            projModal.style.display = 'none';
                            routes['#/dashboard']();
                        } else {
                            toast.error('Failed to create project');
                        }
                    });
                }

                document.querySelectorAll('.review-report-btn').forEach((button) => {
                    button.addEventListener('click', async () => {
                        const reportId = button.dataset.reportId;
                        const action = button.dataset.action;
                        const reviewComment = window.prompt(
                            action === 'approve'
                                ? 'Optional approval remark:'
                                : 'Provide rejection reason for worker:',
                            ''
                        );
                        if (reviewComment === null) {
                            return;
                        }
                        button.disabled = true;
                        try {
                            await store.reviewReport(reportId, currentUser.id, action, reviewComment);
                            toast.success(`Report ${action}d successfully`);
                            routes['#/dashboard']();
                        } catch (error) {
                            toast.error(error.message || 'Unable to process review');
                            button.disabled = false;
                        }
                    });
                });

                document.querySelectorAll('.create-subtask-form').forEach((form) => {
                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        const submit = form.querySelector('button[type="submit"]');
                        submit.disabled = true;
                        try {
                            const fields = new FormData(form);
                            await store.createSubtask(form.dataset.taskId, { title: fields.get('title'), assignedTo: fields.get('assignedTo') });
                            toast.success('Subtask created');
                            routes['#/dashboard']();
                        } catch (error) {
                            toast.error(error.message || 'Could not create subtask');
                            submit.disabled = false;
                        }
                    });
                });
                document.querySelectorAll('.review-subtask-btn').forEach((button) => {
                    button.addEventListener('click', async () => {
                        button.disabled = true;
                        try {
                            const commentInput = window.prompt(button.dataset.action === 'approve' ? 'Optional approval note:' : 'Reason for returning this subtask:', '');
                            if (commentInput === null) { button.disabled = false; return; }
                            const comment = commentInput;
                            await store.reviewSubtask(button.dataset.subtaskId, button.dataset.action, comment);
                            toast.success(button.dataset.action === 'approve' ? 'Subtask approved' : 'Subtask returned');
                            routes['#/dashboard']();
                        } catch (error) { toast.error(error.message || 'Could not review subtask'); button.disabled = false; }
                    });
                });

                // Edit Task Modal & Submission
                const editTaskModal = document.getElementById('edit-task-modal');
                const closeEditTaskBtn = document.getElementById('close-edit-task-modal-btn');
                const editTaskForm = document.getElementById('edit-task-form');
                const editTaskError = document.getElementById('edit-task-error');

                document.querySelectorAll('.edit-task-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        if (!editTaskModal) return;
                        const ds = button.dataset;
                        document.getElementById('edit-task-id').value = ds.taskId || '';
                        document.getElementById('edit-task-title').value = ds.title || '';
                        document.getElementById('edit-task-description').value = ds.description || '';
                        document.getElementById('edit-task-status').value = ds.status || 'In Progress';
                        document.getElementById('edit-task-priority').value = ds.priority || 'normal';
                        document.getElementById('edit-task-deadline').value = ds.deadline || '';
                        document.getElementById('edit-task-progress').value = ds.progress !== undefined ? ds.progress : '0';
                        if (editTaskError) {
                            editTaskError.textContent = '';
                            editTaskError.style.display = 'none';
                        }
                        editTaskModal.style.display = 'flex';
                    });
                });

                if (closeEditTaskBtn) {
                    closeEditTaskBtn.addEventListener('click', () => {
                        if (editTaskModal) editTaskModal.style.display = 'none';
                    });
                }

                if (editTaskForm) {
                    editTaskForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const submitBtn = document.getElementById('edit-task-submit-btn') || editTaskForm.querySelector('button[type="submit"]');
                        const taskId = document.getElementById('edit-task-id').value;
                        const title = document.getElementById('edit-task-title').value.trim();
                        const description = document.getElementById('edit-task-description').value.trim();
                        const status = document.getElementById('edit-task-status').value;
                        const priority = document.getElementById('edit-task-priority').value;
                        const deadline = document.getElementById('edit-task-deadline').value;
                        const progress = Number(document.getElementById('edit-task-progress').value);

                        if (!title) {
                            if (editTaskError) {
                                editTaskError.textContent = 'Task title cannot be empty.';
                                editTaskError.style.display = 'block';
                            }
                            return;
                        }

                        if (isNaN(progress) || progress < 0 || progress > 100) {
                            if (editTaskError) {
                                editTaskError.textContent = 'Progress must be between 0 and 100.';
                                editTaskError.style.display = 'block';
                            }
                            return;
                        }

                        // Snapshot for rollback
                        const taskCard = document.querySelector(`.task-compact-row[data-task-id="${taskId}"]`);
                        const prevTitle = taskCard ? taskCard.querySelector('.task-row-title')?.textContent : null;
                        const prevDesc = taskCard ? taskCard.querySelector('.task-row-desc')?.textContent : null;
                        const prevStatus = taskCard ? taskCard.querySelector('.task-row-status')?.textContent : null;
                        const prevPriority = taskCard ? taskCard.querySelector('.task-row-priority')?.textContent : null;
                        const prevProgress = taskCard ? taskCard.querySelector('.task-row-progress')?.textContent : null;

                        // Optimistic update
                        if (taskCard) {
                            const titleEl = taskCard.querySelector('.task-row-title');
                            if (titleEl) titleEl.textContent = title;
                            const statusEl = taskCard.querySelector('.task-row-status');
                            if (statusEl) {
                                statusEl.textContent = status;
                                statusEl.className = `status-pill ${status === 'Completed' ? 'status-pill--complete' : 'status-pill--active'} task-row-status`;
                            }
                            const priorityEl = taskCard.querySelector('.task-row-priority');
                            if (priorityEl) priorityEl.textContent = priority;
                            const progressEl = taskCard.querySelector('.task-row-progress');
                            if (progressEl) progressEl.textContent = `${progress}%`;
                        }

                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Saving...';
                        if (editTaskError) {
                            editTaskError.textContent = '';
                            editTaskError.style.display = 'none';
                        }

                        try {
                            await store.updateTask(taskId, {
                                title,
                                description,
                                status,
                                priority,
                                deadline: deadline || null,
                                progress
                            });
                            toast.success('Task updated successfully');
                            if (editTaskModal) editTaskModal.style.display = 'none';
                            routes['#/dashboard']();
                        } catch (error) {
                            // Rollback optimistic update
                            if (taskCard) {
                                if (prevTitle !== null) {
                                    const titleEl = taskCard.querySelector('.task-row-title');
                                    if (titleEl) titleEl.textContent = prevTitle;
                                }
                                if (prevStatus !== null) {
                                    const statusEl = taskCard.querySelector('.task-row-status');
                                    if (statusEl) {
                                        statusEl.textContent = prevStatus;
                                        statusEl.className = `status-pill ${prevStatus === 'Completed' ? 'status-pill--complete' : 'status-pill--active'} task-row-status`;
                                    }
                                }
                                if (prevPriority !== null) {
                                    const priorityEl = taskCard.querySelector('.task-row-priority');
                                    if (priorityEl) priorityEl.textContent = prevPriority;
                                }
                                if (prevProgress !== null) {
                                    const progressEl = taskCard.querySelector('.task-row-progress');
                                    if (progressEl) progressEl.textContent = prevProgress;
                                }
                            }
                            if (editTaskError) {
                                editTaskError.textContent = error.message || 'Failed to update task';
                                editTaskError.style.display = 'block';
                            }
                            toast.error(error.message || 'Failed to update task');
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'SAVE CHANGES';
                        }
                    });
                }

                // Reassign Task Control
                document.querySelectorAll('.reassign-task-select').forEach(select => {
                    select.addEventListener('change', async () => {
                        const taskId = select.dataset.taskId;
                        const newAssigneeId = select.value;
                        if (!taskId || !newAssigneeId) return;

                        const prevIndex = select.selectedIndex;
                        select.disabled = true;

                        try {
                            await store.reassignTask(taskId, newAssigneeId);
                            toast.success('Task reassigned successfully');
                            routes['#/dashboard']();
                        } catch (error) {
                            select.selectedIndex = 0;
                            toast.error(error.message || 'Failed to reassign task');
                            select.disabled = false;
                        }
                    });
                });

                // Delete Task Modal & Confirmation
                const deleteModal = document.getElementById('delete-task-modal');
                const closeDeleteBtn = document.getElementById('close-delete-task-modal-btn');
                const cancelDeleteBtn = document.getElementById('cancel-delete-task-btn');
                const confirmDeleteBtn = document.getElementById('confirm-delete-task-btn');
                const deletePrompt = document.getElementById('delete-task-prompt');
                let taskPendingDeletion = null;

                document.querySelectorAll('.delete-task-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        taskPendingDeletion = {
                            id: button.dataset.taskId,
                            title: button.dataset.title || 'this task'
                        };
                        if (deletePrompt) {
                            deletePrompt.textContent = `Are you sure you want to delete task "${taskPendingDeletion.title}"? All associated subtasks and reports will be permanently removed.`;
                        }
                        if (deleteModal) deleteModal.style.display = 'flex';
                    });
                });

                const hideDeleteModal = () => {
                    if (deleteModal) deleteModal.style.display = 'none';
                    taskPendingDeletion = null;
                };

                if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', hideDeleteModal);
                if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteModal);

                if (confirmDeleteBtn) {
                    confirmDeleteBtn.addEventListener('click', async () => {
                        if (!taskPendingDeletion) return;
                        const taskId = taskPendingDeletion.id;
                        const taskCard = document.querySelector(`.task-compact-row[data-task-id="${taskId}"]`);

                        confirmDeleteBtn.disabled = true;
                        confirmDeleteBtn.textContent = 'Deleting...';

                        // Optimistic UI update: reduce opacity
                        if (taskCard) taskCard.style.opacity = '0.3';

                        try {
                            await store.deleteTask(taskId);
                            toast.success('Task deleted successfully');
                            hideDeleteModal();
                            routes['#/dashboard']();
                        } catch (error) {
                            if (taskCard) taskCard.style.opacity = '1';
                            toast.error(error.message || 'Failed to delete task');
                            confirmDeleteBtn.disabled = false;
                            confirmDeleteBtn.textContent = 'Delete Task';
                        }
                    });
                }
                // --- Pagination & Filtering for Tasks I've Assigned ---
                const searchInput = document.getElementById('task-search-input');
                const statusFilter = document.getElementById('task-status-filter');
                const loadMoreBtn = document.getElementById('load-more-tasks-btn');
                const tasksContainer = document.getElementById('tasks-container');
                const countBadge = document.getElementById('task-count-badge');

                let currentSearch = '';
                let currentStatus = '';
                let taskCursor = (data.allTasks && data.allTasks.length > 0)
                    ? data.allTasks[data.allTasks.length - 1].id
                    : null;

                const bindTaskRowActions = (container) => {
                    container.querySelectorAll('.edit-task-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const editTaskModal = document.getElementById('edit-task-modal');
                            if (!editTaskModal) return;
                            const ds = button.dataset;
                            document.getElementById('edit-task-id').value = ds.taskId || '';
                            document.getElementById('edit-task-title').value = ds.title || '';
                            document.getElementById('edit-task-description').value = ds.description || '';
                            document.getElementById('edit-task-status').value = ds.status || 'In Progress';
                            document.getElementById('edit-task-priority').value = ds.priority || 'normal';
                            document.getElementById('edit-task-deadline').value = ds.deadline || '';
                            document.getElementById('edit-task-progress').value = ds.progress !== undefined ? ds.progress : '0';
                            editTaskModal.style.display = 'flex';
                        });
                    });

                    container.querySelectorAll('.reassign-task-select').forEach(select => {
                        select.addEventListener('change', async (e) => {
                            const taskId = select.dataset.taskId;
                            const newAssigneeId = e.target.value;
                            if (!taskId || !newAssigneeId) return;
                            select.disabled = true;
                            try {
                                await store.reassignTask(taskId, newAssigneeId);
                                toast.success('Task reassigned successfully');
                                routes['#/dashboard']();
                            } catch (err) {
                                toast.error(err.message || 'Failed to reassign task');
                                select.disabled = false;
                            }
                        });
                    });

                    container.querySelectorAll('.delete-task-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const deleteModal = document.getElementById('delete-task-modal');
                            const deletePrompt = document.getElementById('delete-task-prompt');
                            taskPendingDeletion = {
                                id: button.dataset.taskId,
                                title: button.dataset.title || 'this task'
                            };
                            if (deletePrompt) {
                                deletePrompt.textContent = `Are you sure you want to delete task "${taskPendingDeletion.title}"? All associated subtasks and reports will be permanently removed.`;
                            }
                            if (deleteModal) deleteModal.style.display = 'flex';
                        });
                    });
                };

                const reloadTasks = async () => {
                    if (!tasksContainer) return;
                    tasksContainer.innerHTML = '<div class="skeleton skeleton-card" style="height: 60px; margin-bottom: 0.5rem;"></div><div class="skeleton skeleton-card" style="height: 60px;"></div>';
                    try {
                        const res = await store.getTasks({
                            search: currentSearch,
                            status: currentStatus,
                            limit: 20
                        });
                        const tasks = res.data || [];
                        taskCursor = res.pageInfo && res.pageInfo.nextCursor ? res.pageInfo.nextCursor : null;

                        if (tasks.length === 0) {
                            tasksContainer.innerHTML = '<p style="color: var(--text-muted);" class="no-tasks-msg">No tasks found matching your filter.</p>';
                        } else {
                            tasksContainer.innerHTML = tasks.map(t => Views.renderTaskRow(t, data.workers || [])).join('');
                            bindTaskRowActions(tasksContainer);
                        }
                        if (countBadge) countBadge.textContent = `${tasks.length} loaded`;
                        if (loadMoreBtn) {
                            loadMoreBtn.style.display = (res.pageInfo && res.pageInfo.hasMore) ? 'inline-block' : 'none';
                        }
                    } catch (err) {
                        toast.error('Failed to filter tasks: ' + err.message);
                    }
                };

                if (searchInput) {
                    let debounceTimer;
                    searchInput.addEventListener('input', (e) => {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            currentSearch = e.target.value.trim();
                            reloadTasks();
                        }, 300);
                    });
                }

                if (statusFilter) {
                    statusFilter.addEventListener('change', (e) => {
                        currentStatus = e.target.value;
                        reloadTasks();
                    });
                }

                if (loadMoreBtn) {
                    loadMoreBtn.addEventListener('click', async () => {
                        if (!taskCursor) return;
                        loadMoreBtn.disabled = true;
                        loadMoreBtn.textContent = 'Loading...';
                        try {
                            const res = await store.getTasks({
                                cursor: taskCursor,
                                search: currentSearch,
                                status: currentStatus,
                                limit: 20
                            });
                            const newTasks = res.data || [];
                            taskCursor = res.pageInfo && res.pageInfo.nextCursor ? res.pageInfo.nextCursor : null;
                            if (newTasks.length > 0) {
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = newTasks.map(t => Views.renderTaskRow(t, data.workers || [])).join('');
                                bindTaskRowActions(tempDiv);
                                while (tempDiv.firstChild) {
                                    tasksContainer.appendChild(tempDiv.firstChild);
                                }
                                const totalLoaded = tasksContainer.querySelectorAll('.task-row-3d').length;
                                if (countBadge) countBadge.textContent = `${totalLoaded} loaded`;
                            }
                            loadMoreBtn.style.display = (res.pageInfo && res.pageInfo.hasMore) ? 'inline-block' : 'none';
                        } catch (err) {
                            toast.error('Failed to load more tasks: ' + err.message);
                        } finally {
                            loadMoreBtn.disabled = false;
                            loadMoreBtn.textContent = 'Load More Tasks';
                        }
                    });
                }
            }

            if (currentUser.role === 'worker') {
                const reportModal = document.getElementById('report-modal');
                const closeReportBtn = document.getElementById('close-report-modal-btn');
                const reportForm = document.getElementById('submit-report-form');
                const reportError = document.getElementById('report-submit-error');
                const reportSubmitBtn = document.getElementById('submit-report-btn');

                const openReportModal = (taskId, currentProgress, lastRejectedComment = '') => {
                    reportForm.taskId.value = taskId;
                    reportForm.proposedProgress.value = Number(currentProgress || 0);
                    reportForm.reportText.value = '';
                    reportError.textContent = '';
                    if (lastRejectedComment) {
                        reportError.style.color = 'var(--text-secondary)';
                        reportError.textContent = `Last rejection reason: ${lastRejectedComment}`;
                    } else {
                        reportError.style.color = 'var(--error)';
                    }
                    reportModal.style.display = 'flex';
                };

                document.querySelectorAll('.report-open-btn').forEach((button) => {
                    button.addEventListener('click', () => {
                        openReportModal(
                            button.dataset.taskId,
                            button.dataset.currentProgress,
                            button.dataset.lastRejectedComment
                        );
                    });
                });

                if (closeReportBtn) {
                    closeReportBtn.addEventListener('click', () => {
                        reportModal.style.display = 'none';
                    });
                }

                if (reportForm) {
                    reportForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        reportSubmitBtn.disabled = true;
                        reportSubmitBtn.textContent = 'Submitting...';
                        reportError.textContent = '';
                        reportError.style.color = 'var(--error)';
                        try {
                            const fd = new FormData(reportForm);
                            await store.submitReport(
                                fd.get('taskId'),
                                currentUser.id,
                                Number(fd.get('proposedProgress')),
                                fd.get('reportText')
                            );
                            reportModal.style.display = 'none';
                            toast.success('Report submitted for approval');
                            routes['#/dashboard']();
                        } catch (error) {
                            reportError.textContent = error.message || 'Unable to submit report';
                        } finally {
                            reportSubmitBtn.disabled = false;
                            reportSubmitBtn.textContent = 'SUBMIT FOR APPROVAL';
                        }
                    });
                }

                const joinOrgBtn = document.getElementById('join-org-btn');
                const inviteInput = document.getElementById('organization-invite-code');
                if (joinOrgBtn && inviteInput) {
                    joinOrgBtn.addEventListener('click', async () => {
                        const inviteError = document.getElementById('organization-invite-error');
                        if (!inviteInput.value.trim()) {
                            inviteInput.setAttribute('aria-invalid', 'true');
                            inviteError.textContent = 'Enter an invite code.';
                            return;
                        }
                        joinOrgBtn.disabled = true;
                        joinOrgBtn.textContent = 'Joining...';
                        try {
                            const res = await store.joinOrganization(currentUser.id, { code: inviteInput.value.trim() });
                            if (res && res.organization) {
                                currentUser.organizationId = res.organization.id;
                            }
                            toast.success('Organization joined successfully!');
                            routes['#/dashboard']();
                        } catch (error) {
                            inviteInput.setAttribute('aria-invalid', 'true');
                            inviteError.textContent = error.message || 'Failed to join organization';
                        } finally {
                            joinOrgBtn.disabled = false;
                            joinOrgBtn.textContent = 'JOIN CODE';
                        }
                    });
                }



                document.querySelectorAll('.submit-subtask-btn').forEach((button) => {
                    button.addEventListener('click', async () => {
                        const note = document.querySelector(`.subtask-note[data-subtask-id="${CSS.escape(button.dataset.subtaskId)}"]`);
                        if (!note || !note.value.trim()) { if (note) note.focus(); return; }
                        button.disabled = true;
                        try {
                            await store.submitSubtask(button.dataset.subtaskId, note.value.trim());
                            toast.success('Subtask submitted for manager review');
                            routes['#/dashboard']();
                        } catch (error) { toast.error(error.message || 'Could not submit subtask'); button.disabled = false; }
                    });
                });
            }
        });
    },
    '#/oversight': () => {
        if (!currentUser || currentUser.role !== 'exec') {
            window.location.hash = '#/dashboard';
            return;
        }
        store.getDashboardData(currentUser).then(async data => {
            await render(Views.oversight(data));
        });
    },
    '#/institutions': () => {
        if (!currentUser || currentUser.role === 'worker') {
            window.location.hash = '#/dashboard';
            return;
        }
        store.getInstitutions().then(async list => {
            await render(Views.institutions(list));

            const searchBtn = document.getElementById('search-btn');
            const searchInput = document.getElementById('inst-search');

            const performSearch = () => {
                store.getInstitutions(searchInput.value).then(newList => {
                    const container = document.getElementById('inst-list');
                    container.replaceChildren();
                    newList.forEach((institution) => {
                        const row = document.createElement('div');
                        row.className = 'inst-row';
                        const name = document.createElement('div');
                        name.className = 'inst-name';
                        name.textContent = institution.name || '';
                        const meta = document.createElement('div');
                        meta.className = 'inst-meta';
                        const type = document.createElement('span');
                        type.textContent = `Type: ${institution.type || ''}`;
                        const contact = document.createElement('span');
                        contact.textContent = `Contact: ${institution.contact || ''}`;
                        meta.append(type, contact);
                        row.append(name, meta);
                        container.appendChild(row);
                    });
                    if (!newList.length) {
                        const empty = document.createElement('p');
                        empty.className = 'empty-state';
                        empty.textContent = 'No verified organizations match this search.';
                        container.appendChild(empty);
                    }
                });
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') performSearch();
            });

            // Register Institution modal wiring
            const openModalBtn = document.getElementById('open-register-inst-modal-btn');
            const modal = document.getElementById('register-inst-modal');
            const closeModalBtn = document.getElementById('close-register-inst-modal-btn');
            const cancelBtn = document.getElementById('cancel-register-inst-btn');
            const form = document.getElementById('register-institution-form');

            const closeModal = () => {
                if (modal) {
                    modal.style.display = 'none';
                    if (form) form.reset();
                    const formError = document.getElementById('register-inst-form-error');
                    if (formError) formError.textContent = '';
                    ['inst-name-error', 'inst-type-error', 'inst-contact-error'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = '';
                    });
                }
            };

            if (openModalBtn && modal) {
                openModalBtn.addEventListener('click', () => {
                    modal.style.display = 'flex';
                });
            }

            if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });
            }

            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const nameInput = document.getElementById('inst-name-input');
                    const typeInput = document.getElementById('inst-type-input');
                    const contactInput = document.getElementById('inst-contact-input');
                    const nameError = document.getElementById('inst-name-error');
                    const typeError = document.getElementById('inst-type-error');
                    const contactError = document.getElementById('inst-contact-error');
                    const formError = document.getElementById('register-inst-form-error');
                    const submitBtn = document.getElementById('submit-register-inst-btn');

                    if (nameError) nameError.textContent = '';
                    if (typeError) typeError.textContent = '';
                    if (contactError) contactError.textContent = '';
                    if (formError) formError.textContent = '';

                    const name = (nameInput && nameInput.value || '').trim();
                    const type = (typeInput && typeInput.value || '').trim();
                    const contact = (contactInput && contactInput.value || '').trim();

                    let hasError = false;
                    if (!name) {
                        if (nameError) nameError.textContent = 'Institution name is required.';
                        hasError = true;
                    } else if (name.length > 200) {
                        if (nameError) nameError.textContent = 'Institution name must be 200 characters or fewer.';
                        hasError = true;
                    }

                    if (!type) {
                        if (typeError) typeError.textContent = 'Institution type is required.';
                        hasError = true;
                    } else if (type.length > 100) {
                        if (typeError) typeError.textContent = 'Institution type must be 100 characters or fewer.';
                        hasError = true;
                    }

                    if (contact && contact.length > 254) {
                        if (contactError) contactError.textContent = 'Contact must be 254 characters or fewer.';
                        hasError = true;
                    }

                    if (hasError) return;

                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Registering...';

                    try {
                        const newInst = await store.addInstitution(name, type, contact);
                        if (newInst && newInst.id) {
                            currentUser.organizationId = newInst.id;
                        }
                        toast.success(`Institution "${name}" registered successfully!`);
                        closeModal();
                        routes['#/institutions']();
                    } catch (error) {
                        if (formError) formError.textContent = error.message || 'Failed to register institution';
                        toast.error(error.message || 'Failed to register institution');
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Register Institution';
                    }
                });
            }

        });
    },
    '#/organizations': async () => {
        if (!currentUser) { window.location.hash = '#/login'; return; }
        try {
            const application = await store.getMyOrganizationApplication();
            const applications = currentUser.isPlatformAdmin ? await store.getOrganizationApplications() : [];
            const invites = currentUser.role === 'manager' ? await store.getOrganizationInvites() : [];
            await render(Views.organizations(currentUser, application, applications, invites));
            const form = document.getElementById('organization-application-form');
            if (form) form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const submit = form.querySelector('button[type="submit"]');
                const error = document.getElementById('application-error');
                submit.disabled = true;
                try {
                    await store.applyForOrganization(Object.fromEntries(new FormData(form).entries()));
                    toast.success('Application submitted for verification');
                    routes['#/organizations']();
                } catch (err) { error.textContent = err.message || 'Could not submit application'; submit.disabled = false; }
            });
            const inviteForm = document.getElementById('invite-form');
            if (inviteForm) inviteForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const submit = inviteForm.querySelector('button[type="submit"]'); submit.disabled = true;
                try {
                    const fields = new FormData(inviteForm);
                    const invite = await store.createOrganizationInvite(Number(fields.get('maxUses')), Number(fields.get('expiresInDays')));
                    const inviteMessage = `Invite code: ${invite.code} · expires ${new Date(invite.expiresAt).toLocaleDateString()}. Copy it now; it will not be shown again.`;
                    await routes['#/organizations']();
                    document.getElementById('invite-result').textContent = inviteMessage;
                } catch (err) { toast.error(err.message || 'Could not create invite'); }
                finally { submit.disabled = false; }
            });
            document.querySelectorAll('.revoke-invite-btn').forEach((button) => button.addEventListener('click', async () => {
                button.disabled = true;
                try { await store.revokeOrganizationInvite(button.dataset.inviteId); toast.success('Invite revoked'); await routes['#/organizations'](); }
                catch (err) { toast.error(err.message || 'Could not revoke invite'); button.disabled = false; }
            }));
            document.querySelectorAll('.application-review-btn').forEach((button) => button.addEventListener('click', async () => {
                const commentInput = window.prompt('Review note (optional):', '');
                if (commentInput === null) return;
                const comment = commentInput;
                button.disabled = true;
                try { await store.reviewOrganizationApplication(button.dataset.id, button.dataset.action, comment); toast.success('Application decision saved'); routes['#/organizations'](); }
                catch (err) { toast.error(err.message || 'Could not review application'); button.disabled = false; }
            }));
        } catch (error) { toast.error(error.message || 'Could not open organization access'); }
    }
};

function setupRegisterPage() {
    const regForm = document.getElementById('register-form');
    if (!regForm) {
        console.error('Registration view rendered without #register-form');
        return;
    }
    const emailInput = regForm.elements.namedItem('username') || regForm.elements.namedItem('email');
    const passwordInput = regForm.elements.namedItem('password');
    const confirmInput = regForm.elements.namedItem('confirmPassword');
    const errorBox = document.getElementById('register-error');
    const showPasswordToggle = document.getElementById('show-password');
    const backToLogin = document.getElementById('back-to-login');

    if (backToLogin) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#/login';
        });
    }

    if (showPasswordToggle) {
        showPasswordToggle.addEventListener('change', () => {
            const type = showPasswordToggle.checked ? 'text' : 'password';
            if (passwordInput) passwordInput.type = type;
            if (confirmInput) confirmInput.type = type;
        });
    }

    function debounce(fn, ms = 250) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }

    const nameInput = regForm.elements.namedItem('name');
    if (nameInput) {
        nameInput.addEventListener('input', debounce(() => {
            const val = String(nameInput.value || '').trim();
            const errEl = document.getElementById('error-name');
            const msg = !val ? 'Enter your full name.' : '';
            nameInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (errEl) errEl.textContent = msg;
        }, 250));
    }

    if (emailInput) {
        emailInput.addEventListener('input', debounce(() => {
            const val = String(emailInput.value || '').trim();
            const errEl = document.getElementById('error-username');
            let msg = '';
            if (!val) msg = 'Enter your email address.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email address.';
            emailInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (errEl) errEl.textContent = msg;
        }, 250));
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', debounce(() => {
            const val = String(passwordInput.value || '');
            const errEl = document.getElementById('error-password');
            let msg = '';
            if (!val) msg = 'Enter a password.';
            else if (val.length < 8) msg = 'Use at least 8 characters.';
            passwordInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (errEl) errEl.textContent = msg;
        }, 250));
    }

    if (confirmInput) {
        confirmInput.addEventListener('input', debounce(() => {
            const val = String(confirmInput.value || '');
            const passVal = String(passwordInput ? passwordInput.value : '');
            const errEl = document.getElementById('error-confirmPassword');
            let msg = '';
            if (!val) msg = 'Confirm your password.';
            else if (val !== passVal) msg = 'Passwords do not match.';
            confirmInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (errEl) errEl.textContent = msg;
        }, 250));
    }

    regForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const btn = regForm.querySelector('button[type="submit"]');
        const formData = new FormData(regForm);
        const errors = {
            name: '',
            username: '',
            password: '',
            confirmPassword: '',
        };
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('username') || formData.get('email') || '').trim();
        const password = String(formData.get('password') || '');
        const confirmPassword = String(formData.get('confirmPassword') || '');

        if (!name) errors.name = 'Enter your full name.';
        if (!email) errors.username = 'Enter your email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.username = 'Enter a valid email address.';
        if (!password) errors.password = 'Enter a password.';
        else if (password.length < 8) errors.password = 'Use at least 8 characters.';
        if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
        else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

        Object.entries(errors).forEach(([field, message]) => {
            const input = regForm.elements.namedItem(field);
            const error = document.getElementById(`error-${field}`);
            if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
            if (error) error.textContent = message;
        });
        if (errorBox) errorBox.textContent = '';
        if (Object.values(errors).some(Boolean)) {
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span><span>Creating account…</span>';
        btn.setAttribute('aria-busy', 'true');

        try {
            const regUser = await store.register(email, password, 'worker', name);
            if (regUser && regUser.status && regUser.status !== 'active') {
                const card = regForm.closest('.card');
                if (card) {
                    card.innerHTML = `
                        <h2 class="auth-heading">Registration Pending</h2>
                        <div class="auth-success" role="status" aria-live="polite">
                            <p>Your account has been submitted and is pending administrator approval.</p>
                            <button id="success-login-btn" class="btn btn-primary" type="button">Back to Login</button>
                        </div>`;
                    document.getElementById('success-login-btn').addEventListener('click', () => {
                        window.location.hash = '#/login';
                    });
                }
                return;
            }

            // Active user registered and session established by server
            currentUser = regUser;
            updateAuthUI();
            const next = new URLSearchParams(window.location.hash.split('?')[1] || '').get('next');
            window.location.hash = next === 'organizations' ? '#/organizations' : '#/dashboard';
            showToast('Welcome to ORION! Your account has been created.');
        } catch (err) {
            console.error('Account registration failed:', err);
            if (err.status === 409 || /already exists|already registered|email is taken/i.test(err.message)) {
                if (emailInput) emailInput.setAttribute('aria-invalid', 'true');
                const errEmail = document.getElementById('error-username') || document.getElementById('error-email');
                if (errEmail) errEmail.textContent = 'An account with this email already exists.';
            } else {
                if (errorBox) {
                    errorBox.textContent = err.status
                        ? err.message
                        : 'We could not reach the server. Check your connection and try again.';
                }
            }
            btn.disabled = false;
            btn.textContent = 'CREATE ACCOUNT';
            btn.removeAttribute('aria-busy');
        }
    });
}

function updateAuthUI() {
    const navLogin = document.getElementById('nav-login');
    const navSchemes = document.getElementById('nav-schemes');
    const canSeeSchemes = currentUser && (
        currentUser.role === 'manager' ||
        currentUser.role === 'exec' ||
        currentUser.role === 'admin' ||
        Boolean(currentUser.isPlatformAdmin)
    );

    if (navSchemes) {
        navSchemes.style.display = canSeeSchemes ? '' : 'none';
    }

    if (currentUser) {
        navLogin.textContent = 'Dashboard';
        navLogin.href = '#/dashboard';
    } else {
        navLogin.textContent = 'Login';
        navLogin.href = '#/login';
    }
}

// ═══════════════════════════════════════
// 3D TILT MOTION
// ═══════════════════════════════════════
function apply3DMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    const cards = Array.from(document.querySelectorAll('.card-3d, .widget-card, .task-row-3d'));
    if (!cards.length) {
        return;
    }

    cards.forEach((card) => {
        if (card.dataset.tiltBound === '1') return;
        card.dataset.tiltBound = '1';

        let frame = null;
        let lastX = 0;
        let lastY = 0;

        const onPointerMove = (event) => {
            lastX = event.clientX;
            lastY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                const rect = card.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                const relX = (lastX - rect.left) / rect.width - 0.5;
                const relY = (lastY - rect.top) / rect.height - 0.5;
                const tiltX = relY * -6;
                const tiltY = relX * 10;
                card.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(0)`;
            });
        };

        const onPointerLeave = () => {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
            card.style.transform = '';
        };

        card.addEventListener('pointermove', onPointerMove);
        card.addEventListener('pointerleave', onPointerLeave);
    });
}

// ═══════════════════════════════════════
// AI ASSISTANT — Enhanced
// ═══════════════════════════════════════
function setupAiAssistant() {
    const toggle = document.getElementById('ai-help-toggle');
    const panel = document.getElementById('ai-help-panel');
    const input = document.getElementById('ai-help-input');
    const sendBtn = document.getElementById('ai-help-send');
    const feed = document.getElementById('ai-help-feed');
    if (!toggle || !panel || !input || !sendBtn || !feed || toggle.dataset.bound === '1') {
        return;
    }

    const getStorageKey = () => currentUser ? `orion_ai_history_${currentUser.id}` : null;

    const saveHistory = () => {
        const key = getStorageKey();
        if (!key) return;
        try {
            const messages = [];
            feed.querySelectorAll('.ai-help-msg').forEach((el) => {
                const who = el.classList.contains('ai-help-msg-user') ? 'user' : 'bot';
                messages.push({ who, html: el.innerHTML });
            });
            sessionStorage.setItem(key, JSON.stringify(messages.slice(-30)));
        } catch (_e) {}
    };

    const loadHistory = () => {
        const key = getStorageKey();
        if (!key) return;
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return;
            const messages = JSON.parse(raw);
            if (Array.isArray(messages) && messages.length > 0) {
                feed.innerHTML = '';
                for (const m of messages) {
                    const row = document.createElement('div');
                    row.className = `ai-help-msg ai-help-msg-${m.who}`;
                    row.innerHTML = m.html;
                    feed.appendChild(row);
                }
                feed.scrollTop = feed.scrollHeight;
            }
        } catch (_e) {}
    };

    loadHistory();

    const formatMessageText = (text) => {
        if (!text) return '';
        // Escape HTML
        let safe = String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;');
        // Basic Markdown bold & italic
        safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Bullets and newlines
        safe = safe.replace(/\n/g, '<br>');
        return safe;
    };

    const appendMessage = (text, who) => {
        const row = document.createElement('div');
        row.className = `ai-help-msg ai-help-msg-${who}`;
        row.innerHTML = formatMessageText(text);
        row.style.opacity = '0';
        row.style.transform = 'translateY(8px)';
        feed.appendChild(row);
        
        requestAnimationFrame(() => {
            row.style.transition = 'opacity var(--dur-fast) var(--ease-smooth), transform var(--dur-fast) var(--ease-smooth)';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        });
        feed.scrollTop = feed.scrollHeight;
        saveHistory();
        return row;
    };

    const appendActionCard = (proposal) => {
        const card = document.createElement('div');
        card.className = 'ai-action-card';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'ai-action-title';
        titleDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Action Confirmation Required';

        const descDiv = document.createElement('div');
        descDiv.className = 'ai-action-desc';
        // SECURE: textContent prevents HTML execution of untrusted task titles or names
        descDiv.textContent = proposal.summary || 'Are you sure you want to perform this action?';

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'ai-action-buttons';
        buttonsDiv.innerHTML = `
            <button class="ai-action-btn-confirm" id="btn-confirm-action">Confirm Reassign</button>
            <button class="ai-action-btn-cancel" id="btn-cancel-action">Cancel</button>
        `;

        card.append(titleDiv, descDiv, buttonsDiv);
        feed.appendChild(card);
        feed.scrollTop = feed.scrollHeight;

        const confirmBtn = card.querySelector('#btn-confirm-action');
        const cancelBtn = card.querySelector('#btn-cancel-action');

        confirmBtn.addEventListener('click', async () => {
            confirmBtn.disabled = true;
            cancelBtn.disabled = true;
            confirmBtn.textContent = 'Executing...';
            try {
                const res = await store.assistantChat({ confirmedAction: proposal });
                const successDiv = document.createElement('div');
                successDiv.style.color = 'var(--success, #10b981)';
                successDiv.style.fontWeight = '500';
                successDiv.textContent = '✓ Action confirmed and executed';
                card.replaceChildren(successDiv);
                appendMessage(res.text || 'Action successfully executed.', 'bot');
                showToast('Task reassigned successfully');
                if (typeof renderApp === 'function') renderApp();
            } catch (err) {
                const errDiv = document.createElement('div');
                errDiv.style.color = 'var(--danger, #ef4444)';
                errDiv.textContent = `✗ Failed: ${err.message}`;
                card.replaceChildren(errDiv);
                showToast(err.message, 'error');
            }
        });

        cancelBtn.addEventListener('click', () => {
            card.remove();
            appendMessage('Action cancelled.', 'bot');
        });
    };

    const showTypingIndicator = () => {
        const typing = document.createElement('div');
        typing.className = 'ai-typing';
        typing.id = 'ai-typing-indicator';
        typing.innerHTML = '<div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div>';
        feed.appendChild(typing);
        feed.scrollTop = feed.scrollHeight;
        return typing;
    };

    const handleSend = async () => {
        const question = input.value.trim();
        if (!question) return;

        appendMessage(question, 'user');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const typing = showTypingIndicator();
        let messageRow = null;
        let streamedText = '';

        const renderStreamChunk = (chunk) => {
            if (typing && typing.parentNode) {
                typing.remove();
            }
            streamedText += chunk;
            if (!messageRow) {
                messageRow = document.createElement('div');
                messageRow.className = 'ai-help-msg ai-help-msg-bot';
                feed.appendChild(messageRow);
            }
            messageRow.innerHTML = formatMessageText(streamedText);
            feed.scrollTop = feed.scrollHeight;
        };

        try {
            const res = await store.assistantChatStream({ message: question }, renderStreamChunk);
            if (typing && typing.parentNode) {
                typing.remove();
            }
            const modeBadge = res?.mode === 'gemini' 
                ? '<span class="ai-badge ai-badge-gemini" style="display:inline-block; margin-left:6px; font-size:10px; font-weight:600; padding:1px 6px; border-radius:4px; background:rgba(99,102,241,0.15); color:var(--primary, #6366f1); border:1px solid rgba(99,102,241,0.3)">[Gemini AI]</span>'
                : '<span class="ai-badge ai-badge-local" style="display:inline-block; margin-left:6px; font-size:10px; font-weight:600; padding:1px 6px; border-radius:4px; background:rgba(16,185,129,0.15); color:var(--success, #10b981); border:1px solid rgba(16,185,129,0.3)">[Local Rule Engine]</span>';

            if (!messageRow && res && res.text) {
                messageRow = document.createElement('div');
                messageRow.className = 'ai-help-msg ai-help-msg-bot';
                feed.appendChild(messageRow);
            }
            if (messageRow) {
                messageRow.innerHTML = formatMessageText(res.text || streamedText) + ' ' + modeBadge;
                feed.scrollTop = feed.scrollHeight;
                saveHistory();
            }
            if (res && res.proposal) {
                appendActionCard(res.proposal);
            }
        } catch (err) {
            if (typing && typing.parentNode) {
                typing.remove();
            }
            appendMessage('Sorry, I encountered an error communicating with the assistant service: ' + (err.message || 'Unknown error'), 'bot');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            setTimeout(() => input.focus(), 100);
        }
    });

    sendBtn.addEventListener('click', handleSend);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    });

    document.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.textContent;
            handleSend();
        });
    });

    toggle.dataset.bound = '1';

    // Click outside AI panel to close
    document.addEventListener('click', (event) => {
        if (
            panel.classList.contains('open') &&
            !panel.contains(event.target) &&
            !toggle.contains(event.target)
        ) {
            panel.classList.remove('open');
        }
    });
}

// Global modal & drawer dismiss on Escape or backdrop click
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('#task-modal, #project-modal, #report-modal');
        modals.forEach((m) => {
            if (m && m.style.display !== 'none') {
                m.style.display = 'none';
            }
        });
        const aiPanel = document.getElementById('ai-help-panel');
        if (aiPanel && aiPanel.classList.contains('open')) {
            aiPanel.classList.remove('open');
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'task-modal' || e.target.id === 'project-modal' || e.target.id === 'report-modal')) {
        e.target.style.display = 'none';
    }
});


// -------------------------------------------------------------
// Data Export Handlers (Issue 5: CSV & PDF Exports)
// -------------------------------------------------------------
document.addEventListener('click', async (e) => {
    // Tasks Export CSV
    const exportTasksBtn = e.target.closest('#export-tasks-btn');
    if (exportTasksBtn) {
        exportTasksBtn.disabled = true;
        const origContent = exportTasksBtn.innerHTML;
        exportTasksBtn.textContent = 'Exporting...';
        try {
            const searchInput = document.getElementById('task-search-input');
            const statusSelect = document.getElementById('task-status-filter');
            const params = new URLSearchParams();
            if (searchInput && searchInput.value.trim()) params.append('search', searchInput.value.trim());
            if (statusSelect && statusSelect.value) params.append('status', statusSelect.value);

            const dateStr = new Date().toISOString().split('T')[0];
            const downloadUrl = `/api/v1/export/tasks/csv?${params.toString()}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `tasks_${dateStr}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Tasks CSV export started');
        } catch (err) {
            showToast('Failed to export tasks: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            exportTasksBtn.disabled = false;
            exportTasksBtn.innerHTML = origContent;
        }
        return;
    }

    // Projects Export CSV
    const exportProjectsBtn = e.target.closest('#export-projects-btn');
    if (exportProjectsBtn) {
        exportProjectsBtn.disabled = true;
        const origContent = exportProjectsBtn.innerHTML;
        exportProjectsBtn.textContent = 'Exporting...';
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const downloadUrl = '/api/v1/export/projects/csv';
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `projects_${dateStr}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Projects CSV export started');
        } catch (err) {
            showToast('Failed to export projects: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            exportProjectsBtn.disabled = false;
            exportProjectsBtn.innerHTML = origContent;
        }
        return;
    }

    // Project Report PDF
    const exportPdfBtn = e.target.closest('.export-project-pdf-btn');
    if (exportPdfBtn) {
        const projectId = exportPdfBtn.dataset.projectId;
        if (!projectId) return;
        exportPdfBtn.disabled = true;
        const origContent = exportPdfBtn.innerHTML;
        exportPdfBtn.textContent = 'Generating...';
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const downloadUrl = `/api/v1/export/projects/${encodeURIComponent(projectId)}/pdf`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `project_${projectId}_report_${dateStr}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Project PDF report downloading');
        } catch (err) {
            showToast('Failed to export project PDF: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = origContent;
        }
        return;
    }
});

let router;

store.getSession().then((user) => {
    currentUser = user;
    updateAuthUI();
    router = new Router(routes);
}).catch((error) => {
    console.error('Unable to restore session:', error);
    router = new Router(routes);
});
