/* eslint-disable */

import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: '[appPasswordValidation]'
})
export class PasswordValidationDirective {
    constructor() { }

    static MatchPassword(AC: AbstractControl) {
        if (AC == null) {
            return;
        }

        const password = AC.get('accountPassword').value;
        const confirmPassword = AC.get('accountPasswordConfirmation').value;

        if (confirmPassword !== password) {
            AC.get('accountPasswordConfirmation').setErrors({ accountPasswordConfirmation: true });
        } else {
            AC.get('accountPasswordConfirmation').setErrors(null);
            return null;
        }
    }
}
