import { Injectable, APP_INITIALIZER } from '@angular/core';
import { TitleService } from './title.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {

    // TODO: Figure out when multiple instance of singleton services is fixed for lazy-loaded routing/modules in Angular.
    // See details here: https://github.com/angular/angular/issues/12889#issuecomment-395720894
    static singletonInstance: ApplicationStateService;

    constructor(
        private readonly titleService: TitleService,
    ) {
        if (!ApplicationStateService.singletonInstance) {
            this.chain = this.getParam('chain') || 'city';
            this.mode = localStorage.getItem('Mode') || 'full';
            this.network = localStorage.getItem('Network') || 'main';

            ApplicationStateService.singletonInstance = this;
        }

        return ApplicationStateService.singletonInstance;
    }

    version: string;

    chain: string;

    mode: string;

    network: string;

    pageMode = false;

    handset = false;

    fullHeight = false;

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
    }

    getParam(n) {
        const half = location.search.split(n + '=')[1];
        return half !== undefined ? decodeURIComponent(half.split('&')[0]) : null;
    }
}
