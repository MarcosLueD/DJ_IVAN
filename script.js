// 1. LOADING SCREEN
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('fade-out');
    }, 1200);
});

// 2. CURSOR PERSONALIZADO E SUAVE
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

document.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    
    // Pequeno atraso intencional para efeito elástico premium
    setTimeout(() => {
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
    }, 40);
});

// Interações do cursor com elementos clicáveis
document.querySelectorAll('.interactable').forEach(item => {
    item.addEventListener('mouseenter', () => {
        ring.style.width = '50px';
        ring.style.height = '50px';
        ring.style.borderColor = '#00ff44';
        ring.style.backgroundColor = 'rgba(0, 255, 68, 0.05)';
    });
    item.addEventListener('mouseleave', () => {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.borderColor = 'rgba(0, 255, 68, 0.3)';
        ring.style.backgroundColor = 'transparent';
    });
});

// 3. EFEITOS SONOROS NOS BOTÕES (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playButtonFeedback() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

document.querySelectorAll('.btn-sound').forEach(btn => {
    btn.addEventListener('click', playButtonFeedback);
});

// 4. SISTEMA DE PARTÍCULAS NO FUNDO (Canvas)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particlesArray = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.color = Math.random() > 0.5 ? '#00ff44' : '#ffd700';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 65; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

// 5. LIGHTBOX DE IMAGENS DA GALERIA
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('click', () => {
        const src = item.querySelector('img').src;
        lightboxImg.src = src;
        lightbox.classList.add('active');
    });
});

lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
});

// 6. SISTEMA DO PLAYER DE ÁUDIO & ANIMAÇÕES
const audio = new Audio();
const mainVinyl = document.getElementById('main-vinyl');
const miniVinyl = document.getElementById('mini-vinyl');
const mainEqualizer = document.getElementById('main-equalizer');

const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const progressFill = document.getElementById('progress-fill');
const progressContainer = document.getElementById('progress-container');

const currentTitle = document.getElementById('current-title');
const currentTrackTime = document.getElementById('current-time');
const totalDurationText = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');

let trackElements = Array.from(document.querySelectorAll('.track-item'));
let currentTrackIndex = -1;

function updatePlayerUI(title, duration) {
    currentTitle.textContent = title;
    totalDurationText.textContent = duration;
    progressFill.style.width = '0%';
}

function playTrack(index) {
    if (index < 0 || index >= trackElements.length) return;
    
    // Remover classes ativas antigas
    trackElements.forEach(el => el.classList.remove('playing-now'));
    
    currentTrackIndex = index;
    const targetTrack = trackElements[currentTrackIndex];
    targetTrack.classList.add('playing-now');
    
    const src = targetTrack.getAttribute('data-src');
    const title = targetTrack.getAttribute('data-title');
    const duration = targetTrack.getAttribute('data-duration');
    
    audio.src = src;
    updatePlayerUI(title, duration);
    
    audio.play();
    setPlayingState(true);
}

function setPlayingState(isPlaying) {
    if (isPlaying) {
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
        mainVinyl.classList.remove('paused');
        mainVinyl.classList.add('fast');
        miniVinyl.classList.add('running');
        mainEqualizer.classList.add('active');
    } else {
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        mainVinyl.classList.add('paused');
        mainVinyl.classList.remove('fast');
        miniVinyl.classList.remove('running');
        mainEqualizer.classList.remove('active');
    }
}

// Configuração dos clicks nas tracks da lista
trackElements.forEach((track, index) => {
    track.addEventListener('click', () => {
        if (currentTrackIndex === index) {
            if (audio.paused) {
                audio.play();
                setPlayingState(true);
            } else {
                audio.pause();
                setPlayingState(false);
            }
        } else {
            playTrack(index);
        }
    });
});

// Play / Pause Geral do Player Ativo
playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTrackIndex === -1) {
        // Se nenhuma música estiver carregada, toca a primeira
        playTrack(0);
    } else {
        if (audio.paused) {
            audio.play();
            setPlayingState(true);
        } else {
            audio.pause();
            setPlayingState(false);
        }
    }
});

// Controles de Próximo e Anterior
document.getElementById('next-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= trackElements.length) nextIndex = 0;
    playTrack(nextIndex);
});

document.getElementById('prev-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = trackElements.length - 1;
    playTrack(prevIndex);
});

// Atualização de tempo e progresso
audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    
    // Formatar minutos e segundos atuais
    let mins = Math.floor(audio.currentTime / 60);
    let secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) secs = '0' + secs;
    currentTrackTime.textContent = `${mins}:${secs}`;
});

// Evento de clique na barra para avançar/retroceder áudio
progressContainer.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    audio.currentTime = (clickX / width) * audio.duration;
});

// Controle de Volume
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Reset ao terminar faixa
audio.addEventListener('ended', () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex < trackElements.length) {
        playTrack(nextIndex);
    } else {
        setPlayingState(false);
    }
});

// Modo Fullscreen do Player (Extra)
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const playerBox = document.querySelector('.player-container');
    playerBox.classList.toggle('fullscreen-mode');
    if(playerBox.classList.contains('fullscreen-mode')) {
        fullscreenBtn.querySelector('i').classList.replace('fa-expand', 'fa-compress');
    } else {
        fullscreenBtn.querySelector('i').classList.replace('fa-compress', 'fa-expand');
    }
});

// ==================== HAMBURGER MENU ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
    
    if (typeof playButtonFeedback === 'function') {
        playButtonFeedback();
    }
});

// Fechar ao clicar nos links
document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
    });
});
