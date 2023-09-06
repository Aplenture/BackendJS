/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Balance, Database, Log } from "../src";
import { expect } from "chai";

const tables = {
    balanceTable: '`balances`',
    updateTable: '`balanceUpdates`',
    historyTable: '`balanceHistories`'
};

const databaseConfig = {
    host: "localhost",
    user: "dev",
    password: "",
    database: "test",
    multipleStatements: true,
    timeout: 60000
};

const database = new Database.Database(databaseConfig, true);

const repository = new Balance.BalanceRepository(tables, database, process.cwd() + '/src/balance/updates/BalanceRepository');
const log = Log.Log.createFileLog('./test.log', true);

database.onMessage.on(message => log.write(message));

describe("Module", () => {
    describe("init", () => {
        it("initializes", () => repository.init());
        it("updates", async () => expect(await repository.update()).equals(3));
        it("resets", async () => expect(await repository.reset()).equals(undefined));
    });

    describe("increasing", () => {
        it("simple product", () => repository.increase({ account: 1, depot: 1, asset: 1, value: 1, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 1 })));

        it("second product", () => repository.increase({ account: 1, depot: 1, asset: 1, value: 2, product: 2, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 })));

        it("second asset", () => repository.increase({ account: 1, depot: 1, asset: 2, value: 4, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 4 })));

        it("second depot", () => repository.increase({ account: 1, depot: 2, asset: 1, value: 5, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 5 })));

        it("second account", () => repository.increase({ account: 2, depot: 1, asset: 1, value: 6, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 6 })));
    });

    describe("decreasing", () => {
        it("simple product", () => repository.decrease({ account: 1, depot: 1, asset: 1, value: 1, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 2 })));

        it("second product", () => repository.decrease({ account: 1, depot: 1, asset: 1, value: 2, product: 2, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 0 })));

        it("second asset", () => repository.decrease({ account: 1, depot: 1, asset: 2, value: 6, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: -2 })));

        it("second depot", () => repository.decrease({ account: 1, depot: 2, asset: 1, value: 5, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 0 })));

        it("second account", () => repository.decrease({ account: 2, depot: 1, asset: 1, value: 4, product: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 2 })));
    });

    describe("history", () => {
        describe("first update", () => {
            it("updates history", async () => expect(await repository.updateHistory()).is.true);
            it("includes history data", () => Promise.all([
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '1'").has.length(1).deep.equals([0])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=2 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '2', asset '1'").has.length(1).deep.equals([0])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=2`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '2'").has.length(1).deep.equals([-2])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=2 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '2', depot '1', asset '1'").has.length(1).deep.equals([2]))
            ]));
            it("skips updating up to date history", async () => expect(await repository.updateHistory()).is.false);
        });

        describe("second update", () => {
            it("updates history", async () => expect(await repository.updateHistory()).is.true);
            it("includes history data", () => Promise.all([
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '1'").has.length(2).deep.equals([0, 50])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=2 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '2', asset '1'").has.length(2).deep.equals([0, 0])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=2`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '2'").has.length(2).deep.equals([-2, -2])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=2 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '2', depot '1', asset '1'").has.length(2).deep.equals([2, 2])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=3 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '3', depot '1', asset '1'").has.length(1).deep.equals([50]))
            ]));
        }).beforeAll(() => Promise.all([
            repository.increase({ account: 1, depot: 1, asset: 1, value: 50, product: 0, data: '' }),
            repository.increase({ account: 3, depot: 1, asset: 1, value: 50, product: 0, data: '' })
        ]).then(() => CoreJS.sleep(1000)));

        describe("third update", () => {
            it("updates history", async () => expect(await repository.updateHistory()).is.true);
            it("includes history data", () => Promise.all([
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '1'").has.length(3).deep.equals([0, 50, 50])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=2 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '1', depot '2', asset '1'").has.length(3).deep.equals([0, 0, 0])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=1 AND \`depot\`=1 AND \`asset\`=2`).then(result => expect(result.map(data => data.value), "account '1', depot '1', asset '2'").has.length(3).deep.equals([-2, -2, -2])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=2 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '2', depot '1', asset '1'").has.length(3).deep.equals([2, 2, 2])),
                database.query(`SELECT * FROM ${tables.historyTable} WHERE \`account\`=3 AND \`depot\`=1 AND \`asset\`=1`).then(result => expect(result.map(data => data.value), "account '3', depot '1', asset '1'").has.length(2).deep.equals([50, 50]))
            ]));
        }).beforeAll(() => CoreJS.sleep(1000));
    });

    describe("closing", () => {
        it("reverts", async () => expect(await repository.revert()).equals(0));
        it("deinitializes", () => repository.deinit());
    });
})
    .beforeAll(() => Database.Database.drop(databaseConfig).then(() => Database.Database.create(databaseConfig).then(() => database.init())))
    .afterAll(() => database.close());