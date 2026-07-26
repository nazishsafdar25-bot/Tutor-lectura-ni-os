# Zahida's Kitchen

Sitio web estático (HTML + CSS + JS, sin frameworks ni backend) para un negocio de comida saludable a domicilio.

## Qué incluye

- Menú saludable semanal (`WEEK_MENU` en `app.js`), con un plato distinto para cada día.
- El menú de hoy se muestra automáticamente según el día de la semana del visitante.
- Sección de pedido a domicilio: el cliente elige día, plato, cantidad y sus datos de entrega, y el formulario abre WhatsApp con el pedido ya redactado (usando `wa.me`), sin necesidad de servidor ni base de datos.
- Enlace directo de WhatsApp y email en la sección de contacto.

## Cómo usarlo

1. Abre `index.html` directamente en el navegador, o sírvelo con cualquier servidor estático.
2. Antes de publicarlo, edita en `app.js`:
   - `WHATSAPP_NUMBER`: el número de WhatsApp real del negocio, en formato internacional sin `+` ni espacios (ej. `34600000000`).
   - `WEEK_MENU`: los platos, descripciones, calorías y precios de cada día.
3. Cambia el email de contacto en `index.html` (`hola@zahidaskitchen.com`) y la zona/horario de entrega si hace falta.

No requiere `npm install` ni variables de entorno: es HTML/CSS/JS puro.
