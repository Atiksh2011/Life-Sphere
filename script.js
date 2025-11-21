// Notification Permission
document.getElementById('notification-btn').addEventListener('click', function() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                alert('Notifications enabled! You will receive reminders for your health goals.');
                this.textContent = 'Notifications Enabled';
                this.disabled = true;
            } else {
                alert('Notifications disabled. You can enable them later in your browser settings.');
            }
        });
    } else {
        alert('This browser does not support notifications.');
    }
});

// Tab Navigation
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
    });
});

// HomeBase Navigation
const homebaseNav = document.querySelectorAll('.homebase-nav a');
const homebaseSections = document.querySelectorAll('.homebase-section');

homebaseNav.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = tab.dataset.section;
        
        // Update active tab
        homebaseNav.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target section
        homebaseSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// LifeLoop Navigation
const lifeloopNav = document.querySelectorAll('.lifeloop-nav a');
const lifeloopSections = document.querySelectorAll('.lifeloop-section');

lifeloopNav.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = tab.dataset.section;
        
        // Update active tab
        lifeloopNav.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target section
        lifeloopSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// TaskForge Navigation
const taskforgeNav = document.querySelectorAll('.taskforge-nav a');
const taskforgeSections = document.querySelectorAll('.taskforge-section');

taskforgeNav.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = tab.dataset.section;
        
        // Update active tab
        taskforgeNav.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target section
        taskforgeSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// EduPlan Navigation
const eduplanNav = document.querySelectorAll('.eduplan-nav a');
const eduplanSections = document.querySelectorAll('.eduplan-section');

eduplanNav.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = tab.dataset.section;
        
        // Update active tab
        eduplanNav.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target section
        eduplanSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// Water Tracker
let waterGoal = 8;
let waterConsumed = 0;

document.getElementById('increase-goal').addEventListener('click', function() {
    waterGoal++;
    updateWaterGoal();
});

document.getElementById('decrease-goal').addEventListener('click', function() {
    if (waterGoal > 1) {
        waterGoal--;
        updateWaterGoal();
    }
});

document.getElementById('add-glass').addEventListener('click', function() {
    waterConsumed++;
    updateWaterDisplay();
    saveWaterData();
});

