# Enlaza

Web para ofrecer servicios, buscar trabajo y encontrar socio o equipo para un proyecto. Sustituye los canales de Discord tipo `#ofrecer-servicios`, `#buscar-trabajo` y `#buscar-socio` por un solo sitio ordenado.

## Estado: paso 1 de la versión de prueba

- Páginas: Inicio (`/`), Bienvenida (`/bienvenida`), Anuncio (`/anuncio/[id]`), Perfil (`/perfil/[usuario]`) y Publicar (`/publicar`).
- Idiomas: español e inglés (botón ES/EN).
- "¿Qué buscas?": filtra los anuncios según quieras trabajar, contratar o tengas un proyecto.
- Filtros reales: búsqueda, tipo (pagado / voluntario / reparto de beneficios), habilidad, reputación e idioma.
- Publicar: etiqueta de pago obligatoria, aviso automático de posible estafa, puestos de equipo y caducidad.
- **Los anuncios y perfiles son de ejemplo** (`src/lib/data.ts`). Todavía no hay base de datos ni inicio de sesión.

Próximos pasos previstos: base de datos (Neon desde Vercel), inicio de sesión con Discord y publicación real de anuncios. El bot de Discord queda para una fase posterior.

## Tecnología

Next.js (App Router) + TypeScript + Tailwind CSS v4. Fuentes Inter y Space Grotesk autoalojadas con `@fontsource-variable`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.
