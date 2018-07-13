import { Injectable } from '@angular/core';
import { TitleService } from './title.service';
import { Observable, Subject } from 'rxjs';


@Injectable()
export class ApplicationStateService {

    constructor(
        private readonly titleService: TitleService,
    ) { }

    pageMode = false;

    handset = false;

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
      }
}