document.getElementById('reset-water').addEventListener('click', function() {
    waterConsumed = 0;
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
    document.getElementById('water-goal').textContent = waterGoal;
    document.getElementById('water-target').textContent = waterGoal;
    updateWaterDisplay();
    saveWaterData();
}

function updateWaterDisplay() {
    const percentage = Math.min(100, (waterConsumed / waterGoal) * 100);
    
    // Update dashboard
    document.getElementById('water-today').textContent = `${waterConsumed}/${waterGoal} glasses`;
    document.getElementById('water-progress').style.width = `${percentage}%`;
    
    // Update water tracker tab
    document.getElementById('water-consumed').textContent = waterConsumed;
    document.getElementById('water-percentage').textContent = `${percentage.toFixed(0)}%`;
    document.getElementById('water-fill').style.height = `${percentage}%`;
    
    // Update cups in dashboard
    document.querySelectorAll('.cup').forEach((cup, index) => {
        if (index < waterConsumed) {
            cup.classList.add('drank');
        } else {
            cup.classList.remove('drank');
        }
    });
}

function saveWaterData() {
    const today = new Date().toDateString();
    const waterData = {
        date: today,
        consumed: waterConsumed,
        goal: waterGoal
    };
    
    let allWaterData = JSON.parse(localStorage.getItem('vitalsyncWater')) || {};
    allWaterData[today] = waterData;
    localStorage.setItem('vitalsyncWater', JSON.stringify(allWaterData));
    
    updateWaterHistory();
}

function loadWaterData() {
    const today = new Date().toDateString();
    const allWaterData = JSON.parse(localStorage.getItem('vitalsyncWater')) || {};
    
    if (allWaterData[today]) {
        waterConsumed = allWaterData[today].consumed;
        waterGoal = allWaterData[today].goal;
    }
    
    updateWaterDisplay();
    updateWaterHistory();
}

function updateWaterHistory() {
    const allWaterData = JSON.parse(localStorage.getItem('vitalsyncWater')) || {};
    const historyBody = document.getElementById('water-history-body');
    
    let historyHTML = '';
    const sortedDates = Object.keys(allWaterData).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.slice(0, 7).forEach(date => {
        const data = allWaterData[date];
        const percentage = Math.min(100, (data.consumed / data.goal) * 100);
        const formattedDate = new Date(date).toLocaleDateString();
        
        historyHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${data.consumed}/${data.goal}</td>
                <td>${percentage.toFixed(0)}%</td>
            </tr>
        `;
    });
    
    historyBody.innerHTML = historyHTML;
}

// Workout Logger
document.getElementById('workout-form').addEventListener('submit', function(e) {
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

function saveWorkout(workout) {
    let workouts = JSON.parse(localStorage.getItem('vitalsyncWorkouts')) || [];
    workouts.push(workout);
    localStorage.setItem('vitalsyncWorkouts', JSON.stringify(workouts));
    
    updateWorkoutDisplay();
}

function updateWorkoutDisplay() {
    const workouts = JSON.parse(localStorage.getItem('vitalsyncWorkouts')) || [];
    const workoutList = document.getElementById('workout-list');
    const period = document.getElementById('workout-period').value;
    
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
    
    document.getElementById('total-workouts').textContent = totalWorkouts;
    document.getElementById('total-duration').textContent = `${totalDuration} min`;
    document.getElementById('total-calories').textContent = totalCalories;
    
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
            </div>
        `;
    });
    
    workoutList.innerHTML = workoutHTML;
    
    // Update dashboard
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= thisWeek).length;
    document.getElementById('workouts-week').textContent = `${weekWorkouts} workouts`;
}

document.getElementById('workout-period').addEventListener('change', updateWorkoutDisplay);

// Habit Tracker
document.getElementById('habit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const habit = {
        id: Date.now(),
        name: document.getElementById('habit-name').value,
        category: document.getElementById('habit-category').value,
        frequency: document.getElementById('habit-frequency').value,
        reminder: document.getElementById('habit-reminder').value,
        created: new Date().toISOString(),
        completions: []
    };
    
    saveHabit(habit);
    this.reset();
});

function saveHabit(habit) {
    let habits = JSON.parse(localStorage.getItem('vitalsyncHabits')) || [];
    habits.push(habit);
    localStorage.setItem('vitalsyncHabits', JSON.stringify(habits));
    
    updateHabitDisplay();
}

