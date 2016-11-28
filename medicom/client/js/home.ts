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

class MetaData
{
        public photo:   JQuery;
        public text:    JQuery;

        constructor(photo: JQuery, text: JQuery)
        {
                this.photo = photo;
                this.text = text;
        }
};

export class Gallery
{
        private meta_map:               Map<string, MetaData> = new Map<string, MetaData>();
        private i_gallery:              number = 0;
        private interval:               number = 15000;
        private auto_transition:        boolean = true;
        
        // UIs
        private jmedicom_intro:         JQuery = $("#img-medicom-intro");
        private jintro_text:            JQuery = $("#div-intro-text");

        private jadmin:                 JQuery = $("#img-admin");
        private jadmin_text:            JQuery = $("#div-admin-text");

        private jpatient:               JQuery = $("#img-patient");
        private jpatient_text:          JQuery = $("#div-patient-text");

        private jdevices:               JQuery = $("#img-devices");
        private jdevice_text:           JQuery = $("#div-device-text");

        private japp:                   JQuery = $("#img-app");
        private japp_text:              JQuery = $("#div-app-text");

        private jprev:                  JQuery = $("#btn-prev");
        private jnext:                  JQuery = $("#btn-next");

        private update(): void
        {
                var i_gallery = this.i_gallery;
                var i = 0;

                this.meta_map.forEach(function(value: MetaData, key: string, map: Map<string, MetaData>) {
                        if (i_gallery == i ++) {
                                value.photo.fadeIn(1000);
                                value.text.fadeIn(1000);
                        } else {
                                value.photo.css("display", "none");
                                value.text.css("display", "none");
                        }
                });
        }

        constructor() 
        {
                this.meta_map.set("medicom_intro", new MetaData(this.jmedicom_intro, this.jintro_text));
                this.meta_map.set("admin", new MetaData(this.jadmin, this.jadmin_text));
                this.meta_map.set("patient", new MetaData(this.jpatient, this.jpatient_text));
                this.meta_map.set("devices", new MetaData(this.jdevices, this.jdevice_text));
                this.meta_map.set("app", new MetaData(this.japp, this.japp_text));

                var clazz: Gallery = this;
                var num_galleries: number = this.meta_map.size;

                this.jprev.on("click", function(e: Event) {
                        clazz.i_gallery = (clazz.i_gallery + num_galleries - 1)%num_galleries;
                        clazz.auto_transition = false;
                        clazz.update();
                });
                this.jnext.on("click", function(e: Event) {
                        clazz.i_gallery = (clazz.i_gallery + 1)%num_galleries;
                        clazz.auto_transition = false;
                        clazz.update();
                });
                Meteor.setInterval(function() {
                        if (clazz.auto_transition) {
                                clazz.i_gallery = (clazz.i_gallery + 1)%num_galleries;
                                clazz.update();
                        }
                }, this.interval);

                this.update();
        }
};
  
Template["tmplhome"].onRendered(function () {
        console.log("home template rendered");
        new Gallery();
});
