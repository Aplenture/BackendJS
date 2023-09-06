/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Access } from "../models";

export function validateAccess(access: Access): boolean {
    if (!access)
        return false;

    if (access.expiration && access.expiration < Date.now())
        return false;

    return true;
}

export function validateSignature(signature: string, args: any, secret: string): boolean {
    if (!signature)
        return false;

    if (!args.timestamp)
        return false;

    if (isNaN(args.timestamp))
        return false;

    const query = undefined === args.debug
        ? CoreJS.parseArgsToString(args)
        : CoreJS.parseArgsToString(Object.assign({}, args, { debug: undefined }));

    if (signature !== CoreJS.createSign(query, secret))
        return false;

    return true;
}

export function validateAPIRights(access: Access, neededRights: number): boolean {
    if (0 == (access.rights & neededRights))
        return false;

    return true;
}