function updateHabitDisplay() {
    const habits = JSON.parse(localStorage.getItem('vitalsyncHabits')) || [];
    const habitsGrid = document.getElementById('habits-grid');
    const todayHabitsList = document.getElementById('today-habits-list');
    
    // Update dashboard
    const today = new Date().toDateString();
    let todayCompleted = 0;
    let todayTotal = 0;
    
    let todayHabitsHTML = '';
    let habitsHTML = '';
    
    habits.forEach(habit => {
        const isTodayCompleted = habit.completions.includes(today);
        const habitElement = `
            <div class="habit-item">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-category">${habit.category}</div>
                <div class="habit-actions">
                    <div class="habit-check ${isTodayCompleted ? 'checked' : ''}" data-habit-id="${habit.id}">
                        ${isTodayCompleted ? '✓' : ''}
                    </div>
                </div>
            </div>
        `;
        
        habitsHTML += habitElement;
        
        if (habit.frequency === 'daily') {
            todayTotal++;
            if (isTodayCompleted) todayCompleted++;
            
            todayHabitsHTML += `
                <div class="habit-item">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-actions">
                        <div class="habit-check ${isTodayCompleted ? 'checked' : ''}" data-habit-id="${habit.id}">
                            ${isTodayCompleted ? '✓' : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    habitsGrid.innerHTML = habitsHTML;
    todayHabitsList.innerHTML = todayHabitsHTML;
    
    // Update dashboard stats
    document.getElementById('habits-today').textContent = `${todayCompleted}/${todayTotal} habits`;
    const progressPercentage = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;
    document.getElementById('habits-progress').style.width = `${progressPercentage}%`;
    
    // Update habit stats
    document.getElementById('today-progress').textContent = `${todayCompleted}/${todayTotal}`;
    
    // Add event listeners to habit checkboxes
    document.querySelectorAll('.habit-check').forEach(check => {
        check.addEventListener('click', function() {
            const habitId = parseInt(this.dataset.habitId);
            toggleHabitCompletion(habitId);
        });
    });
}

function toggleHabitCompletion(habitId) {
    const habits = JSON.parse(localStorage.getItem('vitalsyncHabits')) || [];
    const today = new Date().toDateString();
    
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
        const habit = habits[habitIndex];
        const completionIndex = habit.completions.indexOf(today);
        
        if (completionIndex === -1) {
            habit.completions.push(today);
        } else {
            habit.completions.splice(completionIndex, 1);
        }
        
        localStorage.setItem('vitalsyncHabits', JSON.stringify(habits));
        updateHabitDisplay();
    }
}

// Medication Tracker
document.getElementById('add-time').addEventListener('click', function() {
    const timesContainer = document.getElementById('med-times');
    const newTimeInput = document.createElement('input');
    newTimeInput.type = 'time';
    newTimeInput.className = 'form-control med-time';
    newTimeInput.required = true;
    timesContainer.appendChild(newTimeInput);
});

document.getElementById('medication-form').addEventListener('submit', function(e) {
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

function saveMedication(medication) {
    let medications = JSON.parse(localStorage.getItem('vitalsyncMedications')) || [];
    medications.push(medication);
    localStorage.setItem('vitalsyncMedications', JSON.stringify(medications));
    
    updateMedicationDisplay();
}

function updateMedicationDisplay() {
    const medications = JSON.parse(localStorage.getItem('vitalsyncMedications')) || [];
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
                </div>
                <div class="med-times">
                    ${med.times.map(time => `
                        <div class="med-time-item">${time}</div>
                    `).join('')}
                </div>
            </div>
        `;
        
        allMedsHTML += medElement;
        
        // For today's medications, we'd check if it's scheduled for today
        // For simplicity, we'll show all medications with daily frequency
        if (med.frequency === 'once' || med.frequency === 'twice' || med.frequency === 'thrice') {
            todayMedsHTML += medElement;
        }
    });
    
    todayMedsList.innerHTML = todayMedsHTML;
    medsList.innerHTML = allMedsHTML;
    
    // Update dashboard
    document.getElementById('meds-today').textContent = `0/${medications.filter(m => 
        m.frequency === 'once' || m.frequency === 'twice' || m.frequency === 'thrice').length} taken`;
}

// Meal Planner
document.getElementById('meal-plan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const meal = {
        id: Date.now(),
        date: document.getElementById('meal-date').value,
        type: document.getElementById('meal-type').value,
        name: document.getElementById('meal-name').value,
        calories: document.getElementById('meal-calories').value ? parseInt(document.getElementById('meal-calories').value) : null,
        recipe: document.getElementById('meal-recipe').value,
        created: new Date().toISOString()
    };
    
    saveMeal(meal);
    this.reset();
});

function saveMeal(meal) {
    let meals = JSON.parse(localStorage.getItem('vitalsyncMeals')) || [];
    meals.push(meal);
    localStorage.setItem('vitalsyncMeals', JSON.stringify(meals));
    
    updateMealDisplay();
}

