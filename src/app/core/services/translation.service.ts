import { Injectable, signal, effect } from '@angular/core';

export type Language = 'fr' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: { [lang: string]: Translations } = {};
  public readonly currentLanguage = signal<Language>('fr');
  public readonly translationsLoaded = signal<boolean>(false);

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      this.loadTranslations(lang);
    });
  }

  async loadTranslations(lang: Language): Promise<void> {
    if (this.translations[lang]) {
      this.translationsLoaded.set(true);
      return;
    }

    try {
      const response = await fetch(`/assets/i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      this.translations[lang] = await response.json();
      this.translationsLoaded.set(true);
    } catch (error) {
      this.translationsLoaded.set(false);
    }
  }

  setLanguage(lang: Language): void {
    if (this.currentLanguage() !== lang) {
      this.currentLanguage.set(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('language', lang);
      }
    }
  }

  getLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('language') as Language;
      if (stored && (stored === 'fr' || stored === 'en')) {
        return stored;
      }
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'fr' ? 'fr' : 'en';
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    const translations = this.translations[lang];
    
    if (!translations) {
      return key;
    }

    const keys = key.split('.');
    let value: string | Translations | undefined = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  async init(): Promise<void> {
    const lang = this.getLanguage();
    this.currentLanguage.set(lang);
    await this.loadTranslations(lang);
  }
}

