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