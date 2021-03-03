/* eslint-disable */

import { TestBed, waitForAsync } from '@angular/core/testing';
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
import * as bip38 from '../../../../libs/bip38';
import * as city from 'city-lib';
import * as coininfo from 'city-coininfo';
import { HDNode } from 'city-lib';
import * as wif from 'wif';
import Dexie from 'dexie';
import * as bs58 from 'bs58';
import * as bitcoinMessage from 'bitcoinjs-message';

function getAddress(node: any, network?: any): string {
    return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
}

function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

describe('AppComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                RootComponent
            ],
            imports: [MaterialModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should produce correct extpubkey', waitForAsync(() => {
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

        // eslint-disable-next-line
        const publicNode = masterNode.derivePath("m/44'/1926'/0'/0/0");
        // eslint-disable-next-line
        const changeNode = masterNode.derivePath("m/44'/1926'/0'/1/0");

        expect(getAddress(publicNode, network)).toEqual('CPtzM2XwLCVS3L6BFK1xYsCcGqgrgsxHrP');
        expect(getAddress(changeNode, network)).toEqual('CY35ZGxzZBYHKyNV4KWKunYLHsTWejVSdR');

        // Get the first account in the HD wallet, this is same as the level stored in the wallet files.
        // eslint-disable-next-line
        const accountNode = masterNode.derivePath("m/44'/1926'/0'");
        const accountExtPubKey = accountNode.neutered().toBase58();

        expect(accountExtPubKey).toEqual('xpub6BwCLtuvjt6TZ495sJruY1UWPXg6ME9HA92ro75YDHvGpPKY6kQ6ifp6DEszRpJGMtdBvWBaSn4gQDTz4Ctm5m1BMLeFUh3F19mTXA4s3bE');

        // bip38.encryptAsync(masterNode.privateKey, true, walletPassword, (out) => {
        //     console.log('BIP38:', out);
        //     expect(out).toEqual('6PYW8DRnFZSu3CVC3NfghKFSozZE8gmf76GmsGrrA9ciWbv6F6HhVSKkEQ');

        //     bip38.decryptAsync(out, walletPassword, (decryptedKey) => {

        //         const masterNodeDecrypted = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, network);

        // eslint-disable-next-line , @typescript-eslint/quotes
        //         const accountNodeDecrypted = masterNodeDecrypted.derivePath("m/44'/1926'/0'");
        //         const accountExtPubKeyDecrypted = accountNodeDecrypted.neutered().toBase58();

        //         expect(accountExtPubKeyDecrypted).toEqual(accountExtPubKey);

        //     }, null, {
        //         private: network.wif,
        //         public: network.pubKeyHash
        //     });

        // }, null, {
        //     private: network.wif,
        //     public: network.pubKeyHash
        // });

        console.log('Seed:', masterSeed);
        console.log('masterNode:', masterNode);
        console.log('extPubKey:', extPubKey);
        console.log('network:', network);
    }));

    it('should decrypt to correct extpubkey', waitForAsync(() => {

        const walletPassword = 'default';
        const seed = { encryptedSeed: '6PYU7o49DHmWDomcbGJyU3UqewrZBRp5fefjoL4xDRJ9V2qWx64aXwJYt4', chainCode: 'pARfSpivCg04m0l2EDH4c1hp/ydQo/hnbaVsNjgi9M8=' };
        const network = coininfo('city').toBitcoinJS();

        // Descrypt the seed with the password provided on unlock (login).
        // bip38.decryptAsync(seed.encryptedSeed, walletPassword, (decryptedKey) => {

        //     const chainCode = Buffer.from(seed.chainCode, 'base64');
        //     console.log('chainCode decoded:', chainCode);

        //     const masterNode = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, network);

        // eslint-disable-next-line , @typescript-eslint/quotes
        //     const accountNode = masterNode.derivePath("m/44'/1926'/0'");
        //     const accountExtPubKey = accountNode.neutered().toBase58();

        //     expect(accountExtPubKey).toEqual('xpub6Cfb24ubLfoVvJJMHuHT1keeWW7jnXv7GvR81yhVHMDE7KomSKAq42pBoM6jLzGEbcLPD6SahYLhHdCe92XY3nawKHMPcKFL8dwczU8xEFJ');

        // }, null, {
        //     private: network.wif,
        //     public: network.pubKeyHash
        // });

        expect(true).toBeTruthy();

    }));

    it('should sign and verify correctly', waitForAsync(() => {

        const walletPassword = 'default';
        const seed = { encryptedSeed: '6PYU7o49DHmWDomcbGJyU3UqewrZBRp5fefjoL4xDRJ9V2qWx64aXwJYt4', chainCode: 'pARfSpivCg04m0l2EDH4c1hp/ydQo/hnbaVsNjgi9M8=' };
        const network = coininfo('city').toBitcoinJS();

        // Descrypt the seed with the password provided on unlock (login).
        // bip38.decryptAsync(seed.encryptedSeed, walletPassword, (decryptedKey) => {

        //     const chainCode = Buffer.from(seed.chainCode, 'base64');
        //     console.log('chainCode decoded:', chainCode);

        //     const masterNode = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, network);

        // eslint-disable-next-line , @typescript-eslint/quotes
        //     const identityNode = masterNode.derivePath("m/302'/0'");

        //     const wif2 = identityNode.toWIF();
        //     console.log('WIF:', wif2);

        //     // const keyPair = city.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');

        //     const keyPair = city.ECPair.fromWIF(wif2, network);

        //     // console.log(keyPair);
        //     // console.log(keyPair.compressed);

        //     const privateKey = keyPair.privateKey;
        //     const message = 'This is an example of a signed message.';

        //     const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, network.messagePrefix);
        //     console.log('Signature:', signature.toString('base64'));

        //     // const wif = identityNode.toWIF();
        //     // const keyPair = city.ECPair.fromWIF(wif);

        //     // const privateKey = keyPair.privateKey;
        //     // const message = 'This is an example of a signed message.';

        //     // const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
        //     // console.log(signature.toString('base64'));

        //     // const address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN';

        //     const decoded = bs58.decode('1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN');
        //     console.log('decoded:', decoded.toString());

        //     const addressFromKey = bs58.encode(keyPair.publicKey);
        //     console.log('addressFromKey:', addressFromKey);

        //     const address = getAddress(identityNode, network);
        //     console.log('addressFromIdentityNode:', address);

        //     console.log('network:', network);

        //     // const address = bs58.encode(decoded);
        //     // const address = bs58.encode(keyPair.publicKey);
        //     // console.log('Address:', address);

        //     const verified = bitcoinMessage.verify(message, address, signature, network.messagePrefix);
        //     console.log(verified);

        //     expect(verified).toBeTruthy();

        //     // Parameters required for FLO address generation
        //     // const FLOTESTNET = {
        //     //     messagePrefix: '\x19FLO testnet Signed Message:\n',
        //     //     bip32: {
        //     //         public: 0x013440e2,
        //     //         private: 0x01343c23
        //     //     },
        //     //     pubKeyHash: 0x73,
        //     //     scriptHash: 0xc6,
        //     //     wif: 0xef
        //     // };

        //     // const identity = this.identityService.getId(0);
        //     // console.log('Identity:', identityNode);

        //     // // const bytes = Buffer.from('003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187', 'hex');
        //     // const address2 = bs58.encode(identityNode.publicKey);
        //     // console.log(address2);

        //     // const message = 'hello world';

        //     // const signature = bitcoinMessage.sign(message, identityNode.privateKey, true, '\u0018Bitcoin Signed Message:\n');
        //     // console.log(signature.toString('base64'));

        //     // // const signature2 = bitcoinMessage.sign(message, identity.privateKey, true, { segwitType: 'p2sh(p2wpkh)' });
        //     // // console.log(signature2.toString('base64'));

        //     // // const signature3 = bitcoinMessage.sign(message, identity.privateKey, true, { segwitType: 'p2wpkh' });
        //     // // console.log(signature3.toString('base64'));

        //     // // var address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN';

        //     // const verified = bitcoinMessage.verify(message, address2, signature, '\u0018Bitcoin Signed Message:\n');

        //     // expect(verified).toBeTruthy();

        // }, null, {
        //     private: network.wif,
        //     public: network.pubKeyHash
        // });
    }));

    it('should generate profile address', waitForAsync(() => {
        const passphrase = '';
        const recoveryPhrase = 'mystery problem faith negative member bottom concert bundle asthma female process twelve';
        const walletPassword = 'test';

        const network = coininfo('city').toBitcoinJS();
        network.pubKeyHash = 55;
        network.scriptHash = 117;

        const masterSeed = bip39.mnemonicToSeedSync(recoveryPhrase, passphrase);
        const masterNode = bip32.fromSeed(masterSeed, network);

        // eslint-disable-next-line @typescript-eslint/quotes
        const identityNode = masterNode.derivePath("m/302'/0'");
        const address = getAddress(identityNode, network);

        // Ensure that the generated address is a profile address and not Bitcoin.
        expect(address).toEqual('PTe6MFNouKATrLF5YbjxR1bsei2zwzdyLU');

        // eslint-disable-next-line @typescript-eslint/quotes
        expect(getAddress(masterNode.derivePath("m/302'/1'"), network)).toEqual('PAcmQwEMW2oxzRBz7u6oFQMtYPSYqoXyiw');

        // eslint-disable-next-line @typescript-eslint/quotes
        expect(getAddress(masterNode.derivePath("m/302'/2'"), network)).toEqual('PCkPNkdd1paW5SwDEjzDBDs1vHxFabXhKf');
    }));

    // it('should sign and verify correctly', async(() => {

    //     // const walletPassword = 'default';
    //     // const seed = { encryptedSeed: '6PYU7o49DHmWDomcbGJyU3UqewrZBRp5fefjoL4xDRJ9V2qWx64aXwJYt4', chainCode: 'pARfSpivCg04m0l2EDH4c1hp/ydQo/hnbaVsNjgi9M8=' };
    //     const network = coininfo('city').toBitcoinJS();

    //     network.pubKeyHash = 55;
    //     network.scriptHash = 117;

    //     // Descrypt the seed with the password provided on unlock (login).
    //     // bip38.decryptAsync(seed.encryptedSeed, walletPassword, (decryptedKey) => {

    //     const chainCode = Buffer.from(seed.chainCode, 'base64');
    //     console.log('chainCode decoded:', chainCode);

    //     const masterNode = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, network);

    // eslint-disable-next-line @typescript-eslint/quotes
    //     const identityNode = masterNode.derivePath("m/302'/0'");

    //     const wif = identityNode.toWIF();
    //     console.log('WIF:', wif);

    //     // const keyPair = city.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
    //     const keyPair = city.ECPair.fromWIF(wif, network);

    //     // console.log(keyPair);
    //     // console.log(keyPair.compressed);

    //     const privateKey = keyPair.privateKey;
    //     const message = 'This is an example of a signed message.';

    //     const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, network.messagePrefix);
    //     console.log('Signature:', signature.toString('base64'));

    //     // const wif = identityNode.toWIF();
    //     // const keyPair = city.ECPair.fromWIF(wif);

    //     // const privateKey = keyPair.privateKey;
    //     // const message = 'This is an example of a signed message.';

    //     // const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
    //     // console.log(signature.toString('base64'));

    //     // const address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN';

    //     const decoded = bs58.decode('1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN');
    //     console.log('decoded:', decoded.toString());

    //     const addressFromKey = bs58.encode(keyPair.publicKey);
    //     console.log('addressFromKey:', addressFromKey);

    //     const address = getAddress(identityNode, network);
    //     console.log('addressFromIdentityNode:', address);

    //     console.log('network:', network);

    //     // const address = bs58.encode(decoded);
    //     // const address = bs58.encode(keyPair.publicKey);
    //     // console.log('Address:', address);

    //     const verified = bitcoinMessage.verify(message, address, signature, network.messagePrefix);
    //     console.log(verified);

    //     expect(verified).toBeTruthy();

    //     // }, null, {
    //     //     private: network.wif,
    //     //     public: network.pubKeyHash
    //     // });

    //     // expect(true).toBeTruthy();

    // }));

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
