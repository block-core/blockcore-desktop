import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'priceUnit'
})
export class PriceUnitPipe implements PipeTransform {

    private units = ['', 'K', 'M', 'B'];

    transform(value: number, precision: number = 2): string {
        if (isNaN(parseFloat(String(value))) || !isFinite(value)) { return '?'; }

        let unit = 0;

        while (value >= 1000) {
            value /= 1000;
            unit++;
        }

        if ((value.toFixed === undefined)) {
            value = parseFloat(String(value));
        }

        return (value.toFixed(+precision) + '' + this.units[unit]);
    }
}


