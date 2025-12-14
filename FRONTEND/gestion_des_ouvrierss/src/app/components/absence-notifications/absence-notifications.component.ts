import { Component, OnInit, OnDestroy } from '@angular/core';
import { OneSignalService } from '../../services/onesignal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-absence-notifications',
  templateUrl: './absence-notifications.component.html',
  styleUrls: ['./absence-notifications.component.css']
})
export class AbsenceNotificationsComponent implements OnInit, OnDestroy {
  latestNotification: { title: string; message: string } | null = null;
  private subscription: Subscription | undefined;

  constructor(private oneSignalService: OneSignalService) {}

  ngOnInit() {
    console.log('AbsenceNotificationsComponent initialized');
    this.subscription = this.oneSignalService.onNotificationReceived().subscribe(
      (notification) => {
        console.log('Notification reçue dans le composant:', notification);
        this.latestNotification = {
          title: notification.heading,
          message: notification.content
        };
        console.log('Latest notification set:', this.latestNotification);
        setTimeout(() => {
          this.latestNotification = null;
          console.log('Notification hidden after timeout');
        }, 5000);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  clearNotification() {
    this.latestNotification = null;
  }
  
}