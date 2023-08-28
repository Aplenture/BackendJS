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

export abstract class Command<TContext extends Context, TArgs extends Args, TOptions extends Options> implements CoreJS.Command<CoreJS.Response | void> {
    public readonly onMessage = new CoreJS.Event<Command<any, any, any>, string>('Command.onMessage');

    public abstract readonly description: string;
    public abstract readonly parameters: CoreJS.ParameterList;

    constructor(protected readonly context: TContext) { }

    public get name(): string { return this.constructor.name; }

    public async init(options: TOptions): Promise<void> { }
    public async deinit(options: TOptions): Promise<void> { }
    public async execute(args: TArgs): Promise<CoreJS.Response | void> { }

    protected message(message: string) {
        this.onMessage.emit(this, message);
    }
}