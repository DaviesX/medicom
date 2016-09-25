/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Chifeng Wen.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {DataTransObject} from "./datatransfactory.ts";
import {ErrorMessages} from "./error.ts";

/*
 * <Result> Represents a result returned from the server.
 */
export class Result<T>
{
        public result:          T;
        public type_desc:       DataTransObject;
        public error:           ErrorMessages;

        constructor(result: T, type_desc: DataTransObject, error: ErrorMessages)
        {
                this.result = result;
                this.type_desc = type_desc;
                this.error = error;
        }

        public get_result(): T
        {
                return this.result;
        }

        public get_type_desc(): DataTransObject
        {
                return this.type_desc;
        }

        public get_error(): ErrorMessages
        {
                return this.error;
        }

        public static recover(pod): Result<Object>
        {
                var obj = new Result<Object>(null, null, null);
                obj.result = pod.result;
                obj.type_desc = pod.type_desc;
                obj.error = pod.error;
                return obj;
        }
};

