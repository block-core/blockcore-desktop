import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppSharedModule } from '../../shared/app-shared.module';
import { HttpClientModule } from '@angular/common/http';
import { HistoryComponent } from './history.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockHistoryComponent } from './block/block.component';
import { TransactionHistoryComponent } from './transaction/transaction.component';
import { HistoryRoutingModule } from './history-routing.module';

@NgModule({
    imports: [
        HttpClientModule,
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        AppSharedModule,
        MaterialModule,
        HistoryRoutingModule
    ],
    declarations: [
        HistoryComponent,
        BlockHistoryComponent,
        TransactionHistoryComponent
    ],
    exports: [
        HistoryComponent,
        BlockHistoryComponent,
        TransactionHistoryComponent
    ],
})
export class HistoryModule {
}
