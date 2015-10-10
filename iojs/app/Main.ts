/// <reference path="node-0.10.d.ts" />

require('typescript-require');
var jsdom = require("./node_modules/jsdom/lib/jsdom.js");

module Parse {
	export interface iSubject {
		link: string,
		title: string
	}

	export interface iVote {
		house: string,
		date: Date,
		subject: iSubject,
		vote_group: string,
		party_vote: string,
		role: string
	}

	export class VoteGetter {
		private mp;
		private allVotesLinkExt = "&display=everyvote#divisions";


		public constructor(mp) {
			this.mp = mp;
		}

		public getVotes() {
			var deferred = Q.defer();
			// reference here so we can pass to callback
			var mp = this.mp;
			jsdom.env(
				this.mp.link+this.allVotesLinkExt,
			  	["http://code.jquery.com/jquery.js"],
				  function (err, window) {
				  	if(err===null){
						var parser = new VoteParser(window);
						var voteData = { mp: mp, votes: parser.extractVotes() };
						deferred.resolve(voteData);
					}else{
						deferred.reject(err);
					}

				  }
			);

			return deferred.promise;
		}
	}

	export class VoteParser {
		private window;
		private $;

		public constructor(window) {
			this.window = window;
			this.$ = window.jQuery;
		}

		public extractVotes() {
		    var voteRows = this.getVoteRows();
		    var voteData:iVote[] = [];
		    for (var i = voteRows.length - 1; i >= 0; i--) {
		        voteData.push(this.extractRowData(voteRows[i]));
		    };
		    
		    return voteData;
		}

		private parseDate(dateNode){
		    var html = dateNode.innerHTML;
		    
		    return new Date (html.replace(/&nbsp;/g, ' '));
		}

		private extractSubject(subjectNode){
		    var linkNode = subjectNode.childNodes[0];
			var subject:iSubject = {
				'link': linkNode.href,
				'title': linkNode.innerHTML
			};

			return subject;
		}

		private extractRowData(row){
		    var rowNodes = this.$(row).find('td');;
			var vote: iVote = {
				'house': rowNodes[0].innerHTML,
				'date': this.parseDate(rowNodes[1]),
				'subject': this.extractSubject(rowNodes[2]),
				'vote_group': rowNodes[3].innerHTML,
				'party_vote': rowNodes[4].innerHTML,
				'role': rowNodes[5].innerHTML,
			};

			return vote; 

		}

		private getVoteRows() {
			var voteRows = [];

			var votesTable = this.$('.votes')[0];
			this.$.merge(voteRows, this.$(votesTable).find('.even'));
			this.$.merge(voteRows, this.$(votesTable).find('.odd'));

			return voteRows;
		}
	}
}


require('typescript-require');
var mongodb = require("./node_modules/mongodb/index.js");
var Q = require("./node_modules/q/q.js");

module MPStorage {
	export class MPConnector {
		private dbUrl:string;
		private MongoClient;

		public constructor(dbUrl:string){
			this.dbUrl = dbUrl;
			this.MongoClient = mongodb.MongoClient;
		}

		public getMps(mpIds){
			var deferred = Q.defer();

			this.MongoClient.connect(this.dbUrl, function(err, db) {
				if (err !== null) {
					db.close();
					deferred.reject(err);
				} else {
					var mpsCollection = db.collection('mps');
					var query = {};
					if(mpIds !== undefined) {
						mpIds = mpIds.map(function(id){return new mongodb.ObjectID(id)});
						query = {_id:{$in:mpIds}};
					}
					mpsCollection.find(query).toArray(function(err, data) {
						db.close();
						if (err !== null) {
							deferred.reject(err);
						} else {
							deferred.resolve(data);
						}
					});
				}
			});

			return deferred.promise;
		}
	}
}

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
.then(function(mps){
	for (var i = 0; i < 10; i++){
		var mpVoteGetter = new Parse.VoteGetter(mps[i]);
		mpVoteGetter.getVotes()
		.then(function(voteData){
			console.log(voteData.mp.name + ": " + voteData.votes.length);
		})
		.catch(function(err){
			console.log(err);
		});
	}
	console.log("mps: " + mps.length);
});