import {Meteor} from "meteor/meteor";
import {Measure_Create_From_POD} from "./measure.js"


export function MeasureManager(mongodb) {
        this.__mongodb = mongodb;
        this.c_Measure_Coll_Name = "MeasurementCollection";
        
        this.__measures = new Mongo.Collection(this.c_Measure_Coll_Name);
        
        this.create_measure = function(session_id, measure) {
                var measure_id = __mongodb.get_string_uuid();
                measure.__parent.set_session_id(session_id);
                measure.__parent.set_measure_id(measure_id);
                this.__measures.insert(measure);
                return measure;
        }
        
        this.get_measure_by_id = function(measure_id) {
                var result = this.__measures.find({__measure_id : measure_id});
                if (result.count() > 0) {
                        return Measure_Create_From_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.get_measures_by_session_and_type = function(session_id, type) {
                var result = this.__measures.find({__session_id: session_id, __type: type});
                if (result.count() > 0) {
                        var measures = [];
                        var blob = result.fetch();
                        for (var i = 0; i < result.count(); i ++) {
                                measures[i] = Measure_Create_From_POD(blob[i]);
                        }
                        return measures;
                } else {
                        return null;
                }
        }
}
