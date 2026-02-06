@api @plant @admin
Feature: Plant API Management
  As an admin
  I want to manage plants via API
  So that I can integrate plant operations programmatically

  Scenario: Verify successful plant creation with valid data - TC-M4-PLANT-API-001
    Given I am authenticated for API with "Admin" credentials
    When I send a POST request to "/api/plants/category/4" with the following data:
      | name | price | quantity |
      | Rose |  50.0 |      100 |
    Then the response status code should be 201
    And the response should contain the created plant details

  Scenario: Verify API validation for invalid price values - TC-M4-PLANT-API-002
    Given I am authenticated for API with "Admin" credentials
    When I send a POST request to "/api/plants/category/4" with the following data:
      | name | price | quantity |
      | Rose |     0 |      100 |
    Then the response status code should be 400
    When I send a POST request to "/api/plants/category/4" with the following data:
      | name | price | quantity |
      | Rose |    -5 |      100 |
    Then the response status code should be 400

  Scenario: Verify system rejects edit request for a non-existent plant - TC-M4-PLANT-API-003
    Given I am authenticated for API with "Admin" credentials
    When I send a PUT request to "/api/plants/999999"
    Then the response status code should be 404

  Scenario: Verify successful plant update operation - TC-M4-PLANT-API-004
    Given I am authenticated for API with "Admin" credentials
    And I have an existing plant
    When I send a PUT request to "/api/plants/{id}" with the following data:
      | name          | price | quantity |
      | Updated Plant |  25.0 |       50 |
    Then the response status code should be 200
    When I send a GET request to "/api/plants/{id}"
    Then the response status code should be 200
    And the response should contain the updated plant details
      | name          | price | quantity |
      | Updated Plant |  25.0 |       50 |

  Scenario: Verify successful plant deletion - TC-M4-PLANT-API-005
    Given I am authenticated for API with "Admin" credentials
    And I have an existing plant
    When I send a DELETE request to "/api/plants/{id}"
    Then the response status code should be 204
    And the plant should not be present in the plant list
