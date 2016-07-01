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
import {Template} from "meteor/templating";
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";
import {SequentialEffect, BatchedEffect} from "./effects.js";
import {G_BPDisplay} from "./bpdisplay.js";
import {G_PBCDisplay} from "./pbcdisplay.js";
import {G_SymptomsDisplay} from "./symptomsdisplay.js";
import {G_FitbitDisplay} from "./fitbitdisplay.js";
import {G_SmartDisplay} from "./smartdisplay.js";
import {G_SessionNotesDisplay} from "./notesdisplay.js";
import {G_Session} from "./session.js";


export function DataBrowser() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data"];

        this.__curr_display_mode = this.__display_types[0];
        
        this.__display_type_holder = null;
        
        this.__smart_display = G_SmartDisplay;
        this.__bp_display = G_BPDisplay;
        this.__pbc_display = G_PBCDisplay;
        this.__symp_display = G_SymptomsDisplay;
        this.__fitbit_display = G_FitbitDisplay;
        this.__notes_display = G_SessionNotesDisplay;
        
        // Access infos.
        this.set_target_session = function(session, user_info, identity) {
                this.__session = session;
                this.__browsing_user = user_info;
                this.__identity = identity;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }

        this.get_browsing_user = function() {
                return this.__browsing_user;
        }
        
        // Holders
        this.set_display_type_holder = function(holder) {
                var clazz = this;

                this.__display_type_holder = holder;
                var types = this.__display_types;
                holder.empty();
                for (var i = 0; i < types.length; i ++) {
                        holder.append('<option value="' + types[i] + '">' + types[i] + '</option>');
                }
        } 
        
        // Browser states.
        this.set_display_mode = function(display_mode) {
                this.__curr_display_mode = display_mode;
        }

        this.get_current_display_mode = function() {
                return this.__curr_display_mode;
        }

        this.get_data_displays = function() {
                return this.__display_types;
        }

        // Data.
        this.load_display = function(display_mode) {
                if (display_mode == null) display_mode = this.get_current_display_mode();
                else this.set_display_mode(display_mode);
                
                // Handle access info.
                this.__bp_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__pbc_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__smart_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__notes_display.set_access_info(this.__identity, this.__session);
                
                // Update notes
                this.__notes_display.update_notes();
               
                // Update charting area.
                switch (display_mode) {
                case "Smart Display Mode":
                        this.__smart_display.update();
                        break;
                case "Blood Pressure Data": 
                        this.__bp_display.update();
                        break;
                case "Symptoms Data": 
                        this.__symp_display.udpate();
                        break;
                case "Pill Bottle Cap": 
                        this.__pbc_display.update();
                        break;
                case "Fitbit Data":
                        this.__fitbit_display.update();
                        break;
                default:
                        throw "unkown display mode: " + display_mode;
                }
        }
        
        this.save_changes = function() {
                this.__bp_display.upload_to_remote_server();
                this.__pbc_display.upload_to_remote_server();
                this.__notes_display.save_notes();
                this.load_display();
                alert("Everything has been saved");
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.onRendered(function () {
        console.log("data browser rendered");

        var effect = new BatchedEffect("slide", 400);
        effect.add_elm($("#data-panel"));
        effect.finalize();
        effect.animate();

        G_DataBrowser.set_display_type_holder($("#sel-chart-types"));
        G_Session.set_data_display_mode(G_DataBrowser.get_current_display_mode());
        
        G_DataBrowser.load_display();
});

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                var user = G_DataBrowser.get_browsing_user();
                return user.get_name() + ", " + user.get_account_id() + " - " + selected.get_start_date() + " - " + selected.get_session_id();
        },

        use_smartbrowser() {
                return G_Session.get_data_display_mode() == "Smart Display Mode";
        },
        
        use_bpbrowser() {
                return G_Session.get_data_display_mode() == "Blood Pressure Data";
        },
        
        use_pbcbrowser() {
                return G_Session.get_data_display_mode() == "Pill Bottle Cap";
        },

        use_symptombrowser() {
                return G_Session.get_data_display_mode() == "Symptoms Data";
        },
        
        use_fitbitbrowser() {
                return G_Session.get_data_display_mode() == "Fitbit Data";
        },
});

Template.tmpldatabrowser.events({"click #sel-chart-types"(event) {
        G_DataBrowser.load_display($(event.target).val());
        G_Session.set_data_display_mode(G_DataBrowser.get_current_display_mode());
}});

Template.tmpldatabrowser.events({"click #btn-save-change"(event) {
        G_DataBrowser.save_changes();
}});
