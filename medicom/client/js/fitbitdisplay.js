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
export function FitbitDisplay() {
        this.__charting_area = null;
        
        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
}

export var G_FitbitDisplay = new FitbitDisplay();

Template.tmplfitbitbrowser.onRendered(function() {
        console.log("fitbit browser rendered");
        G_FitbitDisplay.set_charting_area(this.find("#charting-area"));
});
