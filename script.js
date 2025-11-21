// Global variables
let screenTimeInterval;
let screenTimeSeconds = 0;
let screenTracking = false;
let currentWeekOffset = 0;
let medicationAlarmAudio = null;
let notificationTimeouts = new Map();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('LifeSphere initialized');
    
    // Initialize all components
    initializeApp();
});

function initializeApp() {
    // Initialize notification system
    initializeNotifications();
    
    // Initialize tab navigation
    initializeTabNavigation();
    
    // Initialize subtab navigation
    initializeSubtabNavigation();
    
    // Initialize all trackers
    initializeWaterTracker();
    initializeWorkoutTracker();
    initializeMedicationTracker();
    initializeMealPlanner();
    initializeScreenTimeTracker();
    initializeSleepTracker();
    initializeLifeLoop();
    initializeTaskForge();
    initializeEduPlan();
    initializeGradeForm();
    
    // Load all data
    loadAllData();
    
    // Initialize charts
    initializeCharts();
    
    // Start background services
    startBackgroundServices();
}

// Notification System
function initializeNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            if ('Notification' in window) {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        alert('Notifications enabled! You will receive reminders for your goals.');
                        this.textContent = 'Notifications Enabled';
                        this.disabled = true;
                        localStorage.setItem('lifesphere_notifications', 'enabled');
                    } else {
                        alert('Notifications disabled. You can enable them later in your browser settings.');
                    }
                }.bind(this));
            } else {
                alert('This browser does not support notifications.');
            }
        });
    }
    
    // Check if notifications were previously enabled
    if (localStorage.getItem('lifesphere_notifications') === 'enabled') {
        notificationBtn.textContent = 'Notifications Enabled';
        notificationBtn.disabled = true;
    }
}

// Tab Navigation
function initializeTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tabs a');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
            // Update any tab-specific content
            updateTabContent(targetTab);
        });
    });
}

function updateTabContent(tabId) {
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'water':
            updateWaterDisplay();
            break;
        case 'workout':
            updateWorkoutDisplay();
            break;
        case 'medication':
            updateMedicationDisplay();
            break;
        case 'meals':
            updateMealDisplay();
            break;
        case 'screen':
            updateScreenDisplay();
            break;
        case 'sleep':
            updateSleepDisplay();
            break;
        case 'lifeloop':
            updateLifeLoopDisplay();
            break;
        case 'taskforge':
            updateTaskForgeDisplay();
            break;
        case 'eduplan':
            updateEduPlanDisplay();
            break;
    }
}

