import {Meteor} from 'meteor/meteor';
import {ParticipatedSession} from "./participatedsession.js"


export function ParticipatedSessionManager(mongodb) {
        this.__mongodb = mongodb;
}
