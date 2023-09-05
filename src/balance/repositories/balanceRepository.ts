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

interface UpdateData {
    readonly account: number;
    readonly depot: number;
    readonly asset: number;
    readonly product: number;
    readonly value: number;
    readonly data: string;
}

interface HistoryOptions {
    readonly depot?: number;
    readonly asset?: number;
    readonly start?: number;
    readonly end?: number;
}

interface UpdateOptions extends HistoryOptions {
    readonly data?: string;
}

export class BalanceRepository extends Database.Repository<Tables> {
    public async getCurrent(account: number, depot: number, asset: number): Promise<Balance | null> {
        const response = await this.database.query(`SELECT * FROM ${this.data.balanceTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? ORDER BY \`id\` DESC LIMIT 1`, [
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

    public async fetchUpdates(account: number, options: UpdateOptions = {}, callback: (data: Update, index: number) => Promise<any>): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];

        if (options.depot) {
            values.push(options.depot);
            where.push('`depot`=?');
        }

        if (options.asset) {
            values.push(options.asset);
            where.push('`asset`=?');
        }

        if (options.data) {
            values.push(options.data);
            where.push('`data`=?');
        }

        if (options.start) {
            values.push(Database.parseFromTime(options.start));
            where.push('`timestamp`>=?');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.balanceTable} ${where.join(' AND ')}`, async (data, index) => callback({
            id: data.id,
            timestamp: Database.parseToTime(data.timestamp),
            type: data.type,
            account: data.account,
            depot: data.depot,
            asset: data.asset,
            product: data.product,
            change: data.change,
            data: data.data
        }, index), values);
    }

    public async fetchHistory(account: number, options: HistoryOptions = {}, callback: (data: Balance, index: number) => Promise<any>): Promise<void> {
        const values: any[] = [account];
        const where = ['`account`=?'];

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
            where.push('`timestamp`>=?');
        }

        if (options.end) {
            values.push(Database.parseFromTime(options.end));
            where.push('`timestamp`<=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.historyTable} ${where.join(' AND ')}`, async (data, index) => callback({
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
            INSERT INTO ${this.data.updateTable} (\`type\`,\`account\`,\`depot\`,\`asset\`,\`product\`,\`change\`,\`data\`) VALUES (?,?,?,?,?,?,?);
            INSERT INTO ${this.data.balanceTable} (\`account\`,\`depot\`,\`asset\`,\`value\`) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE \`value\`=\`value\`+?;
            SELECT * FROM ${this.data.balanceTable} WHERE \`account\`=? AND \`depot\`=? AND \`asset\`=? LIMIT 1;
            UNLOCK TABLES;
        `, [
            type,
            data.account,
            data.depot,
            data.asset,
            data.product,
            change,
            data.data,
            data.account,
            data.depot,
            data.asset,
            data.value,
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

    public async updateHistory(): Promise<void> {
        await this.database.query(`
            LOCK TABLES ${this.data.historyTable} WRITE, ${this.data.updateTable} WRITE, ${this.data.balanceTable} WRITE;
            INSERT INTO ${this.data.historyTable} (\`account\`,\`depot\`,\`asset\`,\`value\`) SELECT \`account\`,\`depot\`,\`asset\`,\`value\` FROM ${this.data.balanceTable};
            UNLOCK TABLES;
        `);
    }
}