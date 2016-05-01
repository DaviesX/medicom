
export var c_Account_Type_Admin = 0;
export var c_Account_Type_Provider = 1;
export var c_Account_Type_Patient = 2;
export var c_Account_Type_SuperIntendant = 3;

export var c_Account_Type_Strings = 
["admin", "provider", "patient", "super intendant"];

export var c_Account_Type_Strings_Registerable = 
["provider", "patient", "super intendant"];

export var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";
c_Account_Type2String[c_Account_Type_SuperIntendant] = "super intendant";

export var c_String2Account_type = [];
c_String2Account_type["admin"] = c_Account_Type_Admin;
c_String2Account_type["provider"] = c_Account_Type_Provider;
c_String2Account_type["patient"] = c_Account_Type_Patient;
c_String2Account_type["super intendant"] = c_Account_Type_SuperIntendant;

export function AccountType() {
        this.get_string_from_account_type = function(accounttype) {
                return c_Account_Type2String[accounttype];
        }
        
        this.get_account_type_from_string = function(str) {
                return c_String2Account_type[str];
        }
        
        this.get_registerable_account_type_strings = function() {
                return c_Account_Type_Strings_Registerable;
        }
        
        this.get_accoun_type_strings = function() {
                return c_Account_Type_Strings;
        }
}
