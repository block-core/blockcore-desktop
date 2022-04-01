import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SetupService {
    constructor() {

    }

    /** The name of the app. */
    get name(): string {
        return 'Blockcore Hub';
    }

    /** Returns the name of the logo or path to the logo to be displayed in case an image is used. */
    get logo(): string {
        return 'assets/blockcore-hub-dark.png';
    }

}
