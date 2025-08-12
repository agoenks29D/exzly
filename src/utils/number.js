/**
 * Byte format
 *
 * @param {number} number
 * @returns {string}
 */
const byteFormat = (number) => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(`${number}`.length / 3);

  let shortNum = parseFloat((suffixNum !== 0 ? number / 1000 ** suffixNum : number).toPrecision(2));

  if (shortNum % 1 !== 0) {
    shortNum = shortNum.toFixed(1);
  }

  return shortNum + suffixes[suffixNum];
};

/**
 * Random number
 *
 * @param {number} min
 * @param {number} max
 * @param {number} length
 * @returns {number|string}
 */
const randomInt = (min = 1, max = 10, length = false) => {
  let i = 0;
  let code = '';
  const characters = '0123456789';
  const random = Math.floor(Math.random() * (max - min + 1)) + min;

  if (!length) {
    return random;
  }

  while (i < length) {
    const randomIndex = Math.floor(Math.random() * random);
    code += characters.charAt(randomIndex);
    i += 1;
  }

  return code;
};

module.exports = { byteFormat, randomInt };
