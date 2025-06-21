 // DOM Elements
        const welcomeScreen = document.getElementById('welcomeScreen');
        const dashboard = document.getElementById('dashboard');
        const enterBtn = document.getElementById('enterBtn');
        const submitCondition = document.getElementById('submitCondition');
        const ageBasedNotice = document.getElementById('ageBasedNotice');
        const ageNoticeText = document.getElementById('ageNoticeText');

        // Patient Data
        let patientAge = 0;

        // Enter Dashboard
        enterBtn.addEventListener('click', () => {
            const name = document.getElementById('patientNameInput').value;
            patientAge = parseInt(document.getElementById('patientAgeInput').value);

            if (name && patientAge) {
                document.getElementById('displayName').textContent = name;
                document.getElementById('displayAge').textContent = patientAge;
                welcomeScreen.style.display = 'none';
                dashboard.style.display = 'block';
                
                // Start vitals simulation
                simulateVitals();
            } else {
                alert('Please enter both name and age');
            }
        });

       // Submit Condition - Updated to handle async
submitCondition.addEventListener('click', async () => {
    const condition = document.getElementById('diseaseInput').value;
    if (!condition) {
        alert('Please enter a condition');
        return;
    }

    try {
        // Show loading state
        document.getElementById('currentMeds').textContent = "Asking AI doctor...";
        
        // Get age-appropriate recommendation (with await)
        const recommendation = await getAgeBasedRecommendation(condition, patientAge);
        
        // Update UI
        document.getElementById('disease').textContent = condition;
        document.getElementById('currentMeds').textContent = recommendation;
        
        // Add to history
        const historyItem = document.createElement('li');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span><strong>${new Date().toLocaleDateString()}</strong>: ${condition}</span>
            <span style="color: var(--primary);">${recommendation}</span>
        `;
        
        const historyList = document.getElementById('historyList');
        if (historyList.firstChild?.textContent.includes('No history')) {
            historyList.innerHTML = '';
        }
        historyList.prepend(historyItem);

        // Show age notice
        ageBasedNotice.style.display = 'block';
        ageNoticeText.textContent = `Note: Recommendation adjusted for ${patientAge} year old patient`;
        
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('currentMeds').textContent = "Error getting recommendation";
        showAlert("Failed to get AI recommendation", "danger");
    }
});

// Age-based medication recommendations (unchanged)
async function getAgeBasedRecommendation(disease, age) {
    // Gemini API key
    const apiKey = "Replace with you own API key";
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As a senior doctor, suggest medication for ${disease} in a ${age} year old patient. 
                        Consider age-appropriate dosing. Respond with ONLY the medication name and dosage instructions 
                        in less than 30 words. Format: "Medication Name - Dosage Instructions"`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 100,
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            })
        });

        if (!response.ok) throw new Error("API request failed");
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Consult doctor for age-appropriate prescription";
        
    } catch (error) {
        console.error("AI Error:", error);
        // Fallback to manual recommendations if API fails
        if (age < 12) return "Pediatric dosage - consult doctor";
        if (age > 65) return "Reduced dosage for elderly - monitor closely";
        return "Standard adult dosage";
    }
}

        // Simulate vitals data
        function simulateVitals() {
            setInterval(() => {
                // Blood Pressure
                const systolic = Math.floor(110 + Math.random() * 20);
                const diastolic = Math.floor(70 + Math.random() * 10);
                document.getElementById('bp').textContent = `${systolic}/${diastolic} mmHg`;
                document.getElementById('bpTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Temperature
                const temp = (97 + Math.random() * 3).toFixed(1);
                document.getElementById('temp').textContent = `${temp}°F`;
                document.getElementById('tempTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Pulse
                const pulse = Math.floor(60 + Math.random() * 20);
                document.getElementById('pulse').textContent = `${pulse} bpm`;
                document.getElementById('pulseTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Check for alerts
                checkAlerts(systolic, diastolic, temp, pulse);
            }, 3000);
        }

        // Initialize chart
        const ctx = document.getElementById('vitalChart').getContext('2d');
        const vitalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [
                    {
                        label: 'Blood Pressure (systolic)',
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        data: Array(20).fill(120),
                        tension: 0.1,
                        borderWidth: 2
                    },
                    {
                        label: 'Temperature (°F)',
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        data: Array(20).fill(98.6),
                        tension: 0.1,
                        borderWidth: 2
                    },
                    {
                        label: 'Pulse (bpm)',
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        data: Array(20).fill(72),
                        tension: 0.1,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 20
                        }
                    }
                }
            }
        });

        // Update the chart in your simulateVitals function
        function simulateVitals() {
            let time = 0;
            
            setInterval(() => {
                // Blood Pressure
                const systolic = Math.floor(110 + Math.random() * 20);
                const diastolic = Math.floor(70 + Math.random() * 10);
                document.getElementById('bp').textContent = `${systolic}/${diastolic} mmHg`;
                document.getElementById('bpTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Temperature
                const temp = (97 + Math.random() * 3).toFixed(1);
                document.getElementById('temp').textContent = `${temp}°F`;
                document.getElementById('tempTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Pulse
                const pulse = Math.floor(60 + Math.random() * 20);
                document.getElementById('pulse').textContent = `${pulse} bpm`;
                document.getElementById('pulseTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
                
                // Update chart
                vitalChart.data.labels.push(time++);
                vitalChart.data.datasets[0].data.push(systolic);
                vitalChart.data.datasets[1].data.push(temp);
                vitalChart.data.datasets[2].data.push(pulse);
                
                // Limit to 20 data points
                if (vitalChart.data.labels.length > 20) {
                    vitalChart.data.labels.shift();
                    vitalChart.data.datasets.forEach(dataset => dataset.data.shift());
                }
                
                vitalChart.update();
                
                // Check for alerts
                checkAlerts(systolic, diastolic, temp, pulse);
            }, 3000);
        }

        // Check for abnormal vitals
        function checkAlerts(systolic, diastolic, temp, pulse) {
            const alertList = document.getElementById('alertList');
            let alerts = [];
            
            // Blood Pressure alerts
            if (systolic > 140 || diastolic > 90) {
                alerts.push({
                    type: 'danger',
                    icon: 'fa-heartbeat',
                    message: `High BP: ${systolic}/${diastolic} mmHg (Consider intervention)`
                });
            } else if (systolic < 90 || diastolic < 60) {
                alerts.push({
                    type: 'danger',
                    icon: 'fa-heartbeat',
                    message: `Low BP: ${systolic}/${diastolic} mmHg (Monitor closely)`
                });
            }
            
            // Temperature alerts
            if (temp > 100.4) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-temperature-high',
                    message: `Fever: ${temp}°F (Monitor for infection)`
                });
            } else if (temp < 96) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-temperature-low',
                    message: `Low Temp: ${temp}°F (Check for hypothermia)`
                });
            }
            
            // Pulse alerts
            if (pulse > 100) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-heart',
                    message: `Tachycardia: ${pulse} bpm (Consider causes)`
                });
            } else if (pulse < 50) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-heart',
                    message: `Bradycardia: ${pulse} bpm (Evaluate)`
                });
            }
            
            // Update alerts display
            if (alerts.length > 0) {
                alertList.innerHTML = alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <i class="fas ${alert.icon}"></i>
                        ${alert.message}
                    </div>
                `).join('');
            } else {
                alertList.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-check-circle"></i>
                        All vitals within normal range
                    </div>
                `;
            }
        }