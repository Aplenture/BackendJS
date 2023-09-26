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

const MAX_GET_LIMIT = 1000;
const MAX_FETCH_LIMIT = 10000;

interface UpdateData {
    readonly account: number;
    readonly depot: number;
    readonly asset: number;
    readonly order: number;
    readonly value: number;
    readonly data: string;
}

interface UpdateOptions {
    readonly start?: number;
    readonly end?: number;
    readonly depot?: number;
    readonly asset?: number;
    readonly limit?: number;
    readonly resolution?: UpdateResolution;
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

export class Repository extends Database.Repository<Tables> {
    constructor(
        data: Tables,
        database: Database.Database
    ) {
        super(data, database, __dirname + '/../updates');

        if (!database.allowsMultipleStatements)
            throw new Error('database needs to support multiple statements for Update repository');
    }

    public async getUpdates(account: number, options: UpdateOptions = {}): Promise<Update[]> {
        const limit = Math.min(MAX_GET_LIMIT, options.limit || MAX_GET_LIMIT);

        const resolution = options.start || options.end
            ? options.resolution || UpdateResolution.Day
            : options.resolution || UpdateResolution.None;

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

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC LIMIT ${limit}`, values);

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

    public async fetchUpdates(account: number, callback: (data: Update, index: number) => Promise<any>, options: UpdateOptions = {}): Promise<void> {
        const limit = Math.min(MAX_FETCH_LIMIT, options.limit || MAX_FETCH_LIMIT);

        const resolution = options.start || options.end
            ? options.resolution || UpdateResolution.Day
            : options.resolution || UpdateResolution.None;

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

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} ORDER BY \`timestamp\` ASC LIMIT ${limit}`, async (data, index) => callback({
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
        const limit = Math.min(MAX_GET_LIMIT, options.limit || MAX_GET_LIMIT);

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
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

        const result = await this.database.query(`SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} ORDER BY \`id\` ASC LIMIT ${limit}`, values);

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
        const limit = Math.min(MAX_FETCH_LIMIT, options.limit || MAX_FETCH_LIMIT);

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        if (options.type) {
            values.push(options.type);
            where.push('`type`=?');
        }

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
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

        await this.database.fetch(`SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} ORDER BY \`id\` ASC LIMIT ${limit}`, async (data, index) => callback({
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

    public async updateBalance(data: UpdateData, type: EventType, date = new Date()): Promise<Update> {
        const now = Database.parseFromTime(Number(date));
        const day = Database.parseFromTime(Number(CoreJS.calcUTCDate({ date })));
        const week = Database.parseFromTime(Number(CoreJS.calcUTCDate({ date, weekDay: CoreJS.WeekDay.Monday })));
        const month = Database.parseFromTime(Number(CoreJS.calcUTCDate({ date, monthDay: 1 })));
        const year = Database.parseFromTime(Number(CoreJS.calcUTCDate({ date, monthDay: 1, month: CoreJS.Month.January })));

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

        const result = await this.database.query(`
        LOCK TABLES ${this.data.eventTable} WRITE, ${this.data.updateTable} WRITE;
            START TRANSACTION;
                INSERT INTO ${this.data.eventTable} (\`timestamp\`,\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`,\`value\`,\`data\`) VALUES (FROM_UNIXTIME(?),?,?,?,?,?,?,?);
                INSERT INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,0,?,?,?,?) ON DUPLICATE KEY UPDATE \`value\`=\`value\`+?,\`timestamp\`=0;
                INSERT INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),?,?,?,u.value FROM ${this.data.updateTable} u WHERE \`resolution\`=? AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ON DUPLICATE KEY UPDATE \`value\`=${this.data.updateTable}.value+?,\`timestamp\`=${this.data.updateTable}.timestamp;
                INSERT INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),?,?,?,u.value FROM ${this.data.updateTable} u WHERE \`resolution\`=? AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ON DUPLICATE KEY UPDATE \`value\`=${this.data.updateTable}.value+?,\`timestamp\`=${this.data.updateTable}.timestamp;
                INSERT INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),?,?,?,u.value FROM ${this.data.updateTable} u WHERE \`resolution\`=? AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ON DUPLICATE KEY UPDATE \`value\`=${this.data.updateTable}.value+?,\`timestamp\`=${this.data.updateTable}.timestamp;
                INSERT INTO ${this.data.updateTable} (\`resolution\`,\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT ?,FROM_UNIXTIME(?),?,?,?,u.value FROM ${this.data.updateTable} u WHERE \`resolution\`=? AND \`account\`=? AND \`depot\`=? AND \`asset\`=? ON DUPLICATE KEY UPDATE \`value\`=${this.data.updateTable}.value+?,\`timestamp\`=${this.data.updateTable}.timestamp;
                SELECT * FROM ${this.data.updateTable} WHERE \`resolution\`=? AND \`account\`=? AND \`depot\`=? AND \`asset\`=?;
            COMMIT;
        UNLOCK TABLES;`, [
            now,
            type,
            data.account,
            data.depot,
            data.asset,
            data.order,
            data.value,
            data.data,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset,
            change,
            change,
            UpdateResolution.Day,
            day,
            data.account,
            data.depot,
            data.asset,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset,
            change,
            UpdateResolution.Week,
            week,
            data.account,
            data.depot,
            data.asset,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset,
            change,
            UpdateResolution.Month,
            month,
            data.account,
            data.depot,
            data.asset,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset,
            change,
            UpdateResolution.Year,
            year,
            data.account,
            data.depot,
            data.asset,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset,
            change,
            UpdateResolution.None,
            data.account,
            data.depot,
            data.asset
        ]);

        return {
            timestamp: Database.parseToTime(result[8][0].timestamp),
            resolution: result[8][0].resolution,
            account: result[8][0].account,
            depot: result[8][0].depot,
            asset: result[8][0].asset,
            value: result[8][0].value
        };
    }

    public increase(update: UpdateData, date?: Date) {
        return this.updateBalance(update, EventType.Increase, date);
    }

    public decrease(data: UpdateData, date?: Date): Promise<Update> {
        return this.updateBalance(data, EventType.Decrease, date);
    }
}