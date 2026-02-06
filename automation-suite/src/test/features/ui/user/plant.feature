Feature: User Plant Management

  Scenario: Verify user can view all plants in table - TC-M4-PLANT-UI-006
    Given User is logged in
    And User is on the Plants page
    Then the user can view all the plants data in the table

  Scenario: Verify Plants edit button is hidden for regular users - TC-M4-PLANT-UI-007
    Given User is logged in
    And User is on the Plants page
    Then the edit button should not visible in the plants table actions column

  Scenario: Verify Plants delete button is hidden for regular users - TC-M4-PLANT-UI-008
    Given User is logged in
    And User is on the Plants page
    Then the delete button should not visible in the plants table actions column

  Scenario: Verify "Add a Plant" button is hidden for regular users - TC-M4-PLANT-UI-009
    Given User is logged in
    And User is on the Plants page
    Then the "Add a Plant" button should not visible in the plants page

  Scenario: Verify read-only view of plant data for regular users
    Given User is logged in
    And User is on the Plants page
    When User attempts to click on plant name in table
    Then no edit modal or form should open
    When User attempts to click on price field
    Then the price field should not be editable
    When User right-clicks on plant row
    Then no context menu with edit or delete options should appear
