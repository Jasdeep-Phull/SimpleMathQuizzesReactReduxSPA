// these scripts are used in the Create and Edit routes, to help validate and submit data

// Minimum and maximum answer values
// These limits are not requirements from the API, they are arbitrary
export const minimumAnswerValue: number = -500;
export const maximumAnswerValue: number = 500;

/**
 * The regex that answers are checked against
 * This regex forces answers (as strings) to be integers (positive or negative)
 */
export const answerRegex: RegExp = new RegExp(/^(-)?(0|([1-9](\d)*))$/); // Using the regex constructor to ensure that this is a Regex


/**
 * Checks the answer (as a string) parameter against the pattern Regex parameter, and checks if the answer can be successfully parsed as an integer
 * @param answer The answer to check
 * @param pattern The regex to check the answer against
 * @returns True if the answer passes the regex check and can be parsed as an integer, and returns False otherwise
 */
export function checkAnswerPattern(answer: string | undefined, pattern: RegExp): boolean {
    console.log(`answer: ${answer}`);
    if (answer === undefined || answer === null || answer === "") return true;

    const regex: RegExp = new RegExp(pattern); // Using the regex constructor to ensure that this is a Regex
    if (!regex.test(answer)) return false;

    // return false if the answer cannot be parsed as an integer
    if (isNaN(parseInt(answer, 10))) {
        console.log(`answer: ${answer} passes the regex: ${pattern}, but is NaN after parseInt()`);
        return false;
    }

    return true;
}


/**
 * Checks if the answer can be successfully parsed as an integer, and then checks if the answer is less than the minimum value
 * @param answer The answer to check
 * @param minimum The minimum value to check the answer against. Default value is the value of minimumAnswerValue, which is currently -500
 * @returns True if the answer can be parsed as an integer and is greater than or equal to the minimum value, and returns False otherwise
 */
export function checkAnswerMin(answer: string | undefined, minimum: number = minimumAnswerValue): boolean {
    console.log(`answer: ${answer}`)
    if (answer === undefined || answer === null || answer === "") return true;

    const intAnswer: number = parseInt(answer, 10);
    if (isNaN(intAnswer)) {
        console.log(`answer: ${answer} is NaN after parseInt()`);
        return false;
    }

    if (intAnswer < minimum) return false;

    return true;
}


/**
 * Checks if the answer can be successfully parsed as an integer, and then checks if the answer is greater than the maximum value
 * @param answer The answer to check
 * @param maximum The maximum value to check the answer against. Default value is the value of maximumAnswerValue, which is currently 500
 * @returns True if the answer can be parsed as an integer and is less than or equal to the maximum value, and returns False otherwise
 */
export function checkAnswerMax(answer: string | undefined, maximum: number = maximumAnswerValue): boolean {
    console.log(`answer: ${answer}`)
    if (answer === undefined || answer === null || answer === "") return true;

    const intAnswer: number = parseInt(answer, 10);
    if (isNaN(intAnswer)) {
        console.log(`answer: ${answer} is NaN after parseInt()`);
        return false;
    }

    if (intAnswer > maximum) return false;

    return true;
}


/**
 * Parses the answer as an integer. This is used in the Create and Edit routes to convert the answers from string to integer before making an API request
 * @param answer
 * @returns The answer as an integer, and returns null if the answer cannot be parsed as an integer
 */
export function parseIntAndErrorHandle(answer: string): number | null {
    const intAnswer: number = parseInt(answer, 10);

    if (isNaN(intAnswer)) {
        console.log(`answer: ${answer} is NaN after parseInt()`);
        return null;
    }

    return intAnswer;
}