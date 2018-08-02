import { Injectable, Inject } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, Observable } from 'rxjs';
// import { Logger } from '../../core/services/logging/logger.service';
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

    constructor(
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

    private readonly currentThemeSubject = new BehaviorSubject<Theme>(this.getCurrentTheme());

    private getCurrentTheme(): Theme {
        return <Theme>localStorage.getItem('Theme') || Theme.Dark;
    }

    private setCurrentTheme(theme: Theme) {
        localStorage.setItem('Theme', theme);
        this.currentThemeSubject.next(theme);
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
            this.light();
        } else {
            this.dark();
        }
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
