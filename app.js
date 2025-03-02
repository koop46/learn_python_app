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
        description: "Implement the function celsius2fahrenheit which takes a temperature in celsius and returns the same temperature in fahrenheit. For example: \n\ncelsius2fahrenheit(0) → 32 \ncelsius2fahrenheit(32) → 89.6 \ncelsius2fahrenheit(100) → 212 \n\nThe conversion formula is \n(<degrees in C> × 9/5) + 32 = <degrees in F>",
        starterCode: "",
        testCases: { input: "0", expected: "32.0" }
    },
    4: {
        description: "Factorial of n is the product of the numbers from 1 to n. Write a function to compute the product, e.g. \n\nfactorial(1) → 1 \nfactorial(4) → 24 \nfactorial(13) → 6227020800",
        starterCode: "",
        testCases: { input: "5", expected: "120" }
    },
    5: {
        description: "Define the function hSum which computes different approximations of the harmonic series. They are defined as the infinite sum:\n\n [Insert image] \n\n\nThe hSum function must compute the first n terms of the sum. For example hSum(5) is 1+1/2+1/3+1/4+1/5 = 2.283333333333333.",
        starterCode: "",
        testCases: { input: "3", expected: "1.8333333333333333" }
    },
    6: {
        description: "We like to go out and enjoy the sun as much as we can, except when we have a meeting and must stay in. \n\nDefine a function such that going_out(sunny,stay_in) is True when it is time to go out, and False otherwise. The parameter sunny is True if the sun is shining, and the parameter stay_in is True when we can't go out.",
        starterCode: "",
        testCases: { input: "True, False", expected: "True" }
    },
    7: {
        description: "In the United States, one is assumed to be an adult, when the age of 18 is reached. However, 21 years are required to purchase alcohol. 30 years to serve as a Senator, and 35 to serve as president. \n\nWrite the function legal_status(age) which returns one of the strings 'minor', 'adult','alcohol', 'senator', or 'president', depending on the parameter age.",
        starterCode: "",
        testCases: { input: "20", expected: "alcohol" }
    },
    8: {
        description: "Write the function near_number(m,n) which returns True only when the difference between the two numbers m and n is no more than 10. The result should be False in all other cases.",
        starterCode: "",
        testCases: { input: "15, 20", expected: "True" }
    },
    9: {
        description: "A certain CS professor gives 5-point quizzes that are graded on the scale 5 points for A, 4 points for B, 3 points for C, 2 points for D, and 0 to 1 points for F. \n\nWrite the function grades which given the number of points computes the grade. For example grades(3) should return the string 'C'.",
        starterCode: "",
        testCases: { input: "4", expected: "B" }
    },
    10: {
        description: "A certain CS professor gives 100-point exams that are graded on the scale 90-100 points for A, 80-89 points for B, 70-79 points for C, 60-69 points for D, and less than 60 points for F.",
        starterCode: "",
        testCases: { input: "85", expected: "B" }
    },
    11: {
        description: "Implement an algorithm for computing the area of a cylinder. A cylinder consists of two circles of radius r for the bases and a side which is a rectangle of hight h and has a width equal to the circumferences of the circles. \n\nDecompose the solution into three functions: \n\n1.Define a function circle_area(r) for computing the area of a circle (πr2); \n2.Define a function circle_circumference(r) for computing the circumference of a circle (2πr); \n3.Define a function cylinder_area(r,h) for computing the area of a cylinder. This function should make use of the previous two. The area of a cylinder is equal to the side area plus twice the area of the base. For computing the side area, you need of course the circumference of the base.",
        starterCode: "",
        testCases: { input: "2, 5", expected: "62.83185307179586" }
    },
    12: {
        description: "Write a function called basel which returns an approximation of the Basel sum: \n\n [Insert image] \n\nthe sum has infinitely many terms but it eventually converges to π2/6. Your function should take a parameter epsilon and sum as many terms as possible until the next one is less than epsilon. \n\nNote that we don't know in advance how many terms to sum, instead we have a termination condition. This indicates that it is convenient to use a while loop.",
        starterCode: "",
        testCases: { input: "10", expected: "1.5497677311665408" }
    },
    13: {
        description: "Two points (x1,y1) and (x2,y2) uniquely determine a line with the equation:\n\n [insert image]\n\nImplement the function extrapolate(x1,y1,x2,y2,x) which given the coordinates of the two points and a new x, returns the y coordinate such that (x,y) belongs to the line.",
        starterCode: "",
        testCases: { input: "0, 0, 2, 4, 1", expected: "2" }
    },
    14: {
        description: "The logistic map is a function from a real number in the range [0; 1] to another number in the same range. Using the map: \n\n[insert image] \n\nand an initial number, we can generate a sequence of numbers. Here 0 < r <= 4 is a fixed parameter. For example, if r=3.9, and we start with the number 0.2, then the next number will be 3.9*0.2*(1-0.2) == 0.624. We can repeat the mapping and get a sequence: \n\n0.2 0.624 0.915 0.303 0.824 ... \n\nThe logistic map was first popularized in a 1976 paper by Robert May for modelling the size of a population of rabbits. It is interesting because it can exhibit both simple periodic behaviour as well as complex chaotic behaviour. \n\nYour task is to implement three functions which make it possible to experiment with the logicstic map: \n\n1.a function logmap(r,x) which takes the value of r and the current x and returns the next number in the sequence. \n2.a function experiment(r,x,n) which also takes r and x but also the parameter n which indicates how many numbers it should compute. Unlike logmap, the new function should not return the numbers, but print them directly on the screen. Here is an example print out from the function:\n\n >>> experiment(3.9,0.2,10) 0.2 0.6240000000000001 0.9150335999999998 0.30321373239705673 0.8239731430433209 0.5656614700878645 0.9581854282490118 0.1562578420270518 0.5141811824451928 0.9742156868513789\n\n and another example: \n\n>>> experiment(3.9,0.21,10) 0.21 0.64701 0.8907134336100001 0.3796377499070677 0.9185004221350089 0.29194384702399534 0.8061792851144187 0.6093915569306115 0.9283306003619574 0.2594782974949042 \n\nNotice that above we started with two very similar initial values 0.2 and 0.21, but the rest of the sequence quickly becomes very different. This is a typical deterministic but chaotic behaviour. \n\n3.Implement a third function table(r,x1,x2,n) which prints two sequences side by side, starting from two different start values x1 and x2. Example:\n\n >>> table(3.9,0.20,0.21,10) 0.2 0.21 0.6240000000000001 0.64701 0.9150335999999998 0.8907134336100001 0.30321373239705673 0.3796377499070677 0.8239731430433209 0.9185004221350089 0.5656614700878645 0.29194384702399534 0.9581854282490118 0.8061792851144187 0.1562578420270518 0.6093915569306115 0.5141811824451928 0.9283306003619574 0.9742156868513789 0.2594782974949042",
        starterCode: "",
        testCases: { input: "0.5, 3.7", expected: "0.925" }
    },
    15: {
        description: "Define a function which given a name returns a greeting, e.g. greeting('Alice') should return 'Hello, Alice!!!'",
        starterCode: "",
        testCases: { input: "'Alice'", expected: "Hello, Alice!" }
    },
    16: {
        description: "All Internet pages are written in the language HTML, where plain text is intermixed with tags which encode formatting instructions. For example <b>attention</b> indicates that the page should show the text 'attention' in bold font. Similarly <i>attention</i> indicates italic style. \n\nImplement the function tag for adding tags to text, e.g. tag('b','hello') must return '<b>hello</b>'.",
        starterCode: "",
        testCases: { input: "'hello', 'b'", expected: "<b>hello</b>" }
    },
    17: {
        description: "Numerologists claim to be able to determine a person's character based on the ''numeric value'' of a name. The value of a name is determined by summing up the values of the letters where 'a' is 1, 'b' is 2, 'c' is 3, up to 'z' being 26. \n\nImplement the function numeric_value for computing the number, e.g. numeric_value('Alice') should return 30.",
        starterCode: "",
        testCases: { input: "'abc'", expected: "6" }
    },
    18: {
        description: "Implement the function same_ends which given a list returns True/False depending on whether the first and the last elements in the list are the same. For example, same_ends(['A','B','C','D','A']) must be True. The function must return False if the list has no elements",
        starterCode: "",
        testCases: { input: "[1, 2, 1]", expected: "True" }
    },
    19: {
        description: "Given a list with an even number of elements, generate a new list where the first and the second halves of the original are swapped. \n\nFor example, swap([1,2,3,4]) must return [3,4,1,2].",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4]", expected: "[3, 4, 1, 2]" }
    },
    20: {
        description: "Implement the function skip which given a number n and a list returns a new list with every n-th element in the original list. For example, skip(2,['A','B','C','D','E']) should return ['A','C','E']",
        starterCode: "",
        testCases: { input: "2, [1, 2, 3, 4, 5]", expected: "[1, 3, 5]" }
    },
    21: {
        description: "An acronym is a word formed by taking the first letters of the words in a phrase and making a word from them. For example, RAM is an acronym for 'random access memory'. \n\nWrite the function acronym which computes the acronym from a phrase, i.e. acronym('random access memory') must return 'RAM'.",
        starterCode: "",
        testCases: { input: "'random access memory'", expected: "RAM" }
    },
    22: {
        description: "A Caesar cipher is a simple subscription cipher based on the idea of shifting each letter of the plaintext message a fixed number (called the key) of positions in the alphabet. For example, if the key is 2, then 'a' becomes 'c', 'b' becomes 'd', etc. When we reach the end of the alphabet, then we wrap around, i.e. 'y' becomes 'a' and 'z' becomes 'b'. If you apply the same cipher with a negative index, then if works as a decoder for an already encrypted message. \n\nImplement the cipher as a function, i.e. caesar(2,'secret') should return 'ugetgv'. Make sure that when you shift the letters in the alphabet, you also wrap around. One way to do that is that when you compute the index of the shifted letter, you also check whether the index is negative or bigger than 25. Another way is to use modulus 26 (e.g. % 26 in Python).",
        starterCode: "",
        testCases: { input: "2, 'secret'", expected: "ugetgv" }
    },
    23: {
        description: "Implement the function kcals for computing the amount of kilocalories in a receipe. The first argument of the function should be a dictionary which maps a product name to the number of kilocalories per unit. The second argument should be a list of tuples. The first element of each tuple is the quantity and the second element is the name of the product. \n\nFor example kcals({'ägg': 137}, [(2,'ägg')]) should return 137*2=274 kilocalories for a receipe which includes only two eggs.",
        starterCode: "",
        testCases: { input: "[{'item': 'sugar', 'grams': 100}]", expected: "387" }
    },
    24: {
        description: "Implement the function word_index which takes a string and returns a dictionary which maps words to their positions. The positions are counted as number of words. All words are assumed to be separated by space. \n\nExample: word_index('the spider indexes the spider web') must return {'the': [0,3],'spider': [1,4], 'indexes': [2], 'web': [5]}",
        starterCode: "",
        testCases: { input: "'hello world hello'", expected: "{'hello': [0, 2], 'world': [1]}" }
    },
    25: {
        description: "Implement the function filesum which computes the sum of numbers in a file. In the file, each number is on a separate line. \n\nExample: filesum('numbers1.txt') should return 10, if numbers1.txt contains:\n\n 1\n 2\n 3\n 4\n",
        starterCode: "",
        testCases: { input: "'1\\n2\\n3'", expected: "6" }
    },
    26: {
        description: "Implement the function passwords which given a file name builds a dictionary with user/password pairs. Each line of the file contains a user name and a password separated by space. \n\nFor example if the file passwords.txt contains: \n\njim 1234\n karolina k333\n beth bravo \n\nthen passwords('passwords.txt') must return {'jim': '1234', 'karolina': 'k333', 'beth': 'bravo'}",
        starterCode: "",
        testCases: { input: "'user1:pass1\\nuser2:pass2'", expected: "{'user1': 'pass1', 'user2': 'pass2'}" }
    },
    27: {
        description: "This exercise is a continuation of the Invisible Ink example from Lecture 4. There we wrote a program which converts an arbitrary ASCII text to a sequence of spaces and tabs. We also talked about how the conversion can be reversed, i.e. from the spaces and tabs we can recover the original text. Your task today is just that - complete the program with a decoder which can read secret messages: \n\n1.Complete the function invisible2bin which takes a string of spaces and tabs and returns a new string where every space is replaced with 0 and every tab character is replaced with 1. \n2.Complete the function bin2txt which takes a string of 0 and 1 and converts it to text. This can be done by chunking the binary string into chunks of eight binary digits and passing each chunk to the function bin2dec defined in the module binaryconv. bin2dec takes a sequence of binary digits and converts that into a number. The only thing left is to call the standard function chr which will convert the number into a character. Concatenate all characters into a string to get the final result.",
        starterCode: "",
        testCases: { input: "'101'", expected: "5" }
    },
    28: {
        description: "Given the class User, add the class WebLogin which controlls user passwords for a web site. It must have the following components: \n\n- One or more instance variables to keep track of which users are registered on the web site. \n- An __init__ method which initializes the instance variables A method for registering new users: \n\ndef addUser(self, name, password, email): ... \n\nIt remembers the user with its name, password and e-mail, and the information is used in the other methods. \n- A method for checking the user name and the password: \n\ndef login(self, name, password): ... \n\n- It must return True if there is a user with that name and password, and False in all other cases \n- A method which can be used to remind the user of his/her password: \n\ndef sendPassword(self, name): ... \n\nIf there is a user with the given name then the method should call the method sendMessage from User with the message ''Your password is: 123'' where instead of 123 your should place the real password.",
        starterCode: "",
        testCases: { input: "'user', 'pass'", expected: "True" }
    },
    29: {
        description: "Every time when we throw a dice we get a random number from 1 to 6. A fair dice should roll to any of its sides with an equal probability. Write the class DiceStats that can be used to check whether a dice is fair. It should have the following methods: \n\n- an __init__ method to initialize all attributes that you need \n- a method to register a new roll of the dice: \n\ndef addRoll(self, roll): ... \n\nHere roll is a number between 1 and 6. \n- a method to compute the frequencies of all possible outcomes: \n\ndef getFrequencies(self): ... \n\nThe frequency of an outcome is the number of times the corresponding number rolled up divided by the total number of dice rolls. The result from getFrequencies() should be a list which contains one frequency for each possible outcome. \n- a method to estimate whether the dice is fair: \n\ndef isFair(self,epsilon): ... \n\nA dice is fair if the frequencies for each outcome is in the range 1/6 ± epsilon. The method should return True/False depending on whether the dice is fair.",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4, 5, 6]", expected: "True" }
    },
    30: {
        description: "Implement a class TrainSeats which realizes a naive system for train tickets. For the sake of simplicity we will assume that the seats are simply numbered with integers and there are no separate car numbers, rows, etc. The class should have the following components: \n\n- An __init__ method: \n\ndef __init__(self, nrOfSeats): ... \n\nwhere nrOfSeats is the number of seats in the train. When you construct a new object then by default all seats in the train are free. \n- The user can book a seat on the train by calling one of the methods: \n\ndef pick(self, seatNum): ... \ndef book(self, n): ... \n\nCalling pick(seatNum) reserves a seat with number seatNum and the method returns True if the reservation was successful. If the seat is already booked then the result must be False. In contrast, calling book(n) reserves n seats from the train and the user has no way to choose which seats will be allocated; the simplest strategy is that you just allocate the first n available seats that you find. The seats don’t have to be next to each other. Seats that are already reserved with pick() or book() cannot be reserved again. The result from book() is a list with n elements which contains the numbers of the allocated seats. If it is impossible to find n free seats then no booking is made and the result must be the special value None.",
        starterCode: "",
        testCases: { input: "5, 2", expected: "True" }
    },
    31: {
        description: "One public school every year receives applications for new students. Each application is sent through a web site and the relevant information is packaged in an instance of the class Application shown bellow. \n\nThe number of students that will be accepted is always fixed in advance and the students are accepted in the order in which they have sent their applications. Moreover only applications from students who live at most five kilometers from the schools are considered. \n\nAdd the class ApplicationList which collects the applications. The class should contain the following components: \n\n- An __init__ method: \n\ndef __init__(self, nrOfStudents): ... \n\nwhere nrOfStudents is the number of students that will be accepted this year. \n- A method which adds a new application: \n\ndef addApplication(self, app): ... \n\n- A method which prints the list of students that were accepted: \n\ndef printAccepted(self): ... \n\nEach student should be printed with its name and personal number.",
        starterCode: "",
        testCases: { input: "'app1'", expected: "['app1']" }
    },
    32: {
        description: "In this exercise we will develop a model class for the Fifteen Puzzle: \n1	2	3	4 \n5	6	7	8 \n9	10	11	12 \n13	14	15 \n\nThe easiest way to model the state of the puzzle is via a list of four rows, where each row itself is a list with four integers. The integers in each row represent the numbers shown in the individual blocks in the puzzle. When the number is 0 then this would mean that the corresponding position is the hole. The skeleton of the FifteenModel class is given bellow, your task is to complete the methods: \n\n1.The constructor __init__ must initialize an attribute with the state of the puzzle as it is shown on the picture above. In other words, the attribute must contain a list of lists, where the numbers will be increasing from top to bottom. The hole must be in the lower-right corner. Make the initialization by using two nested loops. Don't write the numbers by hand, that would be tiring and boring! \n2.Complete the method getValue which must return the number at position (row, col). \n3.Complete the method tryMove which tries to move the hole to position (row, col). This is possible only if the hole is currently adjacent to the target position, i.e. it is located to the left, to the right, above or bellow the target position. For each of the adjacent positions you must check whether the number there is equal to zero. If it is zero, then replace it with the number at the target position (row, col). After that change the number at position (row, col) to zero. When you are done with this step, it will be possible to move pieces on the puzzle above by clicking on any of the blocks adjacent to the hole. \n4.Complete the method shuffle which should randomly shuffle the current state. The easiest way to do that is to call tryMove one thousand times with a random row and column. Many of the movements will fail but enough will succeed to produce a shuffled puzzle. After this last step is done, the puzzle above will shuffle every time when you click ''Go''.",
        starterCode: "",
        testCases: { input: "(0, 1)", expected: "True" }
    },
    33: {
        description: "We have seen that arithmetics with floating point numbers is imprecise due to rounding errors. One way to avoid that is to use rational numbers instead of floating point numbers. In this way, for example, the number 1/3 can be stored exactly, while with a floating point the best that we can get is 0.333...333 with a finite sequence of digits after the dot, while mathematically it should continue indefinitely. For that purpose Python provides the module fractions. \n\nTry this in the Python shell: \n\n>>> from fractions import *\n >>> x = Fraction(1,3) \n>>> 2*x \nFraction(2, 3) \n>>> y=Fraction(1,2) \n>>> x+y \nFraction(5, 6) \n\nHere, after the import, we first assign to x the value 1/3 which in Python is written as Fraction(1,3). After that we print the result of 2*x which is equal to 2/3. Finally we assign to y the value 1/2 and we print the result of x+y which is 5/6. \n\nFraction in Python is actually a class. When you say Fraction(1,2) this calls the constructor of the class which stores the numbers 1 and 2 to two attributes. Whenever we use an operator like *, +, /, etc., Python actually calls a method. Here is a list of operators and their corresponding methods: \n\nOperator	Method +	__add__ -	__neg__ -	__sub__ *	__mul__ /	__truediv__ <	__lt__ <=	__le__ ==	__eq__ !=	__ne__ >	__gt__ >=	__ge__ \nWhen you type an expression in the Python shell, the result can be an object of an arbitary type. In order to show the result, Python calls the method __repr__ from that object, which can be redefined to provide an user friendly representation. That is how Python knows that fractions should be printed as Fraction(5, 6). \n\nThis replacement of operators with method calls lets us to redefine what different operators mean for different types. The following tasks are an exercise in defining your own types. Implement the class Ratio with at least the following methods: \n\n- a constructor __init__ which should take as arguments the nominator and denominator of the fraction and save them in attributes. Note that for instance 6/10 is just another representation for 3/5. A correct implementation must first divide both the nominator and the denominator by their greatest common divisor. The math module provides the function gcd which computes the divisor. For example:\n >>> import math \n>>> math.gcd(6,10) 2 \n\nNow if we divide both the nominator and the denominator, we get (6/2)/(10/2) => 3/5. \n- a method __repr__ for conversion to a string. The method should return a string composed of the class name and the nominator and the denominator. \n- a method __add__ for adding two rationals. \n- a method __mul__ for multiplying two rationals. \n- a method __eq__ for checking whether two rationals are equal, i.e. whether they have the same nominators and denominators.",
        starterCode: "",
        testCases: { input: "1, 2, 3, 4", expected: "'5/4'" }
    },
    34: {
        description: "In this exercise we play with counter classes which model the physical devices that people use for counting things.:\n\n [insert image ]🠒 9999 Count	Reset \n\nThe skeleton of the classes is given bellow, you just need to fill in the methods. Note that the different classes inherit each other. When working on a subclass try not to repeat code. Instead use the keyword super to reuse the method in the superclass. \n\nYour tasks are: \n1.Complete the methods in class SimpleCounter as follows: \n- The __init__ method must set the initial count to 9999 just like the factory do for the physical counter. Method count increments the counter's value by one. \n- reset sets the counter back to zero \n- getValue returns the current count. \nOnce this is done the buttons ''Count'' and ''Reset'' above should work as expected. \n2.The physical counters have an upper limit to the number that they can show. For example the device above can count up to 9999 and after that it goes back to zero. Unlike it, our software model goes up to 10000. Finish the class BoundedCounter, which modifies SimpleCounter, in two ways: \n- The __init__ method takes two parameters: the initial value – init, and the upper limit – max. \n- The method count must be changed so that it counts up to max and then, on the next call the counter should be reset back to zero. Once this is done the button ''Count'' above will not let the number go over 9999. \n3.ChainedCounter is another kind of counter which extends BoundedCounter as follows: \n- The __init__ method takes a third parameter – next. which is a reference to another counter \n- The count function also works differently  –  when the counter turns from max back to zero, it must also call next.count(). The new ChainedCounter can be used to implement a digital clock. When the counter for seconds is 59, it is then reset back to zero, and at the same time the counter for minutes is increased with one. You have to check that next is not None before trying to call next.count(). The reason is that a chain of counters has to end. For instance, in a clock the counter for hours has no next counter, so it must be constructed with None as the third parameter. Once the class is finished the clock bellow will start working: \n00	01	02",
        starterCode: "",
        testCases: { input: "5", expected: "5" }
    },
    35: {
        description: "The number Cnk indicates the number of combinations that can be formed with k elements out of n in total. The combinations can be computed recursively by using the formula Cnk = Cn-1k-1 + Cn-1k. The basic cases are that for every n, Cn1 == n, and when n < k, Cnk == 0. \n\nWrite the function combinations(n,k) which implements the recursive formula.",
        starterCode: "",
        testCases: { input: "5, 2", expected: "10" }
    },
    36: {
        description: "The greatest common divisor of two natural numbers m and n is the largest natural number d such that both m and n are divisible by d. Such greatest common divisor exists if m and n are not both zero. \n\nExample: The greatest common divisor of 60 and 84 is 12, which the reader is invited to check himself/herself. \n\nYour task is to complete the function gcd which calculates and returns the greatest common divisor of arguments m and n by using Euclid's algorithm: \n\n- If n is 0, the result is m. \n- Otherwise, the greatest common divisor of m and n is equal to the greatest common divisor of n and m % n (where m % n is the remainder of dividing m by n). \n\nFor example we get that: \n\ngcd(84,60) == gcd(60,24) \ngcd(60,24) == gcd(24,12) \ngcd(24,12) == gcd(12,0) \ngcd(12,0)  == 12",
        starterCode: "",
        testCases: { input: "48, 18", expected: "6" }
    },
    37: {
        description: "In this task you should write a recursive version of the binary search algorithm. The function binarySearch bellow should use recursion to find the position of a key in a sorted list. The search should be limited to the range from element with index i to the element with index j. If the key is not in the range then the return value must be None. The basic steps in the implementation should be as follows: \n\n- If the given range is empty, i.e. i > j then just return None. \n- Compare the element at position k=(i+j)/2 with the key. \n- If the element is bigger than the key then recursively search in the range i to k-1. \n- If the element is smaller than the key, then recursively search in the range k+1 to j. \n- If the element is equal to the key then return k.",
        starterCode: "",
        testCases: { input: "[1, 2, 3, 4, 5], 3", expected: "2" }
    },
    38: {
        description: "One normal movie ticket costs 100 SEK, and for minors under 18 years, the price is 50 SEK. If the performance starts before 18:00, there is an additional 10% discount. \n\nImplement the function movieTickets(nrTickets,nrUnder18,time), which takes the number of tickets, the number of people under 18 and the starting and returns the total price for all tickets. For example movieTickets(5,3,17) should return 315.",
        starterCode: "",
        testCases: { input: "3, 1, '18:00'", expected: "240" }
    },
    39: {
        description: "The recommendation in PEP-8 say that a line in a Python file should be at most 79 characters long. Write a function pepLineLength(filename) which does the following: \n\n- for each line which is longer than 79 characters, print a warning which gives the line number and the total characters. In the warnings you should print line nummers which correspond to numbering starting from 1, and not 0. \n- finnish with a summary which gives the total number of long lines. \n\nThe following is an example for calling the function: \n\n>>> pepLineLength('divisibility.py') \nline 8 too long: 91 \nline 10 too long: 81 \n2 lines are too long \n\nRecall that when Python reads the lines from the file, each line ends with the symbol for new line, i.e. '\\ n'. This should be taken into account when computing the lengths.",
        starterCode: "",
        testCases: { input: "'a' * 80", expected: "True" }
    },
    40: {
        description: "Implement the class Card to represent a playing card. Your class should have the following methods: \n\n- __init__(self, rank, suit): here rank is an integer in the range 1-13 indicating the position of the card in the list: \n\n Ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King \n\nSuit is a single character: 'd', 'c', 'h', or 's', indicating one of the suits (diamonds, clubs, hearts or spades). \n- getRank(self): Returns the rank of the card. \n- getSuit(self): Returns the suit of the card. \n- value(self): Returns the Blackjack value of the card. Ace counts as 1, Jack, Queen and King count as 10. For all other cards the value is the same as the rank. \n- __str__(self): Returns a string that names the card. For example 'Ace of Spades'",
        starterCode: "",
        testCases: { input: "'Ace', 'Spades'", expected: "'Ace of Spades'" }
    },
    41: {
        description: "The country C have set rules for traveling to the country during an ongoing pandemic. The rules are the following: \n\n- the number of infections in a country are calculated as the number of cases for two weeks per 100 000 citizens \n- if the traveler's country has number of infections 50 or higher, the country is red and traveling from that country is forbidden \n- if the traveler's country has number of infections 25 or higher, but bellow 50, the country is yellow and traveling from it is allowed, with ten days quarantine \n- if the traveler's country has number of infections less than 25, the country is green and traveling from it is allowed \n- exception: if the traveler's country has number of infections lower than the number of infections in C, the country is green regardless of the number \n\n Write a function pandemic_rules(numC,totalNum,population), which takes as arguments the actual number of infections in C (numC), together with the total number of cases for two weeks (totalNum) and the population size in the traveler's country (population), and returns the color of the country.",
        starterCode: "",
        testCases: { input: "50, 100, 1000", expected: "'yellow'" }
    },
    42: {
        description: "A quick way to decide if a number is divisible by 9 is to compute the sum of its digits. If you do that repeatedly, at the end, you will get only a single digit. That last digit is always 9 for all numbers divisible by 9. The only exception is for the number 0 where the last digit is the zero itself. \n\nExample: 1998 → 1+9+9+8 → 27 → 2+7 → 9. \n\nWrite the function div9(num) which does the divisibility test and and prints out the intermediate sums after each step.",
        starterCode: "",
        testCases: { input: "18", expected: "True" }
    },
    43: {
        description: "Create a class called StatSet that can be used to do simple statistical calculations. The methods for the class are: \n\n- __init__(self): Initializes a StatSet with no data in it \n- addNumber(self, x): Adds the number x to the StatsSet \n- mean(self): Returns the mean (the average) of the numbers in the StatsSet med(self): Returns the average of the minimum and the maximum value in the set \n- stdDev2(self): Returns the squared standard deviation of the numbers in the StatsSet computed according to the formula:\n\n[insert image] \n\n- count(self): Returns the count of numbers in the set \n- min(self): Returns the smallest number in the set \n- max(self): Returns the biggest number in the set",
        starterCode: "",
        testCases: { input: "[1, 2, 3]", expected: "2.0" }
    },
    44: {
        description: "When taking a loan for buying an apartment or a house the following rules apply: \n\n- If the loan is 70% or more of the total property price, 2% of the loan must be paid back to the bank per year. \n- If the loan is 50% or more of the total property price, 1% of the loan must be paid back to the bank per year. \n- If the loan is less than 50% of the total property price, the buyer doesn’t pay back the loan, but he/she must still pay bank interest. \n\nEvery bank has a rate in percentages which states how much interest must be paid for the loan per year. Write a function calculate_loan(property_price,loan,interest_rate) which when executed calculates and prints the expenses for the loan. The arguments of the function are the property price, the loan and the interest rate in percentages, and it must prints back how much of the loan must be paid back (amortized) per month, the size of the monthly interest, and finally the total monthly expenses. \n\nNote:​ the rules in the first paragraph are all stated per year, while you must print the expenses per month, i.e. you need to divide by 12.",
        starterCode: "",
        testCases: { input: "100000, 80000, 0.05", expected: "4000" }
    },
    45: {
        description: "Implement the function code_words(text, dictionary), which takes as the first argument an arbitrary text as string, and returns a new version of the text where certain code words are replaced with other words. The second argument is the dictionary of code words. \n\nFor example: \n\n>>> d = {''happiness'': ''cake'', ''homework'': ''date''} \n>>> print(code_words(''you have your happiness'', d)) you have your cake \n>>> print(code_words(''I have a homework today'', d)) \nI have a date today \n\nAll words in the text are separated by spaces. Words that are not in the dictionary should be left unchanged.",
        starterCode: "",
        testCases: { input: "'hello world', {'hello': 'hi'}", expected: "hi world" }
    },
    46: {
        description: "Write the class Robot which models the state of a robot which moves over a surface. It follows three commands: turnLeft(), turnRight() and forward(n). The first two commands tell the robot to turn to the left/right while the last tells it to go forward with n number of steps. \n\nThe class must maintain the current coordinates of the robot and its direction. The direction is one of the strings: 'NORTH', 'SOUTH', 'EAST', 'WEST', and indicates which world direction the robot is currently facing. The class must have the methods turnLeft(),turnRight() and forward(n) as well as: \n\n- __init__(self): which sets the current coordinates to be x=0 and y=0 and the initial direction to be 'NORTH'. \n- getPosition(self): which returns the current position as the tuple (x,y). \n- getDirection(self): which returns the current direction as a string.",
        starterCode: "",
        testCases: { input: "(1, 0)", expected: "'(1, 0)'" }
    }
};

// Fetch user progress from API and set default exercise
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

// Run code with Pyodide and verify with API
async function runCode() {
    console.log('runCode triggered'); // Debug log
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
            // Load the next exercise
            let nextExerciseId;
            if (completedChallenges.size === totalChallenges) {
                nextExerciseId = "1"; // All completed, go back to first
            } else {
                const lastCompletedId = Math.max(...Array.from(completedChallenges).map(id => parseInt(id)));
                nextExerciseId = String(lastCompletedId + 1);
                if (!exercises[nextExerciseId]) {
                    nextExerciseId = "1";
                }
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
            // Ensure visibility persists
            document.querySelector('.landing-page').classList.add('hidden');
            document.querySelector('.app-container').classList.add('visible');
            console.log('Visibility after completion:', {
                landing: document.querySelector('.landing-page').classList.contains('hidden'),
                app: document.querySelector('.app-container').classList.contains('visible')
            });
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

// Handle landing page to app transition
document.getElementById('start-coding').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.landing-page').classList.add('hidden');
    document.querySelector('.app-container').classList.add('visible');
    fetchProgress(); // Load progress and set default exercise
});

// Initialize Pyodide on page load
initializePyodide();

// Ensure runCode is globally available
window.runCode = runCode;