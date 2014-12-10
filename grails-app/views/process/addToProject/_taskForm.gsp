<%@ page import="gov.va.vinci.chartreview.TaskVariablesEnum" %>
<g:set var="existingParam" value="${model.taskVariablesList[i]}"  />
<div class="tab-pane <g:if test="${i == 0}">active</g:if>" id="${item.taskDefinitionKey}" style="margin-left: 20px; margin-right: 20px" >
<strong>${item.documentation}</strong>
<br/><br/>
<g:if test="${item.hasSchema}">
    <div class="form-group">
        <label for="task-${item.taskDefinitionKey}-${TaskVariablesEnum.SCHEMA.getName()}">Schema</label>
        <g:select class="form-control"
                  id="taskVariablesList[${i}].${TaskVariablesEnum.SCHEMA.getName()}"
                  name="taskVariablesList[${i}].${TaskVariablesEnum.SCHEMA.getName()}"
                  from="${model.schemas}"
                  value="${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.SCHEMA.getName())}"
                  optionKey="value" optionValue="name" />
    </div>
</g:if>
<g:if test="${item.hasClinicalElements}">
    <br/><br/>
    <div class="form-group">
        <strong>Clinical Elements</strong>
        <div style="margin-left: 75px; margin-bottom: 10px"><input type="checkbox" id="selecctall" checked/>&nbsp;&nbsp; Include/exclude  all clinical elements</div>
        <table class="table table-striped table-bordered" style="margin-left: 50px; width: 75%; margin-bottom: 5px">
            <tr>
                <th style="width: 50px; text-align: center">Include</th>
                <th style="width: 50px; text-align: center">Hidden</th>
                <th>Clinical Element</th>
                <th style="width: 50px; text-align: center">Position</th>
            </tr>
            <g:each in="${model.taskVariablesList[i].clinicalElements}" var="clinicalElementConfiguration" status="counter">

                <tr>
                    <td style="width: 50px; text-align: center">
                        <g:set var="existingRow"
                               value="${model.taskVariablesList[i].clinicalElements[counter]}" />
                        <g:checkBox name="taskVariablesList[${i}].clinicalElements[${counter}].include"
                                    class="includeCheckBox"
                                    value="true"
                                    checked="${model.taskVariablesList[i].clinicalElements[counter].include}"
                                    onclick="handleClick(this, '${clinicalElementConfigurationMap.get(clinicalElementConfiguration.clinicalElementConfigurationId).name}', '${clinicalElementConfiguration.clinicalElementConfigurationId}', '#${TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName()}${i}');"
                                    />
                    </td>
                    <td>
                        <g:checkBox name="taskVariablesList[${i}].clinicalElements[${counter}].hidden"
                                    value="true" checked="${model.taskVariablesList[i].clinicalElements[counter].hidden}" />
                    </td>
                    <td>
                        <label for="taskVariablesList[${i}].clinicalElements[${counter}].position">${clinicalElementConfigurationMap.get(clinicalElementConfiguration.clinicalElementConfigurationId).name}</label>
                    </td>
                    <td style="width: 50px; text-align: center">
                        <g:select name="taskVariablesList[${i}].clinicalElements[${counter}].position" from="${1..10}"  value="${model.taskVariablesList[i].clinicalElements[counter].position}" class="input-mini"/>
                    </td>
                </tr>
            </g:each>
        </table>
    </div>
</g:if>
<strong>Task Name
    <i class="icon-question-sign" rel="tooltip" title="Brief name for this task that is shown to the user." id="taskNameToolTip"></i></strong></strong>
<br/>
<g:textField name="taskVariablesList[${i}].${TaskVariablesEnum.NAME.getName()}" class="input-xxlarge taskDisplayName" value="${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.NAME.getName())}"/>
<br/><br/>
<strong>Annotation Group
    <i class="icon-question-sign" rel="tooltip" title="Annotations created for this task will be stored using this annotation group." id="taskAnnotationGroupToolTip"></i></strong>
<br/>
<g:textField name="taskVariablesList[${i}].${TaskVariablesEnum.ANNOTATION_GROUP.getName()}" class="input-xxlarge annotationGroup" value="${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.ANNOTATION_GROUP.getName())}"/>
<br/><br/>
<strong>Task Pre-Annotation Group
    <i class="icon-question-sign" rel="tooltip" title="The annotation group to load as pre-annotations to this task. If there are multiple pre-annotation groups, separate them with a SEMI-COLON AND NO SPACES. For example: group1;group2;group3" id="taskPreAnnotationGroupToolTip"></i></strong>
<br/>
<g:textField autocomplete="off" list="possiblePreAnnotationGroups" name="taskVariablesList[${i}].${TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName()}" class="input-xxlarge typeahead" id="preAnnotationGroupId" value="${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName())}"/>
<br/><br/>
<strong>Task Principal Clinical Element
    <i class="icon-question-sign" rel="tooltip" title="The should be the patient element." id="taskPrimaryClinicalElementToolTip"></i></strong>
<br/>
<g:select name="taskVariablesList[${i}].${TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName()}"
          from="${clinicalElementConfigurationMap.values()
                  .findAll{
                        model.taskVariablesList[i].clinicalElements.findAll{it.include}.collect{it.clinicalElementConfigurationId}.contains(it.id)
                    }
                  .sort{it.name}}"
          class="input-xxlarge"
          id="${TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName()}${i}"
          value="${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName())}"
          optionKey="id" optionValue="name"
/>
<br/><br/>
<strong>Task Documentation</strong>
<br/>
<ckeditor:editor name="taskVariablesList[${i}].${TaskVariablesEnum.DETAILED_DESCRIPTION.getName()}" height="200px" width="80%" id="task-${item.taskDefinitionKey}-${TaskVariablesEnum.DETAILED_DESCRIPTION.getName()}">
    ${model.taskVariablesList[i].parameters?.get(TaskVariablesEnum.DETAILED_DESCRIPTION.getName())}
</ckeditor:editor>
<br/><br/>
<strong>Associated Project Document For This Task</strong>
<br/>
<g:select name="taskVariablesList[${i}].${TaskVariablesEnum.PROJECT_DOCUMENT.getName()}"
          from="${projectDocumentList}"
          optionKey="id" optionValue="name"
          noSelection="${['null':'- None -']}"
          class="input-xxlarge"/>
<br/><br/>
</div>
<script>
$(document).ready(function() {
    $('#selecctall').click(function(event) {  //on click
        if(this.checked) { // check select status
            $('.includeCheckBox').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"
            });
        }else{
            $('.includeCheckBox').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"
            });
        }
    });
});

function handleClick(cb, name, id, dropDownId) {
    var selectedValue = $(dropDownId).val();

    if (cb.checked) {
        $(dropDownId).append('<option value="' + id + '">' + name + '</option>');
        var selectOptions = $(dropDownId + " option");

        selectOptions.sort(function(a, b) {
            if (a.text > b.text) {
                return 1;
            }
            else if (a.text < b.text) {
                return -1;
            }
            else {
                return 0
            }
        });

        $(dropDownId).empty().append(selectOptions);
    } else {
        $(dropDownId + " option[value='" + id + "']").remove();
    }
    $(dropDownId + ' option[value="' + selectedValue + '"]').prop('selected', true);

}
</script>
<datalist id="possiblePreAnnotationGroups">
    <g:each in="${possibleAnnotationGroups}" var="option"><option value="${option}"></option></g:each>
</datalist>