Feature: Admin Login Functionality
  As an Admin user
  I want to login to the application
  So that I can access admin features

  Scenario: TC_UI_ADMIN_LOGIN_001 - Successful login with valid credentials
    Given I am on the login page
    When I enter username "admin"
    And I enter password "admin123"
    And I click login button
    Then I should see the dashboard page
    And I should see welcome message

  Scenario: TC_UI_ADMIN_LOGIN_002 - Login fails with invalid username
    Given I am on the login page
    When I enter username "wronguser"
    And I enter password "admin123"
    And I click login button
    Then I should see error message "Invalid username or password"
    And I should remain on login page

  Scenario: TC_UI_ADMIN_LOGIN_003 - Login fails with invalid password
    Given I am on the login page
    When I enter username "admin"
    And I enter password "wrongpass"
    And I click login button
    Then I should see error message "Invalid username or password"

  Scenario: TC_UI_ADMIN_LOGIN_004 - Login fails with empty username
    Given I am on the login page
    When I leave username field empty
    And I enter password "admin123"
    And I click login button
    Then I should see validation error "Username is required"

  Scenario: TC_UI_ADMIN_LOGIN_005 - Login fails with empty password
    Given I am on the login page
    When I enter username "admin"
    And I leave password field empty
    And I click login button
    Then I should see validation error "Password is required"
