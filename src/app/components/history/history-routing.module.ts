import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryComponent } from './history.component';
import { BlockHistoryComponent } from './block/block.component';
import { TransactionHistoryComponent } from './transaction/transaction.component';

const routes: Routes = [
  {
    path: '',
    component: HistoryComponent,
    data: {
      title: 'History'
    }
  },
  {
    path: 'block/:id',
    component: BlockHistoryComponent,
    data: {
      title: 'Block',
      prefix: 'History'
  },
  },
  {
    path: 'transaction/:id',
    component: TransactionHistoryComponent,
    data: {
      title: 'Transaction',
      prefix: 'History'
  },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HistoryRoutingModule { }
