const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

//track attendance
let count = 0;
const maxCount = 50;
let attendeeList = [];
let checkInTimes = [];
let eventStartTime = new Date();
let unlockedBadges = new Set();

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound effect functions
function playSuccessSound() {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log("Audio not supported or blocked");
    }
}

function playCelebrationSound() {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Victory fanfare sequence
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        let noteIndex = 0;
        
        function playNote() {
            if (noteIndex < notes.length) {
                oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
                noteIndex++;
                setTimeout(playNote, 150);
            }
        }
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        playNote();
    } catch (error) {
        console.log("Audio not supported or blocked");
    }
}

function playMilestoneSound() {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.2); // C#5
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
        console.log("Audio not supported or blocked");
    }
}

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

//Track milestone celebrations to prevent duplicates
let milestonesReached = new Set();

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
        
        // Check for milestone celebrations
        checkMilestones(percentage);
        
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
        } else if (percentage >= 25) {
            progressBar.style.background = "linear-gradient(90deg, #8b5cf6, #7c3aed)"; // Purple when quarter
            progressBar.style.boxShadow = "0 0 6px rgba(139, 92, 246, 0.3)";
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

//Check and trigger milestone celebrations
function checkMilestones(percentage) {
    const milestones = [25, 50, 75];
    
    milestones.forEach(milestone => {
        if (percentage >= milestone && !milestonesReached.has(milestone)) {
            milestonesReached.add(milestone);
            triggerMilestoneCelebration(milestone);
        }
    });
}

//Trigger milestone celebration effects
function triggerMilestoneCelebration(milestone) {
    // Play milestone sound
    playMilestoneSound();
    
    // Create milestone message
    const greetingElement = document.getElementById("greeting");
    const originalContent = greetingElement.textContent;
    const originalClass = greetingElement.className;
    
    let milestoneMessage = "";
    let milestoneEmoji = "";
    
    switch(milestone) {
        case 25:
            milestoneMessage = "🎯 Quarter Way There! Great start, sustainability champions!";
            milestoneEmoji = "🌱";
            break;
        case 50:
            milestoneMessage = "🔥 Halfway Point Reached! The momentum is building!";
            milestoneEmoji = "⚡";
            break;
        case 75:
            milestoneMessage = "🚀 Three Quarters Complete! Almost at our goal!";
            milestoneEmoji = "🏆";
            break;
    }
    
    // Show milestone message
    greetingElement.textContent = milestoneMessage;
    greetingElement.className = "show celebration";
    
    // Create floating milestone badge
    createMilestoneBadge(milestone, milestoneEmoji);
    
    // Create special milestone confetti
    createMilestoneConfetti(milestone);
    
    // Pulse the progress bar
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.style.animation = "pulse 0.8s ease-in-out 2";
    }
    
    // Reset message after celebration
    setTimeout(() => {
        greetingElement.textContent = originalContent;
        greetingElement.className = originalClass;
        if (progressBar) {
            progressBar.style.animation = "";
        }
    }, 3000);
    
    console.log(`🎉 Milestone celebration: ${milestone}% reached!`);
}

//Create floating milestone badge
function createMilestoneBadge(milestone, emoji) {
    const badge = document.createElement("div");
    badge.className = "milestone-badge";
    badge.innerHTML = `
        <div class="milestone-content">
            <span class="milestone-emoji">${emoji}</span>
            <span class="milestone-text">${milestone}%</span>
            <span class="milestone-subtitle">MILESTONE</span>
        </div>
    `;
    
    // Position randomly across the screen
    badge.style.left = Math.random() * 80 + 10 + "%";
    badge.style.top = "50%";
    
    document.body.appendChild(badge);
    
    // Remove after animation
    setTimeout(() => {
        if (badge.parentNode) {
            badge.parentNode.removeChild(badge);
        }
    }, 4000);
}

