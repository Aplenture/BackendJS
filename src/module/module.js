"use strict";
/**
 * Aplenture/ModuleJS
 * https://github.com/Aplenture/ModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/ModuleJS/blob/main/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const CoreJS = require("corejs");
const parameters_1 = require("./parameters");
class Module {
    constructor(args, options, ...params) {
        this.onMessage = new CoreJS.Event('Module.onMessage');
        this.commander = new CoreJS.Commander(undefined, {
            fallback: () => Promise.reject(new Error('unknown command'))
        });
        const parameterList = new CoreJS.ParameterList(new CoreJS.StringParameter('name', 'name of the module'), ...params);
        this.options = Object.assign({}, parameterList.parse(options));
        // setup commander config by global parameters
        parameters_1.GlobalParameters.forEach(param => this.commander.config.add(param));
        if (args.debug)
            this.commander.onMessage.on(message => this.onMessage.emit(this, message));
    }
    get name() { return this.options.name || this.constructor.name; }
    async init() {
        await Promise.all(Object.values(this.commander.commands).map((command) => command.init(this.options)));
    }
    async deinit() {
        await Promise.all(Object.values(this.commander.commands).map((command) => command.deinit(this.options)));
    }
    execute(command, args) {
        return this.commander.execute(command, args);
    }
    addCommands(commands) {
        this.commander.set(...commands);
    }
}
exports.Module = Module;
//# sourceMappingURL=module.js.map