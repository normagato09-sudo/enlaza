# Enlaza

Web para ofrecer servicios, buscar trabajo y encontrar socio o equipo para un proyecto. Sustituye los canales de Discord tipo `#ofrecer-servicios`, `#buscar-trabajo` y `#buscar-socio` por un solo sitio ordenado.

## Estado: versión 1 funcionando

- Inicio de sesión con Discord (OAuth propio, cookie firmada).
- Base de datos Postgres (Neon desde Vercel Storage). Las tablas se crean solas.
- Publicar anuncios con etiqueta de pago obligatoria, caducidad (1 o 4 semanas) y puestos de equipo.
- Aviso de posible estafa: esos anuncios quedan "en revisión" y solo los ve quien los publicó. Con 3 denuncias, un anuncio también pasa a revisión.
- Apuntarse a un puesto; quien publica ve las solicitudes y acepta a la persona (el puesto queda cubierto).
- Perfil con los anuncios de cada persona; renovar anuncios caducados o a punto de caducar; borrar anuncios.
- Español e inglés (botón ES/EN).

Variables de entorno en Vercel: `DATABASE_URL` (la pone Neon), `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.
Redirect de Discord: `https://<dominio>/api/auth/callback`.

## Tecnología

Next.js (App Router) + TypeScript + Tailwind CSS v4. Fuentes Inter y Space Grotesk autoalojadas con `@fontsource-variable`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin `DATABASE_URL` se usa una base de datos en memoria, y sin Discord configurado puedes entrar con una cuenta de prueba en `/api/auth/dev?u=prueba` (solo en local).
