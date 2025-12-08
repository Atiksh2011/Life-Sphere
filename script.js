// Global variables
let screenTimeInterval;
let screenTimeSeconds = 0;
let screenTracking = false;
let currentWeekOffset = 0;
let medicationAlarmAudio = null;
let notificationTimeouts = new Map();
let selectedCurrency = 'INR';
let backgroundNotificationInterval;
let todoNotificationInterval;
let homeworkNotificationInterval;

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
    initializeTabNavigation();
    initializeNotifications();
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
    initializeTimetableReset();
    
    loadAllData();
    initializeCharts();
    startBackgroundServices();
    startBackgroundNotificationService();
    
    console.log('LifeSphere initialized with background notifications');
}

// FIXED Tab Navigation - CORRECTED VERSION
function initializeTabNavigation() {
    console.log('Initializing tab navigation...');
    
    const navTabs = document.querySelectorAll('.nav-tabs a');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Found tabs:', navTabs.length);
    console.log('Found tab contents:', tabContents.length);

    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding tab content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
                console.log('Showing content:', targetTab);
                
                // Update the specific tab content
                updateTabContent(targetTab);
            } else {
                console.error('Target content not found:', targetTab);
            }
        });
    });

    // Activate first tab by default
    if (navTabs.length > 0) {
        const firstTab = navTabs[0];
        const firstTabId = firstTab.getAttribute('data-tab');
        
        // Hide all tab contents first
        tabContents.forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        // Show first tab content
        const firstContent = document.getElementById(firstTabId);
        if (firstContent) {
            firstContent.style.display = 'block';
            firstContent.classList.add('active');
        }
        
        firstTab.classList.add('active');
        console.log('Activated first tab:', firstTabId);
    }
}

function updateTabContent(tabId) {
    console.log('Updating tab content:', tabId);
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
        default:
            console.log('No specific update for tab:', tabId);
    }
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
    checkWaterNotifications();
    checkMealNotifications();
    checkScreenTimeNotifications();
    checkLifeLoopNotifications();
    checkTaskForgeNotifications();
    checkEduPlanNotifications();
}

// Water Tracker Notifications
function checkWaterNotifications() {
    const waterData = JSON.parse(localStorage.getItem('lifesphere_water')) || { goal: 8, consumed: 0 };
    const remaining = waterData.goal - waterData.consumed;
    
    // Only notify if there's water left to drink and it's during active hours (8 AM - 10 PM)
    const now = new Date();
    const currentHour = now.getHours();
    
    if (remaining > 0 && remaining <= 3 && currentHour >= 8 && currentHour <= 22) {
        showNotification('💧 Water Reminder', `C'mon! Only ${remaining} glass${remaining > 1 ? 'es' : ''} of water left to reach your goal!`);
    }
}

// Meal Planner Notifications
function checkMealNotifications() {
    const meals = JSON.parse(localStorage.getItem('lifesphere_meals')) || [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    meals.forEach(meal => {
        if (meal.date === today) {
            const mealTime = new Date(`${today}T${meal.time}`);
            const oneHourBefore = new Date(mealTime.getTime() - 60 * 60 * 1000);
            
            // Check if current time is exactly 1 hour before meal time
            if (Math.abs(now - oneHourBefore) < 60000) { // Within 1 minute window
                showNotification('🍽️ Meal Reminder', `Have you started to cook ${meal.name} yet? It's planned for ${meal.time}!`);
            }
        }
    });
}

// Screen Time Notifications
function checkScreenTimeNotifications() {
    const screenData = JSON.parse(localStorage.getItem('lifesphere_screen')) || { seconds: 0, goal: 4 };
    const goalSeconds = screenData.goal * 3600;
    
    if (screenData.seconds > goalSeconds) {
        showNotification('📱 Screen Time Alert', "It's enough screen time for today! Consider taking a break.");
    }
}

// LifeLoop Notifications
function checkLifeLoopNotifications() {
    const reminders = JSON.parse(localStorage.getItem('lifesphere_reminders')) || [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.date).toISOString().split('T')[0];
        
        if (reminderDate === tomorrowDate) {
            const eventType = reminder.type === 'birthday' ? 'birthday' : 'anniversary';
            showNotification('🔄 LifeLoop Reminder', `It's ${reminder.name}'s ${eventType} tomorrow! Time to buy a gift!`);
        }
    });
}

// TaskForge Notifications
function checkTaskForgeNotifications() {
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const pendingTodos = todos.filter(t => !t.completed);
    
    if (pendingTodos.length > 0) {
        const now = Date.now();
        const randomTodo = pendingTodos[Math.floor(Math.random() * pendingTodos.length)];
        showNotification('📝 Task Reminder', `C'mon, it's time to do task: ${randomTodo.task}!`);
    }
    
    // Subscription notifications
    checkSubscriptionNotifications();
}

// Subscription Notifications
function checkSubscriptionNotifications() {
    const subscriptions = JSON.parse(localStorage.getItem('lifesphere_subscriptions')) || [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewal).toISOString().split('T')[0];
        
        if (renewalDate === tomorrowDate) {
            showNotification('💰 Subscription Reminder', `Your ${sub.name} subscription is ending tomorrow! Please renew!`);
        }
    });
}

// EduPlan Notifications
function checkEduPlanNotifications() {
    checkClassReminders();
    checkExamReminders();
}

