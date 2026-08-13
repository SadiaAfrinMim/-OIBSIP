const display = document.getElementById('display');

let currentInput = '';
let previousValue = null;
let operator = null;
let overwrite = false;

function updateDisplay() {
  display.textContent = currentInput || '0';
}

function clearDisplay() {
  currentInput = '';
  previousValue = null;
  operator = null;
  overwrite = false;
  updateDisplay();
}

function appendNumber(number) {
  if (overwrite) {
    currentInput = number;
    overwrite = false;
  } else {
    currentInput = currentInput === '0' ? number : currentInput + number;
  }
  updateDisplay();
}

function appendDecimal() {
  if (overwrite) {
    currentInput = '0.';
    overwrite = false;
  } else if (!currentInput.includes('.')) {
    currentInput = currentInput ? currentInput + '.' : '0.';
  }
  updateDisplay();
}

function deleteLastCharacter() {
  if (overwrite) {
    return;
  }

  currentInput = currentInput.slice(0, -1);
  if (!currentInput) {
    currentInput = '';
  }
  updateDisplay();
}

function calculate(firstValue, secondValue, selectedOperator) {
  switch (selectedOperator) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '×':
      return firstValue * secondValue;
    case '÷':
      return firstValue / secondValue;
    default:
      return secondValue;
  }
}

function handleOperator(nextOperator) {
  if (!currentInput && previousValue === null) {
    return;
  }

  if (previousValue !== null && !currentInput) {
    return;
  }

  const inputValue = parseFloat(currentInput || previousValue);

  if (previousValue !== null && operator) {
    const result = calculate(previousValue, inputValue, operator);
    currentInput = String(result);
    previousValue = result;
    updateDisplay();
  } else {
    previousValue = inputValue;
  }

  operator = nextOperator;
  overwrite = true;
  currentInput = '';
}

function handleEquals() {
  if (!operator || overwrite) {
    return;
  }

  const inputValue = parseFloat(currentInput);

  if (operator === '÷' && inputValue === 0) {
    currentInput = 'Error';
    updateDisplay();
    setTimeout(clearDisplay, 1000);
    return;
  }

  const result = calculate(previousValue, inputValue, operator);
  currentInput = String(result);
  previousValue = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case 'number':
        appendNumber(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        handleOperator(value);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'delete':
        deleteLastCharacter();
        break;
      case 'clear':
        clearDisplay();
        break;
      default:
        break;
    }
  });
});

updateDisplay();