// Initialize subtab navigation
function initializeSubtabNavigation() {
    // TaskForge subtabs
    const taskforgeNav = document.querySelectorAll('.taskforge-nav a');
    const taskforgeSections = document.querySelectorAll('.taskforge-section');
    
    taskforgeNav.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = tab.dataset.section;
            
            taskforgeNav.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            taskforgeSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // EduPlan subtabs
    const eduplanNav = document.querySelectorAll('.eduplan-nav a');
    const eduplanSections = document.querySelectorAll('.eduplan-section');
    
    eduplanNav.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = tab.dataset.section;
            
            eduplanNav.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            eduplanSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Water Tracker
function initializeWaterTracker() {
    let waterGoal = 8;
    let waterConsumed = 0;

    // Load saved data
    const savedData = localStorage.getItem('lifesphere_water');
    if (savedData) {
        const data = JSON.parse(savedData);
        waterGoal = data.goal || 8;
        waterConsumed = data.consumed || 0;
    }

    // Event listeners
    const increaseBtn = document.getElementById('increase-goal');
    const decreaseBtn = document.getElementById('decrease-goal');
    const addGlassBtn = document.getElementById('add-glass');
    const resetBtn = document.getElementById('reset-water');
    const addWaterBtn = document.getElementById('add-water');

    if (increaseBtn) increaseBtn.addEventListener('click', () => {
        waterGoal++;
        updateWaterGoal();
    });

    if (decreaseBtn) decreaseBtn.addEventListener('click', () => {
        if (waterGoal > 1) {
            waterGoal--;
            updateWaterGoal();
        }
    });

    if (addGlassBtn) addGlassBtn.addEventListener('click', () => {
        waterConsumed++;
        updateWaterDisplay();
        saveWaterData();
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        waterConsumed = 0;
        updateWaterDisplay();
        saveWaterData();
    });

    if (addWaterBtn) addWaterBtn.addEventListener('click', () => {
        waterConsumed++;
        updateWaterDisplay();
        saveWaterData();
    });

    // Water cups in dashboard
    document.querySelectorAll('.cup').forEach(cup => {
        cup.addEventListener('click', function() {
            const cupNumber = parseInt(this.dataset.cup);
            waterConsumed = cupNumber;
            updateWaterDisplay();
            saveWaterData();
        });
    });

    function updateWaterGoal() {
        const goalElement = document.getElementById('water-goal');
        const targetElement = document.getElementById('water-target');
        
        if (goalElement) goalElement.textContent = waterGoal;
        if (targetElement) targetElement.textContent = waterGoal;
        
        updateWaterDisplay();
        saveWaterData();
    }

    function updateWaterDisplay() {
        const percentage = Math.min(100, (waterConsumed / waterGoal) * 100);
        
        // Update dashboard
        const waterTodayElement = document.getElementById('water-today');
        const waterProgressElement = document.getElementById('water-progress');
        
        if (waterTodayElement) waterTodayElement.textContent = `${waterConsumed}/${waterGoal} glasses`;
        if (waterProgressElement) waterProgressElement.style.width = `${percentage}%`;
        
        // Update water tracker tab
        const waterConsumedElement = document.getElementById('water-consumed');
        const waterPercentageElement = document.getElementById('water-percentage');
        const waterFillElement = document.getElementById('water-fill');
        
        if (waterConsumedElement) waterConsumedElement.textContent = waterConsumed;
        if (waterPercentageElement) waterPercentageElement.textContent = `${percentage.toFixed(0)}%`;
        if (waterFillElement) waterFillElement.style.height = `${percentage}%`;
        
        // Update cups in dashboard
        document.querySelectorAll('.cup').forEach((cup, index) => {
            if (index < waterConsumed) {
                cup.classList.add('drank');
            } else {
                cup.classList.remove('drank');
            }
        });
        
        // Update water history
        updateWaterHistory();
    }

    function saveWaterData() {
        const today = new Date().toDateString();
        const waterData = {
            goal: waterGoal,
            consumed: waterConsumed,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('lifesphere_water', JSON.stringify(waterData));
        
        // Save to history
        let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        waterHistory[today] = {
            consumed: waterConsumed,
            goal: waterGoal,
            percentage: Math.min(100, (waterConsumed / waterGoal) * 100)
        };
        localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
    }

    function updateWaterHistory() {
        const waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        const historyBody = document.getElementById('water-history-body');
        
        let historyHTML = '';
        const sortedDates = Object.keys(waterHistory).sort((a, b) => new Date(b) - new Date(a));
        
        sortedDates.slice(0, 7).forEach(date => {
            const data = waterHistory[date];
            const formattedDate = new Date(date).toLocaleDateString();
            
            historyHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${data.consumed}/${data.goal}</td>
                    <td>${data.percentage.toFixed(0)}%</td>
                    <td><button class="delete-btn" onclick="deleteWaterHistory('${date}')">Delete</button></td>
                </tr>
            `;
        });
        
        if (historyBody) historyBody.innerHTML = historyHTML;
    }

    // Initialize display
    updateWaterDisplay();
}

function deleteWaterHistory(date) {
    let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
    delete waterHistory[date];
    localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
    updateWaterHistory();
}

// Workout Tracker
function initializeWorkoutTracker() {
    const workoutForm = document.getElementById('workout-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const workout = {
                id: Date.now(),
                type: document.getElementById('workout-type').value,
                name: document.getElementById('workout-name').value,
                duration: parseInt(document.getElementById('workout-duration').value),
                calories: document.getElementById('workout-calories').value ? parseInt(document.getElementById('workout-calories').value) : null,
                notes: document.getElementById('workout-notes').value,
                date: new Date().toISOString()
            };
            
            saveWorkout(workout);
            this.reset();
        });
    }

    const periodSelect = document.getElementById('workout-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', updateWorkoutDisplay);
    }
}

function saveWorkout(workout) {
    let workouts = JSON.parse(localStorage.getItem('lifesphere_workouts')) || [];
    workouts.push(workout);
    localStorage.setItem('lifesphere_workouts', JSON.stringify(workouts));
    
    updateWorkoutDisplay();
    updateDashboard();
}

function updateWorkoutDisplay() {
    const workouts = JSON.parse(localStorage.getItem('lifesphere_workouts')) || [];
    const workoutList = document.getElementById('workout-list');
    const period = document.getElementById('workout-period')?.value || 'all';
    
    // Filter workouts by period
    let filteredWorkouts = workouts;
    const now = new Date();
    
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredWorkouts = workouts.filter(w => new Date(w.date) >= monthAgo);
    }
    
    // Update stats
    const totalWorkouts = filteredWorkouts.length;
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = filteredWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    
    const totalWorkoutsElement = document.getElementById('total-workouts');
    const totalDurationElement = document.getElementById('total-duration');
    const totalCaloriesElement = document.getElementById('total-calories');
    
    if (totalWorkoutsElement) totalWorkoutsElement.textContent = totalWorkouts;
    if (totalDurationElement) totalDurationElement.textContent = `${totalDuration} min`;
    if (totalCaloriesElement) totalCaloriesElement.textContent = totalCalories;
    
    // Update workout list
    let workoutHTML = '';
    
    filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(workout => {
        const date = new Date(workout.date).toLocaleDateString();
        
        workoutHTML += `
            <div class="workout-item">
                <div class="workout-item-header">
                    <div class="workout-name">${workout.name}</div>
                    <div class="workout-type">${workout.type}</div>
                </div>
                <div class="workout-details">
                    <span>${workout.duration} min</span>
                    ${workout.calories ? `<span>${workout.calories} cal</span>` : ''}
                    <span>${date}</span>
                </div>
                ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
                <button class="delete-btn" onclick="deleteWorkout(${workout.id})">Delete</button>
            </div>
        `;
    });
    
    if (workoutList) workoutList.innerHTML = workoutHTML;
    
    // Update dashboard
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= thisWeek).length;
    const workoutsWeekElement = document.getElementById('workouts-week');
    if (workoutsWeekElement) workoutsWeekElement.textContent = `${weekWorkouts} workouts`;
}

function deleteWorkout(id) {
    let workouts = JSON.parse(localStorage.getItem('lifesphere_workouts')) || [];
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem('lifesphere_workouts', JSON.stringify(workouts));
    updateWorkoutDisplay();
    updateDashboard();
}

// Medication Tracker
function initializeMedicationTracker() {
    const medicationForm = document.getElementById('medication-form');
    const addTimeBtn = document.getElementById('add-time');
    const ringtoneBtn = document.getElementById('ringtone-access');

    if (addTimeBtn) {
        addTimeBtn.addEventListener('click', function() {
            const timesContainer = document.getElementById('med-times');
            const newTimeInput = document.createElement('input');
            newTimeInput.type = 'time';
            newTimeInput.className = 'form-control med-time';
            newTimeInput.required = true;
            timesContainer.appendChild(newTimeInput);
        });
    }

    if (ringtoneBtn) {
        ringtoneBtn.addEventListener('click', function() {
            // Create and test audio for ringtone access
            medicationAlarmAudio = new Audio();
            medicationAlarmAudio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0eBzF/z/LQdSkFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0eBzF/z/LQdSk=";
            medicationAlarmAudio.play().then(() => {
                medicationAlarmAudio.pause();
                alert('Ringtone access granted! Medication alarms will now sound.');
                localStorage.setItem('lifesphere_ringtone', 'granted');
            }).catch(error => {
                alert('Please allow audio permissions for medication alarms to work properly.');
            });
        });
    }

    if (medicationForm) {
        medicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const timeInputs = document.querySelectorAll('.med-time');
            const times = Array.from(timeInputs).map(input => input.value).filter(time => time);
            
            const medication = {
                id: Date.now(),
                name: document.getElementById('med-name').value,
                dosage: document.getElementById('med-dosage').value,
                frequency: document.getElementById('med-frequency').value,
                times: times,
                notes: document.getElementById('med-notes').value,
                created: new Date().toISOString()
            };
            
            saveMedication(medication);
            this.reset();
            
            // Reset to one time input
            const timesContainer = document.getElementById('med-times');
            timesContainer.innerHTML = '<input type="time" class="form-control med-time" required>';
        });
    }

    // Initialize quality rating
    document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.quality-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('sleep-quality-value').value = this.dataset.quality;
        });
    });
}

function saveMedication(medication) {
    let medications = JSON.parse(localStorage.getItem('lifesphere_medications')) || [];
    medications.push(medication);
    localStorage.setItem('lifesphere_medications', JSON.stringify(medications));
    
    updateMedicationDisplay();
    updateDashboard();
}

function updateMedicationDisplay() {
    const medications = JSON.parse(localStorage.getItem('lifesphere_medications')) || [];
    const todayMedsList = document.getElementById('today-meds-list');
    const medsList = document.getElementById('meds-list');
    
    let todayMedsHTML = '';
    let allMedsHTML = '';
    
    medications.forEach(med => {
        const medElement = `
            <div class="med-item">
                <div class="med-info">
                    <h4>${med.name}</h4>
                    <div class="med-dosage">${med.dosage}</div>
                    ${med.notes ? `<div class="med-notes">${med.notes}</div>` : ''}
                </div>
                <div class="med-times">
                    ${med.times.map(time => `
                        <div class="med-time-item">${time}</div>
                    `).join('')}
                </div>
                <button class="delete-btn" onclick="deleteMedication(${med.id})">Delete</button>
            </div>
        `;
        
        allMedsHTML += medElement;
        
        // For today's medications, we'd check if it's scheduled for today
        // For simplicity, we'll show all medications with daily frequency
        if (med.frequency === 'once' || med.frequency === 'twice' || med.frequency === 'thrice') {
            todayMedsHTML += medElement;
        }
    });
    
    if (todayMedsList) todayMedsList.innerHTML = todayMedsHTML;
    if (medsList) medsList.innerHTML = allMedsHTML;
    
    // Update dashboard
    const todayMedsCount = medications.filter(m => 
        m.frequency === 'once' || m.frequency === 'twice' || m.frequency === 'thrice').length;
    const medsTodayElement = document.getElementById('meds-today');
    if (medsTodayElement) medsTodayElement.textContent = `0/${todayMedsCount} taken`;
}

function deleteMedication(id) {
    let medications = JSON.parse(localStorage.getItem('lifesphere_medications')) || [];
    medications = medications.filter(m => m.id !== id);
    localStorage.setItem('lifesphere_medications', JSON.stringify(medications));
    updateMedicationDisplay();
    updateDashboard();
}

// Meal Planner
function initializeMealPlanner() {
    const mealForm = document.getElementById('meal-plan-form');
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');

    if (mealForm) {
        mealForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const meal = {
                id: Date.now(),
                date: document.getElementById('meal-date').value,
                type: document.getElementById('meal-type').value,
                name: document.getElementById('meal-name').value,
                time: document.getElementById('meal-time').value,
                calories: document.getElementById('meal-calories').value ? parseInt(document.getElementById('meal-calories').value) : null,
                recipe: document.getElementById('meal-recipe').value,
                created: new Date().toISOString()
            };
            
            saveMeal(meal);
            this.reset();
        });
    }

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function() {
            currentWeekOffset--;
            updateMealDisplay();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function() {
            currentWeekOffset++;
            updateMealDisplay();
        });
    }
}

function saveMeal(meal) {
    let meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    meals.push(meal);
    localStorage.setItem('lifesphere_meals', JSON.stringify(meals));
    
    updateMealDisplay();
}

function updateMealDisplay() {
    const meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    const weeklyMealPlan = document.getElementById('weekly-meal-plan');
    const weekDisplay = document.getElementById('week-display');
    
    // Calculate week start based on current week offset
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
    
    // Update week display
    if (weekDisplay) {
        if (currentWeekOffset === 0) {
            weekDisplay.textContent = 'Current Week';
        } else if (currentWeekOffset < 0) {
            weekDisplay.textContent = `${Math.abs(currentWeekOffset)} week${Math.abs(currentWeekOffset) > 1 ? 's' : ''} ago`;
        } else {
            weekDisplay.textContent = `In ${currentWeekOffset} week${currentWeekOffset > 1 ? 's' : ''}`;
        }
    }
    
    // Generate weekly view
    let weeklyHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const dayMeals = meals.filter(meal => meal.date === dateString);
        
        weeklyHTML += `
            <div class="day-meals">
                <div class="day-header">${dayName}<br>${dateFormatted}</div>
                ${dayMeals.map(meal => `
                    <div class="meal-item">
                        <strong>${meal.type}:</strong> ${meal.name}<br>
                        <small>Time: ${meal.time}</small>
                        ${meal.calories ? `<br><small>${meal.calories} cal</small>` : ''}
                        ${meal.recipe ? `<div class="meal-notes">${meal.recipe}</div>` : ''}
                        <button class="delete-btn" onclick="deleteMeal(${meal.id})">Delete</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (weeklyMealPlan) weeklyMealPlan.innerHTML = weeklyHTML;
    
    // Update meal stats
    const thisWeekMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        const actualWeekStart = new Date(today);
        actualWeekStart.setDate(today.getDate() - today.getDay());
        const actualWeekEnd = new Date(actualWeekStart);
        actualWeekEnd.setDate(actualWeekStart.getDate() + 6);
        
        return mealDate >= actualWeekStart && mealDate <= actualWeekEnd;
    });
    
    const totalCalories = thisWeekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const avgCalories = thisWeekMeals.length > 0 ? Math.round(totalCalories / thisWeekMeals.length) : 0;
    
    const avgCaloriesElement = document.getElementById('avg-calories');
    const plannedMealsElement = document.getElementById('planned-meals');
    
    if (avgCaloriesElement) avgCaloriesElement.textContent = `${avgCalories} cal`;
    if (plannedMealsElement) plannedMealsElement.textContent = thisWeekMeals.length;
}

function deleteMeal(id) {
    let meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    meals = meals.filter(m => m.id !== id);
    localStorage.setItem('lifesphere_meals', JSON.stringify(meals));
    updateMealDisplay();
}

// Screen Time Tracker
function initializeScreenTimeTracker() {
    const startBtn = document.getElementById('start-tracking');
    const stopBtn = document.getElementById('stop-tracking');
    const addManualBtn = document.getElementById('add-manual');
    const goalInput = document.getElementById('screen-goal');
    const resetBtn = document.getElementById('reset-screen');

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!screenTracking) {
                screenTracking = true;
                this.disabled = true;
                document.getElementById('stop-tracking').disabled = false;
                
                // Start tracking screen time
                screenTimeInterval = setInterval(() => {
                    screenTimeSeconds++;
                    updateScreenDisplay();
                }, 1000);
                
                localStorage.setItem('lifesphere_screen_tracking', 'true');
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            if (screenTracking) {
                screenTracking = false;
                document.getElementById('start-tracking').disabled = false;
                this.disabled = true;
                
                if (screenTimeInterval) {
                    clearInterval(screenTimeInterval);
                }
                
                saveScreenData();
                localStorage.setItem('lifesphere_screen_tracking', 'false');
            }
        });
    }

    if (addManualBtn) {
        addManualBtn.addEventListener('click', function() {
            const minutes = prompt('Enter screen time in minutes:');
            if (minutes && !isNaN(minutes)) {
                screenTimeSeconds += parseInt(minutes) * 60;
                updateScreenDisplay();
                saveScreenData();
            }
        });
    }

    if (goalInput) {
        goalInput.addEventListener('change', function() {
            updateScreenDisplay();
            saveScreenData();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            screenTimeSeconds = 0;
            updateScreenDisplay();
            saveScreenData();
        });
    }

    // Check if tracking was active
    if (localStorage.getItem('lifesphere_screen_tracking') === 'true') {
        startBtn.click();
    }

    // Load saved screen time for today
    loadScreenData();
}

function updateScreenDisplay() {
    const hours = Math.floor(screenTimeSeconds / 3600);
    const minutes = Math.floor((screenTimeSeconds % 3600) / 60);
    const seconds = screenTimeSeconds % 60;
    
    const screenHoursElement = document.getElementById('screen-hours');
    const screenMinutesElement = document.getElementById('screen-minutes');
    const screenSecondsElement = document.getElementById('screen-seconds');
    
    if (screenHoursElement) screenHoursElement.textContent = hours.toString().padStart(2, '0');
    if (screenMinutesElement) screenMinutesElement.textContent = minutes.toString().padStart(2, '0');
    if (screenSecondsElement) screenSecondsElement.textContent = seconds.toString().padStart(2, '0');
    
    // Update dashboard
    const screenTodayElement = document.getElementById('screen-today');
    if (screenTodayElement) screenTodayElement.textContent = `${hours}h ${minutes}m`;
    
    // Update progress
    const goalHours = parseInt(document.getElementById('screen-goal')?.value || 4);
    const goalSeconds = goalHours * 3600;
    const percentage = Math.min(100, (screenTimeSeconds / goalSeconds) * 100);
    
    const screenProgressElement = document.getElementById('screen-progress');
    const screenGoalTextElement = document.getElementById('screen-goal-text');
    
    if (screenProgressElement) screenProgressElement.style.width = `${percentage}%`;
    if (screenGoalTextElement) screenGoalTextElement.textContent = `${percentage.toFixed(0)}% of daily goal`;
    
    // Update screen history
    updateScreenHistory();
}

function saveScreenData() {
    const today = new Date().toDateString();
    const screenData = {
        seconds: screenTimeSeconds,
        goal: parseInt(document.getElementById('screen-goal')?.value || 4)
    };
    
    localStorage.setItem('lifesphere_screen', JSON.stringify(screenData));
    
    // Save to history
    let screenHistory = JSON.parse(localStorage.getItem('lifesphere_screen_history')) || {};
    screenHistory[today] = {
        seconds: screenTimeSeconds,
        goal: screenData.goal,
        percentage: Math.min(100, (screenTimeSeconds / (screenData.goal * 3600)) * 100)
    };
    localStorage.setItem('lifesphere_screen_history', JSON.stringify(screenHistory));
}

function loadScreenData() {
    const today = new Date().toDateString();
    const screenData = JSON.parse(localStorage.getItem('lifesphere_screen')) || {};
    
    if (screenData.seconds) {
        screenTimeSeconds = screenData.seconds;
    }
    
    const goalInput = document.getElementById('screen-goal');
    if (goalInput && screenData.goal) {
        goalInput.value = screenData.goal;
    }
    
    updateScreenDisplay();
}

function updateScreenHistory() {
    const screenHistory = JSON.parse(localStorage.getItem('lifesphere_screen_history')) || {};
    const historyBody = document.getElementById('screen-history-body');
    
    let historyHTML = '';
    const sortedDates = Object.keys(screenHistory).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.slice(0, 7).forEach(date => {
        const data = screenHistory[date];
        const formattedDate = new Date(date).toLocaleDateString();
        const hours = Math.floor(data.seconds / 3600);
        const minutes = Math.floor((data.seconds % 3600) / 60);
        
        historyHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${hours}h ${minutes}m</td>
                <td>${data.percentage.toFixed(0)}%</td>
                <td><button class="delete-btn" onclick="deleteScreenHistory('${date}')">Delete</button></td>
            </tr>
        `;
    });
    
    if (historyBody) historyBody.innerHTML = historyHTML;
}

function deleteScreenHistory(date) {
    let screenHistory = JSON.parse(localStorage.getItem('lifesphere_screen_history')) || {};
    delete screenHistory[date];
    localStorage.setItem('lifesphere_screen_history', JSON.stringify(screenHistory));
    updateScreenHistory();
}

// Sleep Tracker
function initializeSleepTracker() {
    const sleepForm = document.getElementById('sleep-form');

    if (sleepForm) {
        sleepForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bedtime = document.getElementById('bedtime').value;
            const waketime = document.getElementById('waketime').value;
            
            // Calculate duration
            const bedDate = new Date(`2000-01-01T${bedtime}`);
            const wakeDate = new Date(`2000-01-01T${waketime}`);
            
            let duration = (wakeDate - bedDate) / (1000 * 60); // in minutes
            
            // Handle overnight sleep (if wake time is before bedtime, it's the next day)
            if (duration < 0) {
                duration += 24 * 60; // Add 24 hours
            }
            
            const sleep = {
                id: Date.now(),
                date: document.getElementById('sleep-date').value,
                bedtime: bedtime,
                waketime: waketime,
                duration: duration,
                quality: parseInt(document.getElementById('sleep-quality-value').value),
                notes: document.getElementById('sleep-notes').value
            };
            
            saveSleep(sleep);
            this.reset();
            document.querySelectorAll('.quality-option').forEach(o => o.classList.remove('selected'));
        });
    }
}

function saveSleep(sleep) {
    let sleeps = JSON.parse(localStorage.getItem('lifesphere_sleep')) || [];
    sleeps.push(sleep);
    localStorage.setItem('lifesphere_sleep', JSON.stringify(sleeps));
    
    updateSleepDisplay();
    updateDashboard();
}

function updateSleepDisplay() {
    const sleeps = JSON.parse(localStorage.getItem('lifesphere_sleep')) || [];
    const sleepHistoryList = document.getElementById('sleep-history-list');
    
    // Update dashboard with last night's sleep
    if (sleeps.length > 0) {
        const lastSleep = sleeps[sleeps.length - 1];
        const hours = Math.floor(lastSleep.duration / 60);
        const minutes = lastSleep.duration % 60;
        const sleepLastElement = document.getElementById('sleep-last');
        if (sleepLastElement) sleepLastElement.textContent = `${hours}h ${minutes}m`;
    }
    
    // Update sleep history
    let historyHTML = '';
    
    sleeps.slice(-5).reverse().forEach(sleep => {
        const hours = Math.floor(sleep.duration / 60);
        const minutes = sleep.duration % 60;
        const date = new Date(sleep.date).toLocaleDateString();
        
        historyHTML += `
            <div class="sleep-item">
                <div class="sleep-item-info">
                    <div class="sleep-item-header">
                        <div class="sleep-date">${date}</div>
                        <div class="sleep-duration">${hours}h ${minutes}m</div>
                    </div>
                    <div class="sleep-quality">Quality: ${sleep.quality}/5</div>
                    ${sleep.notes ? `<div class="sleep-notes">${sleep.notes}</div>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteSleep(${sleep.id})">Delete</button>
            </div>
        `;
    });
    
    if (sleepHistoryList) sleepHistoryList.innerHTML = historyHTML;
    
    // Update sleep stats
    if (sleeps.length > 0) {
        const totalDuration = sleeps.reduce((sum, sleep) => sum + sleep.duration, 0);
        const avgDuration = totalDuration / sleeps.length;
        const avgHours = Math.floor(avgDuration / 60);
        const avgMinutes = Math.round(avgDuration % 60);
        
        const avgSleepElement = document.getElementById('avg-sleep');
        if (avgSleepElement) avgSleepElement.textContent = `${avgHours}h ${avgMinutes}m`;
        
        // Calculate consistency (simplified - percentage of days with sleep logged)
        const uniqueDates = new Set(sleeps.map(s => s.date));
        const consistency = (uniqueDates.size / 7) * 100; // Assuming a week
        const sleepConsistencyElement = document.getElementById('sleep-consistency');
        if (sleepConsistencyElement) sleepConsistencyElement.textContent = `${Math.min(100, consistency).toFixed(0)}%`;
        
        // Find best quality
        const bestQuality = Math.max(...sleeps.map(s => s.quality));
        const bestQualityElement = document.getElementById('best-quality');
        if (bestQualityElement) bestQualityElement.textContent = `${bestQuality}/5`;
    }
}

function deleteSleep(id) {
    let sleeps = JSON.parse(localStorage.getItem('lifesphere_sleep')) || [];
    sleeps = sleeps.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_sleep', JSON.stringify(sleeps));
    updateSleepDisplay();
    updateDashboard();
}

// LifeLoop
function initializeLifeLoop() {
    const reminderForm = document.getElementById('reminder-form');
    
    if (reminderForm) {
        reminderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const reminder = {
                id: Date.now(),
                name: document.getElementById('reminder-name').value,
                date: document.getElementById('reminder-date').value,
                type: document.getElementById('reminder-type').value,
                notice: parseInt(document.getElementById('reminder-notice').value),
                created: new Date().toISOString()
            };
            
            saveReminder(reminder);
            this.reset();
        });
    }
}

function saveReminder(reminder) {
    let reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    reminders.push(reminder);
    localStorage.setItem('lifesphere_reminders', JSON.stringify(reminders));
    
    updateLifeLoopDisplay();
}

function updateLifeLoopDisplay() {
    const reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    const upcomingReminders = document.getElementById('upcoming-reminders');
    const allReminders = document.getElementById('all-reminders');
    
    // Sort reminders by date
    reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const now = new Date();
    const upcoming = reminders.filter(r => new Date(r.date) >= now);
    const past = reminders.filter(r => new Date(r.date) < now);
    
    let upcomingHTML = '';
    let allHTML = '';
    
    // Upcoming reminders (next 7 days)
    upcoming.slice(0, 10).forEach(reminder => {
        const date = new Date(reminder.date);
        const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        upcomingHTML += `
            <div class="reminder-item">
                <div class="reminder-info">
                    <div class="reminder-header">
                        <strong>${reminder.name}</strong>
                        <span class="reminder-type ${reminder.type}">${reminder.type}</span>
                    </div>
                    <div class="reminder-details">
                        <span class="reminder-date">${formattedDate}</span>
                        <span class="reminder-days">${daysUntil} day${daysUntil !== 1 ? 's' : ''} away</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteReminder(${reminder.id})">Delete</button>
            </div>
        `;
    });
    
    // All reminders
    reminders.forEach(reminder => {
        const date = new Date(reminder.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric' 
        });
        const isPast = date < now;
        
        allHTML += `
            <div class="reminder-item ${isPast ? 'past' : ''}">
                <div class="reminder-info">
                    <div class="reminder-header">
                        <strong>${reminder.name}</strong>
                        <span class="reminder-type ${reminder.type}">${reminder.type}</span>
                    </div>
                    <div class="reminder-details">
                        <span class="reminder-date">${formattedDate}</span>
                        ${isPast ? '<span class="past-badge">Past</span>' : '<span class="upcoming-badge">Upcoming</span>'}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteReminder(${reminder.id})">Delete</button>
            </div>
        `;
    });
    
    if (upcomingReminders) {
        upcomingReminders.innerHTML = upcomingHTML || `
            <div class="empty-state">
                <p>No upcoming reminders</p>
                <small>Add reminders to see them here</small>
            </div>
        `;
    }
    
    if (allReminders) {
        allReminders.innerHTML = allHTML || `
            <div class="empty-state">
                <p>No reminders yet</p>
                <small>Add your first reminder using the form</small>
            </div>
        `;
    }
}

function deleteReminder(id) {
    let reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('lifesphere_reminders', JSON.stringify(reminders));
    updateLifeLoopDisplay();
}

// TaskForge
function initializeTaskForge() {
    const todoForm = document.getElementById('todo-form');
    const subscriptionForm = document.getElementById('subscription-form');
    
    if (todoForm) {
        todoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const task = {
                id: Date.now(),
                task: document.getElementById('todo-task').value,
                priority: document.getElementById('todo-priority').value,
                due: document.getElementById('todo-due').value,
                completed: false,
                created: new Date().toISOString()
            };
            
            saveTodo(task);
            this.reset();
        });
    }
    
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const subscription = {
                id: Date.now(),
                name: document.getElementById('sub-name').value,
                price: parseFloat(document.getElementById('sub-price').value),
                renewal: document.getElementById('sub-renewal').value,
                category: document.getElementById('sub-category').value,
                created: new Date().toISOString()
            };
            
            saveSubscription(subscription);
            this.reset();
        });
    }
}

function saveTodo(task) {
    let todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    todos.push(task);
    localStorage.setItem('lifesphere_todos', JSON.stringify(todos));
    
    updateTaskForgeDisplay();
    updateDashboard();
}

function updateTaskForgeDisplay() {
    updateTodoDisplay();
    updateSubscriptionsDisplay();
}

function updateTodoDisplay() {
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    const pendingCount = document.getElementById('pending-count');
    const completedCount = document.getElementById('completed-count');
    
    const pendingTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    
    let todoHTML = '';
    let completedHTML = '';
    
    // Pending tasks
    pendingTodos.forEach(task => {
        const dueDate = task.due ? new Date(task.due).toLocaleDateString() : 'No due date';
        todoHTML += `
            <div class="task-item ${task.priority}">
                <div class="task-info">
                    <div class="task-main">
                        <span class="task-text">${task.task}</span>
                        <span class="todo-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-due">Due: ${dueDate}</div>
                </div>
                <div class="task-actions">
                    <button class="btn-complete" onclick="completeTodo(${task.id})">✓</button>
                    <button class="delete-btn" onclick="deleteTodo(${task.id})">✕</button>
                </div>
            </div>
        `;
    });
    
    // Completed tasks
    completedTodos.forEach(task => {
        const dueDate = task.due ? new Date(task.due).toLocaleDateString() : 'No due date';
        completedHTML += `
            <div class="task-item completed">
                <div class="task-info">
                    <div class="task-main">
                        <span class="task-text" style="text-decoration: line-through; opacity: 0.7;">${task.task}</span>
                        <span class="todo-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-due">Due: ${dueDate}</div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="deleteTodo(${task.id})">✕</button>
                </div>
            </div>
        `;
    });
    
    if (todoList) todoList.innerHTML = todoHTML || '<div class="empty-state"><p>No pending tasks</p></div>';
    if (completedList) completedList.innerHTML = completedHTML || '<div class="empty-state"><p>No completed tasks</p></div>';
    if (pendingCount) pendingCount.textContent = `${pendingTodos.length} pending`;
    if (completedCount) completedCount.textContent = `${completedTodos.length} completed`;
    
    // Update dashboard
    const todayTasks = todos.filter(t => !t.completed);
    const tasksTodayElement = document.getElementById('tasks-today');
    const tasksProgressElement = document.getElementById('tasks-progress');
    
    if (tasksTodayElement) tasksTodayElement.textContent = `0/${todayTasks.length}`;
    if (tasksProgressElement) tasksProgressElement.style.width = '0%';
}

function completeTodo(id) {
    let todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const taskIndex = todos.findIndex(t => t.id === id);
    
    if (taskIndex !== -1) {
        todos[taskIndex].completed = true;
        localStorage.setItem('lifesphere_todos', JSON.stringify(todos));
        updateTaskForgeDisplay();
        updateDashboard();
    }
}

function deleteTodo(id) {
    let todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('lifesphere_todos', JSON.stringify(todos));
    updateTaskForgeDisplay();
    updateDashboard();
}

function saveSubscription(subscription) {
    let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    subscriptions.push(subscription);
    localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
    
    updateTaskForgeDisplay();
}

function updateSubscriptionsDisplay() {
    const subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    const subscriptionsBody = document.getElementById('subscriptions-body');
    const totalSubs = document.getElementById('total-subs');
    const monthlyCost = document.getElementById('monthly-cost');
    
    const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    let subscriptionsHTML = '';
    
    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewal);
        const now = new Date();
        const daysUntil = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
        const status = daysUntil <= 7 ? 'renewing-soon' : daysUntil <= 0 ? 'expired' : 'active';
        const statusText = daysUntil <= 7 ? 'Renewing Soon' : daysUntil <= 0 ? 'Expired' : 'Active';
        
        subscriptionsHTML += `
            <tr>
                <td>${sub.name}</td>
                <td><span class="category-tag ${sub.category}">${sub.category}</span></td>
                <td>$${sub.price.toFixed(2)}</td>
                <td>${renewalDate.toLocaleDateString()}</td>
                <td><span class="status-badge ${status}">${statusText}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteSubscription(${sub.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    if (subscriptionsBody) subscriptionsBody.innerHTML = subscriptionsHTML || '<tr><td colspan="6">No subscriptions</td></tr>';
    if (totalSubs) totalSubs.textContent = `${subscriptions.length} subscriptions`;
    if (monthlyCost) monthlyCost.textContent = `$${totalMonthly.toFixed(2)}/month`;
}

function deleteSubscription(id) {
    let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    subscriptions = subscriptions.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
    updateTaskForgeDisplay();
}

// EduPlan
function initializeEduPlan() {
    const timetableForm = document.getElementById('timetable-form');
    const studyForm = document.getElementById('study-form');
    const homeworkForm = document.getElementById('homework-form');
    const examForm = document.getElementById('exam-form');
    
    if (timetableForm) {
        timetableForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const course = {
                id: Date.now(),
                name: document.getElementById('course-name').value,
                code: document.getElementById('course-code').value,
                day: document.getElementById('course-day').value,
                time: document.getElementById('course-time').value,
                duration: parseInt(document.getElementById('course-duration').value),
                location: document.getElementById('course-location').value,
                created: new Date().toISOString()
            };
            
            saveCourse(course);
            this.reset();
        });
    }
    
    if (studyForm) {
        studyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studySession = {
                id: Date.now(),
                subject: document.getElementById('study-subject').value,
                topic: document.getElementById('study-topic').value,
                duration: parseInt(document.getElementById('study-duration').value),
                goal: document.getElementById('study-goal').value,
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + parseInt(document.getElementById('study-duration').value) * 60 * 1000).toISOString()
            };
            
            saveStudySession(studySession);
            this.reset();
        });
    }
    
    if (homeworkForm) {
        homeworkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const homework = {
                id: Date.now(),
                subject: document.getElementById('hw-subject').value,
                task: document.getElementById('hw-task').value,
                due: document.getElementById('hw-due').value,
                priority: document.getElementById('hw-priority').value,
                estimate: parseInt(document.getElementById('hw-estimate').value),
                completed: false,
                created: new Date().toISOString()
            };
            
            saveHomework(homework);
            this.reset();
        });
    }
    
    if (examForm) {
        examForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const exam = {
                id: Date.now(),
                subject: document.getElementById('exam-subject').value,
                type: document.getElementById('exam-type').value,
                date: document.getElementById('exam-date').value,
                time: document.getElementById('exam-time').value,
                location: document.getElementById('exam-location').value,
                duration: parseInt(document.getElementById('exam-duration').value),
                created: new Date().toISOString()
            };
            
            saveExam(exam);
            this.reset();
        });
    }
}

