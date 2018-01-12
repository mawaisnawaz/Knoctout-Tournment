/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { matchesModel } = __webpack_require__(1);
const { teamModel } = __webpack_require__(2);
const { roundModel } = __webpack_require__(3);
const { tournamentModel } = __webpack_require__(4);

const { roundController } = __webpack_require__(5);
const { matchesController } = __webpack_require__(6);
const helper = __webpack_require__(7);

window.onload = () => {
    //event for start button click 
    document.getElementById("start").addEventListener("click", () => {
        
        let startButton = document.getElementById('start');
        //get values from html on button click
        let numberOfTeams = parseInt(document.getElementById("numberOfTeams").value);
        let teamsPerMatch = parseInt(document.getElementById("teamsPerMatch").value);

        //dom element to show the winner
        let winner = document.getElementById("winner");
        let tournmentMapping = document.getElementById("tournmentMapping");
        let currentStatus = document.getElementById("currentStatus");
        
        let preLoader = document.getElementById("preloader");

        if(numberOfTeams % teamsPerMatch != 0){
            currentStatus.innerText = "Error! Number of Teams Should be non zero power of teams per match";
            return numberOfTeams;``
        }else{
            currentStatus.innerText = "";
        }
        // hiden winner info
        winner.innerText = "";
        winner.className = "hidden";

        // redraw match ups squares
        tournmentMapping.innerHTML = "";

        //show preloader
        preLoader.className = "";

        //disable start button
        startButton.setAttribute("disabled", "disabled");

        //start game
        startTournament(numberOfTeams , teamsPerMatch).then((data) => {
            winner.innerText = data.winner.name + "is the Winner.";
            winner.className = "";
            currentStatus.innerText = "";

            //remove disable atribute from start button
            startButton.removeAttribute("disabled");
        });       
    });
}


// initial setup for game
var initMatches = (numberOfMatchUps) => {
    let winner = document.getElementById("winner");
    let preLoader = document.getElementById("preloader");
    let tournmentMapping = document.getElementById("tournmentMapping");

    // hiden winner info
    winner.innerText = "";
    winner.className = "hidden";

    // redraw match ups squares
    tournmentMapping.innerHTML = "";

    for (let i = 0; i < numberOfMatchUps; i++) {
        let matchSquare = document.createElement("li");
        matchSquare.setAttribute("id", `match-${i}`);

        tournmentMapping.appendChild(matchSquare);
    }

    preLoader.className = "hidden";
}


// start the tournament game
var startTournament = async (numberOfTeams , teamPerMatch) => {    
    let request = helper.generateRequest("/tournament", "POST", `numberOfTeams=${numberOfTeams}&teamsPerMatch=${teamPerMatch}`);
    let tournamentDetails = await (await fetch(request)).json(); 

    let tournamentItem = new tournamentModel();
    tournamentItem.id = tournamentDetails.tournamentId;
    tournamentItem.teamsPerMatch = teamPerMatch;
    tournamentItem.rounds = [];
    tournamentItem.teams = [];
    


    let currentStatus = document.getElementById("currentStatus");
    let loaderValue = document.getElementById("loaderValue");

    for (let match_item of tournamentDetails.matchUps) {

        for (let team_id of match_item.teamIds) {
            // retrieve Team info from server
            request = helper.generateRequest("/team", "GET", `tournamentId=${tournamentItem.id}&teamId=${team_id}`);
            let teamData = await (await fetch(request)).json();

            //update team model
            let team = new teamModel();
            team.id = team_id;
            team.tournamentId = tournamentItem.id;
            team.name = teamData.name;
            team.score = teamData.score;

            // add team to the Team List in tournment
            tournamentItem.teams.push(team);
            
            loaderValue.innerText = `${Math.ceil((team_id + 1)*100 / numberOfTeams)}%`;
        }
    }
    

    //indexing for the current match
    let currentMatchIndex = 0; 

    //indexing for the current round during tournment
    let currentRoundId = 0;

    // calculation of total number of matches
    let numberOfMatchUps = matchesController.getTotalMatches (numberOfTeams, teamPerMatch);

    //calculate total number of rounds according to numbers of teams and teams per match
    let numberOfRounds = roundController.getTotalRounds(numberOfTeams, teamPerMatch);
    
    //initialize the matches
    initMatches(numberOfMatchUps);

    // all teams will join in the first round - also determine the winners of a round
    let winnersOfRound = tournamentItem.teams;

    do {
        // send message on UI
        currentStatus.innerText = `ROUND ${currentRoundId + 1}`;

        let round = new roundModel();
        round.id = currentRoundId;
        round.tournamentId = tournamentItem.id;
        round.matchUps = [];

        // get matchups of this round
        let matchesCurrentRound;
        if (currentRoundId == 0) {
            matchesCurrentRound = roundController.getTotalMatchesOfRound(winnersOfRound, tournamentItem.teamsPerMatch, tournamentDetails.matchUps);
        }
        else {
            matchesCurrentRound = roundController.getTotalMatchesOfRound(winnersOfRound, tournamentItem.teamsPerMatch); 
        }

        // clear team list for next round
        winnersOfRound = [];

        
        for (let match_item of matchesCurrentRound) {

            // send message on UI
            let matchElement = document.getElementById(`match-${currentMatchIndex}`);

            //change style of the current match box in html
            matchElement.className = "currentMatch"; 

            currentStatus.innerText = `ROUND ${currentRoundId + 1} - MATCH ${match_item.match + 1}`;

            let match = new matchesModel();
            match.id = match_item.match;
            match.roundId = round.id; 
            match.tournamentId = tournamentItem.id;
            match.teams = [];
            
            // retrieve Match score from server ------------------------------
            request = helper.generateRequest("/match", "GET", `tournamentId=${tournamentItem.id}&round=${match.roundId}&match=${match.id}`);
            let matchUpData = await (await fetch(request)).json();
            match.score = matchUpData.score;
            
            // params to determine winner
            let winnerParams = `tournamentId=${tournamentItem.id}&matchScore=${match.score}`; 

            // get team list of this match ---------------------------------
            for (let team_id of match_item.teamIds) {

                // add team to this match
                match.teams.push(tournamentItem.teams[team_id]);

                // add team score to params
                winnerParams += "&teamScores=" + tournamentItem.teams[team_id].score;
            }
            
            // retrieve Winner Score from server -----------------------------
            request = helper.generateRequest("/winner", "GET", winnerParams);
            let winnerScoreData = await (await fetch(request)).json();

            // get winner of this match
            match.winner = match.teams.find((val) => {
                return val.score == winnerScoreData.score;
            });

            // change the color of UI after match finish
            matchElement.className = "matchFinish";
            currentMatchIndex++;
            
            
            // add team to join in the next round
            winnersOfRound.push(match.winner);

            // add this match to this round
            round.matchUps.push(match);
        } 

        // add this round to tournament
        tournamentItem.rounds.push(round);

        // Go to next round
        currentRoundId++;
    }
    while (currentRoundId < numberOfRounds);

    // get the winner of tournament
    tournamentItem.winner = winnersOfRound[0];

    return tournamentItem;
}
















