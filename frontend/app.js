// app.js

import exercises from './exercises.js';

// Track completed challenges locally (updated from API)
let completedChallenges = new Set();
const totalChallenges = document.querySelectorAll('.subcategory').length;
const userId = "1"; // Matches API expectation as string
const apiBaseUrl = "http://localhost:8000"; // Change when containerized

// Update progress bar
function updateProgress() {
    const progressPercent = (completedChallenges.size / totalChallenges) * 100;
    document.getElementById('overall-progress').style.width = progressPercent + '%';
    document.getElementById('progress-percent').innerText = Math.round(progressPercent) + '%';
    console.log('Progress updated:', progressPercent + '%');
}

// Initialize CodeMirror editor with Monokai theme
const editor = CodeMirror(document.getElementById('editor'), {
    value: "# Select an exercise to start coding...",
    mode: 'python',
    lineNumbers: true,
    theme: 'monokai',
    indentUnit: 4,
    tabSize: 4,
    autoCloseBrackets: true
});

// Load Pyodide for Python execution
let pyodide;

async function initializePyodide() {
    console.log('Initializing Pyodide...');
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
    await pyodide.loadPackage(['micropip']);
    console.log('Pyodide initialized');
}

// API client for LLM (based on your provided code)
const client = axios.create({
    baseURL: 'https://chatapi.akash.network/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxxxxxxxxx' // Replace with your actual API key
    }
});

// LLM client with loading indicator and fallback model functionality
async function getLLMErrorMessage(exerciseId, code, input, expected, got) {
    // Show loading indicator when LLM query starts
    const resultDiv = document.getElementById('result');
    const originalContent = resultDiv.innerHTML;
    resultDiv.innerHTML = `
        <div class="llm-loading">
            <div class="llm-spinner"></div>
            <div>Generating helpful feedback...</div>
        </div>
        ${originalContent}
    `;
    
    try {
        const prompt = `
            The user submitted the following Python code for exercise ${exerciseId}:
            \`\`\`python
            ${code}
            \`\`\`
            For the test case with input "${input}", the expected output was "${expected}", but the code produced "${got}".
            Please provide a concise error message explaining ways to fix it.
            The message should be 300 characters max. Answer with newline '\n' after each line.
        `;
        
        // Try primary model first
        try {
            const response = await client.post('/chat/completions', {
                model: "Meta-Llama-3-3-70B-Instruct",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });
            return response.data.choices[0].message.content.trim();
        } catch (primaryError) {
            console.warn('Primary model failed, trying fallback model:', primaryError);
            
            // Update loading indicator to show fallback
            resultDiv.querySelector('.llm-loading div:last-child').textContent = 'Primary model unavailable, trying backup...';
            
            // Try fallback model
            const fallbackResponse = await client.post('/chat/completions', {
                model: "nvidia-Llama-3-1-Nemotron-70B-Instruct-HF",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });
            return fallbackResponse.data.choices[0].message.content.trim();
        }
    } catch (error) {
        console.error('All LLM models failed:', error);
        return "Sorry, I'm sleeping at this moment.";
    } finally {
        // Remove loading indicator from result div
        const loadingElement = resultDiv.querySelector('.llm-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
}


async function fetchProgress() {
    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch(`${apiBaseUrl}/progress/${userId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const progressData = await response.json();
            completedChallenges = new Set(progressData.filter(item => item.completed).map(item => String(item.exercise_id)));
            console.log('Progress fetched:', [...completedChallenges]);
            updateProgress();

            // Sync UI with completed challenges
            document.querySelectorAll('.subcategory').forEach(subcategory => {
                const exerciseId = subcategory.getAttribute('data-id');
                if (completedChallenges.has(exerciseId)) {
                    subcategory.classList.add('completed');
                } else {
                    subcategory.classList.remove('completed');
                }
            });

            // Determine the default exercise to display
            let defaultExerciseId;
            if (completedChallenges.size === 0) {
                defaultExerciseId = "1"; // No exercises completed
            } else if (completedChallenges.size === totalChallenges) {
                defaultExerciseId = "1"; // All exercises completed
            } else {
                const lastCompletedId = Math.max(...Array.from(completedChallenges).map(id => parseInt(id)));
                defaultExerciseId = String(lastCompletedId + 1);
                if (!exercises[defaultExerciseId]) {
                    defaultExerciseId = "1";
                }
            }

            // Load the default exercise
            const defaultExercise = exercises[defaultExerciseId];
            if (defaultExercise) {
                document.getElementById('problem').innerText = defaultExercise.description;
                editor.setValue(defaultExercise.starterCode);
                const defaultSubcategory = document.querySelector(`.subcategory[data-id="${defaultExerciseId}"]`);
                if (defaultSubcategory) {
                    document.querySelectorAll('.subcategory').forEach(item => item.classList.remove('active'));
                    defaultSubcategory.classList.add('active');
                    console.log(`Default exercise set to ${defaultExerciseId}:`, defaultExercise);
                }
            }

            // Ensure visibility state
            document.querySelector('.landing-page').classList.add('hidden');
            document.querySelector('.app-container').classList.add('visible');
            console.log('Visibility after fetchProgress:', {
                landing: document.querySelector('.landing-page').classList.contains('hidden'),
                app: document.querySelector('.app-container').classList.contains('visible')
            });

            return; // Success, exit loop
        } catch (error) {
            console.error('Error fetching progress:', error.message);
            retries--;
            if (retries === 0) {
                alert('Failed to load progress after multiple attempts. Check your connection or API status.');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}

// Submit code result to API and verify completion
async function submitCode(exerciseId, code, userResult) {
    try {
        const response = await fetch(`${apiBaseUrl}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exercise_id: parseInt(exerciseId),
                user_id: userId,
                code: code
            })
        });
        if (!response.ok) throw new Error('Failed to submit code');
        const result = await response.json();
        console.log('API response:', result);
        return result.result; // API returns { "result": true/false }
    } catch (error) {
        console.error('Error submitting code:', error.message);
        return false;
    }
}

