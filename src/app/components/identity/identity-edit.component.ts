import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Link } from '@models/link';
import { LinkAddComponent } from './link-add.component';
import { MatDialog } from '@angular/material/dialog';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-edit',
    templateUrl: './identity-edit.component.html',
    styleUrls: ['./identity-edit.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityEditComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity-edit') hostClass = true;

    identity: Identity;
    originalIdentity: Identity;
    form: FormGroup;
    apiError: string;
    image: any;
    publishWarning = false;

    private subscription: any;

    // tslint:disable-next-line:member-ordering
    formErrors = {
        name: '',
        shortname: '',
        alias: '',
        title: '',
        email: '',
        address: '',
        amount: '',
        fee: '',
        password: '',
        restorekey: ''
    };

    // tslint:disable-next-line:member-ordering
    validationMessages = {
        name: {
            required: 'A name is required.',
            minlength: 'A name is at least 1 characters long.',
            maxlength: 'A name is at maximum 250 characters long.'
        },
        shortname: {
            required: 'A short name is required.',
            minlength: 'A short name is at least 1 characters long.',
            maxlength: 'A short name is at maximum 30 characters long.'
        },
        address: {
            required: 'An address is required.',
            minlength: 'An address is at least 26 characters long.'
        },
        email: {
            email: 'Invalid e-mail address.'
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
        },
        restorekey: {
            pattern: 'The restore key must be valid public key.'
        }
    };

    constructor(
        private appState: ApplicationStateService,
        private identityService: IdentityService,
        private profileImageService: ProfileImageService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        public dialog: MatDialog,
        public router: Router) {
        this.appState.pageMode = false;

    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        console.log('ID:', id);

        if (id === 'create') {
            this.identity = this.identityService.create();
            this.originalIdentity = this.identity;
            this.image = this.profileImageService.getImage(this.identity.id);
        } else {
            // Make sure we only edit a copy of the identity.
            this.originalIdentity = this.identityService.get(id);
            this.identity = this.jsonCopy(this.originalIdentity);

            if (!this.identity.links) {
                this.identity.links = [];
            }

            this.image = this.profileImageService.getImage(this.identity.id);
        }

        this.buildSendForm();
    }

    private buildSendForm(): void {
        this.form = this.fb.group({
            name: [this.identity.name, Validators.compose([Validators.maxLength(250)])],
            shortname: [this.identity.shortname, Validators.compose([Validators.maxLength(30)])],
            alias: [this.identity.alias],
            title: [this.identity.title],
            published: [this.identity.published],
            email: [this.identity.email, Validators.compose([Validators.email])],
            // amount: ['', Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((2 - 3) / 100000000)(control)])],
            restorekey: [this.identity.restorekey]
        });

        this.form.valueChanges.pipe(debounceTime(300))
            .subscribe(data => this.onValueChanged(data));
    }

    get formName(): any { return this.form.get('name').value; }
    get formShortName(): any { return this.form.get('shortname').value; }
    get formAlias(): any { return this.form.get('alias').value; }
    get formTitle(): any { return this.form.get('title').value; }
    get formPublished(): any { return this.form.get('published').value; }

    async addLink() {
        const dialogRef = this.dialog.open(LinkAddComponent, {
            width: '440px',
            data: { url: '', type: '' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);

            if (result) {
                console.log('RESULT:', result);
                this.identity.links.push(result);
                // this.hubService.add(result).then(data => {
                //     // Update the local list of hubs with the one persisted in settings.
                //     this.hubs = this.settings.hubs;
                //     this.cd.markForCheck();
                // });
            }
        });
    }

    onChanged(event) {
        if (this.originalIdentity.published && !this.formPublished) {
            this.publishWarning = true;
        } else {
            this.publishWarning = false;

        }
    }

    save() {
        // Save the image.
        // TODO: Make sure we check if image is actually changed, if not, then don't save it.
        this.profileImageService.setImage(this.identity.id, this.image);

        // tslint:disable-next-line:forin
        for (const field in this.form.controls) {
            // Copy all input fields onto our identity.
            this.identity[field] = this.form.get(field).value;
        }

        console.log(this.identity);

        this.identityService.add(this.identity);
        this.router.navigateByUrl('/identity');
    }

    jsonCopy(src) {
        return JSON.parse(JSON.stringify(src));
    }

    removeLink(link: Link) {
        const index = this.identity.links.findIndex(l => l === link);
        this.identity.links.splice(index, 1);
        // console.log('Trying to remove:' + id);
        // this.hubService.remove(id);
        // this.hubs = this.settings.hubs;
        // this.cd.markForCheck();
    }

    imageUpdated(event: ImageCroppedEvent) {
        this.image = event.base64;
        console.log(event);
    }

    onValueChanged(data?: any) {
        if (!this.form) { return; }

        // tslint:disable-next-line:forin
        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = this.form.get(field);
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

    send() {
        // this.isSending = true;

        // this.showInputField = false;
        // this.showConfirmationField = false;
        // this.showSendingField = true;

        // this.buildTransaction();
    }

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }

    back() {
        this.location.back();
    }
}
