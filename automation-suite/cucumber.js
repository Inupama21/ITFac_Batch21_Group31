module.exports = {
  default: {
    require: ['src/test/step-definitions/**/*.js', 'src/test/support/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html', 'allure-cucumberjs/reporter'],
    paths: ['src/test/features/**/*.feature'],
    parallel: 2,
    publishQuiet: true,
    
  },
  formatOptions: {
      resultsDir: 'allure-results'
  }
};