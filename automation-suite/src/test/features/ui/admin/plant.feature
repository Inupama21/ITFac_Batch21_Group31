@plant @ui
Feature: Plant Management - UI Tests (QA3-Umesha)
  As a QA tester
  I want to test the Plant Management UI functionality
  So that I can ensure the plant list page works correctly for both User and Admin roles

  Background:
    Given the QA Training App is running
    And plants exist in the system

  @TC-M3-PLANT-UI-006 @smoke
  Scenario: TC-M3-PLANT-UI-006 - Verify plant list page loads for Admin
    Given I am logged in as "Admin"
    When I navigate to the plants page
    Then the plant list page should load successfully
    And all plants should be displayed in a table
    And the "Add Plant" button SHOULD be visible
    And Edit and Delete actions should be visible in the Actions column
    And all standard features should be accessible

  @TC-M3-PLANT-UI-007
  Scenario: TC-M3-PLANT-UI-007 - Verify Reset button clears search and filter for Admin
    Given I am logged in as "Admin"
    And I am on the plants page
    And I have entered "Rose" in the search field
    And I have selected a category "Flowers" from the filter dropdown
    And I have clicked the "Search" button
    When I click the "Reset" button
    Then the search field should be cleared
    And the category filter should reset to "All Categories"
    And all plants should be displayed with no filters applied
    And the page should return to default state

  @TC-M3-PLANT-UI-008
  Scenario: TC-M3-PLANT-UI-008 - Verify sorting on Name column for Admin
    Given I am logged in as "Admin"
    And I am on the plants page
    And multiple plants with different names exist
    When I click on the "Name" column header
    Then plants should be sorted by Name in ascending order
    When I click on the "Name" column header again
    Then plants should be sorted by Name in descending order
    And the sorting indicator should show the direction
    And plants should be alphabetically ordered correctly

  @TC-M3-PLANT-UI-009
  Scenario: TC-M3-PLANT-UI-009 - Verify sorting on Quantity column for Admin
    Given I am logged in as "Admin"
    And I am on the plants page
    And multiple plants with different quantities exist
    When I click on the "Stock" column header
    Then plants should be sorted by Quantity in ascending order
    When I click on the "Stock" column header again
    Then plants should be sorted by Quantity in descending order
    And low stock items should be easily identified when sorted ascending
    And plants should be correctly ordered by quantity value

  @TC-M3-PLANT-UI-010
  Scenario: TC-M3-PLANT-UI-010 - Verify empty state message for Admin
    Given I am logged in as "Admin"
    And no plants exist in the system
    When I navigate to the plants page
    Then the message "No plants found" should be displayed
    And the message should be clearly visible
    And table headers should remain visible
    And the "Add Plant" button should remain accessible
