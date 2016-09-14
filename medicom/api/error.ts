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
        public m_queue:        Array<string>;

        constructor() 
        {
                this.m_queue = new Array<string>();
        }
        
        public log(message: string): void
        {
                this.m_queue.push(message);
        }
        
        public is_empty(): boolean 
        {
                return this.fetch_all().length == 0;
        }
        
        public fetch_all(): Array<string> 
        {
                var answer = [];
                for (var i = 0, j = 0; i < this.m_queue.length; i ++) {
                        if (this.m_queue[i] != null || this.m_queue[i] == "")
                                answer[j ++] = this.m_queue[i];
                }
                return answer;
        }
        
        public clear(): void
        {
                this.m_queue = [];
        }
}

export function error_messages_copy(pod): ErrorMessages
{
        var obj = new ErrorMessages();
        obj.m_queue = pod.m_queue;
        return obj;
}
