@api @plant @admin
Feature: Plant API Management - Admin
  As an admin
  I want to manage plants via API
  So that I can integrate plant operations programmatically

  Background:
    Given the QA Training App API is running
    And plants exist in the database

  @TC-M3-PLANT-API-006
  Scenario Outline: TC-M3-PLANT-API-006 - Verify GET plants with sorting API for Admin
    Given I am authenticated as "Admin"
    And multiple plants with varying prices exist
    When I send a GET request to "/plants/1?sort=<sortField>,<sortOrder>"
    Then the response status code should be 200
    And plants should be ordered by "<sortField>" in "<sortOrder>" order
    And the sort array in response should reflect the requested sort parameters
    And sorting should be applied correctly across all pages

    Examples:
      | sortField | sortOrder |
      | price     | asc       |
      | price     | desc      |
      | name      | asc       |
      | name      | desc      |

  @TC-M3-PLANT-API-007 @negative
  Scenario: TC-M3-PLANT-API-007 - Verify GET plant by invalid ID returns 404 for Admin
    Given I am authenticated as "Admin"
    And plant ID "99999" does not exist
    When I send a GET request to "/plants/99999"
    Then the response status code should be 404
    And the response should contain an appropriate error message
    And no plant data should be returned
    And the error message should indicate plant not found

  @TC-M3-PLANT-API-008 @negative
  Scenario: TC-M3-PLANT-API-008 - Verify GET plants by invalid category returns empty list for Admin
    Given I am authenticated as "Admin"
    And category ID "99999" does not exist or has no plants
    When I send a GET request to "/plants/category/99999"
    Then the response status code should be 200 or 404
    And the response should return an empty array or 404 with error message
    And no incorrect plant data should be returned

  @TC-M3-PLANT-API-009
  Scenario: TC-M3-PLANT-API-009 - Verify pagination boundary conditions for Admin
    Given I am authenticated as "Admin"
    And exactly 12 plants exist in database
    When I send a GET request to "/plants/paged?page=0&size=10"
    Then the response should return 10 plants
    And "first" should be true
    And "last" should be false
    When I send a GET request to "/plants/paged?page=1&size=10"
    Then the response should return 2 plants
    And "first" should be false
    And "last" should be true
    When I send a GET request to "/plants/paged?page=5&size=10"
    Then the response should return an empty content array or appropriate error

  @TC-M3-PLANT-API-010
  Scenario: TC-M3-PLANT-API-010 - Verify combined filter and sort API for Admin
    Given I am authenticated as "Admin"
    And plants exist under multiple categories with varying quantities
    When I send a GET request to "/plants/paged?page=0&size=10&sort=quantity,asc"
    Then the response status code should be 200
    And pagination should be applied with maximum 10 results
    And plants should be sorted by quantity ascending
    And the response should include both pagination metadata and sort information
    And results should be correctly filtered and ordered
    And page navigation should work with sorting maintained

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
