/// <reference path="node-0.10.d.ts" />
require('typescript-require');
var jsdom = require("./node_modules/jsdom/lib/jsdom.js");
var Parse;
(function (Parse) {
    var VoteGetter = (function () {
        function VoteGetter(mp) {
            this.allVotesLinkExt = "&display=everyvote#divisions";
            this.mp = mp;
        }
        VoteGetter.prototype.getVotes = function () {
            var deferred = Q.defer();
            // reference here so we can pass to callback
            var mp = this.mp;
            jsdom.env(this.mp.link + this.allVotesLinkExt, ["http://code.jquery.com/jquery.js"], function (err, window) {
                if (err === null) {
                    var parser = new VoteParser(window);
                    var voteData = { mp: mp, votes: parser.extractVotes() };
                    deferred.resolve(voteData);
                }
                else {
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        };
        return VoteGetter;
    })();
    Parse.VoteGetter = VoteGetter;
    var VoteParser = (function () {
        function VoteParser(window) {
            this.window = window;
            this.$ = window.jQuery;
        }
        VoteParser.prototype.extractVotes = function () {
            var voteRows = this.getVoteRows();
            var voteData = [];
            for (var i = voteRows.length - 1; i >= 0; i--) {
                voteData.push(this.extractRowData(voteRows[i]));
            }
            ;
            return voteData;
        };
        VoteParser.prototype.parseDate = function (dateNode) {
            var html = dateNode.innerHTML;
            return new Date(html.replace(/&nbsp;/g, ' '));
        };
        VoteParser.prototype.extractSubject = function (subjectNode) {
            var linkNode = subjectNode.childNodes[0];
            var subject = {
                'link': linkNode.href,
                'title': linkNode.innerHTML
            };
            return subject;
        };
        VoteParser.prototype.extractRowData = function (row) {
            var rowNodes = this.$(row).find('td');
            ;
            var vote = {
                'house': rowNodes[0].innerHTML,
                'date': this.parseDate(rowNodes[1]),
                'subject': this.extractSubject(rowNodes[2]),
                'vote_group': rowNodes[3].innerHTML,
                'party_vote': rowNodes[4].innerHTML,
                'role': rowNodes[5].innerHTML
            };
            return vote;
        };
        VoteParser.prototype.getVoteRows = function () {
            var voteRows = [];
            var votesTable = this.$('.votes')[0];
            this.$.merge(voteRows, this.$(votesTable).find('.even'));
            this.$.merge(voteRows, this.$(votesTable).find('.odd'));
            return voteRows;
        };
        return VoteParser;
    })();
    Parse.VoteParser = VoteParser;
})(Parse || (Parse = {}));
require('typescript-require');
var mongodb = require("./node_modules/mongodb/index.js");
var Q = require("./node_modules/q/q.js");
var MPStorage;
(function (MPStorage) {
    var MPConnector = (function () {
        function MPConnector(dbUrl) {
            this.dbUrl = dbUrl;
            this.MongoClient = mongodb.MongoClient;
        }
        MPConnector.prototype.getMps = function () {
            var deferred = Q.defer();
            this.MongoClient.connect(this.dbUrl, function (err, db) {
                if (err !== null) {
                    db.close();
                    deferred.reject(err);
                }
                else {
                    var mpsCollection = db.collection('mps');
                    mpsCollection.find({}).toArray(function (err, data) {
                        db.close();
                        if (err !== null) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve(data);
                        }
                    });
                }
            });
            return deferred.promise;
        };
        return MPConnector;
    })();
    MPStorage.MPConnector = MPConnector;
})(MPStorage || (MPStorage = {}));
var mpCon = new MPStorage.MPConnector('mongodb://localhost:27017/followmp');
mpCon.getMps()
    .then(function (mps) {
    for (var i = 0; i < 10; i++) {
        var mpVoteGetter = new Parse.VoteGetter(mps[i]);
        mpVoteGetter.getVotes()
            .then(function (voteData) {
            console.log(voteData.mp.name + ": " + voteData.votes.length);
        })
            .catch(function (err) {
            console.log(err);
        });
    }
    console.log("mps: " + mps.length);
});
