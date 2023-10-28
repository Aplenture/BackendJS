/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Balance, Database, Log } from "../src";
import { expect } from "chai";
import { EventType, UpdateResolution } from "../src/balance/enums";
import { Event, Update } from "../src/balance";

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
    const now = CoreJS.calcDate({ year: 2022, month: CoreJS.Month.September, monthDay: 6 });
    const nextDay = CoreJS.addDate({ date: now, days: 1 });
    const nextWeek = CoreJS.addDate({ date: nextDay, days: 7 });
    const nextMonth = CoreJS.addDate({ date: nextWeek, months: 1 });
    const nextYear = CoreJS.addDate({ date: nextMonth, years: 1 });

    const start = Number(now);
    const end = Number(nextYear);

    describe("init", () => {
        it("initializes", () => repository.init());
        it("updates", async () => expect(await repository.update()).equals(2));
        it("resets", async () => expect(await repository.reset()).equals(undefined));
    });

    describe("Increasing next year", () => {
        it("simple order", () => repository.increase({ date: nextYear, account: 1, depot: 1, asset: 1, value: 21, order: 1, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 21 })));

        it("second order", () => repository.increase({ date: nextYear, account: 1, depot: 1, asset: 1, value: 22, order: 2, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 43 })));

        it("second asset", () => repository.increase({ date: nextYear, account: 1, depot: 1, asset: 2, value: 23, order: 3, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 23 })));

        it("second depot", () => repository.increase({ date: nextYear, account: 1, depot: 2, asset: 1, value: 24, order: 4, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 24 })));

        it("second account", () => repository.increase({ date: nextYear, account: 2, depot: 1, asset: 1, value: 25, order: 5, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 25 })));
    });

    describe("Increasing now", () => {
        it("simple order", () => repository.increase({ date: now, account: 1, depot: 1, asset: 1, value: 1, order: 1, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 44 })));

        it("second order", () => repository.increase({ date: now, account: 1, depot: 1, asset: 1, value: 2, order: 2, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 46 })));

        it("second asset", () => repository.increase({ date: now, account: 1, depot: 1, asset: 2, value: 3, order: 3, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 26 })));

        it("second depot", () => repository.increase({ date: now, account: 1, depot: 2, asset: 1, value: 4, order: 4, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 28 })));

        it("second account", () => repository.increase({ date: now, account: 2, depot: 1, asset: 1, value: 5, order: 5, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 30 })));
    });

    describe("Decreasing next day", () => {
        it("simple order", () => repository.decrease({ date: nextDay, account: 1, depot: 1, asset: 1, value: 6, order: 4, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 40 })));

        it("second order", () => repository.decrease({ date: nextDay, account: 1, depot: 1, asset: 1, value: 7, order: 3, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 33 })));

        it("second asset", () => repository.decrease({ date: nextDay, account: 1, depot: 1, asset: 2, value: 8, order: 2, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 18 })));

        it("second depot", () => repository.decrease({ date: nextDay, account: 1, depot: 2, asset: 1, value: 9, order: 1, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 19 })));

        it("second account", () => repository.decrease({ date: nextDay, account: 2, depot: 1, asset: 1, value: 10, order: 6, data: 'decrease' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 20 })));
    });

    describe("Decreasing next month", () => {
        it("simple order", () => repository.decrease({ date: nextMonth, account: 1, depot: 1, asset: 1, value: 16, order: 4, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 17 })));

        it("second order", () => repository.decrease({ date: nextMonth, account: 1, depot: 1, asset: 1, value: 17, order: 3, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 0 })));

        it("second asset", () => repository.decrease({ date: nextMonth, account: 1, depot: 1, asset: 2, value: 18, order: 2, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 0 })));

        it("second depot", () => repository.decrease({ date: nextMonth, account: 1, depot: 2, asset: 1, value: 19, order: 1, data: '' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 0 })));

        it("second account", () => repository.decrease({ date: nextMonth, account: 2, depot: 1, asset: 1, value: 20, order: 6, data: '' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 0 })));
    });

    describe("Increasing next week", () => {
        it("simple order", () => repository.increase({ date: nextWeek, account: 1, depot: 1, asset: 1, value: 11, order: 1, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 11 })));

        it("second order", () => repository.increase({ date: nextWeek, account: 1, depot: 1, asset: 1, value: 12, order: 2, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 })));

        it("second asset", () => repository.increase({ date: nextWeek, account: 1, depot: 1, asset: 2, value: 13, order: 3, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 })));

        it("second depot", () => repository.increase({ date: nextWeek, account: 1, depot: 2, asset: 1, value: 14, order: 4, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 })));

        it("second account", () => repository.increase({ date: nextWeek, account: 2, depot: 1, asset: 1, value: 15, order: 5, data: 'increase' })
            .then(result => expect(result).deep.contains({ account: 2, depot: 1, asset: 1, value: 15 })));
    });

    describe("Balance", () => {
        describe("history", () => {
            describe("get", () => {
                describe("current", () => {
                    it("all from account 1", () => repository.getBalance(1).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                    it("all from account 2", () => repository.getBalance(2).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([15])));
                    it("all from account 3", () => repository.getBalance(3).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 13])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([14])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 14])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));
                });

                describe("now", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([5])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 3])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([4])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 4])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(now) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));
                });

                describe("between now and next day", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([5])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 3])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([4])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 4])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(now) + CoreJS.Milliseconds.Hour * 12 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));
                });

                describe("next day", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextDay) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])));
                });

                describe("between next day and next week", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextDay) + CoreJS.Milliseconds.Day * 2 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])));
                });

                describe("next week", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([10])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 8])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([9])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 9])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([8])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextWeek) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])));
                });

                describe("between next week and next month", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([10])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 8])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([9])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 9])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([8])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextWeek) + CoreJS.Milliseconds.Day * 8 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])));
                });

                describe("next month", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-20])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextMonth) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])));
                });

                describe("between next month and next year", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-20])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextMonth) + CoreJS.Milliseconds.Day * 32 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])));
                });

                describe("next year", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([15])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 13])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([14])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 14])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([23])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextYear) }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                });

                describe("after next year", () => {
                    it("all from account 1", () => repository.getBalance(1, { time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                    it("all from account 2", () => repository.getBalance(2, { time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([15])));
                    it("all from account 3", () => repository.getBalance(3, { time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getBalance(1, { depot: 1, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 13])));
                    it("account 1, depot 2", () => repository.getBalance(1, { depot: 2, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([14])));

                    it("account 1, asset 1", () => repository.getBalance(1, { asset: 1, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 14])));
                    it("account 1, asset 2", () => repository.getBalance(1, { asset: 2, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));

                    it("with limit 1", () => repository.getBalance(1, { limit: 1, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([23])));
                    it("with limit 1000", () => repository.getBalance(1, { limit: 1000, time: Number(nextYear) + CoreJS.Milliseconds.Day }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                });
            });

            describe("fetch", () => {
                describe("current", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data)).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data)).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([15])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data)).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1 }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 13])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2 }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([14])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1 }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 14])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2 }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([13])) });
                });

                describe("now", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data), { time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([5])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data), { time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 3])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([4])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([3, 4])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([3])) });

                    it("with limit 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([3])) });
                    it("with limit 1000", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1000, time: Number(now) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])) });
                });

                describe("next day", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data), { time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data), { time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, -5])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-5])) });

                    it("with limit 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])) });
                    it("with limit 1000", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1000, time: Number(nextDay) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])) });
                });

                describe("next week", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data), { time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([10])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data), { time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 8])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([9])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([13, 9])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([8])) });

                    it("with limit 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([13])) });
                    it("with limit 1000", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1000, time: Number(nextWeek) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])) });
                });

                describe("next month", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data), { time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data), { time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([-20, -10])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])) });

                    it("with limit 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([-20])) });
                    it("with limit 1000", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1000, time: Number(nextMonth) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])) });
                });

                describe("next year", () => {
                    it("all from account 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])) });
                    it("all from account 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(2, async data => result.push(data), { time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([15])) });
                    it("all from account 3", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(3, async data => result.push(data), { time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 1, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 13])) });
                    it("account 1, depot 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { depot: 2, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([14])) });

                    it("account 1, asset 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 1, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(2).deep.equals([23, 14])) });
                    it("account 1, asset 2", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { asset: 2, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([13])) });

                    it("with limit 1", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(1).deep.equals([23])) });
                    it("with limit 1000", async () => { const result = new Array<Balance.Update>; await repository.fetchBalances(1, async data => result.push(data), { limit: 1000, time: Number(nextYear) }).then(() => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])) });
                });
            });
        });

        describe("sum", () => {
            describe("get", () => {
                describe("current", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1);

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2);

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3);

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("now", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1, { time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2, { time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3, { time: Number(now) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1, time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1000, time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });
                });

                describe("next day", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1, { time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2, { time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3, { time: Number(nextDay) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1, time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1000, time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });
                });

                describe("next week", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1, { time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2, { time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3, { time: Number(nextWeek) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1, time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1000, time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });
                });

                describe("next month", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1, { time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2, { time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3, { time: Number(nextMonth) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1, time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1000, time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });
                });

                describe("next year", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getBalanceSum(1, { time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getBalanceSum(2, { time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getBalanceSum(3, { time: Number(nextYear) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 1, time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getBalanceSum(1, { depot: 2, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 1, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getBalanceSum(1, { asset: 2, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getBalanceSum(1, { limit: 1000, time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });
            });

            describe("fetch", () => {
                describe("current", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data));

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data));

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data));

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("now", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data), { time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data), { time: Number(now) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1, time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1, time: Number(now) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1000, time: Number(now) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });
                });

                describe("next day", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data), { time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data), { time: Number(nextDay) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1, time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("with limit 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1, time: Number(nextDay) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("with limit 1000", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1000, time: Number(nextDay) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });
                });

                describe("next week", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data), { time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data), { time: Number(nextWeek) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1, time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("with limit 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1, time: Number(nextWeek) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("with limit 1000", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1000, time: Number(nextWeek) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });
                });

                describe("next month", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data), { time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data), { time: Number(nextMonth) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1, time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("with limit 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1, time: Number(nextMonth) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("with limit 1000", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1000, time: Number(nextMonth) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });
                });

                describe("next year", () => {
                    it("all from account 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(2, async data => result.push(data), { time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(3, async data => result.push(data), { time: Number(nextYear) });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 1, time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { depot: 2, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 1, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { asset: 2, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with limit 1", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1, time: Number(nextYear) });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("with limit 1000", async () => {
                        const result: Balance.Update[] = [];

                        await repository.fetchBalanceSum(1, async data => result.push(data), { limit: 1000, time: Number(nextYear) });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });
            });
        });
    });

    describe("Events", () => {
        describe("history", () => {
            describe("get", () => {
                it("all from account 1", () => repository.getEvents(1).then(result => expect(result.map(data => data.value)).has.length(20).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24])));
                it("all from account 2", () => repository.getEvents(2).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([5, 10, 15, 20, 25])));
                it("all from account 3", () => repository.getEvents(3).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                it("account 1, depot 1", () => repository.getEvents(1, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([1, 2, 3, 6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23])));
                it("account 1, depot 2", () => repository.getEvents(1, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([4, 9, 14, 19, 24])));

                it("account 1, asset 1", () => repository.getEvents(1, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([1, 2, 4, 6, 7, 9, 11, 12, 14, 16, 17, 19, 21, 22, 24])));
                it("account 1, asset 2", () => repository.getEvents(1, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([3, 8, 13, 18, 23])));

                it("with start", () => repository.getEvents(1, { start: end }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([21, 22, 23, 24])));
                it("with end", () => repository.getEvents(1, { end: start }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([1, 2, 3, 4])));

                it("with limit 1", () => repository.getEvents(1, { limit: 1 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([1])));
                it("with limit 1000", () => repository.getEvents(1, { limit: 1000 }).then(result => expect(result.map(data => data.value)).has.length(20).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24])));

                it("with type increase", () => repository.getEvents(1, { type: EventType.Increase }).then(result => expect(result.map(data => data.value)).has.length(12).deep.equals([1, 2, 3, 4, 11, 12, 13, 14, 21, 22, 23, 24])));
                it("with type decrease", () => repository.getEvents(1, { type: EventType.Decrease }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([6, 7, 8, 9, 16, 17, 18, 19])));

                it("with empty data", () => repository.getEvents(1, { data: '' }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([16, 17, 18, 19])));
                it("with data string", () => repository.getEvents(1, { data: 'decrease' }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([6, 7, 8, 9])));
                it("with data array", () => repository.getEvents(1, { data: ['increase', 'decrease'] }).then(result => expect(result.map(data => data.value)).has.length(16).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 21, 22, 23, 24])));
            });

            describe("fetch", () => {
                it("all from account 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(20).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24])) });
                it("all from account 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(2, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([5, 10, 15, 20, 25])) });
                it("all from account 3", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(3, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                it("account 1, depot 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([1, 2, 3, 6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23])) });
                it("account 1, depot 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([4, 9, 14, 19, 24])) });

                it("account 1, asset 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([1, 2, 4, 6, 7, 9, 11, 12, 14, 16, 17, 19, 21, 22, 24])) });
                it("account 1, asset 2", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([3, 8, 13, 18, 23])) });

                it("with start", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([21, 22, 23, 24])) });
                it("with end", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([1, 2, 3, 4])) });

                it("with limit 1", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { limit: 1 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([1])) });
                it("with limit 1000", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { limit: 1000 }).then(() => expect(array.map(data => data.value)).has.length(20).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24])) });

                it("with type increase", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Increase }).then(() => expect(array.map(data => data.value)).has.length(12).deep.equals([1, 2, 3, 4, 11, 12, 13, 14, 21, 22, 23, 24])) });
                it("with type decrease", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { type: EventType.Decrease }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([6, 7, 8, 9, 16, 17, 18, 19])) });

                it("with empty data", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: '' }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([16, 17, 18, 19])) });
                it("with data string", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: 'decrease' }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([6, 7, 8, 9])) });
                it("with data array", async () => { const array = new Array<Balance.Event>; await repository.fetchEvents(1, async data => array.push(data), { data: ['increase', 'decrease'] }).then(() => expect(array.map(data => data.value)).has.length(16).deep.equals([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 21, 22, 23, 24])) });
            });
        });

        describe("sum", () => {
            describe("get", () => {
                it("all from account 1", async () => {
                    const result = await repository.getEventSum(1);

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                });

                it("all from account 2", async () => {
                    const result = await repository.getEventSum(2);

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                });

                it("all from account 3", async () => {
                    const result = await repository.getEventSum(3);

                    expect(result).has.length(0);
                });

                it("groups depots", async () => {
                    const result = await repository.getEventSum(1, { groupDepots: true });

                    expect(result).has.length(3);
                    expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                    expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                });

                it("account 1, depot 1", async () => {
                    const result = await repository.getEventSum(1, { depot: 1 });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                    expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                });

                it("account 1, depot 2", async () => {
                    const result = await repository.getEventSum(1, { depot: 2 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                });

                it("account 1, asset 1", async () => {
                    const result = await repository.getEventSum(1, { asset: 1 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                });

                it("account 1, asset 2", async () => {
                    const result = await repository.getEventSum(1, { asset: 2 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                });

                it("with start", async () => {
                    const result = await repository.getEventSum(1, { start: end });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 67 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 23 });
                });

                it("with end", async () => {
                    const result = await repository.getEventSum(1, { end: start });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                });

                it("with type increase", async () => {
                    const result = await repository.getEventSum(1, { type: EventType.Increase });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 111 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 39 });
                });

                it("with type decrease", async () => {
                    const result = await repository.getEventSum(1, { type: EventType.Decrease });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -74 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -26 });
                });

                it("with empty data", async () => {
                    const result = await repository.getEventSum(1, { data: '' });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -52 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -18 });
                });

                it("with data string", async () => {
                    const result = await repository.getEventSum(1, { data: 'decrease' });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -22 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -8 });
                });

                it("with data array", async () => {
                    const result = await repository.getEventSum(1, { data: ['increase', 'decrease'] });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 89 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 31 });
                });
            });

            describe("fetch", () => {
                it("all from account 1", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data));

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                });

                it("all from account 2", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(2, async data => result.push(data));

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                });

                it("all from account 3", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(3, async data => result.push(data));

                    expect(result).has.length(0);
                });

                it("groups depots", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { groupDepots: true });

                    expect(result).has.length(3);
                    expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                    expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                });

                it("account 1, depot 1", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { depot: 1 });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                    expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                });

                it("account 1, depot 2", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { depot: 2 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                });

                it("account 1, asset 1", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { asset: 1 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                });

                it("account 1, asset 2", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { asset: 2 });

                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                });

                it("with start", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { start: end });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 67 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 23 });
                });

                it("with end", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { end: start });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                });

                it("with type increase", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { type: EventType.Increase });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 111 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 39 });
                });

                it("with type decrease", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { type: EventType.Decrease });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -74 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -26 });
                });

                it("with empty data", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { data: '' });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -52 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -18 });
                });

                it("with data string", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { data: 'decrease' });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -22 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -8 });
                });

                it("with data array", async () => {
                    const result: Array<Event> = [];

                    await repository.fetchEventSum(1, async data => result.push(data), { data: ['increase', 'decrease'] });

                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 89 });
                    expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 31 });
                });
            });
        });
    });

    describe("Updates", () => {
        describe("history", () => {
            describe("get", () => {
                describe("history with end", () => {
                    it("all from account 1", () => repository.getUpdates(1, UpdateResolution.Day, { end }).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                    it("all from account 2", () => repository.getUpdates(2, UpdateResolution.Day, { end }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([5, -5, 10, -10, 15])));
                    it("all from account 3", () => repository.getUpdates(3, UpdateResolution.Day, { end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getUpdates(1, UpdateResolution.Day, { depot: 1, end }).then(result => expect(result.map(data => data.value)).has.length(10).deep.equals([3, 3, -10, -5, 13, 8, -20, -10, 23, 13])));
                    it("account 1, depot 2", () => repository.getUpdates(1, UpdateResolution.Day, { depot: 2, end }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([4, -5, 9, -10, 14])));

                    it("account 1, asset 1", () => repository.getUpdates(1, UpdateResolution.Day, { asset: 1, end }).then(result => expect(result.map(data => data.value)).has.length(10).deep.equals([3, 4, -10, -5, 13, 9, -20, -10, 23, 14])));
                    it("account 1, asset 2", () => repository.getUpdates(1, UpdateResolution.Day, { asset: 2, end }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([3, -5, 8, -10, 13])));

                    it("with start", () => repository.getUpdates(1, UpdateResolution.Day, { start: end }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                    it("with end", () => repository.getUpdates(1, UpdateResolution.Day, { end: start }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));

                    it("with limit 1", () => repository.getUpdates(1, UpdateResolution.Day, { limit: 1, end }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));
                    it("with limit 1000", () => repository.getUpdates(1, UpdateResolution.Day, { limit: 1000, end }).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                });

                describe("history for days", () => {
                    it("all from account 1", () => repository.getUpdates(1, UpdateResolution.Day).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                    it("all from account 2", () => repository.getUpdates(2, UpdateResolution.Day).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([5, -5, 10, -10, 15])));
                    it("all from account 3", () => repository.getUpdates(3, UpdateResolution.Day).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getUpdates(1, UpdateResolution.Day, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(10).deep.equals([3, 3, -10, -5, 13, 8, -20, -10, 23, 13])));
                    it("account 1, depot 2", () => repository.getUpdates(1, UpdateResolution.Day, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([4, -5, 9, -10, 14])));

                    it("account 1, asset 1", () => repository.getUpdates(1, UpdateResolution.Day, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(10).deep.equals([3, 4, -10, -5, 13, 9, -20, -10, 23, 14])));
                    it("account 1, asset 2", () => repository.getUpdates(1, UpdateResolution.Day, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(5).deep.equals([3, -5, 8, -10, 13])));

                    it("with start", () => repository.getUpdates(1, UpdateResolution.Day, { start: end }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])));
                    it("with end", () => repository.getUpdates(1, UpdateResolution.Day, { end: start }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])));

                    it("with limit 1", () => repository.getUpdates(1, UpdateResolution.Day, { limit: 1 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([3])));
                    it("with limit 1000", () => repository.getUpdates(1, UpdateResolution.Day, { limit: 1000 }).then(result => expect(result.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                });

                describe("history for weeks", () => {
                    it("all from account 1", () => repository.getUpdates(1, UpdateResolution.Week).then(result => expect(result.map(data => data.value)).has.length(12).deep.equals([-10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                    it("all from account 2", () => repository.getUpdates(2, UpdateResolution.Week).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([-5, 10, -10, 15])));
                    it("all from account 3", () => repository.getUpdates(3, UpdateResolution.Week).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getUpdates(1, UpdateResolution.Week, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([-10, -5, 13, 8, -20, -10, 23, 13])));
                    it("account 1, depot 2", () => repository.getUpdates(1, UpdateResolution.Week, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([-5, 9, -10, 14])));

                    it("account 1, asset 1", () => repository.getUpdates(1, UpdateResolution.Week, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(8).deep.equals([-10, -5, 13, 9, -20, -10, 23, 14])));
                    it("account 1, asset 2", () => repository.getUpdates(1, UpdateResolution.Week, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([-5, 8, -10, 13])));

                    it("with start", () => repository.getUpdates(1, UpdateResolution.Week, { start: end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));
                    it("with end", () => repository.getUpdates(1, UpdateResolution.Week, { end: start }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])));

                    it("with limit 1", () => repository.getUpdates(1, UpdateResolution.Week, { limit: 1 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-10])));
                    it("with limit 1000", () => repository.getUpdates(1, UpdateResolution.Week, { limit: 1000 }).then(result => expect(result.map(data => data.value)).has.length(12).deep.equals([-10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])));
                });

                describe("history for months", () => {
                    it("all from account 1", () => repository.getUpdates(1, UpdateResolution.Month).then(result => expect(result.map(data => data.value)).has.length(9).deep.equals([13, 8, 9, -20, -10, -10, 23, 13, 14])));
                    it("all from account 2", () => repository.getUpdates(2, UpdateResolution.Month).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([10, -10, 15])));
                    it("all from account 3", () => repository.getUpdates(3, UpdateResolution.Month).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getUpdates(1, UpdateResolution.Month, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([13, 8, -20, -10, 23, 13])));
                    it("account 1, depot 2", () => repository.getUpdates(1, UpdateResolution.Month, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([9, -10, 14])));

                    it("account 1, asset 1", () => repository.getUpdates(1, UpdateResolution.Month, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([13, 9, -20, -10, 23, 14])));
                    it("account 1, asset 2", () => repository.getUpdates(1, UpdateResolution.Month, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([8, -10, 13])));

                    it("with start", () => repository.getUpdates(1, UpdateResolution.Month, { start: end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));
                    it("with end", () => repository.getUpdates(1, UpdateResolution.Month, { end: start }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])));

                    it("with limit 1", () => repository.getUpdates(1, UpdateResolution.Month, { limit: 1 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([13])));
                    it("with limit 1000", () => repository.getUpdates(1, UpdateResolution.Month, { limit: 1000 }).then(result => expect(result.map(data => data.value)).has.length(9).deep.equals([13, 8, 9, -20, -10, -10, 23, 13, 14])));
                });

                describe("history for years", () => {
                    it("all from account 1", () => repository.getUpdates(1, UpdateResolution.Year).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([-20, -10, -10, 23, 13, 14])));
                    it("all from account 2", () => repository.getUpdates(2, UpdateResolution.Year).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, 15])));
                    it("all from account 3", () => repository.getUpdates(3, UpdateResolution.Year).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));

                    it("account 1, depot 1", () => repository.getUpdates(1, UpdateResolution.Year, { depot: 1 }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([-20, -10, 23, 13])));
                    it("account 1, depot 2", () => repository.getUpdates(1, UpdateResolution.Year, { depot: 2 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, 14])));

                    it("account 1, asset 1", () => repository.getUpdates(1, UpdateResolution.Year, { asset: 1 }).then(result => expect(result.map(data => data.value)).has.length(4).deep.equals([-20, -10, 23, 14])));
                    it("account 1, asset 2", () => repository.getUpdates(1, UpdateResolution.Year, { asset: 2 }).then(result => expect(result.map(data => data.value)).has.length(2).deep.equals([-10, 13])));

                    it("with start", () => repository.getUpdates(1, UpdateResolution.Year, { start: end }).then(result => expect(result.map(data => data.value)).has.length(0).deep.equals([])));
                    it("with end", () => repository.getUpdates(1, UpdateResolution.Year, { end: start }).then(result => expect(result.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])));

                    it("with limit 1", () => repository.getUpdates(1, UpdateResolution.Year, { limit: 1 }).then(result => expect(result.map(data => data.value)).has.length(1).deep.equals([-20])));
                    it("with limit 1000", () => repository.getUpdates(1, UpdateResolution.Year, { limit: 1000 }).then(result => expect(result.map(data => data.value)).has.length(6).deep.equals([-20, -10, -10, 23, 13, 14])));
                });
            });

            describe("fetch", () => {
                describe("history with end", () => {
                    it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                    it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, UpdateResolution.Day, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([5, -5, 10, -10, 15])) });
                    it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, UpdateResolution.Day, async data => array.push(data), { end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { depot: 1, end }).then(() => expect(array.map(data => data.value)).has.length(10).deep.equals([3, 3, -10, -5, 13, 8, -20, -10, 23, 13])) });
                    it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { depot: 2, end }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([4, -5, 9, -10, 14])) });

                    it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { asset: 1, end }).then(() => expect(array.map(data => data.value)).has.length(10).deep.equals([3, 4, -10, -5, 13, 9, -20, -10, 23, 14])) });
                    it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { asset: 2, end }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([3, -5, 8, -10, 13])) });

                    it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])) });
                    it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])) });

                    it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { limit: 1, end }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([3])) });
                    it("with limit 1000", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { limit: 1000, end }).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                });

                describe("history for days", () => {
                    it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                    it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, UpdateResolution.Day, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([5, -5, 10, -10, 15])) });
                    it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, UpdateResolution.Day, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(10).deep.equals([3, 3, -10, -5, 13, 8, -20, -10, 23, 13])) });
                    it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([4, -5, 9, -10, 14])) });

                    it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(10).deep.equals([3, 4, -10, -5, 13, 9, -20, -10, 23, 14])) });
                    it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(5).deep.equals([3, -5, 8, -10, 13])) });

                    it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([23, 13, 14])) });
                    it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([3, 3, 4])) });

                    it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { limit: 1 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([3])) });
                    it("with limit 1000", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Day, async data => array.push(data), { limit: 1000 }).then(() => expect(array.map(data => data.value)).has.length(15).deep.equals([3, 3, 4, -10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                });

                describe("history for weeks", () => {
                    it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(12).deep.equals([-10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                    it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, UpdateResolution.Week, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([-5, 10, -10, 15])) });
                    it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, UpdateResolution.Week, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([-10, -5, 13, 8, -20, -10, 23, 13])) });
                    it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([-5, 9, -10, 14])) });

                    it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(8).deep.equals([-10, -5, 13, 9, -20, -10, 23, 14])) });
                    it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([-5, 8, -10, 13])) });

                    it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });
                    it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([-10, -5, -5])) });

                    it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { limit: 1 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([-10])) });
                    it("with limit 1000", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Week, async data => array.push(data), { limit: 1000 }).then(() => expect(array.map(data => data.value)).has.length(12).deep.equals([-10, -5, -5, 13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                });

                describe("history for months", () => {
                    it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(9).deep.equals([13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                    it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, UpdateResolution.Month, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([10, -10, 15])) });
                    it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, UpdateResolution.Month, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([13, 8, -20, -10, 23, 13])) });
                    it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([9, -10, 14])) });

                    it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([13, 9, -20, -10, 23, 14])) });
                    it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([8, -10, 13])) });

                    it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });
                    it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([13, 8, 9])) });

                    it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { limit: 1 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([13])) });
                    it("with limit 1000", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Month, async data => array.push(data), { limit: 1000 }).then(() => expect(array.map(data => data.value)).has.length(9).deep.equals([13, 8, 9, -20, -10, -10, 23, 13, 14])) });
                });

                describe("history for years", () => {
                    it("all from account 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([-20, -10, -10, 23, 13, 14])) });
                    it("all from account 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(2, UpdateResolution.Year, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([-10, 15])) });
                    it("all from account 3", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(3, UpdateResolution.Year, async data => array.push(data)).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });

                    it("account 1, depot 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { depot: 1 }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([-20, -10, 23, 13])) });
                    it("account 1, depot 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { depot: 2 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([-10, 14])) });

                    it("account 1, asset 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { asset: 1 }).then(() => expect(array.map(data => data.value)).has.length(4).deep.equals([-20, -10, 23, 14])) });
                    it("account 1, asset 2", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { asset: 2 }).then(() => expect(array.map(data => data.value)).has.length(2).deep.equals([-10, 13])) });

                    it("with start", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { start: end }).then(() => expect(array.map(data => data.value)).has.length(0).deep.equals([])) });
                    it("with end", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { end: start }).then(() => expect(array.map(data => data.value)).has.length(3).deep.equals([-20, -10, -10])) });

                    it("with limit 1", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { limit: 1 }).then(() => expect(array.map(data => data.value)).has.length(1).deep.equals([-20])) });
                    it("with limit 1000", async () => { const array = new Array<Balance.Update>; await repository.fetchUpdates(1, UpdateResolution.Year, async data => array.push(data), { limit: 1000 }).then(() => expect(array.map(data => data.value)).has.length(6).deep.equals([-20, -10, -10, 23, 13, 14])) });
                });
            });
        });

        describe("sum", () => {
            describe("get", () => {
                describe("history with end", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getUpdateSum(2, UpdateResolution.Day, { end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getUpdateSum(3, UpdateResolution.Day, { end });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { depot: 1, end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[9]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { depot: 2, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { asset: 1, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { asset: 2, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { start: end });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with end", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { limit: 1, end });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { limit: 1000, end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for days", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day);

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getUpdateSum(2, UpdateResolution.Day);

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getUpdateSum(3, UpdateResolution.Day);

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { depot: 1 });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[9]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { depot: 2 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { asset: 1 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { asset: 2 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { start: end });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with end", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Day, { limit: 1000 });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for weeks", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week);

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getUpdateSum(2, UpdateResolution.Week);

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getUpdateSum(3, UpdateResolution.Week);

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { depot: 1 });

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { depot: 2 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { asset: 1 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { asset: 2 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Week, { limit: 1000 });

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for months", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month);

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getUpdateSum(2, UpdateResolution.Month);

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getUpdateSum(3, UpdateResolution.Month);

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { depot: 1 });

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { depot: 2 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { asset: 1 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { asset: 2 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Month, { limit: 1000 });

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for years", () => {
                    it("all from account 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year);

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result = await repository.getUpdateSum(2, UpdateResolution.Year);

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result = await repository.getUpdateSum(3, UpdateResolution.Year);

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { depot: 1 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { depot: 2 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { asset: 1 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { asset: 2 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("with limit 1", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("with limit 1000", async () => {
                        const result = await repository.getUpdateSum(1, UpdateResolution.Year, { limit: 1000 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });
            });

            describe("fetch", () => {
                describe("history with end", () => {
                    it("all from account 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(2, UpdateResolution.Day, async data => result.push(data), { end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(3, UpdateResolution.Day, async data => result.push(data), { end });

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { depot: 1, end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[9]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { depot: 2, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { asset: 1, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { asset: 2, end });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { start: end });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with end", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { limit: 1, end });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { limit: 1000, end });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for days", () => {
                    it("all from account 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data));

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(2, UpdateResolution.Day, async data => result.push(data));

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(3, UpdateResolution.Day, async data => result.push(data));

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { depot: 1 });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[9]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { depot: 2 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 4 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { asset: 1 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { asset: 2 });

                        expect(result).has.length(5);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { start: end });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with end", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                    });

                    it("with limit 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                    });

                    it("with limit 1000", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Day, async data => result.push(data), { limit: 1000 });

                        expect(result).has.length(10);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 7 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 3 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[8]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[9]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for weeks", () => {
                    it("all from account 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data));

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(2, UpdateResolution.Week, async data => result.push(data));

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -5 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(3, UpdateResolution.Week, async data => result.push(data));

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { depot: 1 });

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[7]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { depot: 2 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -5 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { asset: 1 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { asset: 2 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                    });

                    it("with limit 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                    });

                    it("with limit 1000", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Week, async data => result.push(data), { limit: 1000 });

                        expect(result).has.length(8);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -15 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -5 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[6]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[7]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for months", () => {
                    it("all from account 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data));

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(2, UpdateResolution.Month, async data => result.push(data));

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: 10 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[2]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(3, UpdateResolution.Month, async data => result.push(data));

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { depot: 1 });

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: 13 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[5]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { depot: 2 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: 9 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { asset: 1 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { asset: 2 });

                        expect(result).has.length(3);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                    });

                    it("with limit 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                    });

                    it("with limit 1000", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Month, async data => result.push(data), { limit: 1000 });

                        expect(result).has.length(6);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: 22 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 8 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[4]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[5]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });

                describe("history for years", () => {
                    it("all from account 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data));

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("all from account 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(2, UpdateResolution.Year, async data => result.push(data));

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 2, depot: null, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 2, depot: null, asset: 1, value: 15 });
                    });

                    it("all from account 3", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(3, UpdateResolution.Year, async data => result.push(data));

                        expect(result).has.length(0);
                    });

                    it("account 1, depot 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { depot: 1 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: 1, asset: 1, value: -20 });
                        expect(result[1]).deep.contains({ account: 1, depot: 1, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: 1, asset: 1, value: 23 });
                        expect(result[3]).deep.contains({ account: 1, depot: 1, asset: 2, value: 13 });
                    });

                    it("account 1, depot 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { depot: 2 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: 2, asset: 1, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: 2, asset: 1, value: 14 });
                    });

                    it("account 1, asset 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { asset: 1 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                    });

                    it("account 1, asset 2", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { asset: 2 });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });

                    it("with start", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { start: end });

                        expect(result).has.length(0);
                    });

                    it("with end", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { end: start });

                        expect(result).has.length(2);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                    });

                    it("with limit 1", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { limit: 1 });

                        expect(result).has.length(1);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                    });

                    it("with limit 1000", async () => {
                        const result: Array<Update> = [];

                        await repository.fetchUpdateSum(1, UpdateResolution.Year, async data => result.push(data), { limit: 1000 });

                        expect(result).has.length(4);
                        expect(result[0]).deep.contains({ account: 1, depot: null, asset: 1, value: -30 });
                        expect(result[1]).deep.contains({ account: 1, depot: null, asset: 2, value: -10 });
                        expect(result[2]).deep.contains({ account: 1, depot: null, asset: 1, value: 37 });
                        expect(result[3]).deep.contains({ account: 1, depot: null, asset: 2, value: 13 });
                    });
                });
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