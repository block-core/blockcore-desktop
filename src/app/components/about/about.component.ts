import { Component, HostBinding, ViewEncapsulation, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { ApiService } from 'src/app/services/api.service';
import { ElectronService } from 'ngx-electron';
import { NodeStatus } from '@models/node-status';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
    @HostBinding('class.about') hostClass = true;
    public nodeStatusSubscription$: Observable<NodeStatus>;

    constructor(public appState: ApplicationStateService, private apiService: ApiService, private electron: ElectronService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {
        this.nodeStatusSubscription$ = this.apiService.getNodeStatusInterval();
    }

    openFolder(directory: string): void {
        this.electron.shell.openPath(directory);
    }
}
