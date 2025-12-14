import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare var OneSignal: any;

const environment = {
  production: false,
  oneSignalAppId: 'f5547719-f95a-4a17-9c90-acb1fc9a9a30'
};

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {
  private notificationReceived = new Subject<any>();

  constructor() {}

  initOneSignal(): void {
    console.log('Initialisation de OneSignal...');

    if (typeof OneSignal === 'undefined') {
      console.error('OneSignal n\'est pas défini. Assurez-vous que le script OneSignal est chargé correctement.');
      return;
    }

    OneSignal.push(() => {
      OneSignal.init({
        appId: environment.oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true
        },
        promptOptions: {
          slidedown: {
            enabled: true,
            autoPrompt: true,
            actionMessage: "Nous aimerions vous envoyer des notifications pour les dernières mises à jour.",
            acceptButtonText: "Autoriser",
            cancelButtonText: "Non merci"
          }
        }
      });


      console.log('OneSignal initialisé avec succès');

      OneSignal.on('notificationDisplay', (event: any) => {
        console.log('Notification reçue:', event);
        this.notificationReceived.next(event);
      });

      OneSignal.getNotificationPermission((permission: string) => {
        console.log('Permission de notification actuelle:', permission);
      });

      OneSignal.getUserId((userId: string) => {
        console.log('OneSignal User ID:', userId);
      });
    });

    OneSignal.push(() => {
      OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
        console.log('Notifications activées :', isEnabled);
      });
    
      OneSignal.isPushNotificationsSupported((isSupported: boolean) => {
        console.log('Notifications supportées par le navigateur :', isSupported);
      });
    });

    OneSignal.push(() => {
      OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
        console.log('Statut de l\'abonnement OneSignal:', isSubscribed);
      });
    });
  }

  promptForNotificationPermission(): void {
    OneSignal.push(() => {
      OneSignal.showSlidedownPrompt();
    });
  }

  setExternalUserId(userId: string): void {
    console.log(`Définition de l'ID utilisateur externe : ${userId}`);
    OneSignal.push(() => {
      OneSignal.setExternalUserId(userId);
    });
  }
  

  onNotificationReceived() {
    return this.notificationReceived.asObservable();
  }

  // Nouvelle méthode pour tester les notifications
  testNotification(title: string, message: string) {
    this.notificationReceived.next({
      heading: title,
      content: message
    });
  }
}