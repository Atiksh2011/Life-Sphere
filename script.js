// Global variables
let screenTimeInterval;
let screenTimeSeconds = 0;
let screenTracking = false;
let currentWeekOffset = 0;
let medicationAlarmAudio = null;
let notificationTimeouts = new Map();
let selectedCurrency = 'USD';
let backgroundNotificationInterval;

// Currency symbols mapping
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$'
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('LifeSphere initialized');
    initializeApp();
});

function initializeApp() {
    initializeNotifications();
    initializeTabNavigation();
    initializeSubtabNavigation();
    initializeWaterTracker();
    initializeWorkoutTracker();
    initializeMedicationTracker();
    initializeMealPlanner();
    initializeScreenTimeTracker();
    initializeSleepTracker();
    initializeLifeLoop();
    initializeTaskForge();
    initializeEduPlan();
    initializeSleepSchedule();
    initializeCurrency();
    loadAllData();
    initializeCharts();
    startBackgroundServices();
    startBackgroundNotificationService();
}

// Initialize background notification service
function startBackgroundNotificationService() {
    // Check for notifications every minute
    backgroundNotificationInterval = setInterval(() => {
        checkAllNotifications();
    }, 60000);
    
    // Also check immediately on load
    setTimeout(checkAllNotifications, 5000);
}

// Check all types of notifications
function checkAllNotifications() {
    checkSleepScheduleNotifications();
    checkWaterNotifications();
    checkWorkoutNotifications();
    checkMedicationNotifications();
    checkMealNotifications();
    checkScreenTimeNotifications();
    checkSleepTrackingNotifications();
    checkLifeLoopNotifications();
    checkTaskForgeNotifications();
    checkEduPlanNotifications();
    checkClassReminders();
}

// Initialize currency settings
function initializeCurrency() {
    const savedCurrency = localStorage.getItem('lifesphere_currency') || 'USD';
    selectedCurrency = savedCurrency;
    
    const currencySelect = document.getElementById('sub-currency');
    if (currencySelect) {
        currencySelect.value = selectedCurrency;
        currencySelect.addEventListener('change', function() {
            selectedCurrency = this.value;
            localStorage.setItem('lifesphere_currency', selectedCurrency);
            updateSubscriptionsDisplay();
        });
    }
}

// Get currency symbol
function getCurrencySymbol() {
    return currencySymbols[selectedCurrency] || '$';
}

// Notification System
function initializeNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('🔔 Notifications', 'LifeSphere uses beautiful custom notifications! No browser permissions needed.');
            this.textContent = 'Custom Notifications Active';
            this.disabled = true;
            localStorage.setItem('lifesphere_notifications', 'enabled');
        });
    }
    
    if (localStorage.getItem('lifesphere_notifications') === 'enabled') {
        if (notificationBtn) {
            notificationBtn.textContent = 'Custom Notifications Active';
            notificationBtn.disabled = true;
        }
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
            
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
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

// Subtab Navigation
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

// Sleep Schedule
function initializeSleepSchedule() {
    const saveBtn = document.getElementById('save-sleep-schedule');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSleepSchedule);
    }
    
    const schedule = JSON.parse(localStorage.getItem('lifesphere_sleep_schedule')) || {};
    if (schedule.wakeUpTime) {
        document.getElementById('wake-up-time').value = schedule.wakeUpTime;
    }
    if (schedule.bedtime) {
        document.getElementById('bedtime').value = schedule.bedtime;
    }
}

function saveSleepSchedule() {
    const schedule = {
        wakeUpTime: document.getElementById('wake-up-time').value,
        bedtime: document.getElementById('bedtime').value
    };
    localStorage.setItem('lifesphere_sleep_schedule', JSON.stringify(schedule));
    showNotification('Sleep Schedule Saved', 'Your sleep schedule has been saved successfully!');
}

