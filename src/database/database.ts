/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as MySQL from "mariadb";
import * as CoreJS from "corejs";
import { Update } from "./update";
import { Config } from "./config";

type Type = string | number
type Entry = NodeJS.ReadOnlyDict<any>;

export class Database {
    public readonly onMessage = new CoreJS.Event<Database, string>('Database.onMessage');

    private pool: MySQL.Pool;

    constructor(public readonly config: Config, public readonly debug = false) { }

    public get isInitialized(): boolean { return !!this.pool; }

    public static async create(config: Config): Promise<void> {
        const connection = await MySQL.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });

        return connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`)
            .then(() => connection.end())
            .catch(() => connection.end());
    }

    public static async drop(config: Config): Promise<void> {
        const connection = await MySQL.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });

        return connection.query(`DROP DATABASE IF EXISTS ${config.database}`)
            .then(() => connection.end())
            .catch(() => connection.end());
    }

    public static async reset(config: Config): Promise<void> {
        await this.drop(config);
        await this.create(config);
    }

    public async init(): Promise<void> {
        if (this.isInitialized)
            return;

        this.pool = await MySQL.createPool(this.config);
    }

    public async close(): Promise<void> {
        if (!this.isInitialized)
            return;

        await this.pool.end();

        this.pool = null;
    }

    public async currentVersion(): Promise<number> {
        const result = await this.query(`SELECT \`version\` FROM \`updates\` ORDER BY \`version\` DESC LIMIT 1`);

        if (!result.length)
            return 0;

        return result[0].version;
    }

    public async update(updates: readonly Update<any>[]): Promise<number> {
        if (0 == updates.length) {
            this.onMessage.emit(this, `there are no updates to execute`);
            return await this.currentVersion();
        }

        this.onMessage.emit(this, 'update');

        await this.query(`CREATE TABLE IF NOT EXISTS \`updates\` (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`name\` TEXT NOT NULL,
            \`version\` BIGINT NOT NULL
            ) DEFAULT CHARSET=utf8`);

        const ascendingUpdates: readonly Update<any>[] = Object.assign([], updates)
            .sort((a, b) => a.version - b.version);

        for (let i = 0; i < ascendingUpdates.length; ++i) {
            const update = ascendingUpdates[i];
            const executedUpdates = await this.query(`SELECT * FROM \`updates\` WHERE \`version\`=?`, [update.version]);

            if (executedUpdates.length) {
                this.onMessage.emit(this, `skip update '${update.name}' (already executed)`);
                continue;
            }

            this.onMessage.emit(this, `execute update '${update.name}'`);

            await this.query(update.update);
            await this.query(`INSERT INTO \`updates\` (\`name\`,\`version\`) VALUES (?,?)`, [
                update.name,
                update.version
            ]);
        }

        const latestUpdate = await this.query(`SELECT * FROM \`updates\` ORDER BY \`version\` DESC LIMIT 1`);

        this.onMessage.emit(this, `updated to version '${latestUpdate[0].version}'`);

        return latestUpdate[0].version;
    }

    public async reset(updates: readonly Update<any>[]): Promise<void> {
        if (0 == updates.length)
            return this.onMessage.emit(this, `there are no updates to reset`);

        this.onMessage.emit(this, 'reset');

        const updateTables = await this.query(`SHOW TABLES LIKE 'updates'`);

        if (0 == updateTables.length)
            return this.onMessage.emit(this, 'there are no executed updates to reset');

        const descendingUpdates: readonly Update<any>[] = Object.assign([], updates)
            .sort((a, b) => b.version - a.version);

        for (let i = 0; i < descendingUpdates.length; ++i) {
            const update = descendingUpdates[i];
            const executedUpdates = await this.query(`SELECT * FROM \`updates\` WHERE \`version\`=?`, [update.version]);

            if (0 == executedUpdates.length) {
                this.onMessage.emit(this, `skip reset of update '${update.name}' (update not executed)`);
                continue;
            }

            this.onMessage.emit(this, `reset update '${update.name}'`);

            if (update.reset)
                await this.query(update.reset);
        }

        this.onMessage.emit(this, `all updates reset`);
    }

    public async revert(updates: readonly Update<any>[]): Promise<number> {
        if (0 == updates.length) {
            this.onMessage.emit(this, `there are no updates to revert`);
            return await this.currentVersion();
        }

        this.onMessage.emit(this, 'revert');

        const updateTables = await this.query(`SHOW TABLES LIKE 'updates'`);

        if (0 == updateTables.length) {
            this.onMessage.emit(this, 'there are no executed updates to revert');
            return await this.currentVersion();
        }

        const descendingUpdates: readonly Update<any>[] = Object.assign([], updates)
            .sort((a, b) => b.version - a.version);

        for (let i = 0; i < descendingUpdates.length; ++i) {
            const update = descendingUpdates[i];
            const executedUpdates = await this.query(`SELECT * FROM \`updates\` WHERE \`version\`=?`, [update.version]);

            if (0 == executedUpdates.length) {
                this.onMessage.emit(this, `skip revert of update '${update.name}' (update not executed)`);
                continue;
            }

            this.onMessage.emit(this, `revert update '${update.name}'`);

            if (update.revert)
                await this.query(update.revert);

            await this.query(`DELETE from \`updates\` WHERE \`version\`=?`, [
                update.version
            ]);
        }

        const latestUpdate = await this.query(`SELECT * FROM \`updates\` ORDER BY \`version\` DESC LIMIT 1`);

        if (latestUpdate.length) {
            this.onMessage.emit(this, `reverted to version '${latestUpdate[0].version}'`);
            return latestUpdate[0].version;
        }

        this.onMessage.emit(this, `all updates reverted`);

        return 0;
    }

    public async query(query: string, values: readonly Type[] = [], debug = false): Promise<any> {
        const stopwatch = new CoreJS.Stopwatch();

        stopwatch.start();

        query = Database.escapeQuery(query, values);

        const connection = await this.pool.getConnection();

        try {
            const result = await connection.query({
                sql: query,
                insertIdAsNumber: true,
                checkDuplicate: false,
                decimalAsNumber: true,
                bigIntAsNumber: true
            });

            stopwatch.stop();
            connection.release();

            if (Array.isArray(result))
                result.forEach(entry => Database.decodeEntry(entry));

            if (this.debug || debug)
                this.onMessage.emit(this, `executed "${query}" in ${CoreJS.formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

            return result;
        } catch (error) {
            stopwatch.stop();
            connection.release();

            this.onMessage.emit(this, error.message);

            throw new CoreJS.CoreError(error.errno);
        }
    }

    public fetch(query: string, callback: (result: Entry, index: number) => Promise<any>, values: readonly Type[] = [], debug = false): Promise<void> {
        const stopwatch = new CoreJS.Stopwatch();

        stopwatch.start();

        query = Database.escapeQuery(query, values);

        let index = 0;

        return new Promise<void>(async (resolve, reject) => {
            const connection = await this.pool.getConnection();
            const stream = connection.queryStream({
                sql: query,
                insertIdAsNumber: true,
                checkDuplicate: false,
                decimalAsNumber: true,
                bigIntAsNumber: true
            });

            stream.on("error", error => {
                connection.release();
                this.onMessage.emit(this, error.message);
                reject(error);
            });

            stream.on("end", () => {
                stopwatch.stop();
                connection.release();
                resolve();

                if (this.debug || debug)
                    this.onMessage.emit(this, `fetched "${query}" in ${CoreJS.formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);
            });

            stream.on("data", async entry => {
                try {
                    stream.pause();

                    Database.decodeEntry(entry);

                    await callback(entry as any, index++);

                    stream.resume();
                } catch (error) {
                    stream.destroy(error);
                }
            });
        });
    }

    private static escapeQuery(query: string, values: readonly Type[]): string {
        let result = query;

        values.forEach(value => result = result.replace('?', typeof value === 'string' ? "'" + CoreJS.encodeString(value) + "'" : value.toString()))

        return result;
    }

    private static decodeEntry(entry: Entry): void {
        Object.keys(entry).forEach(key => (entry[key] as any) = typeof entry[key] === 'string' ? CoreJS.decodeString(entry[key] as string) : entry[key]);
    }
}