@api @user
Feature: Category API - User
  As a Regular User
  I want to view categories but not change them
  So that I can access information without administrative access

  Scenario: TC-M2-CAT-API-006 - Verify User cannot create category via API
    Given I am authenticated as a(n) "User"
    # Use a valid name (3-10 chars) to bypass 400 validation and hit 403 security
    When I send a POST request to "/api/categories" with name "Flowers"
    Then the response status code should be 403

  Scenario: TC-M2-CAT-API-007 - Verify User cannot update category via API
    Given I am authenticated as a(n) "User"
    When I send a PUT request to "/api/categories" with name "NewName"
    Then the response status code should be 403

  Scenario: TC-M2-CAT-API-008 - Verify User cannot delete category via API
    Given I am authenticated as a(n) "User"
    When I send a DELETE request to "/api/categories" for the created category
    Then the response status code should be 403

  Scenario: TC-M2-CAT-API-010 - Verify User cannot access Admin-only category APIs
    Given I am authenticated as a(n) "User"
    # Attempting to Create
    When I send a POST request to "/api/categories" with name "Restricted"
    Then the response status code should be 403
    # Attempting to Delete a static ID
    When I send a DELETE request to "/api/categories/1" for the created category
    Then the response status code should be 403

  Scenario: TC_API_ADMIN_CATEGORY_006 - Verify User role can GET categories as read-only
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" without any parameters
    Then the response status code should be 200
    And the response body list size should represent the total categories in database

  Scenario: TC_API_ADMIN_CATEGORY_007 - Verify User search with non-existent category name returns empty
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with search parameter "UnknownCategory999"
    Then the response status code should be 200
    And the response body should contain an empty list of categories

  Scenario: TC_API_ADMIN_CATEGORY_008 - Verify User sorting categories by name ascending
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" sorted by "name" in "asc" order
    Then the response status code should be 200
    And the categories should be sorted by "name" in "asc" order

  Scenario: TC_API_ADMIN_CATEGORY_009 - Verify User filtering categories by parentId returns correct sub-categories
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with parentId 1
    Then the response status code should be 200
    And all returned categories should belong to the parent "cat1"

  Scenario: TC_API_ADMIN_CATEGORY_010 - Verify User can search for a sub-category by name within a parent
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with name "pets" and parentId 1
    Then the response status code should be 200
    And the response should contain only the category "pets" belonging to "cat1"
