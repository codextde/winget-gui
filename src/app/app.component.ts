import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { ElectronService as NgxService } from 'ngx-electron';
import { AppConfig } from '../environments/environment';
import { AppService } from './core/services/app.service';
import { ElectronService } from './core/services/electron.service';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  platform = window.process;
  process = window.process;
  version = '##version##';

  appPages = [
    { title: 'Home', url: '/home', icon: 'code-working-outline' },
    { title: 'Einstellungen', url: '/settings', icon: 'cog-outline' },
  ];

  constructor(
    public electronService: ElectronService,
    public appService: AppService,
    private settingsService: SettingsService,
    private ngxService: NgxService
  ) {
    console.log('AppConfig', AppConfig);
  }

  async ngAfterViewInit() {
    if (this.ngxService.isElectronApp) {
      await this.settingsService.load();
    }
  }
}
