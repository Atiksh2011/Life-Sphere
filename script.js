// Global variables
let screenTimeInterval;
let screenTimeSeconds = 0;
let screenTracking = false;
let currentWeekOffset = 0;
let medicationAlarmAudio = null;
let notificationTimeouts = new Map();
let selectedCurrency = 'USD';

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
            if ('Notification' in window) {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        showNotification('Notifications Enabled', 'You will receive reminders for your goals.', 'success');
                        this.textContent = 'Notifications Enabled';
                        this.disabled = true;
                        localStorage.setItem('lifesphere_notifications', 'enabled');
                    } else {
                        showNotification('Notifications Disabled', 'You can enable them later in your browser settings.', 'info');
                    }
                }.bind(this));
            } else {
                showNotification('Browser Not Supported', 'This browser does not support notifications.', 'warning');
            }
        });
    }
    
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
    showNotification('Sleep Schedule Saved', 'Your sleep schedule has been saved successfully!', 'success');
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
        showNotification('Water Added', 'One glass of water added to your daily intake!', 'success');
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        waterConsumed = 0;
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Reset', 'Your water intake for today has been reset.', 'info');
    });

    if (addWaterBtn) addWaterBtn.addEventListener('click', () => {
        waterConsumed++;
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Added', 'One glass of water added to your daily intake!', 'success');
    });

    document.querySelectorAll('.cup').forEach(cup => {
        cup.addEventListener('click', function() {
            const cupNumber = parseInt(this.dataset.cup);
            waterConsumed = cupNumber;
            updateWaterDisplay();
            saveWaterData();
            showNotification('Water Intake Updated', `Your water intake has been set to ${cupNumber} glasses.`, 'success');
        });
    });

    function updateWaterGoal() {
        const goalElement = document.getElementById('water-goal');
        const targetElement = document.getElementById('water-target');
        
        if (goalElement) goalElement.textContent = waterGoal;
        if (targetElement) targetElement.textContent = waterGoal;
        
        updateWaterDisplay();
        saveWaterData();
        showNotification('Water Goal Updated', `Your daily water goal has been set to ${waterGoal} glasses.`, 'success');
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

    updateWaterDisplay();
}

function deleteWaterHistory(date) {
    let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
    delete waterHistory[date];
    localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
    updateWaterHistory();
    showNotification('History Deleted', 'Water history entry has been deleted.', 'info');
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
    showNotification('Workout Logged', `${workout.name} has been added to your workout history!`, 'success');
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
    showNotification('Workout Deleted', 'Workout has been removed from your history.', 'info');
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
                showNotification('Ringtone Access Granted', 'Medication alarms will now sound.', 'success');
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
    showNotification('Medication Added', `${medication.name} has been added to your medication list.`, 'success');
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
    showNotification('Medication Removed', 'Medication has been removed from your list.', 'info');
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
    showNotification('Meal Added', `${meal.name} has been added to your meal plan!`, 'success');
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
    showNotification('Meal Removed', 'Meal has been removed from your plan.', 'info');
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
                showNotification('Screen Time Tracking Started', 'Screen time tracking is now active.', 'success');
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
                showNotification('Screen Time Tracking Stopped', 'Screen time tracking has been paused.', 'info');
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
                showNotification('Screen Time Added', `${minutes} minutes added to your screen time.`, 'success');
            }
        });
    }

    if (goalInput) {
        goalInput.addEventListener('change', function() {
            updateScreenDisplay();
            saveScreenData();
            showNotification('Screen Time Goal Updated', `Daily screen time goal set to ${this.value} hours.`, 'success');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            screenTimeSeconds = 0;
            updateScreenDisplay();
            saveScreenData();
            showNotification('Screen Time Reset', 'Your screen time for today has been reset.', 'info');
        });
    }

    if (localStorage.getItem('lifesphere_screen_tracking') === 'true') {
        startBtn.click();
    }

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
    showNotification('Screen History Deleted', 'Screen time history entry has been deleted.', 'info');
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
    showNotification('Sleep Logged', 'Your sleep has been recorded successfully!', 'success');
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
    showNotification('Sleep Entry Deleted', 'Sleep record has been removed.', 'info');
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
    showNotification('Reminder Added', `${reminder.name} has been added to your reminders!`, 'success');
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
    showNotification('Reminder Deleted', 'Reminder has been removed.', 'info');
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
    showNotification('Task Added', 'New task has been added to your to-do list!', 'success');
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
        showNotification('Task Completed', 'Task marked as completed! Great job!', 'success');
    }
}

