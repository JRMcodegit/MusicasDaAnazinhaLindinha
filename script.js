/* ==============================================================
   🎵 EDITE SUAS MÚSICAS AQUI!
   ════════════════════════════════════════════════════════════

   COMO ADICIONAR UMA MÚSICA:
   - src:    caminho para o arquivo .mp3 (ex: 'musicas/nome.mp3')
   - capa:   caminho para a imagem de capa (ex: 'capas/nome.jpg')
             → se não tiver capa, deixa sem o campo capa
               que aparecerá um ícone musical no lugar

   COMO ADICIONAR UMA CATEGORIA:
   Copie um bloco { id, nome, musicas: [...] } e cole abaixo do último
   ============================================================== */

const DADOS = [
  /* ── CATEGORIA 1 ──────────────────────────────── */
  {
    id:   'Guns',
    nome: '🌹 Guns N Roses 🌹',
    musicas: [
      {
        titulo:  'Welcome To The Jungle',
        artista: 'Guns N Roses',
        album:   'Appetite For Destruction',
        src:     'musicas/WTTJ.mp3',
        capa:    'capas/WTTJ.jpg',        // ← apague esta linha se não tiver capa
      },
      {
        titulo:  'This I Love',
        artista: 'Guns N Roses',
        album:   'Chinese Democracy',
        src:     'musicas/TIL.mp3',
        capa:    'capas/TIL.jpg',
      },
      {
        titulo:  'Dont Cry',
        artista: 'Guns N Roses',
        album:   'Use Your Illusion',
        src:     'musicas/DC.mp3',
        capa:    'capas/NR.jpg',
      },
      {
        titulo:  'November Rain',
        artista: 'Guns N Roses',
        album:   'Use Your Illusion',
        src:     'musicas/NR.mp3',
        capa:    'capas/NR.jpg', 
      },
    ]
  },

  /* ── CATEGORIA 2 ──────────────────────────────── */
  {
    id:   'scorpions',
    nome: '🦂 Scorpions 🦂',
    musicas: [
      {
        titulo:  'Wind Of Change',
        artista: 'Scorpions',
        album:   'Crazy World',
        src:     'musicas/WOC.mp3',
        capa:    'capas/WOC.jpg', 
      },
      {
        titulo:  'Still Loving You',
        artista: 'Scorpions',
        album:   'Love At First Sting',
        src:     'musicas/SLY.mp3',
        capa:    'capas/SLY.jpg', 
      },
      {
        titulo:  'No One Like You',
        artista: 'Scorpions',
        album:   'Blackout',
        src:     'musicas/NOLY.mp3',
        capa:    'capas/NOLY.jpg', 
      },
      {
        titulo:  'Always Somewhere',
        artista: 'Scorpions',
        album:   'Lovedrive',
        src:     'musicas/AS.mp3',
        capa:    'capas/AS.jpg', 
      },
    ]
  },

  /* ── CATEGORIA 3 ──────────────────────────────── */
  {
    id:   'metallica',
    nome: '🎸 Metallica 🎸',
    musicas: [
      {
        titulo:  'Wherever I May Roam',
        artista: 'Metallica',
        album:   'The Black Album',
        src:     'musicas/WIMR.mp3',
        capa:    'capas/WIMR.jpg', 
      },
      {
        titulo:  'Nothing Else Matters',
        artista: 'Metallica',
        album:   'The Black Album',
        src:     'musicas/NEM.mp3',
        capa:    'capas/WIMR.jpg', 
      },
      {
        titulo:  'Enter Sandman',
        artista: 'Metallica',
        album:   'The Black Album',
        src:     'musicas/ES.mp3',
        capa:    'capas/WIMR.jpg', 
      },
      {
        titulo:  'For Whom The Bell Tolls',
        artista: 'Metallica',
        album:   'Ride the Lightning',
        src:     'musicas/FWTBT.mp3',
        capa:    'capas/FWTBT.jpg', 
      },
    ]
  },

  /* ── ADICIONE MAIS CATEGORIAS AQUI ───────────── */
  /*
  {
    id:   'minha_banda',
    nome: '🎵 Nome da Banda',
    musicas: [
      { titulo: 'Nome da Música', artista: 'Artista', album: 'Álbum', src: 'musicas/arquivo.mp3' },
    ]
  },
  */
];


