'use strict';

var scenarioo = require('scenarioo-js');
var pages = require('./../webPages');

scenarioo.describeUseCase('Use branch aliases', 'Select a branch by using an alias', function () {

    var homePage = new pages.homePage();
    var branchAliasesPage = new pages.branchAliasesPage();
    var usecasePage = new pages.usecasePage();
    var scenarioPage = new pages.scenarioPage();
    var stepPage = new pages.stepPage();

    beforeEach(function(){
        new pages.homePage().initLocalStorage();
    });

    scenarioo.describeScenario('Select branch by alias', 'Create an alias and assert browsing through steps works', function () {
        branchAliasesPage.goToPage();
        branchAliasesPage.enterAlias('Latest dev', 'wikipedia-docu-example', 'alias to latest development release');
        branchAliasesPage.save();
        scenarioo.docuWriter.saveStep('Create new branch alias');

        branchAliasesPage.chooseBranch('Latest dev');
        scenarioo.docuWriter.saveStep('choose branch alias');

        homePage.goToPage();
        homePage.selectUseCase(1);
        usecasePage.selectScenario(0);
        scenarioPage.openStepByName('Step 1: Wikipedia Suche');
        stepPage.assertPreviousStepIsDisabled();
        scenarioo.docuWriter.saveStep('browse step using branch alias');

        // Restore initial state for other tests
        branchAliasesPage.goToPage();
        branchAliasesPage.deleteAlias(0);
        branchAliasesPage.save();
        branchAliasesPage.chooseBranch('wikipedia-docu-example');
    });

});