function deleteTodo(id) {
    let todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('lifesphere_todos', JSON.stringify(todos));
    updateTaskForgeDisplay();
    updateDashboard();
    showNotification('Task Deleted', 'Task has been removed from your list.', 'info');
}

function saveSubscription(subscription) {
    let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    subscriptions.push(subscription);
    localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
    
    updateTaskForgeDisplay();
    showNotification('Subscription Added', `${subscription.name} has been added to your subscriptions!`, 'success');
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
    
    if (subscriptionsBody) subscriptionsBody.innerHTML = subscriptionsHTML || '<tr><td colspan="6">No subscriptions</td></tr>';
    if (totalSubs) totalSubs.textContent = `${subscriptions.length} subscriptions`;
    if (monthlyCost) monthlyCost.textContent = `${getCurrencySymbol()}${totalMonthly.toFixed(2)}/month`;
}

function deleteSubscription(id) {
    let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    subscriptions = subscriptions.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
    updateTaskForgeDisplay();
    showNotification('Subscription Removed', 'Subscription has been deleted.', 'info');
}

// EduPlan
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
}

// Timetable functionality
function initializeTimetable() {
    const timetableForm = document.getElementById('timetable-form');
    const viewTimetableBtn = document.getElementById('view-timetable-btn');
    const backToAddClassBtn = document.getElementById('back-to-add-class');
    const addClassSection = document.getElementById('add-class-section');
    const timetableDisplaySection = document.getElementById('timetable-display-section');

    if (viewTimetableBtn) {
        viewTimetableBtn.addEventListener('click', function() {
            addClassSection.style.display = 'none';
            timetableDisplaySection.style.display = 'block';
            updateTimetableDisplay();
        });
    }

    if (backToAddClassBtn) {
        backToAddClassBtn.addEventListener('click', function() {
            timetableDisplaySection.style.display = 'none';
            addClassSection.style.display = 'block';
        });
    }

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
            showNotification('Course Added', `${course.name} has been added to your timetable!`, 'success');
        });
    }
}

