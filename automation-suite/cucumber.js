module.exports = {
  default: {
    require: ['src/test/step-definitions/**/*.js', 'src/test/support/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    paths: ['src/test/features/**/*.feature'],
    parallel: 2,
    publishQuiet: true
  }
};