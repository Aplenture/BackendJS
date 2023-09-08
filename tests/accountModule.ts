/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as BackendJS from "../src";
import * as CoreJS from 'corejs';
import { expect } from "chai";

const args = {
    debug: true
};

const config = {
    name: "test",
    databaseConfig: {
        host: "localhost",
        user: "dev",
        password: "",
        database: "test"
    }
};

const m = new BackendJS.Account.Module(args, config);
const log = BackendJS.Log.Log.createFileLog('./test.account.log', true);

m.onMessage.on(message => log.write(message));

describe("Account Module", () => {
    const seed = CoreJS.randomPassword(6);
    const privateKey = CoreJS.EC.createPrivateKey(seed);
    const publickey = CoreJS.EC.secp256k1
        .createPublicKey(privateKey)
        .toString();

    describe("Initialization", () => {
        it("initializes", () => m.init());
        it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    });

    describe("Account creation", () => {
        it("creates account with random password and no access", async () => {
            const username = 'rdm_pw_no_acc';
            const result = await m.execute('CreateAccount', { username }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [username]);

            expect(accounts).has.length(1);
            expect(accounts[0].username).equals(username, 'account username');

            expect(await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`account\`=?`, [accounts[0].id])).is.empty;
        });

        it("creates account with random password and access", async () => {
            const username = 'rdm_pw_acc';
            const result = await m.execute('CreateAccount', {
                username,
                create_access: true
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'account', 'secret']);
            expect(access.id).equals(1, 'access id');
            expect(access.account).equals(2, 'access account id');

            const accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [username]);

            expect(accounts).has.length(1);
            expect(accounts[0].username).equals(username, 'account username');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`account\`=?`, [accounts[0].id]);

            expect(accesses).has.length(1);
            expect(accesses[0].account).equals(access.account, 'access account');
            expect(accesses[0].secret).equals(access.secret, 'access secret');
        });

        it("creates account with password", async () => {
            const username = 'with_pw';
            const password = 'hello world';
            const publicKey = CoreJS.EC.secp256k1
                .createPublicKey(CoreJS.EC.createPrivateKey(password))
                .toString();

            const result = await m.execute('CreateAccount', {
                username,
                password
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [username]);

            expect(accounts).has.length(1);
            expect(accounts[0]).contains.keys(['username', 'key']);
            expect(accounts[0].username).equals(username, 'account username');
            expect(accounts[0].key).equals(publicKey, 'account key');

            expect(await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`account\`=?`, [accounts[0].id])).is.empty;
        });

        it("creates account with public key", async () => {
            const username = 'with_pubkey';

            const result = await m.execute('CreateAccount', {
                username,
                publickey
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [username]);

            expect(accounts).has.length(1);
            expect(accounts[0]).contains.keys(['username', 'key']);
            expect(accounts[0].username).equals(username, 'account username');
            expect(accounts[0].key).equals(publickey, 'account key');

            expect(await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`account\`=?`, [accounts[0].id])).is.empty;
        });

        it("Catches duplicate usernames", async () => {
            const username = 'rdm_pw_no_acc';
            const result = await m.execute('CreateAccount', { username }) as CoreJS.Response;

            expect(result.code).equals(400, 'wrong response code');
            expect(result.data).equals('#_username_duplicate', 'response data');
        });

        it("creates account with specific access expiration duration", async () => {
            const username = 'acc_expiration';
            const access_expiration = CoreJS.Milliseconds.Day * 3;
            const minExpirationTime = BackendJS.Database.trimTime(access_expiration + Date.now());

            const result = await m.execute('CreateAccount', {
                username,
                create_access: true,
                access_expiration
            }) as CoreJS.Response;

            const maxExpirationTime = access_expiration + Date.now();

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'expiration']);
            expect(access.expiration).greaterThanOrEqual(minExpirationTime, 'access expiration is to low');
            expect(access.expiration).lessThanOrEqual(maxExpirationTime, 'access expiration is to high');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1);
            expect(BackendJS.Database.parseToTime(accesses[0].expiration)).equals(access.expiration, 'access expiration');
        });
    });

    describe("Password changing", () => {
        it("catches wrong old password", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const result = await m.execute('ChangePassword', {
                account: accounts[0].id,
                old: 'old pw',
                new: 'new pw'
            }) as CoreJS.Response;

            expect(result.code).equals(403, 'wrong response code');
            expect(result.data).equals('#_wrong_old_password', 'response data');

            accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [accounts[0].username]);

            expect(accounts[0].key).equals(accounts[0].key, 'account key');
        });

        it("changes password", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const password = 'hello world';

            const result = await m.execute('ChangePassword', {
                account: accounts[0].id,
                old: accounts[0].key,
                new: password
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            accounts = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`username\`=?`, [accounts[0].username]);

            expect(accounts[0].key).equals(password, 'account key');
        });
    });

    describe("Access creation", () => {
        it("creates access with default options", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const result = await m.execute('CreateAccess', {
                account: accounts[0].id
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'account', 'api', 'secret', 'expiration', 'rights', 'label']);
            expect(access.account).equals(accounts[0].id, 'created access account id');
            expect(access.rights).equals(-1, 'created access has not default rights');
            expect(access.expiration).equals(null, 'created access has not default expiration');
            expect(access.label).equals('', 'created access has not default label');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(accesses[0].account).equals(access.account, 'database access has different account');
            expect(accesses[0].api).equals(access.api, 'database access has different api');
            expect(accesses[0].secret).equals(access.secret, 'database access has different secret');
            expect(accesses[0].rights).equals(access.rights, 'database access has different rights');
            expect(accesses[0].expiration).equals(access.expiration, 'database access has different expiration');
            expect(accesses[0].label).equals(access.label, 'database access has different label');
        });

        it("creates access with specific rights", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const rights = 97;
            const result = await m.execute('CreateAccess', {
                account: accounts[0].id,
                rights
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'rights']);
            expect(access.rights).equals(rights, 'created access has wrong rights');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(accesses[0].rights).equals(access.rights, 'database access has different rights');
        });

        it("creates access with specific label", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const label = 'hello world';
            const result = await m.execute('CreateAccess', {
                account: accounts[0].id,
                label
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'label']);
            expect(access.label).equals(label, 'created access has wrong label');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(accesses[0].label).equals(access.label, 'database access has different label');
        });

        it("creates access with specific expiration", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data}`);

            const expiration_duration = CoreJS.Milliseconds.Hour * 3;
            const minExpirationTime = BackendJS.Database.trimTime(expiration_duration + Date.now());

            const result = await m.execute('CreateAccess', {
                account: accounts[0].id,
                expiration_duration
            }) as CoreJS.Response;

            const maxExpirationTime = expiration_duration + Date.now();

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'expiration']);
            expect(access.expiration).greaterThanOrEqual(minExpirationTime, 'access expiration is to low');
            expect(access.expiration).lessThanOrEqual(maxExpirationTime, 'access expiration is to high');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(Number(accesses[0].expiration)).equals(access.expiration, 'database access has different expiration');
        });
    });

    describe("Access deletion", () => {
        it("catches missing parameter account id", async () => {
            let accesses: readonly BackendJS.Account.Access[] = await m.database.query(`SELECT * FROM ${m.accessRepository.data}`);

            try {
                const result = await m.execute('DeleteAccess', {
                    api_to_delete: accesses[0].api
                }) as CoreJS.Response;

                expect(result.code).equals(-1001, 'wrong response code');
            } catch (error) {
                expect(error.code).equals(-1001, 'wrong response code');
                expect(error.data).contains({ name: 'account', type: 'number' });
            }
        });

        it("catches missing parameter api_to_delete", async () => {
            let accesses: readonly BackendJS.Account.Access[] = await m.database.query(`SELECT * FROM ${m.accessRepository.data}`);

            try {
                const result = await m.execute('DeleteAccess', {
                    account: accesses[0].account,
                }) as CoreJS.Response;

                expect(result.code).equals(-1001, 'wrong response code');
            } catch (error) {
                expect(error.code).equals(-1001, 'wrong response code');
                expect(error.data).contains({ name: 'api_to_delete', type: 'string' });
            }
        });

        it("deletes access", async () => {
            let accesses: readonly BackendJS.Account.Access[] = await m.database.query(`SELECT * FROM ${m.accessRepository.data}`);

            const result = await m.execute('DeleteAccess', {
                account: accesses[0].account,
                api_to_delete: accesses[0].api
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [accesses[0].id]);

            expect(accesses).has.length(0, 'database includes deleted access');
        });
    });

    describe("Login", () => {
        it("delays login command", async () => {
            const stopwatch = new CoreJS.Stopwatch();

            stopwatch.start();

            await m.execute('Login', {
                timestamp: 1,
                sign: '',
                username: 'hello world'
            });

            stopwatch.stop();

            expect(stopwatch.duration).greaterThanOrEqual(CoreJS.Milliseconds.Second, 'login execution is too fast');
        });

        it("catches invalid username", async () => {
            const timestamp = Date.now();
            const hash = CoreJS.toHashInt(timestamp.toString());
            const sign = CoreJS.ECDSA.sign(hash, privateKey).toString();

            const result = await m.execute('Login', {
                timestamp,
                sign,
                username: 'hello world'
            }) as CoreJS.Response;

            expect(result.code).equals(401, 'wrong response code');
            expect(result.data).equals('#_login_invalid', 'wrong error message');
        });

        it("catches invalid sign", async () => {
            const timestamp = Date.now();
            const hash = CoreJS.toHashInt('1000');
            const sign = CoreJS.ECDSA.sign(hash, privateKey).toString();

            const result = await m.execute('Login', {
                timestamp,
                sign,
                username: 'hello world'
            }) as CoreJS.Response;

            expect(result.code).equals(401, 'wrong response code');
            expect(result.data).equals('#_login_invalid', 'wrong error message');
        });

        it("executes login without keep login", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`key\`=?`, [publickey]);

            const timestamp = Date.now();
            const hash = CoreJS.toHashInt(timestamp.toString());
            const sign = CoreJS.ECDSA.sign(hash, privateKey).toString();

            const minExpirationTime = BackendJS.Database.trimTime(CoreJS.Milliseconds.Day + Date.now());

            const result = await m.execute('Login', {
                timestamp,
                sign,
                username: accounts[0].username
            }) as CoreJS.Response;

            const maxExpirationTime = CoreJS.Milliseconds.Day + Date.now();

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'account', 'api', 'secret', 'expiration', 'rights', 'label']);
            expect(access.account).equals(accounts[0].id, 'created access account id');
            expect(access.rights).equals(-1, 'created access has wrong rights');
            expect(access.expiration).greaterThanOrEqual(minExpirationTime, 'expiration of created access is to low');
            expect(access.expiration).lessThanOrEqual(maxExpirationTime, 'expiration of created access is to high');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(accesses[0].account).equals(access.account, 'database access has different account');
            expect(accesses[0].api).equals(access.api, 'database access has different api');
            expect(accesses[0].secret).equals(access.secret, 'database access has different secret');
            expect(accesses[0].rights).equals(access.rights, 'database access has different rights');
            expect(Number(accesses[0].expiration)).equals(access.expiration, 'database access has different expiration');
            expect(accesses[0].label).equals(access.label, 'database access has different label');
        });

        it("executes login with keep login", async () => {
            let accounts: readonly BackendJS.Account.Account[] = await m.database.query(`SELECT * FROM ${m.accountRepository.data} WHERE \`key\`=?`, [publickey]);

            const timestamp = Date.now();
            const hash = CoreJS.toHashInt(timestamp.toString());
            const sign = CoreJS.ECDSA.sign(hash, privateKey).toString();

            const minExpirationTime = BackendJS.Database.trimTime(CoreJS.Milliseconds.Day * 30 + Date.now());

            const result = await m.execute('Login', {
                timestamp,
                sign,
                username: accounts[0].username,
                keepLogin: true
            }) as CoreJS.Response;

            const maxExpirationTime = CoreJS.Milliseconds.Day * 30 + Date.now();

            expect(result.code).equals(200, 'wrong response code');

            const access: BackendJS.Account.Access = JSON.parse(result.data);

            expect(access).contains.keys(['id', 'expiration']);
            expect(access.expiration).greaterThanOrEqual(minExpirationTime, 'expiration of created access is to low');
            expect(access.expiration).lessThanOrEqual(maxExpirationTime, 'expiration of created access is to high');

            const accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [access.id]);

            expect(accesses).has.length(1, 'database does not include created access');
            expect(Number(accesses[0].expiration)).equals(access.expiration, 'database access has different expiration');
        });
    });

    describe("Logout", () => {
        it("executes logout", async () => {
            let accesses: readonly BackendJS.Account.Access[] = await m.database.query(`SELECT * FROM ${m.accessRepository.data}`);

            const result = await m.execute('Logout', {
                api: accesses[0].api
            }) as CoreJS.Response;

            expect(result.code).equals(200, 'wrong response code');

            accesses = await m.database.query(`SELECT * FROM ${m.accessRepository.data} WHERE \`id\`=?`, [accesses[0].id]);

            expect(accesses).has.length(0, 'database includes deleted access');
        });
    });

    describe("Cleanup", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});