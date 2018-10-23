const RADIX = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE_TIME = Date.now();
let LOCAL_ID_INC = 1;

// Introduce enough entropy to make it extremely difficult
//   for this to not be a guid.
// For a collision, you would need two users to load this module
//   at the same millisecond, and then create the same
//   `type` of record in the same order (LOCAL_ID_INC).
// For perf reasons this is not being hashed, but users
//   for whom "create time" is considered sensitive information
//   may wish to do so.
function getNumbersForId(type) {
  return {
    type: strToNum(type),
    seed: BASE_TIME,
    entropy: Date.now(),
    count: LOCAL_ID_INC++
  };
}

function strToNum(str) {
  str = str.replace(/[-_]/g, '').toLowerCase();
  return parseInt(str, 36);
}

/**
 * @param {string} strDividend
 * @param {number} divisor
 */
function divide(strDividend, divisor) {
  let remainder = 0;
  let value = '';

  for (let i = 0; i < strDividend.length; i++) {
    let n = parseInt(remainder ? `${remainder}${strDividend[i]}` : strDividend[i], 10);
    let x = 0;

    while (n >= divisor) {
      x++;
      n = n - divisor;
    }

    if (value !== '' || x > 0) {
      value += x;
    }
    remainder = n;
  }

  return { remainder, value };
}

/**
 * @param {string} number
 */
function convertNumberToRadix(number) {
  let result = '';

  while (true) {
    let div = divide(number, 64);
    result = RADIX.charAt(div.remainder) + result;

    if (div.value === '') {
      break;
    }

    number = div.value;
  }

  // drop excess `0`s from IDs
  while (result.charAt(result.length -1) === '0') {
    result = result.substr(0, result.length - 2);
  }

  return result;
}

export default function generateIdForType(type) {
  let parts = getNumbersForId(type);
  let num = `${parts.type}${parts.seed}${parts.entropy}${parts.count}`;

  return convertNumberToRadix(num);
}
