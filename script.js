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

// Schedule Data
let scheduleData = [
    {
        subTitle: "MAIN",
        columns: ["TASKS", "WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5"],
        rows: [
            ["PD", "", "", "", "", ""], ["SM", "", "", "", "", ""], ["PROJECT", "", "", "", "", ""],
            ["PPT", "", "", "", "", ""], ["LIVE", "", "", "", "", ""], ["AVP", "", "", "", "", ""],
            ["AUDIOMAN", "", "", "", "", ""], ["PULPIT", "", "", "", "", ""], ["MIC", "", "", "", "", ""],
            ["LIGHTS", "", "", "", "", ""], ["PROMOTION", "", "", "", "", ""], ["ENHANCER", "", "", "", "", ""],
            ["BDAY EDIT", "", "", "", "", ""]
        ]
    },
    {
        subTitle: "NGYC",
        columns: ["TASKS", "WEEK 2", "WEEK 4"],
        rows: [
            ["PD", "", ""], ["PROJECT", "", ""], ["PPT", "", ""], ["LIVE", "", ""], ["AUDIOMAN", "", ""],
            ["PULPIT", "", ""], ["MIC", "", ""], ["LIGHTS", "", ""], ["PROMOTION", "", ""], ["ENHANCER", "", ""]
        ]
    },
    {
        subTitle: "PERSON IN CHARGE",
        columns: ["TASKS", "WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5"],
        rows: [
            ["OP", "", "", "", "", ""], ["EMCEE", "", "", "", "", ""], ["PREACHER", "", "", "", "", ""],
            ["T&O", "", "", "", "", ""], ["CP", "", "", "", "", ""]
        ]
    }
];

let savedActivities = [];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedActivities();
    renderAllServices();
    
    // Set default month dropdown to current month/year BEFORE rendering the schedule
    const schedMonthInput = document.getElementById('scheduleMonth');
    if (schedMonthInput && !schedMonthInput.value) {
        const today = new Date();
        schedMonthInput.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    }

    renderSchedule(); 

    // View Switchers
    document.getElementById('tab-psg').addEventListener('click', () => switchTab('psg'));
    document.getElementById('tab-schedule').addEventListener('click', () => switchTab('schedule'));

    document.getElementById('scheduleMonth').addEventListener('input', renderSchedule);

    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const d = new Date(val + 'T00:00:00'); 
                document.getElementById('displayDate').innerText = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            } else {
                document.getElementById('displayDate').innerText = "";
            }
        });
    }

    const subtitleInput = document.getElementById('eventSubtitle');
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const subtitleEl = document.getElementById('displaySubtitle');
            if (val) {
                subtitleEl.innerText = val.startsWith('(') ? val : `(${val})`;
                subtitleEl.style.display = 'block';
            } else {
                subtitleEl.innerText = "";
                subtitleEl.style.display = 'none';
            }
        });
    }

    // THEME TOGGLE
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
    });
    
    // PSG Buttons
    document.getElementById('btnManageLibrary').addEventListener('click', () => openLibraryModal(null));
    document.getElementById('btnAddService').addEventListener('click', addNewService);
    document.getElementById('btnGenerateImage').addEventListener('click', () => generatePSGImage());
    document.getElementById('btnGeneratePDF').addEventListener('click', () => generatePSGPDF());
    
    // Schedule Buttons
    document.getElementById('btnSchedGenerateImage').addEventListener('click', () => generateScheduleImage());

    const modal = document.getElementById('libraryModal');
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    
    const saveActivityBtn = document.getElementById('btnSaveActivity');
    if (saveActivityBtn) saveActivityBtn.addEventListener('click', saveActivityToLibrary);
});

function switchTab(viewId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`tab-${viewId}`).classList.add('active');
    document.getElementById(`view-${viewId}`).classList.add('active');
}

