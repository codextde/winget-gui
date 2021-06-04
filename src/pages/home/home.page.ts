/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { CommandService } from '../../app/core/services/command.service';
import { ElectronService } from '../../app/core/services/electron.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  packages;
  installed;
  search = '';
  currentSearch = '';

  mode = 'packages';
  constructor(
    private commandService: CommandService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private electronService: ElectronService,
    private cdr: ChangeDetectorRef
  ) {}

  async segmentChanged($event) {
    this.mode = $event.detail.value;
    await this.refresh();
  }

  async refresh() {
    if (this.mode == 'installed') {
      await this.loadInstalled();
    }
    if (this.mode == 'packages') {
      await this.loadPackages();
    }
  }

  async ngOnInit() {
    this.startUp();
  }

  async startUp() {
    try {
      const checkWinget: any = await this.commandService.powershell('winget');
      if (!checkWinget.includes('Windows Package Manager')) {
        await this.installWinGet();
      }

      await this.refresh();
    } catch (error) {
      await this.installWinGet();
      await this.startUp();
      console.log('checkWinget error', error);
    }
  }

  async installWinGet() {
    return new Promise(async (resolve, reject) => {
      const loading = await this.loadingCtrl.create({
        message: 'Install WinGet ...',
      });
      loading.present();

      const data = await this.http
        .get('https://api.github.com/repos/microsoft/winget-cli/releases')
        .toPromise();

      const latest = data[0];
      const asset: any = latest.assets.find((asset) =>
        asset.name.endsWith('.appxbundle')
      );

      try {
        const tmp = this.electronService.app.getPath('temp');

        await this.commandService.powershell(
          `Invoke-WebRequest -Uri ${asset.browser_download_url} -OutFile ${tmp}\\winget.appxbundle`
        );
        await this.commandService.powershell(
          `Add-AppxPackage -Path "${tmp}\\winget.appxbundle"`
        );
        loading.dismiss();
        resolve(true);
      } catch (error) {
        loading.dismiss();
        reject(error);
      }
    });
  }

  async loadPackages() {
    this.packages = [];
    const loading = await this.loadingCtrl.create({
      message: 'Load All Packages ...',
    });
    loading.present();

    try {
      let result: any = await this.commandService.powershell('winget install');
      result = result.split('----------------------------------').pop();
      result = result
        .split('\n')
        .map((lines: any) => {
          lines = lines
            .replace(/ +(?= )/g, '\t')
            .split('\t')
            .map((line) => line.trim());
          return lines;
        })
        .slice(1);

      this.packages = result;
    } catch (error) {
    } finally {
      loading.dismiss();
    }
  }

  trackBy(index, item) {
    return item[0];
  }

  async loadInstalled() {
    this.installed = [];
    const loading = await this.loadingCtrl.create({
      message: 'Load Installed Packages ...',
    });
    loading.present();

    try {
      let result: any = await this.commandService.powershell('winget list');
      result = result.split('----------------------------------').pop();
      result = result
        .split('\n')
        .map((lines: any) => {
          lines = lines
            .replace(/ +(?= )/g, '\t')
            .split('\t')
            .map((line) => line.trim());
          return lines;
        })
        .slice(1);

      this.installed = result;
    } catch (error) {
    } finally {
      loading.dismiss();
    }
  }

  async install(_package) {
    const loading = await this.loadingCtrl.create({
      message: 'Package installing ...',
    });
    try {
      loading.present();
      await this.commandService.powershell(`winget install ${_package[1]}`);

      const toast = await this.toastCtrl.create({
        duration: 5000,
        message: 'Package installed!',
      });
      toast.present();
    } catch (err) {
      const toast = await this.toastCtrl.create({
        duration: 5000,
        message: 'Package not installed!',
      });
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  async uninstall(_package) {
    const loading = await this.loadingCtrl.create({
      message: 'Package uninstalling ...',
    });
    try {
      loading.present();
      await this.commandService.powershell(`winget uninstall ${_package[1]}`);

      const toast = await this.toastCtrl.create({
        duration: 5000,
        message: 'Package uninstalled!',
      });
      toast.present();
    } catch (err) {
      const toast = await this.toastCtrl.create({
        duration: 5000,
        message: 'Package not uninstalled!',
      });
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  doSearch() {
    setTimeout(() => {
      this.currentSearch = this.search;
      this.cdr.detectChanges();
    }, 50);
  }
}
