/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { Update } from "../../../database";

export class CreateAccountsTable extends Update<string> {
    public readonly name = "Create Accounts Table";
    public readonly version = 2;
    public readonly timestamp = '2023-08-26';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(table: string) {
        super(table);

        this.reset = `TRUNCATE TABLE ${table}`;
        this.revert = `DROP TABLE IF EXISTS ${table}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${table} (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`created\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`username\` VARCHAR(48) UNIQUE KEY NOT NULL UNIQUE,
            \`key\` TEXT NOT NULL
        ) DEFAULT CHARSET=utf8`;
    }
}