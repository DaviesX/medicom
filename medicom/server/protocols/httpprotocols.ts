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

/// <reference path="../../tslib/ironrouter.d.ts" />

var crc_table:Array<number> = null;

function make_crc_table(): Array<number>
{
        var c;
        var crctable = [];
        for(var n = 0; n < 256; n ++) {
                c = n;
                for(var k =0; k < 8; k++)
                        c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                crctable[n] = c;
        }
        return crctable;
}

function crc32(str: string): number
{
        if (crc_table == null)
                // Lazy initialization.
                crc_table = make_crc_table();
        var crc = 0 ^ (-1);
        for (var i = 0; i < str.length; i ++)
                crc = (crc >>> 8) ^ crc_table[(crc ^ str.charCodeAt(i)) & 0xFF];
        return (crc ^ (-1)) >>> 0;
};

class SymptomPacket
{
        public email:                   string;
        public checksum:                number;
        public date:                    Date;
        public times_of_the_day:        string;
        public symptom_names:           Array<string>;
        public symptom_scales:          Array<number>;
        public lifestyle_names:         Array<string>;
        public lifestyle_factors:       Array<boolean>;
        public comments:                string;
}

class AppConfigPacket
{
        public email:                   string;
        public symptom_names:           Array<string>;
        public lifestyle_names:         Array<string>;
        public reserved:                string;
}

/**
 * Update a patient's symptom data through HTTP request.
 * @param {Symptoms[]} an array of symptom objects where
                       each is formatted as: 
   var symptom_sample = {
           email:          "kerray@mail.org",
           checksum:       0xCC85BECD,
           timestamp:      new Date(),
           symptom_names:  ["headache", "foot swelling", "itching", "hot ear"],
           symptom_scales: [2.0, 1.0, 1.0, 5.0],
           comments:       "I think all my abnormal feelings have to deal with the hypertensor that I took before night.",
   };
 * @return {null}
 * @example, Meteor.HTTP.post("http_protocols/update_symptoms");
 **/
Router.route("/symptom-update", {where: "server"}).post(
function() {
        if (this.request.body == null)
                console.log("Invalid body");

        var a = <Array<SymptomPacket>> this.request.body;
        console.log("Received symptoms data: ");
        console.log(a);

        for (var i = 0; i < a.length; i ++) {
                var sym = a[i];
                var c = crc32(sym.email);
                if (sym.checksum != c) {
                        console.log(sym.checksum + " but expected " + c);
                }
        }
        this.response.end("Symptoms received");
});

Router.route("/api-config", {where: "server"}).post(
function() {
        if (this.request.body == null)
                console.log("Invalid body");

        var config = <AppConfigPacket> this.request.body;
        console.log("Received app config data: ");
        console.log(config);

        this.response.end("App config received");
});

Router.route("/api-config", {where: "server"}).get(
function() {
});
