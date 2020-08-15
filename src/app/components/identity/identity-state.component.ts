import { Component, NgModule, VERSION, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-identity-state',
    template: `
    <span>{{stateText}}</span>
  `,
})
export class IdentityStateComponent implements OnInit {

    @Input()
    state: number;
    stateText: string;

    constructor() {

    }
    ngOnInit(): void {
        if (this.state === 999) {
            this.stateText = 'Deleted';
        }
        else {
            this.stateText = 'Active';
        }
    }
}
