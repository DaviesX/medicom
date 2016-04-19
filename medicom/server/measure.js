import {Meteor} from 'meteor/meteor';
import {MeasureBP, MeasureBP_Create_From_POD} from "./measurebp.js";
import {MeasureSymptoms} from "./measuresymptoms.js";
import {MeasureFitbit} from "./measurefitbit.js";
import {MeasurePillBottleCap} from "./measurepillbottlecap.js";

var c_Measure_Type_BP = "MeasureBP";
var c_Measure_Type_Symptoms = "MeasureSymptoms";
var c_Measure_Type_Fitbit = "MeasureFitbit";
var c_Measure_Type_PillBottleCap = "MeasurePillBottleCap";

export function Measure(type) {
        this.__measure_id = "-1";
        this.__session_id = -1;
        this.__type = type;
        this.__date = new Date();
        
        this.set_session_id = function(session_id) { this.__session_id = session_id; }
        this.set_measure_id = function(measure_id) { this.__measure_id = measure_id; }
}

export function Measure_Parent_Create_From_POD(pod) {
        var obj = new Measure("");
        this.__measure_id = pod.__measure_id;
        this.__session_id = pod.__session_id;
        this.__type = pod.__type;
        this.__date = pod.__date;
        return obj;
}

export function Measure_Create_From_POD(pod) {
        switch (pod.__type) {
        case c_Measure_Type_BP:
                return MeasureBP_Create_From_POD(pod);
        }
}
