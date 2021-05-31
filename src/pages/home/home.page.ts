import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { CommandService } from '../../app/core/services/command.service';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from '../../app/core/services/electron.service';
import { download } from 'electron-dl';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  packages;
  search = '';
  currentSearch = '';
  constructor(
    private commandService: CommandService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private electronService: ElectronService
  ) {}
  async ngOnInit() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    const data = await this.http
      .get('https://api.github.com/repos/microsoft/winget-cli/releases')
      .toPromise();

    const latest = data[0];
    const asset = latest.assets.find((asset) =>
      asset.name.endsWith('.appxbundle')
    );

    console.log('data', asset);

    try {
      await this.electronService.electronDl.download(
        this.electronService.window,
        asset.browser_download_url
      );

      await this.commandService.powershell(
        'Add-AppxPackage -Path "C:\\Path\\to\\File.Appx"'
      );

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
      setTimeout(() => {
        loading.dismiss();
      }, 5000);
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

  doSearch() {
    this.currentSearch = this.search;
  }
}
