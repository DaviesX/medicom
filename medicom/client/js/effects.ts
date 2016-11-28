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

export class BatchedEffect 
{
        private effect_type:            string;
        private elms:                   Array<JQuery>;
        private effect_interval:        number;

        constructor(effect_type: string, duration: number)
        {
                this.effect_type = effect_type;
                this.effect_interval = duration == null ? 800 : duration;
        }

        public finalize(): void
        {
                switch(this.effect_type) {
                case "fade":
                case "slide":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].fadeOut(0);
                        break;
                default:
                        throw new Error("Unkown effect: " + this.effect_type);
                }
        }

        public add_elm(elm: JQuery): void
        {
                this.elms.push(elm);
        }

        public animate(): void
        {
                switch(this.effect_type) {
                case "fade":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].fadeIn(this.effect_interval);
                        break;
                case "slide":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].effect("slide", this.effect_interval);
                        break;
                default:
                        throw new Error("Unkown effect: " + this.effect_type);
                }
        }
};


export class SequentialEffect 
{
        private effect_type:            string;
        private elms:                   Array<JQuery>;
        private effect_interval:        number;         
        private inc:                    number;

        constructor(effect_type: string, duration: number) 
        {
                this.effect_interval = duration == null ? 800 : duration;
        }

        public finalize(): void
        {
                this.inc = this.effect_interval/this.elms.length;

                switch(this.effect_type) {
                case "fade":
                case "slide":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].fadeOut(0);
                        break;
                default:
                        throw new Error("Unkown effect: " + this.effect_type);
                }
        }

        public add_elm(elm: JQuery): void
        {
                this.elms.push(elm);
        }

        public animate(): void
        {
                switch(this.effect_type) {
                case "fade":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].fadeIn(this.inc*(i + 1));
                        break;
                case "slide":
                        for (var i = 0; i < this.elms.length; i ++)
                                this.elms[i].effect("slide", this.inc*(i + 1));
                        break;
                default:
                        throw new Error("Unkown effect: " + this.effect_type);
                }
        }
};