function updateTimetableDisplay() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const timetableView = document.getElementById('timetable-view');
    
    if (!timetableView) return;
    
    let timetableHTML = '';
    
    if (courses.length === 0) {
        timetableHTML = '<div class="empty-state"><p>No courses added yet. Add some courses to see your timetable.</p></div>';
    } else {
        const timeSlots = generateDynamicTimeSlots(courses);
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        timetableHTML = '<div class="timetable-grid">';
        
        timetableHTML += '<div class="timetable-header-cell time-header">Time</div>';
        dayNames.forEach(day => {
            timetableHTML += `<div class="timetable-header-cell">${day}</div>`;
        });
        
        timeSlots.forEach(timeSlot => {
            timetableHTML += `<div class="timetable-time-cell">${timeSlot}</div>`;
            
            days.forEach(day => {
                const cellCourses = courses.filter(course => 
                    course.day === day && isCourseInTimeSlot(course, timeSlot)
                );
                
                timetableHTML += `<div class="timetable-cell">`;
                
                if (cellCourses.length > 0) {
                    cellCourses.forEach(course => {
                        const endTime = calculateEndTime(course.time, course.duration);
                        timetableHTML += `
                            <div class="course-block" data-course-id="${course.id}">
                                <div class="course-block-content">
                                    <div class="course-name">${course.name}</div>
                                    <div class="course-details">${course.time} - ${endTime}</div>
                                    ${course.location ? `<div class="course-location">${course.location}</div>` : ''}
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
}

function generateDynamicTimeSlots(courses) {
    const allTimes = new Set();
    
    courses.forEach(course => {
        const startTime = course.time;
        const endTime = calculateEndTime(course.time, course.duration);
        
        allTimes.add(startTime);
        allTimes.add(endTime);
        
        // Add intermediate times if needed for better visualization
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;
        
        if (duration > 60) {
            const midTime = minutesToTime(startMinutes + Math.floor(duration / 2));
            allTimes.add(midTime);
        }
    });
    
    // Convert to array and sort
    const timeArray = Array.from(allTimes).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    
    // Fill gaps if there are large time gaps
    const filledTimes = [];
    for (let i = 0; i < timeArray.length - 1; i++) {
        filledTimes.push(timeArray[i]);
        const currentTime = timeToMinutes(timeArray[i]);
        const nextTime = timeToMinutes(timeArray[i + 1]);
        
        // If gap is more than 60 minutes, add an intermediate time
        if (nextTime - currentTime > 60) {
            const midTime = minutesToTime(currentTime + 60);
            filledTimes.push(midTime);
        }
    }
    filledTimes.push(timeArray[timeArray.length - 1]);
    
    return filledTimes.length > 0 ? filledTimes : ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
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
    
    updateEduPlanDisplay();
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        let courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
        courses = courses.filter(c => c.id !== id);
        localStorage.setItem('lifesphere_courses', JSON.stringify(courses));
        updateTimetableDisplay();
        showNotification('Course Deleted', 'Course has been removed from your timetable.', 'info');
    }
}

function saveStudySession(session) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions.push(session);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    
    updateEduPlanDisplay();
    showNotification('Study Session Started', `${session.subject} study session has been logged!`, 'success');
}

function saveHomework(homework) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks.push(homework);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    
    updateEduPlanDisplay();
    showNotification('Homework Added', `${homework.subject} homework has been added!`, 'success');
}

function saveExam(exam) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams.push(exam);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    
    updateEduPlanDisplay();
    showNotification('Exam Added', `${exam.subject} exam has been scheduled!`, 'success');
}

function updateEduPlanDisplay() {
    updateTimetableDisplay();
    updateStudyTrackerDisplay();
    updateHomeworkDisplay();
    updateExamsDisplay();
    updateGradesDisplay();
}

function updateStudyTrackerDisplay() {
    const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    const studySessionsBody = document.getElementById('study-sessions-body');
    const studyTodayQuick = document.getElementById('study-today-quick');
    const studyWeekQuick = document.getElementById('study-week-quick');
    const studyToday = document.getElementById('study-today');
    const studyWeek = document.getElementById('study-week');
    const studyTotal = document.getElementById('study-total');
    
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
    showNotification('Study Session Deleted', 'Study session has been removed.', 'info');
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
        showNotification('Homework Completed', 'Homework marked as completed! Great job!', 'success');
    }
}

function deleteHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks = homeworks.filter(h => h.id !== id);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    updateHomeworkDisplay();
    showNotification('Homework Deleted', 'Homework has been removed.', 'info');
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
    showNotification('Exam Deleted', 'Exam has been removed from your schedule.', 'info');
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
    showNotification('Grade Added', `${grade.subject} grade has been recorded!`, 'success');
}

function updateGradesDisplay() {
    const grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    const gradesBody = document.getElementById('grades-body');
    const currentGpa = document.getElementById('current-gpa');
    
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
}

function calculateGPA(grades) {
    if (grades.length === 0) return 0;
    
    const totalPercentage = grades.reduce((sum, grade) => {
        return sum + ((grade.score / grade.max) * 100);
    }, 0);
    
    const averagePercentage = totalPercentage / grades.length;
    
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
    showNotification('Grade Deleted', 'Grade has been removed from your records.', 'info');
}

// Dashboard
function updateDashboard() {
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
    setInterval(checkMedicationAlarms, 60000);
    setInterval(checkScheduledNotifications, 60000);
    setInterval(checkTaskReminders, 60000);
    setInterval(checkWaterReminders, 60000);
    setInterval(checkScreenTimeReminders, 60000);
    setInterval(checkLifeLoopReminders, 60000);
    setInterval(checkEduPlanReminders, 60000);
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
    
    // Create a calm and peaceful alarm sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.5);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
    
    const alarmModal = document.getElementById('medication-alarm');
    const alarmMessage = document.getElementById('alarm-message');
    const stopAlarmBtn = document.getElementById('stop-alarm');
    
    if (alarmModal && alarmMessage && stopAlarmBtn) {
        alarmMessage.textContent = `Time to take ${medication.name} - ${medication.dosage}`;
        alarmModal.style.display = 'flex';
        
        stopAlarmBtn.onclick = function() {
            alarmModal.style.display = 'none';
        };
    }
    
    // Show browser notification if available
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeSphere says', {
            body: `Time to take ${medication.name} - ${medication.dosage}`,
            icon: '/favicon.ico',
            tag: 'medication-alarm'
        });
    }
}

function checkScheduledNotifications() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    checkSleepScheduleNotifications(currentTime);
    
    if (now.getHours() === 8 && now.getMinutes() === 0) {
        sendMorningNotifications();
    }
    
    if (now.getHours() === 21 && now.getMinutes() === 0) {
        sendEveningNotifications();
    }
    
    checkMealNotifications();
}

function checkSleepScheduleNotifications(currentTime) {
    const schedule = JSON.parse(localStorage.getItem('lifesphere_sleep_schedule')) || {};
    
    if (schedule.wakeUpTime && schedule.wakeUpTime === currentTime) {
        showNotification('🌅 Good Morning!', 'Time to wake up and start your day!');
        const startBtn = document.getElementById('start-tracking');
        if (startBtn && !startBtn.disabled) {
            startBtn.click();
        }
    }
    
    if (schedule.bedtime && schedule.bedtime === currentTime) {
        showNotification('🌙 Good Night!', 'Time to wind down and prepare for sleep.');
        const stopBtn = document.getElementById('stop-tracking');
        if (stopBtn && !stopBtn.disabled) {
            stopBtn.click();
        }
    }
}

function sendMorningNotifications() {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const notifications = [
        { title: '🌅 Good Morning!', message: 'Time to start your day. Check your water intake goals.' },
        { title: '💧 Water Reminder', message: 'Don\'t forget to track your water intake today!' },
        { title: '🎓 Study Time', message: 'Plan your study sessions for today.' },
        { title: '⚒️ Tasks', message: 'Review your tasks for today.' },
        { title: '💪 Workout', message: 'Plan your workout for today.' },
        { title: '🍽️ Meal Planner', message: 'Check your meal plan for today.' }
    ];
    
    notifications.forEach((notification, index) => {
        setTimeout(() => {
            showNotification(notification.title, notification.message);
        }, index * 30000);
    });
}

function sendEveningNotifications() {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const notifications = [
        { title: '🌙 Evening Review', message: 'How was your day? Log your activities.' },
        { title: '😴 Sleep Tracker', message: 'Don\'t forget to log your sleep!' },
        { title: '📱 Screen Time', message: 'Stop screen time tracking for the night.' },
        { title: '🎓 Study Review', message: 'Review what you studied today.' },
        { title: '⚒️ Tasks', message: 'Check off completed tasks.' }
    ];
    
    notifications.forEach((notification, index) => {
        setTimeout(() => {
            showNotification(notification.title, notification.message);
        }, index * 30000);
    });
}

function checkMealNotifications() {
    const meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const today = now.toISOString().split('T')[0];
    
    meals.forEach(meal => {
        if (meal.date === today) {
            const mealTime = new Date(`2000-01-01T${meal.time}`);
            const notifyTime = new Date(mealTime.getTime() - 60 * 60000); // 1 hour before
            const notifyTimeString = notifyTime.getHours().toString().padStart(2, '0') + ':' + notifyTime.getMinutes().toString().padStart(2, '0');
            
            if (notifyTimeString === currentTime) {
                showMealNotification(meal);
            }
        }
    });
}

function showMealNotification(meal) {
    if (localStorage.getItem('lifesphere_notifications') !== 'enabled') return;
    
    const notificationId = `meal-${meal.id}`;
    
    if (notificationTimeouts.has(notificationId)) return;
    
    const title = `🍽️ ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} Time`;
    const message = `Have you started to cook ${meal.name} yet?`;
    
    showNotification(title, message, notificationId);
}

// Water Tracker Reminders
function checkWaterReminders() {
    const waterData = JSON.parse(localStorage.getItem('lifesphere_water')) || {};
    const waterGoal = waterData.goal || 8;
    const waterConsumed = waterData.consumed || 0;
    
    if (waterConsumed < waterGoal) {
        const remaining = waterGoal - waterConsumed;
        
        // Send reminder when there are only 2 glasses left
        if (remaining === 2) {
            showNotification('💧 Water Reminder', `C'mon! Only ${remaining} glasses of water left to reach your daily goal!`);
        }
        
        // Send reminder at 3 PM if user is behind
        const now = new Date();
        if (now.getHours() === 15 && now.getMinutes() === 0 && waterConsumed < waterGoal / 2) {
            showNotification('💧 Water Reminder', `You're halfway through the day but only drank ${waterConsumed}/${waterGoal} glasses. Keep hydrating!`);
        }
    }
}

// Screen Time Reminders
function checkScreenTimeReminders() {
    const screenData = JSON.parse(localStorage.getItem('lifesphere_screen')) || {};
    const screenGoal = parseInt(document.getElementById('screen-goal')?.value || 4);
    const screenSeconds = screenData.seconds || 0;
    const screenHours = screenSeconds / 3600;
    
    // Send reminder when screen time exceeds goal
    if (screenHours > screenGoal) {
        showNotification('📱 Screen Time', `It's enough time of watching today! You've exceeded your daily goal by ${(screenHours - screenGoal).toFixed(1)} hours.`);
    }
}

// LifeLoop Reminders
function checkLifeLoopReminders() {
    const reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    const now = new Date();
    
    reminders.forEach(reminder => {
        const eventDate = new Date(reminder.date);
        const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        
        // Send reminder 1 day before
        if (daysUntil === 1) {
            const eventType = reminder.type === 'birthday' ? 'birthday' : 'anniversary';
            showNotification('🔄 LifeLoop Reminder', `It's ${reminder.name}'s ${eventType} tomorrow! Time to buy a gift!`);
        }
    });
}

// TaskForge Reminders
function checkTaskReminders() {
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const pendingTasks = todos.filter(t => !t.completed);
    
    if (pendingTasks.length > 0) {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Send reminders at random times throughout the day (preferably 1-1.5 hours apart)
        const reminderHours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
        
        if (reminderHours.includes(currentHour) && now.getMinutes() === 0) {
            const randomTask = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
            showNotification('⚒️ Task Reminder', `C'mon, it's time to do task "${randomTask.task}"!`);
        }
    }
    
    // Check subscription renewals
    const subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    const now = new Date();
    
    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewal);
        const daysUntil = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
        
        // Send reminder 1 day before renewal
        if (daysUntil === 1) {
            showNotification('💰 Subscription Reminder', `Your ${sub.name} subscription is ending tomorrow, please renew!`);
        }
    });
}

// EduPlan Reminders
function checkEduPlanReminders() {
    // Timetable reminders
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    courses.forEach(course => {
        if (course.day === today) {
            const courseTime = new Date(`2000-01-01T${course.time}`);
            const notifyTime = new Date(courseTime.getTime() - 30 * 60000); // 30 minutes before
            const notifyTimeString = notifyTime.getHours().toString().padStart(2, '0') + ':' + notifyTime.getMinutes().toString().padStart(2, '0');
            
            if (notifyTimeString === currentTime) {
                showNotification('📅 Class Reminder', `You have ${course.name} class in 30 minutes. Please get ready!`);
            }
        }
    });
    
    // Study tracker reminders at bedtime
    const schedule = JSON.parse(localStorage.getItem('lifesphere_sleep_schedule')) || {};
    if (schedule.bedtime && schedule.bedtime === currentTime) {
        const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
        const today = new Date().toDateString();
        const todaySessions = studySessions.filter(s => new Date(s.startTime).toDateString() === today);
        const todayDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const todayHours = Math.floor(todayDuration / 60);
        const todayMinutes = todayDuration % 60;
        
        showNotification('📚 Study Summary', `Today you studied ${todayHours}h ${todayMinutes}m. Great job!`);
    }
    
    // Homework reminders at bedtime
    if (schedule.bedtime && schedule.bedtime === currentTime) {
        const homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
        const pendingHomeworks = homeworks.filter(h => !h.completed);
        
        if (pendingHomeworks.length > 0) {
            showNotification('📝 Homework Reminder', 'Are you done with your homework?');
        }
    }
    
    // Exam reminders
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const nowDate = new Date();
    
    exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const daysUntil = Math.ceil((examDate - nowDate) / (1000 * 60 * 60 * 24));
        
        // Send reminder 1 day before exam
        if (daysUntil === 1) {
            showNotification('📊 Exam Reminder', `You have an ${exam.subject} exam tomorrow. Prepare for it!`);
        }
    });
}

function showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <div>${message}</div>
        </div>
        <button class="notification-close">✕</button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Show browser notification if available
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeSphere says', {
            body: message,
            icon: '/favicon.ico',
            tag: 'general-notification'
        });
    }
}

// Initialize all data
function loadAllData() {
    console.log('Loading all data...');
}

function initializeCharts() {
    console.log('Initializing charts...');
    const ctx = document.getElementById('weekly-chart');
    if (ctx) {
        const waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        const waterData = getWeeklyWaterData(waterHistory);
        
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Water Intake (glasses)',
                    data: waterData,
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
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
}

function getWeeklyWaterData(waterHistory) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        const dayIndex = date.getDay();
        
        if (waterHistory[dateString]) {
            weekData[dayIndex] = waterHistory[dateString].consumed || 0;
        }
    }
    
    return [...weekData.slice(1), weekData[0]];
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
window.deleteCourse = deleteCourse;
// Fix water tracker delete functionality
function deleteWaterHistory(date) {
    if (confirm('Are you sure you want to delete this water intake record?')) {
        let waterHistory = JSON.parse(localStorage.getItem('lifesphere_water_history')) || {};
        delete waterHistory[date];
        localStorage.setItem('lifesphere_water_history', JSON.stringify(waterHistory));
        updateWaterHistory();
        showNotification('💧 Water Record', 'Water intake record deleted successfully!');
    }
}

