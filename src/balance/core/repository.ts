/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../database";
import { UpdateType } from "../enums";
import { Balance, Update } from "../models";
import { Tables } from "../models/tables";

const MAX_FETCH_LIMIT = 1000;

interface UpdateData {
    readonly account: number;
    readonly depot: number;
    readonly order: number;
    readonly asset: number;
    readonly value: number;
    readonly data: string;
}

interface HistoryOptions {
    readonly depot?: number;
    readonly asset?: number;
    readonly start?: number;
    readonly end?: number;
    readonly limit?: number;
}

interface UpdateOptions extends HistoryOptions {
    readonly firstID?: number;
    readonly lastID?: number;
    readonly data?: string;
}

interface FetchCurrentOptions {
    readonly depot?: number;
    readonly asset?: number;
    readonly firstDepotID?: number;
    readonly lastDepotID?: number;
    readonly limit?: number;
}

export class Repository extends Database.Repository<Tables> {
    constructor(
        data: Tables,
        database: Database.Database
    ) {
        super(data, database, __dirname + '/../updates');

        if (!database.allowsMultipleStatements)
            throw new Error('database needs to support multiple statements for balance repository');
    }

    public async getCurrent(account: number, depot: number, asset: number): Promise<Balance | null> {
        const response = await this.database.query(`SELECT * FROM ${this.data.balanceTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? LIMIT 1`, [
            account,
            depot,
            asset
        ]);

        if (!response.length)
            return null;

        return {
            timestamp: Database.parseToTime(response[0].timestamp),
            account: response[0].account,
            depot: response[0].depot,
            asset: response[0].asset,
            value: response[0].value
        };
    }

    public async fetchCurrent(account: number, callback: (data: Balance, index: number) => Promise<any>, options: FetchCurrentOptions = {}): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const limit = Math.min(MAX_FETCH_LIMIT, options.limit || MAX_FETCH_LIMIT);

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (options.firstDepotID) {
            values.push(options.firstDepotID);
            where.push('`depot`>=?');
        }

        if (options.lastDepotID) {
            values.push(options.lastDepotID);
            where.push('`depot`<=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.balanceTable} WHERE ${where.join(' AND ')} ORDER BY \`depot\` ASC LIMIT ${limit}`, async (data, index) => callback({
            timestamp: Database.parseToTime(data.timestamp),
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }, index), values);
    }

    public async getUpdates(account: number, options: UpdateOptions = {}): Promise<Update[]> {
        const result = [];

        await this.fetchUpdates(account, async data => result.push(data), options);

        return result;
    }

    public async fetchUpdates(account: number, callback: (data: Update, index: number) => Promise<any>, options: UpdateOptions = {}): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const limit = Math.min(MAX_FETCH_LIMIT, options.limit || MAX_FETCH_LIMIT);

        if (options.firstID) {
            values.push(options.firstID);
            where.push('`id`>=?');
        }

        if (options.lastID) {
            values.push(options.lastID);
            where.push('`id`<=?');
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

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.updateTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`, async (data, index) => callback({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account: data.account,
            depot: data.depot,
            order: data.order,
            asset: data.asset,
            change: data.change,
            data: data.data
        }, index), values);
    }

    public async getHistory(account: number, options: HistoryOptions = {}): Promise<Balance[]> {
        const result = [];

        await this.fetchHistory(account, async data => result.push(data), options);

        return result;
    }

    public async fetchHistory(account: number, callback: (data: Balance, index: number) => Promise<any>, options: HistoryOptions = {}): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];
        const limit = Math.min(MAX_FETCH_LIMIT, options.limit || MAX_FETCH_LIMIT);

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=FROM_UNIXTIME(?)');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=FROM_UNIXTIME(?)');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.historyTable} WHERE ${where.join(' AND ')} LIMIT ${limit}`, async (data, index) => callback({
            timestamp: Database.parseToTime(data.timestamp),
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            value: data.value
        }, index), values);
    }

    public async updateBalance(data: UpdateData, type: UpdateType): Promise<Balance> {
        let change: number;

        switch (type) {
            case UpdateType.Increase:
                change = data.value;
                break;

            case UpdateType.Decrease:
                change = -data.value;
                break;

            default:
                throw new Error(`unhandled update type '${type}'`);
        }

        const result = await this.database.query(`
            LOCK TABLES ${this.data.updateTable} WRITE, ${this.data.balanceTable} WRITE;
            INSERT INTO ${this.data.updateTable} (\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`,\`change\`,\`data\`) VALUES (?,?,?,?,?,?,?);
            INSERT INTO ${this.data.balanceTable} (\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE \`value\`=\`value\`+?;
            SELECT * FROM ${this.data.balanceTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? LIMIT 1;
            UNLOCK TABLES;
        `, [
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
            change,
            change,
            data.account,
            data.depot,
            data.asset
        ]);

        return {
            timestamp: Database.parseToTime(result[3][0].timestamp),
            account: result[3][0].account,
            depot: result[3][0].depot,
            asset: result[3][0].asset,
            value: result[3][0].value
        };
    }

    public increase(update: UpdateData) {
        return this.updateBalance(update, UpdateType.Increase);
    }

    public decrease(data: UpdateData): Promise<Balance> {
        return this.updateBalance(data, UpdateType.Decrease);
    }

    public async updateHistory(): Promise<boolean> {
        // skip if history is up to date
        if ((await this.database.query(`SELECT * FROM ${this.data.historyTable} WHERE \`timestamp\`=NOW() LIMIT 1`)).length)
            return false;

        await this.database.query(`
            LOCK TABLES ${this.data.historyTable} WRITE, ${this.data.updateTable} WRITE, ${this.data.balanceTable} WRITE;
            INSERT INTO ${this.data.historyTable} (\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT \`account\`,\`depot\`,\`asset\`,\`value\` FROM ${this.data.balanceTable};
            UNLOCK TABLES;
        `);

        return true;
    }
}