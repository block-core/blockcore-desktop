import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Pipe({
    name: 'coinNotation'
})
export class CoinNotationPipe implements PipeTransform {
    private coinUnit: string | undefined;
    // private coinNotation: number;

    constructor(private globalService: GlobalService) {
        this.setCoinUnit();
    }

    transform(value: number): string {
      return this.globalService.transform(value);
    }

    getCoinUnit() {
        return this.coinUnit;
    }

    setCoinUnit() {
        this.coinUnit = this.globalService.getCoinUnit();
    }
}
