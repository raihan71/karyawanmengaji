import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'news/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'program/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'knowledge/:id',
    renderMode: RenderMode.Server,
  },
];