//Create milestone-specific confetti
function createMilestoneConfetti(milestone) {
    let colors = [];
    let particleCount = 0;
    
    switch(milestone) {
        case 25:
            colors = ["#8b5cf6", "#a855f7", "#c084fc"];
            particleCount = 20;
            break;
        case 50:
            colors = ["#3b82f6", "#1d4ed8", "#60a5fa"];
            particleCount = 30;
            break;
        case 75:
            colors = ["#f59e0b", "#d97706", "#fbbf24"];
            particleCount = 40;
            break;
    }
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement("div");
            confetti.className = "milestone-confetti";
            confetti.style.left = Math.random() * 100 + "%";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + "s";
            confetti.style.width = Math.random() * 8 + 6 + "px";
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }, i * 30);
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
    
    // Update dynamic leaderboard
    updateLeaderboard(teamCounts);
    
    console.log("Team counts updated:", teamCounts);
}

//Update dynamic leaderboard with rankings
function updateLeaderboard(teamCounts) {
    const leaderboardContainer = document.getElementById("teamLeaderboard");
    if (!leaderboardContainer) return;
    
    // Create team data array with emojis and names
    const teamData = [
        { 
            key: 'water', 
            name: 'Team Water Wise', 
            emoji: '🌊', 
            count: teamCounts.water,
            color: '#0ea5e9'
        },
        { 
            key: 'zero', 
            name: 'Team Net Zero', 
            emoji: '🌿', 
            count: teamCounts.zero,
            color: '#10b981'
        },
        { 
            key: 'power', 
            name: 'Team Renewables', 
            emoji: '⚡', 
            count: teamCounts.power,
            color: '#f59e0b'
        }
    ];
    
    // Sort by count (descending) and add rank
    teamData.sort((a, b) => b.count - a.count);
    teamData.forEach((team, index) => {
        team.rank = index + 1;
    });
    
    // Get max count for progress bars
    const maxTeamCount = Math.max(...teamData.map(t => t.count)) || 1;
    
    // Generate leaderboard HTML
    let leaderboardHTML = '';
    teamData.forEach(team => {
        const percentage = Math.round((team.count / maxTeamCount) * 100);
        const rankClass = `rank-${team.rank}`;
        
        leaderboardHTML += `
            <div class="leaderboard-item ${rankClass}" data-team="${team.key}">
                <div class="team-info">
                    <span class="team-rank">#${team.rank}</span>
                    <span class="team-emoji">${team.emoji}</span>
                    <span class="team-leader-name">${team.name}</span>
                </div>
                <div class="team-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span>${team.count}</span>
                </div>
            </div>
        `;
    });
    
    leaderboardContainer.innerHTML = leaderboardHTML;
    
    // Add subtle animation to updated items
    setTimeout(() => {
        const items = leaderboardContainer.querySelectorAll('.leaderboard-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }, 50);
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

//Initialize floating particles system
function initializeParticles() {
    const particlesContainer = document.getElementById("particlesContainer");
    if (!particlesContainer) return;
    
    function createParticle() {
        const particle = document.createElement("div");
        particle.className = "particle";
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        particle.classList.add(size);
        
        // Random team color
        const colors = ['water', 'zero', 'power', 'intel'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.classList.add(color);
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation duration and delay
        const duration = 12 + Math.random() * 8; // 12-20 seconds
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        // Occasionally make particles float sideways
        if (Math.random() < 0.3) {
            particle.style.animation = `floatSide ${duration}s linear infinite`;
            particle.style.top = Math.random() * 80 + 10 + '%';
        }
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 5) * 1000);
    }
    
    // Create initial particles
    for (let i = 0; i < 15; i++) {
        setTimeout(createParticle, i * 200);
    }
    
    // Continue creating particles periodically
    setInterval(createParticle, 800);
}

//Enhanced particle burst for celebrations
function createParticleBurst(x, y, teamColor) {
    const particlesContainer = document.getElementById("particlesContainer");
    if (!particlesContainer) return;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div");
        particle.className = `particle medium ${teamColor} burst-particle`;
        
        // Position at click location
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random burst direction
        const angle = (Math.PI * 2 * i) / 12;
        const velocity = 100 + Math.random() * 100;
        const endX = x + Math.cos(angle) * velocity;
        const endY = y + Math.sin(angle) * velocity;
        
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        
        particle.style.animation = 'particleBurst 1.5s ease-out forwards';
        
        particlesContainer.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1500);
    }
}

//Load progress when page loads
loadProgress();

//Update statistics dashboard
function updateStatsDashboard() {
    // Calculate check-in rate (per minute)
    const now = Date.now();
    const recentCheckins = checkInTimes.filter(time => now - time < 60000).length; // Last minute
    document.getElementById("checkinRate").textContent = recentCheckins;
    
    // Calculate average time between check-ins
    let avgTime = "--:--";
    if (checkInTimes.length > 1) {
        const intervals = [];
        for (let i = 1; i < checkInTimes.length; i++) {
            intervals.push(checkInTimes[i] - checkInTimes[i-1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const minutes = Math.floor(avgInterval / 60000);
        const seconds = Math.floor((avgInterval % 60000) / 1000);
        avgTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    document.getElementById("avgTime").textContent = avgTime;
    
    // Show leading team
    const teamCounts = calculateTeamCounts();
    let leadingTeam = 'TBD';
    let maxCount = 0;
    
    if (teamCounts.water > maxCount) {
        maxCount = teamCounts.water;
        leadingTeam = 'Water Wise';
    }
    if (teamCounts.zero > maxCount) {
        maxCount = teamCounts.zero;
        leadingTeam = 'Net Zero';
    }
    if (teamCounts.power > maxCount) {
        maxCount = teamCounts.power;
        leadingTeam = 'Renewables';
    }
    
    if (maxCount === 0) leadingTeam = 'TBD';
    document.getElementById("leadingTeam").textContent = leadingTeam;
    
    // Update completion percentage
    const completion = Math.round((count / maxCount) * 100);
    document.getElementById("completion").textContent = completion + '%';
}

//Add entry to activity timeline
function addToTimeline(name, teamName, teamKey) {
    const timelineContainer = document.getElementById("timelineContainer");
    if (!timelineContainer) return;
    
    // Remove "no activity" message if it exists
    const noActivity = timelineContainer.querySelector('.no-activity');
    if (noActivity) {
        noActivity.remove();
    }
    
    // Create timeline item
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    timelineItem.innerHTML = `
        <span class="timeline-time">${timeString}</span>
        <span class="timeline-content">${name} joined</span>
        <span class="timeline-team-badge ${teamKey}">${teamName}</span>
    `;
    
    // Add to top of timeline
    timelineContainer.insertBefore(timelineItem, timelineContainer.firstChild);
    
    // Keep only last 10 items
    const items = timelineContainer.querySelectorAll('.timeline-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

//Initialize statistics on page load
function initializeStats() {
    // Set initial event start time if not loaded from storage
    const savedStartTime = localStorage.getItem('eventStartTime');
    if (savedStartTime) {
        eventStartTime = new Date(parseInt(savedStartTime));
    } else {
        localStorage.setItem('eventStartTime', eventStartTime.getTime().toString());
    }
    
    // Initialize dashboard
    updateStatsDashboard();
    
    // Update stats every 30 seconds
    setInterval(updateStatsDashboard, 30000);
}

//Initialize particle system
initializeParticles();

//Achievement system
const achievements = {
    firstCheckin: {
        id: 'firstCheckin',
        icon: '🎉',
        title: 'Welcome Pioneer!',
        description: 'First person to check in to the sustainability summit',
        condition: () => count === 1
    },
    teamCaptain: {
        id: 'teamCaptain',
        icon: '👑',
        title: 'Team Captain',
        description: 'First member of your team to check in',
        condition: (teamKey) => {
            const teamCounts = calculateTeamCounts();
            return teamCounts[teamKey] === 1;
        }
    },
    speedster: {
        id: 'speedster',
        icon: '⚡',
        title: 'Lightning Fast',
        description: 'Checked in within first 5 minutes of event',
        condition: () => {
            const now = Date.now();
            return (now - eventStartTime.getTime()) < 300000; // 5 minutes
        }
    },
    milestone10: {
        id: 'milestone10',
        icon: '🔥',
        title: 'Perfect Ten',
        description: 'Helped reach 10 total check-ins',
        condition: () => count === 10
    },
    milestone25: {
        id: 'milestone25',
        icon: '🌟',
        title: 'Quarter Master',
        description: 'Helped reach 25% completion milestone',
        condition: () => count === Math.ceil(maxCount * 0.25)
    },
    teamDominance: {
        id: 'teamDominance',
        icon: '🏆',
        title: 'Team Dominance',
        description: 'Your team has 10+ members checked in',
        condition: (teamKey) => {
            const teamCounts = calculateTeamCounts();
            return teamCounts[teamKey] >= 10;
        }
    }
};

//Check for new achievements
function checkAchievements(name, teamKey) {
    const newBadges = [];
    
    Object.values(achievements).forEach(achievement => {
        const badgeId = achievement.id;
        
        // Skip if already unlocked
        if (unlockedBadges.has(badgeId)) return;
        
        // Check condition
        let conditionMet = false;
        try {
            if (achievement.condition.length > 0) {
                conditionMet = achievement.condition(teamKey);
            } else {
                conditionMet = achievement.condition();
            }
        } catch (error) {
            console.error('Error checking achievement condition:', error);
        }
        
        if (conditionMet) {
            unlockedBadges.add(badgeId);
            newBadges.push(achievement);
        }
    });
    
    // Display new badges
    newBadges.forEach(badge => {
        displayAchievementBadge(badge, name);
    });
}

//Display achievement badge
function displayAchievementBadge(achievement, earnedBy) {
    const badgesContainer = document.getElementById('badgesContainer');
    const achievementsSection = document.getElementById('achievementsSection');
    
    if (!badgesContainer || !achievementsSection) return;
    
    // Show achievements section if hidden
    achievementsSection.classList.add('show');
    
    // Create badge element
    const badgeElement = document.createElement('div');
    badgeElement.className = 'achievement-badge';
    badgeElement.innerHTML = `
        <span class="badge-icon">${achievement.icon}</span>
        <div class="badge-title">${achievement.title}</div>
        <div class="badge-description">${achievement.description}</div>
        <div class="badge-timestamp">Unlocked by ${earnedBy} at ${new Date().toLocaleTimeString()}</div>
    `;
    
    badgesContainer.appendChild(badgeElement);
    
    // Play milestone sound for achievement
    playMilestoneSound();
    
    // Show temporary achievement notification
    showAchievementNotification(achievement, earnedBy);
    
    console.log(`🏆 Achievement unlocked: ${achievement.title} by ${earnedBy}`);
}

//Show floating achievement notification
function showAchievementNotification(achievement, earnedBy) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <span class="achievement-notification-icon">${achievement.icon}</span>
            <div class="achievement-notification-text">
                <strong>Achievement Unlocked!</strong>
                <br>${achievement.title}
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

//Initialize statistics dashboard
initializeStats();

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

    //Add attendee to the list with timestamp
    const checkInTime = new Date();
    attendeeList.push({
        name: name,
        team: teamName,
        timestamp: checkInTime.getTime(),
        timeString: checkInTime.toLocaleTimeString()
    });
    
    //Track check-in time for analytics
    checkInTimes.push(checkInTime.getTime());

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
        
        //Play celebration sound
        playCelebrationSound();
        
        //Trigger celebration effects
        triggerCelebration();
        
        //Find the winning team with enhanced logic
        const teamCounts = calculateTeamCounts();
        const winningTeam = findWinningTeam(teamCounts);
        
        if (winningTeam) {
            highlightWinningTeam(winningTeam.name, winningTeam.count);
        }
    } else {
        //Play success sound for regular check-ins
        playSuccessSound();
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
    
    //Update statistics dashboard
    updateStatsDashboard();
    
    //Add to activity timeline
    addToTimeline(name, teamName, team);
    
    //Check for new achievements
    checkAchievements(name, team);

    //reset form
    form.reset();
   nameInput.focus();
});

