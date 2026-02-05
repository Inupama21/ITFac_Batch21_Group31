@ui @user_view
Feature: Category View Functionality
  As a Regular User
  I want to view and search categories
  So that I can find information without administrative access

  Scenario: TC-M1-CAT-UI-006 - Verify User can use search by category name
    Given I am logged in as an "User"
    When I navigate to the Categories page
    And I search for "cat1"
    Then the search results should only display that category

    Scenario: TC_UI_ADMIN_CATEGORY_009 - Regular User should NOT see the Add Category button
    Given I am logged in as an "User"
    When I navigate to the Categories page
    Then I should NOT see the "Add A Category" button