function updateMealDisplay() {
    const meals = JSON.parse(localStorage.getItem('vitalsyncMeals')) || [];
    const weeklyMealPlan = document.getElementById('weekly-meal-plan');
    
    // Group meals by date
    const mealsByDate = {};
    meals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });
    
    // Generate weekly view (simplified - just show next 7 days)
    let weeklyHTML = '';
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const dayMeals = mealsByDate[dateString] || [];
        
        weeklyHTML += `
            <div class="day-meals">
                <div class="day-header">${dayName}<br>${dateFormatted}</div>
                ${dayMeals.map(meal => `
                    <div class="meal-item">
                        <strong>${meal.type}:</strong> ${meal.name}
                        ${meal.calories ? `<br>${meal.calories} cal` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    weeklyMealPlan.innerHTML = weeklyHTML;
    
    // Update meal stats
    const thisWeekMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return mealDate >= weekStart && mealDate <= weekEnd;
    });
    
    const totalCalories = thisWeekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const avgCalories = thisWeekMeals.length > 0 ? Math.round(totalCalories / thisWeekMeals.length) : 0;
    
    document.getElementById('avg-calories').textContent = `${avgCalories} cal`;
    document.getElementById('planned-meals').textContent = thisWeekMeals.length;
}

// Screen Time Tracker
let screenTracking = false;
let screenStartTime = null;
let screenTimeToday = 0; // in minutes

document.getElementById('start-tracking').addEventListener('click', function() {
    if (!screenTracking) {
        screenTracking = true;
        screenStartTime = new Date();
        this.disabled = true;
        document.getElementById('stop-tracking').disabled = false;
        
        // In a real app, you would start tracking actual screen time
        // For this demo, we'll simulate with a timer
        screenTimer = setInterval(() => {
            screenTimeToday++;
            updateScreenDisplay();
        }, 1000); // Update every second for demo purposes
    }
});

document.getElementById('stop-tracking').addEventListener('click', function() {
    if (screenTracking) {
        screenTracking = false;
        document.getElementById('start-tracking').disabled = false;
        this.disabled = true;
        
        if (screenTimer) {
            clearInterval(screenTimer);
        }
        
        saveScreenData();
    }
});

document.getElementById('add-manual').addEventListener('click', function() {
    const minutes = prompt('Enter screen time in minutes:');
    if (minutes && !isNaN(minutes)) {
        screenTimeToday += parseInt(minutes);
        updateScreenDisplay();
        saveScreenData();
    }
});

document.getElementById('screen-goal').addEventListener('change', function() {
    updateScreenDisplay();
    saveScreenData();
});

function updateScreenDisplay() {
    const hours = Math.floor(screenTimeToday / 60);
    const minutes = screenTimeToday % 60;
    
    document.getElementById('screen-hours').textContent = hours;
    document.getElementById('screen-minutes').textContent = minutes;
    
    // Update dashboard
    document.getElementById('screen-today').textContent = `${hours}h ${minutes}m`;
    
    // Update progress
    const goalHours = parseInt(document.getElementById('screen-goal').value);
    const goalMinutes = goalHours * 60;
    const percentage = Math.min(100, (screenTimeToday / goalMinutes) * 100);
    
    document.getElementById('screen-progress').style.width = `${percentage}%`;
    document.getElementById('screen-goal-text').textContent = `${percentage.toFixed(0)}% of daily goal`;
}

function saveScreenData() {
    const today = new Date().toDateString();
    const screenData = {
        date: today,
        minutes: screenTimeToday,
        goal: parseInt(document.getElementById('screen-goal').value)
    };
    
    let allScreenData = JSON.parse(localStorage.getItem('vitalsyncScreen')) || {};
    allScreenData[today] = screenData;
    localStorage.setItem('vitalsyncScreen', JSON.stringify(allScreenData));
}

function loadScreenData() {
    const today = new Date().toDateString();
    const allScreenData = JSON.parse(localStorage.getItem('vitalsyncScreen')) || {};
    
    if (allScreenData[today]) {
        screenTimeToday = allScreenData[today].minutes;
        document.getElementById('screen-goal').value = allScreenData[today].goal;
    }
    
    updateScreenDisplay();
}

// Sleep Tracker
document.querySelectorAll('.quality-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.quality-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('sleep-quality-value').value = this.dataset.quality;
    });
});

