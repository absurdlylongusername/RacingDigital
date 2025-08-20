import { ApplicationConfig, 
         provideBrowserGlobalErrorListeners, 
         provideZonelessChangeDetection,
         provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { CsvService } from './services/csv.service';

const CSV_PATH = '/Races.csv';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAppInitializer(() => {
      const csv = inject(CsvService);
      return csv.initFrom(CSV_PATH);
    }),
  ]
};
