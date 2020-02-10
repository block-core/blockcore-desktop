import { TestBed, async } from '@angular/core/testing';
import { RootComponent } from '../../root/root.component';
import { CreateAccountComponent } from './create.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { Component, ViewEncapsulation, HostBinding, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletCreation } from '../../../classes/wallet-creation';
import { Logger } from '../../../services/logger.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bip38 from 'city-bip38';
import * as city from 'city-lib';
import * as coininfo from 'city-coininfo';
import { HDNode } from 'city-lib';
import * as wif from 'wif';
import Dexie from 'dexie';
import { StorageService } from 'src/app/services/storage.service';

function getAddress(node: any, network?: any): string {
    return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
}

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RootComponent
            ],
            imports: [MaterialModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should produce correct extpubkey', async(() => {
        // This test is a replicate of 'ShouldProduceCorrectExtPubKey' test in C# (City Chain)
        const passphrase = '';
        const recoveryPhrase = 'mystery problem faith negative member bottom concert bundle asthma female process twelve';
        const walletPassword = 'test';

        const network = coininfo('city').toBitcoinJS();
        const chainCode = Buffer.from([166, 209, 155, 88, 182, 124, 193, 127, 139, 220, 152, 1, 213, 145, 245, 80, 118, 188, 53, 211, 33, 37, 158, 40, 118, 207, 42, 83, 219, 233, 188, 161]);

        // 64 byte seed, this value is same as the constructor seed when calling in C#: ExtKey masterNode = HdOperations.GetExtendedKey(recoveryPhrase, passphrase);
        const masterSeed = bip39.mnemonicToSeedSync(recoveryPhrase, passphrase);

        // Since the call in C# returns a prepared extended key based on the seed above, we must call bip32 to get our extended key:
        const masterNode = bip32.fromSeed(masterSeed, network);
        const extPubKey = masterNode.neutered();

        // masterSeed in C# and JavaScript should both have the same chaincode at this step, verify:
        expect(masterNode.chainCode).toEqual(chainCode);
        expect(masterNode.chainCode).toEqual(chainCode);

        // Get the private key in WIF format and verify.
        const xprv = masterNode.toBase58();
        expect(xprv).toEqual('xprv9s21ZrQH143K3ignAgXxaBbyVbrCTuUJSHNrMwdTa7n4i1zpFsiWdRCerTWrKaZXVehZFbXcFtwnmndrzC1AVs1BueiycVSxXjMyhXHpBqx');

        // Get the public key in WIF format and verify.
        const xpub = extPubKey.toBase58();
        expect(xpub).toEqual('xpub661MyMwAqRbcGCmFGi4xwKYi3dggsNC9oWJTAL358TK3apKxoR2mBDX8hkD1cUePJyzkkNWffsfZEzkExFXN1sNfJoVw161LfQyCuNVDadK');

        // Get the "root" address.
        const address = getAddress(masterNode, network);

        // Ensure that the generated address is a City Chain address and not Bitcoin.
        expect(address).toEqual('CQtq75vu4bAceku6FmenWBh35i1Y4oskdu');

        // tslint:disable-next-line
        const publicNode = masterNode.derivePath("m/44'/1926'/0'/0/0");
        // tslint:disable-next-line
        const changeNode = masterNode.derivePath("m/44'/1926'/0'/1/0");

        expect(getAddress(publicNode, network)).toEqual('CPtzM2XwLCVS3L6BFK1xYsCcGqgrgsxHrP');
        expect(getAddress(changeNode, network)).toEqual('CY35ZGxzZBYHKyNV4KWKunYLHsTWejVSdR');

        // Get the first account in the HD wallet, this is same as the level stored in the wallet files.
        // tslint:disable-next-line
        const accountNode = masterNode.derivePath("m/44'/1926'/0'");
        const accountExtPubKey = accountNode.neutered().toBase58();

        expect(accountExtPubKey).toEqual('xpub6BwCLtuvjt6TZ495sJruY1UWPXg6ME9HA92ro75YDHvGpPKY6kQ6ifp6DEszRpJGMtdBvWBaSn4gQDTz4Ctm5m1BMLeFUh3F19mTXA4s3bE');

        bip38.encryptAsync(masterNode.privateKey, true, walletPassword, (out) => {
            console.log('BIP38:', out);
            expect(out).toEqual('6PYW8DRnFZSu3CVC3NfghKFSozZE8gmf76GmsGrrA9ciWbv6F6HhVSKkEQ');

        }, null, {
            private: network.wif,
            public: network.pubKeyHash
        });

        console.log('Seed:', masterSeed);
        console.log('masterNode:', masterNode);
        console.log('extPubKey:', extPubKey);
        console.log('network:', network);
    }));

    // it('should create the create component', async(() => {
    //     const fixture = TestBed.createComponent(CreateAccountComponent);
    //     const app = fixture.debugElement.componentInstance;
    //     expect(app).toBeTruthy();
    // }));

    //   it('should create the app', async(() => {
    //     const fixture = TestBed.createComponent(RootComponent);
    //     const app = fixture.debugElement.componentInstance;
    //     expect(app).toBeTruthy();
    //   }));
    //   it(`should have as title 'app'`, async(() => {
    //     const fixture = TestBed.createComponent(RootComponent);
    //     const app = fixture.debugElement.componentInstance;
    //     expect(app.title).toEqual('app');
    //   }));
    //   it('should render title in a h1 tag', async(() => {
    //     const fixture = TestBed.createComponent(RootComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.debugElement.nativeElement;
    //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to city-hub!');
    //   }));
});