// Class Reminders
function checkClassReminders() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    courses.forEach(course => {
        if (course.day === today) {
            const courseTime = new Date(`2000-01-01T${course.time}`);
            const thirtyMinutesBefore = new Date(`2000-01-01T${course.time}`);
            thirtyMinutesBefore.setMinutes(thirtyMinutesBefore.getMinutes() - 30);
            
            const currentTime = new Date(`2000-01-01T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
            
            // Check if current time is exactly 30 minutes before class
            if (Math.abs(currentTime - thirtyMinutesBefore) < 60000) { // Within 1 minute window
                showNotification('🎓 Class Reminder', `You have ${course.name} class in 30 minutes! Please get ready!`);
            }
        }
    });
}

// Exam Reminders
function checkExamReminders() {
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    exams.forEach(exam => {
        const examDate = new Date(exam.date).toISOString().split('T')[0];
        
        if (examDate === tomorrowDate) {
            showNotification('📊 Exam Reminder', `You have an ${exam.subject} exam tomorrow! Prepare for it!`);
        }
    });
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

// Subtab Navigation
function initializeSubtabNavigation() {
    // TaskForge subtabs
    const taskforgeNav = document.querySelectorAll('.taskforge-nav a');
    const taskforgeSections = document.querySelectorAll('.taskforge-section');
    
    taskforgeNav.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = tab.getAttribute('data-section');
            
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
            const targetSection = tab.getAttribute('data-section');
            
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

    const cups = document.querySelectorAll('.cup');
    if (cups) {
        cups.forEach(cup => {
            cup.addEventListener('click', function() {
                const cupNumber = parseInt(this.getAttribute('data-cup'));
                waterConsumed = cupNumber;
                updateWaterDisplay();
                saveWaterData();
                showNotification('Water Intake Updated', `Your water intake has been set to ${cupNumber} glasses.`);
            });
        });
    }

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
        
        const cups = document.querySelectorAll('.cup');
        if (cups) {
            cups.forEach((cup, index) => {
                if (index < waterConsumed) {
                    cup.classList.add('drank');
                } else {
                    cup.classList.remove('drank');
                }
            });
        }
        
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
    
    if (!historyBody) return;
    
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
    
    historyBody.innerHTML = historyHTML || `
        <tr>
            <td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
                No water intake history yet. Start tracking your water consumption!
            </td>
        </tr>
    `;
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
    
    if (!historyBody) return;
    
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
    
    historyBody.innerHTML = historyHTML;
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

// EduPlan - FIXED TIMETABLE
function initializeEduPlan() {
    initializeTimetable();
    initializeStudyTracker();
    initializeHomeworkTracker();
    initializeExamsTracker();
    initializeGradesTracker();
    updateEduPlanDisplay();
}

// PERFECT Timetable functionality
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
            if (addClassSection) addClassSection.style.display = 'block';
            if (timetableDisplaySection) timetableDisplaySection.style.display = 'none';
        });
    }

    // View timetable button
    if (viewTimetableBtn) {
        viewTimetableBtn.addEventListener('click', function() {
            const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
            if (courses.length === 0) {
                showNotification('Timetable', 'No classes added yet. Please add some classes first.');
                if (addClassSection) addClassSection.style.display = 'block';
                if (timetableDisplaySection) timetableDisplaySection.style.display = 'none';
                return;
            }
            if (addClassSection) addClassSection.style.display = 'none';
            if (timetableDisplaySection) timetableDisplaySection.style.display = 'block';
            updateTimetableDisplay();
        });
    }

    // Back to add class button
    if (backToAddClassBtn) {
        backToAddClassBtn.addEventListener('click', function() {
            if (timetableDisplaySection) timetableDisplaySection.style.display = 'none';
            if (addClassSection) addClassSection.style.display = 'block';
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
            if (timetableForm) timetableForm.reset();
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
            
            const course = {
                id: Date.now(),
                name: courseName,
                code: courseCode,
                day: courseDay,
                time: courseTime,
                duration: courseDuration,
                location: courseLocation,
                instructor: courseInstructor,
                created: new Date().toISOString()
            };
            
            saveCourse(course);
            this.reset();
            // Reset time to current time
            const timeInput = document.getElementById('course-time');
            if (timeInput) timeInput.value = currentTime;
            showNotification('Course Added', `${course.name} has been added to your timetable!`);
            
            // Auto-switch to timetable view
            if (addClassSection) addClassSection.style.display = 'none';
            if (timetableDisplaySection) timetableDisplaySection.style.display = 'block';
            updateTimetableDisplay();
        });
    }

    // Load existing courses on page load
    updateTimetableStats();
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
        // Days of the week
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Time slots from 5 AM to 12 AM (midnight) in 1-hour intervals
        const timeSlots = [];
        for (let hour = 5; hour <= 23; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        // Add midnight (00:00)
        timeSlots.push('00:00');
        
        timetableHTML = `
            <div class="timetable-view-container">
                <table class="timetable-table">
                    <thead>
                        <tr>
                            <th class="time-column">Time</th>
                            ${dayNames.map(day => `<th>${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Create rows for each time slot
        timeSlots.forEach(timeSlot => {
            const [hours, minutes] = timeSlot.split(':').map(Number);
            const displayHours = hours % 12 || 12;
            const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? (hours === 12 ? 'PM' : hours < 24 ? 'PM' : 'AM') : 'AM'}`;
            
            timetableHTML += `
                <tr>
                    <td class="time-column">${displayTime}</td>
            `;
            
            // For each day, check if there's a course at this time
            days.forEach(day => {
                const courseAtThisTime = courses.find(course => 
                    course.day === day && isCourseAtTime(course, timeSlot)
                );
                
                if (courseAtThisTime) {
                    const endTime = calculateEndTime(courseAtThisTime.time, courseAtThisTime.duration);
                    timetableHTML += `
                        <td class="course-cell">
                            <div class="course-block">
                                <div class="course-info">
                                    <strong>${courseAtThisTime.name}</strong>
                                    <div>${formatTimeDisplay(courseAtThisTime.time)} - ${formatTimeDisplay(endTime)}</div>
                                    ${courseAtThisTime.location ? `<div>${courseAtThisTime.location}</div>` : ''}
                                    ${courseAtThisTime.instructor ? `<div>${courseAtThisTime.instructor}</div>` : ''}
                                </div>
                                <button class="delete-course-btn" onclick="deleteCourse(${courseAtThisTime.id})">✕</button>
                            </div>
                        </td>
                    `;
                } else {
                    timetableHTML += `<td class="empty-cell"></td>`;
                }
            });
            
            timetableHTML += `</tr>`;
        });
        
        timetableHTML += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    timetableView.innerHTML = timetableHTML;
    updateTimetableStats();
}

// Helper function to format time for display
function formatTimeDisplay(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const displayHours = hours % 12 || 12;
    const period = hours >= 12 ? (hours === 12 ? 'PM' : hours < 24 ? 'PM' : 'AM') : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to check if a course is at a specific time slot
function isCourseAtTime(course, timeSlot) {
    const courseStartMinutes = timeToMinutes(course.time);
    const slotMinutes = timeToMinutes(timeSlot);
    const courseEndMinutes = courseStartMinutes + course.duration;
    
    return slotMinutes >= courseStartMinutes && slotMinutes < courseEndMinutes;
}

// Helper function to convert time string to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper function to calculate end time
function calculateEndTime(startTime, duration) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    
    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    courses.push(course);
    localStorage.setItem('lifesphere_courses', JSON.stringify(courses));
    
    updateTimetableStats();
}

function updateTimetableStats() {
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const totalClassesElement = document.getElementById('total-classes');
    
    // Total classes
    if (totalClassesElement) {
        totalClassesElement.textContent = courses.length;
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

// Make deleteCourse function globally available
window.deleteCourse = deleteCourse;

// Study Tracker Functions
function initializeStudyTracker() {
    const studyForm = document.getElementById('study-form');
    const showStudyHistoryBtn = document.getElementById('show-study-history');
    const closeStudyHistoryBtn = document.getElementById('close-study-history');

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
                completed: false
            };
            
            saveStudySession(studySession);
            this.reset();
        });
    }

    if (showStudyHistoryBtn) {
        showStudyHistoryBtn.addEventListener('click', function() {
            const studyHistoryPopup = document.getElementById('study-history-popup');
            if (studyHistoryPopup) studyHistoryPopup.style.display = 'flex';
            updateStudyTrackerDisplay();
        });
    }

    if (closeStudyHistoryBtn) {
        closeStudyHistoryBtn.addEventListener('click', function() {
            const studyHistoryPopup = document.getElementById('study-history-popup');
            if (studyHistoryPopup) studyHistoryPopup.style.display = 'none';
        });
    }
}

function saveStudySession(session) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions.push(session);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    
    updateStudyTrackerDisplay();
    showNotification('📚 Study Session', `${session.subject} study session has been logged!`);
}

