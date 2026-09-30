// Intel Sustainability Summit check-in

const MAX_ATTENDEES = 50;

// Maps the dropdown values to the names people actually see
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// Page elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const countDisplay = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

// Everything the app needs to remember
let attendees = [];

// Build an empty list under each team card so names have somewhere to go
const listElements = {};

Object.keys(teamNames).forEach(function (team) {
  const card = document.querySelector(".team-card." + team);
  const list = document.createElement("ul");
  list.className = "attendee-list";
  list.style.listStyle = "none";
  list.style.margin = "8px 0 0";
  list.style.padding = "0";
  list.style.fontSize = "13px";
  list.style.color = "#475569";
  list.style.textAlign = "left";
  card.appendChild(list);
  listElements[team] = list;
});

// LevelUp: save to and load from the browser so counts survive a refresh
function save() {
  try {
    localStorage.setItem("summitAttendees", JSON.stringify(attendees));
  } catch (error) {
    // Private browsing can block storage. The app still works, it just won't persist.
  }
}

function load() {
  try {
    const saved = localStorage.getItem("summitAttendees");
    if (saved) {
      attendees = JSON.parse(saved);
    }
  } catch (error) {
    attendees = [];
  }
}

// Counts how many people checked in for one team
function countForTeam(team) {
  return attendees.filter(function (person) {
    return person.team === team;
  }).length;
}

// Finds the team with the most check-ins, or null if it's a tie
function winningTeam() {
  const teams = Object.keys(teamNames);
  let best = teams[0];

  teams.forEach(function (team) {
    if (countForTeam(team) > countForTeam(best)) {
      best = team;
    }
  });

  const tied = teams.filter(function (team) {
    return countForTeam(team) === countForTeam(best);
  });

  return tied.length > 1 ? null : best;
}

// Redraws everything from the attendees array
function render() {
  const total = attendees.length;

  countDisplay.textContent = total;

  const percent = (total / MAX_ATTENDEES) * 100;
  progressBar.style.width = Math.min(percent, 100) + "%";

  Object.keys(teamNames).forEach(function (team) {
    document.getElementById(team + "Count").textContent = countForTeam(team);

    const list = listElements[team];
    list.innerHTML = "";

    attendees
      .filter(function (person) {
        return person.team === team;
      })
      .forEach(function (person) {
        const item = document.createElement("li");
        item.textContent = person.name;
        item.style.padding = "2px 0";
        list.appendChild(item);
      });
  });
}

// Shows the greeting box with a message
function showMessage(text, isCelebration) {
  greeting.textContent = text;
  greeting.className = "success-message";
  greeting.style.display = "block";

  if (isCelebration) {
    greeting.style.backgroundColor = "#fff7ed";
    greeting.style.color = "#9a3412";
    greeting.style.fontWeight = "700";
  } else {
    greeting.style.backgroundColor = "";
    greeting.style.color = "";
    greeting.style.fontWeight = "";
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !team) {
    return;
  }

  if (attendees.length >= MAX_ATTENDEES) {
    showMessage("The summit is full. No more check-ins available.", false);
    return;
  }

  attendees.push({ name: name, team: team });
  save();
  render();

  // LevelUp: celebrate once the goal is hit and name the team that turned out best
  if (attendees.length === MAX_ATTENDEES) {
    const winner = winningTeam();
    if (winner) {
      showMessage(
        "Goal reached. All " +
          MAX_ATTENDEES +
          " spots filled, and " +
          teamNames[winner] +
          " showed up strongest with " +
          countForTeam(winner) +
          " check-ins.",
        true,
      );
    } else {
      showMessage(
        "Goal reached. All " +
          MAX_ATTENDEES +
          " spots filled, and it's a tie for the strongest team.",
        true,
      );
    }
  } else {
    showMessage("Welcome, " + name + " from " + teamNames[team] + "!", false);
  }

  form.reset();
  nameInput.focus();
});

// Start up with whatever was saved last time
load();
render();
