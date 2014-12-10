<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:title>Add Process to Project Wizard</g:title>
	</head>
	<body>
		<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
            <fieldset class="form">
            <legend>Step 1 - Choose the Process to Add</legend>
            <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />

            <g:form >
                <div class="hero-unit">
                    <div class="form-horizontal">
                        Select process: <g:select name="processId" from="${processes}" optionValue="${{it.name +' (version '+ it.version + ')'}}" optionKey="id" style="margin-left: 30px; width: 500px" value="${model.processId}"/>
                    </div>
                    <br/>
                    <g:submitButton name="next" value="Next" class="btn btn-primary" style="float:right"/>
                    <br/>
                </div>
			</g:form>
		</div>
	</body>
</html>
