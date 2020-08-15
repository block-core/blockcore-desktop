import { Pipe, PipeTransform } from '@angular/core';
import { IdentityContainer } from '@models/identity';

@Pipe({
    name: 'filterIdentity',
    pure: false
})
export class IdentityFilterPipe implements PipeTransform {
    transform(items: IdentityContainer[], filter, deleted: boolean): IdentityContainer | any {
        let filteredItems = filter ? items.filter(item => item.content.name !== null && item.content.name?.indexOf(filter) !== -1) : items;

        if (!deleted) {
            filteredItems = filteredItems.filter(item => item.content['@state'] !== 999);
        }

        return filteredItems;
    }
}
