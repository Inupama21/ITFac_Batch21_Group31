@ui @user_view
Feature: Category View Functionality
  As a Regular User
  I want to view and search categories
  So that I can find information without administrative access

  Scenario: TC_UI_USER_CATEGORY_006 - Verify User can use search by category name
    Given I am logged in as an "User"
    When I navigate to the Categories page
    And I search for "cat1"
    Then the search results should only display that category
  
  
    Scenario: TC_UI_USER_CATEGORY_007 - Verify sorting by Name ascending for User
    Given I am logged in as an "User"
    And I navigate to the Categories page
    When I click on the "Name" column header
    Then the categories should be sorted by name in ascending order

    Scenario: TC_UI_USER_CATEGORY_008 - Verify User can use parent filter
    Given I am logged in as an "User"
    And I navigate to the Categories page
    When I select the parent category "cat1" from the filter
    And I click on the "Search" button
    Then the category list should only show categories with parent "cat1"

  Scenario: TC_UI_USER_CATEGORY_009 - Regular User should NOT see the Add Category button
    Given I am logged in as an "User"
    When I navigate to the Categories page
    Then I should NOT see the "Add A Category" button

  Scenario: TC_UI_USER_CATEGORY_010 - Verify pagination is visible for Regular User
    Given I am logged in as an "User"
    And I navigate to the Categories page
    Then the pagination controls should be visible
