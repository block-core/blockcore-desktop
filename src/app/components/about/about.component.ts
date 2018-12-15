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
export class AboutComponent implements OnInit, OnDestroy {
    @HostBinding('class.about') hostClass = true;

    private nodeStatusSubscription: Subscription;
    public clientName: string;
    public applicationVersion: string;
    public fullNodeVersion: string;
    public network: string;
    public protocolVersion: number;
    public blockHeight: number;
    public dataDirectory: string;

    constructor(public appState: ApplicationStateService, private apiService: ApiService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {
        this.startSubscriptions();
    }

    ngOnDestroy() {
        this.cancelSubscriptions();
    }

    private startSubscriptions() {
        this.nodeStatusSubscription = this.apiService.getNodeStatusInterval()
            .subscribe(
                response => {
                    this.clientName = response.agent;
                    this.fullNodeVersion = response.version;
                    this.network = response.network;
                    this.protocolVersion = response.protocolVersion;
                    this.blockHeight = response.blockStoreHeight;
                    this.dataDirectory = response.dataDirectoryPath;
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }

    private cancelSubscriptions() {
        if (this.nodeStatusSubscription) {
            this.nodeStatusSubscription.unsubscribe();
        }
    }
}
