// app.js

// Track completed challenges locally (updated from API)
let completedChallenges = new Set();
const totalChallenges = document.querySelectorAll('.subcategory').length;
const userId = "1"; // Matches API expectation as string
const apiBaseUrl = "http://localhost:8000"; // Adjust if API runs elsewhere

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

// Hardcoded exercises
let exercises = {
    1: {
        description: "The programming folklore is that everyone's first program just prints the text 'Hello, world!' on the screen.",
        starterCode: "",
        testCases: { input: "", expected: "Hello, world!" }
    },
    2: {
        description: "You found a T-shirt which costs 90 SEK, and as a regular customer you get 3% discount. How much would the T-shirt cost for you? \n\nWrite down the computation by first definining two variables price and discount, and then storing the result in the variable my_price. At the end print the result.",
        starterCode: "",
        testCases: { input: "90, 3", expected: "87.3" }
    },
    3: {
        description: "Factorial of n is the product of the numbers from 1 to n. Write a function to compute the product, e.g. \n\nfactorial(1) → 1 \nfactorial(4) → 24 \nfactorial(13) → 6227020800",
        starterCode: "",
        testCases: { input: "0", expected: "32.0" }
    },
    4: {
        description: "Factorial of n is the product of the numbers from 1 to n. Write a function to compute the product.",
        starterCode: "",
        testCases: { input: "5", expected: "120" }
    },
    5: {
        description: "Define the function hSum which computes different approximations of the harmonic series.",
        starterCode: "",
        testCases: { input: "3", expected: "1.8333333333333333" }
    },
    6: {
        description: "Define a function such that going_out(sunny,stay_in) is True when it is time to go out, and False otherwise.",
        starterCode: "",
        testCases: { input: "True, False", expected: "True" }
    },
    7: {
        description: "Write the function legal_status(age) which returns one of the strings 'minor', 'adult','alcohol', 'senator', or 'president', depending on the parameter age.",
        starterCode: "",
        testCases: { input: "20", expected: "alcohol" }
    },
    8: {
        description: "Write the function near_number(m,n) which returns True only when the difference between the two numbers m and n is no more than 10.",
        starterCode: "",
        testCases: { input: "15, 20", expected: "True" }
    },
    9: {
        description: "A certain CS professor gives 5-point quizzes that are graded on the scale 5 points for A, 4 points for B, 3 points for C, 2 points for D, and 0 to 1 points for F.",
        starterCode: "",
        testCases: { input: "4", expected: "B" }
    },
    10: {
        description: "A certain CS professor gives 100-point exams that are graded on the scale 90-100 points for A, 80-89 points for B, 70-79 points for C, 60-69 points for D, and less than 60 points for F.",
        starterCode: "",
        testCases: { input: "85", expected: "B" }
    },
    11: {
        description: "Implement an algorithm for computing the area of a cylinder.",
        starterCode: "",
        testCases: { input: "2, 5", expected: "62.83185307179586" }
    },
    12: {
        description: "Write a function called basel which returns an approximation of the Basel sum.",
        starterCode: "",
        testCases: { input: "10", expected: "1.5497677311665408" }
    },
    13: {
        description: "Implement the function extrapolate(x1,y1,x2,y2,x) which given the coordinates of the two points and a new x, returns the y coordinate such that (x,y) belongs to the line.",
        starterCode: "",
        testCases: { input: "0, 0, 2, 4, 1", expected: "2" }
    },
    14: {
        description: "Implement three functions which make it possible to experiment with the logistic map: logmap, experiment, and table.",
        starterCode: "",
        testCases: { input: "0.5, 3.7", expected: "0.925" }
    },
    15: {
        description: "Define a function which given a name returns a greeting.",
        starterCode: "",
        testCases: { input: "'Alice'", expected: "Hello, Alice!" }
    },
    16: {
        description: "Implement the function tag for adding tags to text.",
        starterCode: "",
        testCases: { input: "'hello', 'b'", expected: "<b>hello</b>" }
    },
    17: {
        description: "Implement the function numeric_value for computing the number.",
        starterCode: "",
        testCases: { input: "'abc'", expected: "6" }
    },
    18: {
        description: "Implement the function same_ends which given a list returns True/False depending on whether the first and the last elements in the list are the same.",
        starterCode: "",
        testCases: { input: "[1, 2, 1]", expected: "True" }
    },
    19: {
        description: "Given a list with an even number of elements, generate a new list where the first and the second halves of the original are swapped.",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4]", expected: "[3, 4, 1, 2]" }
    },
    20: {
        description: "Implement the function skip which given a number n and a list returns a new list with every n-th element in the original list.",
        starterCode: "",
        testCases: { input: "2, [1, 2, 3, 4, 5]", expected: "[1, 3, 5]" }
    },
    21: {
        description: "Write the function acronym which computes the acronym from a phrase.",
        starterCode: "",
        testCases: { input: "'random access memory'", expected: "RAM" }
    },
    22: {
        description: "Implement the cipher as a function, i.e. caesar(2,'secret') should return 'ugetgv'.",
        starterCode: "",
        testCases: { input: "2, 'secret'", expected: "ugetgv" }
    },
    23: {
        description: "Implement the function kcals for computing the amount of kilocalories in a recipe.",
        starterCode: "",
        testCases: { input: "[{'item': 'sugar', 'grams': 100}]", expected: "387" }
    },
    24: {
        description: "Implement the function word_index which takes a string and returns a dictionary which maps words to their positions.",
        starterCode: "",
        testCases: { input: "'hello world hello'", expected: "{'hello': [0, 2], 'world': [1]}" }
    },
    25: {
        description: "Implement the function filesum which computes the sum of numbers in a file.",
        starterCode: "",
        testCases: { input: "'1\\n2\\n3'", expected: "6" }
    },
    26: {
        description: "Implement the function passwords which given a file name builds a dictionary with user/password pairs.",
        starterCode: "",
        testCases: { input: "'user1:pass1\\nuser2:pass2'", expected: "{'user1': 'pass1', 'user2': 'pass2'}" }
    },
    27: {
        description: "Complete the functions invisible2bin and bin2txt to decode secret messages.",
        starterCode: "",
        testCases: { input: "'101'", expected: "5" }
    },
    28: {
        description: "Add the class WebLogin which controls user passwords for a web site.",
        starterCode: "",
        testCases: { input: "'user', 'pass'", expected: "True" }
    },
    29: {
        description: "Implement the class DiceStats that can be used to check whether a dice is fair.",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4, 5, 6]", expected: "True" }
    },
    30: {
        description: "Implement a class TrainSeats which realizes a naive system for train tickets.",
        starterCode: "",
        testCases: { input: "5, 2", expected: "True" }
    },
    31: {
        description: "Add the class ApplicationList which collects the applications.",
        starterCode: "",
        testCases: { input: "'app1'", expected: "['app1']" }
    },
    32: {
        description: "Complete the methods in the FifteenModel class.",
        starterCode: "",
        testCases: { input: "(0, 1)", expected: "True" }
    },
    33: {
        description: "Implement the class Ratio with at least the methods __init__, __repr__, __add__, __mul__, and __eq__.",
        starterCode: "",
        testCases: { input: "1, 2, 3, 4", expected: "'5/4'" }
    },
    34: {
        description: "Complete the methods in the classes SimpleCounter, BoundedCounter, and ChainedCounter.",
        starterCode: "",
        testCases: { input: "5", expected: "5" }
    },
    35: {
        description: "Write the function combinations(n,k) which implements the recursive formula.",
        starterCode: "",
        testCases: { input: "5, 2", expected: "10" }
    },
    36: {
        description: "Complete the function gcd which calculates and returns the greatest common divisor of arguments m and n by using Euclid's algorithm.",
        starterCode: "",
        testCases: { input: "48, 18", expected: "6" }
    },
    37: {
        description: "Implement the function binarySearch which uses recursion to find the position of a key in a sorted list.",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4, 5], 3", expected: "2" }
    },
    38: {
        description: "Implement the function movieTickets(nrTickets,nrUnder18,time) which takes the number of tickets, the number of people under 18 and the starting time and returns the total price for all tickets.",
        starterCode: "",
        testCases: { input: "3, 1, '18:00'", expected: "240" }
    },
    39: {
        description: "Implement the function pepLineLength(filename) which checks the length of lines in a file and prints warnings for lines that are too long.",
        starterCode: "",
        testCases: { input: "'a' * 80", expected: "True" }
    },
    40: {
        description: "Implement the class Card to represent a playing card.",
        starterCode: "",
        testCases: { input: "'Ace', 'Spades'", expected: "'Ace of Spades'" }
    },
    41: {
        description: "Write the function pandemic_rules(numC,totalNum,population) which takes as arguments the actual number of infections in C and returns the color of the country.",
        starterCode: "",
        testCases: { input: "50, 100, 1000", expected: "'yellow'" }
    },
    42: {
        description: "Write the function div9(num) which does the divisibility test and prints out the intermediate sums after each step.",
        starterCode: "",
        testCases: { input: "18", expected: "True" }
    },
    43: {
        description: "Create a class called StatSet that can be used to do simple statistical calculations.",
        starterCode: "",
        testCases: { input: "[1, 2, 3]", expected: "2.0" }
    },
    44: {
        description: "Implement the function calculate_loan(property_price,loan,interest_rate) which calculates and prints the expenses for the loan.",
        starterCode: "",
        testCases: { input: "100000, 80000, 0.05", expected: "4000" }
    },
    45: {
        description: "Implement the function code_words(text, dictionary) which takes as the first argument an arbitrary text as string and returns a new version of the text where certain code words are replaced with other words.",
        starterCode: "",
        testCases: { input: "'hello world', {'hello': 'hi'}", expected: "hi world" }
    },
    46: {
        description: "Implement the class Robot which models the state of a robot which moves over a surface.",
        starterCode: "",
        testCases: { input: "(1, 0)", expected: "'(1, 0)'" }
    }
};