function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    courses.push(course);
    localStorage.setItem('lifesphere_courses', JSON.stringify(courses));
    
    updateEduPlanDisplay();
}

function saveStudySession(session) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions.push(session);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    
    updateEduPlanDisplay();
}

function saveHomework(homework) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks.push(homework);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    
    updateEduPlanDisplay();
}

function saveExam(exam) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams.push(exam);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    
    updateEduPlanDisplay();
}

function updateEduPlanDisplay() {
    updateTimetableDisplay();
    updateStudyTrackerDisplay();
    updateHomeworkDisplay();
    updateExamsDisplay();
    updateGradesDisplay();
}

function updateTimetableDisplay() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const timetableView = document.getElementById('timetable-view');
    
    if (!timetableView) return;
    
    // Create timetable grid
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    let timetableHTML = '';
    
    // Header row
    timetableHTML += '<div class="timetable-slot timetable-header">Time</div>';
    days.forEach(day => {
        timetableHTML += `<div class="timetable-slot timetable-header">${day}</div>`;
    });
    
    // Time slots
    timeSlots.forEach(time => {
        timetableHTML += `<div class="timetable-slot timetable-header">${time}</div>`;
        
        days.forEach(day => {
            const dayLower = day.toLowerCase();
            const cellCourses = courses.filter(course => 
                course.day === dayLower && 
                course.time.startsWith(time.split(':')[0])
            );
            
            timetableHTML += `<div class="timetable-slot">`;
            
            cellCourses.forEach(course => {
                timetableHTML += `
                    <div class="course-block">
                        <strong>${course.name}</strong>
                        ${course.code ? `<br><small>${course.code}</small>` : ''}
                        ${course.location ? `<br><small>${course.location}</small>` : ''}
                    </div>
                `;
            });
            
            timetableHTML += `</div>`;
        });
    });
    
    timetableView.innerHTML = timetableHTML;
}