// ==========================================
// SCHEDULE RENDERER
// ==========================================
function renderSchedule() {
    const wrapper = document.getElementById('schedule-tables-wrapper');
    const rawMonth = document.getElementById('scheduleMonth').value;
    
    // Convert the "YYYY-MM" dropdown value into "MONTH YEAR" (e.g., "MAY 2026")
    let monthPrefix = "MAY 2026";
    if (rawMonth) {
        const [y, m] = rawMonth.split('-');
        const d = new Date(y, parseInt(m) - 1);
        monthPrefix = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    }

    // Inject it perfectly under the "Jesus Is Lord Church Masantol" title!
    document.getElementById('scheduleMainTitle').innerText = `MAN SCHEDULE - ${monthPrefix}`;

    wrapper.innerHTML = "";

    scheduleData.forEach((table, tIndex) => {
        let theadHTML = `<tr>`;
        table.columns.forEach((col, cIndex) => {
            theadHTML += `<th><input type="text" class="sched-input" style="font-weight:bold;" value="${escapeHtml(col)}" onchange="updateSchedCol(${tIndex}, ${cIndex}, this.value)"></th>`;
        });
        theadHTML += `</tr>`;

        let tbodyHTML = "";
        table.rows.forEach((row, rIndex) => {
            tbodyHTML += `<tr>`;
            row.forEach((cellData, cIndex) => {
                let fw = cIndex === 0 ? "font-weight:bold;" : "";
                tbodyHTML += `<td><input type="text" class="sched-input" style="${fw}" value="${escapeHtml(cellData)}" onchange="updateSchedCell(${tIndex}, ${rIndex}, ${cIndex}, this.value)"></td>`;
            });
            tbodyHTML += `</tr>`;
        });

        // DYNAMIC WIDTH: Calculates the exact pixel width needed so the text stays perfectly centered
        let titleWidth = (table.subTitle.length * 9) + 15;
        
        // NEW SIMPLIFIED LOGIC: Just the editable title box, perfectly centered without the month/year!
        let titleContentHTML = `
            <input type="text" class="sched-title-input-box" style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; width: ${titleWidth}px; text-align: center; vertical-align: middle;" value="${escapeHtml(table.subTitle)}" oninput="this.style.width = ((this.value.length * 9) + 15) + 'px'; updateSchedTitle(${tIndex}, this.value)">
        `;

        const tableBlock = document.createElement('div');
        tableBlock.className = 'schedule-table-container';
        tableBlock.innerHTML = `
            <table class="sched-table">
                <thead>
                    <tr>
                        <th colspan="${table.columns.length}" class="sched-header" style="text-align: center;">
                            ${titleContentHTML}
                        </th>
                    </tr>
                    ${theadHTML}
                </thead>
                <tbody>${tbodyHTML}</tbody>
            </table>
            <div class="no-print actions" style="margin-bottom: 30px;">
                <button type="button" style="background:#007bff;color:white;" onclick="addSchedRow(${tIndex})">+ Add Row</button>
                <button type="button" style="background:#dc3545;color:white;" onclick="delSchedRow(${tIndex})">- Remove Row</button>
                <button type="button" style="background:#28a745;color:white;" onclick="addSchedCol(${tIndex})">+ Add Col</button>
                <button type="button" style="background:#ffc107;color:#333;" onclick="delSchedCol(${tIndex})">- Remove Col</button>
            </div>
        `;
        wrapper.appendChild(tableBlock);
    });

    // Automatically update the Quick Assigner dropdowns every time the schedule redraws
    if (typeof refreshAssignerUI === 'function') {
        refreshAssignerUI();
    }
}

// ==========================================
// QUICK ASSIGNER LOGIC (EXCLUSIVE TO SCHEDULE)
// ==========================================
function refreshAssignerUI() {
    const tableSelect = document.getElementById('assignTable');
    if (!tableSelect) return;

    const currentTableIdx = tableSelect.value || 0;

    tableSelect.innerHTML = '';
    scheduleData.forEach((t, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = t.subTitle || `Table ${i + 1}`;
        tableSelect.appendChild(opt);
    });

    if (tableSelect.options.length > currentTableIdx) {
        tableSelect.value = currentTableIdx;
    }

    updateAssignerTasksAndWeeks();
}

