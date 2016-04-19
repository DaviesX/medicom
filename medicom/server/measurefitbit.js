import {Meteor} from 'meteor/meteor';
import {Measure, c_Measure_Type_Fitbit} from "./measure.js";


export function MeasureFitbit() {
        this.__parent = new Measure(c_Measure_Type_Fitbit);
}
