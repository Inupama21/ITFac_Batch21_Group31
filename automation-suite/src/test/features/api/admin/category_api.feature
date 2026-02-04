Feature: Category API Management

  Scenario: Verify retrieving all categories
    Given I have a valid admin token
    When I send a GET request to "/api/categories"
    Then the response status code should be 200

    