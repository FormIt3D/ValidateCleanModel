if (typeof ValidateCleanModel == 'undefined')
{
    ValidateCleanModel = {};
}

/*** web/UI code - runs natively in the plugin process ***/

/*** application code - runs asynchronously from plugin process to communicate with FormIt ***/

ValidateCleanModel.ValidateModel = async function()
{
    console.clear();
    console.log("Validate Model");

    let nHistoryID = await WSM.APIGetActiveHistory();

    let nIssuesFound = await WSM.APICheckHistoryValidityReadOnly(nHistoryID);

    if (nIssuesFound != 0)
    {
        alert("The model checked clean!");
    }
    else
    {
        if (confirm("This model contains errors. Try fixing them automatically with Clean?\n\nYou can run Clean any time from this plugin.")) {
            await ValidateCleanModel.CleanModel();
          }
    }

    //FormIt.Commands.DoCommand("Validate Model");
}

ValidateCleanModel.CleanModel = function()
{
    console.clear();
    console.log("Clean Model");

    //FormIt.Commands.DoCommand("Clean Model");
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
/*
ValidateCleanModel.SubmitValidate = function()
{
    var validateArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.ValidateModel", validateArgs);
}

ValidateCleanModel.SubmitClean = function()
{
    var cleanArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.CleanModel", cleanArgs);
}
*/
