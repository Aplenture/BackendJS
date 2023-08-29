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

export abstract class Module<TContext extends Context, TArgs extends Args, TOptions extends Options> {
    public readonly onMessage = new CoreJS.Event<Module<any, any, any>, string>('Module.onMessage');

    public readonly options: TOptions;

    private readonly commander = new CoreJS.Commander(undefined, {
        fallback: () => Promise.reject(new Error('unknown command'))
    });

    constructor(args: Args, options?: TOptions, ...params: readonly CoreJS.Parameter<any>[]) {
        const parameterList = new CoreJS.ParameterList(new CoreJS.StringParameter('name', 'name of the module'), ...params);

        this.options = Object.assign({}, parameterList.parse(options)) as any;

        // setup commander config by global parameters
        GlobalParameters.forEach(param => this.commander.config.add(param));

        if (args.debug)
            this.commander.onMessage.on(message => this.onMessage.emit(this, message));
    }

    public get name(): string { return this.options.name || this.constructor.name; }

    public async init(): Promise<void> {
        await Promise.all(Object.values(this.commander.commands).map((command: any) => command.init(this.options)));
    }

    public async deinit(): Promise<void> {
        await Promise.all(Object.values(this.commander.commands).map((command: any) => command.deinit(this.options)));
    }

    public has(command: string): boolean {
        return this.commander.has(command);
    }

    public execute(command?: string, args?: NodeJS.ReadOnlyDict<any>): Promise<CoreJS.Response | void> {
        return this.commander.execute(command, args);
    }

    public serialize(options?: CoreJS.SerializationOptions) {
        return CoreJS.serialize({
            name: this.name,
            commander: this.commander
        }, options);
    }

    public toString(): string {
        return this.commander.toString();
    }

    protected addCommands(commands: readonly Command<TContext, TArgs, TOptions>[]) {
        this.commander.set(...commands);
    }
}