// Toggle categories
document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('click', function() {
        this.classList.toggle('collapsed');
        const subcategories = this.nextElementSibling;
        subcategories.classList.toggle('hidden');

        if (!this.classList.contains('collapsed')) {
            document.querySelectorAll('.category').forEach(otherCategory => {
                if (otherCategory !== this && !otherCategory.classList.contains('collapsed')) {
                    otherCategory.classList.add('collapsed');
                    otherCategory.nextElementSibling.classList.add('hidden');
                }
            });
        }
    });
});

// Handle subcategory selection
document.querySelectorAll('.subcategory').forEach(subcategory => {
    subcategory.addEventListener('click', function() {
        document.querySelectorAll('.subcategory').forEach(item => item.classList.remove('active'));
        this.classList.add('active');

        const exerciseId = this.getAttribute('data-id');
        const exercise = exercises[exerciseId];
        if (exercise) {
            document.getElementById('problem').innerText = exercise.description;
            editor.setValue(exercise.starterCode);
            console.log(`Loaded exercise ${exerciseId}:`, exercise);
            if (completedChallenges.has(exerciseId)) {
                this.classList.add('completed');
                console.log(`Restored completed status for exercise ${exerciseId}`);
            }
        } else {
            document.getElementById('problem').innerText = "Error: Exercise not found.";
            editor.setValue("# Unable to load exercise.");
            console.error(`Exercise ${exerciseId} not found in hardcoded data.`);
        }

        document.getElementById('result').innerText = "Result: Run your code to see results";
    });
});

