import { Injectable } from '@angular/core';

@Injectable()
export class DetailsService {

    public item: any;

    constructor() {

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
