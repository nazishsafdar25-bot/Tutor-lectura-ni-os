(() => {
  const pantallas = {
    inicio: document.getElementById('pantalla-inicio'),
    lectura: document.getElementById('pantalla-lectura'),
    preguntas: document.getElementById('pantalla-preguntas'),
    final: document.getElementById('pantalla-final')
  };
  const cargando = document.getElementById('cargando');
  const errorBox = document.getElementById('error-box');
  const errorMensaje = document.getElementById('error-mensaje');

  const inputTema = document.getElementById('input-tema');
  const nivelBadge = document.getElementById('nivel-badge');
  const notaNivelEl = document.getElementById('nota-nivel');
  const btnSorpresa = document.getElementById('btn-sorpresa');
  const btnEmpezar = document.getElementById('btn-empezar');
  const btnYaLei = document.getElementById('btn-ya-lei');
  const btnVerTexto = document.getElementById('btn-ver-texto');
  const btnOtroTexto = document.getElementById('btn-otro-texto');
  const btnReintentar = document.getElementById('btn-reintentar');

  const tituloLectura = document.getElementById('titulo-lectura');
  const textoLecturaEl = document.getElementById('texto-lectura');
  const chatEl = document.getElementById('chat');
  const progresoEl = document.getElementById('progreso');
  const formRespuesta = document.getElementById('form-respuesta');
  const inputRespuesta = document.getElementById('input-respuesta');
  const textoFinalEl = document.getElementById('texto-final');

  const modal = document.getElementById('modal-palabra');
  const modalTitulo = document.getElementById('modal-palabra-titulo');
  const modalCuerpo = document.getElementById('modal-palabra-cuerpo');
  const modalCerrar = document.getElementById('modal-cerrar');

  const NIVELES = [
    { emoji: '🌱', label: 'Muy fácil', desc: 'muy facil: oraciones muy cortas (menos de 8 palabras), vocabulario muy basico, para quien apenas empieza a leer' },
    { emoji: '🌿', label: 'Fácil', desc: 'facil: oraciones cortas (menos de 12 palabras), vocabulario cotidiano' },
    { emoji: '🌟', label: 'Medio', desc: 'medio: oraciones un poco mas largas, con algo de vocabulario nuevo que se entiende por el contexto' },
    { emoji: '🚀', label: 'Avanzado', desc: 'avanzado: oraciones mas elaboradas, vocabulario mas variado e ideas con un poco mas de matiz' }
  ];
  const NIVEL_STORAGE_KEY = 'lecto_nivel_index';

  function cargarNivelIndex() {
    const guardado = parseInt(localStorage.getItem(NIVEL_STORAGE_KEY), 10);
    if (Number.isInteger(guardado) && guardado >= 0 && guardado < NIVELES.length) return guardado;
    return 1;
  }

  function guardarNivelIndex(indice) {
    localStorage.setItem(NIVEL_STORAGE_KEY, String(indice));
  }

  function actualizarBadgeNivel() {
    const n = NIVELES[nivelIndex];
    nivelBadge.textContent = `${n.emoji} ${n.label}`;
  }

  let nivelIndex = cargarNivelIndex();
  let historial = [];
  let ultimaAccion = null;
  let textoActual = '';
  let preguntasTotales = 4;

  function mostrarPantalla(nombre) {
    Object.values(pantallas).forEach((p) => p.classList.add('oculta'));
    pantallas[nombre].classList.remove('oculta');
  }

  function mostrarCargando(mostrar) {
    cargando.classList.toggle('oculta', !mostrar);
  }

  function mostrarError(mensaje) {
    errorMensaje.textContent = mensaje;
    errorBox.classList.remove('oculta');
  }

  function ocultarError() {
    errorBox.classList.add('oculta');
  }

  actualizarBadgeNivel();

  async function llamarTutor(mensaje) {
    ocultarError();
    mostrarCargando(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historial, mensaje })
      });
      const datos = await res.json();
      if (!res.ok) {
        throw new Error(datos.error || 'Algo salió mal.');
      }
      historial = datos.historial;
      manejarPaso(datos.paso);
    } catch (err) {
      mostrarError(err.message || 'No pude hablar con Lecto. Intenta de nuevo.');
    } finally {
      mostrarCargando(false);
    }
  }

  function manejarPaso(paso) {
    if (paso.preguntas_totales) preguntasTotales = paso.preguntas_totales;

    if (paso.tipo === 'lectura') {
      textoActual = paso.texto;
      tituloLectura.textContent = (paso.emoji ? paso.emoji + ' ' : '') + (paso.titulo || 'Tu lectura');
      renderizarTextoLectura(paso.texto);
      mostrarPantalla('lectura');
      return;
    }

    if (paso.tipo === 'pregunta' || paso.tipo === 'aclaracion') {
      agregarMensajeChat('tutor', paso.texto, paso.emoji, paso.tipo === 'aclaracion');
      actualizarProgreso(paso.numero_pregunta);
      mostrarPantalla('preguntas');
      inputRespuesta.disabled = false;
      inputRespuesta.focus();
      return;
    }

    if (paso.tipo === 'feedback_final') {
      textoFinalEl.textContent = (paso.emoji ? paso.emoji + ' ' : '') + paso.texto;
      aplicarNivelSugerido(paso.nivel_sugerido);
      mostrarPantalla('final');
      return;
    }
  }

  function aplicarNivelSugerido(nivelSugerido) {
    if (nivelSugerido === 'subir' && nivelIndex < NIVELES.length - 1) {
      nivelIndex += 1;
      guardarNivelIndex(nivelIndex);
      actualizarBadgeNivel();
      notaNivelEl.textContent = `🎉 ¡Lo hiciste tan bien que subimos al nivel ${NIVELES[nivelIndex].label}!`;
    } else {
      notaNivelEl.textContent = '';
    }
  }

  function renderizarTextoLectura(texto) {
    textoLecturaEl.innerHTML = '';
    const tokens = texto.split(/(\s+)/);
    tokens.forEach((token) => {
      if (/^\s+$/.test(token) || token === '') {
        textoLecturaEl.appendChild(document.createTextNode(token));
        return;
      }
      const span = document.createElement('span');
      span.className = 'palabra';
      span.textContent = token;
      span.tabIndex = 0;
      const palabraLimpia = token.replace(/[^\p{L}\p{N}'-]/gu, '');
      if (palabraLimpia) {
        span.addEventListener('click', () => abrirExplicacionPalabra(palabraLimpia, token));
        span.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirExplicacionPalabra(palabraLimpia, token);
          }
        });
      }
      textoLecturaEl.appendChild(span);
    });
  }

  function agregarMensajeChat(quien, texto, emoji, esAclaracion) {
    const msg = document.createElement('div');
    msg.className = 'msg ' + (quien === 'tutor' ? 'tutor' : 'nino') + (esAclaracion ? ' aclaracion' : '');
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = quien === 'tutor' ? '🦉' : '🙂';
    const contenido = document.createElement('div');
    contenido.className = 'contenido';
    contenido.textContent = (emoji ? emoji + ' ' : '') + texto;
    msg.appendChild(avatar);
    msg.appendChild(contenido);
    chatEl.appendChild(msg);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function actualizarProgreso(numeroPregunta) {
    progresoEl.innerHTML = '';
    for (let i = 1; i <= preguntasTotales; i++) {
      const punto = document.createElement('div');
      punto.className = 'punto';
      if (numeroPregunta && i < numeroPregunta) punto.classList.add('hecho');
      if (numeroPregunta && i === numeroPregunta) punto.classList.add('actual');
      progresoEl.appendChild(punto);
    }
  }

  async function abrirExplicacionPalabra(palabra, mostrada) {
    modal.classList.remove('oculta');
    modalTitulo.textContent = mostrada;
    modalCuerpo.innerHTML = '<div class="spinner"></div>';
    try {
      const res = await fetch('/api/explicar-palabra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palabra, contexto: textoActual })
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || 'No pude explicar esa palabra.');
      modalCuerpo.textContent = datos.explicacion;
    } catch (err) {
      modalCuerpo.textContent = 'Uy, no pude pensarlo bien. ¿Intentas de nuevo? 🦉';
    }
  }

  modalCerrar.addEventListener('click', () => modal.classList.add('oculta'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('oculta');
  });

  function iniciarSesion(temaTexto) {
    historial = [];
    preguntasTotales = 4;
    notaNivelEl.textContent = '';
    const nivelTexto = NIVELES[nivelIndex].desc;
    const mensaje = temaTexto
      ? `Quiero leer un texto sobre: ${temaTexto}. Nivel de dificultad: ${nivelTexto}. Por favor comienza.`
      : `Sorpréndeme con un tema divertido para leer. Nivel de dificultad: ${nivelTexto}. Por favor comienza.`;
    ultimaAccion = () => iniciarSesion(temaTexto);
    llamarTutor(mensaje);
  }

  btnEmpezar.addEventListener('click', () => {
    const tema = inputTema.value.trim();
    iniciarSesion(tema);
  });

  btnSorpresa.addEventListener('click', () => {
    inputTema.value = '';
    iniciarSesion('');
  });

  btnYaLei.addEventListener('click', () => {
    chatEl.innerHTML = '';
    progresoEl.innerHTML = '';
    const mensaje = 'Ya leí el texto completo. Estoy listo, hazme la primera pregunta.';
    ultimaAccion = () => llamarTutor(mensaje);
    llamarTutor(mensaje);
  });

  btnVerTexto.addEventListener('click', () => {
    mostrarPantalla('lectura');
  });

  formRespuesta.addEventListener('submit', (e) => {
    e.preventDefault();
    const respuesta = inputRespuesta.value.trim();
    if (!respuesta) return;
    agregarMensajeChat('nino', respuesta);
    inputRespuesta.value = '';
    inputRespuesta.disabled = true;
    ultimaAccion = () => llamarTutor(respuesta);
    llamarTutor(respuesta);
  });

  btnOtroTexto.addEventListener('click', () => {
    inputTema.value = '';
    mostrarPantalla('inicio');
  });

  btnReintentar.addEventListener('click', () => {
    ocultarError();
    if (ultimaAccion) ultimaAccion();
  });
})();
