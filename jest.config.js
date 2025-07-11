module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    testPathIgnorePatterns: ['/node_modules/'],
    setupFiles: ['./test/setup.js']
};
