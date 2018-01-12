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