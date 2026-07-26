# Zahida's Kitchen

Sitio web estático (HTML + CSS + JS, sin frameworks ni backend) para un negocio de comida saludable a domicilio.

## Qué incluye

- Menú saludable semanal (`WEEK_MENU` en `app.js`), con un plato distinto para cada día.
- El menú de hoy se muestra automáticamente según el día de la semana del visitante.
- Sección de pedido a domicilio: el cliente elige día, plato, cantidad y sus datos de entrega, y el formulario abre WhatsApp con el pedido ya redactado (usando `wa.me`), sin necesidad de servidor ni base de datos.
- Enlace directo de WhatsApp y email en la sección de contacto.

## Cómo usarlo

1. Abre `index.html` directamente en el navegador, o sírvelo con cualquier servidor estático.
2. En `app.js`:
   - `WHATSAPP_NUMBER` ya usa el número real del negocio (`34617758786`); si cambia, actualízalo en formato internacional sin `+` ni espacios.
   - `WEEK_MENU`: los platos, descripciones, calorías y precios de cada día.
3. El email de contacto en `index.html` ya usa la cuenta real del negocio (`hola.zahidaskitchen@gmail.com`); cámbialo ahí si en el futuro usas otro, y ajusta la zona/horario de entrega si hace falta.

No requiere `npm install` ni variables de entorno: es HTML/CSS/JS puro.
