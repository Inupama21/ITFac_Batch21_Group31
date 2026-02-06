Feature: Sales API - Admin Operations

  Background:
    Given I am authenticated as Admin

  @api @smoke @TC-M5-SALE-API-001
  Scenario: Verify GET all sales returns 200 with sales list
    Given sales records exist in system
    When I send GET request to "/sales"
    Then response status should be 200
    And response should contain array of sales
    And each sale should have fields "id, plant, quantity, totalPrice, soldAt"

  @api @smoke @TC-M5-SALE-API-002
  Scenario: Verify GET sales by ID returns correct sale details
    Given a sale exists with known ID
    When I send GET request to "/sales/{saleId}"
    Then response status should be 200
    And response should contain sale with id "{saleId}"
    And sale should have plant object with "id, name, price, quantity, category"

  @api @pagination @TC-M5-SALE-API-003
  Scenario: Verify GET sales with pagination parameters
    Given multiple sales exist in system
    When I send GET request to "/sales/page?page=0&size=10&sort=soldAt,desc"
    Then response status should be 200
    And response should contain paginated sales
    And sales should be sorted by "soldAt" in descending order

  @api @negative @TC-M5-SALE-API-004
  Scenario: Verify GET sales returns 404 for non-existent ID
    When I send GET request to "/sales/99999"
    Then response status should be 404
    And response should contain error message about sale not found

  @api @positive @TC-M5-SALE-API-005
  Scenario: Verify POST sale creates sale and reduces stock
    Given a plant exists with quantity 10
    And I note the plant's current quantity
    When I send POST request to "/sales/plant/{plantId}" with quantity 5
    Then response status should be 201
    And sale should be created with correct totalPrice
    And plant stock should be reduced by sold quantity

  @api @validation @TC-M5-SALE-API-006
  Scenario: Verify POST sale fails when quantity exceeds stock
    Given a plant exists with quantity 3
    When I send POST request to "/sales/plant/{plantId}" with quantity 10
    Then response status should be 400
    And response should contain error about insufficient stock

  @api @validation @TC-M5-SALE-API-007
  Scenario: Verify POST sale fails with invalid quantity zero
    Given a plant exists in system
    When I send POST request to "/sales/plant/{plantId}" with quantity 0
    Then response status should be 400
    And response should contain error "Quantity must be greater than 0"

  @api @validation @TC-M5-SALE-API-008
  Scenario: Verify POST sale fails for non-existent plant
    When I send POST request to "/sales/plant/99999" with quantity 5
    Then response status should be 404
    And response should contain error about plant not found

  @api @positive @TC-M5-SALE-API-009
  Scenario: Verify DELETE sale removes sale record successfully
    Given a sale exists with known ID
    When I send DELETE request to "/sales/{saleId}"
    Then response status should be 200 or 204
    When I send GET request to "/sales/{saleId}"
    Then response status should be 404

  @api @access-control @TC-M5-SALE-API-010
  Scenario: Verify DELETE sale fails for regular User role
    Given I am authenticated as User
    And a sale exists with known ID
    When I send DELETE request to "/sales/{saleId}"
    Then response status should be 403
    And response should contain error about insufficient permissions

  @api @validation @TC-M5-SALE-API-011
  Scenario: Verify POST sale fails with negative quantity
    Given a plant exists in system
    When I send POST request to "/sales/plant/{plantId}" with quantity -5
    Then response status should be 400
    And response should contain error "Quantity must be greater than 0"

  @api @positive @TC-M5-SALE-API-012
  Scenario: Verify POST sale calculates total price correctly
    Given a plant exists with price 150.00 and quantity 20
    When I send POST request to "/sales/plant/{plantId}" with quantity 4
    Then response status should be 201
    And sale total price should be 600.00

  @api @smoke @TC-M5-SALE-API-013
  Scenario: Verify GET empty sales list returns empty array
    Given no sales records exist in system via API
    When I send GET request to "/sales"
    Then response status should be 200
    And response should contain empty array

  @api @pagination @TC-M5-SALE-API-014
  Scenario: Verify pagination with different page sizes
    Given 25 sales records exist in system via API
    When I send GET request to "/sales/page?page=0&size=5"
    Then response status should be 200
    And response should contain 5 sales records
    And pagination metadata should show total elements 25

  @api @sorting @TC-M5-SALE-API-015
  Scenario: Verify sorting by plant name ascending
    Given multiple sales exist with different plant names via API
    When I send GET request to "/sales/page?sort=plant.name,asc"
    Then response status should be 200
    And sales should be sorted by plant name in ascending order via API

  @api @positive @TC-M5-SALE-API-016
  Scenario: Verify sale creation with exact stock quantity
    Given a plant exists with quantity 5
    When I send POST request to "/sales/plant/{plantId}" with quantity 5
    Then response status should be 201
    And plant stock should be reduced to 0 via API

  @api @validation @TC-M5-SALE-API-017
  Scenario: Verify POST sale fails when plant has zero stock
    Given a plant exists with quantity 0
    When I send POST request to "/sales/plant/{plantId}" with quantity 1
    Then response status should be 400
    And response should contain error about insufficient stock

  @api @smoke @TC-M5-SALE-API-018
  Scenario: Verify sale response contains soldAt timestamp
    Given a plant exists with quantity 10
    When I send POST request to "/sales/plant/{plantId}" with quantity 2
    Then response status should be 201
    And sale should have "soldAt" field with valid timestamp

  @api @access-control @TC-M5-SALE-API-019
  Scenario: Verify User can view sales via GET request
    Given I am authenticated as User
    And sales records exist in system
    When I send GET request to "/sales"
    Then response status should be 200
    And response should contain array of sales

  @api @access-control @TC-M5-SALE-API-020
  Scenario: Verify User cannot create sales via POST request
    Given I am authenticated as User
    And a plant exists with quantity 10
    When I send POST request to "/sales/plant/{plantId}" with quantity 2
    Then response status should be 403
    And response should contain error about insufficient permissions
