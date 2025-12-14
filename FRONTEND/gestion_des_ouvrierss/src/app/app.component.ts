import { Component, OnInit } from '@angular/core';
import { SyncService } from './services/sync.service';
import { OneSignalService } from './services/onesignal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private syncService: SyncService, private oneSignalService: OneSignalService) {}

  ngOnInit() {
    this.syncService.startSync();
    this.oneSignalService.initOneSignal();
  }


}