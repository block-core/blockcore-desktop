/* eslint-disable */

/*
The MIT License (MIT)

Copyright (c) 2013-2014 Cryptocoinjs contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/bitcoinjs/bip38

Commit: 890cd7b75815453e17f25ed4e7b2dc6e3d07c488
*/

const aes = require('browserify-aes');
const assert = require('assert');
// const Buff = require('safe-buffer').Buffer;
const bs58check = require('bs58check');
const createHash = require('create-hash');
const scrypt = require('scryptsy');
const xor = require('buffer-xor/inplace');

const ecurve = require('ecurve');
const curve = ecurve.getCurveByName('secp256k1');

// eslint-disable-next-line @typescript-eslint/naming-convention
const BigInteger = require('bigi');

// constants
const SCRYPT_PARAMS = {
    N: 16384, // specified by BIP38
    r: 8,
    p: 8
};

const NETWORK_PARAMS = {
    private: 0x80,
    public: 0x00
};

const NULL = Buffer.alloc(0);

function hash160(buffer: any) {
    let hash;
    try {
        hash = createHash('rmd160');
    } catch (e) {
        hash = createHash('ripemd160');
    }
    return hash.update(
        createHash('sha256').update(buffer).digest()
    ).digest();
}

function hash256(buffer: Buffer) {
    return createHash('sha256').update(
        createHash('sha256').update(buffer).digest()
    ).digest();
}

function getAddress(d, compressed, networkParams) {
    const Q = curve.G.multiply(d).getEncoded(compressed);
    const hash = hash160(Q);
    const payload = Buffer.allocUnsafe(21);
    // payload.writeUInt8(0x00, 0); // XXX TODO FIXME bitcoin only??? damn you BIP38
    payload.writeUInt8(networkParams.public, 0);
    hash.copy(payload, 1);

    return bs58check.encode(payload);
}

function prepareEncryptRaw(buffer, compressed, passphrase, scryptParams, networkParams) {
    if (buffer.length !== 32) { throw new Error('Invalid private key length'); }

    const d = BigInteger.fromBuffer(buffer);
    const address = getAddress(d, compressed, networkParams);
    const secret = Buffer.from(passphrase.normalize('NFC'), 'utf8');
    const salt = hash256(address).slice(0, 4);

    const N = scryptParams.N;
    const r = scryptParams.r;
    const p = scryptParams.p;

    return {
        secret,
        salt,
        N,
        r,
        p
    };
}

function finishEncryptRaw(buffer, compressed, salt, scryptBuf) {
    const derivedHalf1 = scryptBuf.slice(0, 32);
    const derivedHalf2 = scryptBuf.slice(32, 64);

    const xorBuf = xor(derivedHalf1, buffer);
    const cipher = aes.createCipheriv('aes-256-ecb', derivedHalf2, NULL);
    cipher.setAutoPadding(false);
    cipher.end(xorBuf);

    const cipherText = cipher.read();

    // 0x01 | 0x42 | flagByte | salt (4) | cipherText (32)
    const result = Buffer.allocUnsafe(7 + 32);
    result.writeUInt8(0x01, 0);
    result.writeUInt8(0x42, 1);
    result.writeUInt8(compressed ? 0xe0 : 0xc0, 2);
    salt.copy(result, 3);
    cipherText.copy(result, 7);

    return result;
}

export async function encryptRawAsync(buffer, compressed, passphrase, progressCallback, scryptParams, promiseInterval, networkParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    networkParams = networkParams || NETWORK_PARAMS;

    const {
        secret,
        salt,
        N,
        r,
        p
    } = prepareEncryptRaw(buffer, compressed, passphrase, scryptParams, networkParams);

    const scryptBuf = await scrypt.async(secret, salt, N, r, p, 64, progressCallback, promiseInterval);

    return finishEncryptRaw(buffer, compressed, salt, scryptBuf);
}

export function encryptRaw(buffer, compressed, passphrase, progressCallback, scryptParams, networkParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    networkParams = networkParams || NETWORK_PARAMS;

    const {
        secret,
        salt,
        N,
        r,
        p
    } = prepareEncryptRaw(buffer, compressed, passphrase, scryptParams, networkParams);

    const scryptBuf = scrypt(secret, salt, N, r, p, 64, progressCallback);

    return finishEncryptRaw(buffer, compressed, salt, scryptBuf);
}

export async function encryptAsync(buffer, compressed, passphrase, progressCallback, scryptParams, promiseInterval, networkParams) {
    return bs58check.encode(await encryptRawAsync(buffer, compressed, passphrase, progressCallback, scryptParams, promiseInterval, networkParams));
}

export function encrypt(buffer, compressed, passphrase, progressCallback, scryptParams, networkParams) {
    return bs58check.encode(encryptRaw(buffer, compressed, passphrase, progressCallback, scryptParams, networkParams));
}

