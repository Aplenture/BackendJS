/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { Repository, parseToTime, Database } from "../../database";
import { Account } from "../models";

export class AccountRepository extends Repository<string> {
    constructor(
        data: string,
        database: Database,
        updatePath?: string
    ) {
        super(data, database, updatePath);

        if (!database.config.multipleStatements)
            throw new Error('database needs to support multiple statements for account repository');
    }

    public async getByID(id: number): Promise<Account | null> {
        const result = await this.database.query(`SELECT *, FROM_UNIXTIME(\`created\`) as \`created\` FROM ${this.data} WHERE \`id\`=? LIMIT 1`, [
            id
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: result[0].created / 1000,
            username: result[0].username,
            key: result[0].key
        };
    }

    public async getByName(username: string): Promise<Account | null> {
        const result = await this.database.query(`SELECT *, FROM_UNIXTIME(\`created\`) as \`created\` FROM ${this.data} WHERE \`username\`=? LIMIT 1`, [
            username
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: result[0].created / 1000,
            username: result[0].username,
            key: result[0].key
        };
    }

    public async create(username: string, key: string): Promise<Account | null> {
        const result = await this.database.query(`
            INSERT INTO ${this.data} (\`username\`,\`key\`) VALUES (?,?);
            SELECT * FROM ${this.data} WHERE \`username\`=? LIMIT 1;
        `, [
            username,
            key,
            username
        ]);

        return {
            id: result[1][0].id,
            created: parseToTime(result[1][0].created),
            username,
            key
        };
    }

    public async changePassword(account: number, key: string): Promise<void> {
        await this.database.query(`UPDATE ${this.data} SET \`key\`=? WHERE \`id\`=?`, [
            key,
            account
        ]);
    }
}