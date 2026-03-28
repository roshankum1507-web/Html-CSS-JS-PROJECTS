let currentOperation = 'add';
let calculationHistory = [];

function selectOperation(op, element) {
    currentOperation = op;
    document.querySelectorAll('.operation-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        calculate();
    }
}

function calculate() {
    const n1Input = document.getElementById("num1").value;
    const n2Input = document.getElementById("num2").value;

    if (!n1Input) {
        document.getElementById("result").textContent = "Enter first number";
        return;
    }

    const num1 = parseFloat(n1Input);
    const num2 = parseFloat(n2Input) || 0;
    let result = 0;
    let operation = currentOperation;

    switch (operation) {
        case "add":
            result = num1 + num2;
            operation = "+";
            break;
        case "sub":
            result = num1 - num2;
            operation = "−";
            break;
        case "mul":
            result = num1 * num2;
            operation = "×";
            break;
        case "div":
            if (num2 === 0) {
                document.getElementById("result").textContent = "Cannot divide by zero";
                return;
            }
            result = num1 / num2;
            operation = "÷";
            break;
        case "pow":
            result = Math.pow(num1, num2);
            operation = "^";
            break;
        case "mod":
            if (num2 === 0) {
                document.getElementById("result").textContent = "Modulo by zero error";
                return;
            }
            result = num1 % num2;
            operation = "%";
            break;
        case "sqrt":
            if (num1 < 0) {
                document.getElementById("result").textContent = "Cannot sqrt negative";
                return;
            }
            result = Math.sqrt(num1);
            operation = "√";
            break;
        case "percent":
            result = (num1 / 100) * num2;
            operation = "% of";
            break;
    }

    result = Math.round(result * 10000) / 10000;
    document.getElementById("result").textContent = result;

    const historyEntry = `${num1} ${operation} ${num2 !== 0 || operation === "√" ? num2 : ''} = ${result}`;
    addToHistory(historyEntry);
}

function reset() {
    document.getElementById("num1").value = '';
    document.getElementById("num2").value = '';
    document.getElementById("result").textContent = '0';
    currentOperation = 'add';
    document.querySelectorAll('.operation-btn').forEach((btn, i) => {
        btn.classList.remove('active');
        if (i === 0) btn.classList.add('active');
    });
}

function deleteLastEntry() {
    document.getElementById("num1").value = document.getElementById("num1").value.slice(0, -1);
}

function addToHistory(entry) {
    calculationHistory.unshift(entry);
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = '';
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item;
        historyItem.onclick = () => useHistoryItem(item);
        historyList.appendChild(historyItem);
    });
}

function useHistoryItem(item) {
    const parts = item.split(' = ');
    const calculation = parts[0];
    const result = parts[1];
    document.getElementById("result").textContent = result;
}

function clearHistory() {
    calculationHistory = [];
    updateHistoryDisplay();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeBtn = document.querySelector('.theme-toggle');
    if (document.body.classList.contains('dark-mode')) {
        themeBtn.textContent = '☀️ Light';
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.textContent = '🌙 Dark';
        localStorage.setItem('theme', 'light');
    }
}

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').textContent = '☀️ Light';
    }
});