// App compatible with IE10+



function blue() {
    document.body.style.backgroundColor = "blue";
}

var map;
var t = 0;
var colour = 0;
var checkStop = 0;
var light = new Array();
light[0] = 'black';
light[1] = 'white';
light[2] = 'red';
light[3] = 'blue';
light[4] = 'purple';
light[5] = 'grey';
light[6] = 'orange'
light[7] = 'pink'

function flip(whichway) {
    document.body.style.backgroundColor = light[whichway];
    $('.auto').css('color', 'red');
    $('.auto').css('backgroundColor', 'black');
}

function doAutoFlip() {
    flip(colour);
    if (colour < light.length) {
        colour++;
    } else {
        colour = 0;
    }

    t = setTimeout("doAutoFlip()", 100);
}

function stopFlip() {
    clearTimeout(t);
    document.body.style.backgroundColor = 'gainsboro';
    $('.auto').css('color', 'black');
    $('.auto').css('backgroundColor', 'white');
}



const $buttons = document.querySelectorAll('button');
// keyword 'history' is reserved for global window object
// https://developer.mozilla.org/en-US/docs/Web/API/Window/history
// use another variable name instead: $hist
const $hist = document.querySelector('.history');
const $calculation = document.querySelector('.calculation');
const $ac = document.querySelector('button[value="AC"]');
const opers = [' + ', ' - ', ' * ', ' / '];
let calc = ['0'];
let calcResult = 0;
let result = false;

$calculation.value = '0';

// use Array.from to convert nodeList to array
// for backwards compatibility
// used in conjunction with polyfill.io cdn
Array.from($buttons).forEach((button) => {
    button.addEventListener('click', addInput);
});

$hist.addEventListener('animationend', () => {
    $hist.classList.remove('Move');
});
$calculation.addEventListener('animationend', () => {
    $calculation.classList.remove('Move');
});

function addInput(e) {
    let num = e.target.classList.contains('num');
    let oper = e.target.classList.contains('oper');
    let parenthesis = e.target.classList.contains('parenthesis');
    let input = e.target.value;
    let lastDigit = calc.slice(-1)[0];

    // if expression was evaluated
    if (result) {
        calcResult = calc.join('');
        $calculation.value = calcResult;
        $hist.textContent = 'Ans = ' + calcResult;
    }

    // if expression was evaluated
    // and input is not an operation
    // then reset calc
    if (result && !oper && input !== '%') {
        calc = ['0'];
    }

    if (input === '0') {
        // if there is only one digit
        // and that digit is not '0'
        // then push the new '0'
        if (calc.length === 1 && calc[0] !== '0') {
            calc.push(input);
            displayDigits(input);
        }
        // if there are more then one digits
        // then push the '0'
        else if (calc.length > 1) {
            calc.push(input);
            displayDigits(input);
        }
    }

    // if a number (except 0) or a parenthesis are clicked
    if ((num && input !== '0') || parenthesis) {
        if (calc.length === 1 && calc[0] === '0') {
            calc.pop();
            $calculation.value = '';
        }
        calc.push(input);
        displayDigits(input);
    }

    if (input === '.') {
        let regex = /(\d+\.\d+$)|\d+\.$/;
        let hasPoint = regex.test($calculation.value);
        // if last operand doesn't have a point
        // then add input
        if (!hasPoint) {
            calc.push(input);
            displayDigits(input);
        }
    }

    // if an operation is clicked
    if (oper) {
        let lastDigitIsOper = opers.indexOf(lastDigit) > -1;
        // if last digit is operation
        // then remove that operation and add new operation
        if (lastDigitIsOper) {
            calc.pop();
        }
        calc.push(input);
        displayDigits(input);
    }

    // if % is clicked
    // and last digit is not % (to prevent % duplicates)
    if (input === '%' && lastDigit !== '%') {
        calc.push(input);
        displayDigits(input);
    }

    if (input === 'CE') {
        calc.pop();
        $calculation.value = calc.join('');
        if (calc.length === 0) {
            calc = ['0'];
            $calculation.value = '0';
        }
        if (calc.length === 1 && calc[0] === '0') {
            $hist.textContent = '';
        }
    }

    if (input === '=') {
        console.log('[calc] before calculation:', calc);
        $hist.textContent = $calculation.value + ' =';
        $ac.textContent = 'AC';
        $ac.value = 'AC';
        percentage();
        evaluate();
        // apply moving effect
        $calculation.classList.add('Move');
        $hist.classList.add('Move');
        console.log('[calc] after calculation:', calc);
    }

    if (input === 'AC') {
        calc = ['0'];
        $hist.textContent = 'Ans = ' + $calculation.value;
        $calculation.value = '0';
        if (lastDigit === '0') {
            $hist.textContent = '';
        }
    }
}