function updateStudyTrackerDisplay() {
    const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    const studySessionsBody = document.getElementById('study-sessions-body');
    const studyTodayQuick = document.getElementById('study-today-quick');
    const studyWeekQuick = document.getElementById('study-week-quick');
    const studyToday = document.getElementById('study-today');
    const studyWeek = document.getElementById('study-week');
    const studyTotal = document.getElementById('study-total');
    
    // Calculate stats
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const todaySessions = studySessions.filter(s => 
        new Date(s.startTime).toDateString() === today
    );
    
    const weekSessions = studySessions.filter(s => 
        new Date(s.startTime) >= thisWeek
    );
    
    const todayDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const weekDuration = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalDuration = studySessions.reduce((sum, s) => sum + s.duration, 0);
    
    const todayHours = Math.floor(todayDuration / 60);
    const todayMinutes = todayDuration % 60;
    
    const weekHours = Math.floor(weekDuration / 60);
    const weekMinutes = weekDuration % 60;
    
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;
    
    if (studyTodayQuick) studyTodayQuick.textContent = `Today: ${todayHours}h ${todayMinutes}m`;
    if (studyWeekQuick) studyWeekQuick.textContent = `Week: ${weekHours}h ${weekMinutes}m`;
    if (studyToday) studyToday.textContent = `${todayHours}h ${todayMinutes}m`;
    if (studyWeek) studyWeek.textContent = `${weekHours}h ${weekMinutes}m`;
    if (studyTotal) studyTotal.textContent = `${totalHours}h ${totalMinutes}m`;
    
    // Update study sessions list
    let sessionsHTML = '';
    
    studySessions.slice(-5).reverse().forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        const hours = Math.floor(session.duration / 60);
        const minutes = session.duration % 60;
        
        sessionsHTML += `
            <tr>
                <td>${session.subject}</td>
                <td>${session.topic || '-'}</td>
                <td>${hours}h ${minutes}m</td>
                <td>${date}</td>
                <td><button class="delete-btn" onclick="deleteStudySession(${session.id})">Delete</button></td>
            </tr>
        `;
    });
    
    if (studySessionsBody) studySessionsBody.innerHTML = sessionsHTML || '<tr><td colspan="5">No study sessions</td></tr>';
}