function updateStudyTrackerDisplay() {
    const studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    const studySessionsBody = document.getElementById('study-sessions-body');
    
    // Update study stats
    const today = new Date().toDateString();
    const todaySessions = studySessions.filter(s => new Date(s.startTime).toDateString() === today);
    const todayDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayHours = Math.floor(todayDuration / 60);
    const todayMinutes = todayDuration % 60;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = studySessions.filter(s => new Date(s.startTime) >= weekAgo);
    const weekDuration = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const weekHours = Math.floor(weekDuration / 60);
    const weekMinutes = weekDuration % 60;

    const totalDuration = studySessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;

    // Update display elements
    const studyTodayElement = document.getElementById('study-today');
    const studyWeekElement = document.getElementById('study-week');
    const studyTotalElement = document.getElementById('study-total');
    const studyTodayQuickElement = document.getElementById('study-today-quick');
    const studyWeekQuickElement = document.getElementById('study-week-quick');

    if (studyTodayElement) studyTodayElement.textContent = `${todayHours}h ${todayMinutes}m`;
    if (studyWeekElement) studyWeekElement.textContent = `${weekHours}h ${weekMinutes}m`;
    if (studyTotalElement) studyTotalElement.textContent = `${totalHours}h ${totalMinutes}m`;
    if (studyTodayQuickElement) studyTodayQuickElement.textContent = `Today: ${todayHours}h ${todayMinutes}m`;
    if (studyWeekQuickElement) studyWeekQuickElement.textContent = `Week: ${weekHours}h ${weekMinutes}m`;

    // Update study history table
    if (studySessionsBody) {
        let studyHTML = '';
        
        studySessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString();
            const time = new Date(session.startTime).toLocaleTimeString();
            const hours = Math.floor(session.duration / 60);
            const minutes = session.duration % 60;
            
            studyHTML += `
                <tr>
                    <td>${session.subject}</td>
                    <td>${session.topic || '-'}</td>
                    <td>${hours}h ${minutes}m</td>
                    <td>${date}<br><small>${time}</small></td>
                    <td>${session.goal || '-'}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteStudySession(${session.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        studySessionsBody.innerHTML = studyHTML || `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                    No study sessions recorded yet.
                </td>
            </tr>
        `;
    }
}

function deleteStudySession(id) {
    let studySessions = JSON.parse(localStorage.getItem('lifesphere_study_sessions')) || [];
    studySessions = studySessions.filter(s => s.id !== id);
    localStorage.setItem('lifesphere_study_sessions', JSON.stringify(studySessions));
    updateStudyTrackerDisplay();
    showNotification('Study Session Deleted', 'Study session has been removed.');
}

// Homework Tracker Functions
function initializeHomeworkTracker() {
    const homeworkForm = document.getElementById('homework-form');

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
}

function saveHomework(homework) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks.push(homework);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    
    updateHomeworkDisplay();
    showNotification('📝 Homework Added', `${homework.subject} homework has been added!`);
}

function updateHomeworkDisplay() {
    const homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    const homeworkList = document.getElementById('homework-list');
    const pendingHomeworkElement = document.getElementById('pending-homework');
    const dueSoonElement = document.getElementById('due-soon');

    const pendingHomeworks = homeworks.filter(h => !h.completed);
    const now = new Date();
    const dueSoon = pendingHomeworks.filter(h => {
        const dueDate = new Date(h.due);
        const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return daysUntil <= 3 && daysUntil >= 0;
    });

    if (pendingHomeworkElement) pendingHomeworkElement.textContent = `${pendingHomeworks.length} pending`;
    if (dueSoonElement) dueSoonElement.textContent = `${dueSoon.length} due soon`;

    if (homeworkList) {
        let homeworkHTML = '';
        
        pendingHomeworks.sort((a, b) => new Date(a.due) - new Date(b.due)).forEach(homework => {
            const dueDate = new Date(homework.due);
            const now = new Date();
            const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            let dueText = '';
            let priorityClass = '';
            
            if (daysUntil === 0) {
                dueText = 'Today';
                priorityClass = 'high';
            } else if (daysUntil === 1) {
                dueText = 'Tomorrow';
                priorityClass = 'high';
            } else if (daysUntil <= 3) {
                dueText = `${daysUntil} days`;
                priorityClass = 'medium';
            } else {
                dueText = `${daysUntil} days`;
                priorityClass = 'low';
            }
            
            homeworkHTML += `
                <div class="task-item ${priorityClass}">
                    <div class="task-info">
                        <div class="task-main">
                            <span class="task-text">${homework.subject}: ${homework.task}</span>
                            <span class="todo-priority priority-${homework.priority}">${homework.priority}</span>
                        </div>
                        <div class="task-due">Due: ${dueDate.toLocaleDateString()} (${dueText})</div>
                        <div class="task-estimate">Estimate: ${homework.estimate} minutes</div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-complete" onclick="completeHomework(${homework.id})">✓</button>
                        <button class="delete-btn" onclick="deleteHomework(${homework.id})">✕</button>
                    </div>
                </div>
            `;
        });
        
        homeworkList.innerHTML = homeworkHTML || `
            <div class="empty-state">
                <p>No pending homework</p>
                <small>All caught up! Add new assignments when you get them.</small>
            </div>
        `;
    }
}

function completeHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    const homeworkIndex = homeworks.findIndex(h => h.id === id);
    
    if (homeworkIndex !== -1) {
        homeworks[homeworkIndex].completed = true;
        homeworks[homeworkIndex].completedAt = new Date().toISOString();
        localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
        updateHomeworkDisplay();
        showNotification('Homework Completed', 'Homework marked as completed! Great job!');
    }
}

function deleteHomework(id) {
    let homeworks = JSON.parse(localStorage.getItem('lifesphere_homeworks')) || [];
    homeworks = homeworks.filter(h => h.id !== id);
    localStorage.setItem('lifesphere_homeworks', JSON.stringify(homeworks));
    updateHomeworkDisplay();
    showNotification('Homework Deleted', 'Homework has been removed from your list.');
}

// Exams Tracker Functions
function initializeExamsTracker() {
    const examForm = document.getElementById('exam-form');

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

function saveExam(exam) {
    let exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    exams.push(exam);
    localStorage.setItem('lifesphere_exams', JSON.stringify(exams));
    
    updateExamDisplay();
    showNotification('📊 Exam Added', `${exam.subject} ${exam.type} has been scheduled!`);
}

function updateExamDisplay() {
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const examsList = document.getElementById('exams-list');
    const upcomingExamsElement = document.getElementById('upcoming-exams');
    const examsThisMonthElement = document.getElementById('exams-this-month');

    const now = new Date();
    const upcomingExams = exams.filter(e => new Date(e.date) >= now);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const examsThisMonth = exams.filter(e => {
        const examDate = new Date(e.date);
        return examDate >= thisMonth && examDate < nextMonth;
    });

    if (upcomingExamsElement) upcomingExamsElement.textContent = `${upcomingExams.length} upcoming`;
    if (examsThisMonthElement) examsThisMonthElement.textContent = `${examsThisMonth.length} this month`;

    if (examsList) {
        let examHTML = '';
        
        upcomingExams.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(exam => {
            const examDate = new Date(exam.date);
            const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
            let dueText = '';
            
            if (daysUntil === 0) {
                dueText = 'Today';
            } else if (daysUntil === 1) {
                dueText = 'Tomorrow';
            } else if (daysUntil <= 7) {
                dueText = `${daysUntil} days`;
            } else {
                dueText = `${daysUntil} days`;
            }
            
            examHTML += `
                <div class="task-item high">
                    <div class="task-info">
                        <div class="task-main">
                            <span class="task-text">${exam.subject} - ${exam.type}</span>
                            <span class="todo-priority priority-high">Exam</span>
                        </div>
                        <div class="task-due">Date: ${examDate.toLocaleDateString()} at ${exam.time}</div>
                        <div class="task-estimate">
                            ${exam.duration} minutes | ${exam.location || 'Location TBA'}
                            <br><small>${dueText} away</small>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="delete-btn" onclick="deleteExam(${exam.id})">✕</button>
                    </div>
                </div>
            `;
        });
        
        examsList.innerHTML = examHTML || `
            <div class="empty-state">
                <p>No upcoming exams</p>
                <small>Add exams to track your schedule</small>
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

// Grades Tracker Functions
function initializeGradesTracker() {
    const gradeForm = document.getElementById('grade-form');

    if (gradeForm) {
        gradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const grade = {
                id: Date.now(),
                subject: document.getElementById('grade-subject').value,
                type: document.getElementById('grade-type').value,
                score: parseFloat(document.getElementById('grade-score').value),
                maxScore: parseFloat(document.getElementById('grade-max').value),
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
    
    updateGradeDisplay();
    showNotification('🎯 Grade Added', `${grade.subject} ${grade.type} grade recorded!`);
}

function updateGradeDisplay() {
    const grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    const gradesBody = document.getElementById('grades-body');
    const currentGpaElement = document.getElementById('current-gpa');

    if (gradesBody) {
        let gradesHTML = '';
        
        grades.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(grade => {
            const percentage = (grade.score / grade.maxScore) * 100;
            let gradeLetter = '';
            let gradeClass = '';
            
            if (percentage >= 90) {
                gradeLetter = 'A';
                gradeClass = 'excellent';
            } else if (percentage >= 80) {
                gradeLetter = 'B';
                gradeClass = 'good';
            } else if (percentage >= 70) {
                gradeLetter = 'C';
                gradeClass = 'average';
            } else if (percentage >= 60) {
                gradeLetter = 'D';
                gradeClass = 'poor';
            } else {
                gradeLetter = 'F';
                gradeClass = 'fail';
            }
            
            gradesHTML += `
                <tr>
                    <td>${grade.subject}</td>
                    <td>${grade.type}</td>
                    <td>${grade.score}/${grade.maxScore}</td>
                    <td>
                        <span class="grade-percentage ${gradeClass}">
                            ${percentage.toFixed(1)}% (${gradeLetter})
                        </span>
                    </td>
                    <td>${grade.weight}%</td>
                    <td>${new Date(grade.date).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteGrade(${grade.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        gradesBody.innerHTML = gradesHTML || `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    No grades recorded yet. Add your first grade above.
                </td>
            </tr>
        `;
    }

    // Calculate GPA
    if (grades.length > 0) {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        grades.forEach(grade => {
            const percentage = (grade.score / grade.maxScore) * 100;
            totalWeightedScore += percentage * (grade.weight / 100);
            totalWeight += grade.weight;
        });
        
        const weightedAverage = totalWeightedScore / (totalWeight > 0 ? totalWeight / 100 : 1);
        const gpa = (weightedAverage / 100) * 4.0;
        
        if (currentGpaElement) {
            currentGpaElement.textContent = `GPA: ${gpa.toFixed(2)}/4.0`;
            currentGpaElement.className = gpa >= 3.0 ? 'gpa-excellent' : gpa >= 2.0 ? 'gpa-good' : 'gpa-poor';
        }
    } else {
        if (currentGpaElement) {
            currentGpaElement.textContent = 'GPA: -';
            currentGpaElement.className = '';
        }
    }
}

function deleteGrade(id) {
    let grades = JSON.parse(localStorage.getItem('lifesphere_grades')) || [];
    grades = grades.filter(g => g.id !== id);
    localStorage.setItem('lifesphere_grades', JSON.stringify(grades));
    updateGradeDisplay();
    showNotification('Grade Deleted', 'Grade has been removed from your records.');
}

// Initialize timetable reset button
function initializeTimetableReset() {
    const resetTimetableBtn = document.getElementById('reset-timetable-db');
    if (resetTimetableBtn) {
        resetTimetableBtn.addEventListener('click', resetTimetableDatabase);
    }
}

function resetTimetableDatabase() {
    if (confirm('Are you sure you want to reset the entire timetable? This will delete ALL your classes and cannot be undone.')) {
        localStorage.removeItem('lifesphere_courses');
        
        // Reset the display
        updateTimetableDisplay();
        
        // Show add class section
        const addClassSection = document.getElementById('add-class-section');
        const timetableDisplaySection = document.getElementById('timetable-display-section');
        
        if (addClassSection) addClassSection.style.display = 'block';
        if (timetableDisplaySection) timetableDisplaySection.style.display = 'none';
        
        showNotification('Timetable Reset', 'All classes have been removed from your timetable.');
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

// Update dashboard
function updateDashboard() {
    // Update dashboard with latest data from all trackers
    console.log('Dashboard updated');
    
    // Update today's tasks
    const todos = JSON.parse(localStorage.getItem('lifesphere_todos')) || [];
    const todayTasks = todos.filter(t => !t.completed);
    const todayTasksList = document.getElementById('today-tasks-list');
    
    if (todayTasksList) {
        let tasksHTML = '';
        todayTasks.slice(0, 5).forEach(task => {
            tasksHTML += `
                <div class="upcoming-item">
                    <div class="item-title">${task.task}</div>
                    <div class="item-details">Priority: ${task.priority}</div>
                </div>
            `;
        });
        
        todayTasksList.innerHTML = tasksHTML || `
            <div class="empty-state">
                <p>No tasks for today</p>
            </div>
        `;
    }
    
    // Update today's classes
    const courses = JSON.parse(localStorage.getItem('lifesphere_courses')) || [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = courses.filter(course => course.day === today);
    const todayClassesList = document.getElementById('today-classes-list');
    
    if (todayClassesList) {
        let classesHTML = '';
        todayClasses.forEach(course => {
            classesHTML += `
                <div class="upcoming-item">
                    <div class="item-title">${course.name}</div>
                    <div class="item-details">${course.time} | ${course.location || 'TBA'}</div>
                </div>
            `;
        });
        
        todayClassesList.innerHTML = classesHTML || `
            <div class="empty-state">
                <p>No classes today</p>
            </div>
        `;
    }
    
    // Update upcoming exams
    const exams = JSON.parse(localStorage.getItem('lifesphere_exams')) || [];
    const now = new Date();
    const upcomingExams = exams.filter(e => new Date(e.date) >= now).slice(0, 3);
    const upcomingExamsList = document.getElementById('upcoming-exams-list');
    
    if (upcomingExamsList) {
        let examsHTML = '';
        upcomingExams.forEach(exam => {
            const examDate = new Date(exam.date);
            const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
            examsHTML += `
                <div class="upcoming-item">
                    <div class="item-title">${exam.subject} - ${exam.type}</div>
                    <div class="item-details">${examDate.toLocaleDateString()} (${daysUntil} days)</div>
                </div>
            `;
        });
        
        upcomingExamsList.innerHTML = examsHTML || `
            <div class="empty-state">
                <p>No upcoming exams</p>
            </div>
        `;
    }
    
    // Update pending tasks
    const pendingTasksList = document.getElementById('pending-tasks-list');
    if (pendingTasksList) {
        let pendingHTML = '';
        todayTasks.slice(0, 3).forEach(task => {
            pendingHTML += `
                <div class="upcoming-item">
                    <div class="item-title">${task.task}</div>
                    <div class="item-details">Priority: ${task.priority}</div>
                </div>
            `;
        });
        
        pendingTasksList.innerHTML = pendingHTML || `
            <div class="empty-state">
                <p>No pending tasks</p>
            </div>
        `;
    }
}

// Update EduPlan display
function updateEduPlanDisplay() {
    updateTimetableDisplay();
    updateStudyTrackerDisplay();
    updateHomeworkDisplay();
    updateExamDisplay();
    updateGradeDisplay();
}

// Update TaskForge display
function updateTaskForgeDisplay() {
    updateTodoDisplay();
    updateSubscriptionsDisplay();
}

// Update LifeLoop display
function updateLifeLoopDisplay() {
    // Implementation for LifeLoop display updates
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

// Notification functions
function showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">✕</button>
    `;
    
    // Add to notification container
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
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
// Enhanced LifeSphere Application
class LifeSphere {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        console.log('🚀 LifeSphere Enhanced v2.0 Initializing...');
        
        try {
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize UI components
            this.initializeUI();
            
            // Initialize all modules
            this.initializeModules();
            
            // Load data
            this.loadAllData();
            
            // Start background services
            this.startBackgroundServices();
            
            console.log('✅ LifeSphere initialized successfully');
            this.showToast('LifeSphere Enhanced v2.0 ready!', 'success');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    // Core initialization
    async initializeCore() {
        // Check for service worker support
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        // Initialize storage with fallback
        this.storage = this.initializeStorage();
        
        // Set default theme
        this.setTheme(localStorage.getItem('theme') || 'light');
        
        // Initialize time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    // Enhanced storage with fallback
    initializeStorage() {
        const storage = {
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.warn('LocalStorage set failed:', error);
                    // Fallback to sessionStorage
                    try {
                        sessionStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch (e) {
                        console.error('All storage failed:', e);
                        return false;
                    }
                }
            },
            
            get: (key) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (error) {
                    console.warn('LocalStorage get failed:', error);
                    try {
                        const item = sessionStorage.getItem(key);
                        return item ? JSON.parse(item) : null;
                    } catch (e) {
                        console.error('All storage get failed:', e);
                        return null;
                    }
                }
            },
            
            remove: (key) => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            },
            
            clear: () => {
                localStorage.clear();
                sessionStorage.clear();
            }
        };
        
        return storage;
    }

    // Theme management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
    }

    // UI Initialization
    initializeUI() {
        // Theme toggle
        const themeToggle = document.getElementById('dark-mode-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Export/Import buttons
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const exportAllBtn = document.getElementById('export-all-data');
        
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (importBtn) importBtn.addEventListener('click', () => this.importData());
        if (exportAllBtn) exportAllBtn.addEventListener('click', () => this.exportAllData());

        // Enhanced tab navigation
        this.initializeTabNavigation();

        // Mobile navigation
        this.initializeMobileNavigation();

        // Quick actions
        this.initializeQuickActions();

        // Loading states
        this.initializeLoadingStates();
    }

    // Enhanced tab navigation with swipe support
    initializeTabNavigation() {
        const navTabs = document.querySelectorAll('.nav-tabs a');
        const tabContents = document.querySelectorAll('.tab-content');
        const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn:not(.menu-toggle)');

        // Desktop navigation
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Mobile navigation
        mobileNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
                
                // Update active states
                mobileNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Close sidebar on mobile
                document.querySelector('.sidebar').classList.remove('show');
            });
        });

        // Menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarClose = document.querySelector('.sidebar-close');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('show');
            });
        }

        // Touch swipe for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    switchTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-tabs a').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
            
            // Update active nav
            const activeNav = document.querySelector(`.nav-tabs a[data-tab="${tabId}"]`);
            if (activeNav) activeNav.classList.add('active');
            
            // Update mobile nav
            const mobileBtn = document.querySelector(`.mobile-nav-btn[data-tab="${tabId}"]`);
            if (mobileBtn) {
                document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
                mobileBtn.classList.add('active');
            }
            
            // Load tab-specific data
            this.loadTabData(tabId);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            const currentTab = document.querySelector('.tab-content.active').id;
            const tabs = ['dashboard', 'water', 'workout', 'medication', 'meals', 'screen', 'sleep', 'lifeloop', 'taskforge', 'eduplan'];
            const currentIndex = tabs.indexOf(currentTab);
            
            if (diff > 0 && currentIndex < tabs.length - 1) {
                // Swipe left - next tab
                this.switchTab(tabs[currentIndex + 1]);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right - previous tab
                this.switchTab(tabs[currentIndex - 1]);
            }
        }
    }

    // Mobile navigation
    initializeMobileNavigation() {
        // Handle mobile menu
        const sidebar = document.querySelector('.sidebar');
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('show') && 
                !sidebar.contains(e.target) && 
                !e.target.closest('.menu-toggle')) {
                sidebar.classList.remove('show');
            }
        });
    }

    // Quick actions
    initializeQuickActions() {
        const quickActions = document.querySelectorAll('.quick-action-btn');
        
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Quick add water buttons
        const quickWaterBtns = document.querySelectorAll('.quick-add-water');
        quickWaterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseFloat(btn.getAttribute('data-amount'));
                this.addWater(amount);
            });
        });

        // Quick task add
        const addQuickTaskBtn = document.getElementById('add-quick-task');
        if (addQuickTaskBtn) {
            addQuickTaskBtn.addEventListener('click', () => {
                this.showQuickTaskModal();
            });
        }
    }

    handleQuickAction(action) {
        switch(action) {
            case 'water':
                this.addWater(1);
                break;
            case 'task':
                this.showQuickTaskModal();
                break;
            case 'workout':
                this.switchTab('workout');
                break;
            case 'study':
                this.switchTab('eduplan');
                // Switch to study section
                document.querySelector('.eduplan-nav a[data-section="study"]').click();
                break;
        }
    }

    // Loading states
    initializeLoadingStates() {
        // Show loading for async operations
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            LifeSphere.showLoading();
            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                setTimeout(() => LifeSphere.hideLoading(), 500);
            }
        };
    }

    static showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    static hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    // Module initialization
    initializeModules() {
        // Water Tracker
        this.initializeWaterTracker();
        
        // Workout Logger
        this.initializeWorkoutLogger();
        
        // TaskForge
        this.initializeTaskForge();
        
        // EduPlan
        this.initializeEduPlan();
        
        // Other modules...
        this.initializeMedicationTracker();
        this.initializeMealPlanner();
        this.initializeScreenTimeTracker();
        this.initializeSleepTracker();
        this.initializeLifeLoop();
    }

    // Enhanced Water Tracker
    initializeWaterTracker() {
        // Glass size selector
        const glassSizeSelect = document.getElementById('glass-size');
        if (glassSizeSelect) {
            glassSizeSelect.addEventListener('change', () => {
                const size = parseInt(glassSizeSelect.value);
                this.updateGlassSize(size);
            });
        }

        // Weight-based calculation
        const weightInput = document.getElementById('weight-based');
        if (weightInput) {
            weightInput.addEventListener('change', () => {
                const weight = parseFloat(weightInput.value);
                if (weight >= 30 && weight <= 200) {
                    this.calculateWaterGoalByWeight(weight);
                }
            });
        }

        // Quick water buttons
        const waterQuickBtns = document.querySelectorAll('.water-quick-btn:not(.custom-amount)');
        waterQuickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseFloat(btn.getAttribute('data-amount'));
                this.addWater(amount);
            });
        });

        // Custom amount button
        const customAmountBtn = document.querySelector('.water-quick-btn.custom-amount');
        if (customAmountBtn) {
            customAmountBtn.addEventListener('click', () => {
                this.showCustomWaterModal();
            });
        }

        // Update water goal
        const waterGoalInput = document.getElementById('water-custom-goal');
        if (waterGoalInput) {
            waterGoalInput.addEventListener('change', () => {
                this.updateWaterGoal(parseInt(waterGoalInput.value));
            });
        }
    }

    updateGlassSize(size) {
        const data = this.storage.get('water_settings') || {};
        data.glassSize = size;
        this.storage.set('water_settings', data);
        
        // Update display
        this.updateWaterDisplay();
        this.showToast(`Glass size set to ${size}ml`, 'success');
    }

    calculateWaterGoalByWeight(weight) {
        // Standard calculation: 30-35 ml per kg of body weight
        const liters = weight * 0.033;
        const glasses = Math.round(liters * 1000 / 250); // Convert to 250ml glasses
        
        // Update goal
        const goalInput = document.getElementById('water-custom-goal');
        if (goalInput) {
            goalInput.value = glasses;
            this.updateWaterGoal(glasses);
        }
        
        this.showToast(`Recommended daily intake: ${glasses} glasses (${liters.toFixed(1)}L)`, 'info');
    }

    addWater(amount) {
        const today = new Date().toDateString();
        const waterData = this.storage.get('water_data') || {};
        const todayData = waterData[today] || { consumed: 0, goal: 8 };
        
        todayData.consumed += amount;
        waterData[today] = todayData;
        this.storage.set('water_data', waterData);
        
        // Update streak
        this.updateWaterStreak();
        
        // Update display
        this.updateWaterDisplay();
        this.updateQuickStats();
        
        // Show notification
        this.showToast(`Added ${amount} glass${amount !== 1 ? 'es' : ''} of water`, 'success');
        
        // Update chart
        this.updateWaterChart();
    }

    updateWaterStreak() {
        const waterData = this.storage.get('water_data') || {};
        const dates = Object.keys(waterData).sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 0;
        let currentDate = new Date();
        
        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i]);
            const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays !== i) break;
            
            const dayData = waterData[dates[i]];
            if (dayData.consumed >= dayData.goal * 0.8) { // 80% of goal counts
                streak++;
            } else {
                break;
            }
        }
        
        // Update streak display
        const streakElement = document.getElementById('water-streak');
        if (streakElement) streakElement.textContent = streak;
        
        // Unlock achievements
        this.checkWaterAchievements(streak);
    }

    checkWaterAchievements(streak) {
        const achievements = this.storage.get('water_achievements') || {};
        
        if (streak >= 1 && !achievements.first_day) {
            achievements.first_day = true;
            this.showAchievement('🥤 First Day', 'Drank your first glass!');
        }
        
        if (streak >= 3 && !achievements.three_days) {
            achievements.three_days = true;
            this.showAchievement('💧 3 Day Streak', 'Consistent hydration for 3 days!');
        }
        
        if (streak >= 7 && !achievements.perfect_week) {
            achievements.perfect_week = true;
            this.showAchievement('🏆 Perfect Week', 'Perfect hydration for a week!');
        }
        
        if (streak >= 30 && !achievements.monthly_master) {
            achievements.monthly_master = true;
            this.showAchievement('👑 Monthly Master', '30 days of perfect hydration!');
        }
        
        this.storage.set('water_achievements', achievements);
    }

    // Enhanced Workout Logger
    initializeWorkoutLogger() {
        // Workout templates
        const templateBtns = document.querySelectorAll('.workout-template-btn');
        templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const template = btn.getAttribute('data-template');
                this.loadWorkoutTemplate(template);
            });
        });

        // Exercise library
        this.initializeExerciseLibrary();

        // Duration controls
        const durationBtns = document.querySelectorAll('.duration-btn');
        durationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const change = parseInt(btn.getAttribute('data-change'));
                const durationInput = document.getElementById('workout-duration-enhanced');
                if (durationInput) {
                    let value = parseInt(durationInput.value) + change;
                    if (value < 1) value = 1;
                    durationInput.value = value;
                }
            });
        });

        // Form submission
        const workoutForm = document.getElementById('workout-form-enhanced');
        if (workoutForm) {
            workoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logWorkout();
            });
        }
    }

    initializeExerciseLibrary() {
        const exercises = {
            cardio: [
                { name: 'Running', icon: '🏃‍♂️', calories: 600 },
                { name: 'Cycling', icon: '🚴‍♂️', calories: 500 },
                { name: 'Jump Rope', icon: '🔄', calories: 700 },
                { name: 'Swimming', icon: '🏊‍♂️', calories: 550 }
            ],
            strength: [
                { name: 'Push-ups', icon: '💪', calories: 300 },
                { name: 'Squats', icon: '🦵', calories: 400 },
                { name: 'Deadlifts', icon: '🏋️‍♂️', calories: 500 },
                { name: 'Pull-ups', icon: '⬆️', calories: 350 }
            ],
            flexibility: [
                { name: 'Yoga', icon: '🧘‍♀️', calories: 250 },
                { name: 'Stretching', icon: '🤸‍♂️', calories: 200 },
                { name: 'Pilates', icon: '🌀', calories: 300 }
            ]
        };

        const grid = document.getElementById('exercises-grid');
        if (!grid) return;

        // Populate with all exercises initially
        this.populateExerciseGrid(exercises, 'all');

        // Category buttons
        const categoryBtns = document.querySelectorAll('.exercise-category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter exercises
                const category = btn.getAttribute('data-category');
                this.populateExerciseGrid(exercises, category);
            });
        });
    }

    populateExerciseGrid(exercises, category) {
        const grid = document.getElementById('exercises-grid');
        if (!grid) return;

        grid.innerHTML = '';

        let exercisesToShow = [];
        if (category === 'all') {
            Object.values(exercises).forEach(cat => exercisesToShow.push(...cat));
        } else {
            exercisesToShow = exercises[category] || [];
        }

        exercisesToShow.forEach(exercise => {
            const exerciseEl = document.createElement('div');
            exerciseEl.className = 'exercise-item';
            exerciseEl.innerHTML = `
                <div class="exercise-icon">${exercise.icon}</div>
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-calories">${exercise.calories} cal/hr</div>
            `;
            exerciseEl.addEventListener('click', () => {
                this.selectExercise(exercise);
            });
            grid.appendChild(exerciseEl);
        });
    }

    selectExercise(exercise) {
        // Auto-fill form
        const nameInput = document.getElementById('workout-name-enhanced');
        const caloriesInput = document.getElementById('workout-calories-enhanced');
        
        if (nameInput) nameInput.value = exercise.name;
        if (caloriesInput) {
            const duration = parseInt(document.getElementById('workout-duration-enhanced').value) || 30;
            const calories = Math.round((exercise.calories * duration) / 60);
            caloriesInput.value = calories;
        }
        
        this.showToast(`Selected ${exercise.name}`, 'info');
    }

    logWorkout() {
        const workout = {
            id: Date.now(),
            type: document.getElementById('workout-type-enhanced').value,
            name: document.getElementById('workout-name-enhanced').value,
            duration: parseInt(document.getElementById('workout-duration-enhanced').value),
            calories: parseInt(document.getElementById('workout-calories-enhanced').value) || 0,
            intensity: document.getElementById('workout-intensity').value,
            notes: document.getElementById('workout-notes-enhanced').value,
            date: new Date().toISOString()
        };

        // Save workout
        const workouts = this.storage.get('workouts') || [];
        workouts.push(workout);
        this.storage.set('workouts', workouts);

        // Update display
        this.updateWorkoutDisplay();
        this.updateQuickStats();
        
        // Update streak
        this.updateWorkoutStreak();
        
        // Show success message
        this.showToast(`Logged workout: ${workout.name}`, 'success');
        
        // Reset form
        document.getElementById('workout-form-enhanced').reset();
    }

    updateWorkoutStreak() {
        const workouts = this.storage.get('workouts') || [];
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let streak = this.storage.get('workout_streak') || { days: 0, lastDate: '' };
        
        if (streak.lastDate === today) {
            // Already logged today
            return;
        }
        
        if (streak.lastDate === yesterday) {
            // Consecutive day
            streak.days++;
        } else {
            // New streak
            streak.days = 1;
        }
        
        streak.lastDate = today;
        this.storage.set('workout_streak', streak);
        
        // Update display
        const streakElement = document.getElementById('workout-streak-days');
        if (streakElement) streakElement.textContent = streak.days;
        
        // Check achievements
        this.checkWorkoutAchievements(streak.days);
    }

    // Enhanced TaskForge
    initializeTaskForge() {
        // View toggle
        const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchTaskView(view);
                
                // Update active state
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Kanban drag and drop
        this.initializeKanban();

        // Eisenhower matrix
        this.initializeEisenhowerMatrix();
    }

    switchTaskView(view) {
        // Hide all views
        document.querySelectorAll('.taskforge-view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${view}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.loadTaskView(view);
        }
    }

    initializeKanban() {
        const kanbanColumns = document.querySelectorAll('.kanban-column');
        
        kanbanColumns.forEach(column => {
            const content = column.querySelector('.kanban-content');
            
            // Make draggable
            content.addEventListener('dragover', (e) => {
                e.preventDefault();
                content.classList.add('drag-over');
            });
            
            content.addEventListener('dragleave', () => {
                content.classList.remove('drag-over');
            });
            
            content.addEventListener('drop', (e) => {
                e.preventDefault();
                content.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.getAttribute('data-status');
                
                this.moveTaskToStatus(taskId, newStatus);
            });
        });
    }

    moveTaskToStatus(taskId, newStatus) {
        const todos = this.storage.get('todos') || [];
        const taskIndex = todos.findIndex(t => t.id == taskId);
        
        if (taskIndex !== -1) {
            todos[taskIndex].status = newStatus;
            this.storage.set('todos', todos);
            this.updateTaskDisplay();
            this.showToast('Task moved', 'success');
        }
    }

    initializeEisenhowerMatrix() {
        // Tasks will be automatically categorized based on priority and due date
        this.updateEisenhowerMatrix();
    }

    updateEisenhowerMatrix() {
        const todos = this.storage.get('todos') || [];
        const now = new Date();
        
        const quadrants = {
            urgentImportant: [],    // Do First
            notUrgentImportant: [], // Schedule
            urgentNotImportant: [], // Delegate
            notUrgentNotImportant: [] // Eliminate
        };
        
        todos.forEach(task => {
            if (!task.completed) {
                const isUrgent = task.priority === 'high' || 
                    (task.due && new Date(task.due) - now < 86400000 * 2); // Due in 2 days
                const isImportant = task.priority === 'high' || task.priority === 'medium';
                
                if (isUrgent && isImportant) {
                    quadrants.urgentImportant.push(task);
                } else if (!isUrgent && isImportant) {
                    quadrants.notUrgentImportant.push(task);
                } else if (isUrgent && !isImportant) {
                    quadrants.urgentNotImportant.push(task);
                } else {
                    quadrants.notUrgentNotImportant.push(task);
                }
            }
        });
        
        // Update each quadrant
        ['urgentImportant', 'notUrgentImportant', 'urgentNotImportant', 'notUrgentNotImportant'].forEach((quadrant, index) => {
            const container = document.getElementById(`quadrant-${index + 1}`);
            if (container) {
                container.innerHTML = quadrants[quadrant].map(task => `
                    <div class="matrix-task" draggable="true" data-id="${task.id}">
                        ${task.task}
                        <small>${task.priority} priority</small>
                    </div>
                `).join('');
            }
        });
    }

    // Enhanced EduPlan
    initializeEduPlan() {
        // Color coding for timetable
        this.initializeTimetableColors();
        
        // Pomodoro timer
        this.initializePomodoro();
        
        // File attachments for homework
        this.initializeFileAttachments();
        
        // Exam countdown
        this.initializeExamCountdowns();
        
        // Grade trends
        this.initializeGradeTrends();
    }

    initializeTimetableColors() {
        const colorInput = document.getElementById('course-color');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                this.storage.set('timetable_color', e.target.value);
            });
        }
        
        // Load saved color
        const savedColor = this.storage.get('timetable_color') || '#667eea';
        if (colorInput) colorInput.value = savedColor;
    }

    initializePomodoro() {
        let pomodoroInterval;
        let isRunning = false;
        let timeLeft = 25 * 60; // 25 minutes in seconds
        
        const startBtn = document.getElementById('start-pomodoro');
        const pauseBtn = document.getElementById('pause-pomodoro');
        const resetBtn = document.getElementById('reset-pomodoro');
        const timerDisplay = document.getElementById('pomodoro-timer');
        
        if (!startBtn || !timerDisplay) return;
        
        const updateDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                pomodoroInterval = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    
                    if (timeLeft <= 0) {
                        clearInterval(pomodoroInterval);
                        isRunning = false;
                        this.showNotification('Pomodoro Complete!', 'Time for a break! 🎉', 'success');
                        // Start break timer
                        timeLeft = 5 * 60; // 5 minute break
                        updateDisplay();
                    }
                }, 1000);
            }
        });
        
        pauseBtn?.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(pomodoroInterval);
                isRunning = false;
            }
        });
        
        resetBtn?.addEventListener('click', () => {
            clearInterval(pomodoroInterval);
            isRunning = false;
            timeLeft = 25 * 60;
            updateDisplay();
        });
        
        updateDisplay();
    }

    // Data export/import
    async exportData() {
        const data = {
            water: this.storage.get('water_data'),
            workouts: this.storage.get('workouts'),
            todos: this.storage.get('todos'),
            courses: this.storage.get('courses'),
            grades: this.storage.get('grades'),
            settings: this.storage.get('settings'),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifesphere-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Validate data
                if (!data.version) {
                    throw new Error('Invalid backup file');
                }
                
                // Import data
                if (data.water) this.storage.set('water_data', data.water);
                if (data.workouts) this.storage.set('workouts', data.workouts);
                if (data.todos) this.storage.set('todos', data.todos);
                if (data.courses) this.storage.set('courses', data.courses);
                if (data.grades) this.storage.set('grades', data.grades);
                if (data.settings) this.storage.set('settings', data.settings);
                
                // Reload all data
                this.loadAllData();
                this.showToast('Data imported successfully', 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import data', 'error');
            }
        };
        
        input.click();
    }

    exportAllData() {
        // Export everything including history
        const allData = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key);
            }
        });
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifesphere-full-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Full backup exported', 'success');
    }

    // Time management
    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        // Update date if needed
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Notification system
    showNotification(title, message, type = 'info') {
        const notification = document.getElementById('custom-notification');
        if (!notification) return;
        
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').textContent = message;
        
        // Set icon based on type
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const iconElement = notification.querySelector('.notification-icon');
        if (iconElement) iconElement.textContent = iconMap[type] || '🔔';
        
        // Show notification
        notification.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.onclick = () => {
                notification.style.display = 'none';
            };
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-toast';
        achievement.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-desc">${description}</div>
            </div>
        `;
        
        document.body.appendChild(achievement);
        
        // Animate in
        setTimeout(() => achievement.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => achievement.remove(), 300);
        }, 5000);
    }

    // Background services
    startBackgroundServices() {
        // Update quick stats every minute
        setInterval(() => this.updateQuickStats(), 60000);
        
        // Check for notifications
        setInterval(() => this.checkNotifications(), 30000);
        
        // Save data periodically
        setInterval(() => this.autoSave(), 300000); // Every 5 minutes
        
        // Update streaks daily
        this.updateDailyStreaks();
    }

    updateQuickStats() {
        // Water
        const waterData = this.storage.get('water_data') || {};
        const today = new Date().toDateString();
        const todayWater = waterData[today]?.consumed || 0;
        const waterGoal = waterData[today]?.goal || 8;
        document.getElementById('quick-water').textContent = `${todayWater}/${waterGoal}`;
        
        // Screen time
        const screenData = this.storage.get('screen_data') || { seconds: 0 };
        const screenHours = Math.floor(screenData.seconds / 3600);
        document.getElementById('quick-screen').textContent = `${screenHours}h`;
        
        // Tasks
        const todos = this.storage.get('todos') || [];
        const pendingTasks = todos.filter(t => !t.completed).length;
        document.getElementById('quick-tasks').textContent = `0/${pendingTasks}`;
        
        // Update sidebar stats
        this.updateSidebarStats();
    }

    updateSidebarStats() {
        // Workouts this week
        const workouts = this.storage.get('workouts') || [];
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const weekWorkouts = workouts.filter(w => new Date(w.date) > weekAgo).length;
        document.getElementById('sidebar-workouts').textContent = weekWorkouts;
        
        // Study hours today
        const studySessions = this.storage.get('study_sessions') || [];
        const today = new Date().toDateString();
        const todayStudy = studySessions
            .filter(s => new Date(s.startTime).toDateString() === today)
            .reduce((sum, s) => sum + (s.duration || 0), 0);
        const studyHours = Math.floor(todayStudy / 60);
        document.getElementById('sidebar-study').textContent = `${studyHours}h`;
        
        // Tasks done today
        const todos = this.storage.get('todos') || [];
        const tasksDone = todos.filter(t => t.completed && 
            new Date(t.completedAt || t.created).toDateString() === today).length;
        document.getElementById('sidebar-tasks').textContent = tasksDone;
        
        // Sleep average
        const sleeps = this.storage.get('sleeps') || [];
        if (sleeps.length > 0) {
            const avgSleep = sleeps.reduce((sum, s) => sum + s.duration, 0) / sleeps.length;
            const avgHours = Math.floor(avgSleep / 60);
            document.getElementById('sidebar-sleep').textContent = `${avgHours}h`;
        }
    }

    checkNotifications() {
        // Check for water reminders
        this.checkWaterReminders();
        
        // Check for medication reminders
        this.checkMedicationReminders();
        
        // Check for upcoming events
        this.checkUpcomingEvents();
    }

    checkWaterReminders() {
        const settings = this.storage.get('water_settings') || {};
        if (!settings.remindersEnabled) return;
        
        const waterData = this.storage.get('water_data') || {};
        const today = new Date().toDateString();
        const todayWater = waterData[today]?.consumed || 0;
        const goal = waterData[today]?.goal || 8;
        
        const percentage = (todayWater / goal) * 100;
        const hour = new Date().getHours();
        
        // Remind at specific times if below certain percentage
        const reminderTimes = [9, 12, 15, 18, 21]; // 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
        if (reminderTimes.includes(hour) && percentage < (hour/24) * 100) {
            this.showNotification(
                '💧 Time to Hydrate!',
                `You've only had ${todayWater} glasses today. ${goal - todayWater} more to reach your goal!`,
                'info'
            );
        }
    }

    autoSave() {
        // Create backup
        const backup = {};
        const keys = ['water_data', 'workouts', 'todos', 'courses', 'grades', 'settings'];
        
        keys.forEach(key => {
            backup[key] = this.storage.get(key);
        });
        
        this.storage.set('last_backup', {
            data: backup,
            timestamp: new Date().toISOString()
        });
        
        console.log('Auto-save completed');
    }

    updateDailyStreaks() {
        // Check and update streaks at midnight
        const now = new Date();
        const lastCheck = this.storage.get('last_streak_check') || '';
        const today = now.toDateString();
        
        if (lastCheck !== today) {
            // Update all streaks
            this.updateWaterStreak();
            this.updateWorkoutStreak();
            
            // Save check date
            this.storage.set('last_streak_check', today);
        }
    }

    // Load data methods
    loadAllData() {
        this.updateQuickStats();
        this.updateSidebarStats();
        this.updateWaterDisplay();
        this.updateWorkoutDisplay();
        this.updateTaskDisplay();
        this.updateEduPlanDisplay();
    }

    loadTabData(tabId) {
        switch(tabId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'water':
                this.updateWaterTracker();
                break;
            case 'workout':
                this.updateWorkoutTracker();
                break;
            case 'taskforge':
                this.updateTaskForge();
                break;
            case 'eduplan':
                this.updateEduPlan();
                break;
        }
    }

    // Update methods for each module
    updateDashboard() {
        this.updateWeeklyChart();
        this.updateTodayOverview();
        this.updateUpcomingEvents();
    }

    updateWaterTracker() {
        this.updateWaterChart();
        this.updateWaterHistory();
        this.updateWaterAchievements();
    }

    updateWorkoutTracker() {
        this.updateWorkoutHistory();
        this.updateWorkoutCharts();
    }

    updateTaskForge() {
        this.updateTaskDisplay();
        this.updateKanbanBoard();
        this.updateEisenhowerMatrix();
    }

    updateEduPlan() {
        this.updateTimetable();
        this.updateStudyTracker();
        this.updateHomework();
        this.updateExams();
        this.updateGrades();
    }

    // Chart initialization
    updateWeeklyChart() {
        const ctx = document.getElementById('weekly-chart');
        if (!ctx) return;
        
        // Sample data - replace with actual data
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Water Intake',
                    data: [6, 8, 7, 9, 8, 7, 8],
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Workouts',
                    data: [1, 2, 1, 3, 2, 1, 2],
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Study Hours',
                    data: [2, 3, 2, 4, 3, 1, 2],
                    borderColor: '#ed8936',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    tension: 0.4
                }
            ]
        };
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Utility methods
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    calculatePercentage(part, total) {
        return total > 0 ? Math.round((part / total) * 100) : 0;
    }

    // Error handling
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.showToast(`Error: ${error.message}`, 'error');
        
        // Log error for debugging
        const errors = this.storage.get('errors') || [];
        errors.push({
            timestamp: new Date().toISOString(),
            context,
            error: error.message,
            stack: error.stack
        });
        this.storage.set('errors', errors);
    }

    // Cleanup
    cleanup() {
        // Clear intervals
        if (this.intervals) {
            this.intervals.forEach(clearInterval);
        }
        
        // Remove event listeners
        // (Implement as needed based on your specific listeners)
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lifeSphere = new LifeSphere();
});

