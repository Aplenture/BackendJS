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
        } else {
            where.push('`depot`!=0');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        values.push(account, UpdateResolution.Day);

        const result = await this.database.query(`SELECT * FROM ${this.data.updateTable} tmp1, (SELECT MAX(\`timestamp\`) AS \`timestamp\`,\`depot\`,\`asset\` FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AS tmp2 WHERE tmp1.account=? AND tmp1.resolution=? AND tmp1.timestamp=tmp2.timestamp AND tmp1.depot=tmp2.depot AND tmp1.asset=tmp2.asset ${limit}`, values);

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
        } else {
            where.push('`depot`!=0');
        }

        if (undefined != options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        values.push(account, UpdateResolution.Day);

        await this.database.fetch(`SELECT * FROM ${this.data.updateTable} tmp1, (SELECT MAX(\`timestamp\`) AS \`timestamp\`,\`depot\`,\`asset\` FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`asset\`,\`depot\`) AS tmp2 WHERE tmp1.account=? AND tmp1.resolution=? AND tmp1.timestamp=tmp2.timestamp AND tmp1.depot=tmp2.depot AND tmp1.asset=tmp2.asset ${limit}`, async (data, index) => callback({
            timestamp: Database.parseToTime(data.timestamp),
            resolution: data.resolution,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }, index), values);
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
        } else {
            where.push('`depot`!=0');
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
        } else {
            where.push('`depot`!=0');
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
        if (!data.account)
            throw new Error(`invalid account '${data.account}'`);

        if (!data.depot)
            throw new Error(`invalid depot '${data.depot}'`);

        if (!data.asset)
            throw new Error(`invalid asset '${data.asset}'`);

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
        let query = `LOCK TABLES ${this.data.eventTable} WRITE, ${this.data.updateTable} WRITE;`;

        // insert new event
        query += `INSERT INTO ${this.data.eventTable} (\`timestamp\`,\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`,\`value\`,\`data\`) VALUES (FROM_UNIXTIME(?),?,?,?,?,?,?,?);`;
        values.push(now, type, data.account, data.depot, data.asset, data.order, data.value, data.data);

        // insert resolution year for depot 0 if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,@value);`;
        values.push(UpdateResolution.Year, year, data.account, data.asset, UpdateResolution.Year, year, data.account, data.asset);

        // insert resolution year for depot x if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,?,@value);`;
        values.push(UpdateResolution.Year, year, data.account, data.depot, data.asset, UpdateResolution.Year, year, data.account, data.depot, data.asset);

        // insert resolution month for depot 0 if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,@value);`;
        values.push(UpdateResolution.Month, month, data.account, data.asset, UpdateResolution.Month, month, data.account, data.asset);

        // insert resolution month for depot x if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,?,@value);`;
        values.push(UpdateResolution.Month, month, data.account, data.depot, data.asset, UpdateResolution.Month, month, data.account, data.depot, data.asset);

        // insert resolution week for depot 0 if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,@value);`;
        values.push(UpdateResolution.Week, week, data.account, data.asset, UpdateResolution.Week, week, data.account, data.asset);

        // insert resolution week for depot x if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,?,@value);`;
        values.push(UpdateResolution.Week, week, data.account, data.depot, data.asset, UpdateResolution.Week, week, data.account, data.depot, data.asset);

        // insert resolution day for depot 0 if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,@value);`;
        values.push(UpdateResolution.Day, day, data.account, data.asset, UpdateResolution.Day, day, data.account, data.asset);

        // insert resolution day for depot x if not exists
        query += `SELECT @value := COALESCE((SELECT \`value\` FROM ${this.data.updateTable} WHERE \`resolution\`<=? AND \`timestamp\`<FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1),0); INSERT IGNORE INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,FROM_UNIXTIME(?),?,?,?,@value);`;
        values.push(UpdateResolution.Day, day, data.account, data.depot, data.asset, UpdateResolution.Day, day, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution day for depot 0
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Day, day, data.account, data.asset);

        // update all existing subsequent updates with resolution day for depot x
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Day, day, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution week for depot 0
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Week, week, data.account, data.asset);

        // update all existing subsequent updates with resolution week for depot x
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Week, week, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution month for depot 0
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Month, month, data.account, data.asset);

        // update all existing subsequent updates with resolution month for depot x
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Month, month, data.account, data.depot, data.asset);

        // update all existing subsequent updates with resolution year for depot 0
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=0 AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Year, year, data.account, data.asset);

        // update all existing subsequent updates with resolution year for depot x
        query += `UPDATE ${this.data.updateTable} SET \`value\`=\`value\`+?,\`timestamp\`=\`timestamp\` WHERE \`resolution\`=? AND \`timestamp\`>=FROM_UNIXTIME(?) AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;`;
        values.push(change, UpdateResolution.Year, year, data.account, data.depot, data.asset);

        // select latest update
        query += `SELECT * FROM ${this.data.updateTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`timestamp\` DESC LIMIT 1;`;
        values.push(data.account, data.depot, data.asset);

        // finaly unlock tables
        query += `UNLOCK TABLES;`;

        const result = await this.database.query(query, values);

        return {
            timestamp: Database.parseToTime(result[26][0].timestamp),
            resolution: result[26][0].resolution,
            account: result[26][0].account,
            depot: result[26][0].depot,
            asset: result[26][0].asset,
            value: result[26][0].value
        };
    }

    public async removeEvent(id: number): Promise<Update> {
        const values = [];

        // first lock tables
        let query = `LOCK TABLES ${this.data.eventTable} WRITE, ${this.data.eventTable} e READ, ${this.data.updateTable} u WRITE;`;

        // update all existing subsequent updates with resolution day for depot 0
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=0 AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=0 AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Day, id, UpdateResolution.Day);

        // update all existing subsequent updates with resolution day for depot x
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Day, id, UpdateResolution.Day);

        // update all existing subsequent updates with resolution week for depot 0
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=0 AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=0 AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Week, id, UpdateResolution.Week);

        // update all existing subsequent updates with resolution week for depot x
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Week, id, UpdateResolution.Week);

        // update all existing subsequent updates with resolution month for depot 0
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=0 AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=0 AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Month, id, UpdateResolution.Month);

        // update all existing subsequent updates with resolution month for depot x
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Month, id, UpdateResolution.Month);

        // update all existing subsequent updates with resolution year for depot 0
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=0 AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=0 AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Year, id, UpdateResolution.Year);

        // update all existing subsequent updates with resolution year for depot x
        query += `SELECT @value := COALESCE((SELECT u.timestamp FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.resolution<=? AND u.timestamp<=e.timestamp AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1),0); UPDATE ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? SET u.value=u.value-IF(e.type<0,-e.value,e.value),u.timestamp=u.timestamp WHERE u.resolution=? AND u.timestamp>=@value AND u.account=e.account AND u.depot=e.depot AND u.asset=e.asset;`;
        values.push(id, UpdateResolution.Year, id, UpdateResolution.Year);

        // select latest update
        query += `SELECT u.* FROM ${this.data.updateTable} u JOIN ${this.data.eventTable} e ON e.id=? WHERE u.account=e.account AND u.depot=e.depot AND u.asset=e.asset ORDER BY u.timestamp DESC LIMIT 1;`;
        values.push(id);

        // remove event
        query += `DELETE FROM ${this.data.eventTable} WHERE \`id\`=?;`;
        values.push(id);

        // finaly unlock tables
        query += `UNLOCK TABLES;`;

        const result = await this.database.query(query, values);

        return {
            timestamp: Database.parseToTime(result[17][0].timestamp),
            resolution: result[17][0].resolution,
            account: result[17][0].account,
            depot: result[17][0].depot,
            asset: result[17][0].asset,
            value: result[17][0].value
        };
    }

    public increase(update: UpdateData) {
        return this.addEvent(update, EventType.Increase);
    }

    public decrease(data: UpdateData): Promise<Update> {
        return this.addEvent(data, EventType.Decrease);
    }
}