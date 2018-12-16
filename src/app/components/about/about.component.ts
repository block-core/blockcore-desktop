import {
    Component,
    HostBinding,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
    @HostBinding('class.about') hostClass = true;

    private nodeStatusSubscription: Subscription;
    public clientName: string;
    public applicationVersion: string;
    public network: string;
    public dataDirectory: string;

    constructor(public appState: ApplicationStateService, private apiService: ApiService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {
        this.nodeStatusSubscription = this.apiService.getNodeStatus()
            .subscribe(
                response => {
                    this.appState.fullNodeVersion = response.version;
                    this.appState.protocolVersion = response.protocolVersion;

                    this.clientName = response.agent;
                    this.network = response.network;
                    this.dataDirectory = response.dataDirectoryPath;
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }
}
