import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, User } from '@angular/fire/auth';
import { Observable, from, map, switchMap, tap, of } from 'rxjs';

import { BiometricService } from './biometric.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly biometricService = inject(BiometricService);

  getUser(): Observable<User | null> {
    return authState(this.auth);
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        return from(this.biometricService.isAvailable()).pipe(
          switchMap((isAvailable) => {
            if (isAvailable) {
              return from(this.biometricService.storeCredentials(email, password)).pipe(
                map(() => userCredential.user),
                tap({
                  error: (error) => console.error('Error storing biometric credentials:', error),
                })
              );
            }
            return of(userCredential.user);
          })
        );
      })
    );
  }

  register(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        return from(this.biometricService.isAvailable()).pipe(
          switchMap((isAvailable) => {
            if (isAvailable) {
              return from(this.biometricService.storeCredentials(email, password)).pipe(
                map(() => userCredential.user),
                tap({
                  error: (error) => console.error('Error storing biometric credentials:', error),
                })
              );
            }
            return of(userCredential.user);
          })
        );
      })
    );
  }

  async loginWithBiometric(): Promise<User> {
    const credentials = await this.biometricService.getCredentials();
    return new Promise((resolve, reject) => {
      this.login(credentials.email, credentials.password).subscribe({
        next: (user) => resolve(user),
        error: (error) => reject(error),
      });
    });
  }

  async isBiometricAvailable(): Promise<boolean> {
    return this.biometricService.isAvailable();
  }

  async hasBiometricCredentials(): Promise<boolean> {
    return this.biometricService.hasStoredCredentials();
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  async deleteBiometricCredentials(): Promise<void> {
    await this.biometricService.deleteCredentials();
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }
}

