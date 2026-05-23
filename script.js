```javascript
// Liquid GUI Micro-Interaction - Custom JS Logic

const config = {
    viscosity: 15,
    tension: 35,
    threshold: -15,
    spring: 0.45,
    damping: 0.6,
    snap: 0.5,
    wobble: 15,
    pull: 180,
    size: 52,
    hue: 200
};

const titles = [
    "1. Gooey Tab Navigation",
    "2. Liquid Pull-to-Refresh",
    "3. Mercury Switch",
    "4. Cell Division FAB"
];

let activeComponentIdx = 0;

const svgBlur = document.getElementById('svg-blur');
const svgMatrix = document.getElementById('svg-matrix');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeIcon.innerHTML = isDark 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>' 
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
});

// 서랍 제어 바인딩
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');

function openSidebar() {
    sidebar.classList.remove('translate-x-full');
    sidebarOverlay.classList.remove('hidden');
    setTimeout(() => sidebarOverlay.classList.add('opacity-100'), 10);
}

function closeSidebar() {
    sidebar.classList.add('translate-x-full');
    sidebarOverlay.classList.remove('opacity-100');
    setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

function selectComponent(idx, elementId) {
    activeComponentIdx = idx;
    document.getElementById('active-component-title').innerText = titles[idx];
    
    document.querySelectorAll('.comp-view').forEach(view => view.classList.add('hidden'));
    document.getElementById(elementId).classList.remove('hidden');
    if (elementId === 'comp-pull-refresh' || elementId === 'comp-fab') {
        document.getElementById(elementId).style.display = 'flex';
    }

    document.querySelectorAll('.comp-nav-btn').forEach((btn, bIdx) => {
        if (bIdx === idx) {
            btn.className = "comp-nav-btn px-3 py-1.5 text-[11px] font-bold rounded-xl border border-sky-400/30 text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 transition-all";
        } else {
            btn.className = "comp-nav-btn px-3 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-all";
        }
    });

    adaptPhysicsPreset(idx);
    
    // 모바일일 경우 컴포넌트 스위칭 후 서랍을 자동으로 접어 감상에 집중할 수 있도록 처리합니다.
    if(window.innerWidth < 768) {
        closeSidebar();
    }
}

function adaptPhysicsPreset(idx) {
    if (idx === 0) {
        updateSlider('viscosity', 14);
        updateSlider('tension', 32);
        updateSlider('threshold', -13);
        updateSlider('snap', 0.5);
    } else if (idx === 1) {
        updateSlider('viscosity', 18);
        updateSlider('tension', 45);
        updateSlider('threshold', -18);
        updateSlider('size', 56);
    } else if (idx === 2) {
        updateSlider('viscosity', 16);
        updateSlider('tension', 38);
        updateSlider('threshold', -14);
        updateSlider('size', 52);
    } else if (idx === 3) {
        updateSlider('viscosity', 12);
        updateSlider('tension', 30);
        updateSlider('threshold', -11);
        updateSlider('size', 48);
    }
}

function updateSlider(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
        config[id] = val;
        const display = document.getElementById('v-' + id);
        if (display) display.innerText = (id === 'snap') ? val + 's' : ((id==='wobble' || id==='pull' || id==='size') ? val+'px' : val);
        applyPhysicsToDOM(id, val);
    }
}

// 1. [TAB NAV] 상호작용
function switchTab(btn, index) {
    const tabs = document.querySelectorAll('.tab-item');
    const indicator = document.getElementById('tab-indicator');
    
    tabs.forEach((tab, i) => {
        if (i === index) {
            tab.classList.remove('text-slate-400', 'dark:text-slate-500', 'hover:text-slate-600');
            tab.classList.add('text-white');
        } else {
            tab.classList.add('text-slate-400', 'dark:text-slate-500');
            tab.classList.remove('text-white');
        }
    });

    const leftOffset = 12 + (index * 80); // 탭 정밀 좌표 매칭
    
    if (config.viscosity > 0) {
        const currentLeft = parseFloat(indicator.style.left) || 12;
        const isForward = leftOffset > currentLeft;
        const distance = Math.abs(leftOffset - currentLeft);
        
        const stretchWidth = 68 + (distance * config.spring * 0.4);
        indicator.style.width = `${stretchWidth}px`;
        if (!isForward) {
            indicator.style.left = `${leftOffset}px`;
        }
        
        setTimeout(() => {
            indicator.style.width = '68px';
            indicator.style.left = `${leftOffset}px`;
        }, config.snap * 500);
    } else {
        indicator.style.width = '68px';
        indicator.style.left = `${leftOffset}px`;
    }
}

// 2. [PULL REFRESH] 터치 드래그 물리 로직
const pullContainer = document.getElementById('pull-container');
const pullFluid = document.getElementById('pull-fluid');
const spinnerIcon = document.getElementById('spinner-icon');

let isPulling = false;
let startY = 0;
let pullDist = 0;
let isRefreshing = false;

function handlePullStart(e) {
    if (isRefreshing) return;
    isPulling = true;
    startY = e.clientY || e.touches[0].clientY;
    pullFluid.style.transition = 'none';
}

function handlePullMove(e) {
    if (!isPulling || isRefreshing) return;
    const currentY = e.clientY || e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
        const limit = config.pull;
        const dampingFactor = 1 - (config.damping * 0.45);
        pullDist = Math.min(deltaY * dampingFactor, limit);

        const scaleX = 1 - (pullDist / limit) * 0.45 * (config.viscosity / 20);
        const scaleY = 1 + (pullDist / limit) * 1.1 * (config.viscosity / 20);
        
        pullFluid.style.top = `${pullDist}px`;
        pullFluid.style.transform = `scale(${scaleX}, ${scaleY})`;
        
        pullFluid.style.width = `${config.size}px`;
        pullFluid.style.height = `${config.size}px`;
    }
}

function handlePullEnd() {
    if (!isPulling) return;
    isPulling = false;
    
    const limit = config.pull;

    if (pullDist >= limit * 0.8 && config.viscosity > 3) {
        isRefreshing = true;
        
        pullFluid.style.transition = `all ${config.snap}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        pullFluid.style.top = `${limit + 30}px`;
        pullFluid.style.transform = 'scale(0)';
        
        setTimeout(() => {
            spinnerIcon.classList.remove('hidden');
            pullFluid.style.top = '24px';
            pullFluid.style.transform = 'scale(1)';
            pullFluid.style.width = '40px';
            pullFluid.style.height = '40px';
        }, config.snap * 1000);

        setTimeout(() => {
            resetPullState();
        }, 2800);

    } else {
        pullFluid.style.transition = `all ${config.snap}s cubic-bezier(0.175, 0.885, 0.32, ${1 + (config.wobble/30)})`;
        pullFluid.style.top = '0px';
        pullFluid.style.transform = 'scale(1)';
        pullFluid.style.width = `${config.size}px`;
        pullFluid.style.height = `${config.size}px`;
    }
    pullDist = 0;
}

