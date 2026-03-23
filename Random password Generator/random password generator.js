const passwordField = document.getElementById("passwordField");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const lengthRange = document.getElementById("lengthRange");
const lengthValue = document.getElementById("lengthValue");
const strengthText = document.getElementById("strengthText");
const copyStatus = document.getElementById("copyStatus");
const presetButtons = document.querySelectorAll(".preset-btn");

const includeUppercase = document.getElementById("includeUppercase");
const includeLowercase = document.getElementById("includeLowercase");
const includeNumbers = document.getElementById("includeNumbers");
const includeSymbols = document.getElementById("includeSymbols");

const charSets = {
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_-+=[]{}|:;,.?/"
};

const presetConfig = {
	easy: { length: 10, uppercase: false, lowercase: true, numbers: true, symbols: false },
	strong: { length: 14, uppercase: true, lowercase: true, numbers: true, symbols: true },
	ultra: { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true }
};

function getSelectedSets() {
	const selected = [];
	if (includeUppercase.checked) selected.push(charSets.uppercase);
	if (includeLowercase.checked) selected.push(charSets.lowercase);
	if (includeNumbers.checked) selected.push(charSets.numbers);
	if (includeSymbols.checked) selected.push(charSets.symbols);
	return selected;
}

function randomCharFrom(set) {
	const index = Math.floor(Math.random() * set.length);
	return set[index];
}

function shuffleString(value) {
	const chars = value.split("");
	for (let i = chars.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join("");
}

function evaluateStrength(password, activeSetCount) {
	if (password.length < 10 || activeSetCount <= 1) return "Weak";
	if (password.length < 14 || activeSetCount === 2) return "Medium";
	return "Strong";
}

function renderStrengthLabel(level) {
	strengthText.className = "";
	if (level === "Weak") strengthText.classList.add("strength-weak");
	if (level === "Medium") strengthText.classList.add("strength-medium");
	if (level === "Strong") strengthText.classList.add("strength-strong");
	strengthText.textContent = `Strength: ${level}`;
}

function renderCopyStatus(message, statusClass = "") {
	copyStatus.className = "";
	if (statusClass) copyStatus.classList.add(statusClass);
	copyStatus.textContent = message;
}

function setActivePreset(name) {
	presetButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.preset === name);
	});
}

function applyPreset(name) {
	const preset = presetConfig[name];
	if (!preset) return;

	lengthRange.value = String(preset.length);
	lengthValue.textContent = String(preset.length);
	includeUppercase.checked = preset.uppercase;
	includeLowercase.checked = preset.lowercase;
	includeNumbers.checked = preset.numbers;
	includeSymbols.checked = preset.symbols;
	setActivePreset(name);
	generatePassword();
	renderCopyStatus(`${name[0].toUpperCase()}${name.slice(1)} preset applied`, "copy-info");
}

function generatePassword() {
	const selectedSets = getSelectedSets();

	if (selectedSets.length === 0) {
		passwordField.value = "Select at least one option";
		renderStrengthLabel("Weak");
		return;
	}

	const length = Number(lengthRange.value);
	let password = "";

	selectedSets.forEach((set) => {
		password += randomCharFrom(set);
	});

	const combined = selectedSets.join("");
	while (password.length < length) {
		password += randomCharFrom(combined);
	}

	password = shuffleString(password);
	passwordField.value = password;
	renderStrengthLabel(evaluateStrength(password, selectedSets.length));
	renderCopyStatus("");
}

async function copyPassword() {
	if (!passwordField.value || passwordField.value === "Select at least one option") {
		renderCopyStatus("Nothing to copy", "copy-info");
		return;
	}

	try {
		await navigator.clipboard.writeText(passwordField.value);
		renderCopyStatus("Copied to clipboard", "copy-success");
		copyButton.textContent = "Copied";
		setTimeout(() => {
			copyButton.textContent = "Copy";
		}, 1100);
	} catch (error) {
		renderCopyStatus("Copy failed, try again", "copy-error");
		copyButton.textContent = "Failed";
		setTimeout(() => {
			copyButton.textContent = "Copy";
		}, 1100);
	}
}

lengthRange.addEventListener("input", () => {
	lengthValue.textContent = lengthRange.value;
	presetButtons.forEach((button) => button.classList.remove("active"));
});

[includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach((checkbox) => {
	checkbox.addEventListener("change", () => {
		presetButtons.forEach((button) => button.classList.remove("active"));
	});
});

presetButtons.forEach((button) => {
	button.addEventListener("click", () => {
		applyPreset(button.dataset.preset);
	});
});

generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", copyPassword);

window.generatePassword = generatePassword;
applyPreset("strong");
