import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcRenderer,
  remote,
  screen,
  webFrame,
} from 'electron';
import * as settings from 'electron-settings';
import * as autoUpdater from 'electron-updater';
import * as fs from 'fs';
import * as powershell from 'node-powershell';
import * as os from 'os';
import * as path from 'path';
import * as electronDl from 'electron-dl';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  app: typeof app;
  ipcRenderer: typeof ipcRenderer;
  desktopCapturer: typeof desktopCapturer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  os: typeof os;
  path: typeof path;
  window: BrowserWindow;
  settings: typeof settings;
  autoUpdater: typeof autoUpdater;
  screen: typeof screen;
  powershell: typeof powershell;
  electronDl: typeof electronDl;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.autoUpdater = window.require('electron-updater');
      this.webFrame = window.require('electron').webFrame;
      this.screen = window.require('electron').screen;
      this.remote = window.require('electron').remote;
      this.app = this.remote.app;
      this.os = window.require('os');
      // this.autoLaunch = window.require('auto-launch');
      this.window = window.require('electron').remote.getCurrentWindow();
      this.settings = window.require('electron-settings');
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.path = window.require('path');
      this.powershell = window.require('node-powershell');
      this.electronDl = window.require('electron-dl');

      this.remote.globalShortcut.register('Control+Shift+I', () => {
        return false;
      });
    }
  }

  minimize() {
    this.window.minimize();
  }

  maximize() {
    if (!this.window.isMaximized()) {
      this.window.maximize();
    } else {
      this.window.unmaximize();
    }
  }

  hide() {
    this.window.hide();
  }

  close() {
    this.window.close();
  }
}
