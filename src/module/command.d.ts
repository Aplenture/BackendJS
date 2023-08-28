/**
 * Aplenture/ModuleJS
 * https://github.com/Aplenture/ModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/ModuleJS/blob/main/LICENSE
 */
import * as CoreJS from "corejs";
import { Args } from "./args";
import { Context } from "./context";
import { Options } from "./options";
export declare abstract class Command<TContext extends Context, TArgs extends Args, TOptions extends Options> implements CoreJS.Command<CoreJS.Response | void> {
    protected readonly context: TContext;
    readonly onMessage: CoreJS.Event<Command<any, any, any>, string>;
    abstract readonly description: string;
    abstract readonly parameters: CoreJS.ParameterList;
    constructor(context: TContext);
    get name(): string;
    init(options: TOptions): Promise<void>;
    deinit(options: TOptions): Promise<void>;
    execute(args: TArgs): Promise<CoreJS.Response | void>;
    protected message(message: string): void;
}
