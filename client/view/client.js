"use strict";

const { matchesModel } = require('../models/match.js');
const { teamModel } = require('../models/team.js');
const { roundModel } = require('../models/round.js');
const { tournamentModel } = require('../models/tournment.js');

const { roundController } = require('../controllers/round.js');
const { matchesController } = require('../controllers/match.js');
const helper = require('../helpers/helper.js');

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














