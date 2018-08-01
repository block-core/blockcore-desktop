import { Injectable, APP_INITIALIZER } from '@angular/core';
import { TitleService } from './title.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ApplicationStateService {

    constructor(
        private readonly titleService: TitleService,
    ) {
        this.chain = this.getParam('chain') || 'city';
        this.mode = localStorage.getItem('Mode') || 'full';
        this.network = localStorage.getItem('Network') || 'main';
    }

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