function resetPullState() {
    isRefreshing = false;
    spinnerIcon.classList.add('hidden');
    pullFluid.style.transition = `all ${config.snap}s ease`;
    pullFluid.style.top = '0px';
    pullFluid.style.transform = 'scale(1)';
    pullFluid.style.width = `${config.size}px`;
    pullFluid.style.height = `${config.size}px`;
}

// 이벤트 인터셉트 방지 전용 셋
pullContainer.addEventListener('mousedown', handlePullStart);
pullContainer.addEventListener('touchstart', handlePullStart, { passive: true });

window.addEventListener('mousemove', (e) => {
    if (activeComponentIdx === 1 && isPulling) handlePullMove(e);
});
window.addEventListener('touchmove', (e) => {
    if (activeComponentIdx === 1 && isPulling) {
        if (e.cancelable) e.preventDefault();
        handlePullMove(e);
    }
}, { passive: false });

window.addEventListener('mouseup', handlePullEnd);
window.addEventListener('touchend', handlePullEnd);

// 3. [MERCURY SWITCH] 수은 스냅 토글
let isToggled = false;
function toggleSwitch() {
    isToggled = !isToggled;
    const leftBlob = document.getElementById('toggle-blob-left');
    const rightBlob = document.getElementById('toggle-blob-right');
    const trackGlow = document.getElementById('toggle-track-glow');

    leftBlob.style.transition = `all ${config.snap}s cubic-bezier(0.19, 1, 0.22, 1)`;
    rightBlob.style.transition = `all ${config.snap}s cubic-bezier(0.19, 1, 0.22, 1)`;

    if (isToggled) {
        leftBlob.style.width = `${config.size * 0.7}px`;
        leftBlob.style.height = `${config.size * 0.7}px`;
        leftBlob.style.left = '35px';
        
        rightBlob.style.opacity = '1';
        rightBlob.style.transform = 'scale(1.2)';
        rightBlob.style.width = `${config.size}px`;
        rightBlob.style.height = `${config.size}px`;

        setTimeout(() => {
            leftBlob.style.transform = 'scale(0)';
            leftBlob.style.opacity = '0';
            rightBlob.style.transform = 'scale(1)';
        }, config.snap * 300);

        trackGlow.style.backgroundColor = 'var(--accent-glow)';
    } else {
        leftBlob.style.opacity = '1';
        leftBlob.style.transform = 'scale(1.2)';
        leftBlob.style.left = '8px';
        leftBlob.style.width = `${config.size}px`;
        leftBlob.style.height = `${config.size}px`;

        rightBlob.style.width = `${config.size * 0.7}px`;
        rightBlob.style.height = `${config.size * 0.7}px`;

        setTimeout(() => {
            rightBlob.style.transform = 'scale(0)';
            rightBlob.style.opacity = '0';
            leftBlob.style.transform = 'scale(1)';
        }, config.snap * 300);

        trackGlow.style.backgroundColor = 'transparent';
    }
}

