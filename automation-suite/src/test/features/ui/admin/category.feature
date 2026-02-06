@ui @categories
Feature: Category UI Management
  As an Admin
  I want to manage categories
  So that I can add new categories and validate errors for invalid inputs

  Background:
    Given I am logged in as an "Admin"
    And I navigate to the Categories page

  @TC-M2-CAT-UI-001
  Scenario: Verify Admin can access Add Category page
    When I click on the "Add A Category" button
    Then the Add Category page should be displayed

  @TC-M2-CAT-UI-002
  Scenario: Verify Admin can add a category with valid name
    When I add a new category with name "MyPlant89"
    Then the category "MyPlant89" should be visible in the category list

  @TC-M2-CAT-UI-003
  Scenario: Verify error when Category Name is empty
    When I click "Add A Category" but save without typing a name
    Then I should see a validation error "Category name is required"

  @TC-M2-CAT-UI-004
  Scenario: Verify error when Category Name length is less than 3
    When I add a new category with name "AB"
    Then I should see a validation error "Category name must be between 3 and 10 characters"

  @TC-M2-CAT-UI-005
  Scenario: Verify error when Category Name length is more than 10
    When I add a new category with name "PlantsExtraLongName"
    Then I should see a validation error "Category name must be between 3 and 10 characters"

  @TC-M2-CAT-UI-009
  Scenario: Verify category edit functionality with data pre-population
    And admin clicks edit button of any categories
    Then admin should see the edit category page with pre-populated data

 @TC-M2-CAT-UI-010
  Scenario: Verify category deletion from UI
    And admin clicks delete button of any categories
    And admin click ok to the popup from the browser
    Then the category should remove from the table
    And the successful message "category deleted successfully" should be displayed