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