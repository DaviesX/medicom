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

export function Dialog(holder)
{
        this.__holder = holder;
}

Dialog.prototype.create_message_box = function(title, content, f_On_Complete)
{
}

Dialog.prototype.create_input_dialog = function(title, content, button_name, f_On_Type, f_On_Complete)
{
}

Dialog.prototype.create_question_dialog = function(title, content, f_On_Complete)
{
}