document.getElementById('sleep-form').addEventListener('submit', function(e) {
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

function saveSleep(sleep) {
    let sleeps = JSON.parse(localStorage.getItem('vitalsyncSleep')) || [];
    sleeps.push(sleep);
    localStorage.setItem('vitalsyncSleep', JSON.stringify(sleeps));
    
    updateSleepDisplay();
}

function updateSleepDisplay() {
    const sleeps = JSON.parse(localStorage.getItem('vitalsyncSleep')) || [];
    const sleepHistoryList = document.getElementById('sleep-history-list');
    
    // Update dashboard with last night's sleep
    if (sleeps.length > 0) {
        const lastSleep = sleeps[sleeps.length - 1];
        const hours = Math.floor(lastSleep.duration / 60);
        const minutes = lastSleep.duration % 60;
        document.getElementById('sleep-last').textContent = `${hours}h ${minutes}m`;
    }
    
    // Update sleep history
    let historyHTML = '';
    
    sleeps.slice(-5).reverse().forEach(sleep => {
        const hours = Math.floor(sleep.duration / 60);
        const minutes = sleep.duration % 60;
        const date = new Date(sleep.date).toLocaleDateString();
        
        historyHTML += `
            <div class="sleep-item">
                <div>${date}</div>
                <div>${hours}h ${minutes}m</div>
                <div>Quality: ${sleep.quality}/5</div>
            </div>
        `;
    });
    
    sleepHistoryList.innerHTML = historyHTML;
    
    // Update sleep stats
    if (sleeps.length > 0) {
        const totalDuration = sleeps.reduce((sum, sleep) => sum + sleep.duration, 0);
        const avgDuration = totalDuration / sleeps.length;
        const avgHours = Math.floor(avgDuration / 60);
        const avgMinutes = Math.round(avgDuration % 60);
        
        document.getElementById('avg-sleep').textContent = `${avgHours}h ${avgMinutes}m`;
        
        // Calculate consistency (simplified - percentage of days with sleep logged)
        const uniqueDates = new Set(sleeps.map(s => s.date));
        const consistency = (uniqueDates.size / 7) * 100; // Assuming a week
        document.getElementById('sleep-consistency').textContent = `${Math.min(100, consistency).toFixed(0)}%`;
        
        // Find best quality
        const bestQuality = Math.max(...sleeps.map(s => s.quality));
        document.getElementById('best-quality').textContent = `${bestQuality}/5`;
    }
}

// Grocery List (HomeBase)
document.getElementById('grocery-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const item = {
        id: Date.now(),
        name: document.getElementById('grocery-item').value,
        category: document.getElementById('grocery-category').value,
        quantity: parseInt(document.getElementById('grocery-quantity').value),
        added: new Date().toISOString()
    };
    
    saveGroceryItem(item);
    this.reset();
});

function saveGroceryItem(item) {
    let groceries = JSON.parse(localStorage.getItem('vitalsyncGroceries')) || [];
    groceries.push(item);
    localStorage.setItem('vitalsyncGroceries', JSON.stringify(groceries));
    
    updateGroceryDisplay();
}

