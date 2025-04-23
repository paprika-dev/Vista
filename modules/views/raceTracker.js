import { 

    progressbar, 
    dashboard, 
    arrival,
    resetraceBtn,
    infoBoxLastCP,
    infoBoxNextCP,
    racestartInput

} from "../utils/elements.js"
import { race } from "../race/race.js"
import { displayFigure } from "../utils/displayFigure.js";
import { RaceTime } from "../utils/raceTime.js";
import { racePlan } from "./racePlan.js";

class RaceTracker {

    recordArrival(now = new Date()){

        if (!race.actual.started) {
            race.actual.started = true; // mark race start
            race.actual.startTimeStr = RaceTime.getLocalTime(now);
            race.checkpoints[0].actual.arrival = now.getHours() * 60 + now.getMinutes() + now.getSeconds()/60;

            // set target race start to actual
            racestartInput.value = RaceTime.minutesToTime(race.checkpoints[0].actual.arrival);
            racePlan.setRaceStart();

        } else {
            race.actual.lastcheckpoint += 1;
            let lcp = race.checkpoints[race.actual.lastcheckpoint];
            let llcp = race.checkpoints[race.actual.lastcheckpoint - 1];
            race.actual.progress += lcp.percentageEP;
            race.projected.completion += lcp.target.effort;

            // record actual arrival, split, split EPH and buffer
            lcp.actual.arrival = race.checkpoints[0].actual.arrival +
                            RaceTime.getMinsPassed(
                                new Date(race.actual.startTimeStr), 
                                now
                            );
            lcp.actual.split = lcp.actual.arrival - llcp.actual.arrival;
            lcp.actual.EPH = RaceTime.EPH(lcp.EP, lcp.actual.split);
            lcp.actual.buffer = lcp.target.split - lcp.actual.split;
            
            // calculate total race time, buffer
            race.actual.rt += lcp.actual.split;
            race.actual.buffer += lcp.actual.buffer;

            if (race.actual.lastcheckpoint + 1 == race.checkpoints.length) {
                race.actual.finished = true; // mark race finish
                race.clearProjection();
                race.actual.EPH = RaceTime.EPH(race.total.EP, race.actual.rt);

                // actual split effort
                for (let k = 1; k < race.checkpoints.length; k++) {
                    const checkpointK =  race.checkpoints[k]
                    checkpointK.actual.effort = checkpointK.actual.split / race.actual.rt
                };
            } else {
                this.arrivalProjection(); // project race time and next arrival
                this.paceAnalysis(); // check whether to push or ease
            }
        }

        race.saveCheckpoints();
        race.saveProgress();
    }

    arrivalProjection(){
        race.projected.rt = race.actual.rt / race.projected.completion;

        race.projected.nextarrival = 
            race.checkpoints[race.actual.lastcheckpoint].actual.arrival 
            + race.projected.rt * race.checkpoints[race.actual.lastcheckpoint + 1].target.effort;

        race.saveProjection();
    }

    paceAnalysis(){
        const remainingEP = race.total.EP * (1 - race.actual.progress);
        race.pace.target = RaceTime.EPH(remainingEP, race.target.rt - race.actual.rt) // pace to achieve target finish
        race.pace.projected = RaceTime.EPH(remainingEP, race.projected.rt - race.actual.rt) // pace to achieve projected finish

        const data = {
            "CURR": race.checkpoints[race.actual.lastcheckpoint].actual.EPH,
            "TARG": race.pace.target,
            "PROJ": race.pace.projected
          };
          
        const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        
        // EPH comparison
        let tag = "";
        sortedEntries.forEach(([key, value]) => {
        if (key == "CURR") {
            tag += `<i class="bi bi-speedometer2 special"></i><p class="lastsplitEPH">CURR</p><p class="lastsplitEPH">${displayFigure(value, 2)}</p>`
        } else {
            tag += `<i class="bi bi-circle"></i><p>${key}</p><p>${displayFigure(value, 2)}</p>`
        }
        });
        race.pace.tag = tag;

        // set action call
        race.pace.plan = (data["CURR"] < data["TARG"]) ? "PUSH" : "GO";

        // save
        race.savePaceAnalysis();
    }

    // Rendering
    updateTargetTime() {
        dashboard.rttarget.innerHTML = RaceTime.minutesToTime(race.target.rt);
    }