// Water Tracker
function initializeWaterTracker() {
    let waterGoal = 8;
    let waterConsumed = 0;

    const savedData = localStorage.getItem('lifesphere_water');
    if (savedData) {
        const data = JSON.parse(savedData);
        waterGoal = data.goal || 8;
        waterConsumed = data.consumed || 0;
    }

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
        showNotification('Water Added', 'One glass of water added to your daily intake!');
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        waterConsumed = 0;
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Reset', 'Your water intake for today has been reset.');
    });

    if (addWaterBtn) addWaterBtn.addEventListener('click', () => {
        waterConsumed++;
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Added', 'One glass of water added to your daily intake!');
    });

    document.querySelectorAll('.cup').forEach(cup => {
        cup.addEventListener('click', function() {
            const cupNumber = parseInt(this.dataset.cup);
            waterConsumed = cupNumber;
            updateWaterDisplay();
            saveWaterData();
            showNotification('Water Intake Updated', `Your water intake has been set to ${cupNumber} glasses.`);
        });
    });

    function updateWaterGoal() {
        const goalElement = document.getElementById('water-goal');
        const targetElement = document.getElementById('water-target');
        
        if (goalElement) goalElement.textContent = waterGoal;
        if (targetElement) targetElement.textContent = waterGoal;
        
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Goal Updated', `Your daily water goal has been set to ${waterGoal} glasses.`);
    }

    function updateWaterDisplay() {
        const percentage = Math.min(100, (waterConsumed / waterGoal) * 100);
        
        const waterTodayElement = document.getElementById('water-today');
        const waterProgressElement = document.getElementById('water-progress');
        
        if (waterTodayElement) waterTodayElement.textContent = `${waterConsumed}/${waterGoal} glasses`;
        if (waterProgressElement) waterProgressElement.style.width = `${percentage}%`;
        
        const waterConsumedElement = document.getElementById('water-consumed');
        const waterPercentageElement = document.getElementById('water-percentage');
        const waterFillElement = document.getElementById('water-fill');
        
        if (waterConsumedElement) waterConsumedElement.textContent = waterConsumed;
        if (waterPercentageElement) waterPercentageElement.textContent = `${percentage.toFixed(0)}%`;
        if (waterFillElement) waterFillElement.style.height = `${percentage}%`;
        
        document.querySelectorAll('.cup').forEach((cup, index) => {
            if (index < waterConsumed) {
                cup.classList.add('drank');
            } else {
                cup.classList.remove('drank');
            }
        });
        
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
        
        let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        waterHistory[today] = {
            consumed: waterConsumed,
            goal: waterGoal,
            percentage: Math.min(100, (waterConsumed / waterGoal) * 100)
        };
        localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
    }

    updateWaterDisplay();
}

