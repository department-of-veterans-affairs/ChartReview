<style>
label { font-weight: bold; }
</style>
<g:hiddenField name="id" value="${processInstance?.id}" />
<table class="table table-bordered table-striped">
    <tr class="fieldcontain ${hasErrors(bean: processInstance, field: 'name', 'error')} ">
        <th style="width: 100px">
            <label for="name">
                <g:message code="process.name.label" default="Name" />
            </label>
        </th>
        <td>
            <g:textField name="name" value="${processInstance?.name}" style="width: 500px " id="name" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: processInstance, field: 'description', 'error')} ">
        <th>
            <label for="description">
                <g:message code="process.description.label" default="Description" />
            </label>
        </th>
        <td>
            <g:textArea rows="10" cols="40" name="description" value="${processInstance?.description}" style="width: 500px; height: 200px;"/>
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: processInstance, field: 'active', 'error')} ">
        <th>
            <label for="active">
                <g:message code="process.active.label" default="Active" />
            </label>
        </th>
        <td>
            <g:checkBox name="active" value="${processInstance?.active}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: processInstance, field: 'bpmXml', 'error')} ">
        <th>
            <label for="bpmXmlFile">
                <g:message code="process.bpmXml.label"  />
            </label>
        </th>
        <td>
            <input type="file" name="bpmXmlFile"  id="bpmXmlFile"/>
        </td>
    </tr>
    <g:if test="${processInstance.bpmXml}">
        <tr>
            <th>Existing BPM XML</th>
            <td>
                <textarea style="width: 95%; height: 400px" readonly="true"><g:fieldValue bean="${processInstance}" field="bpmXml"/></textarea>
            </td>
        </tr>
    </g:if>
</table>