    updateDashboard() {
        // progress bar
        progressbar.style.width = race.actual.progress ? `${displayFigure(race.actual.progress * 100, 2)}%`: 0;

        // target time
        this.updateTargetTime();

        // actual race time
        dashboard.rtpassed.innerHTML = RaceTime.minutesToTime(race.actual.rt);

        // buffer
        dashboard.buffer.innerHTML = displayFigure(race.actual.buffer,0)+"'";
        if (race.actual.buffer < 0) {
            dashboard.buffer.classList.add("negative");
        } else {
            dashboard.buffer.classList.remove("negative");
        }

        // projected race time
        dashboard.rtprojected.innerHTML = RaceTime.minutesToTime(race.projected.rt);

        // action call
        dashboard.plan.innerHTML = race.pace.plan;
        if (race.pace.plan == "PUSH") {
            dashboard.plan.classList.add('negative');
        } else {
            dashboard.plan.classList.remove('negative');
        }

        // pace analysis
        dashboard.pace.innerHTML = race.pace.tag;
    }

    initializeInfoBox(box, cpname){
        box.cpname.innerHTML = cpname;
        box.cpinfo.innerHTML = "EP | km | +m";
        box.targetArrival.innerHTML = "--:--";
        box.actualOrProjArrival.innerHTML = "--:--";
        box.buffer.innerHTML = "-";
        box.splitEPH = "-";
    }

    updateCheckpointInfoBox() {
        // no CP input
        if (race.checkpoints.length == 0) {
            this.initializeInfoBox(infoBoxLastCP, "Last CP");
            this.initializeInfoBox(infoBoxNextCP, "Next CP");
            return
        }

        let i = race.actual.lastcheckpoint;

        // last CP
        if (race.checkpoints.length > 0) {
            infoBoxLastCP.cpname.innerHTML = race.prefixedName(i);
            infoBoxLastCP.cpinfo.innerHTML = 
                `${displayFigure(race.checkpoints[i].EP, 1)} EP | 
                 ${displayFigure(race.checkpoints[i].dist, 1)} km | 
                 +${race.checkpoints[i].elev} m`

            let cp = race.checkpoints[i]
            infoBoxLastCP.targetArrival.innerHTML = RaceTime.minutesToDayTime(cp.target.arrival);
            infoBoxLastCP.actualOrProjArrival.innerHTML = RaceTime.minutesToDayTime(cp.actual.arrival);
            infoBoxLastCP.buffer.innerHTML = displayFigure(cp.actual.buffer, 0)+"'";
            infoBoxLastCP.EPH.innerHTML = displayFigure(cp.actual.EPH, 2);

            // show negative buffer in orange
            if (cp.actual.buffer < 0) {
                infoBoxLastCP.buffer.classList.add("negative");
            } else {
                infoBoxLastCP.buffer.classList.remove("negative");
            }
        }

        // next CP
        if (race.actual.finished) {
            this.initializeInfoBox(infoBoxNextCP, "You have made it!");
        } else if (race.checkpoints.length > 1) {
            infoBoxNextCP.cpname.innerHTML = race.prefixedName(i+1);
            infoBoxNextCP.cpinfo.innerHTML = 
            `${displayFigure(race.checkpoints[i+1].EP, 1)} EP | 
             ${displayFigure(race.checkpoints[i+1].dist, 1)} km | 
             +${race.checkpoints[i+1].elev} m`

            let cp = race.checkpoints[i+1];
            infoBoxNextCP.targetArrival.innerHTML = RaceTime.minutesToDayTime(cp.target.arrival);
            infoBoxNextCP.actualOrProjArrival.innerHTML = RaceTime.minutesToDayTime(race.projected.nextarrival);
        }
    }
    
    updateBtnText(){
        arrival.btn.innerHTML = race.actual.finished ? 
            `<i class="bi bi-award-fill"></i> Congratulations!` : (race.actual.started ?
                `<i class="bi bi-bookmark-star-fill"></i> Arrived at ${race.prefixedName(race.actual.lastcheckpoint + 1)}` : 
                `<i class="bi bi-flag-fill"></i> Start`
            )
    }

    showResetBtn(){
        resetraceBtn.style.display = race.actual.finished ? 'block' : 'none';
    }

    render() {
        this.updateDashboard();
        this.updateCheckpointInfoBox();
        this.updateBtnText();
        this.showResetBtn();
    }
}

export const raceTracker = new RaceTracker();