function deleteWaterHistory(date) {
    if (confirm('Are you sure you want to delete this water intake record?')) {
        let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        delete waterHistory[date];
        localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
        updateWaterHistory();
        showNotification('💧 Water Record', 'Water intake record deleted successfully!');
    }
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
                <td>${data.consumed}/${data.goal} glasses</td>
                <td>${data.percentage.toFixed(0)}%</td>
                <td><button class="delete-btn" onclick="deleteWaterHistory('${date}')">Delete</button></td>
            </tr>
        `;
    });
    
    if (historyBody) {
        historyBody.innerHTML = historyHTML || `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
                    No water intake history yet. Start tracking your water consumption!
                </td>
            </tr>
        `;
    }
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
    showNotification('Workout Logged', `${workout.name} has been added to your workout history!`);
}

function updateWorkoutDisplay() {
    const workouts = JSON.parse(localStorage.getItem('lifesphere_workouts')) || [];
    const workoutList = document.getElementById('workout-list');
    const period = document.getElementById('workout-period')?.value || 'all';
    
    let filteredWorkouts = workouts;
    const now = new Date();
    
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredWorkouts = workouts.filter(w => new Date(w.date) >= monthAgo);
    }
    
    const totalWorkouts = filteredWorkouts.length;
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = filteredWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    
    const totalWorkoutsElement = document.getElementById('total-workouts');
    const totalDurationElement = document.getElementById('total-duration');
    const totalCaloriesElement = document.getElementById('total-calories');
    
    if (totalWorkoutsElement) totalWorkoutsElement.textContent = totalWorkouts;
    if (totalDurationElement) totalDurationElement.textContent = `${totalDuration} min`;
    if (totalCaloriesElement) totalCaloriesElement.textContent = totalCalories;
    
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
    showNotification('Workout Deleted', 'Workout has been removed from your history.');
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
            // Create a calm and peaceful alarm sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1);
            
            setTimeout(() => {
                showNotification('Ringtone Access Granted', 'Medication alarms will now sound.');
                localStorage.setItem('lifesphere_ringtone', 'granted');
            }, 1000);
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
            
            const timesContainer = document.getElementById('med-times');
            timesContainer.innerHTML = '<input type="time" class="form-control med-time" required>';
        });
    }

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
    showNotification('Medication Added', `${medication.name} has been added to your medication list.`);
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
        
        if (med.frequency === 'once' || med.frequency === 'twice' || med.frequency === 'thrice') {
            todayMedsHTML += medElement;
        }
    });
    
    if (todayMedsList) todayMedsList.innerHTML = todayMedsHTML;
    if (medsList) medsList.innerHTML = allMedsHTML;
    
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
    showNotification('Medication Removed', 'Medication has been removed from your list.');
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
    showNotification('Meal Added', `${meal.name} has been added to your meal plan!`);
}

function updateMealDisplay() {
    const meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    const weeklyMealPlan = document.getElementById('weekly-meal-plan');
    const weekDisplay = document.getElementById('week-display');
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
    
    if (weekDisplay) {
        if (currentWeekOffset === 0) {
            weekDisplay.textContent = 'Current Week';
        } else if (currentWeekOffset < 0) {
            weekDisplay.textContent = `${Math.abs(currentWeekOffset)} week${Math.abs(currentWeekOffset) > 1 ? 's' : ''} ago`;
        } else {
            weekDisplay.textContent = `In ${currentWeekOffset} week${currentWeekOffset > 1 ? 's' : ''}`;
        }
    }
    
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
    showNotification('Meal Removed', 'Meal has been removed from your plan.');
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
                
                screenTimeInterval = setInterval(() => {
                    screenTimeSeconds++;
                    updateScreenDisplay();
                }, 1000);
                
                localStorage.setItem('lifesphere_screen_tracking', 'true');
                showNotification('Screen Time Tracking Started', 'Screen time tracking is now active.');
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
                showNotification('Screen Time Tracking Stopped', 'Screen time tracking has been paused.');
            }
        });
    }

    if (addManualBtn) {
        addManualBtn.addEventListener('click', function() {
            const minutes = prompt('Enter screen time in minutes:');
            if (minutes && !isNaN(minutes) && parseInt(minutes) > 0) {
                screenTimeSeconds += parseInt(minutes) * 60;
                updateScreenDisplay();
                saveScreenData();
                showNotification('Screen Time Added', `${minutes} minutes added to your screen time.`);
            } else {
                alert('Please enter a valid number of minutes.');
            }
        });
    }

    if (goalInput) {
        goalInput.addEventListener('change', function() {
            updateScreenDisplay();
            saveScreenData();
            showNotification('Screen Time Goal Updated', `Daily screen time goal set to ${this.value} hours.`);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset today\'s screen time?')) {
                screenTimeSeconds = 0;
                updateScreenDisplay();
                saveScreenData();
                showNotification('Screen Time Reset', 'Your screen time for today has been reset.');
            }
        });
    }

    // Load previous tracking state
    if (localStorage.getItem('lifesphere_screen_tracking') === 'true') {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        screenTracking = true;
        
        screenTimeInterval = setInterval(() => {
            screenTimeSeconds++;
            updateScreenDisplay();
        }, 1000);
    }

    loadScreenData();
}

function updateScreenDisplay() {
    const hours = Math.floor(screenTimeSeconds / 3600);
    const minutes = Math.floor((screenTimeSeconds % 3600) / 60);
    const seconds = screenTimeSeconds % 60;
    
    // Update mobile screen time display
    const mobileHoursElement = document.getElementById('mobile-hours');
    const mobileMinutesElement = document.getElementById('mobile-minutes');
    const mobileSecondsElement = document.getElementById('mobile-seconds');
    
    if (mobileHoursElement) mobileHoursElement.textContent = hours.toString().padStart(2, '0');
    if (mobileMinutesElement) mobileMinutesElement.textContent = minutes.toString().padStart(2, '0');
    if (mobileSecondsElement) mobileSecondsElement.textContent = seconds.toString().padStart(2, '0');
    
    // Update regular screen time display
    const screenTodayElement = document.getElementById('screen-today');
    if (screenTodayElement) screenTodayElement.textContent = `${hours}h ${minutes}m`;
    
    const goalHours = parseInt(document.getElementById('screen-goal')?.value || 4);
    const goalSeconds = goalHours * 3600;
    const percentage = Math.min(100, (screenTimeSeconds / goalSeconds) * 100);
    
    const screenProgressElement = document.getElementById('screen-progress');
    const screenGoalTextElement = document.getElementById('screen-goal-text');
    
    if (screenProgressElement) screenProgressElement.style.width = `${percentage}%`;
    if (screenGoalTextElement) screenGoalTextElement.textContent = `${percentage.toFixed(0)}% of daily goal`;
    
    updateScreenHistory();
}

function saveScreenData() {
    const today = new Date().toDateString();
    const screenData = {
        seconds: screenTimeSeconds,
        goal: parseInt(document.getElementById('screen-goal')?.value || 4)
    };
    
    localStorage.setItem('lifesphere_screen', JSON.stringify(screenData));
    
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
    showNotification('Screen History Deleted', 'Screen time history entry has been deleted.');
}

// Sleep Tracker
function initializeSleepTracker() {
    const sleepForm = document.getElementById('sleep-form');

    if (sleepForm) {
        sleepForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bedtime = document.getElementById('bedtime').value;
            const waketime = document.getElementById('waketime').value;
            
            const bedDate = new Date(`2000-01-01T${bedtime}`);
            const wakeDate = new Date(`2000-01-01T${waketime}`);
            
            let duration = (wakeDate - bedDate) / (1000 * 60);
            
            if (duration < 0) {
                duration += 24 * 60;
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
    showNotification('Sleep Logged', 'Your sleep has been recorded successfully!');
}

function updateSleepDisplay() {
    const sleeps = JSON.parse(localStorage.getItem('lifesphere_sleep')) || [];
    const sleepHistoryList = document.getElementById('sleep-history-list');
    
    if (sleeps.length > 0) {
        const lastSleep = sleeps[sleeps.length - 1];
        const hours = Math.floor(lastSleep.duration / 60);
        const minutes = lastSleep.duration % 60;
        const sleepLastElement = document.getElementById('sleep-last');
        if (sleepLastElement) sleepLastElement.textContent = `${hours}h ${minutes}m`;
    }
    
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
    
    if (sleeps.length > 0) {
        const totalDuration = sleeps.reduce((sum, sleep) => sum + sleep.duration, 0);
        const avgDuration = totalDuration / sleeps.length;
        const avgHours = Math.floor(avgDuration / 60);
        const avgMinutes = Math.round(avgDuration % 60);
        
        const avgSleepElement = document.getElementById('avg-sleep');
        if (avgSleepElement) avgSleepElement.textContent = `${avgHours}h ${avgMinutes}m`;
        
        const uniqueDates = new Set(sleeps.map(s => s.date));
        const consistency = (uniqueDates.size / 7) * 100;
        const sleepConsistencyElement = document.getElementById('sleep-consistency');
        if (sleepConsistencyElement) sleepConsistencyElement.textContent = `${Math.min(100, consistency).toFixed(0)}%`;
        
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
    showNotification('Sleep Entry Deleted', 'Sleep record has been removed.');
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
    showNotification('Reminder Added', `${reminder.name} has been added to your reminders!`);
}

function updateLifeLoopDisplay() {
    const reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    const upcomingReminders = document.getElementById('upcoming-reminders');
    const allReminders = document.getElementById('all-reminders');
    
    reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const now = new Date();
    const upcoming = reminders.filter(r => new Date(r.date) >= now);
    const past = reminders.filter(r => new Date(r.date) < now);
    
    let upcomingHTML = '';
    let allHTML = '';
    
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
    showNotification('Reminder Deleted', 'Reminder has been removed.');
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
    showNotification('Task Added', 'New task has been added to your to-do list!');
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
        showNotification('Task Completed', 'Task marked as completed! Great job!');
    }
}

function deleteTodo(id) {
    let todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('lifesphere_todos', JSON.stringify(todos));
    updateTaskForgeDisplay();
    updateDashboard();
    showNotification('Task Deleted', 'Task has been removed from your list.');
}

function saveSubscription(subscription) {
    let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    subscriptions.push(subscription);
    localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
    
    updateTaskForgeDisplay();
    showNotification('Subscription Added', `${subscription.name} has been added to your subscriptions!`);
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
                <td>${getCurrencySymbol()}${sub.price.toFixed(2)}</td>
                <td>${renewalDate.toLocaleDateString()}</td>
                <td><span class="status-badge ${status}">${statusText}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteSubscription(${sub.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    if (subscriptionsBody) {
        subscriptionsBody.innerHTML = subscriptionsHTML || `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                    No subscriptions yet. Add your first subscription using the form above.
                </td>
            </tr>
        `;
    }
    
    if (totalSubs) totalSubs.textContent = `${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}`;
    if (monthlyCost) monthlyCost.textContent = `${getCurrencySymbol()}${totalMonthly.toFixed(2)}/month`;
}

function deleteSubscription(id) {
    if (confirm('Are you sure you want to delete this subscription?')) {
        let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
        updateSubscriptionsDisplay();
        showNotification('💰 Subscription', 'Subscription deleted successfully!');
    }
}

// EduPlan - FIXED TIMETABLE TO SHOW 0 VALUES WHEN NO DATA
function initializeEduPlan() {
    initializeTimetable();
    initializeGradeForm();
    
    const studyForm = document.getElementById('study-form');
    const homeworkForm = document.getElementById('homework-form');
    const examForm = document.getElementById('exam-form');
    
    const showStudyHistoryBtn = document.getElementById('show-study-history');
    const closeStudyHistoryBtn = document.getElementById('close-study-history');
    const studyHistoryPopup = document.getElementById('study-history-popup');
    
    if (showStudyHistoryBtn) {
        showStudyHistoryBtn.addEventListener('click', function() {
            studyHistoryPopup.style.display = 'flex';
            updateStudyTrackerDisplay();
        });
    }
    
    if (closeStudyHistoryBtn) {
        closeStudyHistoryBtn.addEventListener('click', function() {
            studyHistoryPopup.style.display = 'none';
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
    
    // Update EduPlan display on initialization
    updateEduPlanDisplay();
}

// Timetable functionality - FIXED TO SHOW 0 WHEN NO DATA
function initializeTimetable() {
    const timetableForm = document.getElementById('timetable-form');
    const addClassBtn = document.getElementById('add-class-btn');
    const viewTimetableBtn = document.getElementById('view-timetable-btn');
    const backToAddClassBtn = document.getElementById('back-to-add-class');
    const refreshTimetableBtn = document.getElementById('refresh-timetable');
    const clearFormBtn = document.getElementById('clear-form');
    const addClassSection = document.getElementById('add-class-section');
    const timetableDisplaySection = document.getElementById('timetable-display-section');

    // Set current time as default for course time
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const timeInput = document.getElementById('course-time');
    if (timeInput) timeInput.value = currentTime;

    // Initialize empty courses if not exists
    if (!localStorage.getItem('lifesphere_courses')) {
        localStorage.setItem('lifesphere_courses', JSON.stringify([]));
    }

    // Add class button
    if (addClassBtn) {
        addClassBtn.addEventListener('click', function() {
            addClassSection.style.display = 'block';
            timetableDisplaySection.style.display = 'none';
        });
    }

    // View timetable button
    if (viewTimetableBtn) {
        viewTimetableBtn.addEventListener('click', function() {
            const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
            if (courses.length === 0) {
                showNotification('Timetable', 'No classes added yet. Please add some classes first.');
                addClassSection.style.display = 'block';
                timetableDisplaySection.style.display = 'none';
                return;
            }
            addClassSection.style.display = 'none';
            timetableDisplaySection.style.display = 'block';
            updateTimetableDisplay();
        });
    }

    // Back to add class button
    if (backToAddClassBtn) {
        backToAddClassBtn.addEventListener('click', function() {
            timetableDisplaySection.style.display = 'none';
            addClassSection.style.display = 'block';
        });
    }

    // Refresh timetable button
    if (refreshTimetableBtn) {
        refreshTimetableBtn.addEventListener('click', function() {
            updateTimetableDisplay();
            showNotification('Timetable', 'Timetable refreshed successfully!');
        });
    }

    // Clear form button
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            timetableForm.reset();
            // Reset time to current time
            const timeInput = document.getElementById('course-time');
            if (timeInput) timeInput.value = currentTime;
            showNotification('Form Cleared', 'All form fields have been reset.');
        });
    }

    // Form submission
    if (timetableForm) {
        timetableForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const courseName = document.getElementById('course-name').value.trim();
            const courseCode = document.getElementById('course-code').value.trim();
            const courseDay = document.getElementById('course-day').value;
            const courseTime = document.getElementById('course-time').value;
            const courseDuration = parseInt(document.getElementById('course-duration').value);
            const courseLocation = document.getElementById('course-location').value.trim();
            const courseInstructor = document.getElementById('course-instructor').value.trim();
            
            if (!courseName) {
                showNotification('Error', 'Please enter a course name.');
                return;
            }
            
            if (!courseDay) {
                showNotification('Error', 'Please select a day.');
                return;
            }
            
            if (!courseTime) {
                showNotification('Error', 'Please select a time.');
                return;
            }
            
            if (!courseDuration || courseDuration < 15) {
                showNotification('Error', 'Please enter a valid duration (minimum 15 minutes).');
                return;
            }

            // Determine course category based on name
            const category = determineCourseCategory(courseName);
            
            const course = {
                id: Date.now(),
                name: courseName,
                code: courseCode,
                day: courseDay,
                time: courseTime,
                duration: courseDuration,
                location: courseLocation,
                instructor: courseInstructor,
                category: category,
                created: new Date().toISOString()
            };
            
            saveCourse(course);
            this.reset();
            // Reset time to current time
            const timeInput = document.getElementById('course-time');
            if (timeInput) timeInput.value = currentTime;
            showNotification('Course Added', `${course.name} has been added to your timetable!`);
            
            // Auto-switch to timetable view
            addClassSection.style.display = 'none';
            timetableDisplaySection.style.display = 'block';
            updateTimetableDisplay();
        });
    }

    // Load existing courses on page load - FIXED: Initialize with 0 values
    updateTimetableStats();
}

function determineCourseCategory(courseName) {
    const name = courseName.toLowerCase();
    
    if (name.includes('math') || name.includes('calculus') || name.includes('algebra') || 
        name.includes('physics') || name.includes('chemistry') || name.includes('biology')) {
        return 'math';
    } else if (name.includes('programming') || name.includes('computer') || name.includes('coding') ||
               name.includes('software') || name.includes('web') || name.includes('data')) {
        return 'technology';
    } else if (name.includes('english') || name.includes('language') || name.includes('spanish') ||
               name.includes('french') || name.includes('german') || name.includes('literature')) {
        return 'language';
    } else if (name.includes('art') || name.includes('music') || name.includes('drama') ||
               name.includes('design') || name.includes('drawing') || name.includes('painting')) {
        return 'arts';
    } else if (name.includes('sport') || name.includes('physical') || name.includes('health') ||
               name.includes('gym') || name.includes('exercise') || name.includes('yoga')) {
        return 'sports';
    } else if (name.includes('science') || name.includes('technology') || name.includes('engineering')) {
        return 'science';
    } else {
        return 'other';
    }
}

function updateTimetableDisplay() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const timetableView = document.getElementById('timetable-view');
    
    if (!timetableView) return;
    
    let timetableHTML = '';
    
    if (courses.length === 0) {
        timetableHTML = `
            <div class="empty-state">
                <p>No classes added yet</p>
                <small>Add your first class using the form above</small>
            </div>
        `;
    } else {
        // Generate time slots from 8:00 AM to 8:00 PM
        const timeSlots = generateTimeSlots();
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        timetableHTML = '<div class="timetable-grid">';
        
        // Header row
        timetableHTML += '<div class="timetable-header-cell time-header">Time</div>';
        dayNames.forEach(day => {
            timetableHTML += `<div class="timetable-header-cell">${day}</div>`;
        });
        
        // Time slots and classes
        timeSlots.forEach(timeSlot => {
            const timeDisplay = formatTimeDisplay(timeSlot);
            timetableHTML += `<div class="timetable-time-cell">${timeDisplay}</div>`;
            
            days.forEach(day => {
                const cellCourses = courses.filter(course => 
                    course.day === day && isCourseInTimeSlot(course, timeSlot)
                );
                
                timetableHTML += `<div class="timetable-cell">`;
                
                if (cellCourses.length > 0) {
                    cellCourses.forEach(course => {
                        const endTime = calculateEndTime(course.time, course.duration);
                        timetableHTML += `
                            <div class="course-block ${course.category}" data-course-id="${course.id}">
                                <div class="course-block-content">
                                    <div class="course-name">${course.name}</div>
                                    <div class="course-details">${course.time} - ${endTime}</div>
                                    ${course.location ? `<div class="course-location">${course.location}</div>` : ''}
                                    ${course.instructor ? `<div class="course-instructor">${course.instructor}</div>` : ''}
                                </div>
                                <div class="course-actions">
                                    <button class="delete-course-btn" onclick="deleteCourse(${course.id})" title="Delete Course">✕</button>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    timetableHTML += '<div class="timetable-empty"></div>';
                }
                
                timetableHTML += `</div>`;
            });
        });
        
        timetableHTML += '</div>';
    }
    
    timetableView.innerHTML = timetableHTML;
    updateTimetableStats();
}

