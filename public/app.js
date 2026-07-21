(() => {
  const pantallas = {
    login: document.getElementById('pantalla-login'),
    inicio: document.getElementById('pantalla-inicio'),
    lectura: document.getElementById('pantalla-lectura'),
    preguntas: document.getElementById('pantalla-preguntas'),
    dictado: document.getElementById('pantalla-dictado'),
    final: document.getElementById('pantalla-final')
  };
  const cargando = document.getElementById('cargando');
  const errorBox = document.getElementById('error-box');
  const errorMensaje = document.getElementById('error-mensaje');

  const inputUsuario = document.getElementById('input-usuario');
  const inputClave = document.getElementById('input-clave');
  const btnEntrar = document.getElementById('btn-entrar');

  const modoBotones = document.querySelectorAll('.modo-btn');
  const etiquetaTema = document.getElementById('etiqueta-tema');
  const idiomaBotones = document.querySelectorAll('.idioma-btn');
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

  const progresoDictadoEl = document.getElementById('progreso-dictado');
  const chatDictadoEl = document.getElementById('chat-dictado');
  const formDictado = document.getElementById('form-dictado');
  const inputDictado = document.getElementById('input-dictado');
  const btnEscuchar = document.getElementById('btn-escuchar');
  const btnRepetir = document.getElementById('btn-repetir');

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

  const IDIOMAS = {
    catalan: { label: 'catalán', instruccion: 'catalán (català)' },
    castellano: { label: 'castellano', instruccion: 'castellano (español)' },
    ingles: { label: 'inglés', instruccion: 'inglés (English)' }
  };
  const IDIOMA_STORAGE_KEY = 'lecto_idioma';

  function cargarIdioma() {
    const guardado = localStorage.getItem(IDIOMA_STORAGE_KEY);
    return IDIOMAS[guardado] ? guardado : 'castellano';
  }

  function guardarIdioma(codigo) {
    localStorage.setItem(IDIOMA_STORAGE_KEY, codigo);
  }

  let idiomaActual = cargarIdioma();
  let nivelIndex = cargarNivelIndex();
  let modoActual = 'lectura';
  let historial = [];
  let ultimaAccion = null;
  let textoActual = '';
  let dictadoTextoActual = '';
  let preguntasTotales = 4;

  const VOCES_IDIOMA = { catalan: 'ca-ES', castellano: 'es-ES', ingles: 'en-US' };

  function hablar(texto) {
    if (!texto || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = VOCES_IDIOMA[idiomaActual] || 'es-ES';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

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

  const TOKEN_STORAGE_KEY = 'lecto_token';

  function getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  }

  function guardarToken(token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  function borrarToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  actualizarBadgeNivel();

  idiomaBotones.forEach((btn) => {
    if (btn.dataset.idioma === idiomaActual) btn.classList.add('activo');
    else btn.classList.remove('activo');
    btn.addEventListener('click', () => {
      idiomaActual = btn.dataset.idioma;
      guardarIdioma(idiomaActual);
      idiomaBotones.forEach((b) => b.classList.toggle('activo', b === btn));
    });
  });

  function actualizarTextosModo() {
    if (modoActual === 'dictado') {
      btnEmpezar.textContent = '✍️ ¡Empezar dictado!';
      etiquetaTema.textContent = 'Categoría de palabras (opcional)';
      inputTema.placeholder = 'Ej: animales, colores, la casa...';
    } else {
      btnEmpezar.textContent = '📖 ¡Empezar a leer!';
      etiquetaTema.textContent = 'Un tema (opcional)';
      inputTema.placeholder = 'Ej: dinosaurios, el mar, mi mascota...';
    }
  }

  modoBotones.forEach((btn) => {
    btn.addEventListener('click', () => {
      modoActual = btn.dataset.modo;
      modoBotones.forEach((b) => b.classList.toggle('activo', b === btn));
      actualizarTextosModo();
    });
  });
  actualizarTextosModo();

  if (getToken()) {
    mostrarPantalla('inicio');
  } else {
    mostrarPantalla('login');
  }

  btnEntrar.addEventListener('click', async () => {
    const usuario = inputUsuario.value.trim();
    const clave = inputClave.value;
    if (!usuario || !clave) {
      mostrarError('Escribe tu usuario y tu clave.');
      return;
    }
    ocultarError();
    mostrarCargando(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave })
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || 'Usuario o clave incorrectos.');
      guardarToken(datos.token);
      inputClave.value = '';
      mostrarPantalla('inicio');
    } catch (err) {
      mostrarError(err.message || 'No pude iniciar sesión. Intenta de nuevo.');
    } finally {
      mostrarCargando(false);
    }
  });

  async function llamarTutor(mensaje) {
    ocultarError();
    mostrarCargando(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-token': getToken() },
        body: JSON.stringify({ historial, mensaje })
      });
      if (res.status === 401) {
        borrarToken();
        mostrarPantalla('login');
        throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
      }
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
      agregarMensajeChat(chatEl, 'tutor', paso.texto, paso.emoji, paso.tipo === 'aclaracion');
      actualizarProgreso(progresoEl, paso.numero_pregunta, preguntasTotales);
      mostrarPantalla('preguntas');
      inputRespuesta.disabled = false;
      inputRespuesta.focus();
      return;
    }

    if (paso.tipo === 'dictado_item') {
      dictadoTextoActual = paso.texto;
      actualizarProgreso(progresoDictadoEl, paso.numero_pregunta, preguntasTotales);
      mostrarPantalla('dictado');
      inputDictado.disabled = false;
      inputDictado.value = '';
      inputDictado.focus();
      return;
    }

    if (paso.tipo === 'dictado_resultado') {
      agregarMensajeChat(chatDictadoEl, 'tutor', paso.texto, paso.emoji, false);
      actualizarProgreso(progresoDictadoEl, paso.numero_pregunta, preguntasTotales);
      mostrarPantalla('dictado');
      inputDictado.disabled = true;
      const mensajeSiguiente = 'Siguiente, por favor.';
      ultimaAccion = () => llamarTutor(mensajeSiguiente);
      setTimeout(() => llamarTutor(mensajeSiguiente), 1400);
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

  function agregarMensajeChat(elemento, quien, texto, emoji, esAclaracion) {
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
    elemento.appendChild(msg);
    elemento.scrollTop = elemento.scrollHeight;
  }

  function actualizarProgreso(elemento, numeroActual, total) {
    elemento.innerHTML = '';
    for (let i = 1; i <= total; i++) {
      const punto = document.createElement('div');
      punto.className = 'punto';
      if (numeroActual && i < numeroActual) punto.classList.add('hecho');
      if (numeroActual && i === numeroActual) punto.classList.add('actual');
      elemento.appendChild(punto);
    }
  }

  async function abrirExplicacionPalabra(palabra, mostrada) {
    modal.classList.remove('oculta');
    modalTitulo.textContent = mostrada;
    modalCuerpo.innerHTML = '<div class="spinner"></div>';
    try {
      const res = await fetch('/api/explicar-palabra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-token': getToken() },
        body: JSON.stringify({ palabra, contexto: textoActual, idioma: idiomaActual })
      });
      if (res.status === 401) {
        borrarToken();
        mostrarPantalla('login');
        throw new Error('Sesión expirada.');
      }
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
    preguntasTotales = modoActual === 'dictado' ? 5 : 4;
    notaNivelEl.textContent = '';
    const nivelTexto = NIVELES[nivelIndex].desc;
    const idiomaTexto = IDIOMAS[idiomaActual].instruccion;
    const instruccionIdioma = `Idioma: escribe TODO (titulo, texto, preguntas, aclaraciones, items de dictado y feedback final) en ${idiomaTexto}, sin importar en que idioma te escriba yo.`;
    let mensaje;
    if (modoActual === 'dictado') {
      chatDictadoEl.innerHTML = '';
      progresoDictadoEl.innerHTML = '';
      mensaje = temaTexto
        ? `Quiero practicar dictado. Categoria de palabras: ${temaTexto}. Nivel de dificultad: ${nivelTexto}. ${instruccionIdioma} Dame el primer item de dictado.`
        : `Quiero practicar dictado con palabras variadas. Nivel de dificultad: ${nivelTexto}. ${instruccionIdioma} Dame el primer item de dictado.`;
    } else {
      mensaje = temaTexto
        ? `Quiero leer un texto sobre: ${temaTexto}. Nivel de dificultad: ${nivelTexto}. ${instruccionIdioma} Por favor comienza.`
        : `Sorpréndeme con un tema divertido para leer. Nivel de dificultad: ${nivelTexto}. ${instruccionIdioma} Por favor comienza.`;
    }
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
    agregarMensajeChat(chatEl, 'nino', respuesta);
    inputRespuesta.value = '';
    inputRespuesta.disabled = true;
    ultimaAccion = () => llamarTutor(respuesta);
    llamarTutor(respuesta);
  });

  btnEscuchar.addEventListener('click', () => hablar(dictadoTextoActual));
  btnRepetir.addEventListener('click', () => hablar(dictadoTextoActual));

  formDictado.addEventListener('submit', (e) => {
    e.preventDefault();
    const respuesta = inputDictado.value.trim();
    if (!respuesta) return;
    agregarMensajeChat(chatDictadoEl, 'nino', respuesta);
    inputDictado.value = '';
    inputDictado.disabled = true;
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