// 4. [DIVISION FAB] 동작 제어
const fabBtn = document.getElementById('fab-main-btn');
let isFabOpen = false;

fabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isFabOpen = !isFabOpen;
    const subs = document.querySelectorAll('.fab-sub');
    const icon = document.getElementById('fab-icon');

    icon.style.transform = isFabOpen ? 'rotate(135deg)' : 'rotate(0deg)';

    subs.forEach((sub, i) => {
        sub.style.transition = `all ${config.snap + (i*0.1)}s cubic-bezier(0.175, 0.885, 0.32, ${1.1 + (config.wobble / 40)})`;
        
        if (isFabOpen) {
            sub.style.width = `${config.size * 0.9}px`;
            sub.style.height = `${config.size * 0.9}px`;
            const angle = (Math.PI / 2) * (i / 2) + Math.PI; 
            const dist = 74 + (config.wobble * 0.8);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            sub.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;
        } else {
            sub.style.transform = 'translate(0, 0) scale(0)';
        }
    });
});

const setupPhysicsController = (id) => {
    const el = document.getElementById(id);
    const valLabel = document.getElementById('v-' + id);
    
    el.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        config[id] = val;
        
        valLabel.innerText = (id === 'snap') ? val + 's' : ((id==='wobble' || id==='pull' || id==='size') ? val+'px' : val);
        applyPhysicsToDOM(id, val);
    });
};

['viscosity', 'tension', 'threshold', 'spring', 'damping', 'snap', 'wobble', 'pull', 'size', 'hue'].forEach(setupPhysicsController);

