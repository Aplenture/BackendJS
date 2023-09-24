/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../database";
import { Tables } from "../models/tables";

export class CreateEventTable extends Database.Update<Tables> {
    public readonly name = "Create Event Table";
    public readonly version = 1;
    public readonly timestamp = '2023-09-01';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(data: Tables) {
        super(data);

        this.reset = `TRUNCATE TABLE ${data.eventTable}`;
        this.revert = `DROP TABLE IF EXISTS ${data.eventTable}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${data.eventTable} (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`timestamp\` TIMESTAMP NOT NULL,
            \`type\` SMALLINT NOT NULL,
            \`account\` BIGINT NOT NULL,
            \`depot\` BIGINT NOT NULL,
            \`asset\` BIGINT NOT NULL,
            \`value\` INT NOT NULL,
            \`order\` BIGINT NOT NULL,
            \`data\` CHAR(32) NOT NULL,
            UNIQUE (\`type\`,\`account\`,\`depot\`,\`asset\`,\`order\`)
        ) DEFAULT CHARSET=utf8`;
    }
}