function updateGroceryDisplay() {
    const groceries = JSON.parse(localStorage.getItem('vitalsyncGroceries')) || [];
    const shoppingList = document.getElementById('shopping-list');
    const inventoryList = document.getElementById('inventory-list');
    
    let shoppingHTML = '';
    let inventoryHTML = '';
    
    // For demo, we'll consider all items as shopping list items
    // In a real app, you'd have a way to move items to inventory
    groceries.forEach(item => {
        const itemHTML = `
            <div class="grocery-item">
                <div>${item.name} (${item.quantity})</div>
                <div class="grocery-actions">
                    <button class="btn-buy" data-id="${item.id}">Buy</button>
                    <button class="btn-remove" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
        
        shoppingHTML += itemHTML;
    });
    
    shoppingList.innerHTML = shoppingHTML;
    inventoryList.innerHTML = inventoryHTML;
    
    // Add event listeners
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            // In a real app, this would move the item to inventory
            removeGroceryItem(id);
        });
    });
    
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            removeGroceryItem(id);
        });
    });
}

function removeGroceryItem(id) {
    let groceries = JSON.parse(localStorage.getItem('vitalsyncGroceries')) || [];
    groceries = groceries.filter(item => item.id !== id);
    localStorage.setItem('vitalsyncGroceries', JSON.stringify(groceries));
    
    updateGroceryDisplay();
}

// Budget Tracker (HomeBase)
document.getElementById('update-budget').addEventListener('click', function() {
    const budget = parseInt(document.getElementById('monthly-budget').value);
    saveBudget(budget);
});

function saveBudget(budget) {
    localStorage.setItem('vitalsyncBudget', budget.toString());
    updateBudgetDisplay();
}

function updateBudgetDisplay() {
    const budget = parseInt(localStorage.getItem('vitalsyncBudget')) || 5000;
    const groceries = JSON.parse(localStorage.getItem('vitalsyncGroceries')) || [];
    
    // Calculate spent (simplified - assume each item costs 100)
    const spent = groceries.length * 100;
    const remaining = budget - spent;
    const percentage = Math.min(100, (spent / budget) * 100);
    
    document.getElementById('monthly-budget').value = budget;
    document.getElementById('budget-spent').textContent = `₹${spent}`;
    document.getElementById('budget-remaining').textContent = `₹${remaining}`;
    document.getElementById('budget-progress').style.width = `${percentage}%`;
}

// To-Do List (TaskForge)
document.getElementById('todo-form').addEventListener('submit', function(e) {
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

function saveTodo(task) {
    let todos = JSON.parse(localStorage.getItem('vitalsyncTodos')) || [];
    todos.push(task);
    localStorage.setItem('vitalsyncTodos', JSON.stringify(todos));
    
    updateTodoDisplay();
}

function updateTodoDisplay() {
    const todos = JSON.parse(localStorage.getItem('vitalsyncTodos')) || [];
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    
    let todoHTML = '';
    let completedHTML = '';
    
    todos.forEach(task => {
        const taskHTML = `
            <div class="todo-item ${task.completed ? 'completed' : ''}">
                <div>${task.task}</div>
                <div class="todo-actions">
                    <span class="todo-priority priority-${task.priority}">${task.priority}</span>
                    ${!task.completed ? 
                        `<button class="btn-complete" data-id="${task.id}">Complete</button>` : 
                        `<button class="btn-delete" data-id="${task.id}">Delete</button>`
                    }
                </div>
            </div>
        `;
        
        if (task.completed) {
            completedHTML += taskHTML;
        } else {
            todoHTML += taskHTML;
        }
    });
    
    todoList.innerHTML = todoHTML;
    completedList.innerHTML = completedHTML;
    
    // Add event listeners
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            completeTodo(id);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteTodo(id);
        });
    });
}

function completeTodo(id) {
    let todos = JSON.parse(localStorage.getItem('vitalsyncTodos')) || [];
    const taskIndex = todos.findIndex(t => t.id === id);
    
    if (taskIndex !== -1) {
        todos[taskIndex].completed = true;
        localStorage.setItem('vitalsyncTodos', JSON.stringify(todos));
        updateTodoDisplay();
    }
}

function deleteTodo(id) {
    let todos = JSON.parse(localStorage.getItem('vitalsyncTodos')) || [];
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('vitalsyncTodos', JSON.stringify(todos));
    
    updateTodoDisplay();
}

// Timetable (EduPlan)
document.getElementById('timetable-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const course = {
        id: Date.now(),
        name: document.getElementById('course-name').value,
        day: document.getElementById('course-day').value,
        time: document.getElementById('course-time').value,
        duration: parseInt(document.getElementById('course-duration').value),
        created: new Date().toISOString()
    };
    
    saveCourse(course);
    this.reset();
});

function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('vitalsyncCourses')) || [];
    courses.push(course);
    localStorage.setItem('vitalsyncCourses', JSON.stringify(courses));
    
    updateTimetableDisplay();
}

function updateTimetableDisplay() {
    const courses = JSON.parse(localStorage.getItem('vitalsyncCourses')) || [];
    const timetableView = document.getElementById('timetable-view');
    
    // Create timetable grid
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    let timetableHTML = '';
    
    // Header row
    timetableHTML += '<div class="timetable-cell timetable-header">Time</div>';
    days.forEach(day => {
        timetableHTML += `<div class="timetable-cell timetable-header">${day.charAt(0).toUpperCase() + day.slice(1)}</div>`;
    });
    
    // Time slots
    timeSlots.forEach(time => {
        timetableHTML += `<div class="timetable-cell timetable-header">${time}</div>`;
        
        days.forEach(day => {
            const cellCourses = courses.filter(course => 
                course.day === day && 
                course.time.startsWith(time.split(':')[0])
            );
            
            timetableHTML += `<div class="timetable-cell">`;
            
            cellCourses.forEach(course => {
                timetableHTML += `<div class="course-slot">${course.name}</div>`;
            });
            
            timetableHTML += `</div>`;
        });
    });
    
    timetableView.innerHTML = timetableHTML;
}

// Study Tracker (EduPlan)
document.getElementById('study-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studySession = {
        id: Date.now(),
        subject: document.getElementById('study-subject').value,
        topic: document.getElementById('study-topic').value,
        duration: parseInt(document.getElementById('study-duration').value),
        startTime: new Date().toISOString(),
        endTime: null // Will be set when session ends
    };
    
    // In a real app, you would start a timer and set endTime when done
    // For this demo, we'll just save it as completed
    studySession.endTime = new Date(Date.now() + studySession.duration * 60 * 1000).toISOString();
    
    saveStudySession(studySession);
    this.reset();
});

function saveStudySession(session) {
    let studySessions = JSON.parse(localStorage.getItem('vitalsyncStudySessions')) || [];
    studySessions.push(session);
    localStorage.setItem('vitalsyncStudySessions', JSON.stringify(studySessions));
    
    updateStudyDisplay();
}

function updateStudyDisplay() {
    const studySessions = JSON.parse(localStorage.getItem('vitalsyncStudySessions')) || [];
    const studySessionsList = document.getElementById('study-sessions');
    
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
    
    document.getElementById('study-today').textContent = `${todayHours}h ${todayMinutes}m`;
    document.getElementById('study-week').textContent = `${weekHours}h ${weekMinutes}m`;
    document.getElementById('study-total').textContent = `${totalHours}h ${totalMinutes}m`;
    
    // Update study sessions list
    let sessionsHTML = '';
    
    studySessions.slice(-5).reverse().forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        const hours = Math.floor(session.duration / 60);
        const minutes = session.duration % 60;
        
        sessionsHTML += `
            <div class="study-session-item">
                <div>${session.subject}</div>
                <div>${hours}h ${minutes}m</div>
                <div>${date}</div>
            </div>
        `;
    });
    
    studySessionsList.innerHTML = sessionsHTML;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load all data
    loadWaterData();
    updateWorkoutDisplay();
    updateHabitDisplay();
    updateMedicationDisplay();
    updateMealDisplay();
    loadScreenData();
    updateSleepDisplay();
    updateGroceryDisplay();
    updateBudgetDisplay();
    updateTodoDisplay();
    updateTimetableDisplay();
    updateStudyDisplay();
    
    // Set today's date as default in date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sleep-date').value = today;
    document.getElementById('meal-date').value = today;
    document.getElementById('reminder-date').value = today;
    
    // Initialize charts (simplified)
    initializeCharts();
});

function initializeCharts() {
    // This would initialize various charts in the app
    // For this demo, we'll just create a simple weekly chart
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    // Sample data
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Water Intake',
                data: [6, 8, 7, 5, 8, 6, 7],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Workout Minutes',
                data: [30, 45, 0, 60, 30, 0, 45],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
    
    new Chart(ctx, config);
}