window.updateAssignerTasksAndWeeks = function() {
    const tableSelect = document.getElementById('assignTable');
    const taskSelect = document.getElementById('assignTask');
    const weeksContainer = document.getElementById('assignWeeks');
    
    if (!tableSelect || !taskSelect || !weeksContainer) return;

    const tIndex = parseInt(tableSelect.value);
    if (isNaN(tIndex) || !scheduleData[tIndex]) return;
    
    const table = scheduleData[tIndex];
    const currentTaskIdx = taskSelect.value;

    taskSelect.innerHTML = '';
    table.rows.forEach((r, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = r[0] || `Row ${i + 1}`;
        taskSelect.appendChild(opt);
    });

    if (taskSelect.options.length > currentTaskIdx) {
        taskSelect.value = currentTaskIdx;
    }

    weeksContainer.innerHTML = '';
    for (let i = 1; i < table.columns.length; i++) {
        let label = document.createElement('label');
        label.style.cursor = "pointer";
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "4px";
        label.innerHTML = `<input type="checkbox" value="${i}" class="assign-week-checkbox"> ${escapeHtml(table.columns[i])}`;
        weeksContainer.appendChild(label);
    }
}

window.applyAssignment = function() {
    const name = document.getElementById('assignName').value.trim();
    const tIndex = parseInt(document.getElementById('assignTable').value);
    const rIndex = parseInt(document.getElementById('assignTask').value);
    const weekCheckboxes = document.querySelectorAll('.assign-week-checkbox:checked');

    if (!name) {
        alert("Please enter a name first.");
        return;
    }
    if (weekCheckboxes.length === 0) {
        alert("Please select at least one week to assign this person to.");
        return;
    }

    // Apply the name to every checked week column in that specific row
    weekCheckboxes.forEach(cb => {
        const cIndex = parseInt(cb.value);
        scheduleData[tIndex].rows[rIndex][cIndex] = name;
    });

    // Re-render the table to show the new names instantly!
    renderSchedule();
    
    // Automatically uncheck the boxes so you're ready for the next person
    document.querySelectorAll('.assign-week-checkbox').forEach(cb => cb.checked = false);
}

// Schedule Matrix Functions
window.addSchedRow = function(tIndex) {
    const numCols = scheduleData[tIndex].columns.length;
    scheduleData[tIndex].rows.push(new Array(numCols).fill(""));
    renderSchedule();
};
window.delSchedRow = function(tIndex) {
    if (scheduleData[tIndex].rows.length > 1) {
        scheduleData[tIndex].rows.pop();
        renderSchedule();
    }
};
window.addSchedCol = function(tIndex) {
    scheduleData[tIndex].columns.push("NEW");
    scheduleData[tIndex].rows.forEach(r => r.push(""));
    renderSchedule();
};
window.delSchedCol = function(tIndex) {
    if (scheduleData[tIndex].columns.length > 1) {
        scheduleData[tIndex].columns.pop();
        scheduleData[tIndex].rows.forEach(r => r.pop());
        renderSchedule();
    }
};
function updateSchedTitle(tIndex, val) { scheduleData[tIndex].subTitle = val; renderSchedule(); }
function updateSchedCol(tIndex, cIndex, val) { scheduleData[tIndex].columns[cIndex] = val; }
function updateSchedCell(tIndex, rIndex, cIndex, val) { scheduleData[tIndex].rows[rIndex][cIndex] = val; }

