class teamModel {
    constructor(id, tournamentId, name, score) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.name = name;
        this.score = score;
    }
}

module.exports = { teamModel };