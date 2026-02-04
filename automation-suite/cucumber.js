module.exports = {
  default: {
    paths: ['src/test/features/**/*.feature'], 
    require: ['src/test/step-definitions/**/*.js', 'src/test/support/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    parallel: 1, 
    publishQuiet: true
  }
};

// module.exports = {
//   default: {
//     require: ['src/test/step-definitions/**/*.js', 'src/test/support/**/*.js'],
//     format: ['progress', 'html:reports/cucumber-report.html'],
//     parallel: 2,
//     publishQuiet: true
//   }
// };