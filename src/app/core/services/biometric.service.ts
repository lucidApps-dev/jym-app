import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

import { TranslationService } from '@core/services/translation.service';

export interface BiometricCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private readonly server = 'jym-app';
  private readonly translationService = inject(TranslationService);

  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      return false;
    }
  }

  async hasStoredCredentials(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await NativeBiometric.getCredentials({ 
        server: this.server,
      });
      return !!result.username;
    } catch (error) {
      return false;
    }
  }

  async storeCredentials(email: string, password: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await NativeBiometric.setCredentials({
        username: email,
        password: password,
        server: this.server,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyIdentity(reason?: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error(this.translationService.translate('biometric.notAvailable'));
    }

    const defaultReason = this.translationService.translate('biometric.authenticateToLogin');
    const translatedReason = reason || defaultReason;

    try {
      await NativeBiometric.verifyIdentity({
        reason: translatedReason,
        title: this.translationService.translate('biometric.title'),
        subtitle: this.translationService.translate('biometric.subtitle'),
        description: '',
        negativeButtonText: this.translationService.translate('biometric.cancel'),
      });
    } catch (error) {
      throw error;
    }
  }

  async getCredentials(): Promise<BiometricCredentials> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error(this.translationService.translate('biometric.notAvailable'));
    }

    try {
      const reason = this.translationService.translate('biometric.authenticateToRetrieve');
      await this.verifyIdentity(reason);

      const result = await NativeBiometric.getCredentials({
        server: this.server,
      });

      return {
        email: result.username,
        password: result.password,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteCredentials(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await NativeBiometric.deleteCredentials({
        server: this.server,
      });
    } catch (error) {
        throw error;
    }
  }
}
