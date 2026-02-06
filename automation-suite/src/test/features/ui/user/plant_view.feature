@plant @ui
Feature: Plant Management - UI Tests (QA3-Umesha)
  As a QA tester
  I want to test the Plant Management UI functionality
  So that I can ensure the plant list page works correctly for both User and Admin roles

  Background:
    Given the QA Training App is running
    And plants exist in the system

  @TC-M3-PLANT-UI-001 @smoke
  Scenario: TC-M3-PLANT-UI-001 - Verify plant list page loads for User
    Given I am logged in as "User"
    When I navigate to the plants page
    Then the plant list page should load successfully
    And all plants should be displayed in a table
    And the table should have columns "Name", "Category", "Price", "Stock", "Actions"
    And pagination controls should be visible if records exceed page size
    And the "Add Plant" button should NOT be visible

  @TC-M3-PLANT-UI-002
  Scenario: TC-M3-PLANT-UI-002 - Verify search functionality by plant name for User
    Given I am logged in as "User"
    And I am on the plants page
    And multiple plants exist in the system
    When I enter a valid plant name "Rose" in the search field
    And I click the "Search" button
    Then only plants matching "Rose" should be displayed
    And non-matching plants should be filtered out
    And the search should be case-insensitive

  @TC-M3-PLANT-UI-002 @negative
  Scenario: TC-M3-PLANT-UI-002 - Verify no plants found message when search returns no results
    Given I am logged in as "User"
    And I am on the plants page
    When I enter a non-existent plant name "XYZ123NonExistent" in the search field
    And I click the "Search" button
    Then the message "No plants found" should be displayed

  @TC-M3-PLANT-UI-003
  Scenario: TC-M3-PLANT-UI-003 - Verify filter by category functionality for User
    Given I am logged in as "User"
    And I am on the plants page
    And plants exist under multiple categories
    When I click on the "All Categories" dropdown
    And I select a specific category "Flowers"
    And I click the "Search" button
    Then the dropdown should show all available categories
    And only plants belonging to "Flowers" category should be displayed
    And plants from other categories should be filtered out
    And the plant count should update accordingly

  @TC-M3-PLANT-UI-004
  Scenario: TC-M3-PLANT-UI-004 - Verify Low stock badge display for User
    Given I am logged in as "User"
    And I am on the plants page
    And plants exist with quantity less than 5
    And plants exist with quantity greater than or equal to 5
    When I observe the Stock column for all plants
    Then plants with quantity less than 5 should display a "Low" badge
    And plants with quantity greater than or equal to 5 should NOT display a "Low" badge
    And the "Low" badge should be visually distinct

  @TC-M3-PLANT-UI-005
  Scenario: TC-M3-PLANT-UI-005 - Verify sorting functionality on Price column for User
    Given I am logged in as "User"
    And I am on the plants page
    And multiple plants with different prices exist
    When I click on the "Price" column header once
    Then plants should be sorted by Price in ascending order
    When I click on the "Price" column header again
    Then plants should be sorted by Price in descending order
    And the sorting indicator should show the current sort direction
    And plants should be correctly ordered by price value
