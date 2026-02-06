@ui
Feature: Add Plant Form Validation

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
