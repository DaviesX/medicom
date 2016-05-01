import {ErrorMessageQueue_Create_From_POD} from "../../api/common.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {Identity_create_from_POD} from "../../api/identity.js";

export function SessionManager() {

        this.get_error_message = function() {
                return ErrorMessageQueue_Create_From_POD(Session.get("errormessage"));
        }
        
        this.set_error_message = function(error) {
                Session.set("errormessage", error);
        }
        
        this.get_account_info = function() {
                return AccountInfo_Create_From_POD(Session.get("accountinfo"));
        }
        
        this.set_account_info = function(account_info) {
                Session.set("accountinfo", account_info);
        }
        
        this.get_identity_info = function() {
                return Identity_create_from_POD(Session.get("identityinfo"));
        }
        this.set_identity_info = function(identity_info) {
                return Session.set("identityinfo", identity_info);
        }
}
