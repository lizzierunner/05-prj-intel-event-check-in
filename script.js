const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

//track attendance
let count = 0;
const maxCount = 50;
let attendeeList = [];

//Display attendee list
function displayAttendeeList() {
    const container = document.getElementById("attendeeListContainer");
    
    if (attendeeList.length === 0) {
        container.innerHTML = '<p class="no-attendees">No attendees checked in yet.</p>';
        return;
    }
    
    let listHTML = '';
    attendeeList.forEach(function(attendee, index) {
        // Get team color based on team name
        let teamClass = '';
        if (attendee.team.includes("Water Wise")) {
            teamClass = 'water';
        } else if (attendee.team.includes("Net Zero")) {
            teamClass = 'zero';
        } else if (attendee.team.includes("Renewables")) {
            teamClass = 'power';
        }
        
        listHTML += `
            <div class="attendee-item ${teamClass}" data-index="${index}">
                <div class="attendee-info">
                    <span class="attendee-name">${attendee.name}</span>
                    <span class="attendee-number">#${index + 1}</span>
                </div>
                <span class="attendee-team ${teamClass}">${attendee.team}</span>
            </div>
        `;
    });
    
    container.innerHTML = listHTML;
    
    // Add a summary at the bottom
    const summary = document.createElement('div');
    summary.className = 'attendee-summary';
    summary.innerHTML = `
        <p><strong>Total Attendees:</strong> ${attendeeList.length}</p>
        <p><em>Last updated: ${new Date().toLocaleTimeString()}</em></p>
    `;
    container.appendChild(summary);
    
    console.log(`Attendee list updated: ${attendeeList.length} attendees displayed`);
}

//Refresh attendee list display (called when data changes)
function refreshAttendeeDisplay() {
    displayAttendeeList();
    
    // Add animation to new attendee if there are attendees
    if (attendeeList.length > 0) {
        setTimeout(function() {
            const items = document.querySelectorAll('.attendee-item');
            const lastItem = items[items.length - 1];
            if (lastItem && lastItem.getAttribute('data-index') == (attendeeList.length - 1)) {
                lastItem.style.animation = 'slideInRight 0.5s ease-out';
                lastItem.style.background = '#dbeafe';
                
                // Reset animation after it completes
                setTimeout(function() {
                    lastItem.style.animation = '';
                    lastItem.style.background = '';
                }, 1000);
            }
        }, 100);
    }
}

