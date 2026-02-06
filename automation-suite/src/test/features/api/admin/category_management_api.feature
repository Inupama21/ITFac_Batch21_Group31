@api @admin
Feature: Category Management API - Admin Role
  As an Admin User
  I want to view and search categories
  So that I can manage the plant structure effectively

  Scenario: TC_API_ADMIN_CATEGORY_001 - Verify Admin search categories by name returns matching results
    Given I am authenticated as a "Admin"
    When I send a GET request to "/api/categories/page" with search parameter "cat1"
    Then the response status code should be 200
    And the response body should only contain categories where name matches "cat1"

  Scenario: TC_API_ADMIN_CATEGORY_002 - Verify Admin gets all categories without filters
    Given I am authenticated as a "Admin"
    When I send a GET request to "/api/categories/page" without any parameters
    Then the response status code should be 200
    And the response body list size should represent the total categories in database

  Scenario: TC_API_ADMIN_CATEGORY_003 - Verify Admin sort by ID ascending
    Given I am authenticated as a "Admin"
    When I send a GET request to "/api/categories/page" sorted by "id" in "asc" order
    Then the response status code should be 200
    And the categories should be sorted by "id" in "asc" order

  Scenario: TC_API_ADMIN_CATEGORY_004 - Verify categories search with non-existent string returns an empty list
    Given I am authenticated as a "Admin"
    When I send a GET request to "/api/categories/page" with search parameter "NonExistentCategory123"
    Then the response status code should be 200
    And the response body should contain an empty list of categories

  Scenario: TC_API_ADMIN_CATEGORY_005 - Verify GET categories returns error for unauthenticated requests
    When I send a GET request to "/api/categories/page" without an auth token
    Then the response status code should be 401
    And the response body should contain an "Unauthorized" error message
