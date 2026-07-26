# Lecto — Tutor de lectura y comprensión para niños

Prototipo web sencillo de un tutor de lectura impulsado por la API de Claude. Presenta un texto corto adaptado a nivel inicial, hace preguntas de comprensión, explica con palabras simples cuando el niño se equivoca o no entiende, permite tocar cualquier palabra del texto para que se explique, y termina con un feedback motivador.

## Cómo funciona

- **Backend** (`server.js`): un servidor Express muy simple con dos rutas que llaman a la API de Claude. La clave de API nunca se expone al navegador.
  - `POST /api/chat`: recibe el historial de la conversación y el mensaje del niño, y le pide a Claude el siguiente "paso" de la tutoría (texto de lectura, pregunta, aclaración o feedback final) usando una herramienta (tool use) para obtener siempre una respuesta estructurada.
  - `POST /api/explicar-palabra`: recibe una palabra tocada por el niño y el texto donde aparece, y devuelve una explicación muy sencilla.
- **Frontend** (`public/`): HTML + CSS + JS sin frameworks, con un diseño colorido, botones grandes y tipografía amigable, pensado para pantallas de móvil.

## Requisitos

- Node.js 18 o superior
- Una clave de API de Anthropic (Claude)

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` y coloca tu clave:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-5
PORT=3000
```

## Ejecutar

```bash
npm start
```

Abre `http://localhost:3000` en el navegador (o en el móvil, usando la IP de tu red local).

## Flujo de uso

1. El niño elige un tema (opcional) y un nivel, o pulsa "¡Sorpréndeme!".
2. Lecto (el tutor) escribe un texto corto y sencillo.
3. El niño puede tocar cualquier palabra para ver una explicación simple en una ventana emergente.
4. Al terminar de leer, pulsa "¡Ya leí! Hazme preguntas".
5. Lecto hace 2-3 preguntas de comprensión, una a la vez. Si la respuesta es incorrecta o el niño no entiende, Lecto explica con palabras muy simples y vuelve a preguntar.
6. Al final, Lecto da un feedback breve, positivo y motivador, y el niño puede empezar con otro texto.

## Notas de diseño

- Todo el contenido y las preguntas los genera Claude en cada sesión, así que cada lectura es distinta.
- El servidor no guarda historial en base de datos: la conversación vive en el navegador durante la sesión, para mantener el prototipo simple.
- El diseño usa fuentes redondeadas, colores cálidos y botones grandes para facilitar el uso táctil en niños y en móviles.

## Otros proyectos en este repositorio

- [`zahidas-kitchen/`](./zahidas-kitchen): sitio web estático de "Zahida's Kitchen", un negocio de comida saludable a domicilio con menú diferente cada día y pedidos por WhatsApp. Ver su propio `README.md` para más detalles.
