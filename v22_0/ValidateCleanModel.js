if (typeof ValidateCleanModel == 'undefined')
{
    ValidateCleanModel = {};
}

/*** web/UI code - runs natively in the plugin process ***/

ValidateCleanModel.validateSectionContainerDivID = 'validateSectionContainerDiv';
ValidateCleanModel.validateResultsContainerDivID = 'validateResultsContainerDiv';
ValidateCleanModel.validateResultsMessageDivID = 'validateResultsMessageDiv';
ValidateCleanModel.validateResultsListDivID = 'validateResultsListDiv';

ValidateCleanModel.cleanSectionContainerID = 'cleanSectionContainerDiv';
ValidateCleanModel.cleanResultsContainerDivID = 'cleanResultsContainerDiv';
ValidateCleanModel.cleanResultsMessageDivID = 'cleanResultsMessageDiv';
ValidateCleanModel.cleanResultsListDivID = 'cleanResultsListDiv';
ValidateCleanModel.toleranceInputModuleID = 'toleranceInputModule';
ValidateCleanModel.toleranceInputID = 'toleranceInput';

ValidateCleanModel.isModelValid = undefined;
ValidateCleanModel.modelValidationErrors = '';
ValidateCleanModel.modelCheckedCleanResultMessage = 'This model is clean! No validation issues found.';
ValidateCleanModel.modelCheckFailedResultMessage = 'This model contains errors. Try fixing them with the Clean command below. <br><br> Here are the errors FormIt found:';
ValidateCleanModel.noCleanRequiredMessage = 'This model was already clean and remains unchanged.'
ValidateCleanModel.cleanSuccessMessage = 'This model has been cleaned!'

// this plugin uses a mix of hand-defined HTML, and JS-powered UI
ValidateCleanModel.initializeUI = async function()
{
    // validate section

    // validate section container - this is created in the HTML
    let validateSectionContainer = document.getElementById(ValidateCleanModel.validateSectionContainerDivID);

    // create the validate button
    validateSectionContainer.appendChild(new FormIt.PluginUI.Button('Validate Model', ValidateCleanModel.validateModel).element);

    // validate results container - starts hidden
    let validateResultsContainer = document.createElement('div');
    validateResultsContainer.id = ValidateCleanModel.validateResultsContainerDivID;
    validateResultsContainer.className = 'hide';
    validateSectionContainer.appendChild(validateResultsContainer);

    let validateResultsHeader = document.createElement('div');
    validateResultsHeader.style.fontWeight = 'bold';
    validateResultsHeader.innerHTML = 'Validation Results:'
    validateResultsContainer.appendChild(validateResultsHeader);

    let validateResultsMessage = document.createElement('p');
    validateResultsMessage.id = ValidateCleanModel.validateResultsMessageDivID;
    validateResultsContainer.appendChild(validateResultsMessage);

    let validateResultsList = document.createElement('div');
    validateResultsList.id = ValidateCleanModel.validateResultsListDivID;
    validateResultsContainer.appendChild(validateResultsList);

    // clean section

    // clean section container - this is created in the HTML
    let cleanSectionContainer = document.getElementById(ValidateCleanModel.cleanSectionContainerID);

    // create the tolerance input
    cleanSectionContainer.appendChild(new FormIt.PluginUI.TextInputModule('Tolerance: ', ValidateCleanModel.toleranceInputModuleID, 'inputModuleContainerTop', ValidateCleanModel.toleranceInputID, FormIt.PluginUI.convertValueToDimensionString).element);

    // add logic to the keypress events in the input element
    document.getElementById(ValidateCleanModel.toleranceInputID).value = await FormIt.StringConversion.LinearValueToString(0);

    // create the clean button
    cleanSectionContainer.appendChild(new FormIt.PluginUI.Button('Clean Model', ValidateCleanModel.cleanModel).element);

    // clean results container - starts hidden
    let cleanResultsContainer = document.createElement('div');
    cleanResultsContainer.id = ValidateCleanModel.cleanResultsContainerDivID;
    cleanResultsContainer.className = 'hide';
    cleanSectionContainer.appendChild(cleanResultsContainer);

    let cleanResultsHeader = document.createElement('div');
    cleanResultsHeader.style.fontWeight = 'bold';
    cleanResultsHeader.innerHTML = 'Clean Results:'
    cleanResultsContainer.appendChild(cleanResultsHeader);

    let cleanResultsMessage = document.createElement('p');
    cleanResultsMessage.id = ValidateCleanModel.cleanResultsMessageDivID;
    cleanResultsContainer.appendChild(cleanResultsMessage);
}

