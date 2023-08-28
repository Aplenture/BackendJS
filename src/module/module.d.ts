/**
 * Aplenture/ModuleJS
 * https://github.com/Aplenture/ModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/ModuleJS/blob/main/LICENSE
 */
/// <reference types="node" />
import * as CoreJS from "corejs";
import { Args } from "./args";
import { Context } from "./context";
import { Options } from "./options";
import { Command } from "./command";
export declare abstract class Module<TContext extends Context, TArgs extends Args, TOptions extends Options> {
    readonly onMessage: CoreJS.Event<Module<any, any, any>, string>;
    readonly options: TOptions;
    private readonly commander;
    constructor(args: Args, options?: TOptions, ...params: readonly CoreJS.Parameter<any>[]);
    get name(): string;
    init(): Promise<void>;
    deinit(): Promise<void>;
    execute(command?: string, args?: NodeJS.ReadOnlyDict<any>): Promise<CoreJS.Response | void>;
    protected addCommands(commands: readonly Command<TContext, TArgs, TOptions>[]): void;
}