//Search/filter attendees by name or team
function filterAttendees(searchTerm) {
    const container = document.getElementById("attendeeListContainer");
    const items = container.querySelectorAll('.attendee-item');
    
    if (!searchTerm) {
        // Show all items
        items.forEach(function(item) {
            item.style.display = 'flex';
        });
        return;
    }
    
    items.forEach(function(item) {
        const name = item.querySelector('.attendee-name').textContent.toLowerCase();
        const team = item.querySelector('.attendee-team').textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        if (name.includes(searchLower) || team.includes(searchLower)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

//Update the total count display
function updateCountDisplay() {
    const attendeeCountElement = document.getElementById("attendeeCount");
    if (attendeeCountElement) {
        attendeeCountElement.textContent = count;
        console.log("Count display updated to:", count);
    }
    
    //Update progress bar
    updateProgressBar();
}

//Update progress bar with enhanced visual feedback
function updateProgressBar() {
    const percentage = Math.round((count / maxCount) * 100);
    const progressBar = document.getElementById("progressBar");
    const progressPercentage = document.getElementById("progressPercentage");
    
    if (progressBar) {
        // Set the width
        progressBar.style.width = percentage + "%";
        
        // Update percentage display
        if (progressPercentage) {
            progressPercentage.textContent = percentage + "%";
        }
        
        // Add different colors based on progress
        if (percentage >= 100) {
            progressBar.style.background = "linear-gradient(90deg, #22c55e, #16a34a)"; // Green when complete
            progressBar.style.boxShadow = "0 0 15px rgba(34, 197, 94, 0.5)";
        } else if (percentage >= 75) {
            progressBar.style.background = "linear-gradient(90deg, #f59e0b, #d97706)"; // Orange when close
            progressBar.style.boxShadow = "0 0 10px rgba(245, 158, 11, 0.3)";
        } else if (percentage >= 50) {
            progressBar.style.background = "linear-gradient(90deg, #3b82f6, #1d4ed8)"; // Blue when halfway
            progressBar.style.boxShadow = "0 0 8px rgba(59, 130, 246, 0.3)";
        } else {
            progressBar.style.background = "linear-gradient(90deg, #0071c5, #00aeef)"; // Default Intel blue
            progressBar.style.boxShadow = "none";
        }
        
        // Add data attribute for percentage (useful for CSS or future enhancements)
        progressBar.setAttribute('data-percentage', percentage);
        
        console.log(`Progress bar updated: ${percentage}% (${count}/${maxCount})`);
    } else {
        console.error("Could not find progress bar element!");
    }
}

//Update team count display
function updateTeamCount(teamValue) {
    const teamCounter = document.getElementById(teamValue + "Count");
    if (teamCounter) {
        const current = parseInt(teamCounter.textContent) || 0;
        const newCount = current + 1;
        teamCounter.textContent = newCount;
        console.log(`Updated ${teamValue} team count to: ${newCount}`);
        return newCount;
    } else {
        console.error(`Could not find team counter element for team: ${teamValue}`);
        return 0;
    }
}

//Calculate team counts from attendee list
function calculateTeamCounts() {
    const teamCounts = {
        water: 0,
        zero: 0,
        power: 0
    };
    
    attendeeList.forEach(function(attendee) {
        // Convert team display name back to team value
        if (attendee.team.includes("Water Wise")) {
            teamCounts.water++;
        } else if (attendee.team.includes("Net Zero")) {
            teamCounts.zero++;
        } else if (attendee.team.includes("Renewables")) {
            teamCounts.power++;
        }
    });
    
    return teamCounts;
}

//Update all team count displays
function updateAllTeamCounts() {
    const teamCounts = calculateTeamCounts();
    
    document.getElementById("waterCount").textContent = teamCounts.water;
    document.getElementById("zeroCount").textContent = teamCounts.zero;
    document.getElementById("powerCount").textContent = teamCounts.power;
    
    console.log("Team counts updated:", teamCounts);
}

//Find the winning team
function findWinningTeam(teamCounts) {
    let winningTeam = null;
    let maxCount = 0;
    
    for (const [teamName, count] of Object.entries(teamCounts)) {
        if (count > maxCount) {
            maxCount = count;
            winningTeam = { name: teamName, count: count };
        }
    }
    
    return winningTeam;
}

//Highlight the winning team with enhanced effects
function highlightWinningTeam(teamName, teamCount) {
    const winningTeamCard = document.querySelector(`.team-card.${teamName}`);
    if (winningTeamCard) {
        // Remove any existing highlighting from other teams
        const allTeamCards = document.querySelectorAll(".team-card");
        allTeamCards.forEach(function(card) {
            card.classList.remove("winning-team");
        });
        
        // Add winning team styling
        winningTeamCard.style.backgroundColor = "#ffd700";
        winningTeamCard.style.border = "3px solid #ffb300";
        winningTeamCard.style.transform = "scale(1.05)";
        winningTeamCard.style.boxShadow = "0 8px 25px rgba(255, 183, 0, 0.4)";
        winningTeamCard.classList.add("winning-team");
        
        // Add a winner badge
        if (!winningTeamCard.querySelector(".winner-badge")) {
            const winnerBadge = document.createElement("div");
            winnerBadge.className = "winner-badge";
            winnerBadge.innerHTML = "🏆 WINNER!";
            winningTeamCard.appendChild(winnerBadge);
        }
        
        console.log(`${teamName} team wins with ${teamCount} members!`);
    }
}

//Trigger celebration effects
function triggerCelebration() {
    // Add celebration class to body for page-wide effects
    document.body.classList.add("celebration-mode");
    
    // Create confetti effect
    createConfettiEffect();
    
    // Flash the progress bar
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.style.animation = "celebrate 1s ease-in-out 3";
    }
    
    // Add celebration effect to attendance tracker
    const attendanceTracker = document.querySelector(".attendance-tracker");
    if (attendanceTracker) {
        attendanceTracker.style.animation = "bounce 0.6s ease-in-out 2";
    }
    
    console.log("🎉 CELEBRATION TRIGGERED! Goal reached!");
}

//Create confetti effect
function createConfettiEffect() {
    const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(function() {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + "s";
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(function() {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }, i * 50);
    }
}

//Load saved progress from localStorage
function loadProgress() {
    try {
        // Try to load new format first
        const savedData = localStorage.getItem("eventCheckInData");
        
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log("Loading saved data:", data);
            
            // Validate data integrity
            if (data.attendeeList && Array.isArray(data.attendeeList)) {
                attendeeList = data.attendeeList;
                count = data.attendeeCount || attendeeList.length;
                
                // Ensure count matches attendee list
                if (count !== attendeeList.length) {
                    console.warn("Count mismatch, syncing with attendee list");
                    count = attendeeList.length;
                }
                
                // Update displays
                displayAttendeeList();
                updateAllTeamCounts();
                updateCountDisplay();
                
                console.log(`Loaded ${count} attendees from saved data`);
                return; // Successfully loaded new format
            }
        }
        
        // Fallback to old format loading
        console.log("Falling back to individual localStorage items");
        loadLegacyProgress();
        
    } catch (error) {
        console.error("Error loading progress:", error);
        // If all else fails, load individual items
        loadLegacyProgress();
    }
}

//Load progress from individual localStorage items (backward compatibility)
function loadLegacyProgress() {
    const savedCount = localStorage.getItem("attendeeCount");
    const savedWaterCount = localStorage.getItem("waterCount");
    const savedZeroCount = localStorage.getItem("zeroCount");
    const savedPowerCount = localStorage.getItem("powerCount");
    const savedAttendeeList = localStorage.getItem("attendeeList");
    
    // Load attendee list first
    if (savedAttendeeList) {
        try {
            attendeeList = JSON.parse(savedAttendeeList);
            displayAttendeeList();
            //Calculate team counts from attendee list for accuracy
            updateAllTeamCounts();
        } catch (error) {
            console.error("Error parsing saved attendee list:", error);
            attendeeList = [];
        }
    }
    
    // Load count and sync with attendee list
    if (savedCount) {
        count = parseInt(savedCount) || 0;
        
        //Sync count with attendee list length for data integrity
        if (attendeeList.length !== count) {
            console.warn("Syncing count with attendee list length");
            count = attendeeList.length;
        }
        
        const attendeeCountElement = document.getElementById("attendeeCount");
        if (attendeeCountElement) {
            attendeeCountElement.textContent = count;
        }
        
        //Update progress bar with enhanced styling
        updateProgressBar();
        
        console.log("Loaded legacy progress - Total attendees:", count);
    }
    
    // Only load individual team counts if no attendee list was found
    if (!savedAttendeeList) {
        if (savedWaterCount) {
            document.getElementById("waterCount").textContent = savedWaterCount;
        }
        if (savedZeroCount) {
            document.getElementById("zeroCount").textContent = savedZeroCount;
        }
        if (savedPowerCount) {
            document.getElementById("powerCount").textContent = savedPowerCount;
        }
    }
}

//Save progress to localStorage
function saveProgress() {
    try {
        // Save all data with timestamps for integrity checking
        const saveData = {
            attendeeCount: count,
            attendeeList: attendeeList,
            teamCounts: calculateTeamCounts(),
            timestamp: new Date().getTime(),
            version: "1.0"
        };
        
        localStorage.setItem("eventCheckInData", JSON.stringify(saveData));
        
        // Also save individual items for backward compatibility
        localStorage.setItem("attendeeCount", count);
        localStorage.setItem("attendeeList", JSON.stringify(attendeeList));
        
        const teamCounts = calculateTeamCounts();
        localStorage.setItem("waterCount", teamCounts.water);
        localStorage.setItem("zeroCount", teamCounts.zero);
        localStorage.setItem("powerCount", teamCounts.power);
        
        console.log("Progress saved successfully:", saveData);
    } catch (error) {
        console.error("Error saving progress:", error);
        // Fallback to individual saves if JSON fails
        localStorage.setItem("attendeeCount", count);
        localStorage.setItem("waterCount", document.getElementById("waterCount").textContent);
        localStorage.setItem("zeroCount", document.getElementById("zeroCount").textContent);
        localStorage.setItem("powerCount", document.getElementById("powerCount").textContent);
    }
}

//Reset all progress
function resetProgress() {
    count = 0;
    attendeeList = [];
    
    //Clear localStorage (both new and legacy formats)
    localStorage.removeItem("eventCheckInData"); // New format
    localStorage.removeItem("attendeeCount"); // Legacy
    localStorage.removeItem("waterCount"); // Legacy
    localStorage.removeItem("zeroCount"); // Legacy
    localStorage.removeItem("powerCount"); // Legacy
    localStorage.removeItem("attendeeList"); // Legacy
    
    //Reset display elements
    updateCountDisplay(); // This will reset the count and progress bar
    
    //Reset all team counts to 0
    document.getElementById("waterCount").textContent = "0";
    document.getElementById("zeroCount").textContent = "0";
    document.getElementById("powerCount").textContent = "0";
    
    const greetingElement = document.getElementById("greeting");
    greetingElement.textContent = "";
    greetingElement.className = "";
    
    displayAttendeeList();
    
    //Reset progress bar styling
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.style.width = "0%";
        progressBar.style.background = "linear-gradient(90deg, #0071c5, #00aeef)";
        progressBar.style.boxShadow = "none";
        progressBar.setAttribute('data-percentage', '0');
    }
    
    //Reset percentage display
    const progressPercentage = document.getElementById("progressPercentage");
    if (progressPercentage) {
        progressPercentage.textContent = "0%";
    }

    //Remove team highlighting and celebration effects
    const teamCards = document.querySelectorAll(".team-card");
    teamCards.forEach(function(card) {
        card.style.backgroundColor = "";
        card.style.border = "";
        card.style.transform = "";
        card.style.boxShadow = "";
        card.style.animation = "";
        card.classList.remove("winning-team");
        
        // Remove winner badges
        const winnerBadge = card.querySelector(".winner-badge");
        if (winnerBadge) {
            winnerBadge.remove();
        }
    });
    
    //Remove celebration mode from body
    document.body.classList.remove("celebration-mode");
    
    //Reset progress bar animation
    if (progressBar) {
        progressBar.style.animation = "";
    }
    
    //Reset attendance tracker animation
    const attendanceTracker = document.querySelector(".attendance-tracker");
    if (attendanceTracker) {
        attendanceTracker.style.animation = "";
    }
    
    console.log("Progress reset!");
}

//Load progress when page loads
loadProgress();

//Validate data after loading
setTimeout(validateData, 1000); // Give time for DOM to fully load

//Validate localStorage data integrity
function validateData() {
    const teamCounts = calculateTeamCounts();
    const expectedTotal = teamCounts.water + teamCounts.zero + teamCounts.power;
    
    if (count !== expectedTotal) {
        console.warn(`Data validation failed: count=${count}, expected=${expectedTotal}`);
        count = expectedTotal;
        updateCountDisplay();
        saveProgress(); // Re-save corrected data
    }
    
    if (count !== attendeeList.length) {
        console.warn(`Attendee list mismatch: count=${count}, list length=${attendeeList.length}`);
        count = attendeeList.length;
        updateCountDisplay();
        saveProgress(); // Re-save corrected data
    }
    
    console.log("Data validation complete");
}

//Periodically validate data (every 30 seconds)
setInterval(validateData, 30000);

//Add reset button event listener
document.getElementById("resetBtn").addEventListener("click", function() {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        resetProgress();
    }
});

//Add search functionality for attendee list
document.getElementById("attendeeSearch").addEventListener("input", function(event) {
    filterAttendees(event.target.value);
});

//Handle form submission
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const team = teamSelect.value;
    const teamName = teamSelect.options[teamSelect.selectedIndex].text;

    console.log(name, teamName);

    //Add attendee to the list
    attendeeList.push({
        name: name,
        team: teamName
    });

    //increment count and sync with attendee list length
    count++;
    
    //Ensure count matches attendee list (for data integrity)
    if (count !== attendeeList.length) {
        console.warn("Count mismatch detected, syncing...");
        count = attendeeList.length;
    }
    
    console.log("Total check-ins: " ,count);

    //Update attendance count display and progress bar
    updateCountDisplay();

    //Update progress bar (additional logging)
    const percentage = Math.round((count / maxCount) * 100);
    console.log(`Progress: ${percentage}%`);

    //Update Team Count
    updateTeamCount(team);

    //show welcome message
    let message = `Welcome, ${name} from ${teamName}!`;
    
    //Check if we reached the goal
    if (count >= maxCount) {
        message = `🎉 GOAL REACHED! Welcome, ${name} from ${teamName}! You helped us reach our sustainability summit goal! 🎉`;
        
        //Trigger celebration effects
        triggerCelebration();
        
        //Find the winning team with enhanced logic
        const teamCounts = calculateTeamCounts();
        const winningTeam = findWinningTeam(teamCounts);
        
        if (winningTeam) {
            highlightWinningTeam(winningTeam.name, winningTeam.count);
        }
    }
    
    const greetingElement = document.getElementById("greeting");
    
    //Clear previous classes and content
    greetingElement.className = "";
    greetingElement.textContent = message;
    
    //Add animation classes
    greetingElement.classList.add("show");
    if (count >= maxCount) {
        greetingElement.classList.add("celebration");
    }
    
    console.log(message);

    //Save progress to localStorage
    saveProgress();
    
    //Update attendee list display with animation
    refreshAttendeeDisplay();

    //reset form
    form.reset();
   nameInput.focus();
});