function generateTimeSlots() {
    const timeSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 20) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }
    return timeSlots;
}

function formatTimeDisplay(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function isCourseInTimeSlot(course, timeSlot) {
    const courseStartTime = course.time;
    const courseEndTime = calculateEndTime(course.time, course.duration);
    
    const slotMinutes = timeToMinutes(timeSlot);
    const courseStartMinutes = timeToMinutes(courseStartTime);
    const courseEndMinutes = timeToMinutes(courseEndTime);
    
    return slotMinutes >= courseStartMinutes && slotMinutes < courseEndMinutes;
}

function calculateEndTime(startTime, duration) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    courses.push(course);
    localStorage.setItem('lifesphere_courses', JSON.stringify(courses));
    
    updateTimetableStats();
    
    // Schedule class reminder notification
    scheduleClassReminder(course);
}

// FIXED TIMETABLE STATS TO SHOW 0 WHEN NO DATA
function updateTimetableStats() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const totalClassesElement = document.getElementById('total-classes');
    const weeklyHoursElement = document.getElementById('weekly-hours');
    const todayClassesElement = document.getElementById('today-classes');
    
    // Total classes - FIXED: Show 0 when no data
    if (totalClassesElement) {
        totalClassesElement.textContent = courses.length;
    }
    
    // Weekly hours - FIXED: Show 0 when no data
    const totalMinutes = courses.reduce((sum, course) => sum + course.duration, 0);
    const weeklyHours = Math.floor(totalMinutes / 60);
    const weeklyMinutes = totalMinutes % 60;
    
    if (weeklyHoursElement) {
        weeklyHoursElement.textContent = `${weeklyHours}h ${weeklyMinutes}m`;
    }
    
    // Today's classes - FIXED: Show 0 when no data
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayCourses = courses.filter(course => course.day === today);
    
    if (todayClassesElement) {
        todayClassesElement.textContent = todayCourses.length;
    }
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course from your timetable?')) {
        let courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
        courses = courses.filter(c => c.id !== id);
        localStorage.setItem('lifesphere_courses', JSON.stringify(courses));
        updateTimetableDisplay();
        showNotification('Course Deleted', 'Course has been removed from your timetable.');
    }
}

