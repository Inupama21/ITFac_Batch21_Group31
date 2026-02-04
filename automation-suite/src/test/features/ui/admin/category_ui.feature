@ui
Feature: Category UI Management

  Scenario: Admin should see the Add Category button
    Given I am logged in as an "Admin"
    When I navigate to the Categories page
    Then I should see the "Add A Category" button

  Scenario: Regular User should NOT see the Add Category button
    Given I am logged in as an "User"
    When I navigate to the Categories page
    Then I should NOT see the "Add A Category" button

  Scenario: Admin should be able to add a new category
    Given I am logged in as an "Admin"
    When I navigate to the Categories page
    And I add a new category named "TestCat1"
    Then I should see a success message

  Scenario: Admin cannot add a category with empty name
    Given I am logged in as an "Admin"
    When I navigate to the Categories page
    And I click "Add A Category" but save without typing a name
    Then I should see a validation error