/***/ }),
/* 1 */
/***/ (function(module, exports) {

class matchesModel {
    constructor(id, roundId, tournamentId, score, teams, winner) {
        this.id = id;
        this.roundId = roundId;
        this.tournamentId = tournamentId;
        this.score = score;
        this.teams = teams;
        this.winner = winner;
    }
}

module.exports = { matchesModel };

/***/ }),
/* 2 */
/***/ (function(module, exports) {

class teamModel {
    constructor(id, tournamentId, name, score) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.name = name;
        this.score = score;
    }
}

module.exports = { teamModel };

/***/ }),
/* 3 */
/***/ (function(module, exports) {

class roundModel {
    constructor(id, tournamentId, matchUps) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.matchUps = matchUps;
    }
}

module.exports = { roundModel };

/***/ }),
/* 4 */
/***/ (function(module, exports) {

class tournamentModel {
    constructor(id, teamsPerMatch, rounds, teams, winner) {
        this.id = id;
        this.teamsPerMatch = teamsPerMatch;
        this.rounds = rounds;
        this.teams = teams;
        this.winner = winner;
    }
}

module.exports = { tournamentModel };

/***/ }),
/* 5 */
/***/ (function(module, exports) {

class roundController {
    // calculate the total numbers of rounds in tournment
    static getTotalRounds (numberOfTeams, teamsPerMatch) {
        let numberOfRounds = Math.log(numberOfTeams) / Math.log(teamsPerMatch);
        return Math.floor(numberOfRounds);
    }

    // calculate the number of matches in a round
    static getTotalMatchesOfRound (teamsOfCurrentRound, teamsPerMatch, initData = null) {
        
        if (initData != null) {
            return initData;
        }

        let matchUps = [];
        let teamsInMatchUp = [];

        for (let i = 0; i < teamsOfCurrentRound.length; i++) {
            teamsInMatchUp.push(teamsOfCurrentRound[i].id);

            if (teamsInMatchUp.length === teamsPerMatch) {
                matchUps.push({
                    match: matchUps.length,
                    teamIds: teamsInMatchUp.splice(0)
                });
            }
        }

        return matchUps;
    }
}

module.exports = { roundController };

/***/ }),
/* 6 */
/***/ (function(module, exports) {

class matchesController {
    // calculate the total number of matches in a tournment
    static getTotalMatches(numberOfTeams, teamsPerMatch) {
        let match_count = 0;
        while (numberOfTeams != 1) {
            numberOfTeams = Math.floor(numberOfTeams / teamsPerMatch);
            match_count += numberOfTeams;
        }
        return match_count;
    }  
}

module.exports = { matchesController }; 

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateRequest", function() { return generateRequest; });


// function to generate request for fetching data from server
//request method : get/post
var generateRequest = (requestUrl, requestMethod, requestData = null) => {
    let reqInit = {
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        mode: 'no-cors',
        method: requestMethod
    };

    //add parameters
    if (requestData != null) {
        if (requestMethod == "GET") {
            requestUrl = `${requestUrl}?${requestData}`;
        }
        else { 
            //for post request add body parameter in request
            reqInit.body = requestData;
        }
    }

    return new Request(requestUrl, reqInit);
}

/***/ })
/******/ ]);