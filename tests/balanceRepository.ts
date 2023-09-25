/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Balance, Database, Log } from "../src";
import { expect } from "chai";
import { EventType } from "../src/balance/enums";

const tables = {
    eventTable: '`balanceEvents`',
    updateTable: '`balanceUpdates`'
};

const databaseConfig = {
    host: "localhost",
    user: "dev",
    password: "",
    database: "test",
    timeout: 60000
};

const database = new Database.Database(databaseConfig, {
    debug: true,
    multipleStatements: true
});

const repository = new Balance.Repository(tables, database);
const log = Log.Log.createFileLog('./test.balance.log', true);

CoreJS.GlobalEventManager.onMessage.on(message => log.write(message));

describe("Balance Repository", () => {
    let start: number;
    let end: number;

    describe("init", () => {
        it("initializes", () => repository.init());
        it("updates", async () => expect(await repository.update()).equals(2));
        it("resets", async () => expect(await repository.reset()).equals(undefined));
    });

    describe("Increasing", () => {
        it("simple order", () => repository.increase({ account: 1, depot: 1, asset: 1, value: 1, order: 1, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 1 })));

        it("second order", () => repository.increase({ account: 1, depot: 1, asset: 1, value: 2, order: 2, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 })));

        it("second asset", () => repository.increase({ account: 1, depot: 1, asset: 2, value: 4, order: 3, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 4 })));

        it("second depot", () => repository.increase({ account: 1, depot: 2, asset: 1, value: 5, order: 4, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 5 })));

        it("second account", () => repository.increase({ account: 2, depot: 1, asset: 1, value: 6, order: 5, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 6 })));
    });

    describe("Decreasing", () => {
        it("simple order", () => repository.decrease({ account: 1, depot: 1, asset: 1, value: 1, order: 4, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 2 })));

        it("second order", () => repository.decrease({ account: 1, depot: 1, asset: 1, value: 2, order: 3, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 0 })));

        it("second asset", () => repository.decrease({ account: 1, depot: 1, asset: 2, value: 6, order: 2, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: -2 })));

        it("second depot", () => repository.decrease({ account: 1, depot: 2, asset: 1, value: 5, order: 1, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 0 })));

        it("second account", () => repository.decrease({ account: 2, depot: 1, asset: 1, value: 4, order: 6, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 2 })));
    })
        .beforeAll(() => CoreJS.sleep(2000))
        .afterAll(async () => {
            const result = await database.query(`SELECT \`timestamp\` FROM ${tables.updateTable} ORDER BY \`timestamp\` ASC`);

            start = Database.parseToTime(result[0].timestamp) as number;
            end = Database.parseToTime(result[result.length - 1].timestamp) as number;
        });

    describe("Events", () => {
        describe("get", () => {
            describe("current", () => {
                it("all from account 1", () => repository.getEvents(1).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])));
                it("all from account 2", () => repository.getEvents(2).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([4])));
                it("all from account 3", () => repository.getEvents(3).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                it("account 1, depot 1", () => repository.getEvents(1, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([2, 6])));
                it("account 1, depot 2", () => repository.getEvents(1, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([5])));

                it("account 1, asset 1", () => repository.getEvents(1, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([2, 5])));
                it("account 1, asset 2", () => repository.getEvents(1, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([6])));

                it("with type increase", () => repository.getEvents(1, { type: EventType.Increase }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([2, 4, 5])));
                it("with type decrease", () => repository.getEvents(1, { type: EventType.Decrease }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])));

                it("with empty data", () => repository.getEvents(1, { data: '' }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));
                it("with data", () => repository.getEvents(1, { data: 'decrease' }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])));
                it("with data array", () => repository.getEvents(1, { data: ['increase', 'decrease'] }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])));
            });

            describe("history", () => {
                it("all from account 1", () => repository.getEvents(1, { end }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])));
                it("all from account 2", () => repository.getEvents(2, { end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([6, 4])));
                it("all from account 3", () => repository.getEvents(3, { end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                it("account 1, depot 1", () => repository.getEvents(1, { depot: 1, end }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([1, 2, 4, 1, 2, 6])));
                it("account 1, depot 2", () => repository.getEvents(1, { depot: 2, end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([5, 5])));

                it("account 1, asset 1", () => repository.getEvents(1, { asset: 1, end }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([1, 2, 5, 1, 2, 5])));
                it("account 1, asset 2", () => repository.getEvents(1, { asset: 2, end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([4, 6])));

                it("with start", () => repository.getEvents(1, { start: end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])));
                it("with end", () => repository.getEvents(1, { end: start }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 4, 5])));

                it("with limit 1", () => repository.getEvents(1, { limit: 1, end }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([1])));
                it("with limit 8", () => repository.getEvents(1, { limit: 8, end }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])));

                it("with type increase", () => repository.getEvents(1, { type: EventType.Increase, end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 4, 5])));
                it("with type decrease", () => repository.getEvents(1, { type: EventType.Decrease, end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])));

                it("with empty data", () => repository.getEvents(1, { data: '', end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));
                it("with data", () => repository.getEvents(1, { data: 'decrease', end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])));
                it("with data array", () => repository.getEvents(1, { data: ['increase', 'decrease'], end }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])));
            });
        });

        describe("fetch", () => {
            describe("current", () => {
                it("all from account 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])) });
                it("all from account 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(2, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([4])) });
                it("all from account 3", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(3, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                it("account 1, depot 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([2, 6])) });
                it("account 1, depot 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([5])) });

                it("account 1, asset 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([2, 5])) });
                it("account 1, asset 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([6])) });

                it("with type increase", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Increase }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([2, 4, 5])) });
                it("with type decrease", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Decrease }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])) });

                it("with empty data", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: '' }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });
                it("with data", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: 'decrease' }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])) });
                it("with data array", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: ['increase', 'decrease'] }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([2, 6, 5])) });
            });

            describe("history", () => {
                it("all from account 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])) });
                it("all from account 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(2, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([6, 4])) });
                it("all from account 3", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(3, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                it("account 1, depot 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 1, end }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([1, 2, 4, 1, 2, 6])) });
                it("account 1, depot 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 2, end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([5, 5])) });

                it("account 1, asset 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 1, end }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([1, 2, 5, 1, 2, 5])) });
                it("account 1, asset 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 2, end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([4, 6])) });

                it("with start", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])) });
                it("with end", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 4, 5])) });

                it("with limit 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { limit: 1, end }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([1])) });
                it("with limit 8", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { limit: 8, end }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])) });

                it("with type increase", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Increase, end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 4, 5])) });
                it("with type decrease", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Decrease, end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])) });

                it("with empty data", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: '', end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });
                it("with data", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: 'decrease', end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 6, 5])) });
                it("with data array", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: ['increase', 'decrease'], end }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([1, 2, 4, 5, 1, 2, 6, 5])) });
            });
        });
    });

    describe("Updates", () => {
        describe("get", () => {
            describe("current", () => {
                it("all from account 1", () => repository.getUpdates(1).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([0, -2, 0])));
                it("all from account 2", () => repository.getUpdates(2).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([2])));
                it("all from account 3", () => repository.getUpdates(3).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                it("account 1, depot 1", () => repository.getUpdates(1, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([0, -2])));
                it("account 1, depot 2", () => repository.getUpdates(1, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([0])));

                it("account 1, asset 1", () => repository.getUpdates(1, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([0, 0])));
                it("account 1, asset 2", () => repository.getUpdates(1, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-2])));
            });

            describe("history", () => {
                it("all from account 1", () => repository.getUpdates(1, { end }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([1, 3, 4, 5, 2, 0, -2, 0])));
                it("all from account 2", () => repository.getUpdates(2, { end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([6, 2])));
                it("all from account 3", () => repository.getUpdates(3, { end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                it("account 1, depot 1", () => repository.getUpdates(1, { depot: 1, end }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([1, 3, 4, 2, 0, -2])));
                it("account 1, depot 2", () => repository.getUpdates(1, { depot: 2, end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([5, 0])));

                it("account 1, asset 1", () => repository.getUpdates(1, { asset: 1, end }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([1, 3, 5, 2, 0, 0])));
                it("account 1, asset 2", () => repository.getUpdates(1, { asset: 2, end }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([4, -2])));

                it("with start", () => repository.getUpdates(1, { start: end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([2, 0, -2, 0])));
                it("with end", () => repository.getUpdates(1, { end: start }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 3, 4, 5])));

                it("with limit 1", () => repository.getUpdates(1, { limit: 1, end }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([1])));
                it("with limit 8", () => repository.getUpdates(1, { limit: 8, end }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([1, 3, 4, 5, 2, 0, -2, 0])));
            });
        });

        describe("fetch", () => {
            describe("current", () => {
                it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([0, -2, 0])) });
                it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([2])) });
                it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([0, -2])) });
                it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([0])) });

                it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([0, 0])) });
                it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([-2])) });
            });

            describe("history", () => {
                it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([1, 3, 4, 5, 2, 0, -2, 0])) });
                it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([6, 2])) });
                it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { depot: 1, end }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([1, 3, 4, 2, 0, -2])) });
                it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { depot: 2, end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([5, 0])) });

                it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { asset: 1, end }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([1, 3, 5, 2, 0, 0])) });
                it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { asset: 2, end }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([4, -2])) });

                it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([2, 0, -2, 0])) });
                it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 3, 4, 5])) });

                it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { limit: 1, end }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([1])) });
                it("with limit 8", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, async data => array.push(data), { limit: 8, end }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([1, 3, 4, 5, 2, 0, -2, 0])) });
            });
        });
    });

    describe("closing", () => {
        it("reverts", async () => expect(await repository.revert()).equals(0));
        it("deinitializes", () => repository.deinit());
    });
})
    .beforeAll(() => Database.Database.drop(databaseConfig).then(() => Database.Database.create(databaseConfig).then(() => database.init())))
    .afterAll(() => database.close());