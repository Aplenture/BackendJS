/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Args } from "./args";
import { Context } from "./context";
import { Options } from "./options";
import { Command } from "./command";
import { GlobalParameters } from "./parameters";
import { IApp } from "./app";

export abstract class Module<TContext extends Context, TArgs extends Args, TOptions extends Options> {
    public readonly options: TOptions;

    private readonly commander: CoreJS.Commander;

    constructor(
        public readonly app: IApp,
        args: Args,
        options?: TOptions,
        ...params: readonly CoreJS.Parameter<any>[]
    ) {
        const parameterList = new CoreJS.ParameterList(new CoreJS.StringParameter('name', 'name of the module'), ...params);

        this.commander = new CoreJS.Commander({
            fallback: () => Promise.reject(new Error('unknown command'))
        }, app);

        // setup options by parameters
        this.options = Object.assign({}, parameterList.parse(options, options)) as any;

        // setup commander config by global parameters
        GlobalParameters.forEach(param => this.commander.config.add(param));

        // setup commander config by args
        this.commander.config.deserialize(args);
    }

    public get name(): string { return this.options.name || this.constructor.name; }

    public async init(): Promise<void> {
        this.app.onMessage.emit(this, "init");

        await Promise.all(Object.values(this.commander.commands).map((command: any) => command.init(this.options)));
    }

    public async deinit(): Promise<void> {
        this.app.onMessage.emit(this, "deinit");

        await Promise.all(Object.values(this.commander.commands).map((command: any) => command.deinit(this.options)));
    }

    public has(command: string): boolean {
        return this.commander.has(command);
    }

    public execute(command?: string, args?: NodeJS.ReadOnlyDict<any>): Promise<CoreJS.Response | void> {
        return this.commander.execute(command, args);
    }

    protected addCommands(commands: readonly Command<TContext, TArgs, TOptions>[]) {
        this.commander.set(...commands);
    }

    public toString() {
        return this.commander.toString();
    }

    public toJSON() {
        return {
            name: this.name,
            commands: Object.values(this.commander.commands).map((command: Command<TContext, TArgs, TOptions>) => command.toJSON())
        };
    }
}