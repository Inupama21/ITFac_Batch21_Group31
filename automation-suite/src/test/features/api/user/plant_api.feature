@api @plant @user
Feature: User Plant API Operations
  As a regular user
  I want to access plant information via API
  So that I can view available plants

  Scenario: Verify user can retrieve all plants via API - TC-M4-PLANT-API-006
    Given I am authenticated for API with "User" credentials
    When I send a GET request to "/api/plants"
    Then the response status code should be 200
    And the response should contain plant list
    And each plant should have required fields id, name, category, price, quantity

  Scenario: Verify user can retrieve plant summary - TC-M4-PLANT-API-007
    Given I am authenticated for API with "User" credentials
    When I send a GET request to "/api/plants/summary"
    Then the response status code should be 200
    And the response should contain plant summary data

  Scenario: Verify user cannot update plant details via API - TC-M4-PLANT-API-008
    Given I am authenticated for API with "Admin" credentials
    And I have an existing plant
    And I am authenticated for API with "User" credentials
    When I send a PUT request to "/api/plants/{id}" with the following data:
      | name         | price | quantity |
      | Hacked Plant |  1.00 |      999 |
    Then the response status code should be 403
    And the response should contain an error message
    And the plant data should remain unchanged

  Scenario: Verify user cannot create plant via API - TC-M4-PLANT-API-009
    Given I am authenticated for API with "User" credentials
    When I send a POST request to "/api/plants/category/4" with the following data:
      | name          | price | quantity |
      | Illegal Plant | 50.00 |       10 |
    Then the response status code should be 403
    And the error message should indicate insufficient permissions

  Scenario: Verify user cannot delete plant via API - TC-M4-PLANT-API-010
    Given I am authenticated for API with "Admin" credentials
    And I have an existing plant
    And I am authenticated for API with "User" credentials
    When I send a DELETE request to "/api/plants/{id}"
    Then the response status code should be 403
    And the error message should indicate insufficient permissions
    And the plant should still exist in the database
