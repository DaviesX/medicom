
export function SessionManager() {

        this.get_error_message = function() {
                return Session.get("errormessage");
        }
        
        this.set_error_message = function(error) {
                Session.set("errormessage", error);
        }
        
        this.get_account_info = function() {
                return Session.get("accountinfo");
        }
        
        this.set_account_info = function(account_info) {
                Session.set("accountinfo", account_info);
        }
        
        this.get_identity_info = function() {
                return Session.get("identityinfo");
        }
        this.set_identity_info = function(identity_info) {
                return Session.set("identityinfo", identity_info);
        }
}