// Fix screen time display for mobile
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

// Add delete functionality to subscriptions
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

// Enhanced delete subscription function
function deleteSubscription(id) {
    if (confirm('Are you sure you want to delete this subscription?')) {
        let subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem('lifesphere_subscriptions', JSON.stringify(subscriptions));
        updateSubscriptionsDisplay();
        showNotification('💰 Subscription', 'Subscription deleted successfully!');
    }
}

// Fix water history display
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

// Initialize screen time display properly
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
                showNotification('📱 Screen Time', 'Screen time tracking started!');
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
                showNotification('📱 Screen Time', 'Screen time tracking stopped!');
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
                showNotification('📱 Screen Time', `${minutes} minutes added to screen time!`);
            } else {
                alert('Please enter a valid number of minutes.');
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
            if (confirm('Are you sure you want to reset today\'s screen time?')) {
                screenTimeSeconds = 0;
                updateScreenDisplay();
                saveScreenData();
                showNotification('📱 Screen Time', 'Screen time reset successfully!');
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

// Enhanced notification function
function showNotification(title, message, notificationId = null) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification success`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong><br>
            <span>${message}</span>
        </div>
        <button class="notification-close">✕</button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Show browser notification if available
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            tag: notificationId || 'general-notification'
        });
    }
}

// Make sure all delete functions are properly exposed
window.deleteWaterHistory = deleteWaterHistory;
window.deleteSubscription = deleteSubscription;

// Update the initialization to ensure proper mobile display
document.addEventListener('DOMContentLoaded', function() {
    console.log('LifeSphere initialized with mobile optimizations');
    initializeApp();
    // Force update screen display on load for mobile
    setTimeout(updateScreenDisplay, 100);
});
// Fix notification heading to show "LifeSphere says" instead of "Atiksh2011.github.io says"
function showNotification(title, message, notificationId = null) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification success`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    notification.innerHTML = `
        <div class="notification-content">
            <strong>LifeSphere says</strong><br>
            <span>${message}</span>
        </div>
        <button class="notification-close">✕</button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Show browser notification if available - FIXED HEADING HERE
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeSphere says', {
            body: message,
            icon: '/favicon.ico',
            tag: notificationId || 'general-notification'
        });
    }
}

// Also fix the medication alarm notification heading
function triggerMedicationAlarm(medication) {
    if (localStorage.getItem('lifesphere_ringtone') !== 'granted') return;
    
    // Create a calm and peaceful alarm sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.5);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
    
    const alarmModal = document.getElementById('medication-alarm');
    const alarmMessage = document.getElementById('alarm-message');
    const stopAlarmBtn = document.getElementById('stop-alarm');
    
    if (alarmModal && alarmMessage && stopAlarmBtn) {
        alarmMessage.textContent = `Time to take ${medication.name} - ${medication.dosage}`;
        alarmModal.style.display = 'flex';
        
        stopAlarmBtn.onclick = function() {
            alarmModal.style.display = 'none';
        };
    }
    
    // Show browser notification if available - FIXED HEADING HERE
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeSphere says', {
            body: `Time to take ${medication.name} - ${medication.dosage}`,
            icon: '/favicon.ico',
            tag: 'medication-alarm'
        });
    }
}

// Fix the notification modal heading as well
function showNotification(title, message, notificationId = null) {
    // Show in-app notification
    const notificationModal = document.getElementById('notification-modal');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const acknowledgeBtn = document.getElementById('acknowledge-notification');
    const remindLaterBtn = document.getElementById('remind-later');
    
    if (notificationModal && notificationTitle && notificationMessage && acknowledgeBtn && remindLaterBtn) {
        // FIXED: Set the title to "LifeSphere says" instead of the dynamic title
        notificationTitle.textContent = 'LifeSphere says';
        notificationMessage.textContent = message;
        notificationModal.style.display = 'flex';
        
        if (notificationId && notificationTimeouts.has(notificationId)) {
            clearTimeout(notificationTimeouts.get(notificationId));
            notificationTimeouts.delete(notificationId);
        }
        
        const resendTimeout = setTimeout(() => {
            notificationModal.style.display = 'none';
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
                setTimeout(() => {
                    showNotification(title, message, notificationId);
                }, 300000);
            }
        };
        
        if (notificationId) {
            notificationTimeouts.set(notificationId, resendTimeout);
        }
    }
    
    // Show browser notification if available - FIXED HEADING HERE
    if (localStorage.getItem('lifesphere_notifications') === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeSphere says', {
            body: message,
            icon: '/favicon.ico',
            tag: notificationId || 'general-notification'
        });
    }
}
// COMPLETELY FIXED NOTIFICATION SYSTEM - No more "atiksh2011.github.io says"
function showNotification(title, message, notificationId = null) {
    // Create custom notification element that completely bypasses browser notifications
    const notification = document.createElement('div');
    notification.className = `notification success`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        border-left: 4px solid #5a6fd8;
        font-family: 'Poppins', sans-serif;
    `;
    
    notification.innerHTML = `
        <div class="notification-content">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <div style="font-size: 1.2rem; margin-right: 10px;">🌐</div>
                <strong style="font-size: 1.1rem;">LifeSphere says</strong>
            </div>
            <div style="font-size: 0.95rem; line-height: 1.4;">${message}</div>
        </div>
        <button class="notification-close" style="
            background: rgba(255,255,255,0.2); 
            border: none; 
            color: white; 
            font-size: 1rem; 
            cursor: pointer; 
            margin-left: 1rem; 
            padding: 0.3rem 0.6rem;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">✕</button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // DON'T use browser notifications at all - they always show domain name
    // We'll only use our custom notifications
}

// Fix medication alarm to use custom notifications only
function triggerMedicationAlarm(medication) {
    if (localStorage.getItem('lifesphere_ringtone') !== 'granted') return;
    
    // Create a calm and peaceful alarm sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.5);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
    
    const alarmModal = document.getElementById('medication-alarm');
    const alarmMessage = document.getElementById('alarm-message');
    const stopAlarmBtn = document.getElementById('stop-alarm');
    
    if (alarmModal && alarmMessage && stopAlarmBtn) {
        alarmMessage.textContent = `Time to take ${medication.name} - ${medication.dosage}`;
        alarmModal.style.display = 'flex';
        
        stopAlarmBtn.onclick = function() {
            alarmModal.style.display = 'none';
        };
    }
    
    // Use custom notification instead of browser notification
    showNotification('💊 Medication Reminder', `Time to take ${medication.name} - ${medication.dosage}`);
}

// Fix all other notification functions to use our custom system
function checkWaterReminders() {
    const waterData = JSON.parse(localStorage.getItem('lifesphere_water')) || {};
    const waterGoal = waterData.goal || 8;
    const waterConsumed = waterData.consumed || 0;
    
    if (waterConsumed < waterGoal) {
        const remaining = waterGoal - waterConsumed;
        
        if (remaining === 2) {
            showNotification('💧 Water Reminder', `C'mon! Only ${remaining} glasses of water left to reach your daily goal!`);
        }
        
        const now = new Date();
        if (now.getHours() === 15 && now.getMinutes() === 0 && waterConsumed < waterGoal / 2) {
            showNotification('💧 Water Reminder', `You're halfway through the day but only drank ${waterConsumed}/${waterGoal} glasses. Keep hydrating!`);
        }
    }
}

