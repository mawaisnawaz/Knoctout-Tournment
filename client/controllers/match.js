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