export class RaceTime {
    static isValidTime(input) {
        // check if in hh:mm format
        return /^\d{2}:[0-5][0-9]$/.test(input)
    }

    static zeropad(hours, minutes) {
        return hours.toString().padStart(2, '0') + ":" + 
            minutes.toString().padStart(2, '0')
    }

    static timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static minutesToTime(mins) {
        if (!mins) return "--:--"
        const hours = Math.floor(mins / 60);
        const minutes = Math.round(mins % 60);
        return RaceTime.zeropad(hours, minutes);
    }

    static minutesToDayTime(mins) {
        if (!mins) return "--:--";
        // handle overflow of minutes
        let hours = Math.floor(mins / 60);
        let minutes = Math.floor(mins % 60); // floored to display current time
        // handle overflow of hours
        let days = Math.floor(hours / 24);
        hours = hours % 24;
        return RaceTime.zeropad(hours, minutes) + (days ? ` <sup>D+${days}</sup>` : "")
    }

    static EPH(EP, mins){
        return EP / mins * 60
    }

    static getMinsPassed(timeObjStart, timeObjEnd){
        return (timeObjEnd - timeObjStart) / 60000;
    }

    static getLocalTime(t) {
        const pad = num => String(num).padStart(2, '0');
      
        const year = t.getFullYear();
        const month = pad(t.getMonth() + 1); // Months are zero-based
        const day = pad(t.getDate());
        const hours = pad(t.getHours());
        const minutes = pad(t.getMinutes());
        const seconds = pad(t.getSeconds());
      
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }

    static displayCurrentTime(inputElement, startTimeStr, now = new Date()){
        const start = (startTimeStr == "") ? new Date(this.getLocalTime(now).slice(0,10) + "T00:00") : new Date(startTimeStr);
        const startmins = start.getHours() * 60 + start.getMinutes() + start.getSeconds() / 60;
        const minsPassed = this.getMinsPassed(start, now);
        inputElement.innerHTML = `<i class="bi bi-clock"></i> ` + this.minutesToDayTime(startmins + minsPassed);
    }
}
