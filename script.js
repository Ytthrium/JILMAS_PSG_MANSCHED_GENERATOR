let servicesData = [
    {
        id: "service-1",
        title: "MORNING SERVICE",
        startTime: "08:30",
        maxDuration: 180,
        items: [
            { type: 'header', title: "Pre-Program" },
            { type: 'activity', duration: 20, activity: "Registration & House Music", person: "MIS - MAN Team" },
            { type: 'activity', duration: 3, activity: "Announcements", person: "MAN Team" },
            { type: 'header', title: "Proper Program" },
            { type: 'activity', duration: 20, activity: "Praise & Worship", person: "WAN Team" },
            { type: 'activity', duration: 5, activity: "Opening Prayer", person: "Sis. Jane" }
        ]
    }
];

// Saved activities library
let savedActivities = [];

// Load saved activities from localStorage
function loadSavedActivities() {
    const saved = localStorage.getItem('church_activities_library');
    if (saved) {
        savedActivities = JSON.parse(saved);
    } else {
        // Default activities
        savedActivities = [
            { name: "Praise & Worship", duration: 20, person: "Worship Team" },
            { name: "Opening Prayer", duration: 5, person: "Pastor" },
            { name: "Sermon", duration: 45, person: "Speaker" },
            { name: "Offertory", duration: 10, person: "Treasury Team" },
            { name: "Announcements", duration: 5, person: "Admin Team" },
            { name: "Closing Prayer", duration: 3, person: "Pastor" }
        ];
        saveActivitiesToLocal();
    }
}

function saveActivitiesToLocal() {
    localStorage.setItem('church_activities_library', JSON.stringify(savedActivities));
}

function saveActivityToLibrary() {
    const name = document.getElementById('newActivityName').value.trim();
    const duration = parseInt(document.getElementById('newActivityDuration').value);
    const person = document.getElementById('newActivityPerson').value.trim();
    
    if (!name) {
        alert('Please enter an activity name');
        return;
    }
    
    savedActivities.push({ name, duration: duration || 10, person: person || '' });
    saveActivitiesToLocal();
    renderActivitiesList();
    
    // Clear inputs
    document.getElementById('newActivityName').value = '';
    document.getElementById('newActivityDuration').value = '10';
    document.getElementById('newActivityPerson').value = '';
}

function deleteActivityFromLibrary(index) {
    if (confirm('Delete this activity from library?')) {
        savedActivities.splice(index, 1);
        saveActivitiesToLocal();
        renderActivitiesList();
    }
}

