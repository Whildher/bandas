import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withDebugTracing, withPreloading } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, BrowserAnimationsModule, BrowserAnimationsModule, BrowserAnimationsModule),
    provideRouter(APP_ROUTES, 
      withPreloading(PreloadAllModules),
      // withDebugTracing(),
    )]
}).catch(err => console.error(err));