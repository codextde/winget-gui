import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { CommandService } from '../../app/core/services/command.service';

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
    private toastCtrl: ToastController
  ) {}
  async ngOnInit() {
    const loading = await this.loadingCtrl.create();
    loading.present();
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

    loading.dismiss();
    this.packages = result;
    console.log(result);
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
