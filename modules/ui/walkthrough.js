import { showForm, showView } from "./menu.js";
import { 

    view,
    formAddCP,  
    formsSetTarget,
    formTargetRT, 
    arrival,
    genReportBtn,
    tbReport
    
} from "../utils/elements.js";
import { Checkpoint } from "../race/checkpoint.js";
import { race } from "../race/race.js";
import { racePlan } from "../views/racePlan.js";
import { raceTracker } from "../views/raceTracker.js";
import { raceReport } from "../views/raceReport.js";
import { RaceTime } from "../utils/raceTime.js";

const sampleCheckpoints = [
    new Checkpoint("Mui Wo", 0, 0),
    new Checkpoint("Chi Ma Wan", 9.3, 351),
    new Checkpoint("Pui O", 14.2, 641),
    new Checkpoint("Pak Mong", 11.8, 808),
    new Checkpoint("Discovery Bay", 8, 521),
    new Checkpoint("Mui Wo", 9.4, 413)
]

const sampleTargetRT = "08:45"
const sampleArrivals = [
    "2024-11-09T22:00",
    "2024-11-09T23:17",
    "2024-11-10T01:08",
    "2024-11-10T03:36",
    "2024-11-10T05:16",
    "2024-11-10T06:58"
]

export function walkthrough() {
    const driver = window.driver.js.driver;

    const driverObj = driver({
        disableActiveInteraction: true,
        showProgress: false,
        allowClose: false,
        nextBtnText: '&rarr;',
        showButtons: [ 'next' ],
        steps: [
        // Intro
        { 
            popover: { 
                title: 'A Guide to <em>Vista</em> <i class="bi bi-brightness-alt-high-fill"></i>', 
                description: 
                    '<em>Vista</em> helps you plan your trail race and reach your target. '
                    + 'Begin by adding this page to your home screen.<br><br>'
                    + '<img src="./images/installApp.jpg">',
            }
        },
        { 
            element: 'nav', 
            popover: { 
                description: 
                    '<em>Vista</em> includes 3 sections: <em>Plan</em>, <em>Tracker</em> & <em>Report</em>. '
                    +'First, let\'s go to <em>Plan</em>.', 
                side: 'top', 
                align: 'start',
                onNextClick: () => {
                    showView(view.plan, 0);
                    showForm(formAddCP.form, 0);
                    driverObj.moveNext();
                  }, 
            },
            
        },
        // Plan view
        // add checkpoints
        { 
            element: formAddCP.form,
            popover: { 
                title: 'Setting a Race Plan <i class="bi bi-pencil-square"></i>', 
                description: 
                    'A good plan is half of success. '
                    +'Add checkpoints and <em>Vista</em> calculates the EP and EP% for you.',
                onNextClick: () => {
                    // add sample checkpoints
                    sampleCheckpoints.forEach((s)=>racePlan.addCheckpoint(s));
                    racePlan.render();

                    // set target
                    formTargetRT.input.value = sampleTargetRT;
                    showForm(formsSetTarget, 3);

                    driverObj.moveNext();
                  }
            }
        },
        // set target
        { 
            element: formsSetTarget,
            popover: { 
                description: 
                    'Set a target race time. The default target splits assumes a steady EPH.',
                onNextClick: () => {
                    racePlan.setTargetRT(formTargetRT.input.value);
                    racePlan.render();
                    raceTracker.render();
                    driverObj.moveNext();
                },
            }
        },
        { 
            element: '#cptable',
            popover: { 
                description: 
                    'If you find certain race sections more technical, or you want to save energy in early stages, '
                    +'you can adjust the target split.<br><br>'
                    +'Compare the target effort with EP% and recce effort to see if the plan sounds reasonable.',
            }
        },
        { 
            element: 'nav', 
            popover: { 
                description: 
                    'Next, check out <em>Tracker</em>.', 
                side: 'top', 
                align: 'center',
                onNextClick: () => {
                    showForm(formAddCP.form, 0);
                    showView(view.tracker, 1);
                    driverObj.moveNext();
                  }, 
            },
            
        },
        // Tracker view
        { 
            element: null,
            popover: { 
                title: 'Tracking Your Race <i class="bi bi-watch"></i>', 
                description: 
                    'Feel good? Keep going. Behind schedule? You may want to push.<br><br>'
                    +'<em>Vista</em>\'s tracker frees your mind from number calculations and lets you focus on running.',
            }
        },
        { 
            element: arrival.btn,
            popover: { 
                description: 'Start the race.',
                onNextClick: () => {
                    raceTracker.recordArrival(new Date(sampleArrivals[0]));
                    RaceTime.displayCurrentTime(arrival.time, "", new Date(sampleArrivals[0]));
                    raceTracker.render();
                    driverObj.moveNext();
                  }
            }
        },
        { 
            element: arrival.btn,
            popover: { 
                description: 
                    'Record your arrival at a checkpoint.',
                onNextClick: () => {
                    raceTracker.recordArrival(new Date(sampleArrivals[1]));
                    RaceTime.displayCurrentTime(arrival.time, race.actual.startTimeStr, new Date(sampleArrivals[1]));
                    raceTracker.render();
                    driverObj.moveNext();
                  }
            }
        },
        { 
            element: '.next-cp',
            popover: { 
                description: 
                    'Check the target and projected arrival at the next checkpoint, as well as the section EP.<br><br>'
                    +'Projections are based on the total race time and target effort of the race sections you have completed.<br><br>'
                    +'Now, checking arrival times becomes hassle-free, especially when your race spans across mutiple dates.',
                onNextClick: () => {
                    raceTracker.recordArrival(new Date(sampleArrivals[2]));
                    raceTracker.recordArrival(new Date(sampleArrivals[3]));
                    RaceTime.displayCurrentTime(arrival.time, race.actual.startTimeStr, new Date(sampleArrivals[3]));
                    raceTracker.render();
                    driverObj.moveNext();
                  }
            }
        },
        { 
            element: '.tracker-top',
            popover: { 
                description: 
                    'The dashboard is refreshed when you arrive at a checkpoint.<br><br>' 
                    +'The progress bar shows completed EP%. Also check your total buffer time.<br><br>'
                    +'When the last split EPH is below the required EPH to meet the target finish, <em>PUSH</em> is shown.',
                onNextClick: () => {
                    raceTracker.recordArrival(new Date(sampleArrivals[4]));
                    raceTracker.recordArrival(new Date(sampleArrivals[5]));
                    RaceTime.displayCurrentTime(arrival.time, race.actual.startTimeStr, new Date(sampleArrivals[5]));
                    raceTracker.render();
                    driverObj.moveNext();
                  }
            }
        },
        { 
            element: 'nav', 
            popover: { 
                description: 'Congratuations! You have finished a race. Now, let\'s go to <em>Report</em>.', 
                side: 'top', 
                align: 'end',
                onNextClick: () => {
                    showView(view.report, 2);
                    raceReport.render();
                    driverObj.moveNext();
                  }, 
            },
            
        },
        // Report view
        { 
            element: tbReport.self,
            popover: { 
                title: 'Evaluating Your Performance <i class="bi bi-clipboard-data"></i>', 
                description: 
                    'Whether in-race or post-race, you may want a summary of how well you do in different stages of the race.<br><br>'
                    +'Understanding how much buffer you gain or lose at a specific race section helps you race better and plan better.',
            }
        },
        { 
            element: genReportBtn,
            popover: { 
                description: 
                    'You can download a PDF report for you reference.'
            }
        },
        // End
        { 
            popover: { 
                title: 'Voila! <i class="bi bi-emoji-laughing-fill"></i>', 
                description: 'Now there you go. Enjoy the vista while you race ultra!' 
            }
        },
        ],
        onDestroyStarted: () => {
            race.reset();
            racePlan.render();
            raceTracker.render();
            raceReport.render();
            showView(view.tracker, 1);
            driverObj.destroy();
            localStorage.setItem('doneWalkthrough', true);
            setInterval(()=>{RaceTime.displayCurrentTime(arrival.time, race.actual.startTimeStr)}, 1000);
        },
      });
      
      driverObj.drive();
}
