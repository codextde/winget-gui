import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HotToastModule, HotToastService } from "@ngneat/hot-toast";
import { Command } from "@tauri-apps/api/shell";
import { Ng2SearchPipeModule } from "ng2-search-filter";

@Component({
  selector: "app-root",
  template: `
    <div class="p-5">
      <input
        class="input input-bordered w-full sticky top-5"
        type="text"
        placeholder="Search ..."
        [(ngModel)]="search"
        (ngModelChange)="doSearch()"
      />
      <div class="mt-5">
        <progress
          *ngIf="loading"
          class="progress progress-info w-full"
        ></progress>
        <div
          class="
          flex
          items-center
          justify-start
          px-4
          py-2
          my-2
        "
          *ngFor="let package of packages | filter : currentSearch"
        >
          <div class="title flex-grow font-medium pr-2">
            <h2 class="font-bold">{{ package[0] }}</h2>
            <p class="text-sm font-normal text-gray-500 tracking-wide">
              {{ package[1] }} - {{ package[2] }}
            </p>
          </div>

          <button
            *ngIf="!isInstalled(package)"
            class="btn"
            [class.loading]="package.loading"
            [disabled]="package.loading"
            (click)="install(package)"
          >
            {{ package.loading ? "Installing" : "Install" }}
          </button>

          <div class="flex flex-col gap-y-1" *ngIf="isInstalled(package)">
            <button
              class="btn btn-sm"
              [class.loading]="package.loading"
              [disabled]="package.loading"
              (click)="upgrade(package)"
            >
              {{ package.loading ? "Updating" : "Update" }}
            </button>

            <button
              class="btn btn-sm"
              [class.loading]="package.loading"
              [disabled]="package.loading"
              (click)="uninstall(package)"
            >
              {{ package.loading ? "Uninstalling" : "Uninstall" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule,
    HotToastModule,
  ],
})
export class AppComponent {
  packages: any;
  installed: any;
  search = "";
  currentSearch = "";
  mode = "packages";
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: HotToastService
  ) {}

  async ngOnInit() {
    await this.startUp();
  }

  async startUp() {
    this.loading = true;
    try {
      const checkWinget: any = await this.powershell("winget");
      if (checkWinget.includes("winget")) {
        await this.loadPackages();
      } else {
        await this.installWinGet();
      }
    } catch (error) {
      // await this.installWinGet();
      // await this.startUp();
      console.log("checkWinget error", error);
    } finally {
      this.loading = false;
    }
  }

  isInstalled(_package: any) {
    return this.installed.find((p: any) => p[0] === _package[0]);
  }

  doSearch() {
    setTimeout(() => {
      this.currentSearch = this.search;
      this.cdr.detectChanges();
    }, 50);
  }

  async installWinGet() {
    return new Promise(async (resolve, reject) => {
      const data: any = await this.http
        .get("https://api.github.com/repos/microsoft/winget-cli/releases")
        .toPromise();

      const latest = data[0];
      const asset: any = latest.assets.find((asset: any) =>
        asset.name.endsWith(".appxbundle")
      );

      try {
        const tmp = ""; //this.electronService.app.getPath("temp");

        await this.powershell(
          `Invoke-WebRequest -Uri ${asset.browser_download_url} -OutFile ${tmp}\\winget.appxbundle`
        );
        await this.powershell(
          `Add-AppxPackage -Path "${tmp}\\winget.appxbundle"`
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async loadPackages() {
    this.packages = [];

    try {
      let result: any = await this.powershell(
        "winget search -q= --accept-source-agreements"
      );
      result = result.split("----------------------------------").pop();
      result = result
        .split("\n")
        .map((lines: any) => {
          lines = lines
            .replace(/ +(?= )/g, "\t")
            .split("\t")
            .map((line: any) => line.trim());
          return lines;
        })
        .slice(1);

      console.log("result", result);
      const installed = await this.loadInstalled();
      // sort result by installed packages
      result = result.sort((a: any, b: any) => {
        const aInstalled = installed.find((p: any) => p[0] === a[0]);
        const bInstalled = installed.find((p: any) => p[0] === b[0]);
        if (aInstalled && !bInstalled) {
          return -1;
        } else if (!aInstalled && bInstalled) {
          return 1;
        } else {
          return 0;
        }
      });

      this.packages = result;
    } catch (error) {
    } finally {
    }
  }

  async loadInstalled() {
    this.installed = [];

    try {
      let result: any = await this.powershell("winget list");
      result = result.split("----------------------------------").pop();
      result = result
        .split("\n")
        .map((lines: any) => {
          lines = lines
            .replace(/ +(?= )/g, "\t")
            .split("\t")
            .map((line: any) => line.trim());
          return lines;
        })
        .slice(1);

      console.log("loadInstalled", result);

      this.installed = result;
      return result;
    } catch (error) {
    } finally {
    }
  }

  async install(_package: any) {
    _package.loading = true;
    try {
      await this.powershell(`winget install ${_package[1]}`);
      this.installed.push(_package);
      this.toast.success("Package installed");
    } catch (err) {
      this.toast.error("Package not installed");
    } finally {
      _package.loading = false;
    }
  }

  async upgrade(_package: any) {
    console.log("uninstall", _package);
    _package.loading = true;
    try {
      await this.powershell(`winget upgrade --id ${_package[1]}`);
    } catch (err) {
      this.toast.error("Package not updated");
    } finally {
      this.toast.success("Package updated");
      _package.loading = false;
    }
  }

  async uninstall(_package: any) {
    console.log("uninstall", _package);
    _package.loading = true;
    try {
      await this.powershell(`winget uninstall ${_package[1]}`);
      this.installed = this.installed.filter((p: any) => p[0] !== _package[0]);
    } catch (err) {
      this.toast.error("Package not uninstalled");
    } finally {
      this.toast.success("Package uninstalled");
      _package.loading = false;
    }
  }

  async upgradeAll() {
    try {
      await this.powershell(`winget upgrade --all`);
    } catch (err) {
    } finally {
    }
  }

  async powershell(script: string) {
    const { stdout, stderr } = await new Command(
      "powershell",
      ["-exec", "bypass", script],
      {
        encoding: "utf-8",
      }
    ).execute();
    console.log("stdout", stdout);
    return stdout;
  }
}