function renderActivitiesList() {
    const container = document.getElementById('activitiesList');
    if (!container) return;
    
    if (savedActivities.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No saved activities. Add some above!</p>';
        return;
    }
    
    container.innerHTML = savedActivities.map((act, idx) => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-name">${escapeHtml(act.name)}</div>
                <div class="activity-details">${act.duration} min | ${escapeHtml(act.person) || 'No person assigned'}</div>
            </div>
            <div class="activity-actions">
                <button class="btn-use" onclick="useActivityInCurrentService(${idx})">Use</button>
                <button class="btn-delete-activity" onclick="deleteActivityFromLibrary(${idx})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Track which service we're adding to
let currentServiceIndex = null;

function useActivityInCurrentService(activityIndex) {
    if (currentServiceIndex === null) {
        alert('Please click "Use" from a service\'s Add from Library button first');
        return;
    }
    
    const activity = savedActivities[activityIndex];
    servicesData[currentServiceIndex].items.push({
        type: 'activity',
        duration: activity.duration,
        activity: activity.name,
        person: activity.person
    });
    renderAllServices();
    closeModal();
    currentServiceIndex = null;
}

function openLibraryModal(serviceIndex) {
    currentServiceIndex = serviceIndex;
    renderActivitiesList();
    document.getElementById('libraryModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('libraryModal').style.display = 'none';
    currentServiceIndex = null;
}

// Clone service function
function cloneService(sIndex) {
    const originalService = servicesData[sIndex];
    const newTitle = prompt('Enter name for cloned service:', `${originalService.title} (Copy)`);
    
    if (!newTitle) return;
    
    const clonedService = {
        id: "service-" + Date.now(),
        title: newTitle,
        startTime: originalService.startTime,
        maxDuration: originalService.maxDuration,
        items: JSON.parse(JSON.stringify(originalService.items)) // Deep clone
    };
    
    servicesData.splice(sIndex + 1, 0, clonedService);
    renderAllServices();
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedActivities();
    renderAllServices();
    
    // --- Smart Date Formatter ---
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const d = new Date(val + 'T00:00:00'); 
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('displayDate').innerText = d.toLocaleDateString(undefined, options);
            } else {
                document.getElementById('displayDate').innerText = "";
            }
        });
    }

    // --- Optional Subtitle Logic ---
    const subtitleInput = document.getElementById('eventSubtitle');
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const subtitleEl = document.getElementById('displaySubtitle');
            if (val) {
                const text = val.startsWith('(') ? val : `(${val})`;
                subtitleEl.innerText = text;
                subtitleEl.style.display = 'block';
            } else {
                subtitleEl.innerText = "";
                subtitleEl.style.display = 'none';
            }
        });
    }

    // --- THEME TOGGLE ---
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        const elements = document.querySelectorAll('.service-block, .no-print, .global-config-container');
        elements.forEach(el => {
            el.style.transition = 'background-color 0.3s ease, border-color 0.3s ease';
        });
    });

    // --- TIME INPUT HANDLING ---
    document.addEventListener('click', function(e) {
        if (e.target && e.target.type === 'time') {
            e.target.showPicker && e.target.showPicker();
        }
    });
    
    // Button Listeners
    document.getElementById('btnManageLibrary').addEventListener('click', () => openLibraryModal(null));
    document.getElementById('btnAddService').addEventListener('click', addNewService);
    document.getElementById('btnGenerateImage').addEventListener('click', generateImage);
    document.getElementById('btnGeneratePDF').addEventListener('click', generatePDF);
    
    // Modal close handlers
    const modal = document.getElementById('libraryModal');
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    const saveActivityBtn = document.getElementById('btnSaveActivity');
    if (saveActivityBtn) {
        saveActivityBtn.addEventListener('click', saveActivityToLibrary);
    }
});

