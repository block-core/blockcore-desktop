import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
    selector: 'app-identity-edit',
    templateUrl: './identity-edit.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityEditComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity') hostClass = true;

    public identity: Identity;
    public sendForm: FormGroup;
    public apiError: string;
    private subscription: any;
    public image: any;

    // tslint:disable-next-line:member-ordering
    formErrors = {
        address: '',
        amount: '',
        fee: '',
        password: ''
    };

    // tslint:disable-next-line:member-ordering
    validationMessages = {
        address: {
            required: 'An address is required.',
            minlength: 'An address is at least 26 characters long.'
        },
        amount: {
            required: 'An amount is required.',
            pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
            min: 'The amount has to be more or equal to 0.00001 City.',
            max: 'The total transaction amount exceeds your available balance.'
        },
        fee: {
            required: 'A fee is required.'
        },
        password: {
            required: 'Your password is required.'
        }
    };

    constructor(
        private appState: ApplicationStateService,
        private identityService: IdentityService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        public router: Router) {
        this.appState.pageMode = false;

        this.buildSendForm();

    }

    private buildSendForm(): void {
        this.sendForm = this.fb.group({
            name: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.minLength(250)])],
            shortname: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.minLength(30)])],
            address: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
            amount: ['', Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((2 - 3) / 100000000)(control)])],
            fee: ['medium', Validators.required],
            password: ['', Validators.required]
        });

        this.sendForm.valueChanges.pipe(debounceTime(300))
            .subscribe(data => this.onValueChanged(data));
    }

    imageUpdated(event: ImageCroppedEvent) {
        this.image = event.base64;
        console.log(event);
    }

    onValueChanged(data?: any) {
        if (!this.sendForm) { return; }
        const form = this.sendForm;

        // tslint:disable-next-line:forin
        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];

                // tslint:disable-next-line:forin
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }

        this.apiError = '';

        // if (this.sendForm.get('address').valid && this.sendForm.get('amount').valid) {
        //     this.estimateFee();
        // }
    }

    public send() {
        // this.isSending = true;

        // this.showInputField = false;
        // this.showConfirmationField = false;
        // this.showSendingField = true;

        // this.buildTransaction();
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        console.log('ID:', id);
        this.identity = this.identityService.get(id);

        // this.subscription = this.identityService.identity$.subscribe(identity => this.identity = identity);

        // Change to this if user can navigate to different identity without going back to list!
        // this.hero$ = this.route.paramMap.pipe(
        //     switchMap((params: ParamMap) =>
        //         this.service.getHero(params.get('id')))
        // );
    }

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }

    back() {
        this.location.back();
    }
}
