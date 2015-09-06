/// <reference path="node-0.10.d.ts" />
require('typescript-require');
var jsdom = require("./node_modules/jsdom/lib/jsdom.js");

module Parse {
	export class VoteParser {
		private window;
		private $;

		public constructor(window) {
			this.window = window;
			this.$ = window.jQuery;
		}

		public extractVotes() {
		    var voteRows = this.getVoteRows();
		    var voteData = [];
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
		    
		    return {
		        'link': linkNode.href,
		        'title': linkNode.innerHTML
		    }
		}

		private extractRowData(row){
		    var rowNodes = this.$(row).find('td');;
		    
		    return {
		        'house': rowNodes[0].innerHTML,
		        'date': this.parseDate(rowNodes[1]),
		        'subject': this.extractSubject(rowNodes[2]),
		        'vote_group': rowNodes[3].innerHTML,
		        'party_vote': rowNodes[4].innerHTML,
		        'role': rowNodes[5].innerHTML
		    }
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