function checkScreenTimeReminders() {
    const screenData = JSON.parse(localStorage.getItem('lifesphere_screen')) || {};
    const screenGoal = parseInt(document.getElementById('screen-goal')?.value || 4);
    const screenSeconds = screenData.seconds || 0;
    const screenHours = screenSeconds / 3600;
    
    if (screenHours > screenGoal) {
        showNotification('📱 Screen Time', `It's enough time of watching today! You've exceeded your daily goal by ${(screenHours - screenGoal).toFixed(1)} hours.`);
    }
}

function checkLifeLoopReminders() {
    const reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    const now = new Date();
    
    reminders.forEach(reminder => {
        const eventDate = new Date(reminder.date);
        const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 1) {
            const eventType = reminder.type === 'birthday' ? 'birthday' : 'anniversary';
            showNotification('🔄 LifeLoop Reminder', `It's ${reminder.name}'s ${eventType} tomorrow! Time to buy a gift!`);
        }
    });
}

function checkTaskReminders() {
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const pendingTasks = todos.filter(t => !t.completed);
    
    if (pendingTasks.length > 0) {
        const now = new Date();
        const currentHour = now.getHours();
        
        const reminderHours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
        
        if (reminderHours.includes(currentHour) && now.getMinutes() === 0) {
            const randomTask = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
            showNotification('⚒️ Task Reminder', `C'mon, it's time to do task "${randomTask.task}"!`);
        }
    }
    
    const subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    const now = new Date();
    
    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewal);
        const daysUntil = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 1) {
            showNotification('💰 Subscription Reminder', `Your ${sub.name} subscription is ending tomorrow, please renew!`);
        }
    });
}

