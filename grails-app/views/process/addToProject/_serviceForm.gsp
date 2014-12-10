<%@ page import="gov.va.vinci.chartreview.TaskVariablesEnum" %>
<div class="tab-pane active" id="processProperties" style="margin-left: 20px; margin-right: 20px" >
   <table class="table table-striped table-bordered" >
        <g:each in="${formProperties}" var="formProperty">
            <tr>
                <td style="width: 200px">
                    <strong>${formProperty.name}</strong>
                </td>
                <td>
                    <input type="text" maxlength="255" name="serviceTask:${item.taskDefinitionKey}-${formProperty.name}" class="input-xxlarge"
                           value="${serviceParameters.get("serviceTask:" + item.taskDefinitionKey + "-" + formProperty.name)}"/>
                </td>
            </tr>
        </g:each>
        <tr>
            <td>
                <strong>Schema:</strong>
            </td>
            <td>
                <g:select class="form-control input-xxlarge"
                          id="${item.taskDefinitionKey}-${TaskVariablesEnum.SCHEMA.getName()}"
                          name="serviceTask:${item.taskDefinitionKey}-${TaskVariablesEnum.SCHEMA.getName()}"
                          from="${model.schemas}"
                          optionKey="value" optionValue="name"
                          value="${serviceParameters.get("serviceTask:" + item.taskDefinitionKey + "-" + TaskVariablesEnum.SCHEMA.getName())}"/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Clinical Elements:</strong>
            </td>
            <td>
                <g:select name="serviceTask:${item.taskDefinitionKey}-${TaskVariablesEnum.CLINICAL_ELEMENTS.getName()}"
                          from="${clinicalElementConfigurationMap.values().sort{it.name}}"
                          optionKey="id" optionValue="name"
                          multiple="true" class="input-xxlarge"
                          value="${serviceParameters.get("serviceTask:" + item.taskDefinitionKey + "-" + TaskVariablesEnum.CLINICAL_ELEMENTS.getName())?.tokenize(',')}"
                />
            </td>
        </tr>
    </table>
    * Broker URL example <i>tcp://127.0.0.1:61616</i>
    <br/>
    <br/>
</div>