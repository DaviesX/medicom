import {Meteor} from 'meteor/meteor';
import {Measure, c_Measure_Type_Symptoms} from "./measure.js";


function MeasureSymptoms() {
        this.__parent = new Measure(c_Measure_Type_Symptoms);
        
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
}
