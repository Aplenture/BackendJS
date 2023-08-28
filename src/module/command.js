"use strict";
/**
 * Aplenture/ModuleJS
 * https://github.com/Aplenture/ModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/ModuleJS/blob/main/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const CoreJS = require("corejs");
class Command {
    constructor(context) {
        this.context = context;
        this.onMessage = new CoreJS.Event('Command.onMessage');
    }
    get name() { return this.constructor.name; }
    async init(options) { }
    async deinit(options) { }
    async execute(args) { }
    message(message) {
        this.onMessage.emit(this, message);
    }
}
exports.Command = Command;
//# sourceMappingURL=command.js.map