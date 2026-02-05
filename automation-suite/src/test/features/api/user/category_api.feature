@api @user
Feature: Category Management API - User Role
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

# bug
@skip @known_issue
  Scenario: TC_API_ADMIN_CATEGORY_008 - Verify User sorting categories by name ascending
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" sorted by "name" in "asc" order
    Then the response status code should be 200
    And the categories should be sorted by "name" in "asc" order


# scenario 11 is a alternative for scenario 9
@skip @known_issue
  Scenario: TC_API_ADMIN_CATEGORY_009 - Verify User filtering categories by parentId
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with parentId 1
    Then the response status code should be 200
    And the response body should only contain categories with parentId 1


  Scenario: TC_API_ADMIN_CATEGORY_010 - Verify User can search for a sub-category by name within a parent
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with name "pets" and parentId 1
    Then the response status code should be 200
    And the response should contain only the category "pets" belonging to "cat1"


  Scenario: TC_API_ADMIN_CATEGORY_011 - Verify User filtering categories by parentId returns correct sub-categories
    Given I am authenticated as a "User"
    When I send a GET request to "/api/categories/page" with parentId 1
    Then the response status code should be 200
    And all returned categories should belong to the parent "cat1"