/* ==============================================================
   ⚙️ LÓGICA DO PLAYER — não precisa editar abaixo desta linha
   ============================================================== */

/* Achata todas as músicas numa lista única (para prev/next funcionar globalmente) */
const TODAS = [];
DADOS.forEach(cat => {
  cat.musicas.forEach(m => {
    TODAS.push({ ...m, catId: cat.id });
  });
});

/* Estado global */
let currentIdx   = -1;     // índice da música tocando (-1 = nenhuma)
let isPlaying    = false;  // está tocando agora?
let progInterval = null;   // timer da barra de progresso

/* Cria o elemento <audio> que vai tocar as músicas — fica invisível na página */
const audio = new Audio();
audio.preload = 'metadata'; // carrega só as informações básicas (duração etc.)

/* ── Retorna a URL da capa, ou uma imagem de nota musical caso não tenha ── */
function coverUrl(song) {
  if (song.capa) return song.capa;
  /* Capa padrão: ícone rosa em fundo escuro (gerado via SVG inline) */
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23141420' width='100' height='100'/%3E%3Ctext y='58' x='50' text-anchor='middle' fill='%23ffa1c4' font-size='42'%3E♪%3C/text%3E%3C/svg%3E";
}

/* ── Formata segundos em "m:ss" (ex: 183 → "3:03") ── */
function fmtTime(s) {
  if (!s || isNaN(s) || s < 0) return '0:00';
  const minutos  = Math.floor(s / 60);
  const segundos = Math.floor(s % 60).toString().padStart(2, '0');
  return `${minutos}:${segundos}`;
}

/* ── Renderiza toda a interface (abas + carrosséis) ── */
function renderUI() {
  const tabsEl = document.getElementById('tabs-container');
  const mainEl = document.getElementById('main');

  /* Cria a aba "Todas" */
  const tabTodas = document.createElement('button');
  tabTodas.className   = 'tab-btn active';
  tabTodas.dataset.id  = 'all';
  tabTodas.textContent = '🎵 Todas';
  tabTodas.onclick     = () => setView('all');
  tabsEl.appendChild(tabTodas);

  /* Para cada categoria, cria uma aba e uma seção no conteúdo */
  DADOS.forEach(cat => {
    /* Botão de aba */
    const tab = document.createElement('button');
    tab.className   = 'tab-btn';
    tab.dataset.id  = cat.id;
    tab.textContent = cat.nome;
    tab.onclick     = () => setView(cat.id);
    tabsEl.appendChild(tab);

    /* Seção da categoria */
    const section = document.createElement('section');
    section.className = 'cat-section visible';
    section.id        = `sec-${cat.id}`;

    /* Título da seção */
    const titulo = document.createElement('div');
    titulo.className   = 'cat-title';
    titulo.textContent = cat.nome;
    section.appendChild(titulo);

    /* Carrossel horizontal */
    const carousel = document.createElement('div');
    carousel.className = 'carousel';

    /* Cria um card para cada música */
    cat.musicas.forEach(song => {
      /* Usa o src como identificador único para achar o índice global */
      const globalIdx = TODAS.findIndex(s => s.src === song.src && s.catId === cat.id);
      carousel.appendChild(criarCard(song, globalIdx));
    });

    section.appendChild(carousel);
    mainEl.appendChild(section);
  });
}

/* ── Cria o HTML de um card de música ── */
function criarCard(song, globalIdx) {
  const card     = document.createElement('div');
  card.className = 'card';
  card.id        = `card-${globalIdx}`;
  card.onclick   = () => tocarMusica(globalIdx);

  card.innerHTML = `
    <div class="card-cover-wrap">
      <img
        class="card-cover"
        src="${coverUrl(song)}"
        alt="${song.titulo}"
        loading="lazy"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23141420%22 width=%22100%22 height=%22100%22/%3E%3Ctext y=%2258%22 x=%2250%22 text-anchor=%22middle%22 fill=%22%23ffa1c4%22 font-size=%2242%22%3E%E2%99%AA%3C/text%3E%3C/svg%3E'"
      >
      <div class="card-overlay">
        <div class="play-ico" aria-label="Tocar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="eq-bars">
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
      </div>
    </div>
    <div class="card-info">
      <div class="card-title">${song.titulo}</div>
      <div class="card-sub">${song.artista} · ${song.album}</div>
    </div>
  `;

  return card;
}

