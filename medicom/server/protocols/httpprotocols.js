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
