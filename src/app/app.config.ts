import {
  ApplicationConfig,
  LOCALE_ID,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
  Meta,
} from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';

registerLocaleData(localeId, 'id');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom([BrowserModule]),
    {
      provide: LOCALE_ID,
      useValue: 'id-ID',
    },
    Meta,
  ],
};
