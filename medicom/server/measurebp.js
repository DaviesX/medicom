import {Meteor} from "meteor/meteor";
import {Measure, Measure_Parent_Create_From_POD, c_Measure_Type_BP} from "./measure.js";

function MeasureBP() {
        this.__parent = new Measure(c_Measure_Type_BP);
        this.__value = 0;
        
        this.set_bp_value = function(bp) { this.__value = bp; }
        
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
        this.get_bp_value = function() { return this.__value; }
}

function MeasureBP_Create_From_POD(pod) {
        var obj = new MeasureBP(0);
        obj.__parent = Measure_Parent_Create_From_POD(pod.__parent);
        obj.__date = pod.__date;
        obj.__value = pod.__value;
        return obj;
}
