/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../../database";
import { Tables } from "../../models/tables";

export class CreateBalanceTable extends Database.Update<Tables> {
    public readonly name = "Create Balance Table";
    public readonly version = 1;
    public readonly timestamp = '2023-09-01';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(data: Tables) {
        super(data);

        this.reset = `TRUNCATE TABLE ${data.balanceTable}`;
        this.revert = `DROP TABLE IF EXISTS ${data.balanceTable}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${data.balanceTable} (
            \`timestamp\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            \`account\` BIGINT NOT NULL,
            \`depot\` BIGINT NOT NULL,
            \`asset\` BIGINT NOT NULL,
            \`value\` INT NOT NULL,
            PRIMARY KEY (\`account\`,\`depot\`,\`asset\`)
        ) DEFAULT CHARSET=utf8`;
    }
}