function deleteStudySession(id) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions = studySessions.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    updateStudyTrackerDisplay();
}

function updateHomeworkDisplay() {
    const homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    const homeworkList = document.getElementById('homework-list');
    const pendingHomework = document.getElementById('pending-homework');
    const dueSoon = document.getElementById('due-soon');
    
    const pending = homeworks.filter(h => !h.completed);
    const now = new Date();
    const soonDue = pending.filter(h => {
        const dueDate = new Date(h.due);
        const daysUntil = (dueDate - now) / (1000 * 60 * 60 * 24);
        return daysUntil <= 3;
    });
    
    let homeworkHTML = '';
    
    pending.forEach(homework => {
        const dueDate = new Date(homework.due).toLocaleDateString();
        homeworkHTML += `
            <div class="homework-item">
                <div>
                    <strong>${homework.subject}</strong><br>
                    <div>${homework.task}</div>
                    <small>Due: ${dueDate} - Priority: ${homework.priority} - Est: ${homework.estimate}min</small>
                </div>
                <div>
                    <button class="btn-complete" onclick="completeHomework(${homework.id})">Complete</button>
                    <button class="delete-btn" onclick="deleteHomework(${homework.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    if (homeworkList) homeworkList.innerHTML = homeworkHTML || '<p>No homework</p>';
    if (pendingHomework) pendingHomework.textContent = `${pending.length} pending`;
    if (dueSoon) dueSoon.textContent = `${soonDue.length} due soon`;
}

function completeHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    const homeworkIndex = homeworks.findIndex(h => h.id === id);
    
    if (homeworkIndex !== -1) {
        homeworks[homeworkIndex].completed = true;
        localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
        updateHomeworkDisplay();
    }
}

function deleteHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks = homeworks.filter(h => h.id !== id);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    updateHomeworkDisplay();
}

function updateExamsDisplay() {
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const examsList = document.getElementById('exams-list');
    const upcomingExams = document.getElementById('upcoming-exams');
    const examsThisMonth = document.getElementById('exams-this-month');
    
    const now = new Date();
    const upcoming = exams.filter(e => new Date(e.date) >= now);
    const thisMonth = exams.filter(e => {
        const examDate = new Date(e.date);
        return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear();
    });
    
    let examsHTML = '';
    
    upcoming.forEach(exam => {
        const examDate = new Date(exam.date).toLocaleDateString();
        examsHTML += `
            <div class="exam-item">
                <div>
                    <strong>${exam.subject}</strong><br>
                    <small>Date: ${examDate} at ${exam.time}</small>
                    ${exam.location ? `<br><small>Location: ${exam.location}</small>` : ''}
                    ${exam.type ? `<br><small>Type: ${exam.type}</small>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteExam(${exam.id})">Delete</button>
            </div>
        `;
    });
    
    if (examsList) examsList.innerHTML = examsHTML || '<p>No exams</p>';
    if (upcomingExams) upcomingExams.textContent = `${upcoming.length} upcoming`;
    if (examsThisMonth) examsThisMonth.textContent = `${thisMonth.length} this month`;
}

function deleteExam(id) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams = exams.filter(e => e.id !== id);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    updateExamsDisplay();
}

