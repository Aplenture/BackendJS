/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../database";
import { EventType } from "../enums";
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
}

interface EventOptions extends UpdateOptions {
    readonly type?: EventType;
    readonly data?: string;
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

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const query = options.start || options.end
            ? `SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`
            : `SELECT * FROM ${this.data.updateTable} WHERE \`id\` IN (SELECT MAX(\`id\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`account\`,\`depot\`,\`asset\`)`;

        const result = await this.database.query(query, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }));
    }

    public async fetchUpdates(account: number, callback: (data: Update, index: number) => Promise<any>, options: UpdateOptions = {}): Promise<void> {
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

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        const query = options.start || options.end
            ? `SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`
            : `SELECT * FROM ${this.data.updateTable} WHERE \`id\` IN (SELECT MAX(\`id\`) FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} GROUP BY \`account\`,\`depot\`,\`asset\`)`;

        await this.database.fetch(query, async (data, index) => callback({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
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
            values.push(options.data);
            where.push('`data`=?');
        }

        const query = options.start || options.end
            ? `SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`
            : `SELECT * FROM ${this.data.eventTable} WHERE \`id\` IN (SELECT MAX(\`id\`) FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} GROUP BY \`account\`,\`depot\`,\`asset\`)`;

        const result = await this.database.query(query, values);

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
            values.push(options.data);
            where.push('`data`=?');
        }

        const query = options.start || options.end
            ? `SELECT * FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`
            : `SELECT * FROM ${this.data.eventTable} WHERE \`id\` IN (SELECT MAX(\`id\`) FROM ${this.data.eventTable} WHERE ${where.join(' AND ')} GROUP BY \`account\`,\`depot\`,\`asset\`)`;

        await this.database.fetch(query, async (data, index) => callback({
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

    public async updateBalance(data: UpdateData, type: EventType): Promise<Update> {
        const timestamp = Database.parseFromTime();

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
        LOCK TABLES ${this.data.eventTable} WRITE, ${this.data.updateTable} WRITE, ${this.data.updateTable} AS u READ;
            START TRANSACTION;
                INSERT INTO ${this.data.eventTable} (\`timestamp\`,\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`,\`value\`,\`data\`) VALUES (FROM_UNIXTIME(?),?,?,?,?,?,?,?);
                IF EXISTS (SELECT * FROM ${this.data.updateTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? LIMIT 1) THEN
                    INSERT INTO ${this.data.updateTable} (\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT FROM_UNIXTIME(?),?,?,?,?+\`value\` FROM ${this.data.updateTable} AS u WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`id\` DESC LIMIT 1;
                ELSE
                    INSERT INTO ${this.data.updateTable} (\`timestamp\`,\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (FROM_UNIXTIME(?),?,?,?,?);
                END IF;
                SELECT * FROM ${this.data.updateTable} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
            COMMIT;
        UNLOCK TABLES;`, [
            timestamp,
            type,
            data.account,
            data.depot,
            data.asset,
            data.order,
            change,
            data.data,
            data.account,
            data.depot,
            data.asset,
            timestamp,
            data.account,
            data.depot,
            data.asset,
            change,
            data.account,
            data.depot,
            data.asset,
            timestamp,
            data.account,
            data.depot,
            data.asset,
            change
        ]);

        return {
            id: result[4][0].id,
            timestamp: Database.parseToTime(result[4][0].timestamp),
            account: result[4][0].account,
            depot: result[4][0].depot,
            asset: result[4][0].asset,
            value: result[4][0].value
        };
    }

    public increase(update: UpdateData) {
        return this.updateBalance(update, EventType.Increase);
    }

    public decrease(data: UpdateData): Promise<Update> {
        return this.updateBalance(data, EventType.Decrease);
    }
}