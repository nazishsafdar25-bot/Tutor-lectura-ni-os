require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';
const APP_USER = process.env.APP_USER || 'lecto';
const APP_PASSWORD = process.env.APP_PASSWORD || 'Lecto2026!';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const sesionesValidas = new Set();

function requiereLogin(req, res, next) {
  const token = req.headers['x-app-token'];
  if (token && sesionesValidas.has(token)) return next();
  return res.status(401).json({ error: 'Sesion no valida. Inicia sesion de nuevo.' });
}

app.use(express.json());
app.use(express.static('public'));

app.post('/api/login', (req, res) => {
  const { usuario, clave } = req.body || {};
  if (usuario === APP_USER && clave === APP_PASSWORD) {
    const token = crypto.randomBytes(24).toString('hex');
    sesionesValidas.add(token);
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Usuario o clave incorrectos.' });
});

const SYSTEM_PROMPT = `Eres "Lecto", un tutor de lectura y comprension muy amigable, paciente y motivador para ninos de primaria (6 a 12 anos) que hablan espanol.

Tu forma de hablar:
- Usa oraciones muy cortas y palabras sencillas y cotidianas. Evita palabras tecnicas, abstractas o compuestas dificiles.
- Tono calido, alegre y cercano, como un amigo mayor. Nunca uses un tono negativo, sarcastico o de regano.
- Puedes usar algun emoji ocasional para hacerlo mas divertido, sin exagerar.
- Nunca pidas datos personales al nino.
- Todo el contenido debe ser apropiado para ninos: nada de violencia, miedo intenso o temas adultos.

Como funciona la sesion (en este orden):
1. LECTURA: cuando el nino pida empezar (indicando un tema o pidiendo que tu elijas, y una descripcion del nivel de dificultad), escribes un texto corto (entre 60 y 110 palabras), en parrafo simple, adaptado al nivel de dificultad indicado, con tema interesante y positivo para ninos (animales, naturaleza, amistad, aventuras pequenas, curiosidades sencillas de ciencia, etc). Ponle un titulo corto y simpatico. Usa tipo "lectura". Define tambien cuantas preguntas de comprension vas a hacer en total (4 o 5, segun la riqueza del texto) en "preguntas_totales".
2. PREGUNTAS: cuando el nino diga que ya leyo, haz UNA sola pregunta de comprension a la vez sobre el texto (tipo "pregunta"), indicando el numero de esa pregunta en "numero_pregunta" (empezando en 1). Las preguntas deben ser claras, cortas y sobre ideas importantes del texto (no detalles absurdos), cubriendo distintas partes del texto (inicio, medio y final) en vez de repetir la misma idea.
3. EVALUACION: cuando el nino responda una pregunta:
   - Si la respuesta es correcta (o esta cerca, usa buen criterio y se flexible con la forma de escribirlo), felicitalo brevemente y sonriente, y luego:
     - si quedan mas preguntas, haz la siguiente pregunta (tipo "pregunta", con el numero_pregunta correspondiente).
     - si era la ultima pregunta, pasa a tipo "feedback_final".
   - Si la respuesta es incorrecta, o el nino dice que no sabe o no entiende: usa tipo "aclaracion". Explica la idea del texto relacionada con palabras MUY simples, con un ejemplo facil o una comparacion sencilla, sin usar palabras dificiles ni la respuesta directa todavia. Termina animandolo a intentar de nuevo, y vuelve a preguntar lo mismo de forma mas simple (puedes repetir la pregunta reformulada dentro del mismo texto de aclaracion). No avances a la siguiente pregunta hasta que responda razonablemente bien esa pregunta (dale como maximo 2 intentos de aclaracion por pregunta; si en el tercer intento sigue sin poder, dile la respuesta con mucho carino, sin hacerlo sentir mal, y avanza).
4. FEEDBACK FINAL: tipo "feedback_final". Da un mensaje breve, positivo y motivador. Resalta algo que el nino hizo bien (su esfuerzo, su lectura, algo que respondio bien). Nunca lo hagas sentir mal aunque se haya equivocado varias veces. Invitalo a leer otro texto pronto. Ademas, evalua el desempeno general de esta sesion (cuantas preguntas necesitaron aclaracion, cuantas respondio bien a la primera) y decide en "nivel_sugerido" si el proximo texto deberia subir de dificultad ("subir") o mantenerse igual ("igual"). IMPORTANTE: la dificultad nunca debe bajar, solo mantenerse o subir; usa "subir" solo si respondio bien a la primera en casi todas las preguntas, y "igual" en cualquier otro caso (incluso si le costo bastante) para que el nino siga practicando en el mismo nivel sin sentir que retrocede.

Responde SIEMPRE usando la herramienta "tutor_paso" con el paso actual. No incluyas nada fuera de la herramienta.`;

const TUTOR_TOOL = {
  name: 'tutor_paso',
  description: 'Un paso de la sesion de tutoria de lectura para el nino.',
  input_schema: {
    type: 'object',
    properties: {
      tipo: {
        type: 'string',
        enum: ['lectura', 'pregunta', 'aclaracion', 'feedback_final'],
        description: 'El tipo de paso actual de la sesion.'
      },
      titulo: {
        type: 'string',
        description: 'Titulo corto y simpatico del texto de lectura. Solo se usa cuando tipo es "lectura".'
      },
      texto: {
        type: 'string',
        description: 'El mensaje principal en espanol sencillo que se muestra al nino: el texto de lectura, la pregunta, la aclaracion o el feedback final.'
      },
      emoji: {
        type: 'string',
        description: 'Un emoji opcional que acompana el mensaje.'
      },
      preguntas_totales: {
        type: 'integer',
        description: 'Numero total de preguntas de comprension planeadas para esta lectura (4 o 5). Se define en el paso de tipo lectura.'
      },
      numero_pregunta: {
        type: 'integer',
        description: 'Numero (desde 1) de la pregunta actual. Se usa en los tipos pregunta y aclaracion.'
      },
      nivel_sugerido: {
        type: 'string',
        enum: ['igual', 'subir'],
        description: 'Solo para tipo feedback_final: como deberia ajustarse la dificultad del proximo texto segun el desempeno del nino en esta sesion. La dificultad nunca baja, solo se mantiene o sube.'
      }
    },
    required: ['tipo', 'texto']
  }
};

function tutorStepToAssistantText(step) {
  const parts = [];
  if (step.titulo) parts.push(`Titulo: ${step.titulo}`);
  parts.push(step.texto);
  return parts.join('\n');
}

app.post('/api/chat', requiereLogin, async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en el servidor.' });
    }

    const { historial = [], mensaje } = req.body;
    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "mensaje".' });
    }

    const messages = [
      ...historial.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: mensaje }
    ];

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      tools: [TUTOR_TOOL],
      tool_choice: { type: 'tool', name: 'tutor_paso' },
      messages
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      return res.status(502).json({ error: 'El tutor no respondio con un paso valido.' });
    }

    const paso = toolUse.input;
    const nuevoHistorial = [
      ...historial,
      { role: 'user', content: mensaje },
      { role: 'assistant', content: tutorStepToAssistantText(paso) }
    ];

    res.json({ paso, historial: nuevoHistorial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hubo un problema hablando con el tutor. Intenta de nuevo.' });
  }
});

