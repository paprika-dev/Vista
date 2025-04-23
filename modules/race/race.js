class Race {
    constructor() {
        this.checkpoints = [];
        this.total = { dist: 0, elev: 0, EP: 0 };
        this.target = { rt: 0, EPH: 0 };
        this.recce = { rt: 0, EPH: 0, fullRecce: true };
        this.actual = 
        { 
            startTimeStr: "",
            started: false, 
            finished: false, 
            lastcheckpoint: 0, 
            progress: 0, 
            rt: 0, 
            buffer: 0,
            EPH: 0
        }
        this.projected = { completion: 0, nextarrival: 0, rt: 0 }
        this.pace = { target:"", projected: "", 
            tag: `<i class="bi bi-speedometer2 special"></i>
            <p class="lastsplitEPH">CURR</p><p class="lastsplitEPH">-</p>
            <i class="bi bi-circle"></i><p>TARG</p><p>-</p>
            <i class="bi bi-circle"></i><p>PROJ</p><p>-</p>`, plan: "-" }
    }

    prefixedName(i) {
        let prefix = ""
        switch (i) { 
            case 0: 
                prefix = "Start: "; break;
            case this.checkpoints.length - 1: 
                prefix = "Finish: "; break;
            default: 
                prefix = "CP" + i + ": ";
        }
        return prefix + this.checkpoints[i].name;
    }

    calculateTotal() {
        this.total = this.checkpoints.reduce((total, checkpoint) => {
            total.dist += checkpoint.dist;
            total.elev += checkpoint.elev;
            total.EP += checkpoint.EP;
            return total;
        }, { dist: 0, elev: 0, EP: 0 });

        for (let i = 1; i < this.checkpoints.length; i++) {
            const cp = this.checkpoints[i]
            cp.percentageEP = cp.EP / this.total.EP
        };
    }

    saveCheckpoints() {
        localStorage.setItem("checkpoints", JSON.stringify(this.checkpoints));
        localStorage.setItem("total", JSON.stringify(this.total));
    }

    saveTarget() {
        localStorage.setItem("target", JSON.stringify(this.target));
    }

    saveRecce() {
        localStorage.setItem("recce", JSON.stringify(this.recce));
    }

    saveProgress() {
        localStorage.setItem("actual", JSON.stringify(this.actual));
    }

    saveProjection() {
        localStorage.setItem("projected", JSON.stringify(this.projected));
    }

    savePaceAnalysis(){
        localStorage.setItem("pace", JSON.stringify(this.pace));
    }

    removeTarget() {
        this.target = { rt: 0, EPH: 0 }
        localStorage.removeItem("target");

        for (let i = 1; i < this.checkpoints.length; i++) {
            const cp = this.checkpoints[i]
            cp.target = { arrival: 0, effort: 0, split: 0, EPH: 0 }
        }
        this.saveCheckpoints();
    }  

    clearProjection(){
        this.pace = { target:"", projected: "", 
            tag: `<i class="bi bi-speedometer2 special"></i>
            <p class="lastsplitEPH">CURR</p><p class="lastsplitEPH">-</p>
            <i class="bi bi-circle"></i><p>TARG</p><p>-</p>
            <i class="bi bi-circle"></i><p>PROJ</p><p>-</p>`, plan: "-" };
        this.projected = { completion: 0, nextarrival: 0, rt: 0 };

        localStorage.removeItem("projected");
        localStorage.removeItem("pace");
    }

    resetRace(){
        this.actual = 
        { 
            startTimeStr: "",
            started: false, 
            finished: false, 
            lastcheckpoint: 0, 
            progress: 0, 
            rt: 0, 
            buffer: 0,
            EPH: 0
        }
        this.clearProjection();
        
        for (let i = 0; i < this.checkpoints.length; i++) {
            const cp = this.checkpoints[i]
            cp.actual = { arrival: 0, effort: 0, split: 0, EPH: 0, buffer: 0 }
        };
        this.saveCheckpoints();
        localStorage.removeItem("actual");
    }

    reset() {
        this.checkpoints = [];
        this.total = { dist: 0, elev: 0, EP: 0 };
        this.target = { rt: 0, EPH: 0 };
        this.recce = { rt: 0, EPH: 0, fullRecce: true };
        this.actual = 
        { 
            startTimeStr: "",
            started: false, 
            finished: false, 
            lastcheckpoint: 0, 
            progress: 0, 
            rt: 0, 
            buffer: 0,
            EPH: 0
        }
        this.clearProjection();

        localStorage.removeItem("checkpoints");
        localStorage.removeItem("total");
        localStorage.removeItem("target");
        localStorage.removeItem("recce");
        localStorage.removeItem("actual");
    }    
}

export const race = new Race();