// Grade Tracker
function initializeGradeForm() {
    const gradeForm = document.getElementById('grade-form');
    if (gradeForm) {
        gradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const grade = {
                id: Date.now(),
                subject: document.getElementById('grade-subject').value,
                type: document.getElementById('grade-type').value,
                score: parseFloat(document.getElementById('grade-score').value),
                max: parseFloat(document.getElementById('grade-max').value),
                weight: parseFloat(document.getElementById('grade-weight').value),
                date: document.getElementById('grade-date').value,
                created: new Date().toISOString()
            };
            
            saveGrade(grade);
            this.reset();
        });
    }
}

function saveGrade(grade) {
    let grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    grades.push(grade);
    localStorage.setItem('lifesphere_grades', JSON.stringify(grades));
    updateGradesDisplay();
}

function updateGradesDisplay() {
    const grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    const gradesBody = document.getElementById('grades-body');
    const currentGpa = document.getElementById('current-gpa');
    const totalCourses = document.getElementById('total-courses');
    
    const uniqueSubjects = new Set(grades.map(g => g.subject));
    
    let gradesHTML = '';
    
    grades.forEach(grade => {
        const percentage = ((grade.score / grade.max) * 100).toFixed(1);
        const date = new Date(grade.date).toLocaleDateString();
        
        gradesHTML += `
            <tr>
                <td>${grade.subject}</td>
                <td>${grade.type}</td>
                <td>${grade.score}/${grade.max}</td>
                <td>${percentage}%</td>
                <td>${grade.weight}%</td>
                <td>${date}</td>
                <td>
                    <button class="delete-btn" onclick="deleteGrade(${grade.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    if (gradesBody) gradesBody.innerHTML = gradesHTML || '<tr><td colspan="7">No grades recorded</td></tr>';
    if (currentGpa) currentGpa.textContent = `GPA: ${calculateGPA(grades).toFixed(2)}`;
    if (totalCourses) totalCourses.textContent = `${uniqueSubjects.size} courses`;
}

function calculateGPA(grades) {
    if (grades.length === 0) return 0;
    
    const totalPercentage = grades.reduce((sum, grade) => {
        return sum + ((grade.score / grade.max) * 100);
    }, 0);
    
    const averagePercentage = totalPercentage / grades.length;
    
    // Simple GPA calculation
    if (averagePercentage >= 90) return 4.0;
    if (averagePercentage >= 80) return 3.0;
    if (averagePercentage >= 70) return 2.0;
    if (averagePercentage >= 60) return 1.0;
    return 0.0;
}

function deleteGrade(id) {
    let grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    grades = grades.filter(g => g.id !== id);
    localStorage.setItem('lifesphere_grades', JSON.stringify(grades));
    updateGradesDisplay();
}

// Dashboard
function updateDashboard() {
    // Update today's tasks list
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const todayTasksList = document.getElementById('today-tasks-list');
    
    if (todayTasksList) {
        const pendingTasks = todos.filter(t => !t.completed).slice(0, 5);
        let tasksHTML = '';
        
        pendingTasks.forEach(task => {
            tasksHTML += `
                <div class="task-item ${task.priority}" style="margin-bottom: 0.5rem; padding: 0.5rem;">
                    <div>${task.task}</div>
                    <span class="todo-priority priority-${task.priority}">${task.priority}</span>
                </div>
            `;
        });
        
        todayTasksList.innerHTML = tasksHTML || '<p>No tasks for today</p>';
    }
}

// Background Services
function startBackgroundServices() {
    // Check for medication alarms
    setInterval(checkMedicationAlarms, 60000); // Check every minute
    
    // Check for notifications
    setInterval(checkScheduledNotifications, 60000); // Check every minute
}

function checkMedicationAlarms() {
    const medications = JSON.parse(localStorage.getItem('lifesphere_medications')) || [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    medications.forEach(med => {
        med.times.forEach(time => {
            if (time === currentTime) {
                triggerMedicationAlarm(med);
            }
        });
    });
}

function triggerMedicationAlarm(medication) {
    if (localStorage.getItem('lifesphere_ringtone') !== 'granted') return;
    
    const alarmModal = document.getElementById('medication-alarm');
    const alarmMessage = document.getElementById('alarm-message');
    const stopAlarmBtn = document.getElementById('stop-alarm');
    
    if (alarmModal && alarmMessage && stopAlarmBtn) {
        alarmMessage.textContent = `Time to take ${medication.name} - ${medication.dosage}`;
        alarmModal.style.display = 'flex';
        
        // Create and play alarm sound
        medicationAlarmAudio = new Audio();
        medicationAlarmAudio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0eBzF/z/LQdSkFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0eBzF/z/LQdSk=";
        medicationAlarmAudio.loop = true;
        medicationAlarmAudio.play();
        
        stopAlarmBtn.onclick = function() {
            alarmModal.style.display = 'none';
            medicationAlarmAudio.pause();
            medicationAlarmAudio.currentTime = 0;
        };
    }
}

function checkScheduledNotifications() {
    const now = new Date();
    
    // Morning notifications (8 AM)
    if (now.getHours() === 8 && now.getMinutes() === 0) {
        sendMorningNotifications();
    }
    
    // Meal notifications (check every minute)
    checkMealNotifications();
    
    // Screen time notifications (9 PM)
    if (now.getHours() === 21 && now.getMinutes() === 0) {
        sendScreenTimeNotification();
    }
}

function sendMorningNotifications() {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const notifications = [
        { title: '🌅 Good Morning!', message: 'Time to start your day. Check your water intake goals.' },
        { title: '💧 Water Reminder', message: 'Don\'t forget to track your water intake today!' },
        { title: '🎓 Study Time', message: 'Plan your study sessions for today.' },
        { title: '⚒️ Tasks', message: 'Review your tasks for today.' },
        { title: '😴 Sleep Review', message: 'How did you sleep last night? Log it in the sleep tracker.' }
    ];
    
    notifications.forEach((notification, index) => {
        setTimeout(() => {
            showNotification(notification.title, notification.message);
        }, index * 30000); // 30 seconds apart
    });
}

function checkMealNotifications() {
    const meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    meals.forEach(meal => {
        // Check if meal time is 2 minutes from now
        const mealTime = new Date(`2000-01-01T${meal.time}`);
        const notifyTime = new Date(mealTime.getTime() - 2 * 60000); // 2 minutes before
        const notifyTimeString = notifyTime.getHours().toString().padStart(2, '0') + ':' + notifyTime.getMinutes().toString().padStart(2, '0');
        
        if (notifyTimeString === currentTime) {
            showMealNotification(meal);
        }
    });
}

function showMealNotification(meal) {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const notificationId = `meal-${meal.id}`;
    
    if (notificationTimeouts.has(notificationId)) return; // Already showing
    
    const title = `🍽️ ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} Time`;
    const message = `Time for ${meal.name} in 2 minutes!`;
    
    showNotification(title, message, notificationId);
}

function sendScreenTimeNotification() {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const screenData = JSON.parse(localStorage.getItem('lifesphere_screen')) || {};
    const goal = screenData.goal || 4;
    const todaySeconds = screenData.seconds || 0;
    const todayHours = Math.floor(todaySeconds / 3600);
    
    let message = `You used ${todayHours}h of screen time today. `;
    if (todayHours > goal) {
        message += `That's ${todayHours - goal}h over your goal of ${goal}h.`;
    } else {
        message += `Great job staying under your ${goal}h goal!`;
    }
    
    // This notification doesn't require acknowledgment
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📱 Screen Time Summary', {
            body: message,
            icon: '/icon.png'
        });
    }
}

