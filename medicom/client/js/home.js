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

function Gallery() {
        this.__galleries = [
                "medicom_intro",
                "admin",
                "patient",
                "devices",
                "app",
        ];
        this.__meta_map = new Map();
        this.__i_gallery = 0;
        
        this.set_holders = function(medicom_intro, admin, patient, devices, app,
                                    intro_text, admin_text, patient_text, device_text, app_text,
                                    prev, next) {
                this.__meta_map.set("medicom_intro", {
                        photo_holder: medicom_intro,
                        text_holder: intro_text,
                });
                this.__meta_map.set("admin", {
                        photo_holder: admin,
                        text_holder: admin_text,
                });
                this.__meta_map.set("patient", {
                        photo_holder: patient,
                        text_holder: patient_text,
                });
                this.__meta_map.set("devices", {
                        photo_holder: devices,
                        text_holder: device_text,
                });
                this.__meta_map.set("app", {
                        photo_holder: app,
                        text_holder: app_text,
                });
                var clazz = this;
                prev.on("click", function(e) {
                        clazz.__i_gallery = (clazz.__i_gallery + clazz.__galleries.length - 1)%clazz.__galleries.length;
                        clazz.update();
                });
                next.on("click", function(e) {
                        clazz.__i_gallery = (clazz.__i_gallery + 1)%clazz.__galleries.length;
                        clazz.update();
                });
        }
        
        this.update = function() {
                for (var i = 0; i < this.__galleries.length; i ++) {
                        var holder = this.__meta_map.get(this.__galleries[i]);
                        if (this.__i_gallery == i) {
                                holder.photo_holder.fadeIn(1000);
                                holder.text_holder.fadeIn(1000);
                        } else {
                                holder.photo_holder.css("display", "none");
                                holder.text_holder.css("display", "none");
                        }
                }
        }
}

var G_Gallery = new Gallery();
  
Template.tmplhome.onRendered(function () {
        console.log("home template rendered");
        G_Gallery.set_holders($("#img-medicom-intro"), $("#img-admin"), $("#img-patient"), $("#img-devices"), $("#img-app"),
                              $("#div-intro-text"), $("#div-admin-text"), $("#div-patient-text"), $("#div-device-text"), $("#div-app-text"),
                              $("#btn-prev"), $("#btn-next"));
        G_Gallery.update();
});
