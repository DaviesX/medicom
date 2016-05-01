export function AccountInfo(record, account_id, name, email) {
        this.__record = record;
        this.__account_id = account_id;
        this.__name = name;
        this.__email = email;
        this.get_record = function() { return this.__record; }
        this.get_account_id = function() { return this.__account_id; }
        this.get_name = function() { return this.__name; }
        this.get_email = function() { return this.__email; }
}

export function AccountInfo_Create_From_POD(pod) {
        var obj = new AccountInfo(null, 0, null, null);
        obj.__record = pod.__record;
        obj.__account_id = pod.__account_id;
        obj.__name = pod.__name;
        obj.__email = pod.__email;
        return obj;
}
