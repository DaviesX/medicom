import {Meteor} from 'meteor/meteor';
import {Measure, c_Measure_Type_PillBottleCap} from "./measure.js";


export function MeasurePillBottleCap() {
        this.__parent = new Measure(c_Measure_Type_PillBottleCap);
        
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
}