// Schedule class reminder notifications
function scheduleClassReminder(course) {
    console.log(`Scheduled reminder for ${course.name} on ${course.day} at ${course.time}`);
}

// Class reminder notification check - FIXED TO WORK PROPERLY
function checkClassReminders() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    courses.forEach(course => {
        if (course.day === today) {
            // Check if class starts in 30 minutes
            const courseStartMinutes = timeToMinutes(course.time);
            const currentTimeMinutes = timeToMinutes(currentTime);
            const timeDifference = courseStartMinutes - currentTimeMinutes;
            
            if (timeDifference === 30) {
                showNotification('📅 Class Reminder', 
                    `You have ${course.name} class in 30 minutes at ${course.location || 'your usual location'}.`);
            }
            
            // Check if class starts in 10 minutes
            if (timeDifference === 10) {
                showNotification('📅 Class Starting Soon', 
                    `You have ${course.name} class in 10 minutes!`);
            }
        }
    });
}

// Make deleteCourse function globally available
window.deleteCourse = deleteCourse;

// Rest of EduPlan functions
function initializeGradeForm() {
    const gradeForm = document.getElementById('grade-form');
    if (gradeForm) {
        gradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const grade = {
                id: Date.now(),
                subject: document.getElementById('grade-subject').value,
                assignment: document.getElementById('grade-assignment').value,
                score: parseFloat(document.getElementById('grade-score').value),
                total: parseFloat(document.getElementById('grade-total').value),
                weight: parseFloat(document.getElementById('grade-weight').value),
                date: document.getElementById('grade-date').value,
                created: new Date().toISOString()
            };
            
            saveGrade(grade);
            this.reset();
        });
    }
}

