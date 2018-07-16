import { Injectable } from '@angular/core';
import { TitleService } from './title.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ApplicationStateService {

    constructor(
        private readonly titleService: TitleService,
    ) {
        this.coin = this.getParam('coin') || 'city';
    }

    coin: string;

    pageMode = false;

    handset = false;

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
    }

    getParam(n) {
        const half = location.search.split(n + '=')[1];
        return half !== undefined ? decodeURIComponent(half.split('&')[0]) : null;
    }
}