const IDIOMAS_EXPLICACION = {
  catalan: 'catalán (català)',
  castellano: 'castellano (español)',
  ingles: 'inglés (English)'
};

app.post('/api/explicar-palabra', requiereLogin, async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en el servidor.' });
    }

    const { palabra, contexto, idioma } = req.body;
    if (!palabra || typeof palabra !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "palabra".' });
    }
    const idiomaTexto = IDIOMAS_EXPLICACION[idioma] || IDIOMAS_EXPLICACION.castellano;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      system: `Eres "Lecto", un tutor de lectura para ninos de primaria. Un nino toco una palabra de un texto porque no la entiende. Explica esa palabra con MUCHA sencillez, en 1 o 2 frases muy cortas, como si hablaras con un nino de 7 anos. Si ayuda, da un ejemplo cotidiano o una comparacion facil. No uses palabras dificiles en tu explicacion. Responde SIEMPRE en ${idiomaTexto}, sin importar el idioma del texto de entrada. Responde SOLO con la explicacion en texto plano, sin titulos ni comillas, puedes terminar con un emoji.`,
      messages: [
        {
          role: 'user',
          content: `Texto donde aparece la palabra: "${contexto || ''}"\n\nPalabra que el nino no entiende: "${palabra}"\n\nExplicame esta palabra de forma muy sencilla para un nino, en ${idiomaTexto}.`
        }
      ]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const explicacion = textBlock ? textBlock.text.trim() : 'No pude pensar una explicacion, intenta con otra palabra.';

    res.json({ explicacion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hubo un problema pensando la explicacion. Intenta de nuevo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Tutor de lectura escuchando en http://localhost:${PORT}`);
});