function applyPhysicsToDOM(id, value) {
    if (id === 'viscosity') {
        svgBlur.setAttribute('stdDeviation', value);
    }
    if (id === 'tension' || id === 'threshold') {
        svgMatrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${config.tension} ${config.threshold}`);
    }
    if (id === 'hue') {
        document.documentElement.style.setProperty('--accent-hue', value);
    }
    if (id === 'size') {
        document.querySelectorAll('.fab-sub').forEach(el => {
            if(!isFabOpen) return;
            el.style.width = `${value * 0.9}px`;
            el.style.height = `${value * 0.9}px`;
        });
        if(!isPulling) {
            pullFluid.style.width = `${value}px`;
            pullFluid.style.height = `${value}px`;
        }
    }
}

function resetPhysics() {
    updateSlider('viscosity', 15);
    updateSlider('tension', 35);
    updateSlider('threshold', -15);
    updateSlider('spring', 0.45);
    updateSlider('damping', 0.6);
    updateSlider('snap', 0.5);
    updateSlider('wobble', 15);
    updateSlider('pull', 180);
    updateSlider('size', 52);
    updateSlider('hue', 200);
    
    if (isFabOpen) fabBtn.click();
    if (isToggled) toggleSwitch();
    resetPullState();
}

function copyComponentCode() {
    let componentMarkup = "";
    let componentScript = "";

    const sTag = '<' + 'script' + '>';
    const eTag = '<' + '/' + 'script' + '>';

    if (activeComponentIdx === 0) { 
        componentMarkup = `
    <div class="w-full max-w-[340px] h-[64px] rounded-[24px] bg-slate-100 p-1.5 relative border border-slate-200/40 overflow-hidden">
        <div class="gooey-container absolute inset-0 w-full h-full pointer-events-none">
            <div class="absolute w-[24px] h-[24px] rounded-full bg-slate-200/50 top-5 left-[34px]"></div>
            <div class="absolute w-[24px] h-[24px] rounded-full bg-slate-200/50 top-5 left-[114px]"></div>
            <div class="absolute w-[24px] h-[24px] rounded-full bg-slate-200/50 top-5 left-[194px]"></div>
            <div id="tab-indicator" class="absolute h-[42px] w-[68px] rounded-[16px] top-1.5 transition-all" style="background-color: hsl(${config.hue}, 90%, 55%); left: 12px;"></div>
        </div>
        <div class="absolute inset-0 w-full h-full flex justify-between items-center px-3 z-10">
            <button class="tab-item text-xs font-bold text-white flex-1 text-center" onclick="switchTab(this, 0)">Home</button>
            <button class="tab-item text-xs font-bold text-slate-400 flex-1 text-center" onclick="switchTab(this, 1)">Explore</button>
            <button class="tab-item text-xs font-bold text-slate-400 flex-1 text-center" onclick="switchTab(this, 2)">Messages</button>
        </div>
    </div>`;
                componentScript = `
        const config = {
            viscosity: ${config.viscosity},
            spring: ${config.spring},
            snap: ${config.snap},
            hue: ${config.hue}
        };
        function switchTab(btn, index) {
            const tabs = document.querySelectorAll('.tab-item');
            const indicator = document.getElementById('tab-indicator');
            tabs.forEach((tab, i) => {
                tab.style.color = (i === index) ? '#fff' : '#94a3b8';
            });
            const leftOffset = 12 + (index * 80);
            if (config.viscosity > 0) {
                const currentLeft = parseFloat(indicator.style.left || 12);
                const distance = Math.abs(leftOffset - currentLeft);
                const stretchWidth = 68 + (distance * config.spring * 0.4);
                indicator.style.width = stretchWidth + "px";
                if (leftOffset < currentLeft) indicator.style.left = leftOffset + "px";
                setTimeout(() => {
                    indicator.style.width = '68px';
                    indicator.style.left = leftOffset + "px";
                }, config.snap * 500);
            } else {
                indicator.style.width = '68px';
                indicator.style.left = leftOffset + "px";
            }
        }`;
            } else if (activeComponentIdx === 1) { 
                componentMarkup = `
    <div id="pull-container" class="w-full max-w-[340px] h-[360px] rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden relative flex flex-col items-center justify-center pt-4 select-none">
        <div class="gooey-container w-full h-24 relative flex justify-center">
            <div class="absolute w-24 h-3.5 bg-slate-300 rounded-b-full top-0"></div>
            <div id="pull-fluid" class="absolute w-[${config.size}px] h-[${config.size}px] rounded-full top-0 origin-top flex items-center justify-center transition-all duration-100" style="background-color: hsl(${config.hue}, 90%, 55%);">
                <svg id="spinner-icon" class="hidden animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </div>
        <div class="text-center mt-12"><p class="text-sm font-semibold text-slate-500">아래로 부드럽게 끌어내리세요</p></div>
    </div>`;
                componentScript = `
        const config = {
            viscosity: ${config.viscosity},
            damping: ${config.damping},
            snap: ${config.snap},
            wobble: ${config.wobble},
            pull: ${config.pull},
            size: ${config.size},
            hue: ${config.hue}
        };
        const container = document.getElementById('pull-container');
        const fluid = document.getElementById('pull-fluid');
        const spinner = document.getElementById('spinner-icon');
        let startY = 0, pulling = false, dist = 0, refreshing = false;

        container.addEventListener('mousedown', (e) => {
            if(refreshing) return; pulling = true; startY = e.clientY; fluid.style.transition = 'none';
        });
        window.addEventListener('mousemove', (e) => {
            if(!pulling || refreshing) return;
            const dy = e.clientY - startY;
            if(dy > 0) {
                dist = Math.min(dy * (1 - config.damping * 0.4), config.pull);
                const sx = 1 - (dist/config.pull)*0.45*(config.viscosity/20);
                const sy = 1 + (dist/config.pull)*1.1*(config.viscosity/20);
                fluid.style.top = dist + 'px';
                fluid.style.transform = \`scale(\${sx}, \${sy})\`;
            }
        });
        window.addEventListener('mouseup', () => {
            if(!pulling) return; pulling = false;
            if(dist >= config.pull * 0.8) {
                refreshing = true;
                fluid.style.transition = \`all \${config.snap}s ease\`;
                fluid.style.top = (config.pull + 30) + 'px';
                fluid.style.transform = 'scale(0)';
                setTimeout(() => {
                    spinner.classList.remove('hidden');
                    fluid.style.top = '24px'; fluid.style.transform = 'scale(1)';
                    fluid.style.width = '40px'; fluid.style.height = '40px';
                }, config.snap * 1000);
                setTimeout(() => {
                    refreshing = false; spinner.classList.add('hidden');
                    fluid.style.top = '0px'; fluid.style.width = config.size+'px'; fluid.style.height = config.size+'px';
                }, 3000);
            } else {
                fluid.style.transition = \`all \${config.snap}s cubic-bezier(0.175, 0.885, 0.32, \${1 + config.wobble/30})\`;
                fluid.style.top = '0px'; fluid.style.transform = 'scale(1)';
            }
        });`;
            } else if (activeComponentIdx === 2) { 
                componentMarkup = `
    <div class="gooey-container bg-slate-100 p-2 rounded-full w-40 h-20 relative flex items-center cursor-pointer" onclick="toggleSwitch()">
        <div id="toggle-blob-left" class="absolute w-[${config.size}px] h-[${config.size}px] rounded-full transition-all" style="left: 8px; background-color: hsl(${config.hue}, 90%, 55%);"></div>
        <div id="toggle-blob-right" class="absolute w-[${config.size * 0.7}px] h-[${config.size * 0.7}px] rounded-full scale-0 opacity-0 transition-all" style="right: 12px; background-color: hsl(${config.hue}, 90%, 55%);"></div>
    </div>`;
                componentScript = `
        let toggled = false;
        const config = { snap: ${config.snap}, size: ${config.size} };
        function toggleSwitch() {
            toggled = !toggled;
            const left = document.getElementById('toggle-blob-left');
            const right = document.getElementById('toggle-blob-right');
            left.style.transition = right.style.transition = \`all \${config.snap}s ease\`;
            if(toggled) {
                left.style.width = right.style.width = config.size + 'px';
                left.style.left = '35px'; right.style.opacity = '1'; right.style.transform = 'scale(1.2)';
                setTimeout(() => { left.style.transform = 'scale(0)'; right.style.transform = 'scale(1)'; }, config.snap * 300);
            } else {
                left.style.opacity = '1'; left.style.transform = 'scale(1.2)'; left.style.left = '8px';
                setTimeout(() => { right.style.transform = 'scale(0)'; left.style.transform = 'scale(1)'; }, config.snap * 300);
            }
        }`;
            } else { 
                componentMarkup = `
    <div class="gooey-container w-40 h-40 relative flex items-end justify-end p-4">
        <button class="fab-sub absolute w-12 h-12 rounded-full flex items-center justify-center text-white scale-0 transition-all" style="background-color: hsl(${config.hue}, 90%, 55%); bottom: 16px; right: 16px; z-index: 10;">1</button>
        <button class="fab-sub absolute w-12 h-12 rounded-full flex items-center justify-center text-white scale-0 transition-all" style="background-color: hsl(${config.hue}, 90%, 55%); bottom: 16px; right: 16px; z-index: 10;">2</button>
        <button id="fab-main-btn" class="relative w-16 h-16 rounded-full flex items-center justify-center text-white" style="background-color: hsl(${config.hue}, 90%, 55%); z-index: 50;" onclick="toggleFab()">+</button>
    </div>`;
                componentScript = `
        let open = false;
        const config = { snap: ${config.snap}, wobble: ${config.wobble}, size: ${config.size} };
        function toggleFab() {
            open = !open;
            const subs = document.querySelectorAll('.fab-sub');
            subs.forEach((sub, i) => {
                sub.style.transition = \`all \${config.snap + (i*0.1)}s ease\`;
                if(open) {
                    const ang = (Math.PI/2)*(i/1) + Math.PI;
                    const tx = Math.cos(ang) * (80 + config.wobble);
                    const ty = Math.sin(ang) * (80 + config.wobble);
                    sub.style.transform = \`translate(\${tx}px, \${ty}px) scale(1)\`;
                    sub.style.width = sub.style.height = config.size + 'px';
                } else {
                    sub.style.transform = 'translate(0,0) scale(0)';
                }
            });
        }`;
            }

            const fullCode = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquid UI Component - Standalone</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .gooey-container { filter: url('#export-gooey-filter'); }
    </style>
</head>
<body>

    <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
        <defs>
            <filter id="export-gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${config.viscosity}" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${config.tension} ${config.threshold}" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
        </defs>
    </svg>

    ${componentMarkup}

    ${sTag}
        ${componentScript}
    ${eTag}
</body>
</html>`;

            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = fullCode;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            try {
                document.execCommand('copy');
                const toast = document.getElementById('toast');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            } catch (err) {
                console.error('클립보드 복사 중 오류 발생:', err);
            }
            document.body.removeChild(tempTextArea);
        }

        selectComponent(0, 'comp-tab-bar');
    </script>

```