// ==========================================
// PSG RENDER & LIBRARY 
// ==========================================
function loadSavedActivities() {
    const saved = localStorage.getItem('church_activities_library');
    if (saved) {
        savedActivities = JSON.parse(saved);
    } else {
        savedActivities = [
            { name: "Praise & Worship", duration: 20, person: "Worship Team" },
            { name: "Opening Prayer", duration: 5, person: "Pastor" }
        ];
        saveActivitiesToLocal();
    }
}
function saveActivitiesToLocal() { localStorage.setItem('church_activities_library', JSON.stringify(savedActivities)); }
function saveActivityToLibrary() {
    const name = document.getElementById('newActivityName').value.trim();
    const duration = parseInt(document.getElementById('newActivityDuration').value);
    const person = document.getElementById('newActivityPerson').value.trim();
    if (!name) return alert('Please enter an activity name');
    savedActivities.push({ name, duration: duration || 10, person: person || '' });
    saveActivitiesToLocal(); renderActivitiesList();
    document.getElementById('newActivityName').value = ''; document.getElementById('newActivityPerson').value = '';
}
function deleteActivityFromLibrary(index) {
    if (confirm('Delete this activity from library?')) {
        savedActivities.splice(index, 1); saveActivitiesToLocal(); renderActivitiesList();
    }
}
function renderActivitiesList() {
    const container = document.getElementById('activitiesList');
    if (!container) return;
    if (savedActivities.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary);">No saved activities.</p>'; return; }
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
        </div>`).join('');
}
let currentServiceIndex = null;
function useActivityInCurrentService(activityIndex) {
    if (currentServiceIndex === null) return alert('Please click "Use" from a service first');
    const activity = savedActivities[activityIndex];
    servicesData[currentServiceIndex].items.push({ type: 'activity', duration: activity.duration, activity: activity.name, person: activity.person });
    renderAllServices(); closeModal();
}
function openLibraryModal(serviceIndex) { currentServiceIndex = serviceIndex; renderActivitiesList(); document.getElementById('libraryModal').style.display = 'block'; }
function closeModal() { document.getElementById('libraryModal').style.display = 'none'; currentServiceIndex = null; }

function cloneService(sIndex) {
    const originalService = servicesData[sIndex];
    const newTitle = prompt('Enter name for cloned service:', `${originalService.title} (Copy)`);
    if (!newTitle) return;
    const clonedService = {
        id: "service-" + Date.now(), title: newTitle, startTime: originalService.startTime, maxDuration: originalService.maxDuration,
        items: JSON.parse(JSON.stringify(originalService.items))
    };
    servicesData.splice(sIndex + 1, 0, clonedService); renderAllServices();
}

function renderAllServices() {
    const wrapper = document.getElementById('services-wrapper');
    wrapper.innerHTML = ""; 

    servicesData.forEach((service, sIndex) => {
        let currentTime = new Date(`2026-01-01T${service.startTime}:00`);
        let totalMins = 0; let tbodyHTML = "";
        
        service.items.forEach((item, iIndex) => {
            if (item.type === 'header') {
                tbodyHTML += `<tr class="sub-category"><td colspan="4"><div class="header-cell"><input type="text" value="${escapeHtml(item.title)}" onchange="updateHeader(${sIndex}, ${iIndex}, this.value)" placeholder="Section Title"><div class="row-actions" data-html2canvas-ignore="true"><button type="button" class="btn-insert" onclick="insertRowAfter(${sIndex}, ${iIndex})">+</button><button type="button" class="btn-delete" onclick="deleteRow(${sIndex}, ${iIndex})">&times;</button></div></div></td></tr>`;
                return;
            }
            let startStr = formatTime(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + parseInt(item.duration || 0));
            let endStr = formatTime(currentTime);
            totalMins += parseInt(item.duration || 0);

            tbodyHTML += `<tr><td>${startStr} - ${endStr}</td><td><input type="number" class="activity-input" value="${item.duration}" onchange="updateDuration(${sIndex}, ${iIndex}, this.value)"></td><td><input type="text" class="activity-input" value="${escapeHtml(item.activity)}" placeholder="Activity" onchange="updateActivity(${sIndex}, ${iIndex}, this.value)"></td><td><div class="person-cell"><input type="text" value="${escapeHtml(item.person)}" placeholder="Name" onchange="updatePerson(${sIndex}, ${iIndex}, this.value)"><div class="row-actions" data-html2canvas-ignore="true"><button type="button" class="btn-insert" onclick="insertRowAfter(${sIndex}, ${iIndex})">+</button><button type="button" class="btn-delete" onclick="deleteRow(${sIndex}, ${iIndex})">&times;</button></div></div></td></tr>`;
        });

        const hours = Math.floor(totalMins / 60); const mins = totalMins % 60;
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
                <div class="service-stats">Total: ${totalMins} / ${service.maxDuration} ${isOverTime ? '<span class="warning-pill">Over Limit!</span>' : ''}<button type="button" class="btn-clone-service" onclick="cloneService(${sIndex})">📋 Clone</button><button type="button" class="btn-delete-service" onclick="deleteService(${sIndex})">Delete Service</button></div>
            </div>
            <table class="programTable">
                <thead><tr class="main-header"><th colspan="4">${escapeHtml(service.title)}</th></tr><tr class="column-labels"><th>Time</th><th>Duration (m)</th><th>Activity</th><th>Person-in-Charge</th></tr></thead>
                <tbody>${tbodyHTML}</tbody>
                <tfoot><tr class="total-row"><td colspan="2" style="text-align: right; padding-right: 10px;">TOTAL RUNNING TIME:</td><td colspan="2" style="text-align: left; padding-left: 10px;">${totalMins} minutes (${timeDisplay})</td></tr></tfoot>
            </table>
            <div class="no-print actions">
                <button type="button" class="btn-add-activity" onclick="addRow(${sIndex})">+ Add Activity</button>
                <button type="button" class="btn-add-section" onclick="addSection(${sIndex})">+ Add Divider</button>
                <button type="button" class="btn-from-library" onclick="openLibraryModal(${sIndex})">📚 Add from Library</button>
            </div>`;
        wrapper.appendChild(serviceBlock);
    });
}

