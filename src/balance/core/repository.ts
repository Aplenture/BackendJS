/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import * as Database from "../../database";
import { EventType, UpdateResolution } from "../enums";
import { Event, Update } from "../models";
import { Tables } from "../models/tables";

interface UpdateData {
    readonly date?: Date;
    readonly account: number;
    readonly depot: number;
    readonly asset: number;
    readonly order: number;
    readonly value: number;
    readonly data: string;
}

interface BalanceOptions {
    readonly time?: number;
    readonly depot?: number;
    readonly asset?: number;
    readonly limit?: number;
}

interface UpdateOptions {
    readonly start?: number;
    readonly end?: number;
    readonly depot?: number;
    readonly asset?: number;
    readonly limit?: number;
}

interface EventOptions {
    readonly start?: number;
    readonly end?: number;
    readonly depot?: number;
    readonly asset?: number;
    readonly limit?: number;
    readonly type?: EventType;
    readonly data?: string | readonly string[];
}

interface EventSumOptions extends EventOptions {
    readonly groupDepots?: boolean;
}

export class Repository extends Database.Repository<Tables> {
    constructor(
        data: Tables,
        database: Database.Database
    ) {
        super(data, database, __dirname + '/../updates');

        if (!database.allowsMultipleStatements)
            throw new Error('database needs to support multiple statements for Update repository');
    }

