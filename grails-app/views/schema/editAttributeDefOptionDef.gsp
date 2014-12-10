<%@ page import="gov.va.vinci.chartreview.model.schema.AnnotationSchema" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassRelDef" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:set var="entityName" value="${message(code: 'attributeDefOptionDef.label', default: 'Option')}" />
    <g:title><g:fieldValue bean="${attributeDefOptionDef}" field="name"/></g:title>
    <r:require modules="bootstrap"/>
</head>
<body>

<legend>Option: <g:fieldValue bean="${schemaInstance}" field="name"/>  /  <g:fieldValue bean="${attributeDef}" field="name"/>  /  <g:fieldValue bean="${attributeDefOptionDef}" field="name"/></legend>
<style>
.tab-pane {
    min-height: 400px;
}
.modal {
    max-height: 800px;
    min-width: 700px;
}
</style>
<ul class="nav nav-tabs" id="myTab">
    <li id="configurationTab"><a href="#configuration">General Configuration</a></li>
</ul>
<g:form method="post" action="update" >
    <div class="tab-content">
        <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
            <div id="show-attributeDefOptionDef" class="content scaffold-show" role="main">
                <div class="fieldcontain ${hasErrors(bean: attributeDefOptionDef, field: 'name', 'error')} ">
                    <label for="name">
                        <g:message code="attributeDefOptionDef.name.label" />*
                    </label>
                    <g:textField name="name" value="${attributeDefOptionDef?.name}" autofocus="true" onfocus="this.select();"/>
                </div>
            </div>
        </div>
    </div>
    <br/><br/>
    <fieldset class="buttons">
        <g:hiddenField name="id" value="${attributeDefOptionDef?.id}"/>
        <g:hiddenField name="currentTab" value="${currentTab}" />
        <g:actionSubmit class="btn btn-success" style="width:200px; float:right;" action="editAttributeDefOptionDefAttributeDef" value="Done" title="Save all edits to this option and Go back to editing the attribute" />
        <a class="btn" style="float:left;" href='${createLink(action: "deleteAttributeDefOptionDef",  id:"${attributeDefOptionDef.id}", params:"[currentTab: currentTab]", onclick:"return confirm('Delete this whole option?');")}' value="Delete Schema" title="Delete this whole option!"><i class="icon-trash"></i> Delete Option</a>
    </fieldset>
    <br/><br/>
    <g:if test="${flash.message}">
        <div class="alert" role="status">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            ${flash.message}
        </div>
    </g:if>
    <script>
        $('#myTab a').click(function (e) {
            e.preventDefault();
            document.getElementById("currentTab").value = $(this)[0].hash.substring(1);
            $(this).tab('show');
        });
        $(document).ready(function() {
            $("#myTab a").each(function(){
                var tTabName = $(this)[0].hash.substring(1);
                var tTab = document.getElementById(tTabName + "Tab");
                var tTabDiv = document.getElementById(tTabName);
                if(tTabName == document.getElementById("currentTab").value)
                {
                    tTab.className += " active";
                    tTabDiv.className += " active";
                }
                else
                {
                    tTab.className = tTab.className.replace(" active", "");
                    tTabDiv.className = tTabDiv.className.replace(" active", "");
                }
            })
        });
    </script>
</g:form>
</body>
</html>
