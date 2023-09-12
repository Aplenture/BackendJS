/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Args, Options, Context } from "../core";
import { AccessRepository, AccountRepository } from "../repositories";
import { Module as Parent, Args as ModuleArgs } from "../../module";
import { Database, Parameters } from "../../database";

export class Module extends Parent<Context, Args, Options> implements Context {
    public readonly database: Database;
    public readonly accessRepository: AccessRepository;
    public readonly accountRepository: AccountRepository;

    constructor(args: ModuleArgs, options: Options, ...params: CoreJS.Parameter<any>[]) {
        super(args, options, ...params,
            new CoreJS.DictionaryParameter('databaseConfig', 'database config', Parameters),
            new CoreJS.StringParameter('accessTable', 'access database table name', '`accesses`'),
            new CoreJS.StringParameter('accountTable', 'account database table name', '`accounts`')
        );

        this.database = new Database(this.options.databaseConfig, {
            debug: args.debug,
            multipleStatements: true
        });

        this.database.onMessage.on(message => this.onMessage.emit(this, `database '${this.options.databaseConfig.database}' ${message}`));

        this.accessRepository = new AccessRepository(options.accessTable, this.database, '../account/updates/AccessRepository');
        this.accountRepository = new AccountRepository(options.accountTable, this.database, '../account/updates/AccountRepository');

        this.addCommands(Object.values(require('../commands')).map((constructor: any) => new constructor(this)));
    }

    public async init(): Promise<void> {
        await Database.create(this.options.databaseConfig);
        await this.database.init();
        await super.init();
    }

    public async deinit(): Promise<void> {
        await this.database.close();
        await super.deinit();
    }
}