Feature: Add Plant Form Validation

  Scenario: Verify price validation error message
    Given admin is logged in
    And admin is on the Plants page
    And admin clicks Add a Plant button
    Then admin should see the Add Plant page
    When admin enters plant name "Rose", chooses a category, enters price "0" and quantity "10"
    And admin presses save button
    Then error message "Price must be greater than 0" should be displayed
    And plant should not be added to the plants table
    And admin should stay on the add plant page
