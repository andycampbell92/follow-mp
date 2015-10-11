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
        VoteParser.prototype.generateVoteHash = function (date, title) {
            var hashSpaces = date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate() + title;
            return hashSpaces.replace(/ /g, '');
        };
        VoteParser.prototype.extractRowData = function (row) {
            var rowNodes = this.$(row).find('td');
            var voteDate = this.parseDate(rowNodes[1]);
            var voteSubject = this.extractSubject(rowNodes[2]);
            var vote = {
                'house': rowNodes[0].innerHTML,
                'date': voteDate,
                'subject': voteSubject,
                'vote_group': rowNodes[3].innerHTML,
                'party_vote': rowNodes[4].innerHTML,
                'role': rowNodes[5].innerHTML,
                'hash': this.generateVoteHash(voteDate, voteSubject.title)
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
        MPConnector.prototype.getMps = function (mpIds) {
            var deferred = Q.defer();
            this.MongoClient.connect(this.dbUrl, function (err, db) {
                if (err !== null) {
                    db.close();
                    deferred.reject(err);
                }
                else {
                    var mpsCollection = db.collection('mps');
                    var query = {};
                    if (mpIds !== undefined) {
                        mpIds = mpIds.map(function (id) { return new mongodb.ObjectID(id); });
                        query = { _id: { $in: mpIds } };
                    }
                    mpsCollection.find(query).toArray(function (err, data) {
                        if (err !== null) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve(data);
                        }
                        db.close();
                    });
                }
            });
            return deferred.promise;
        };
        MPConnector.prototype.updateVotes = function (mp, votes) {
            var deferred = Q.defer();
            this.MongoClient.connect(this.dbUrl, function (err, db) {
                // get all existing vote hashes for MP
                var voteCollection = db.collection('votes');
                voteCollection.find({ 'voter': mp._id }, { 'hash': 1, '_id': 0 }).toArray(function (err, data) {
                    var existingHashes = data.map(function (x) { return x.hash; });
                    var newHashes = votes.map(function (x) { return x.hash; });
                    // Get the new hashes that do not exist in DB
                    var diffHashes = newHashes.filter(function (x) { return existingHashes.indexOf(x) < 0; });
                    // insert votes where the hash is new
                    var docsToInsert = [];
                    for (var i = votes.length - 1; i >= 0; i--) {
                        if (diffHashes.indexOf(votes[i].hash) > -1) {
                            votes[i].voter = mp._id;
                            docsToInsert.push(votes[i]);
                        }
                    }
                    ;
                    if (docsToInsert.length > 0) {
                        voteCollection.insert(docsToInsert, {}, function (err, doc) {
                            if (err !== null) {
                                deferred.reject(err);
                            }
                            else {
                                deferred.resolve(docsToInsert);
                            }
                            db.close();
                        });
                    }
                    else {
                        deferred.resolve(docsToInsert);
                        db.close();
                    }
                });
            });
            return deferred.promise;
        };
        return MPConnector;
    })();
    MPStorage.MPConnector = MPConnector;
})(MPStorage || (MPStorage = {}));
var mpCon = new MPStorage.MPConnector('mongodb://localhost:27017/followmp');
// For ease of the MVP we are only using the 10 MPS that had the largest electorate in 2015
var supportedMPS = [
    '55db7aea9af6d6a98621f0b5',
    '55db7aea9af6d6a98621ef34',
    '55db7aea9af6d6a98621eeef',
    '55db7aea9af6d6a98621eea1',
    '55db7aea9af6d6a98621f0bc',
    '55db7aea9af6d6a98621f092',
    '55db7aea9af6d6a98621ee60',
    '55db7aea9af6d6a98621f03c',
    '55db7aea9af6d6a98621f0a9',
    '55db7aea9af6d6a98621eeee'
];
mpCon.getMps(supportedMPS)
    .then(function (mps) {
    for (var i = 0; i < 10; i++) {
        var mpVoteGetter = new Parse.VoteGetter(mps[i]);
        mpVoteGetter.getVotes()
            .then(function (voteData) {
            mpCon.updateVotes(voteData.mp, voteData.votes)
                .then(function (inserted) {
                console.log(voteData.mp.name + ' voted ' + inserted.length + ' times since last run');
            })
                .catch(function (err) {
                console.log(err);
            });
        })
            .catch(function (err) {
            console.log(err);
        });
    }
    console.log("mps: " + mps.length);
});