ValidateCleanModel.updateUIForValidationResults = async function()
{
    // make the result container div visible
    document.getElementById(ValidateCleanModel.validateResultsContainerDivID).className = 'infoContainer';

    // clear the results list if necessary (in case validation was run previously)
    let resultsListDiv = document.getElementById(ValidateCleanModel.validateResultsListDivID);
    while (resultsListDiv.firstChild) {
        resultsListDiv.removeChild(resultsListDiv.firstChild);
    }

    // update messaging depending on the result
    if (ValidateCleanModel.isModelValid)
    {
        document.getElementById(ValidateCleanModel.validateResultsMessageDivID).innerHTML = ValidateCleanModel.modelCheckedCleanResultMessage;
    }
    else
    {
        document.getElementById(ValidateCleanModel.validateResultsMessageDivID).innerHTML = ValidateCleanModel.modelCheckFailedResultMessage;

        // generate the error list
        ValidateCleanModel.populateErrorListWithResults();
    }
}

ValidateCleanModel.updateUIForCleanResults = async function(aCleanResults)
{
        // make the result container div visible
        document.getElementById(ValidateCleanModel.cleanResultsContainerDivID).className = 'infoContainer';
    
        // update messaging depending on the result
        if (aCleanResults.length == 0)
        {
            document.getElementById(ValidateCleanModel.cleanResultsMessageDivID).innerHTML = ValidateCleanModel.noCleanRequiredMessage;
        }
        else
        {
            document.getElementById(ValidateCleanModel.cleanResultsMessageDivID).innerHTML = ValidateCleanModel.cleanSuccessMessage;
        }
}

ValidateCleanModel.updateUIForUnitChange = async function()
{
    // update the tolerance input
    document.getElementById(ValidateCleanModel.toleranceInputID).value = await FormIt.StringConversion.LinearValueToString((await FormIt.StringConversion.StringToLinearValue(document.getElementById(ValidateCleanModel.toleranceInputID).value)).second);
}

ValidateCleanModel.populateErrorListWithResults = async function()
{
    let errorListDiv = document.getElementById(ValidateCleanModel.validateResultsListDivID);

    // for each error found, append a new element so it's spaced nicely
    for (var i = 0; i < ValidateCleanModel.modelValidationErrors.length; i++)
    {
        let ul = document.createElement('ul');
        let li = document.createElement('li');
        li.innerHTML = ValidateCleanModel.modelValidationErrors[i]["errorString"];
        li.style.marginLeft = 0;
        errorListDiv.appendChild(ul);
        ul.appendChild(li);
    }
}

/*** application code - runs asynchronously from plugin process to communicate with FormIt ***/

ValidateCleanModel.validateModel = async function()
{
    console.clear();
    console.log("Validate Model");

    let nHistoryID = await FormIt.GroupEdit.GetEditingHistoryID();

    ValidateCleanModel.modelValidationErrors = await WSM.APICheckHistoryValidityReadOnly(nHistoryID);
    ValidateCleanModel.isModelValid = ValidateCleanModel.modelValidationErrors.length == 0;

    await ValidateCleanModel.updateUIForValidationResults();
}

ValidateCleanModel.cleanModel = async function()
{
    console.clear();
    console.log("Clean Model");

    let nHistoryID = await FormIt.GroupEdit.GetEditingHistoryID();
    let tolerance = document.getElementById(ValidateCleanModel.toleranceInputModuleID).value;

    let aCleanResults = await WSM.APICleanModel(nHistoryID, tolerance);

    ValidateCleanModel.updateUIForCleanResults(aCleanResults);
}
