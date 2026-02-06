@plant @api
Feature: Plant Management - API Tests (QA3-Umesha)
  As a QA tester
  I want to test the Plant Management API endpoints
  So that I can ensure the API works correctly for both User and Admin roles

  Background:
    Given the QA Training App API is running
    And plants exist in the database

  @TC-M3-PLANT-API-001 @smoke
  Scenario: TC-M3-PLANT-API-001 - Verify GET all plants API returns complete plant list for User
    Given I am authenticated as "User"
    And multiple plants exist in database
    When I send a GET request to "/api/plants"
    Then the response status code should be 200
    And the response should return an array of plant objects
    And each plant should contain "id", "name", "price", "quantity", "category"
    And the category object should contain "id", "name", "parent", "subCategories"
    And all plants in database should be returned

  @TC-M3-PLANT-API-002
  Scenario: TC-M3-PLANT-API-002 - Verify GET plant by ID API for User
    Given I am authenticated as "User"
    And a plant with known ID exists
    When I send a GET request to "/api/plants/{validId}"
    Then the response status code should be 200
    And the response should return a single plant object
    And the plant object should contain "id", "name", "price", "quantity", "categoryId"
    And the returned plant ID should match the requested ID
    And all fields should contain valid data

  @TC-M3-PLANT-API-002 @negative
  Scenario: TC-M3-PLANT-API-002 - Verify GET plant by invalid ID returns 404
    Given I am authenticated as "User"
    When I send a GET request to "/api/plants/99999"
    Then the response status code should be 404

  @TC-M3-PLANT-API-003
  Scenario: TC-M3-PLANT-API-003 - Verify GET plants by category API for User
    Given I am authenticated as "User"
    And plants exist under specific category "2"
    When I send a GET request to "/api/plants/category/2"
    Then the response status code should be 200
    And the response should return an array of plant objects
    And all returned plants should belong to category "2"
    And each plant should have a complete category object with matching categoryId
    And plants from other categories should not be included

  @TC-M3-PLANT-API-004
  Scenario: TC-M3-PLANT-API-004 - Verify GET plant summary API for User
    Given I am authenticated as "User"
    And plants exist with varying quantities
    When I send a GET request to "/api/plants/summary"
    Then the response status code should be 200
    And the response should contain "totalPlants" and "lowStockPlants"
    And "totalPlants" should equal the total number of plants in database
    And "lowStockPlants" should equal the count of plants with quantity less than 5
    And both values should be non-negative integers

  @TC-M3-PLANT-API-005
  Scenario: TC-M3-PLANT-API-005 - Verify GET plants with pagination API for User
    Given I am authenticated as "User"
    And more than 10 plants exist in database
    When I send a GET request to "/api/plants/paged?page=0&size=5"
    Then the response status code should be 200
    And the response should contain "totalPages", "totalElements", "size", "content", "number", "first", "last"
    And the content array should contain maximum 5 plants
    And "totalElements" should show the total plant count
    When I send a GET request to "/api/plants/paged?page=1&size=5"
    Then page 0 and page 1 should return different plants
    And "first" should be true for page 0
    And "last" should be true for the final page
