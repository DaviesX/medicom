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

export class ErrorMessages
{
        private queue:  Array<string>;

        constructor() 
        {
                this.queue = new Array<string>();
        }
        
        public log(message: string): void
        {
                this.queue.push(message);
        }
        
        public is_empty(): boolean 
        {
                return this.fetch_all().length == 0;
        }
        
        public fetch_all(): Array<string> 
        {
                var answer = [];
                for (var i = 0, j = 0; i < this.queue.length; i ++) {
                        if (this.queue[i] != null || this.queue[i] == "")
                                answer[j ++] = this.queue[i];
                }
                return answer;
        }

        public toString(): string
        {
                var a = this.fetch_all();
                var ans = "";
                for (var i = 0; i < a.length; i ++) {
                        ans += a[i].toString();
                        if (i != a.length - 1)
                                ans += ", ";
                }
                return ans;
        }
        
        public clear(): void
        {
                this.queue = [];
        }

        public static recover(pod: any): ErrorMessages
        {
                var obj = new ErrorMessages();
                obj.queue = pod.queue;
                return obj;
        }
};

