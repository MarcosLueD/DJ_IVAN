// 1. LOADING SCREEN
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('fade-out');
    }, 1200);
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
audio.preload = 'auto';

const mainVinyl = document.getElementById('main-vinyl') || document.getElementById('mini-vinyl');
const miniVinyl = document.getElementById('mini-vinyl') || document.getElementById('main-vinyl');
const mainEqualizer = document.getElementById('main-equalizer');

const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn?.querySelector('i');
const progressFill = document.getElementById('progress-fill');
const progressContainer = document.getElementById('progress-container');

const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const currentTrackTime = document.getElementById('current-time');
const totalDurationText = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');

let trackElements = Array.from(document.querySelectorAll('.track-item'));
let currentTrackIndex = -1;

function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updatePlayerUI(title, artist, duration) {
    currentTitle.textContent = title;
    currentArtist.textContent = artist || 'DJ Ivan';
    totalDurationText.textContent = duration || '0:00';
    progressFill.style.width = '0%';
    currentTrackTime.textContent = '0:00';
}

function setPlayingState(isPlaying) {
    if (!playPauseIcon) return;

    if (isPlaying) {
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
        playPauseBtn.setAttribute('aria-label', 'Pausar');
        mainVinyl?.classList.add('running');
        miniVinyl?.classList.add('running');
        mainEqualizer?.classList.add('active');
    } else {
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        playPauseBtn.setAttribute('aria-label', 'Reproduzir');
        mainVinyl?.classList.remove('running');
        miniVinyl?.classList.remove('running');
        mainEqualizer?.classList.remove('active');
    }
}

function playTrack(index) {
    if (index < 0 || index >= trackElements.length) return;

    trackElements.forEach(el => el.classList.remove('playing-now'));

    currentTrackIndex = index;
    const targetTrack = trackElements[currentTrackIndex];
    targetTrack.classList.add('playing-now');

    const src = targetTrack.getAttribute('data-src');
    const title = targetTrack.getAttribute('data-title');
    const artist = targetTrack.getAttribute('data-artist') || 'DJ Ivan';
    const duration = targetTrack.getAttribute('data-duration');

    audio.src = src;
    updatePlayerUI(title, artist, duration);

    audio.play().catch(() => {
        setPlayingState(false);
    });
}

trackElements.forEach((track, index) => {
    track.addEventListener('click', () => {
        if (currentTrackIndex === index) {
            if (audio.paused) {
                audio.play().catch(() => setPlayingState(false));
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

playPauseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTrackIndex === -1) {
        playTrack(0);
    } else if (audio.paused) {
        audio.play().catch(() => setPlayingState(false));
        setPlayingState(true);
    } else {
        audio.pause();
        setPlayingState(false);
    }
});

document.getElementById('next-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= trackElements.length) nextIndex = 0;
    playTrack(nextIndex);
});

document.getElementById('prev-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = trackElements.length - 1;
    playTrack(prevIndex);
});

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTrackTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    totalDurationText.textContent = formatTime(audio.duration);
});

audio.addEventListener('play', () => setPlayingState(true));
audio.addEventListener('pause', () => setPlayingState(false));

progressContainer?.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    audio.currentTime = (clickX / width) * audio.duration;
});

volumeSlider?.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

audio.addEventListener('ended', () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex < trackElements.length) {
        playTrack(nextIndex);
    } else {
        setPlayingState(false);
    }
});

const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const playerBox = document.querySelector('.player-container');
    playerBox?.classList.toggle('fullscreen-mode');
    const icon = fullscreenBtn.querySelector('i');
    if (playerBox?.classList.contains('fullscreen-mode')) {
        icon.classList.replace('fa-expand', 'fa-compress');
    } else {
        icon.classList.replace('fa-compress', 'fa-expand');
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

// ===== ENVIO DO FORMULÁRIO PARA WHATSAPP =====
document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Pega os valores
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const tipo = document.getElementById('tipo').value;
    const mensagem = document.getElementById('mensagem').value.trim();

    // Monta a mensagem para o WhatsApp
    let texto = `🎧 *Nova solicitação de orçamento — DJ IVAN*\n\n`;
    texto += `👤 *Nome/Contratante:* ${nome}\n`;
    texto += `📱 *WhatsApp/Telefone:* ${telefone}\n`;
    texto += `🏙️ *Cidade:* ${cidade}\n`;
    texto += `🎤 *Tipo de Serviço:* ${tipo}\n`;
    if (mensagem) texto += `📝 *Detalhes do Projeto:* ${mensagem}\n\n`;
    texto += `Solicitado pelo site. Aguardo retorno!`;

    // Número do WhatsApp (troque se necessário)
    const numero = "5518998091498";

    // Abre o WhatsApp
    const url = `https://wa.me/${5518998091498}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');

    // Feedback
    alert('Solicitação enviada! Redirecionando para o WhatsApp...');
});
