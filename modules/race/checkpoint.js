export class Checkpoint {
    constructor(name, dist, elev) {
        this.name = name
        this.dist = dist
        this.elev = elev
        this.EP = this.dist + this.elev * 0.01
        this.percentageEP = 0
        this.target = { arrival: 0, effort: 0, split: 0, EPH: 0 }
        this.recce = { effort: 0, split: 0, EPH: 0 }
        this.actual = { arrival: 0, effort: 0, split: 0, EPH: 0, buffer: 0 }
    }
}


