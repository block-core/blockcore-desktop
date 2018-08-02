import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DetailsService {

    static singletonInstance: DetailsService;

    public item: any;

    constructor() {

        if (!DetailsService.singletonInstance) {
            DetailsService.singletonInstance = this;
        }

        return DetailsService.singletonInstance;

    }

    show(item: any) {
        this.item = item;
    }

    hide() {
        this.item = null;
    }

    get opened(): boolean {
        return this.item != null;
    }
}
