/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Args, Options, Context } from "../core";
import { AccessRepository, AccountRepository } from "../repositories";
import { Database, Module as Parent } from "../../..";

export class Module extends Parent.Module<Context, Args, Options> implements Context {
    public readonly database: Database.Database;
    public readonly accessRepository: AccessRepository;
    public readonly accountRepository: AccountRepository;

    constructor(args: Parent.Args, options: Options, ...params: CoreJS.Parameter<any>[]) {
        super(args, options, ...params,
            new CoreJS.DictionaryParameter('databaseConfig', 'database config', Database.Parameters),
            new CoreJS.StringParameter('accessTable', 'access database table name', '`accesses`'),
            new CoreJS.StringParameter('accountTable', 'account database table name', '`accounts`')
        );

        this.database = new Database.Database(this.options.databaseConfig, args.debug);
        this.database.onMessage.on(message => this.onMessage.emit(this, `database '${this.options.databaseConfig.database}' ${message}`));

        this.accessRepository = new AccessRepository(options.accessTable, this.database, '../modules/account/updates/AccessRepository');
        this.accountRepository = new AccountRepository(options.accountTable, this.database, '../modules/account/updates/AccountRepository');

        this.addCommands(Object.values(require('../commands')).map((constructor: any) => new constructor(this)));
    }

    public async init(): Promise<void> {
        await Database.Database.create(this.options.databaseConfig);
        await this.database.init();
        await super.init();
    }

    public async deinit(): Promise<void> {
        await this.database.close();
        await super.deinit();
    }
}