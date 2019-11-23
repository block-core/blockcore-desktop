import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Pipe({
    name: 'coinNotation'
})
export class CoinNotationPipe implements PipeTransform {
    constructor(private globalService: GlobalService) {
        this.setCoinUnit();
    }

    private coinUnit: string;
    // private coinNotation: number;

    transform(value: number): number {
      return this.globalService.transform(value);
    }

    getCoinUnit() {
        return this.coinUnit;
    }

    setCoinUnit() {
        this.coinUnit = this.globalService.getCoinUnit();
    }
}
