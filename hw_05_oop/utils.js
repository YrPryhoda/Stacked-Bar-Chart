export const assert = (message, actual, expected) => {
    if (actual !== expected) {
        console.error(`\t${message}: expected ${expected} but got ${actual}`);
    } else {
        console.info(`\t${message} ✓`);
    }
}