import {Meteor} from 'meteor/meteor';
import {Identity, Identity_create_from_POD} from './identity.js'


export function IdentityManager(mongo, account_mgr, session_out_intv) {
        this.__minute2milli = function(min) { return min*60*1000; }
        this.__mongo = mongo;
        this.__account_mgr = account_mgr;
        this.__session_out_intv = this.__minute2milli(session_out_intv);
        
        // handle the collection
        this.c_Identity_Coll_Name = "IdentityCollection";
        this.__identities = new Mongo.Collection(this.c_Identity_Coll_Name);
        
        this.verify_identity = function(identity) {
                if (identity === null) return false;
                var result = this.__identities.find({__session_id : identity.get_session_id()});
                if (result.count() == 0) return false;
                
                var db_iden = Identity_create_from_POD(result.fetch()[0]);
                var db_account = db_iden.get_account_record();
                var param_account = identity.get_account_record();
                if (db_account.get_account_id() !== param_account.get_account_id() ||
                    db_account.verify_internal_pass(param_account.get_internal_pass() ||
                    !db_account.is_activated())) {
                        return false;
                }
                
                var curr_time = new Date();
                var inactive_intv = curr_time.getTime() - db_iden.get_last_date().getTime();
                if (inactive_intv < 0 || inactive_intv > this.__session_out_intv) {
                        // Time out, needs to remove this identity.
                        this.__identities.remove({__session_id : identity.get_session_id()});
                        return false;
                }
                db_iden.update_date();
                return true;
        }
        
        this.login = function(record, password) {
                if (record === null || !record.verify_password(password)) return null;
                var iden = new Identity(this.__mongo.get_string_uuid(), record);
                this.__identities.insert(iden);
                return iden;
        }
        
        this.logout = function(identity) {
                this.__identities.remove({__session_id : identity.get_session_id()});
        }
        
        this.get_identity_by_session_id = function(session_id) {
                var result = this.__identities.find({__session_id : session_id});
                if (result.count() > 0) {
                        return Identity_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        // Reset all the identity records.
        this.reset = function() {
                this.__identities.remove({});
        }
}
