/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../database";
import { Tables } from "../models/tables";

export class CreateUpdateTable extends Database.Update<Tables> {
    public readonly name = "Create Update Table";
    public readonly version = 2;
    public readonly timestamp = '2023-09-01';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(data: Tables) {
        super(data);

        this.reset = `TRUNCATE TABLE ${data.updateTable}`;
        this.revert = `DROP TABLE IF EXISTS ${data.updateTable}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${data.updateTable} (
            \`timestamp\` TIMESTAMP NOT NULL,
            \`resolution\` INT NOT NULL,
            \`account\` BIGINT NOT NULL,
            \`depot\` BIGINT NOT NULL,
            \`asset\` BIGINT NOT NULL,
            \`value\` INT NOT NULL,
            UNIQUE (\`timestamp\`,\`resolution\`,\`account\`,\`depot\`,\`asset\`)
        ) DEFAULT CHARSET=utf8`;
    }
}