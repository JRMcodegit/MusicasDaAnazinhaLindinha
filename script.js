/* ==============================================================
     🎵 EDITE SUAS MÚSICAS AQUI!
     ════════════════════════════════════════════════════════════

     COMO ADICIONAR UMA MÚSICA:
     1. Vá ao YouTube e encontre o vídeo oficial da música
     2. Olhe a URL: https://www.youtube.com/watch?v=XXXXXXXX
        O código "XXXXXXXX" é o youtubeId
     3. Copie esse código e cole no campo "youtubeId" abaixo

     COMO ADICIONAR UMA CATEGORIA:
     Copie um bloco { id, nome, musicas: [...] } e cole abaixo do último

     COMO MUDAR A CAPA:
     Por padrão, usamos a miniatura do YouTube.
     Para usar outra imagem, adicione:  capa: "URL_DA_IMAGEM"
     ============================================================== */

  const DADOS = [
    /* ── CATEGORIA 1 ──────────────────────────────── */
    {
      id:   'Guns',
      nome: '🌹 Guns N Roses 🌹',
      musicas: [
        {
          titulo:    'Welcome To The Jungle',
          artista:   'Guns N Roses',
          album:     'Appetite For Destruction',
          src: 'musicas/WTTJ.mp3'  // ← substitua pelo ID correto do YouTube
        },
        {
          titulo:    'This I Love',
          artista:   'Guns N Roses',
          album:     'Chinese Democracy',
          src: 'musicas/TIL.mp3'
        },
        {
          titulo:    'Dont Cry',
          artista:   'Guns N Roses',
          album:     'Use Your Illusion',
          src: 'musicas/DC.mp3'
        },
        {
          titulo:    'November Rain',
          artista:   'Guns N Roses',
          album:     'Use Your Illusion',
          src: 'musicas/NR.mp3'
        },
      ]
    },

    /* ── CATEGORIA 2 ──────────────────────────────── */
    {
      id:   'scorpions',
      nome: '🦂 Scorpions 🦂',
      musicas: [
        {
          titulo:    'Wind Of Change',
          artista:   'Scorpions',
          album:     'Crazy World',
          src: 'musicas/WOC.mp3'
        },
        {
          titulo:    'Still Loving You',
          artista:   'Scorpions',
          album:     'Love At First Sting',
          src: 'musicas/SLY.mp3'
        },
        {
          titulo:    'No One Like You',
          artista:   'Scorpions',
          album:     'Blackout',
          src: 'musicas/NOLY.mp3'
        },
        {
          titulo:    'Always Somewhere',
          artista:   'Scorpions',
          album:     'Lovedrive',
          src: 'musicas/AS.mp3'
        },
      ]
    },

    /* ── CATEGORIA 3 ──────────────────────────────── */
    {
      id:   'metallica',
      nome: '🎸 Metallica 🎸',
      musicas: [
        {
          titulo:    'Wherever I May Roam',
          artista:   'Metallica',
          album:     "The Black Album",
          src: 'musicas/WIMR.mp3'
        },
        {
          titulo:    'Nothing Else Matters',
          artista:   'Metallica',
          album:     "The Black Album",
          src: 'musicas/NEM.mp3'
        },
        {
          titulo:    'Enter Sandman',
          artista:   'Metallica',
          album:     "The Black Album",
          src: 'musicas/ES.mp3'
        },
        {
          titulo:    'For Whom The Bell Tolls',
          artista:   'Metallica',
          album:     "Ride the Lightning",
          src: 'musicas/FWTBT.mp3'
        },
      ]
    },

    /* ── ADICIONE MAIS CATEGORIAS AQUI ───────────── */
    /* Exemplo:
    {
      id:   'minha_banda',
      nome: '🎵 Nome da Banda',
      musicas: [
        { titulo: 'Nome da Música', artista: 'Artista', album: 'Álbum', youtubeId: 'COLOQUE_O_ID_AQUI' },
      ]
    },
    */
  ];


  /* ==============================================================
     ⚙️ LÓGICA DO PLAYER — não precisa editar abaixo desta linha
     ============================================================== */

  /* Achata todas as músicas em uma lista única para prev/next funcionar globalmente */
  const TODAS = [];
  DADOS.forEach(cat => {
    cat.musicas.forEach(m => {
      TODAS.push({ ...m, catId: cat.id });
    });
  });

  /* Estado global do player */
  let currentIdx   = -1;    // qual música está tocando (-1 = nenhuma)
  let ytPlayer     = null;  // referência ao player do YouTube
  let ytReady      = false; // o player do YouTube já carregou?
  let isPlaying    = false; // está tocando agora?
  let progInterval = null;  // timer para atualizar a barra de progresso

  /* ── Retorna a URL da capa da música ── */
  function coverUrl(song) {
    /* Usa capa personalizada se definida, senão usa a miniatura do YouTube */
    if (song.capa) return song.capa;
    return `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
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
    tabTodas.className   = 'tab-btn active'; /* começa selecionada */
    tabTodas.dataset.id  = 'all';
    tabTodas.textContent = '🎵 Todas';
    tabTodas.onclick     = () => setView('all');
    tabsEl.appendChild(tabTodas);

    /* Para cada categoria, cria uma aba e uma seção no conteúdo */
    DADOS.forEach(cat => {
      /* ── Botão de aba ── */
      const tab = document.createElement('button');
      tab.className   = 'tab-btn';
      tab.dataset.id  = cat.id;
      tab.textContent = cat.nome;
      tab.onclick     = () => setView(cat.id);
      tabsEl.appendChild(tab);

      /* ── Seção da categoria ── */
      const section = document.createElement('section');
      section.className = 'cat-section visible'; /* visível por padrão (aba "Todas") */
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
        /* Encontra o índice global desta música para o prev/next */
        const globalIdx = TODAS.findIndex(s => s.youtubeId === song.youtubeId && s.catId === cat.id);
        carousel.appendChild(criarCard(song, globalIdx));
      });

      section.appendChild(carousel);
      mainEl.appendChild(section);
    });
  }

  /* ── Cria o HTML de um card de música ── */
  function criarCard(song, globalIdx) {
    const card    = document.createElement('div');
    card.className = 'card';
    card.id        = `card-${globalIdx}`;
    card.onclick   = () => tocarMusica(globalIdx);

    card.innerHTML = `
      <div class="card-cover-wrap">
        <!-- Capa da música (miniatura do YouTube) -->
        <img
          class="card-cover"
          src="${coverUrl(song)}"
          alt="${song.titulo}"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23141420%22 width=%22100%22 height=%22100%22/><text y=%2255%22 x=%2250%22 text-anchor=%22middle%22 fill=%22%23ffa1c4%22 font-size=%2230%22>♪</text></svg>'"
        >
        <!-- Camada escura com botão de play (aparece no hover) -->
        <div class="card-overlay">
          <div class="play-ico" aria-label="Tocar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <!-- Barrinhas animadas de equalizador (quando tocando) -->
        <div class="eq-bars">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      </div>
      <!-- Informações textuais -->
      <div class="card-info">
        <div class="card-title">${song.titulo}</div>
        <div class="card-sub">${song.artista} · ${song.album}</div>
      </div>
    `;

    return card;
  }

  /* ── Troca a aba/view ativa ── */
  function setView(viewId) {
    /* Atualiza destaque nas abas */
    document.querySelectorAll('.tab-btn').forEach(t => {
      t.classList.toggle('active', t.dataset.id === viewId);
    });

    /* Mostra ou esconde seções de conteúdo */
    document.querySelectorAll('.cat-section').forEach(sec => {
      if (viewId === 'all') {
        /* "Todas" → mostra tudo */
        sec.classList.add('visible');
      } else {
        /* Categoria específica → mostra só a dela */
        const visivel = sec.id === `sec-${viewId}`;
        sec.classList.toggle('visible', visivel);
      }
    });
  }

  /* ── Toca uma música pelo índice global ── */
  function tocarMusica(idx) {
    if (idx < 0 || idx >= TODAS.length) return;

    /* Remove o estado ativo de todos os cards */
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));

    currentIdx = idx;
    const song = TODAS[idx];

    /* Ativa o card correspondente */
    const card = document.getElementById(`card-${idx}`);
    if (card) {
      card.classList.add('active');
      /* Rola suavemente para o card ficar visível */
      card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }

    /* Atualiza informações no player do rodapé */
    const coverEl = document.getElementById('pb-cover');
    coverEl.src   = coverUrl(song);
    coverEl.classList.add('pulsing'); /* animação de pulso */
    document.getElementById('pb-title').textContent  = song.titulo;
    document.getElementById('pb-artist').textContent = song.artista;

    /* Mostra o player (ele sobe da parte de baixo) */
    document.getElementById('player-bar').classList.add('show');

    /* Atualiza ícone para "pause" (pois vai começar a tocar) */
    setIconePause();
    isPlaying = true;

    /* Carrega e toca no YouTube */
    if (ytReady && ytPlayer) {
      ytPlayer.loadVideoById(song.youtubeId);
    }

    /* Inicia atualização da barra de progresso a cada 1 segundo */
    clearInterval(progInterval);
    progInterval = setInterval(atualizarProgresso, 1000);
  }

  /* ── Alterna entre Play e Pause ── */
  function alternarPlay() {
    if (currentIdx === -1 || !ytReady || !ytPlayer) return;

    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      isPlaying = false;
      setIconePlay();
    } else {
      ytPlayer.playVideo();
      isPlaying = true;
      setIconePause();
    }
  }

  /* ── Muda o ícone do botão central para "Play" ► ── */
  function setIconePlay() {
    document.getElementById('play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
  }

  /* ── Muda o ícone do botão central para "Pause" ⏸ ── */
  function setIconePause() {
    document.getElementById('play-icon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  }

  /* ── Vai para a música anterior ── */
  function musicaAnterior() {
    if (currentIdx > 0) {
      tocarMusica(currentIdx - 1);
    } else {
      /* Se for a primeira, vai para a última */
      tocarMusica(TODAS.length - 1);
    }
  }

  /* ── Vai para a próxima música ── */
  function proximaMusica() {
    if (currentIdx < TODAS.length - 1) {
      tocarMusica(currentIdx + 1);
    } else {
      /* Se for a última, volta para a primeira */
      tocarMusica(0);
    }
  }

  /* ── Atualiza a barra de progresso e os tempos ── */
  function atualizarProgresso() {
    if (!ytReady || !ytPlayer) return;
    try {
      const atual = ytPlayer.getCurrentTime() || 0;
      const total = ytPlayer.getDuration()    || 0;
      const pct   = total > 0 ? (atual / total) * 100 : 0;

      document.getElementById('pb-fill').style.width    = `${pct}%`;
      document.getElementById('pb-cur').textContent     = fmtTime(atual);
      document.getElementById('pb-dur').textContent     = fmtTime(total);
    } catch (e) {
      /* Ignora erros enquanto o player ainda está carregando */
    }
  }

  /* ── Permite clicar na barra de progresso para pular ── */
  document.getElementById('pb-track').addEventListener('click', function(e) {
    if (!ytReady || !ytPlayer) return;
    const rect  = this.getBoundingClientRect();
    const pct   = (e.clientX - rect.left) / rect.width;
    const total = ytPlayer.getDuration() || 0;
    ytPlayer.seekTo(total * pct, true); /* pula para a posição clicada */
  });

  /* ── Conecta os botões ── */
  document.getElementById('btn-play').onclick = alternarPlay;
  document.getElementById('btn-prev').onclick = musicaAnterior;
  document.getElementById('btn-next').onclick = proximaMusica;

  /* ── Suporte a teclas do teclado ── */
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      alternarPlay();
    }
    if (e.code === 'ArrowRight') proximaMusica();
    if (e.code === 'ArrowLeft')  musicaAnterior();
  });


  /* ==============================================================
     YOUTUBE IFRAME API
     Esta função é chamada AUTOMATICAMENTE pelo YouTube
     quando o script do YouTube termina de carregar.
     ============================================================== */
  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player', {
      height:    '1',
      width:     '1',
      videoId:   '',
      playerVars: {
        autoplay:       1,   /* toca automaticamente */
        controls:       0,   /* esconde controles do YouTube */
        modestbranding: 1,   /* menos logo do YouTube */
        playsinline:    1,   /* toca inline no iPhone (sem fullscreen forçado) */
        rel:            0,   /* não mostra vídeos relacionados */
      },
      events: {
        /* Quando o player estiver pronto */
        onReady: function(e) {
          ytReady = true;
          /* Se o usuário já clicou em algo antes do player carregar, toca agora */
          if (currentIdx >= 0) {
            e.target.loadVideoById(TODAS[currentIdx].youtubeId);
          }
        },
        /* Quando o estado do player muda */
        onStateChange: function(e) {
          /* Avança automaticamente ao terminar a música */
          if (e.data === YT.PlayerState.ENDED) {
            proximaMusica();
          }
          /* Sincroniza o ícone do botão com o estado real */
          if (e.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            setIconePause();
          }
          if (e.data === YT.PlayerState.PAUSED) {
            isPlaying = false;
            setIconePlay();
          }
        }
      }
    });
  };

  /* ── Inicializa a interface ── */
  renderUI();
