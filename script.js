// Generate Input Fields
function generateInputs() {
    const num = document.getElementById("num").value;
    const container = document.getElementById("inputs");
    container.innerHTML = "";
    if (num <= 0) return;

    let html = `<table><tr><th>Process</th><th>Burst Time</th><th>Arrival Time</th></tr>`;
    for (let i = 0; i < num; i++) {
        html += `<tr>
            <td>P${i+1}</td>
            <td><input type="number" id="bt${i}" min="1"></td>
            <td><input type="number" id="at${i}" min="0"></td>
        </tr>`;
    }
    html += `</table>`;
    container.innerHTML = html;
}

// Main Calculate Function
function calculate() {
    const algo = document.getElementById("algorithm").value;
    const num = document.getElementById("num").value;
    let processes = [];

    // Collect input
    for (let i = 0; i < num; i++) {
        const bt = parseInt(document.getElementById("bt" + i).value);
        const at = parseInt(document.getElementById("at" + i).value);
        if (isNaN(bt) || isNaN(at)) return alert("Please fill all fields!");
        processes.push({ id: i + 1, bt, at });
    }

    // Run selected algorithm
    let result;
    if (algo === "FCFS") {
        result = calculateFCFS(processes);
    } else if (algo === "SJF") {
        result = calculateSJF(processes);
    }

    // Render results and Gantt chart
    renderResults(result, algo);
    renderGanttChart(result, "ganttChart");
    document.getElementById("chartTitle").textContent = `${algo} Gantt Chart`;
}

// FCFS Scheduling
function calculateFCFS(processes) {
    processes.sort((a, b) => a.at - b.at);
    let time = 0;
    for (let p of processes) {
        if (time < p.at) time = p.at;
        p.start = time;
        p.ct = time + p.bt;
        time = p.ct;
        p.tat = p.ct - p.at;
        p.wt = p.tat - p.bt;
    }
    return processes;
}

// Non-preemptive SJF Scheduling
function calculateSJF(processes) {
    let time = 0, completed = [], ready = [];

    while (processes.length > 0 || ready.length > 0) {
        processes = processes.filter(p => {
            if (p.at <= time) {
                ready.push(p);
                return false;
            }
            return true;
        });

        if (ready.length > 0) {
            ready.sort((a, b) => a.bt - b.bt);
            let current = ready.shift();
            current.start = time;
            time += current.bt;
            current.ct = time;
            current.tat = current.ct - current.at;
            current.wt = current.tat - current.bt;
            completed.push(current);
        } else {
            time++;
        }
    }
    return completed;
}

// Display Table Results
function renderResults(data, algo) {
    let avgWT = (data.reduce((sum, p) => sum + p.wt, 0) / data.length).toFixed(2);
    let avgTAT = (data.reduce((sum, p) => sum + p.tat, 0) / data.length).toFixed(2);

    let output = `<h3>${algo} Results</h3><table>
        <tr><th>Process</th><th>Burst/Processing Time</th><th>Arrival Time</th><th>Turnaround Time</th><th>Waiting Time</th></tr>`;
    data.forEach(p => {
        output += `<tr>
            <td>P${p.id}</td>
            <td>${p.bt}</td>
            <td>${p.at}</td>
            <td>${p.tat}</td>
            <td>${p.wt}</td>
        </tr>`;
    });
    output += `</table>
    
        <p><b>Average Turnaround Time:</b> ${avgTAT}</p>
        <p><b>Average Waiting Time:</b> ${avgWT}</p>`;

    document.getElementById("output").innerHTML = output;
}

// Render Table-style Gantt Chart
function renderGanttChart(processes, containerId) {
    const container = document.getElementById(containerId);
    let ganttHTML = `<table><tr>`;
    processes.forEach(p => {
        ganttHTML += `<td class="process-cell">${"P" + p.id}</td>`;
    });
    ganttHTML += `</tr><tr class="time-row">`;
    processes.forEach(p => {
        ganttHTML += `<td>${p.start}</td>`;
    });
    ganttHTML += `<td>${processes[processes.length - 1].ct}</td></tr></table>`;
    container.innerHTML = ganttHTML;
}