// Handle beforeunload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.lifeSphere) {
        window.lifeSphere.cleanup();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.lifeSphere) {
        window.lifeSphere.showToast('Back online', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.lifeSphere) {
        window.lifeSphere.showToast('You are offline', 'warning');
    }
});

// Handle app visibility
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // App became visible, refresh data
        if (window.lifeSphere) {
            window.lifeSphere.updateQuickStats();
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeSphere;
}
// In the LifeSphere class, update the initializeCore method:
async initializeCore() {
    console.log('🚀 LifeSphere Enhanced v2.0 Initializing...');
    
    try {
        // 1. Check for service worker support and register
        await this.registerServiceWorker();
        
        // 2. Initialize storage with fallback
        this.storage = this.initializeStorage();
        
        // 3. Set default theme
        this.setTheme(localStorage.getItem('theme') || 'light');
        
        // 4. Initialize time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // 5. Request notification permission
        await this.requestNotificationPermission();
        
        console.log('✅ Core systems initialized');
    } catch (error) {
        console.error('❌ Core initialization error:', error);
        this.showToast('Failed to initialize core systems', 'error');
    }
}

// Add these new methods to the LifeSphere class:

/**
 * Register Service Worker
 */
async registerServiceWorker() {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported');
        return;
    }
    
    try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        
        console.log('✅ Service Worker registered:', registration);
        
        // Listen for updates
        this.setupServiceWorkerUpdates(registration);
        
        // Setup message handling
        this.setupServiceWorkerMessages();
        
        // Setup background sync if available
        this.setupBackgroundSync(registration);
        
        // Check if page was loaded via service worker
        if (navigator.serviceWorker.controller) {
            console.log('📱 Page is controlled by service worker');
            this.showToast('App is ready for offline use', 'success');
        }
        
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        this.showToast('Offline features unavailable', 'warning');
    }
}

