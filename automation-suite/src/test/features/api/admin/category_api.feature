@api @admin
Feature: Category API - Admin
  As an Admin User
  I want to manage and view categories
  So that I can maintain the plant structure effectively

  Scenario: TC-M2-CAT-API-001 - Verify Admin can create category using API
    Given I am authenticated as a(n) "Admin"
    When I send a POST request to "/api/categories" with name "Flowers"
    Then the response status code should be 201
    And the response body should contain the category name "Flowers"

  Scenario: TC-M2-CAT-API-002 - Verify API validation for empty category name
    Given I am authenticated as a(n) "Admin"
    When I send a POST request to "/api/categories" with name ""
    Then the response status code should be 400

  Scenario: TC-M2-CAT-API-003 - Verify API validation for name length < 3
    Given I am authenticated as a(n) "Admin"
    # Sending 'AB' (length 2) should trigger the minimum length rule (min 3)
    When I send a POST request to "/api/categories" with name "AB"
    Then the response status code should be 400

  Scenario: TC-M2-CAT-API-004 - Verify API validation for name length > 10
    Given I am authenticated as a(n) "Admin"
    # "Electronics1" is 12 characters, which should trigger the maximum length rule
    When I send a POST request to "/api/categories" with name "Electronics1"
    Then the response status code should be 400

  Scenario: TC-M2-CAT-API-005 - Verify Admin can create and then delete category
    Given I am authenticated as a(n) "Admin"
    When I send a POST request to "/api/categories" with name "DeleteMe"
    Then the response status code should be 201
    When I send a DELETE request to "/api/categories" for the created category
    Then the response status code should be 204

  Scenario: TC-M2-CAT-API-009 - Verify Admin cannot update using existing name
    Given I am authenticated as a(n) "Admin"
    # Create the name we want to conflict with
    When I send a POST request to "/api/categories" with name "CategoryA"
    Then the response status code should be 201
    # Create the category we want to try and rename
    When I send a POST request to "/api/categories" with name "CategoryB"
    Then the response status code should be 201
    # Try to rename CategoryB to CategoryA
    When I send a PUT request to "/api/categories" with name "CategoryA"
    Then the response status code should be 500

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
