@ui
Feature: Category UI Management
  As an Admin user
  I want to manage categories
  So that I can organize the plant structure

  Scenario: TC_UI_ADMIN_CATEGORY_001 - Admin should see the Add Category button
    Given I am logged in as an "Admin" 
    When I navigate to the Categories page
    Then I should see the "Add A Category" button

  Scenario:TC_UI_ADMIN_CATEGORY_002 - Verify search returns "No category found" for invalid data
    Given I am logged in as an "Admin"
    When I navigate to the Categories page
    And I search for "NonExistentCat123"
    Then I should see the message "No category found"

  Scenario: TC_UI_ADMIN_CATEGORY_003 - Verify Admin can search categories by name
    Given I am logged in as an "Admin"
    And I navigate to the Categories page
    When I search for a valid category name
    Then the search results should only display that category

  Scenario: TC_UI_ADMIN_CATEGORY_004 - Verify Reset button clears search and filter
    Given I am logged in as an "Admin"
    And I navigate to the Categories page
    When I search for "NonExistentCat123"
    And I click on the "Reset" button
    Then the search bar should be empty
    And the category list should be restored to the full view


  Scenario: TC_UI_ADMIN_CATEGORY_005 Verify Admin can filter categories by parent
    Given I am logged in as an "Admin"
    And I navigate to the Categories page
    When I select the parent category "cat1" from the filter
    And I click on the "Search" button
    Then the category list should only show categories with parent "cat1"


  Scenario: TC_UI_ADMIN_CATEGORY_008 - Admin cannot add a category with empty name
    Given I am logged in as an "Admin"
    When I navigate to the Categories page
    And I click "Add A Category" but save without typing a name
    Then I should see a validation error