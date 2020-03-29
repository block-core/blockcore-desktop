import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})
export class ProfileImageService {
    constructor(private electron: ElectronService) {

    }

    getImage(id: string): string {
        let image = localStorage.getItem('Profile:Image:' + id);

        if (!image) {
            image = 'data:image/png;base64,iVBORw0KGg'
                + 'oAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAU'
                + 'AAarVyFEAAAAASUVORK5CYII=';
        }

        return image;
    }

    setImage(id: string, value: string) {
        localStorage.setItem('Profile:Image:' + id, value);
    }

}