// --- CORE RENDER FUNCTION ---
function renderAllServices() {
    const wrapper = document.getElementById('services-wrapper');
    wrapper.innerHTML = ""; 

    servicesData.forEach((service, sIndex) => {
        let currentTime = new Date(`2026-01-01T${service.startTime}:00`);
        let totalMins = 0;
        
        let tbodyHTML = "";
        
        service.items.forEach((item, iIndex) => {
            if (item.type === 'header') {
                tbodyHTML += `
                    <tr class="sub-category">
                        <td colspan="4">
                            <div class="header-cell">
                                <input type="text" value="${escapeHtml(item.title)}" onchange="updateHeader(${sIndex}, ${iIndex}, this.value)" placeholder="Section Title">
                                <div class="row-actions" data-html2canvas-ignore="true">
                                    <button type="button" class="btn-insert" onclick="insertRowAfter(${sIndex}, ${iIndex})">+</button>
                                    <button type="button" class="btn-delete" onclick="deleteRow(${sIndex}, ${iIndex})">&times;</button>
                                </div>
                            </div>
                        </td>
                    </tr>`;
                return;
            }

            let startStr = formatTime(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + parseInt(item.duration || 0));
            let endStr = formatTime(currentTime);
            totalMins += parseInt(item.duration || 0);

            tbodyHTML += `
                <tr>
                    <td>${startStr} - ${endStr}</td>
                    <td><input type="number" class="activity-input" value="${item.duration}" onchange="updateDuration(${sIndex}, ${iIndex}, this.value)"></td>
                    <td><input type="text" class="activity-input" value="${escapeHtml(item.activity)}" placeholder="Activity" onchange="updateActivity(${sIndex}, ${iIndex}, this.value)"></td>
                    <td>
                        <div class="person-cell">
                            <input type="text" value="${escapeHtml(item.person)}" placeholder="Name" onchange="updatePerson(${sIndex}, ${iIndex}, this.value)">
                            <div class="row-actions" data-html2canvas-ignore="true">
                                <button type="button" class="btn-insert" onclick="insertRowAfter(${sIndex}, ${iIndex})">+</button>
                                <button type="button" class="btn-delete" onclick="deleteRow(${sIndex}, ${iIndex})">&times;</button>
                            </div>
                        </div>
                    </td>
                </tr>`;
        });

        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        const timeDisplay = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
        const isOverTime = totalMins > service.maxDuration;

        const serviceBlock = document.createElement('div');
        serviceBlock.className = 'service-block';
        serviceBlock.innerHTML = `
            <div class="no-print service-controls">
                <div class="service-controls-left">
                    <input type="text" class="service-title-input" value="${escapeHtml(service.title)}" onchange="updateServiceData(${sIndex}, 'title', this.value)" placeholder="Service Name">
                    <label>Start: <input type="time" value="${service.startTime}" onchange="updateServiceData(${sIndex}, 'startTime', this.value)"></label>
                    <label>Max (min): <input type="number" style="width:60px;" value="${service.maxDuration}" onchange="updateServiceData(${sIndex}, 'maxDuration', this.value)"></label>
                </div>
                <div class="service-stats">
                    Total: ${totalMins} / ${service.maxDuration} 
                    ${isOverTime ? '<span class="warning-pill">Over Limit!</span>' : ''}
                    <button type="button" class="btn-clone-service" onclick="cloneService(${sIndex})">📋 Clone</button>
                    <button type="button" class="btn-delete-service" onclick="deleteService(${sIndex})">Delete Service</button>
                </div>
            </div>

            <table class="programTable">
                <thead>
                    <tr class="main-header"><th colspan="4">${escapeHtml(service.title)}</th></tr>
                    <tr class="column-labels">
                        <th>Time</th><th>Duration (m)</th><th>Activity</th><th>Person-in-Charge</th>
                    </tr>
                </thead>
                <tbody>${tbodyHTML}</tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right; padding-right: 10px;">TOTAL RUNNING TIME:</td>
                        <td colspan="2" style="text-align: left; padding-left: 10px;">${totalMins} minutes (${timeDisplay})</td>
                    </tr>
                </tfoot>
            </table>

            <div class="no-print actions">
                <button type="button" class="btn-add-activity" onclick="addRow(${sIndex})">+ Add Activity</button>
                <button type="button" class="btn-add-section" onclick="addSection(${sIndex})">+ Add Divider</button>
                <button type="button" class="btn-from-library" onclick="openLibraryModal(${sIndex})" style="background: #ffc107; color: #333;">📚 Add from Library</button>
            </div>
        `;
        wrapper.appendChild(serviceBlock);
    });
}

// --- DATA UPDATERS ---
function addNewService() {
    servicesData.push({
        id: "service-" + Date.now(),
        title: "NEW SERVICE",
        startTime: "13:00",
        maxDuration: 120,
        items: [{ type: 'activity', duration: 15, activity: "New Activity", person: "" }]
    });
    renderAllServices();
}

function deleteService(sIndex) {
    if(confirm("Are you sure you want to delete this entire service?")) {
        servicesData.splice(sIndex, 1);
        renderAllServices();
    }
}

function updateServiceData(sIndex, key, val) {
    if (key === 'startTime') {
        val = validateAndFormatTime(val);
    }
    servicesData[sIndex][key] = val;
    renderAllServices();
}

