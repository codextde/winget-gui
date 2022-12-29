/* eslint-disable @typescript-eslint/await-thenable */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from '../../app/core/services/electron.service';
import { SettingsService } from '../../app/core/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  autoStartEnabled = false;
  autoLaunch;

  hiddenAccess = false;

  constructor(
    private electronService: ElectronService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
    public settingsService: SettingsService
  ) {}

  ngOnInit() {
    const loginSettings = this.electronService.app.getLoginItemSettings();

    this.autoStartEnabled = loginSettings.executableWillLaunchAtLogin;
  }

  async checkForUpdates() {
    console.log(
      'this.electronService.autoUpdater',
      this.electronService.autoUpdater.autoUpdater
    );
    await this.electronService.autoUpdater.autoUpdater.checkForUpdates();
  }

  public async selectLanguage(ev): Promise<any> {
    const actionSheetCtrl = await this.actionSheetCtrl.create({
      translucent: true,
      buttons: [
        {
          text: 'Deutsch',
          handler: () => {
            this.changeLanguage({ code: 'de', text: 'Deutsch' });
          },
        },
        {
          text: 'English',
          handler: () => {
            this.changeLanguage({ code: 'en', text: 'English' });
          },
        },
      ],
    });

    await actionSheetCtrl.present();
  }

  async changeLanguage(selection: { text: string; code: string }) {
    await this.settingsService.saveSettings({
      language: selection,
    });

    this.settingsService.language = selection;
    this.translate.use(selection.code);
  }

  changeAutoStart() {
    if (this.autoStartEnabled) {
      this.electronService.app.setLoginItemSettings({
        openAsHidden: true,
        openAtLogin: true,
        name: 'Windows Package Manager GUI',
        args: ['--hidden'],
      });
    } else {
      this.electronService.app.setLoginItemSettings({
        openAsHidden: false,
        openAtLogin: false,
        name: 'Windows Package Manager GUI',
        args: ['--hidden'],
      });
    }
    /*this.autoLaunch.isEnabled().then((isEnabled) => {
      if (isEnabled) {
        this.autoLaunch.disable();
      } else {
        this.autoLaunch.enable();
      }
    });*/
  }
}
