const path = require('path');

module.exports = {
  default: {
    require: [
      path.join(__dirname, 'src/test/step-definitions/**/*.js'),
      path.join(__dirname, 'src/test/support/**/*.js')
    ],
    paths: [
      path.join(__dirname, 'src/test/features/ui/**/*.feature'),
      path.join(__dirname, 'src/test/features/api/**/*.feature')
    ],
    format: ['progress', 'html:reports/cucumber-report.html', 'allure-cucumberjs/reporter'],
    formatOptions: {
      resultsDir: 'allure-results'
    },
    parallel: 2,
    publishQuiet: true,
    retry: 0,
    strict: true
  }
};