function addNewService() { servicesData.push({ id: "service-" + Date.now(), title: "NEW SERVICE", startTime: "13:00", maxDuration: 120, items: [{ type: 'activity', duration: 15, activity: "New Activity", person: "" }]}); renderAllServices(); }
function deleteService(sIndex) { if(confirm("Delete this entire service?")) { servicesData.splice(sIndex, 1); renderAllServices(); } }
function updateServiceData(sIndex, key, val) { if (key === 'startTime') val = validateAndFormatTime(val); servicesData[sIndex][key] = val; renderAllServices(); }
function addRow(sIndex) { servicesData[sIndex].items.push({ type: 'activity', duration: 10, activity: "", person: "" }); renderAllServices(); }
function addSection(sIndex) { servicesData[sIndex].items.push({ type: 'header', title: "New Section" }); renderAllServices(); }
function insertRowAfter(sIndex, iIndex) { servicesData[sIndex].items.splice(iIndex + 1, 0, { type: 'activity', duration: 10, activity: "", person: "" }); renderAllServices(); }
function deleteRow(sIndex, iIndex) { servicesData[sIndex].items.splice(iIndex, 1); renderAllServices(); }
function updateDuration(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].duration = parseInt(val) || 0; renderAllServices(); }
function updateActivity(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].activity = val; }
function updatePerson(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].person = val; }
function updateHeader(sIndex, iIndex, val) { servicesData[sIndex].items[iIndex].title = val; }
function escapeHtml(str) { return !str ? str : str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
function formatTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
function validateAndFormatTime(timeValue) { if (!timeValue) return "08:00"; const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/; return timeRegex.test(timeValue) ? timeValue : "08:00"; }

// ==========================================
// PSG EXPORT FUNCTIONS 
// ==========================================
function generatePSGPDF() {
    const paperSize = document.getElementById('paperSize').value;
    const element = document.getElementById('pdf-content');
    const originalPadding = element.style.padding;
    
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
        filename: fileNamePDF,
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

function generatePSGImage() {
    const originalElement = document.getElementById('pdf-content');
    
    const originalPadding = originalElement.style.padding;
    const originalMargin = originalElement.style.margin;
    const originalWidth = originalElement.style.width;
    const originalMaxWidth = originalElement.style.maxWidth;
    
    const dateVal = document.getElementById('eventDate').value;
    const fileNameIMG = dateVal ? `PSG_${dateVal}.jpg` : 'PSG.jpg';
    
    const wasDarkMode = document.body.classList.contains('dark-mode');
    if (wasDarkMode) document.body.classList.remove('dark-mode');
    
    originalElement.style.padding = "0.2in";
    originalElement.style.margin = "0"; 
    originalElement.style.width = "800px"; 
    originalElement.style.maxWidth = "none";
    
    const allTables = document.querySelectorAll('.programTable');
    allTables.forEach(t => t.style.tableLayout = "fixed");
    
    originalElement.querySelectorAll('td').forEach(c => { c.style.height = "auto"; c.style.verticalAlign = "middle"; });
    originalElement.querySelectorAll('.activity-input, .person-cell input, .header-cell input').forEach(i => { 
        i.style.height = "auto"; i.style.minHeight = "28px"; i.style.padding = "5px 4px"; i.style.lineHeight = "1.2"; 
    });
    
    const uiControls = originalElement.querySelectorAll('.no-print, .row-actions');
    uiControls.forEach(el => el.style.display = 'none');
    originalElement.querySelectorAll('input').forEach(input => input.setAttribute('value', input.value));
    
    const captureWidth = originalElement.offsetWidth;
    
    html2canvas(originalElement, { 
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false,
        windowWidth: captureWidth, width: captureWidth
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = fileNameIMG;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        
        originalElement.style.padding = originalPadding;
        originalElement.style.margin = originalMargin;
        originalElement.style.width = originalWidth;
        originalElement.style.maxWidth = originalMaxWidth;
        
        allTables.forEach(t => t.style.tableLayout = "fixed");
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
        
        originalElement.querySelectorAll('.activity-input, .person-cell input, .header-cell input, td').forEach(el => { 
            el.style.height = ""; el.style.minHeight = ""; el.style.padding = ""; el.style.lineHeight = ""; el.style.verticalAlign = ""; 
        });
    }).catch(error => {
        console.error('Image error:', error);
        originalElement.style.padding = originalPadding;
        originalElement.style.margin = originalMargin;
        originalElement.style.width = originalWidth;
        originalElement.style.maxWidth = originalMaxWidth;
        
        allTables.forEach(t => t.style.tableLayout = "fixed");
        uiControls.forEach(el => el.style.display = '');
        if (wasDarkMode) document.body.classList.add('dark-mode');
    });
}

// ==========================================
// SCHEDULE EXPORT FUNCTIONS (IMAGE ONLY)
// ==========================================
function generateScheduleImage() {
    const originalElement = document.getElementById('sched-pdf-content');
    const wrapperElement = document.getElementById('sched-pdf-wrapper');
    
    // 1. Save original states for BOTH the table and its parent wrapper
    const originalPadding = originalElement.style.padding;
    const originalMargin = originalElement.style.margin;
    const originalWidth = originalElement.style.width;
    const originalMaxWidth = originalElement.style.maxWidth;
    const originalWrapperDisplay = wrapperElement.style.display;
    const originalWrapperJustify = wrapperElement.style.justifyContent;
    
    // Backup the website's body margins (This prevents the 1cm offset bug!)
    const originalBodyPadding = document.body.style.padding;
    const originalBodyMargin = document.body.style.margin;
    
    const rawMonth = document.getElementById('scheduleMonth').value;
    let monthVal = "MAY_2026";
    if (rawMonth) {
        const [y, m] = rawMonth.split('-');
        const d = new Date(y, parseInt(m) - 1);
        monthVal = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase().replace(/ /g, "_");
    }
    const fileNameIMG = `MAN_Schedule_${monthVal}.jpg`;
    
    const wasDarkMode = document.body.classList.contains('dark-mode');
    if (wasDarkMode) document.body.classList.remove('dark-mode');
    
    const uiControls = originalElement.querySelectorAll('.no-print, .row-actions, .actions');
    uiControls.forEach(el => el.style.display = 'none');
    
    const containers = originalElement.querySelectorAll('.schedule-table-container');
    const originalMargins = [];
    containers.forEach(c => {
        originalMargins.push(c.style.marginBottom);
        c.style.marginBottom = "15px"; 
    });

    // 2. THE ULTIMATE CENTERING FIX:
    // Strip the flex centering AND the body padding so the table snaps perfectly to absolute 0,0!
    document.body.style.padding = "0";
    document.body.style.margin = "0";
    wrapperElement.style.display = "block";
    wrapperElement.style.justifyContent = "flex-start";

    originalElement.style.padding = "0.2in";
    originalElement.style.margin = "0"; 
    originalElement.style.width = "1100px"; 
    originalElement.style.maxWidth = "none";
    originalElement.style.boxSizing = "border-box";
    
    originalElement.querySelectorAll('input').forEach(input => input.setAttribute('value', input.value));
    
    const swappedElements = [];
    originalElement.querySelectorAll('.sched-input, .sched-title-input-box').forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value;
        span.style.fontFamily = "Arial, sans-serif";
        
        if (input.classList.contains('sched-title-input-box')) {
            span.style.fontSize = "14px";
            span.style.fontWeight = "bold";
            span.style.display = "inline-block"; 
        } else {
            span.style.fontSize = "11px";
            span.style.fontWeight = input.closest('th') || input.style.fontWeight === 'bold' ? 'bold' : 'normal';
            span.style.display = "block";
            span.style.width = "100%";
            span.style.wordWrap = "break-word";
        }
        
        input.parentNode.insertBefore(span, input);
        input.style.display = 'none';
        swappedElements.push({ input, span });
    });

    // 3. THE MICRO-DELAY ANTI-CRASH FIX
    // We give the browser exactly 100 milliseconds to visually update the screen (removing margins/padding) 
    // BEFORE we take the snapshot. Without this delay, html2canvas crashes internally or captures a shifted image!
    setTimeout(() => {
        html2canvas(originalElement, { 
            scale: 2.5, 
            useCORS: true, 
            backgroundColor: '#ffffff', 
            logging: false,
            windowWidth: 1100, 
            width: 1100
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = fileNameIMG;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
            
            restoreScheduleState();
        }).catch(error => {
            console.error('Image error:', error);
            restoreScheduleState();
        });
    }, 100);

    function restoreScheduleState() {
        // 4. Restore all layout states so the app returns to normal instantly
        document.body.style.padding = originalBodyPadding;
        document.body.style.margin = originalBodyMargin;
        
        wrapperElement.style.display = originalWrapperDisplay;
        wrapperElement.style.justifyContent = originalWrapperJustify;

        originalElement.style.padding = originalPadding;
        originalElement.style.margin = originalMargin;
        originalElement.style.width = originalWidth;
        originalElement.style.maxWidth = originalMaxWidth;
        
        containers.forEach((c, idx) => c.style.marginBottom = originalMargins[idx]);
        uiControls.forEach(el => el.style.display = '');
        swappedElements.forEach(item => {
            item.span.remove();
            item.input.style.display = '';
        });
        if (wasDarkMode) document.body.classList.add('dark-mode');
    }
}