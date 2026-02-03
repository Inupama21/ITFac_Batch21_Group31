const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('chai');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');

setDefaultTimeout(10000);

Given('I am on the login page', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.navigate();
});

When('I enter username {string}', async function (username) {
  await this.loginPage.enterUsername(username);
});

When('I enter password {string}', async function (password) {
  await this.loginPage.enterPassword(password);
});

When('I click login button', async function () {
  await this.loginPage.clickLogin();
});

When('I leave username field empty', async function () {
  // Do nothing - field remains empty
});

When('I leave password field empty', async function () {
  // Do nothing - field remains empty
});

Then('I should see the dashboard page', async function () {
  this.dashboardPage = new DashboardPage(this.page);
  const isOnDashboard = await this.dashboardPage.isOnDashboard();
  expect(isOnDashboard).to.be.true;
});

Then('I should see welcome message', async function () {
  const message = await this.dashboardPage.getWelcomeMessage();
  expect(message).to.include('QA Training Application');
});

Then('I should see error message {string}', async function (expectedError) {
  const actualError = await this.loginPage.getErrorMessage();
  expect(actualError).to.include(expectedError);
});

Then('I should remain on login page', async function () {
  const isOnLogin = await this.loginPage.isOnLoginPage();
  expect(isOnLogin).to.be.true;
});