import {Meteor} from 'meteor/meteor';


function MeasureBP(measure_id) {
        this.__measure_id = measure_id;
        this.__date = new Date();
        this.__value = 0;
        
        this.set_bp_value = function(bp) { this.__value = bp; }
        
        this.get_measure_id = function() { return this.__measure_id; }
        this.get_date = function() { return this.__date; }
        this.get_bp_value = function() { return this.__value; }
}

function MeasureBP_Create_From_POD(pod) {
        var obj = new MeasureBP(0);
        obj.__measure_id = pod.__measure_id;
        obj.__date = pod.__date;
        obj.__value = pod.__value;
        return obj;
}
