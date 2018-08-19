import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryComponent } from './history.component';
import { BlockHistoryComponent } from './block/block.component';
import { TransactionHistoryComponent } from './transaction/transaction.component';
import { AuthenticatedUserGuard } from '../../modules/authentication/guards/authenticated-user.guard';

const routes: Routes = [
  {
    path: '',
    component: HistoryComponent,
    canActivate: [AuthenticatedUserGuard],
    data: {
      title: 'History'
    }
  },
  {
    path: 'block/:id',
    component: BlockHistoryComponent,
    canActivate: [AuthenticatedUserGuard],
    data: {
      title: 'Block',
      prefix: 'History'
  },
  },
  {
    path: 'transaction/:id',
    component: TransactionHistoryComponent,
    canActivate: [AuthenticatedUserGuard],
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
