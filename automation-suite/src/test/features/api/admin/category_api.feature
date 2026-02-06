@api @admin
Feature: Category API POST,PUT And DELETE 


  Scenario: TC-M2-CAT-API-001 - Verify Admin can create category using API
   Given I am authenticated as a(n) "Admin"
    When I send a POST request to "/api/categories" with name "Flowers"
    Then the response status code should be 201
    And the response body should contain the category name "Flowers"