// Fetch user progress from API
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
            return; // Success, exit loop
        } catch (error) {
            console.error('Error fetching progress:', error.message);
            retries--;
            if (retries === 0) {
                alert('Failed to load progress after multiple attempts. Check your connection or API status.');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
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
            // Restore completed status from API data
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

// Run code with Pyodide and verify with API

async function runCode() {
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

    try {
        const test = exercises[exerciseId].testCases || { input: "", expected: "Test not implemented" };
        console.log('Test case:', test);

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

        // Submit to API and verify completion
        const passedLocally = userResult === test.expected;
        console.log('Passed locally:', passedLocally, 'Expected:', test.expected);

        const apiVerified = await submitCode(exerciseId, code, userResult);
        console.log('API verified:', apiVerified);

        if (apiVerified) {
            completedChallenges.add(exerciseId); // Add to local set immediately
            activeSubcategory.classList.add('completed'); // Apply checkmark immediately
            updateProgress();
            resultDiv.classList.add('success-animation');
            setTimeout(() => resultDiv.classList.remove('success-animation'), 1000);
            resultDiv.innerHTML = `
                <span class="pass">✓ Success!</span> All test cases passed!<br>
                Input: "${test.input}", Expected: "${test.expected}", Got: "${userResult}"<br>
                Challenge completed: ${activeSubcategory.textContent.trim()}
            `;
            // Refresh progress to ensure UI syncs with API
            await fetchProgress(); // This ensures any discrepancies are resolved
        } else {
            resultDiv.innerHTML = `
                <span class="fail">✗ Failed!</span> Test case failed or not verified by server:<br>
                Input: "${test.input}", Expected: "${test.expected}", Got: "${userResult}"<br>
                Try again with a different solution.
            `;
        }
    } catch (error) {
        console.error('Error running code:', error.message);
        resultDiv.innerHTML = `<span class="fail">✗ Error:</span> ${error.message}`;
    }
}

// Initialize progress and fetch from API on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchProgress();
});

// Load Pyodide on page load
initializePyodide();

// Ensure runCode is globally available
window.runCode = runCode;