function displayDigits(input) {
    if ($ac.value === 'AC') {
        $ac.textContent = 'CE';
        $ac.value = 'CE';
    }
    $calculation.value += input;
    result = false;
}

// calculate percentage
function percentage() {
    console.log('>>> PERCENTAGE <<<');
    let hasPercent = /%/.test(calc.join(''));
    console.log('hasPercent:', hasPercent);

    // if calc has a percentage
    if (hasPercent) {
        // with new RegExp you have to "escape the escape"
        // https://stackoverflow.com/a/16732051/7448956
        let m1 = '(?:\\d+%)|';
        let m2 = '(?:\\d+\\.\\d+%)|';
        let m3 = '(?:\\d+\\s[\\-\\+\\/\\*]\\s\\d+%)|';
        let m4 = '(?:\\d+\\s[\\-\\+\\/\\*]\\s\\d+\\.\\d+%)|';
        let m5 = '(?:\\d+\\.\\d+\\s[\\-\\+\\/\\*]\\s\\d+%)|';
        let m6 = '(?:\\d+\\.\\d+\\s[\\-\\+\\/\\*]\\s\\d+\\.\\d+%)';
        // match first expression that has a percent
        let regex = new RegExp(m1 + m2 + m3 + m4 + m5 + m6);
        let calcPercent;

        calcPercent = calc.join('');

        // add parenthesis around percent expression
        let expression = '(' + calcPercent.match(regex)[0] + ')';
        console.log('expression:', expression);

        calcPercent = calcPercent.replace(regex, expression);

        let hasDivide = /\//.test(expression);
        let hasMultiply = /\*/.test(expression);
        let hasSpace = /\s/.test(expression);

        let number;

        if (hasDivide || hasMultiply || !hasSpace) {
            // if expression has divide or multiply
            // or does not have space
            // percentage calculation has number = 1
            number = 1;
        } else {
            // extract number value to be
            // used for percentage calculation
            regex = /(\d+\.\d+)|\d+/;
            number = expression.match(regex)[0];
        }

        // extract the percentage amount for the number
        regex = /(\d+(?=%))|(\d+\.\d+(?=%))/;
        let amount = expression.match(regex)[0];

        // percentage calculation
        let percentResult = number * amount / 100;
        console.log('percentResult:', percentResult);

        // replace percent with calculation result
        regex = /(\d+%)|(\d+\.\d+%)/;
        calcPercent = calcPercent.replace(regex, percentResult);
        console.log('calcPercent:', calcPercent);
        calc = calcPercent.split('');

        // run percentage() again
        // until all percentage calculations are done
        percentage();
    }
    console.log('>>> PERCENTAGE END <<<');
}

// evaluate expression
function evaluate() {
    let error = catchErrors();
    if (error) {
        calc = ['0'];
        $calculation.value = 'Syntax Error!';
    } else {
        calcResult = eval(calc.join(''));
        calc = [calcResult];
        $calculation.value = calcResult;
    }
    result = true;
}

function catchErrors() {
    try {
        eval(calc.join(''));
    } catch (err) {
        console.log(err);
        return err instanceof SyntaxError || TypeError;
    }
}