    public async getBalance(account: number, options: BalanceOptions = {}): Promise<Update[]> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            UpdateResolution.Day
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.time) {
            values.push(Database.parseFromTime(options.time));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data.updateTable} WHERE \`timestamp\` IN (SELECT MAX(\`timestamp\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AND ${where.join(' AND ')} ${limit}`, [].concat(values, values));

        if (!result.length)
            return [];

        return result.map(data => ({
            timestamp: Database.parseToTime(data.timestamp),
            resolution: data.resolution,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }));
    }

    public async fetchBalances(account: number, callback: (data: Update, index: number) => Promise<any>, options: BalanceOptions = {}): Promise<void> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            UpdateResolution.Day
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.time) {
            values.push(Database.parseFromTime(options.time));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.updateTable} WHERE \`timestamp\` IN (SELECT MAX(\`timestamp\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AND ${where.join(' AND ')} ${limit}`, async (data, index) => callback({
            timestamp: Database.parseToTime(data.timestamp),
            resolution: data.resolution,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }, index), [].concat(values, values));
    }

    public async getBalanceSum(account: number, options: BalanceOptions = {}): Promise<Update[]> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            UpdateResolution.Day
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.time) {
            values.push(Database.parseFromTime(options.time));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const result = await this.database.query(`SELECT *,SUM(\`value\`) AS \`value\` FROM ${this.data.updateTable} WHERE \`timestamp\` IN (SELECT MAX(\`timestamp\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AND ${where.join(' AND ')} GROUP BY \`timestamp\`,\`asset\` ORDER BY \`timestamp\` ASC ${limit}`, [].concat(values, values));

        if (!result.length)
            return [];

        return result.map(data => ({
            timestamp: data.timestamp,
            resolution: data.resolut,
            account,
            depot: options.depot ?? null,
            asset: data.asset,
            value: data.value || 0
        }));
    }

    public async fetchBalanceSum(account: number, callback: (data: Update, index: number) => Promise<any>, options: BalanceOptions = {}): Promise<void> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            UpdateResolution.Day
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.time) {
            values.push(Database.parseFromTime(options.time));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        await this.database.fetch(`SELECT *,SUM(\`value\`) AS \`value\` FROM ${this.data.updateTable} WHERE \`timestamp\` IN (SELECT MAX(\`timestamp\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AND ${where.join(' AND ')} GROUP BY \`timestamp\`,\`asset\` ORDER BY \`timestamp\` ASC ${limit}`, async (data, index) => callback({
            timestamp: data.timestamp,
            resolution: data.resolut,
            account,
            depot: options.depot ?? null,
            asset: data.asset,
            value: data.value || 0
        }, index), [].concat(values, values));
    }

    public async getUpdates(account: number, resolution: UpdateResolution, options: UpdateOptions = {}): Promise<Update[]> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            resolution
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC ${limit}`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            timestamp: Database.parseToTime(data.timestamp),
            resolution: data.resolution,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }));
    }

    public async fetchUpdates(account: number, resolution: UpdateResolution, callback: (data: Update, index: number) => Promise<any>, options: UpdateOptions = {}): Promise<void> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            resolution
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC ${limit}`, async (data, index) => callback({
            timestamp: Database.parseToTime(data.timestamp),
            resolution: data.resolution,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }, index), values);
    }

    public async getUpdateSum(account: number, resolution: UpdateResolution, options: UpdateOptions = {}): Promise<Update[]> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            resolution
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const result = await this.database.query(`SELECT *,SUM(\`value\`) AS \`value\` FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`timestamp\`,\`asset\` ORDER BY \`timestamp\` ASC ${limit}`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            timestamp: data.timestamp,
            resolution: data.resolut,
            account,
            depot: options.depot ?? null,
            asset: data.asset,
            value: data.value || 0
        }));
    }

    public async fetchUpdateSum(account: number, resolution: UpdateResolution, callback: (data: Update, index: number) => Promise<any>, options: UpdateOptions = {}): Promise<void> {
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        const values: any[] = [
            account,
            resolution
        ];

        const where = [
            '`account`=?',
            '`resolution`=?'
        ];

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        await this.database.fetch(`SELECT *,SUM(\`value\`) AS \`value\` FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`timestamp\`,\`asset\` ORDER BY \`timestamp\` ASC ${limit}`, async (data, index) => callback({
            timestamp: data.timestamp,
            resolution: data.resolut,
            account,
            depot: options.depot ?? null,
            asset: data.asset,
            value: data.value || 0
        }, index), values);
    }

    public async getEvents(account: number, options: EventOptions = {}): Promise<Event[]> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (undefined != options.data) {
            if (Array.isArray(options.data)) {
                values.push(...options.data);
                where.push(`\`data\` IN (${options.data.map(() => '?').join(',')})`);
            } else {
                values.push(options.data);
                where.push('`data`=?');
            }
        }

        const result = await this.database.query(`SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC ${limit}`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            order: data.order,
            value: data.value,
            data: data.data
        }));
    }

    public async fetchEvents(account: number, callback: (data: Event, index: number) => Promise<any>, options: EventOptions = {}): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const limit = options.limit
            ? "LIMIT " + options.limit
            : "";

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (undefined != options.data) {
            if (Array.isArray(options.data)) {
                values.push(...options.data);
                where.push(`\`data\` IN (${options.data.map(() => '?').join(',')})`);
            } else {
                values.push(options.data);
                where.push('`data`=?');
            }
        }

        await this.database.fetch(`SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC ${limit}`, async (data, index) => callback({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            order: data.order,
            value: data.value,
            data: data.data
        }, index), values);
    }

    public async getEventSum(account: number, options: EventSumOptions = {}): Promise<Event[]> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const groups = ['`asset`'];

        if (options.groupDepots) {
            groups.push('`depot`');
        }

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (undefined != options.data) {
            if (Array.isArray(options.data)) {
                values.push(...options.data);
                where.push(`\`data\` IN (${options.data.map(() => '?').join(',')})`);
            } else {
                values.push(options.data);
                where.push('`data`=?');
            }
        }

        const result = await this.database.query(`SELECT \`depot\`,\`asset\`,SUM(IF(\`type\`>0,\`value\`,-\`value\`)) AS \`value\`,MAX(\`timestamp\`) as \`timestamp\` FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} GROUP BY ${groups.join(',')}`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account,
            depot: options.groupDepots ? data.depot : options.depot ?? null,
            asset: data.asset,
            order: data.order,
            value: data.value || 0,
            data: data.data
        }));
    }

    public async fetchEventSum(account: number, callback: (data: Event, index: number) => Promise<any>, options: EventSumOptions = {}): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const groups = ['`asset`'];

        if (options.groupDepots) {
            groups.push('`depot`');
        }

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (undefined != options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (undefined != options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (undefined != options.data) {
            if (Array.isArray(options.data)) {
                values.push(...options.data);
                where.push(`\`data\` IN (${options.data.map(() => '?').join(',')})`);
            } else {
                values.push(options.data);
                where.push('`data`=?');
            }
        }

        await this.database.fetch(`SELECT \`depot\`,\`asset\`,SUM(IF(\`type\`>0,\`value\`,-\`value\`)) AS \`value\`,MAX(\`timestamp\`) as \`timestamp\` FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} GROUP BY ${groups.join(',')}`, async (data, index) => callback({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account,
            depot: options.groupDepots ? data.depot : options.depot ?? null,
            asset: data.asset,
            order: data.order,
            value: data.value || 0,
            data: data.data
        }, index), values);
    }

    public async addEvent(data: UpdateData, type: EventType): Promise<Update> {
        const date = data.date ?? new Date();
        const now = Database.parseFromTime(Number(date));
        const day = Database.parseFromTime(Number(CoreJS.calcDate({ date })));
        const week = Database.parseFromTime(Number(CoreJS.calcDate({ date, weekDay: CoreJS.WeekDay.Monday })));
        const month = Database.parseFromTime(Number(CoreJS.calcDate({ date, monthDay: 1 })));
        const year = Database.parseFromTime(Number(CoreJS.calcDate({ date, monthDay: 1, month: CoreJS.Month.January })));
        const values = [];

        let change: number;

        switch (type) {
            case EventType.Increase:
                change = data.value;
                break;

            case EventType.Decrease:
                change = -data.value;
                break;

            default:
                throw new Error(`unhandled update type '${type}'`);
        }

        // first lock tables
        let query = `LOCK TABLES ${this.data.eventTable} WRITE, ${this.data.updateTable} WRITE, ${this.data.updateTable} u READ;`;

        // insert new event
        query += `INSERT INTO ${this.data.eventTable} (\`timestamp\`,\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`,\`value\`,\`data\`) VALUES (FROM_UNIXTIME(?),?,?,?,?,?,?,?);`;
        values.push(now, type, data.account, data.depot, data.asset, data.order, data.value, data.data);

        // insert resolution year if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,?,@value);`;
        values.push(year, data.account, data.depot, data.asset, UpdateResolution.Year, year, data.account, data.depot, data.asset);

        // insert resolution month if not exists
        query += `INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),u.account,u.depot,u.asset,u.value FROM ${this.data.updateTable} u WHERE \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1;`;
        values.push(UpdateResolution.Month, month, month, data.account, data.depot, data.asset);

        // insert resolution week if not exists
        query += `INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),u.account,u.depot,u.asset,u.value FROM ${this.data.updateTable} u WHERE \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1;`;
        values.push(UpdateResolution.Week, week, week, data.account, data.depot, data.asset);

        // insert resolution day if not exists
        query += `INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),u.account,u.depot,u.asset,u.value FROM ${this.data.updateTable} u WHERE \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1;`;
        values.push(UpdateResolution.Day, day, day, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution day
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Day, day, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution day
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Week, week, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution day
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Month, month, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution day
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Year, year, data.account, data.depot, data.asset);

        // select latest update
        query += `SELECT * FROM ${this.data.updateTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1;`;
        values.push(data.account, data.depot, data.asset);

        // finaly unlock tables
        query += `UNLOCK TABLES;`;

        const result = await this.database.query(query, values);

        return {
            timestamp: Database.parseToTime(result[11][0].timestamp),
            resolution: result[11][0].resolution,
            account: result[11][0].account,
            depot: result[11][0].depot,
            asset: result[11][0].asset,
            value: result[11][0].value
        };
    }

    public increase(update: UpdateData) {
        return this.addEvent(update, EventType.Increase);
    }

    public decrease(data: UpdateData): Promise<Update> {
        return this.addEvent(data, EventType.Decrease);
    }
}