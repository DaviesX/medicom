import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"


export function Provider(account_id) {
        this.__account_id = account_id;
        this.get_account_id = function() { return this.__account_id; }
}

export function Provider_Create_From_POD(pod) {
        var obj = new Provider(0);
        this.__account_id = pod.__account_id;
        return obj;
}