function checkEduPlanReminders() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    courses.forEach(course => {
        if (course.day === today) {
            const courseTime = new Date(`2000-01-01T${course.time}`);
            const notifyTime = new Date(courseTime.getTime() - 30 * 60000);
            const notifyTimeString = notifyTime.getHours().toString().padStart(2, '0') + ':' + notifyTime.getMinutes().toString().padStart(2, '0');
            
            if (notifyTimeString === currentTime) {
                showNotification('📅 Class Reminder', `You have ${course.name} class in 30 minutes. Please get ready!`);
            }
        }
    });
    
    const schedule = JSON.parse(localStorage.getItem('lifesphere_sleep_schedule')) || {};
    if (schedule.bedtime && schedule.bedtime === currentTime) {
        const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
        const today = new Date().toDateString();
        const todaySessions = studySessions.filter(s => new Date(s.startTime).toDateString() === today);
        const todayDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const todayHours = Math.floor(todayDuration / 60);
        const todayMinutes = todayDuration % 60;
        
        showNotification('📚 Study Summary', `Today you studied ${todayHours}h ${todayMinutes}m. Great job!`);
    }
    
    if (schedule.bedtime && schedule.bedtime === currentTime) {
        const homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
        const pendingHomeworks = homeworks.filter(h => !h.completed);
        
        if (pendingHomeworks.length > 0) {
            showNotification('📝 Homework Reminder', 'Are you done with your homework?');
        }
    }
    
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const nowDate = new Date();
    
    exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const daysUntil = Math.ceil((examDate - nowDate) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 1) {
            showNotification('📊 Exam Reminder', `You have an ${exam.subject} exam tomorrow. Prepare for it!`);
        }
    });
}

// Remove the browser notification permission request since we're not using it
function initializeNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            // Just show a message that we use custom notifications
            showNotification('🔔 Notifications', 'LifeSphere uses beautiful custom notifications! No browser permissions needed.');
            this.textContent = 'Custom Notifications Active';
            this.disabled = true;
            localStorage.setItem('lifesphere_notifications', 'enabled');
        });
    }
    
    if (localStorage.getItem('lifesphere_notifications') === 'enabled') {
        notificationBtn.textContent = 'Custom Notifications Active';
        notificationBtn.disabled = true;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        animation: slideInRight 0.3s ease;
    }
    
    .notification.success {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .notification.info {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .notification.warning {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    
    .notification.error {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
`;
document.head.appendChild(style);