async function runCode() {
    console.log('runCode triggered');
    if (!pyodide) await initializePyodide();
    const code = editor.getValue();
    const activeSubcategory = document.querySelector('.subcategory.active');
    if (!activeSubcategory) {
        console.log('No active subcategory');
        document.getElementById('result').innerText = "Error: No exercise selected.";
        return;
    }

    const exerciseId = activeSubcategory.getAttribute('data-id');
    const resultDiv = document.getElementById('result');
    console.log('Running code for exercise:', exerciseId);
    console.log('Code:', code);

    // Define test outside the try block so it’s always available
    const test = exercises[exerciseId].testCases || { input: "", expected: "Test not implemented" };
    console.log('Test case:', test);

    try {
        let evalCode = `
import sys
from io import StringIO

# Redirect stdout to capture print statements
old_stdout = sys.stdout
sys.stdout = StringIO()

${code}

# Restore stdout and get printed output
printed_output = sys.stdout.getvalue().strip()
sys.stdout = old_stdout

# Try to get the last defined function's result with the test input
try:
    last_func = [line.split('def ')[1].split('(')[0] for line in '''${code}'''.split('\\n') if line.strip().startswith('def ')][-1]
    result = str(eval(f"{last_func}(${test.input})"))
except (IndexError, NameError, SyntaxError, TypeError):
    result = printed_output if printed_output else str(eval('''${code}'''.split('\\n')[-1] if '''${code}'''.split('\\n')[-1].strip() else '""'))
`;

        await pyodide.runPythonAsync(evalCode);
        let userResult = pyodide.globals.get('result') || '';
        console.log('User result:', userResult);

        const passedLocally = userResult === test.expected;
        console.log('Passed locally:', passedLocally, 'Expected:', test.expected);

        const apiVerified = await submitCode(exerciseId, code, userResult);
        console.log('API verified:', apiVerified);

        if (apiVerified) {
            completedChallenges.add(exerciseId);
            activeSubcategory.classList.add('completed');
            updateProgress();
            resultDiv.classList.add('success-animation');
            setTimeout(() => resultDiv.classList.remove('success-animation'), 1000);
            resultDiv.innerHTML = `
                <span class="pass">✓ Success!</span> All test cases passed!<br>
                Input: "${test.input}", Expected: "${test.expected}", Got: "${userResult}"<br>
                Challenge completed: ${activeSubcategory.textContent.trim()}
            `;
            // Load the next exercise (unchanged logic)
            let nextExerciseId;
            if (completedChallenges.size === totalChallenges) {
                nextExerciseId = "1";
            } else {
                const lastCompletedId = Math.max(...Array.from(completedChallenges).map(id => parseInt(id)));
                nextExerciseId = String(lastCompletedId + 1);
                if (!exercises[nextExerciseId]) nextExerciseId = "1";
            }
            const nextExercise = exercises[nextExerciseId];
            if (nextExercise) {
                document.getElementById('problem').innerText = nextExercise.description;
                editor.setValue(nextExercise.starterCode);
                const nextSubcategory = document.querySelector(`.subcategory[data-id="${nextExerciseId}"]`);
                if (nextSubcategory) {
                    document.querySelectorAll('.subcategory').forEach(item => item.classList.remove('active'));
                    nextSubcategory.classList.add('active');
                    console.log(`Next exercise set to ${nextExerciseId}:`, nextExercise);
                }
            }
            document.querySelector('.landing-page').classList.add('hidden');
            document.querySelector('.app-container').classList.add('visible');
        } else {
            const llmErrorMessage = await getLLMErrorMessage(exerciseId, code, test.input, test.expected, userResult);
            resultDiv.innerHTML = `

                <strong>Glenda's Feedback:</strong> ${llmErrorMessage}
            `;
        }
    } catch (error) {
        console.error('Error running code:', error);
        // Send the full error (not just message) to the LLM
        const errorDetails = error.stack || error.toString(); // Gives more context
        const llmErrorMessage = await getLLMErrorMessage(exerciseId, code, test.input, test.expected, `Error: ${errorDetails}`);
        resultDiv.innerHTML = `

            <strong>Papi's Feedback:</strong> ${llmErrorMessage}
        `;
    }
}

// Handle landing page to app transition
document.getElementById('start-coding').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.landing-page').classList.add('hidden');
    document.querySelector('.app-container').classList.add('visible');
    fetchProgress();
});
// Initialize Pyodide on page load
initializePyodide();

// Ensure runCode is globally available
window.runCode = runCode;