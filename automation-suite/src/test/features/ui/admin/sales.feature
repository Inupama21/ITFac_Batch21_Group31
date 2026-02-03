Feature: Sales Management - Admin Role

  Background:
    Given I am logged in as Admin

  @smoke @TC-M5-SALE-UI-001
  Scenario: Verify sales list page loads with pagination
    When I navigate to Sales page
    Then I should see sales table
    And I should see pagination controls

  @smoke @TC-M5-SALE-UI-002
  Scenario: Verify Sell Plant button is visible only for Admin
    When I navigate to Sales page
    Then I should see "Sell Plant" button

  @validation @TC-M5-SALE-UI-004
  Scenario: Verify No sales found message when no records exist
    Given no sales records exist in system
    When I navigate to Sales page
    Then I should see message "No sales found"

  @smoke @TC-M5-SALE-UI-005
  Scenario: Verify delete action is visible only for Admin
    Given sales records exist in system
    When I navigate to Sales page
    Then I should see delete button for each sale

  @sorting @TC-M5-SALE-UI-006
  Scenario: Verify default sorting by sold date descending
    Given multiple sales records exist with different dates
    When I navigate to Sales page
    Then sales should be sorted by sold date in descending order

  @sorting @TC-M5-SALE-UI-007
  Scenario: Verify sorting by plant name
    Given multiple sales records exist
    When I navigate to Sales page
    And I click on "Plant Name" column header
    Then sales should be sorted by plant name alphabetically

  @sorting @TC-M5-SALE-UI-008
  Scenario: Verify sorting by quantity
    Given multiple sales records exist
    When I navigate to Sales page
    And I click on "Quantity" column header
    Then sales should be sorted by quantity

  @sorting @TC-M5-SALE-UI-009
  Scenario: Verify sorting by total price
    Given multiple sales records exist
    When I navigate to Sales page
    And I click on "Total Price" column header
    Then sales should be sorted by total price

  @smoke @TC-M5-SALE-UI-010
  Scenario: Verify Sell Plant page loads with plant dropdown
    Given plants with stock exist
    When I navigate to Sales page
    And I click "Sell Plant" button
    Then I should see Sell Plant form at "/ui/sales/new"
    And I should see plant dropdown with available plants

  @validation @TC-M5-SALE-UI-011
  Scenario: Verify validation error when plant is not selected
    Given I am on Sell Plant page
    When I leave plant dropdown empty
    And I enter quantity "5"
    And I click Submit button
    Then I should see validation error "Plant is required"

  @validation @TC-M5-SALE-UI-012
  Scenario: Verify validation error when quantity is zero
    Given I am on Sell Plant page
    And I select a plant from dropdown
    When I enter quantity "0"
    And I click Submit button
    Then I should see validation error "Value must be greater than or equal to 1."

  @validation @TC-M5-SALE-UI-013
  Scenario: Verify validation error when quantity is negative
    Given I am on Sell Plant page
    And I select a plant from dropdown
    When I enter quantity "-5"
    And I click Submit button
    Then I should see validation error "Value must be greater than or equal to 1."

  @positive @TC-M5-SALE-UI-014
  Scenario: Verify successful sale redirects to sales list
    Given I am on Sell Plant page
    And a plant with sufficient stock exists
    When I select the plant from dropdown
    And I enter valid quantity within stock
    And I click Submit button
    Then sale should be created successfully
    And I should be redirected to "/ui/sales"

  @positive @TC-M5-SALE-UI-015
  Scenario: Verify Cancel button navigates back to sales list
    Given I am on Sell Plant page
    When I click Cancel button
    Then I should be redirected to "/ui/sales"
    And no sale should be created

  @positive @TC-M5-SALE-UI-016
  Scenario: Verify stock is reduced after successful sale
    Given I am on Sell Plant page
    And a plant with quantity 10 exists
    When I select the plant from dropdown
    And I enter quantity "3"
    And I click Submit button
    Then sale should be created successfully
    And plant stock should be reduced to 7

  @validation @TC-M5-SALE-UI-017
  Scenario: Verify validation when quantity exceeds available stock
    Given I am on Sell Plant page
    And a plant with quantity 5 exists
    When I select the plant from dropdown
    And I enter quantity "10"
    And I click Submit button
    Then I should see validation error "Insufficient stock"

  @smoke @TC-M5-SALE-UI-018
  Scenario: Verify total price is calculated correctly on Sell Plant page
    Given I am on Sell Plant page
    And a plant with price 100.00 exists
    When I select the plant from dropdown
    And I enter quantity "5"
    Then total price should display "500.00"
