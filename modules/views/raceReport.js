import { tbReport } from "../utils/elements.js";
import { race } from "../race/race.js";
import { displayFigure, displayEffort } from "../utils/displayFigure.js";
import { RaceTime } from "../utils/raceTime.js";

class RaceReport {
    async saveReport() {
        // unfreeze first column
        for (let i=0; i<tbReport.firstcol.length; i++) { tbReport.firstcol[i].style.position = 'relative' };
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({unit: 'cm', format: 'a4'});
    
        const canvas = await html2canvas(tbReport.self, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const margin = 1.5;
        const imgProps = doc.getImageProperties(imgData);
    
        // Calculate width and height maintaining aspect ratio
        const imgWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
        // save as pdf
        doc.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        doc.save("report.pdf");
    
        // freeze first column
        for (let i=0; i<tbReport.firstcol.length; i++) { tbReport.firstcol[i].style.position = 'sticky' };
    }

    render() {
        // no input data
        if (race.checkpoints.length == 0) {   
            const dummy = "<td>-</td>".repeat(11)
            tbReport.body.innerHTML = `
                <tr><td class="first-col">Start<br>${dummy}</tr>
                <tr><td class="first-col">Finish<br>${dummy}</tr>
                <tr><td class="first-col">Total</td>${dummy}</tr>`;
            return;
        }

        // has input data
        tbReport.body.innerHTML = ''

        for (let i = 0; i < race.checkpoints.length; i++) {
            const cp = race.checkpoints[i]

            tbReport.body.insertRow().innerHTML = 
            `
                <td class="first-col">${race.prefixedName(i)}</td>
                <td>${RaceTime.minutesToDayTime(cp.target.arrival)}</td>
                <td>${RaceTime.minutesToDayTime(cp.actual.arrival)}</td>
                <td class="buffer-gap ${(cp.actual.buffer < 0) ? "negative" : ""}">${displayFigure(cp.actual.buffer, 0)}'</td>
                <td>${RaceTime.minutesToTime(cp.target.split)}</td>
                <td>${RaceTime.minutesToTime(cp.actual.split)}</td>
                <td>${displayEffort(cp.target.EPH, 2)}</td>
                <td>${displayEffort(cp.actual.EPH, 2)}</td>
                <td>${displayFigure(cp.EP, 1)}</td>
                <td>${displayFigure(cp.percentageEP*100, 0)}</td>
                <td>${displayEffort(cp.target.effort*100, 0)}</td>
                <td>${displayEffort(cp.actual.effort*100, 0)}</td
            `
        }

        tbReport.body.insertRow().innerHTML = 
            `
                <td class="first-col">Total</td>
                <td>-</td>
                <td>-</td>
                <td class="buffer-gap ${(race.actual.buffer < 0) ? "negative" : ""}">${displayFigure(race.actual.buffer, 0)}'</td>
                <td>${RaceTime.minutesToTime(race.target.rt)}</td>
                <td>${RaceTime.minutesToTime(race.actual.rt)}</td>
                <td>${displayEffort(race.target.EPH, 2)}</td>
                <td>${displayEffort(race.actual.EPH, 2)}</td>
                <td>${displayFigure(race.total.EP, 1)}</td>
                <td>100</td>
                <td>${race.target.rt ? "100" : "-"}</td>
                <td>${race.actual.finished ? "100" : "-"}</td>
            `
    
    }   
}

export const raceReport = new RaceReport();