/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as FS from "fs";
import * as CoreJS from "corejs";

export class Log {
    constructor(private readonly stream: NodeJS.WritableStream) { }

    public static createFileLog(filePath: string, clear = false) {
        const stream = FS.createWriteStream(filePath, {
            flags: clear ? 'w' : 'a'
        });

        return new Log(stream);
    }

    public static clear(filepath: string): Promise<void> {
        return new Promise((resolve, reject) => FS.truncate(filepath, error => error ? reject(error) : resolve()));
    }

    public close(): Promise<void> {
        return new Promise(resolve => this.stream.end(resolve));
    }

    public write(text: string | Buffer, title?: string): void {
        this.stream.write(`${CoreJS.formatTime("YYYY-MM-DD hh:mm:ss")} >> ${title ? title + ': ' + text : text}\n`);
    }

    public warning(text: string, title?: string): void {
        this.write(`warning: ${title ? title + ': ' + text : text}`);
    }

    public error(error: Error, title?: string): void {
        this.write(title ? title + ': ' + error.stack : error.stack);
    }
}