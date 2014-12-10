<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <g:title>Clinical Element Configuration Wizard</g:title>
</head>
<body>

<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form >
        <fieldset class="form">
            <legend>Step 4 - Name and Description</legend>
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 150px;">Name</th>
                    <td><g:textField name="name" value="${dto.name}" style="width: 80%"/></td>
                </tr>
                <tr>
                    <th>Description</th>
                    <td>
                        <g:textArea name="description" style="width: 80%; height: 300px;">${dto.description}</g:textArea>
                    </td>
                </tr>
                <tr>
                    <th>Active</th>
                    <td>
                        <g:checkBox name="active" checked="${dto.active}" />
                    </td>
                </tr>
            </table>
            <br/>
            <div>
            <g:submitButton name="prev" value="Previous" class="btn btn-primary" />
            <g:submitButton name="finish" value="Finish" class="btn btn-success" style="float: right"/>
            </div>
            <div style="margin-top: 20px"><g:submitButton name="reset" value="Start Over" class="btn btn-danger"
                                                        onclick="return confirm('Start over?');"/></div>
        </fieldset>
    </g:form>
</div>
</body>
</html>
