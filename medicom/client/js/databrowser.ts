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

/// <reference path="../../tslib/lib.es6.d.ts" />
/// <reference path="../../tslib/main.d.ts" />

import {Meteor} from "meteor/meteor";

import {Identity} from "../../api/identity";
import {AccountInfo} from "../../api/accountinfo";
import {MedicalSession} from "../../api/medicalsession";
import {IDataTransaction} from "../../api/idatatransaction";
import {data_transaction_copy} from "../../api/datatransfactory";

import {DataBrowserUI} from "./databrowserui";
import {IDataProcessor} from "./idataprocessor";
import {data_proc_factory_create_all} from "./dataprocfactory";
import {SessionParams, SessionParamObject} from "./sessionparams";
import {UI, UIObserver} from "./ui";


class DataBrowserObserver implements UIObserver
{
        private m_browser:      DataBrowser;

        constructor(browser: DataBrowser)
        {
                this.m_browser = browser;
        }
        
        public update(ui: UI, component: string): void
        {
                this.m_browser.update(component);
        }
};

class LocalCache
{
        public processor:       IDataProcessor;
        public data:            Array<IDataTransaction>;

        constructor(proc: IDataProcessor)
        {
                this.processor = proc;
                this.data = new Array<IDataTransaction> ();
        }
}


/*
 * <DataBrowser> A controller class to coordinate data presentation.
 */
export class DataBrowser
{
        private m_identity:     Identity;
        private m_user:         AccountInfo;
        private m_session:      MedicalSession;
        private m_local_cache:  Map<string, LocalCache>; 
        private m_ui:           DataBrowserUI;

        constructor(identity: Identity, user: AccountInfo, session: MedicalSession)
        {
                this.m_identity = identity;
                this.m_user = user;
                this.m_session = session;

                this.m_ui = new DataBrowserUI(new DataBrowserObserver(this));

                // Initialize local cache.
                var a = data_proc_factory_create_all(identity, user, session);
                for (var i = 0; i < a.length; i ++) {
                        this.m_local_cache.set(a[i].id(), new LocalCache(a[i]));
                }

                // Initialize display mode UI.
                for (var i = 0; i < a.length; i ++) {
                        this.m_ui.add_display_mode(a[i].name(), a[i].id());
                }
        }

        public update(component: string): void
        {
                var cur_cache = <LocalCache> this.m_local_cache.get(this.m_ui.display_mode());
                var params = this.m_ui.generate_data_params();

                switch (component) {
                        case "File Select": {
                                var suffix = params.file.name.split(".").pop();
                                var fr = new FileReader();
                                var clazz = this;
                                fr.onload = function(e: Event) {
                                        cur_cache.data = cur_cache.processor.load(e.target.result, suffix);

                                        // Render local data.
                                        cur_cache.processor.render(cur_cache.data, params, clazz.m_ui);
                                }
                                fr.readAsText(params.file);
                                break;
                        }

                        case "Save": {
                                for (var id in this.m_local_cache) {
                                        var cache = this.m_local_cache.get(id);
                                        var calls = cache.processor.upload_calls(cache.data, params);
                                        for (var i = 0; i < calls.length; i ++) {
                                                var meteor_call = calls[i];
                                                Meteor.call(meteor_call[0], meteor_call[1], function (err, result) {
                                                        if (result.error != "")
                                                                alert("Failed to upload " + cache.processor.name() + " data");
                                                });
                                        }
                                }
                                alert("Uploading data");
                                break;
                        }

                        default: {
                                // Download data.
                                var calls = cur_cache.processor.download_calls(params);
                                for (var i = 0; i < calls.length; i ++) {
                                        var meteor_call = calls[i];
                                        var clazz = this;
                                        Meteor.call(meteor_call[0], meteor_call[1], function (err, result) {
                                                if (result.error != "") {
                                                        alert("Failed to download " + cur_cache[0].processor.name() + " data");
                                                        return ;
                                                }
                                                cur_cache.data.push(data_transaction_copy(result.type, result.value));

                                                // Render local cache after collected everything requested by the call.
                                                if (cur_cache.data.length == calls.length) {
                                                        cur_cache.processor.render(cur_cache.data, params, clazz.m_ui);
                                                }
                                        });
                                }
                                break;
                        }
                }
        }
}

export function data_browser_launcher(): void
{
        var identity = <Identity> SessionParams.get_params().obtain(SessionParamObject.Identity);
        var user     = <AccountInfo> SessionParams.get_params().obtain(SessionParamObject.User);
        var session  = <MedicalSession> SessionParams.get_params().obtain(SessionParamObject.MedicalSession);
        
        if (identity == null || user == null || session == null)
                throw Error("Couldn't retrieve access info: [" 
                            + identity + "," + user + "," + session + "]");

        new DataBrowser(identity, user, session).update("Everything");
}
