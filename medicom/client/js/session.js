import {ErrorMessageQueue_Create_From_POD} from "../../api/common.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {Identity_create_from_POD} from "../../api/identity.js";

export function SessionManager() {

        this.get_error_message = function() {
                var err = Session.get("errormessage");
                if (err != null && err != undefined) {
                        return ErrorMessageQueue_Create_From_POD(err);
                } else {
                        return null;
                }
        }
        
        this.set_error_message = function(error) {
                Session.set("errormessage", error);
        }
        
        this.get_account_info = function() {
                var acc_info = Session.get("accountinfo");
                if (acc_info != null && acc_info != undefined) {
                        return AccountInfo_Create_From_POD(acc_info);
                } else {
                        return null;
                }
        }
        
        this.set_account_info = function(account_info) {
                Session.setPersistent("accountinfo", account_info);
        }
        
        this.get_identity_info = function() {
                var iden_info = Session.get("identityinfo");
                if (iden_info != null && iden_info != undefined) {
                        return Identity_create_from_POD(iden_info);
                } else {
                        return null;
                }
        }
        
        this.set_identity_info = function(identity_info) {
                Session.setPersistent("identityinfo", identity_info);
        }
        
        this.set_browsing_account_id = function(account_id) {
                Session.set("browsingid", account_id);
        }
        
        this.get_browsing_account_id = function() {
                return parseInt(Session.get("browsingid"), 10);
        }
        
        this.set_browsing_session_id = function(session_id) {
                Session.set("browsingsessionid", session_id);
        }
        
        this.get_browsing_session_id = function(session_id) {
                return Session.get("browsingsessionid", session_id);
        }
}
