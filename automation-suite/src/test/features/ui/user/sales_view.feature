Feature: Sales Management - User Role (Read-Only)
  Background:
    Given I am logged in as User

  @smoke @TC-M5-SALE-UI-003
  Scenario: Verify Sell Plant button is hidden for regular User
    When I navigate to Sales page
    Then I should not see "Sell Plant" button

  @access-control @TC-M5-SALE-UI-019
  Scenario: Verify delete action is hidden for regular User
    Given sales records exist in system
    When I navigate to Sales page
    Then I should not see delete buttons

  @smoke @TC-M5-SALE-UI-020
  Scenario: Verify User can view sales list
    Given sales records exist in system
    When I navigate to Sales page
    Then I should see sales table
    And I should see sales records

  @access-control @TC-M5-SALE-UI-021
  Scenario: Verify User cannot access Sell Plant page directly
    When I try to navigate to "/ui/sales/new"
    Then I should be redirected to access denied page

  @smoke @TC-M5-SALE-UI-022
  Scenario: Verify User can view pagination controls
    Given multiple sales records exist
    When I navigate to Sales page
    Then I should see pagination controls

  @sorting @TC-M5-SALE-UI-023
  Scenario: Verify User can sort sales by columns
    Given multiple sales records exist
    When I navigate to Sales page
    And I click on "Plant Name" column header
    Then sales should be sorted by plant name alphabetically

  @smoke @TC-M5-SALE-UI-024
  Scenario: Verify User sees all sales columns
    When I navigate to Sales page
    Then I should see column "Plant Name"
    And I should see column "Quantity"
    And I should see column "Total Price"
    And I should see column "Sold Date"