function saveStudySession(session) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions.push(session);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    
    updateEduPlanDisplay();
    showNotification('Study Session Started', `Study session for ${session.subject} has been logged!`);
}

function saveHomework(homework) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homework')) || [];
    homeworks.push(homework);
    localStorage.setItem('lifesphere_homework', JSON.stringify(homeworks));
    
    updateEduPlanDisplay();
    showNotification('Homework Added', `${homework.task} has been added to your homework list!`);
}

function saveExam(exam) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams.push(exam);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    
    updateEduPlanDisplay();
    showNotification('Exam Added', `${exam.subject} ${exam.type} has been added to your exam schedule!`);
}

function saveGrade(grade) {
    let grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    grades.push(grade);
    localStorage.setItem('lifesphere_grades', JSON.stringify(grades));
    
    updateEduPlanDisplay();
    showNotification('Grade Added', `Grade for ${grade.assignment} has been recorded!`);
}

function updateEduPlanDisplay() {
    updateStudyTrackerDisplay();
    updateHomeworkDisplay();
    updateExamDisplay();
    updateGradeDisplay();
}

function updateStudyTrackerDisplay() {
    const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    const studyHistoryBody = document.getElementById('study-history-body');
    
    let historyHTML = '';
    
    studySessions.slice(-10).reverse().forEach(session => {
        const startTime = new Date(session.startTime);
        const date = startTime.toLocaleDateString();
        const time = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        historyHTML += `
            <div class="study-session-item">
                <div class="study-session-info">
                    <div class="study-session-header">
                        <strong>${session.subject}</strong>
                        <span class="study-duration">${session.duration} min</span>
                    </div>
                    <div class="study-session-details">
                        <span>Topic: ${session.topic}</span>
                        <span>${date} at ${time}</span>
                    </div>
                    ${session.goal ? `<div class="study-goal">Goal: ${session.goal}</div>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteStudySession(${session.id})">Delete</button>
            </div>
        `;
    });
    
    if (studyHistoryBody) {
        studyHistoryBody.innerHTML = historyHTML || `
            <div class="empty-state">
                <p>No study sessions yet</p>
                <small>Start a study session to see your history here</small>
            </div>
        `;
    }
    
    const totalStudyTime = studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalStudyHours = Math.floor(totalStudyTime / 60);
    const totalStudyMinutes = totalStudyTime % 60;
    
    const totalStudyElement = document.getElementById('total-study-time');
    if (totalStudyElement) {
        totalStudyElement.textContent = `${totalStudyHours}h ${totalStudyMinutes}m`;
    }
}

function deleteStudySession(id) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions = studySessions.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    updateStudyTrackerDisplay();
    showNotification('Study Session Deleted', 'Study session has been removed from your history.');
}

function updateHomeworkDisplay() {
    const homeworks = JSON.parse(localStorage.getItem('lifesphere_homework')) || [];
    const homeworkList = document.getElementById('homework-list');
    
    let homeworkHTML = '';
    
    homeworks.filter(h => !h.completed).forEach(homework => {
        const dueDate = new Date(homework.due);
        const now = new Date();
        const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil <= 1 ? 'urgent' : daysUntil <= 3 ? 'soon' : 'normal';
        
        homeworkHTML += `
            <div class="homework-item ${urgency}">
                <div class="homework-info">
                    <div class="homework-header">
                        <strong>${homework.subject}</strong>
                        <span class="homework-priority priority-${homework.priority}">${homework.priority}</span>
                    </div>
                    <div class="homework-task">${homework.task}</div>
                    <div class="homework-details">
                        <span>Due: ${dueDate.toLocaleDateString()}</span>
                        <span>Estimate: ${homework.estimate} min</span>
                        <span class="due-in">Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="homework-actions">
                    <button class="btn-complete" onclick="completeHomework(${homework.id})">✓</button>
                    <button class="delete-btn" onclick="deleteHomework(${homework.id})">✕</button>
                </div>
            </div>
        `;
    });
    
    if (homeworkList) {
        homeworkList.innerHTML = homeworkHTML || `
            <div class="empty-state">
                <p>No pending homework</p>
                <small>All caught up! Add new homework assignments when you get them.</small>
            </div>
        `;
    }
}

function completeHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homework')) || [];
    const homeworkIndex = homeworks.findIndex(h => h.id === id);
    
    if (homeworkIndex !== -1) {
        homeworks[homeworkIndex].completed = true;
        localStorage.setItem('lifesphere_homework', JSON.stringify(homeworks));
        updateHomeworkDisplay();
        showNotification('Homework Completed', 'Homework marked as completed! Great job!');
    }
}

function deleteHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homework')) || [];
    homeworks = homeworks.filter(h => h.id !== id);
    localStorage.setItem('lifesphere_homework', JSON.stringify(homeworks));
    updateHomeworkDisplay();
    showNotification('Homework Deleted', 'Homework has been removed from your list.');
}

function updateExamDisplay() {
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const examList = document.getElementById('exam-list');
    
    let examHTML = '';
    
    exams.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(exam => {
        const examDate = new Date(exam.date);
        const now = new Date();
        const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil <= 7 ? 'urgent' : daysUntil <= 14 ? 'soon' : 'normal';
        
        examHTML += `
            <div class="exam-item ${urgency}">
                <div class="exam-info">
                    <div class="exam-header">
                        <strong>${exam.subject} - ${exam.type}</strong>
                        <span class="exam-date">${examDate.toLocaleDateString()}</span>
                    </div>
                    <div class="exam-details">
                        <span>Time: ${exam.time}</span>
                        ${exam.location ? `<span>Location: ${exam.location}</span>` : ''}
                        ${exam.duration ? `<span>Duration: ${exam.duration} min</span>` : ''}
                        <span class="days-until">${daysUntil} day${daysUntil !== 1 ? 's' : ''} until exam</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteExam(${exam.id})">Delete</button>
            </div>
        `;
    });
    
    if (examList) {
        examList.innerHTML = examHTML || `
            <div class="empty-state">
                <p>No exams scheduled</p>
                <small>Add your upcoming exams to see them here</small>
            </div>
        `;
    }
}

function deleteExam(id) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams = exams.filter(e => e.id !== id);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    updateExamDisplay();
    showNotification('Exam Deleted', 'Exam has been removed from your schedule.');
}

function updateGradeDisplay() {
    const grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    const gradeList = document.getElementById('grade-list');
    
    let gradeHTML = '';
    
    // Calculate average grade
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    grades.forEach(grade => {
        const percentage = (grade.score / grade.total) * 100;
        const weightedScore = percentage * (grade.weight / 100);
        
        totalWeightedScore += weightedScore;
        totalWeight += grade.weight;
    });
    
    const averageGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
    
    const averageGradeElement = document.getElementById('average-grade');
    if (averageGradeElement) {
        averageGradeElement.textContent = `${averageGrade.toFixed(1)}%`;
    }
    
    grades.slice(-10).reverse().forEach(grade => {
        const percentage = (grade.score / grade.total) * 100;
        const gradeDate = new Date(grade.date).toLocaleDateString();
        
        gradeHTML += `
            <div class="grade-item">
                <div class="grade-info">
                    <div class="grade-header">
                        <strong>${grade.subject}</strong>
                        <span class="grade-percentage">${percentage.toFixed(1)}%</span>
                    </div>
                    <div class="grade-details">
                        <span>${grade.assignment}</span>
                        <span>${grade.score}/${grade.total}</span>
                        <span>Weight: ${grade.weight}%</span>
                        <span>${gradeDate}</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteGrade(${grade.id})">Delete</button>
            </div>
        `;
    });
    
    if (gradeList) {
        gradeList.innerHTML = gradeHTML || `
            <div class="empty-state">
                <p>No grades recorded</p>
                <small>Add your grades to track your academic performance</small>
            </div>
        `;
    }
}

function deleteGrade(id) {
    let grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    grades = grades.filter(g => g.id !== id);
    localStorage.setItem('lifesphere_grades', JSON.stringify(grades));
    updateGradeDisplay();
    showNotification('Grade Deleted', 'Grade has been removed from your records.');
}

// Notification functions
function showNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress"></div>
    `;
    
    // Add to notification container
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Load all data
function loadAllData() {
    updateDashboard();
    updateWaterDisplay();
    updateWorkoutDisplay();
    updateMedicationDisplay();
    updateMealDisplay();
    updateScreenDisplay();
    updateSleepDisplay();
    updateLifeLoopDisplay();
    updateTaskForgeDisplay();
    updateEduPlanDisplay();
}

// Initialize charts
function initializeCharts() {
    // Chart initialization would go here
    console.log('Charts initialized');
}

// Start background services
function startBackgroundServices() {
    console.log('Background services started');
}

// Make functions globally available
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

// Placeholder functions for notification checks
function checkSleepScheduleNotifications() {
    // Implementation for sleep schedule notifications
}

function checkWaterNotifications() {
    // Implementation for water notifications
}

function checkWorkoutNotifications() {
    // Implementation for workout notifications
}

function checkMedicationNotifications() {
    // Implementation for medication notifications
}

function checkMealNotifications() {
    // Implementation for meal notifications
}

function checkScreenTimeNotifications() {
    // Implementation for screen time notifications
}

function checkSleepTrackingNotifications() {
    // Implementation for sleep tracking notifications
}

function checkLifeLoopNotifications() {
    // Implementation for life loop notifications
}

function checkTaskForgeNotifications() {
    // Implementation for task forge notifications
}

function checkEduPlanNotifications() {
    // Implementation for edu plan notifications
}

// Update dashboard
function updateDashboard() {
    // Update dashboard with latest data from all trackers
    console.log('Dashboard updated');
}