function prepareDecryptRaw(buffer, progressCallback, scryptParams) {
    // 39 bytes: 2 bytes prefix, 37 bytes payload
    if (buffer.length !== 39) { throw new Error('Invalid BIP38 data length'); }
    if (buffer.readUInt8(0) !== 0x01) { throw new Error('Invalid BIP38 prefix'); }

    // check if BIP38 EC multiply
    const type = buffer.readUInt8(1);
    if (type === 0x43) { return { decryptEC: true }; }
    if (type !== 0x42) { throw new Error('Invalid BIP38 type'); }

    const flagByte = buffer.readUInt8(2);
    const compressed = flagByte === 0xe0;
    if (!compressed && flagByte !== 0xc0) { throw new Error('Invalid BIP38 compression flag'); }

    const N = scryptParams.N;
    const r = scryptParams.r;
    const p = scryptParams.p;

    const salt = buffer.slice(3, 7);
    return {
        salt,
        compressed,
        N,
        r,
        p
    };
}

function finishDecryptRaw(buffer, salt, compressed, scryptBuf, networkParams) {
    const derivedHalf1 = scryptBuf.slice(0, 32);
    const derivedHalf2 = scryptBuf.slice(32, 64);

    const privKeyBuf = buffer.slice(7, 7 + 32);
    const decipher = aes.createDecipheriv('aes-256-ecb', derivedHalf2, NULL);
    decipher.setAutoPadding(false);
    decipher.end(privKeyBuf);

    const plainText = decipher.read();
    const privateKey = xor(derivedHalf1, plainText);

    // verify salt matches address
    const d = BigInteger.fromBuffer(privateKey);
    const address = getAddress(d, compressed, networkParams);
    const checksum = hash256(address).slice(0, 4);

    // The underlaying buffer will be different, we only compare the initial 4 values.
    assert.strictEqual(true, salt.every((value, index) => value === checksum[index]));
    // assert.deepStrictEqual(salt, checksum);

    return {
        privateKey,
        compressed
    };
}

export async function decryptRawAsync(buffer, passphrase, progressCallback, scryptParams, promiseInterval, networkParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    networkParams = networkParams || NETWORK_PARAMS;

    const {
        salt,
        compressed,
        N,
        r,
        p,
        decryptEC
    } = prepareDecryptRaw(buffer, progressCallback, scryptParams);
    if (decryptEC === true) { return decryptECMultAsync(buffer, passphrase, progressCallback, scryptParams, promiseInterval); }

    const scryptBuf = await scrypt.async(passphrase.normalize('NFC'), salt, N, r, p, 64, progressCallback, promiseInterval);
    return finishDecryptRaw(buffer, salt, compressed, scryptBuf, networkParams);
}

// some of the techniques borrowed from: https://github.com/pointbiz/bitaddress.org
export function decryptRaw(buffer, passphrase, progressCallback, scryptParams, networkParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    networkParams = networkParams || NETWORK_PARAMS;
    const {
        salt,
        compressed,
        N,
        r,
        p,
        decryptEC
    } = prepareDecryptRaw(buffer, progressCallback, scryptParams);
    if (decryptEC === true) { return decryptECMult(buffer, passphrase, progressCallback, scryptParams); }
    const scryptBuf = scrypt(passphrase.normalize('NFC'), salt, N, r, p, 64, progressCallback);
    return finishDecryptRaw(buffer, salt, compressed, scryptBuf, networkParams);
}

export async function decryptAsync(text, passphrase, progressCallback, scryptParams, promiseInterval, networkParams) {
    return decryptRawAsync(bs58check.decode(text), passphrase, progressCallback, scryptParams, promiseInterval, networkParams);
}

export function decrypt(text, passphrase, progressCallback, scryptParams, networkParams) {
    return decryptRaw(bs58check.decode(text), passphrase, progressCallback, scryptParams, networkParams);
}

function prepareDecryptECMult(buffer, passphrase, progressCallback, scryptParams) {
    const flag = buffer.readUInt8(1);
    // eslint-disable-next-line no-bitwise
    const compressed = (flag & 0x20) !== 0;
    // eslint-disable-next-line no-bitwise
    const hasLotSeq = (flag & 0x04) !== 0;

    // eslint-disable-next-line no-bitwise
    assert.strictEqual((flag & 0x24), flag, 'Invalid private key.');

    const addressHash = buffer.slice(2, 6);
    const ownerEntropy = buffer.slice(6, 14);
    let ownerSalt;

    // 4 bytes ownerSalt if 4 bytes lot/sequence
    if (hasLotSeq) {
        ownerSalt = ownerEntropy.slice(0, 4);

        // else, 8 bytes ownerSalt
    } else {
        ownerSalt = ownerEntropy;
    }

    const encryptedPart1 = buffer.slice(14, 22); // First 8 bytes
    const encryptedPart2 = buffer.slice(22, 38); // 16 bytes

    const N = scryptParams.N;
    const r = scryptParams.r;
    const p = scryptParams.p;
    return {
        addressHash,
        encryptedPart1,
        encryptedPart2,
        ownerEntropy,
        ownerSalt,
        hasLotSeq,
        compressed,
        N,
        r,
        p
    };
}

