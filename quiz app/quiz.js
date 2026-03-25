const questions = [
    {
        question: "Which language is primarily used to style web pages?",
        answers: [
            { text: "HTML", correct: false },
            { text: "Python", correct: false },
            { text: "CSS", correct: true },
            { text: "SQL", correct: false },
        ]
    },

    {
        question: "Which symbol is used for single-line comments in JavaScript?",
        answers: [

            { text: "//", correct: true },
            { text: "<!-- -->", correct: false },
            { text: "/* */", correct: false },
            { text: "#", correct: false },
        ]
    },

    {
        question: "What does HTML stand for?",
        answers: [
            { text: "HyperText Markup Language", correct: true },
            { text: "HighText Machine Language", correct: false },
            { text: "Hyper Transfer Markup Language", correct: false },
            { text: "HyperTool Multi Language", correct: false },
        ]
    },

    {
        question: "Which JavaScript method converts JSON text into an object?",
        answers: [
            { text: "JSON.stringify()", correct: false },
            { text: "JSON.parse()", correct: true },
            { text: "JSON.convert()", correct: false },
            { text: "JSON.object()", correct: false },
        ]
    },

    {
        question: "Which keyword declares a block-scoped variable in JavaScript?",
        answers: [
            { text: "var", correct: false },
            { text: "const", correct: false },
            { text: "let", correct: true },
            { text: "dim", correct: false },
        ]
    },

    {
        question: "What is the correct file extension for JavaScript files?",
        answers: [
            { text: ".java", correct: false },
            { text: ".script", correct: false },
            { text: ".js", correct: true },
            { text: ".jsxm", correct: false },
        ]
    },

    {
        question: "Which of these is a JavaScript framework/library?",
        answers: [
            { text: "Django", correct: false },
            { text: "React", correct: true },
            { text: "Laravel", correct: false },
            { text: "Flask", correct: false },
        ]
    },

    {
        question: "In CSS, which property changes text color?",
        answers: [
            { text: "font-color", correct: false },
            { text: "text-style", correct: false },
            { text: "color", correct: true },
            { text: "text-color", correct: false },
        ]
    },

    {
        question: "Which data structure follows the Last In, First Out rule?",
        answers: [
            { text: "Queue", correct: false },
            { text: "Stack", correct: true },
            { text: "Array", correct: false },
            { text: "Tree", correct: false },
        ]
    },

    {
        question: "Which SQL command is used to retrieve data from a table?",
        answers: [
            { text: "GET", correct: false },
            { text: "SELECT", correct: true },
            { text: "FIND", correct: false },
            { text: "FETCHROW", correct: false },
        ]
    }
];

const questionElement = document.getElementById("question");
const optionsElement = document.querySelector(".options");
const nextbutton = document.getElementById("next-btn");

let currentquestionindex = 0;
let score = 0;

function startquiz() {
    currentquestionindex = 0;
    score = 0;
    nextbutton.innerHTML = "Next";
    showquestion();
}

function resetstate() {
    nextbutton.style.display = "none";
    while (optionsElement.firstChild) {
        optionsElement.removeChild(optionsElement.firstChild);
    }
}

function showquestion() {
    resetstate();

    const currentquestion = questions[currentquestionindex];
    const questionnumber = currentquestionindex + 1;
    questionElement.innerHTML = questionnumber + ". " + currentquestion.question;

    currentquestion.answers.forEach((answer) => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("option");
        if (answer.correct) {
            button.dataset.correct = "true";
        }
        button.addEventListener("click", selectanswer);
        optionsElement.appendChild(button);
    });
}

function selectanswer(e) {
    const selectedbtn = e.target;
    const iscorrect = selectedbtn.dataset.correct === "true";

    if (iscorrect) {
        score++;
        selectedbtn.style.background = "#d7ffe5";
        selectedbtn.style.borderColor = "#1ea55f";
    } else {
        selectedbtn.style.background = "#ffe0e0";
        selectedbtn.style.borderColor = "#cf3d3d";
    }

    Array.from(optionsElement.children).forEach((button) => {
        if (button.dataset.correct === "true") {
            button.style.background = "#d7ffe5";
            button.style.borderColor = "#1ea55f";
        }
        button.disabled = true;
    });

    nextbutton.style.display = "block";
}

function showscore() {
    resetstate();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextbutton.innerHTML = "Play Again";
    nextbutton.style.display = "block";
}

function handlenextbutton() {
    currentquestionindex++;
    if (currentquestionindex < questions.length) {
        showquestion();
    } else {
        showscore();
    }
}

nextbutton.addEventListener("click", () => {
    if (currentquestionindex < questions.length) {
        handlenextbutton();
    } else {
        startquiz();
    }
});

startquiz();