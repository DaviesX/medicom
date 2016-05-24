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

function super_update_symptoms(symptoms) {
}

/**
 * Update a patient's symptom data through HTTP request.
 * @param {Symptoms[]} an array of symptom objects where
                       each is formatted as: 
   var symptom = {
        patients_feel(Integer),
        comments(String),
        timestamp(Date),
        patient_id(Integer),
        session_id(Integer)
   }
 * @return {null}
 * @example, Meteor.HTTP.post("www.medicom.org/http_protocols/update_symptoms");
 **/
Router.route("/http_protocols/update_symptoms", 
            {where: "server"}).post(function() {
        super_update_symptoms(this.request.body);
        this.response.end("Symptoms received");
});