function showNotification(title, message, notificationId = null) {
    const notificationModal = document.getElementById('notification-modal');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const acknowledgeBtn = document.getElementById('acknowledge-notification');
    const remindLaterBtn = document.getElementById('remind-later');
    
    if (notificationModal && notificationTitle && notificationMessage && acknowledgeBtn && remindLaterBtn) {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationModal.style.display = 'flex';
        
        // Clear existing timeouts for this notification
        if (notificationId && notificationTimeouts.has(notificationId)) {
            clearTimeout(notificationTimeouts.get(notificationId));
            notificationTimeouts.delete(notificationId);
        }
        
        // Set timeout to resend notification after 45 seconds if no response
        const resendTimeout = setTimeout(() => {
            notificationModal.style.display = 'none';
            // Resend after 15 seconds
            setTimeout(() => {
                showNotification(title, message, notificationId);
            }, 15000);
        }, 45000);
        
        acknowledgeBtn.onclick = function() {
            notificationModal.style.display = 'none';
            if (notificationId) {
                clearTimeout(resendTimeout);
                notificationTimeouts.delete(notificationId);
            }
        };
        
        remindLaterBtn.onclick = function() {
            notificationModal.style.display = 'none';
            if (notificationId) {
                clearTimeout(resendTimeout);
                notificationTimeouts.delete(notificationId);
                // Resend after 5 minutes
                setTimeout(() => {
                    showNotification(title, message, notificationId);
                }, 300000);
            }
        };
        
        if (notificationId) {
            notificationTimeouts.set(notificationId, resendTimeout);
        }
    }
}

// Initialize all data
function loadAllData() {
    console.log('Loading all data...');
    // Data loading is handled within individual tracker initialization
}

function initializeCharts() {
    console.log('Initializing charts...');
    const ctx = document.getElementById('weekly-chart');
    if (ctx) {
        // Create sample chart
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Water Intake (glasses)',
                    data: [6, 8, 7, 5, 8, 6, 7],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Export functions for global access
window.LifeSphere = {
    initializeApp,
    updateDashboard
};

// Make delete functions globally available
window.deleteWaterHistory = deleteWaterHistory;
window.deleteWorkout = deleteWorkout;
window.deleteMedication = deleteMedication;
window.deleteMeal = deleteMeal;
window.deleteScreenHistory = deleteScreenHistory;
window.deleteSleep = deleteSleep;
window.deleteReminder = deleteReminder;
window.completeTodo = completeTodo;
window.deleteTodo = deleteTodo;
window.deleteSubscription = deleteSubscription;
window.deleteStudySession = deleteStudySession;
window.completeHomework = completeHomework;
window.deleteHomework = deleteHomework;
window.deleteExam = deleteExam;
window.deleteGrade = deleteGrade;