/* ── Troca a aba/view ativa ── */
function setView(viewId) {
  document.querySelectorAll('.tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.id === viewId);
  });

  document.querySelectorAll('.cat-section').forEach(sec => {
    if (viewId === 'all') {
      sec.classList.add('visible');
    } else {
      sec.classList.toggle('visible', sec.id === `sec-${viewId}`);
    }
  });
}

/* ── Toca uma música pelo índice global ── */
function tocarMusica(idx) {
  if (idx < 0 || idx >= TODAS.length) return;

  /* Remove destaque de todos os cards */
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));

  currentIdx = idx;
  const song = TODAS[idx];

  /* Destaca o card clicado e rola para ele */
  const card = document.getElementById(`card-${idx}`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }

  /* Atualiza o player no rodapé */
  const coverEl = document.getElementById('pb-cover');
  coverEl.src   = coverUrl(song);
  coverEl.classList.add('pulsing');
  document.getElementById('pb-title').textContent  = song.titulo;
  document.getElementById('pb-artist').textContent = song.artista;
  document.getElementById('player-bar').classList.add('show');

  /* Carrega e toca o arquivo MP3 */
  audio.src = song.src;
  audio.play();

  setIconePause(); /* muda ícone para "pause" pois já está tocando */
  isPlaying = true;

  /* Inicia o timer que atualiza a barra de progresso */
  clearInterval(progInterval);
  progInterval = setInterval(atualizarProgresso, 500);
}

/* ── Alterna entre Play e Pause ── */
function alternarPlay() {
  if (currentIdx === -1) return; /* nenhuma música carregada ainda */

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    setIconePlay();
  } else {
    audio.play();
    isPlaying = true;
    setIconePause();
  }
}

/* ── Ícone de play ► ── */
function setIconePlay() {
  document.getElementById('play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
}

/* ── Ícone de pause ⏸ ── */
function setIconePause() {
  document.getElementById('play-icon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
}

/* ── Música anterior ── */
function musicaAnterior() {
  if (currentIdx > 0) {
    tocarMusica(currentIdx - 1);
  } else {
    tocarMusica(TODAS.length - 1); /* volta para a última se estiver na primeira */
  }
}

/* ── Próxima música ── */
function proximaMusica() {
  if (currentIdx < TODAS.length - 1) {
    tocarMusica(currentIdx + 1);
  } else {
    tocarMusica(0); /* volta para a primeira se estiver na última */
  }
}

/* ── Atualiza a barra de progresso e os tempos ── */
function atualizarProgresso() {
  const atual = audio.currentTime || 0;
  const total = audio.duration    || 0;
  const pct   = total > 0 ? (atual / total) * 100 : 0;

  document.getElementById('pb-fill').style.width = `${pct}%`;
  document.getElementById('pb-cur').textContent  = fmtTime(atual);
  document.getElementById('pb-dur').textContent  = fmtTime(total);
}

/* ── Clique na barra de progresso para pular ── */
document.getElementById('pb-track').addEventListener('click', function(e) {
  if (currentIdx === -1) return;
  const rect  = this.getBoundingClientRect();
  const pct   = (e.clientX - rect.left) / rect.width;
  audio.currentTime = (audio.duration || 0) * pct; /* pula para o ponto clicado */
});

/* ── Avança automaticamente ao terminar a música ── */
audio.addEventListener('ended', () => {
  proximaMusica();
});

/* ── Sincroniza o ícone caso o áudio pause por algum motivo externo ── */
audio.addEventListener('pause', () => {
  isPlaying = false;
  setIconePlay();
});
audio.addEventListener('play', () => {
  isPlaying = true;
  setIconePause();
});

/* ── Teclas de atalho ── */
document.addEventListener('keydown', e => {
  /* Espaço = play/pause (só se não estiver digitando em algum campo) */
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    alternarPlay();
  }
  if (e.code === 'ArrowRight') proximaMusica();
  if (e.code === 'ArrowLeft')  musicaAnterior();
});

/* ── Conecta os botões do player ── */
document.getElementById('btn-play').onclick = alternarPlay;
document.getElementById('btn-prev').onclick = musicaAnterior;
document.getElementById('btn-next').onclick = proximaMusica;

/* ── Inicializa a interface ── */
renderUI();
