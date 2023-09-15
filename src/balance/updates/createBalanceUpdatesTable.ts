/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as Database from "../../database";
import { Tables } from "../models/tables";

export class CreateBalanceUpdatesTable extends Database.Update<Tables> {
    public readonly name = "Create Balance Updates Table";
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
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`timestamp\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`type\` SMALLINT NOT NULL,
            \`account\` BIGINT NOT NULL,
            \`depot\` BIGINT NOT NULL,
            \`order\` INT NOT NULL,
            \`asset\` BIGINT NOT NULL,
            \`change\` INT NOT NULL,
            \`data\` TEXT DEFAULT ''
        ) DEFAULT CHARSET=utf8`;
    }
}