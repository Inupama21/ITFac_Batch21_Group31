# @ui @categories @user
Feature: Category UI View and Access Control
  As a User of the QA Training App
  I want to view categories and navigate the list
  So that I can access inventory information without administrative rights 

  Background:
    Given I am logged in as a "User" 
    And I navigate to the Categories page 

  @TC-M2-CAT-UI-006
  Scenario: Verify User cannot see Add Category button
    Then I should NOT see the "Add A Category" button 

  @TC-M2-CAT-UI-007
  Scenario: Verify User cannot edit a category
    Then the "Edit" action should be hidden for all category records 

  @TC-M2-CAT-UI-008
  Scenario: Verify User cannot delete a category
    Then the "Delete" action should be hidden for all category records 

  @TC-M2-CAT-UI-012
  Scenario: Verify User can use pagination on category list
    Given more than 10 categories exist in the system 
    When I click on the "Next" page button
    Then the next set of category records should be displayed 