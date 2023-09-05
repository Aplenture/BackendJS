/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { Database } from "./database";
import { Update } from "./update";

interface LoadUpdatesOptions {
    readonly versions?: readonly number[];
    readonly minVersion?: number;
    readonly maxVersion?: number;
    readonly path?: string;
}

export abstract class Repository<T> {
    protected readonly updatePath: string;

    constructor(
        public readonly data: T,
        protected readonly database: Database,
        updatePath?: string
    ) {
        this.updatePath = updatePath || process.cwd() + '/src/updates/' + this.constructor.name;
    }

    public async init(): Promise<void> { }
    public async deinit(): Promise<void> { }

    public async reset(options?: LoadUpdatesOptions): Promise<void> {
        await this.database.reset(Repository.loadUpdates(this, options));
    }

    public revert(options?: LoadUpdatesOptions): Promise<number> {
        return this.database.revert(Repository.loadUpdates(this, options));
    }

    public update(options?: LoadUpdatesOptions): Promise<number> {
        return this.database.update(Repository.loadUpdates(this, options));
    }

    protected static loadUpdates<T>(repository: Repository<T>, options: LoadUpdatesOptions = {}): Update<T>[] {
        const dict: NodeJS.ReadOnlyDict<new (data: T) => Update<T>> = require(repository.updatePath);

        return Object.values(dict)
            .map(_constructor => new _constructor(repository.data))
            .filter(update => {
                if (options.versions && !options.versions.includes(update.version))
                    return false;

                if (undefined != options.minVersion && update.version < options.minVersion)
                    return false;

                if (undefined != options.maxVersion && update.version > options.maxVersion)
                    return false;

                return true;
            });
    }
}