/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */

import { Injectable, Inject } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, Observable } from 'rxjs';
import { Logger } from './logger.service';
// import { APP_CONFIG } from '../../core/injection-tokens/app-config-token';
// import { AppConfig } from '../../../../environments/app-config.model';

export enum Theme {
    Light = 'app-light-theme',
    Dark = 'app-dark-theme'
}

@Injectable({
    providedIn: 'root'
})
export class Theming {

    static singletonInstance: Theming;

    private readonly currentThemeSubject = new BehaviorSubject<Theme>(this.getCurrentTheme());

    constructor(
        private readonly log: Logger,
        private readonly overlayContainer: OverlayContainer
    ) {

        if (!Theming.singletonInstance) {
            Theming.singletonInstance = this;
        }

        return Theming.singletonInstance;

    }

    get currentTheme(): Theme {
        return this.getCurrentTheme();
    }

    get currentTheme$(): Observable<Theme> {
        return this.currentThemeSubject.asObservable();
    }

    start() {
        if (this.currentTheme === Theme.Dark) {
            this.switchToDark();
        } else {
            this.switchToLight();
        }
    }

    light() {
        this.switchToLight();
        this.setCurrentTheme(Theme.Light);
    }

    dark() {
        this.switchToDark();
        this.setCurrentTheme(Theme.Dark);
    }

    toggle() {
        if (this.currentTheme === Theme.Dark) {
            this.log.verbose('Toggle theme to "Light" theme.');
            this.light();
        } else {
            this.log.verbose('Toggle theme to "Dark" theme.');
            this.dark();
        }
    }

    private getCurrentTheme(): Theme {
        return localStorage.getItem('Settings:Theme') as Theme || Theme.Dark;
    }

    private setCurrentTheme(theme: Theme) {
        localStorage.setItem('Settings:Theme', theme);
        this.currentThemeSubject.next(theme);
    }

    private switchToLight() {
        this.switchTheme(Theme.Dark, Theme.Light);
    }

    private switchToDark() {
        this.switchTheme(Theme.Light, Theme.Dark);
    }

    private switchTheme(from: string, to: string) {
        this.overlayContainer.getContainerElement().classList.remove(from);
        this.overlayContainer.getContainerElement().classList.add(to);
        document.body.classList.remove(from);
        document.body.classList.add(to);
    }
}
