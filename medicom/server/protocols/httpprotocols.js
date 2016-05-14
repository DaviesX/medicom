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
// HTTP Web APIs go here
import {Meteor} from 'meteor/meteor'

Router.route('/http_protocols/super_update_symptom', 
        /**
         * Update a patient's symptom data through HTTP request.
         * @param {String} email of the patient.
         * @param {Date} date of the blob.
         * @return {null}
         * @example, Meteor.HTTP.post("www.medicom.org/http_protocols/super_update_symptom?email=davis@mail.org&date=Wed_Apr_13_2016_16:37:45_GMT-0700");
         **/
        function super_update_symptom_on_http() {
        }
);