/**
 * Setup Service Worker Update Handling
 */
setupServiceWorkerUpdates(registration) {
    // Check for immediate update
    if (registration.waiting) {
        this.showUpdateNotification();
    }
    
    // Listen for updates
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker update found:', newWorker.state);
        
        newWorker.addEventListener('statechange', () => {
            console.log('Service Worker state changed:', newWorker.state);
            
            if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    // New content is available
                    this.showUpdateNotification();
                } else {
                    // First installation
                    console.log('✅ Service Worker installed for the first time');
                    this.showToast('App is now ready for offline use!', 'success');
                }
            }
        });
    });
    
    // Track updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🎯 Service Worker controller changed');
        this.showToast('App updated successfully!', 'success');
        // Reload to get new content
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    });
}

/**
 * Show Update Notification
 */
showUpdateNotification() {
    // Check if we should show the notification
    const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
    const now = Date.now();
    
    // Only prompt once per day
    if (lastUpdatePrompt && (now - parseInt(lastUpdatePrompt)) < 86400000) {
        return;
    }
    
    // Create update notification
    const updateDiv = document.createElement('div');
    updateDiv.className = 'update-notification';
    updateDiv.innerHTML = `
        <div class="update-content">
            <span class="update-icon">🔄</span>
            <div class="update-text">
                <strong>Update Available</strong>
                <p>A new version of LifeSphere is available!</p>
            </div>
            <div class="update-actions">
                <button class="btn-primary" id="update-reload">Update Now</button>
                <button class="btn-secondary" id="update-later">Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(updateDiv);
    
    // Save prompt time
    localStorage.setItem('lastUpdatePrompt', now.toString());
    
    // Add event listeners
    document.getElementById('update-reload').addEventListener('click', () => {
        // Post message to service worker to skip waiting
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    });
    
    document.getElementById('update-later').addEventListener('click', () => {
        updateDiv.remove();
    });
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (document.body.contains(updateDiv)) {
            updateDiv.remove();
        }
    }, 30000);
}

/**
 * Setup Service Worker Message Handling
 */
setupServiceWorkerMessages() {
    navigator.serviceWorker.addEventListener('message', event => {
        const { data } = event;
        
        switch (data.type) {
            case 'SERVICE_WORKER_ERROR':
                console.error('Service Worker Error:', data.error);
                this.logError(new Error(data.error), 'Service Worker');
                break;
                
            case 'HEALTH_RESPONSE':
                console.log('Service Worker health check:', data.status);
                break;
                
            case 'SYNC_STATUS':
                if (data.status === 'completed') {
                    this.showToast('Data synced in background', 'success');
                }
                break;
                
            case 'OFFLINE_DETECTED':
                this.showToast('You are offline - changes will sync when back online', 'warning');
                break;
                
            case 'CACHE_UPDATED':
                console.log('Cache updated:', data.cacheName);
                break;
        }
    });
    
    // Send initial health check
    setTimeout(() => {
        if (navigator.serviceWorker.controller) {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                console.log('Service Worker health:', event.data);
            };
            navigator.serviceWorker.controller.postMessage(
                { type: 'HEALTH_CHECK' },
                [channel.port2]
            );
        }
    }, 5000);
}

/**
 * Setup Background Sync
 */
setupBackgroundSync(registration) {
    // Check for background sync support
    if ('sync' in registration) {
        // Register for background sync
        registration.sync.register('sync-data')
            .then(() => {
                console.log('✅ Background sync registered');
            })
            .catch(err => {
                console.warn('Background sync registration failed:', err);
            });
    }
    
    // Check for periodic sync (Chrome only)
    if ('periodicSync' in registration) {
        try {
            registration.periodicSync.register('update-cache', {
                minInterval: 24 * 60 * 60 * 1000 // 24 hours
            });
            console.log('✅ Periodic sync registered');
        } catch (error) {
            console.warn('Periodic sync not supported:', error);
        }
    }
}

/**
 * Request Notification Permission
 */
async requestNotificationPermission() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return;
    }
    
    // Check current permission
    if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted');
        await this.subscribeToPush();
        return;
    }
    
    if (Notification.permission === 'denied') {
        console.warn('Notification permission denied');
        return;
    }
    
    // Request permission (only show prompt once per session)
    const hasPrompted = sessionStorage.getItem('notificationPrompted');
    if (!hasPrompted) {
        try {
            const permission = await Notification.requestPermission();
            sessionStorage.setItem('notificationPrompted', 'true');
            
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                await this.subscribeToPush();
                this.showToast('Notifications enabled!', 'success');
            }
        } catch (error) {
            console.error('Notification permission error:', error);
        }
    }
}

/**
 * Subscribe to Push Notifications
 */
async subscribeToPush() {
    if (!('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return;
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            console.log('✅ Already subscribed to push');
            return;
        }
        
        // Subscribe to push notifications
        const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // Get from server
        const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
        
        console.log('✅ Subscribed to push notifications:', newSubscription);
        
        // Send subscription to your server (if you have one)
        // await this.sendSubscriptionToServer(newSubscription);
        
    } catch (error) {
        console.error('Push subscription failed:', error);
    }
}

/**
 * Helper: Convert VAPID key
 */
urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check Online Status
 */
checkOnlineStatus() {
    if (!navigator.onLine) {
        this.showToast('You are offline - working in offline mode', 'warning');
        // Update UI for offline mode
        document.documentElement.classList.add('offline');
        
        // Show offline indicator
        this.showOfflineIndicator();
    }
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('🌐 App is online');
        document.documentElement.classList.remove('offline');
        this.hideOfflineIndicator();
        this.showToast('Back online! Syncing data...', 'success');
        
        // Trigger sync
        this.triggerDataSync();
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 App is offline');
        document.documentElement.classList.add('offline');
        this.showOfflineIndicator();
        this.showToast('You are offline', 'warning');
    });
}

/**
 * Show Offline Indicator
 */
showOfflineIndicator() {
    let indicator = document.querySelector('.offline-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <span class="offline-icon">📶</span>
            <span class="offline-text">Offline</span>
        `;
        document.body.appendChild(indicator);
    }
}

/**
 * Hide Offline Indicator
 */
hideOfflineIndicator() {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Trigger Data Sync
 */
async triggerDataSync() {
    if (!navigator.onLine || !('serviceWorker' in navigator)) {
        return;
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        
        if ('sync' in registration) {
            await registration.sync.register('sync-data');
            console.log('🔄 Background sync triggered');
            this.showToast('Syncing data...', 'info');
        }
    } catch (error) {
        console.error('Sync trigger failed:', error);
    }
}

/**
 * Log Errors
 */
logError(error, context = 'Unknown') {
    const errorLog = this.storage.get('error_log') || [];
    errorLog.push({
        timestamp: new Date().toISOString(),
        context,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
    });
    
    // Keep only last 50 errors
    this.storage.set('error_log', errorLog.slice(-50));
    
    // Send to server if online (optional)
    if (navigator.onLine) {
        this.reportErrorToServer(error, context);
    }
}