function addRow(sIndex) { servicesData[sIndex].items.push({ type: 'activity', duration: 10, activity: "", person: "" }); renderAllServices(); }
function addSection(sIndex) { servicesData[sIndex].items.push({ type: 'header', title: "New Section" }); renderAllServices(); }
function insertRowAfter(sIndex, iIndex) { servicesData[sIndex].items.splice(iIndex + 1, 0, { type: 'activity', duration: 10, activity: "", person: "" }); renderAllServices(); }
function deleteRow(sIndex, iIndex) { servicesData[sIndex].items.splice(iIndex, 1); renderAllServices(); }
function updateDuration(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].duration = parseInt(val) || 0; renderAllServices(); }
function updateActivity(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].activity = val; }
function updatePerson(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].person = val; }
function updateHeader(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].title = val; }

function escapeHtml(str) {
    if (!str) return str;
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function validateAndFormatTime(timeValue) {
    if (!timeValue) return "08:00";
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeValue)) {
        return timeValue;
    }
    return "08:00";
}

// --- EXPORT FUNCTIONS ---
function generatePDF() {
    const paperSize = document.getElementById('paperSize').value;
    const element = document.getElementById('pdf-content');
    const originalPadding = element.style.padding;
    
    // NEW: Get the date and format the file name
    const dateVal = document.getElementById('eventDate').value;
    const fileNamePDF = dateVal ? `PSG_${dateVal}.pdf` : 'PSG.pdf';
    
    const wasDarkMode = document.body.classList.contains('dark-mode');
    if (wasDarkMode) document.body.classList.remove('dark-mode');
    
    const uiControls = element.querySelectorAll('.no-print, .row-actions');
    uiControls.forEach(el => el.style.display = 'none');
    
    element.style.padding = "0.2in";
    element.querySelectorAll('input').forEach(input => input.setAttribute('value', input.value));
    
    html2pdf().set({
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: fileNamePDF, // NEW: Applied the dynamic file name here
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: paperSize, orientation: 'portrait' }
    }).from(element).save().then(() => {
        element.style.padding = originalPadding;
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
    }).catch(error => {
        console.error('PDF error:', error);
        element.style.padding = originalPadding;
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
    });
}

function generateImage() {
    const originalElement = document.getElementById('pdf-content');
    const originalPadding = originalElement.style.padding;
    
    // NEW: Get the date and format the file name
    const dateVal = document.getElementById('eventDate').value;
    const fileNameIMG = dateVal ? `PSG_${dateVal}.jpg` : 'PSG.jpg';
    
    const wasDarkMode = document.body.classList.contains('dark-mode');
    if (wasDarkMode) document.body.classList.remove('dark-mode');
    
    originalElement.style.padding = "0.2in";
    const allTables = document.querySelectorAll('.programTable');
    allTables.forEach(t => t.style.tableLayout = "fixed");
    
    originalElement.querySelectorAll('td').forEach(c => { c.style.height = "auto"; c.style.verticalAlign = "middle"; });
    originalElement.querySelectorAll('.activity-input, .person-cell input, .header-cell input').forEach(i => { 
        i.style.height = "auto"; i.style.minHeight = "28px"; i.style.padding = "5px 4px"; i.style.lineHeight = "1.2"; 
    });
    
    const uiControls = originalElement.querySelectorAll('.no-print, .row-actions');
    uiControls.forEach(el => el.style.display = 'none');
    originalElement.querySelectorAll('input').forEach(input => input.setAttribute('value', input.value));
    
    html2canvas(originalElement, { 
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false,
        windowWidth: originalElement.scrollWidth, width: originalElement.scrollWidth
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = fileNameIMG; // NEW: Applied the dynamic file name here
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        
        originalElement.style.padding = originalPadding;
        allTables.forEach(t => t.style.tableLayout = "fixed");
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
        
        originalElement.querySelectorAll('.activity-input, .person-cell input, .header-cell input, td').forEach(el => { 
            el.style.height = ""; el.style.minHeight = ""; el.style.padding = ""; el.style.lineHeight = ""; el.style.verticalAlign = ""; 
        });
    }).catch(error => {
        console.error('Image error:', error);
        originalElement.style.padding = originalPadding;
        allTables.forEach(t => t.style.tableLayout = "fixed");
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
    });
}