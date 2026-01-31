module.exports = {
  default: {
    require: ['src/test/step-definitions/**/*.js', 'src/test/support/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    parallel: 2,
    publishQuiet: true
  }
};