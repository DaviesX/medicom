import {Meteor} from 'meteor/meteor';
import {Measure, c_Measure_Type_Fitbit} from "./measure.js";


export function MeasureFitbit(measure_id) {
        this.__parent = new Measure(c_Measure_Type_Fitbit);
        
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
}
