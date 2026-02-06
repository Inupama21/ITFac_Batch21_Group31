@plant @ui
Feature: Plant Management - UI Tests
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
    And the sorting indicator should show the current sort direction
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

  Scenario: Verify price validation error message - TC-M4-PLANT-UI-001
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks Add a Plant button
    Then admin should see the Add Plant page
    When admin enters plant name "Rose", chooses a category, enters price "0" and quantity "10"
    And admin presses save button
    Then error message "Price must be greater than 0" should be displayed
    And plant should not be added to the plants table
    And admin should stay on the add plant page

  Scenario: Verify category dropdown shows only sub-categories - TC-M4-PLANT-UI-002
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks Add a Plant button
    Then admin should see the Add Plant page
    When admin click the sub category dropdown it should show only the sub categories not the main categories

  Scenario: Verify plant edit functionality with data pre-population - TC-M4-PLANT-UI-003
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks edit button of any plant
    Then admin should see the edit plant page with pre-populated data

  Scenario: Verify plant deletion from UI - TC-M4-PLANT-UI-004
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks delete button of any plant
    And admin click ok to the popup from the brower
    Then the plant should remove from the table
    And the successful message "Plant deleted successfully" should be displayed

  Scenario: Verify required field validation in Add Plant form - TC-M4-PLANT-UI-005
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks Add a Plant button
    Then admin should see the Add Plant page
    And admin clicks save button
    Then the error message "Plant name is required" should be displayed
    And the error message "Plant name must be between 3 and 25 characters" should be displayed
    And the error message "Category is required" should be displayed
    And the error message "Price is required" should be displayed
    And the error message "Quantity is required" should be displayed
