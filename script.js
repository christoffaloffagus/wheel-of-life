// Global variables for Chart.js and spider chart instance
let spiderChart;
let spiderChartLabels = [];
let spiderChartData = [];

// Function to update spider chart based on input fields
function updateSpiderChart() {
    const inputContainer = document.getElementById("input-container");

    // PROBLEM CODE HERE - Cannot import
    // Clear previous labels and data
    spiderChartLabels = [];
    spiderChartData = [];

    // Iterate through input fields to update labels and data
    const rows = inputContainer.querySelectorAll(".row");
    rows.forEach((row, index) => {
        const textInput = row.querySelector("input[type='text']");
        const numberInput = row.querySelector("input[type='number']");

        spiderChartLabels.push(textInput.value);
        spiderChartData.push(numberInput.value);
    });

    // Update spider chart
    if (spiderChart) {
        spiderChart.data.labels = spiderChartLabels;
        spiderChart.data.datasets[0].data = spiderChartData;
        spiderChart.update();
    } else {
        createSpiderChart();
    }
}

// Function to create spider chart
function createSpiderChart() {
    const ctx = document.getElementById('spider-chart').getContext('2d');
    spiderChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: spiderChartLabels,
            datasets: [{
                label: 'Data',
                data: spiderChartData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    // display: false, // Hide the legend
                    position: 'bottom', // Place legend at the bottom
                    labels: {
                        fontSize: 14, // Adjust font size of legend labels
                        fontColor: 'black' // Adjust font color of legend labels
                    }
                }
            },
            responsive: true, // Allow the chart to be responsive
            scales: {
                r: {
                    grid: {
                        lineWidth: 2 // Adjust thickness of grid lines here
                    },
                    pointLabels: {
                        font: {
                            size: 14, // Set the font size of the labels
                            weight: 'bold' // Make the labels bold
                        }
                    },
                    min: 0,
                    max: 10
                }
            }
        }
    });
}

// Function to create a new row of inputs
function createRow(includeMinus) {
    const inputContainer = document.getElementById("input-container");

    // Create row div
    const row = document.createElement("div");
    row.classList.add("row");

    // Create input group div
    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");

    // Create text input
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Value";
    textInput.addEventListener('input', updateSpiderChart); // Update spider chart when text input changes

    // Create number input
    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.placeholder = "0";
    // numberInput.addEventListener('input', updateSpiderChart); // Update spider chart when number input changes
    numberInput.addEventListener('input', function() {
        // Validate input value
        const value = parseInt(numberInput.value);
        if (isNaN(value) || value < 1 || value > 10) {
            numberInput.value = '0'; // Clear input if value is invalid
        }
        updateSpiderChart();
    });

    // Append inputs to input group
    inputGroup.appendChild(textInput);
    inputGroup.appendChild(numberInput);

    // Create minus button
    if (includeMinus === true) {
        const minusButton = document.createElement("button");
        minusButton.innerText = "-";
        minusButton.classList.add("minus-btn");
        minusButton.onclick = function () {
            if (inputContainer.children.length > 4) {
                inputContainer.removeChild(row);
                updateSpiderChart();
            }
        };
        // Append minus button to input group
        inputGroup.appendChild(minusButton);
    }

    // Append input group to row
    row.appendChild(inputGroup);

    // Append row to container
    inputContainer.insertBefore(row, inputContainer.lastChild);

    // Update spider chart
    updateSpiderChart();
}

// Function to create the plus button initially
function createPlusButton() {
    const inputContainer = document.getElementById("input-container");
    const plusButton = document.createElement("button");
    plusButton.innerText = "+";
    plusButton.classList.add("plus-btn");
    plusButton.onclick = function() {
        createRow(true);
    };
    inputContainer.appendChild(plusButton);
}

// Initial setup
document.addEventListener("DOMContentLoaded", function() {
    // Create initial three rows
    for (let i = 0; i < 3; i++) {
        createRow(false);
    }
    // Create initial plus button
    createPlusButton();
});

// Function to export filled data
function exportData() {
    const filename = window.prompt("Enter a filename", "wheel_of_life_data.json");
    if (filename === null || filename.trim() === '') return; // If the user cancels or inputs an empty string, exit the function
    const dataToExport = {
        labels: spiderChartLabels,
        values: spiderChartData
    };
    const jsonData = JSON.stringify(dataToExport);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.trim(); // Set the filename obtained from the user after trimming leading and trailing whitespace
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to import data
function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result.toString());

        // Add more rows if the imported data needs them
        correctRowCount(importedData.labels.length);

        spiderChartLabels = importedData.labels;
        spiderChartData = importedData.values;

        // Update fields and chart
        updateFields();
        updateSpiderChart();
    };
    reader.readAsText(file);
}

// Function to add rows if needed during import
function correctRowCount(importedDataLength) {
    const inputContainer = document.getElementById("input-container");
    const rows = inputContainer.querySelectorAll(".row");

    // Add rows if necessary to fit imported data
    const currentRowsLength = rows.length;
    const rowsToAdd = importedDataLength - currentRowsLength;
    if (rowsToAdd > 0) {
        for (let i = 0; i < rowsToAdd; i++) {
            createRow(true);
        }
    }
}

// Function to update input fields based on imported data
function updateFields() {
    const inputContainer = document.getElementById("input-container");
    const rows = inputContainer.querySelectorAll(".row");

    rows.forEach((row, index) => {
        const textInput = row.querySelector("input[type='text']");
        const numberInput = row.querySelector("input[type='number']");

        textInput.value = spiderChartLabels[index] || '';
        numberInput.value = spiderChartData[index] || 0;
    });
}

// Initial setup for import/export buttons
document.addEventListener("DOMContentLoaded", function() {
    const controls = document.getElementById("controls");

    // Create export button
    const exportButton = document.createElement("button");
    exportButton.innerText = "Export";
    exportButton.onclick = exportData;
    exportButton.style.marginBottom = "5px"; // Add margin bottom for spacing
    controls.appendChild(exportButton);

    // Add a line break
    controls.appendChild(document.createElement("br"));

    // Create label for import input
    const importButton = document.createElement("input");
    importButton.type = "button";
    importButton.value = "Import";
    importButton.onclick = function() {
        document.getElementById('file').click();
    };
    controls.appendChild(importButton);

    // Create import input
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.style.display = "none"; // Hide the input
    importInput.id = "file";
    importInput.name = "file";
    importInput.accept = ".json";
    importInput.addEventListener("change", importData);
    controls.appendChild(importInput);
});
