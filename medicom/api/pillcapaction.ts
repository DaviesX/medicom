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

import {IRowValue, RowValueObject} from "./irowvalue.ts";

export class PillCapAction implements IRowValue
{
        public is_taken:        boolean;

        constructor(is_taken: boolean) 
        {
                this.is_taken = is_taken;
        }

        // @override
        public object(): RowValueObject
        {
                return RowValueObject.RowValuePillCap;
        }

        // @override
        public add(_rhs: IRowValue): IRowValue
        {
                var rhs: PillCapAction = <PillCapAction> _rhs;
                return new PillCapAction(this.is_taken || rhs.is_taken);
        }

        // @override
        public scale(k: number): IRowValue
        {
                return new PillCapAction(k == 0 ? false : this.is_taken);
        }

        // @override
        public lt(_rhs: IRowValue): boolean
        {
                var rhs: PillCapAction = <PillCapAction> _rhs;
                return this.is_taken < rhs.is_taken;
        }

        // @override
        public gt(_rhs: IRowValue):               boolean
        {
                var rhs: PillCapAction = <PillCapAction> _rhs;
                return this.is_taken > rhs.is_taken;
        }

        // @override
        public eq(_rhs: IRowValue):               boolean
        {
                var rhs: PillCapAction = <PillCapAction> _rhs;
                return this.is_taken == rhs.is_taken;
        }

        // @override
        public to_string(): string
        {
                return this.is_taken ? "true" : "false";
        }
}
