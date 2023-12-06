/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Access } from "../models";
import { Repository } from "../../database";
import { Database } from "../..";

interface CreateOptions {
    readonly rights?: number;
    readonly expirationDuration?: number;
    readonly label?: string;
}

export class AccessRepository extends Repository<string> {
    public async hasAccess(api: string): Promise<boolean> {
        const result = await this.database.query(`SELECT UNIX_TIMESTAMP(\`expiration\`) FROM ${this.data} WHERE \`api\`=? AND (\`expiration\`>NOW() OR \`expiration\` IS NULL)`, [api]);

        if (!result.length)
            return false;

        return true;
    }

    public async getByAPI(api: string): Promise<Access | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE \`api\`=? LIMIT 1`, [api]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: Database.parseToTime(result[0].created),
            expiration: Database.parseToTime(result[0].expiration),
            account: result[0].account,
            api: result[0].api,
            secret: result[0].secret,
            rights: result[0].rights,
            label: result[0].label
        };
    }

    public async getByAccount(account: number): Promise<readonly Access[]> {
        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE \`account\`=? AND (\`expiration\`>NOW() OR \`expiration\` IS NULL)`, [account]);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            created: Database.parseToTime(data.created),
            expiration: Database.parseToTime(data.expiration),
            account: data.account,
            api: data.api,
            secret: '',
            rights: data.rights,
            label: data.label
        }));
    }

    public async create(account: number, options: CreateOptions = {}): Promise<Access> {
        const api = CoreJS.BigMath.toHex(CoreJS.random(32));
        const secret = CoreJS.BigMath.toHex(CoreJS.random(32));
        const created = Database.trimTime();
        const rights = options.rights || ~0;
        const label = options.label || '';
        const expiration = options.expirationDuration
            ? created + options.expirationDuration
            : null;

        const keys = ['`created`', '`account`', '`api`', '`secret`', '`label`', '`rights`'];
        const values = ['?', '?', '?', '?', '?', '?'];

        const args = [
            Database.parseFromTime(created),
            account,
            api,
            secret,
            label,
            rights
        ];

        if (expiration) {
            keys.push('`expiration`');
            values.push('?');
            args.push(Database.parseFromTime(expiration));
        }

        const result = await this.database.query(`INSERT INTO ${this.data} (${keys.join(',')}) VALUES (${values.join(',')})`, args);

        return {
            id: result.insertId,
            created,
            account,
            api,
            secret,
            rights,
            expiration,
            label
        };
    }

    public async deleteByID(id: number): Promise<void> {
        await this.database.query(`DELETE FROM ${this.data} WHERE \`id\`=?`, [id]);
    }

    public async deleteByAccount(account: number, currentAccess: number): Promise<void> {
        await this.database.query(`DELETE FROM ${this.data} WHERE \`account\`=? AND \`id\`!=?`, [
            account,
            currentAccess
        ]);
    }
}