function getPassIntAndPoint(preFactor, ownerEntropy, hasLotSeq) {
    let passFactor;
    if (hasLotSeq) {
        const hashTarget = Buffer.concat([preFactor, ownerEntropy]);
        passFactor = hash256(hashTarget);
    } else {
        passFactor = preFactor;
    }
    const passInt = BigInteger.fromBuffer(passFactor);
    return {
        passInt,
        passPoint: curve.G.multiply(passInt).getEncoded(true)
    };
}

function finishDecryptECMult(seedBPass, encryptedPart1, encryptedPart2, passInt, compressed) {
    const derivedHalf1 = seedBPass.slice(0, 32);
    const derivedHalf2 = seedBPass.slice(32, 64);

    const decipher = aes.createDecipheriv('aes-256-ecb', derivedHalf2, Buffer.alloc(0));
    decipher.setAutoPadding(false);
    decipher.end(encryptedPart2);

    const decryptedPart2 = decipher.read();
    const tmp = xor(decryptedPart2, derivedHalf1.slice(16, 32));
    const seedBPart2 = tmp.slice(8, 16);

    const decipher2 = aes.createDecipheriv('aes-256-ecb', derivedHalf2, Buffer.alloc(0));
    decipher2.setAutoPadding(false);
    decipher2.write(encryptedPart1); // first 8 bytes
    decipher2.end(tmp.slice(0, 8)); // last 8 bytes

    const seedBPart1 = xor(decipher2.read(), derivedHalf1.slice(0, 16));
    const seedB = Buffer.concat([seedBPart1, seedBPart2], 24);
    const factorB = BigInteger.fromBuffer(hash256(seedB));

    // d = passFactor * factorB (mod n)
    const d = passInt.multiply(factorB).mod(curve.n);

    return {
        privateKey: d.toBuffer(32),
        compressed
    };
}

export async function decryptECMultAsync(buffer, passphrase, progressCallback, scryptParams, promiseInterval) {
    buffer = buffer.slice(1); // FIXME: we can avoid this
    passphrase = Buffer.from(passphrase.normalize('NFC'), 'utf8');
    scryptParams = scryptParams || SCRYPT_PARAMS;
    const {
        addressHash,
        encryptedPart1,
        encryptedPart2,
        ownerEntropy,
        ownerSalt,
        hasLotSeq,
        compressed,
        N,
        r,
        p
    } = prepareDecryptECMult(buffer, passphrase, progressCallback, scryptParams);

    const preFactor = await scrypt.async(passphrase, ownerSalt, N, r, p, 32, progressCallback, promiseInterval);

    const {
        passInt,
        passPoint
    } = getPassIntAndPoint(preFactor, ownerEntropy, hasLotSeq);

    const seedBPass = await scrypt.async(passPoint, Buffer.concat([addressHash, ownerEntropy]), 1024, 1, 1, 64, undefined, promiseInterval);

    return finishDecryptECMult(seedBPass, encryptedPart1, encryptedPart2, passInt, compressed);
}

export function decryptECMult(buffer, passphrase, progressCallback, scryptParams) {
    buffer = buffer.slice(1); // FIXME: we can avoid this
    passphrase = Buffer.from(passphrase.normalize('NFC'), 'utf8');
    scryptParams = scryptParams || SCRYPT_PARAMS;
    const {
        addressHash,
        encryptedPart1,
        encryptedPart2,
        ownerEntropy,
        ownerSalt,
        hasLotSeq,
        compressed,
        N,
        r,
        p
    } = prepareDecryptECMult(buffer, passphrase, progressCallback, scryptParams);
    const preFactor = scrypt(passphrase, ownerSalt, N, r, p, 32, progressCallback);

    const {
        passInt,
        passPoint
    } = getPassIntAndPoint(preFactor, ownerEntropy, hasLotSeq);

    const seedBPass = scrypt(passPoint, Buffer.concat([addressHash, ownerEntropy]), 1024, 1, 1, 64);

    return finishDecryptECMult(seedBPass, encryptedPart1, encryptedPart2, passInt, compressed);
}

export function verify(text) {
    const decoded = bs58check.decodeUnsafe(text);
    if (!decoded) { return false; }

    if (decoded.length !== 39) { return false; }
    if (decoded.readUInt8(0) !== 0x01) { return false; }

    const type = decoded.readUInt8(1);
    const flag = decoded.readUInt8(2);

    // encrypted WIF
    if (type === 0x42) {
        if (flag !== 0xc0 && flag !== 0xe0) { return false; }

        // EC mult
    } else if (type === 0x43) {
        // eslint-disable-next-line no-bitwise
        if ((flag & ~0x24)) { return false; }
    } else {
        return false;
    }

    return true;
}

// module.exports = {
//     decrypt,
//     decryptECMult,
//     decryptRaw,
//     encrypt,
//     encryptRaw,
//     decryptAsync,
//     decryptECMultAsync,
//     decryptRawAsync,
//     encryptAsync,
//     encryptRawAsync,
//     verify
// };
