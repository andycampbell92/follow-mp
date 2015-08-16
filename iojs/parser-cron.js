var jsdom = require('jsdom');
var Q = require('q');

var getVoteRows = function(){
    var voteRows = [];

    var votesTable = $('.votes')[0];
    $.merge(voteRows, $(votesTable).find('.even'));
    $.merge(voteRows, $(votesTable).find('.odd'));

    return voteRows;    
};

var parseDate = function(dateNode){
    var html = dateNode.innerHTML;
    
    return new Date (html.replace(/&nbsp;/g, ' '));
};

var extractSubject = function(subjectNode){
    var linkNode = subjectNode.childNodes[0];
    
    return {
        'link': linkNode.href,
        'title': linkNode.innerHTML
    };
};

var extractRowData = function(row){
    var rowNodes = $(row).find('td');;
    
    return {
        'house': rowNodes[0].innerHTML,
        'date': parseDate(rowNodes[1]),
        'subject': extractSubject(rowNodes[2]),
        'vote_group': rowNodes[3].innerHTML,
        'party_vote': rowNodes[4].innerHTML,
        'role': rowNodes[5].innerHTML
    };
};

var extractVoteData = function(){
    var voteRows = getVoteRows();
    var voteData = [];
    for (var i = voteRows.length - 1; i >= 0; i--) {
        voteData.push(extractRowData(voteRows[i]));
    };
    
    return voteData;
};

var getMPData = function(mpUrl){
    var displayAllExt = "&display=everyvote#divisions";
    var deferred = Q.defer();
    jsdom.env(
        mpUrl+displayAllExt,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                $ = window.jQuery;
                extractVoteData();
                deferred.resolve(extractVoteData());
            };
        }
    );

    return deferred.promise;
};

getMPData("http://www.publicwhip.org.uk/mp.php?mpn=Peter_Aldous&mpc=Waveney&house=commons")
.then(function(data){console.log(data)});