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
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";

export function SmartDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__charting_area = null;
        
        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.render_local_data = function(start_date, end_date, filter, num_samples, target) {
        }
        
        this.update = function() {
                this.render_local_data(this.__start_date, this.__end_date, 
                                       this.__filtering, this.__sample_count, this.__charting_area);
        }
}

export var G_SmartDisplay = new SmartDisplay();

Template.tmplsmartbrowser.onRendered(function() {
        console.log("smart browser rendered");
        G_SmartDisplay.set_charting_area(this.find("#charting-area"));
});
