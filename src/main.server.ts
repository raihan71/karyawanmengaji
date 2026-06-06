import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app/app';
import { config } from './app/app.config.server';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
