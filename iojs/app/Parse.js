/// <reference path="node-0.10.d.ts" />
require('typescript-require');
var jsdom = require("./node_modules/jsdom/lib/jsdom.js");
var Parse;
(function (Parse) {
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
            return {
                'link': linkNode.href,
                'title': linkNode.innerHTML
            };
        };
        VoteParser.prototype.extractRowData = function (row) {
            var rowNodes = this.$(row).find('td');
            ;
            return {
                'house': rowNodes[0].innerHTML,
                'date': this.parseDate(rowNodes[1]),
                'subject': this.extractSubject(rowNodes[2]),
                'vote_group': rowNodes[3].innerHTML,
                'party_vote': rowNodes[4].innerHTML,
                'role': rowNodes[5].innerHTML
            };
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
