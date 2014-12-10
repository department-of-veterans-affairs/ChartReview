<%@ page import="gov.va.vinci.chartreview.ServiceTaskDefinitionWithVariable; gov.va.vinci.chartreview.TaskDefinitionWithVariable; gov.va.vinci.chartreview.TaskVariablesEnum;" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
        <ckeditor:resources/>
        <g:if test="${!readOnly}">
		    <g:title>Add Process to Project Wizard</g:title>
        </g:if>
        <g:else>
            <g:title>Review Process</g:title>
        </g:else>
	</head>
	<body>
        <style>
            input[disabled], textarea[readonly="readonly"], textarea[readonly], input[readonly="readonly"], select[readonly="readonly"], select[disabled]
            {
                color: #000000;
                opacity: 50;
            }
            .ui-state-disabled {
                color: #000000;
            }
        </style>
        <div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
            <fieldset class="form">
            <g:if test="${!readOnly}">
                <legend>Step 2 - Process Parameters</legend>
            </g:if>
            <g:else>
                <legend>Review Process Parameters</legend>
            </g:else>
            <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
            <g:form class="form-horizontal">
                <fieldset id="formFields">
                    <div class="control-group">
                        <label class="control-label" for="displayName">
                            Process Name
                            <i class="icon-question-sign" rel="tooltip" title="The name that is shown throughout the application." id="contentTemplateToolTip"></i>
                        </label>
                        <div class="controls">
                            <g:textField name="displayName" class="input-xxlarge" id="displayName" value="${model.displayName}"/>
                        </div>
                    </div>

                    <div class="control-group">
                        <label class="control-label" for="displayName">
                            Clinical Element Group <i class="icon-question-sign" rel="tooltip" title="This is an optional grouping that will keep all clinical elements grouped under a specified group. Generally this should be left blank." id="clinicalElementGroupToolTip"></i>
                        </label>
                        <div class="controls">
                            <g:textField name="processGroup" class="input-xxlarge" id="displayName" value="${model.processGroup}" maxlength="36"/>
                        </div>
                    </div>
                    <h3>Process Steps</h3>
                    <ul class="nav nav-tabs" id="myTab">
                    <g:each in="${tasksWithVariables}" var="item" status="i">
                            <li <g:if test="${i == 0}">class="active"</g:if>><a href="#${item.taskDefinitionKey}">${item.taskDefinitionKey}</a></li>
                    </g:each>
                    </ul>
                    <div class="tab-content">
                        <g:each in="${tasksWithVariables}" var="item" status="i">
                            <g:if test="${item.class.canonicalName == TaskDefinitionWithVariable.class.canonicalName}">
                                <g:render template="/process/addToProject/taskForm" model="[model: model, item: item, project: project, i: i, clinicalElementConfigurationMap: clinicalElementConfigurationMap]" />
                            </g:if>
                            <g:if test="${item.class.canonicalName == ServiceTaskDefinitionWithVariable.class.canonicalName}">
                                  <g:render template="/process/addToProject/serviceForm" model="[model: model, item: item, project: project, i: i, serviceParameters: serviceParameters, clinicalElementConfigurationMap: clinicalElementConfigurationMap]" />
                            </g:if>
                        </g:each>
                    </div>
                </fieldset>
                <div class="text-info" style="background-color: lightyellow; border: 1px solid #0000ff; padding: 5px; margin-bottom: 10px">
                    The annotationGroup in Chart Review works by deleting all annotations for a user/annotation group when they save their changes and saving new submitted
                    annotations as the users complete annotation set. If tasks are independent of each other, annotation group should be unique throughout a project.
                    When in doubt, make this a unique name that is not used on other tasks.
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <g:if test="${!readOnly}">
                    <g:submitButton name="previous" value="Previous" class="btn btn-primary" style="float:left"/>
                </g:if>
                <g:submitButton name="next" value="Next" class="btn btn-primary" style="float:right"/>
            </g:form>
		</div>
        <script>
            $('#myTab a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

            $(document).ready(function(){
                $("[rel=tooltip]").tooltip({ placement: 'right'});
                $('#displayName').on('focusout',function(e){
                    $('.taskDisplayName').each(function() { //loop through each checkbox
                        if (this.value == "") {
                            this.value = $('#displayName').val();
                        }
                    });
                });
            });
        </script>

        <g:if test="${readOnly}">
            <script src="${request.contextPath}/js/jquery-disabler.min.js"></script>
            <script>
                $(function() {

                    $("#formFields").disabler({
                        disable : true
                    });

                    $("#formFields").disabler("readOnly", "formFields", true);

                });
            </script>
        </g:if>
    </body>
</html>