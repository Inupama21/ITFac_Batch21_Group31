@user
Feature: Category API User Authorization

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


