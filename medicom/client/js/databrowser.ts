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

import {Identity} from "../../api/identity.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";
import {IDataTransaction} from "../../api/idatatransaction.ts";
import {data_transaction_copy} from "../../api/datatransfactory.ts";

import {DataBrowserUI} from "./databrowserui.ts";
import {IDataProcessor} from "./idataprocessor.ts";
import {data_proc_factory_create_all} from "./dataprocfactory.ts";
import {SessionParamObject, session_params_inst} from "./sessionparams.ts";
import {UI, UIObserver} from "./ui.ts";


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


/*
 * <DataBrowser> A controller class to coordinate data presentation.
 */
export class DataBrowser
{
        private m_identity:     Identity;
        private m_user:         AccountInfo;
        private m_session:      MedicalSession;
        private m_local_cache:  Map<string, [IDataProcessor, IDataTransaction]>;
        private m_ui:           DataBrowserUI;

        constructor(identity: Identity, user: AccountInfo, session: MedicalSession)
        {
                this.m_identity = identity;
                this.m_user = user;
                this.m_session = session;

                this.m_ui = new DataBrowserUI(new DataBrowserObserver(this));

                // Initialize local cache and ui display mode.
                var a = data_proc_factory_create_all(identity, user, session);
                for (var i = 0; i < a.length; i ++) {
                        this.m_local_cache.set(a[i].id(), [a[i], null]);
                        this.m_ui.add_display_mode(a[i].name(), a[i].id());
                }
        }

        public update(component: string): void
        {
                var cur_cache = this.m_local_cache.get(this.m_ui.display_mode());
                var params = this.m_ui.generate_data_params();

                switch (component) {
                        case "File Select": {
                                var suffix = params.file.name.split(".").pop();
                                var fr = new FileReader();
                                fr.onload = function(e: Event) {
                                        cur_cache[1] = cur_cache[0].load(e.target.result, suffix);

                                        // Render local data.
                                        cur_cache[0].render(cur_cache[1], params, this.m_ui);
                                }
                                fr.readAsText(params.file);
                                break;
                        }

                        case "Save": {
                                for (var id in this.m_local_cache) {
                                        var cache = this.m_local_cache.get(id);
                                        var call = cache[0].upload_call(cache[1], params);
                                        Meteor.call(call[0], call[1], function (err, result) {
                                                if (result.error != "")
                                                        alert("Failed to upload " + cache[0].name() + " data");
                                        });
                                }
                                alert("Uploading data");
                                break;
                        }

                        default: {
                                // Download data.
                                var call = cache[0].download_call(params);
                                Meteor.call(call[0], call[1], function (err, result) {
                                        if (result.error != "") {
                                                alert("Failed to download " + cache[0].name() + " data");
                                                return ;
                                        }
                                        cur_cache[1] = data_transaction_copy(result.type, result.value);

                                        // Render local cache.
                                        cur_cache[0].render(cur_cache[1], params, this.m_ui);
                                });
                                break;
                        }
                }
        }
}

export function data_browser_launcher(): void
{
        var identity = <Identity> session_params_inst().obtain(SessionParamObject.Identity);
        var user     = <AccountInfo> session_params_inst().obtain(SessionParamObject.User);
        var session  = <MedicalSession> session_params_inst().obtain(SessionParamObject.MedicalSession);
        
        if (identity == null || user == null || session == null)
                throw Error("Couldn't retrieve access info: [" 
                            + identity + "," + user + "," + session + "]");

        new DataBrowser(identity, user, session).update("Everything");
}
