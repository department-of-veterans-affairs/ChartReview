<%@ page import="gov.va.vinci.chartreview.model.schema.AnnotationSchema" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassRelDef" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:set var="entityName" value="${message(code: 'schema.label', default: 'Schema')}" />
    <g:title><g:fieldValue bean="${schemaInstance}" field="name"/></g:title>
    <r:require modules="bootstrap"/>
</head>
<body>

<script>
    function getAttributeTypeName(attributeType)
    {
        var name = "Text";
        switch(attributeType)
        {
            case 1:
                name = "Numeric";
                break;
            case 2:
            default:
                name = "Text";
                break;
            case 3:
                name = "Options";
                break;
            case 4:
                name = "Date";
                break;
        }
        return name;
    }
</script>
<legend>Schema: <g:fieldValue bean="${schemaInstance}" field="name"/></legend>
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
    <li id="attributeDefsTab"><a href="#attributeDefs">Attributes</a></li>
    <li id="classDefsTab"><a href="#classDefs">Classifications</a></li>
    %{--<li id="classRelDefsTab"><a href="#classRelDefs">Class Relationships</a></li>--}%
</ul>
<g:form method="post" action="update" >
<div class="tab-content">
    <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
        <div id="show-schema" class="content scaffold-show" role="main">
            <div class="fieldcontain ${hasErrors(bean: schemaInstance, field: 'name', 'error')} ">
                <label for="name">
                    <g:message code="schema.name.label" />*
                </label>
                <g:textField name="name" value="${schemaInstance?.name}" autofocus="true" onfocus="this.select();"/>
            </div>
            <div class="fieldcontain ${hasErrors(bean: schemaInstance, field: 'description', 'error')} ">
                <label for="description">
                    <g:message code="schema.description.label" />*
                </label>
                <g:textArea name="description" value="${schemaInstance?.description}" style="width: 600px; height: 200px;"/>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="attributeDefs" style="margin-left: 20px; margin-right: 20px">
        <h4>Class Attributes</h4>
        <table id="attributeDefsTable" class="table table-bordered" style="width: 100%">
            <thead>
            <tr>
                <th>Name</th>
                %{--<th style="text-align: center">Color</th>--}%
                <th style="text-align: center">Type</th>
                <th style="text-align: center">Min</th>
                <th style="text-align: center">Max</th>
                <th style="text-align: center">Options</th>
                <th style="width: 30px; text-align: center">Edit</th>
                <th style="width: 30px; text-align: center">Delete</th>
                <th style="width: 30px; text-align: center">Copy</th>
            </tr>
            </thead>
            <tbody>
            <g:each in="${attributeDefs}" var="attributeDef">
                <tr>
                    <td hidden = true>${attributeDef.id}</td>
                    <td>
                        <div style="background-color:#${attributeDef?.color}">${attributeDef?.name}</div>
                    </td>
                    %{--<td style="text-align: center">--}%
                        %{--<div style="background-color:#${attributeDef?.color}">${attributeDef?.color}</div>--}%
                    %{--</td>--}%
                    <td id="attributeDefNameCell" style="text-align: center">
                        <script>
                            document.write(getAttributeTypeName(${attributeDef?.type}));
                        </script>
                    </td>
                    <td style="text-align: center">${attributeDef?.type == 1 || attributeDef?.type == 4 ? attributeDef?.type == 1 ? attributeDef?.numericLow : attributeDef?.minDate : ""}</td>
                    <td style="text-align: center">${attributeDef?.type == 1 || attributeDef?.type == 4 ? attributeDef?.type == 1 ? attributeDef?.numericHigh : attributeDef?.maxDate : ""}</td>
                    <td style="text-align: center">
                        <g:each in="${attributeDef?.doGetAttributeDefOptionDefsSorted()}" var="attributeDefOptionDef">
                            ${attributeDefOptionDef?.name}<br/>
                        </g:each>
                    </td>
                    <td style="text-align: center"><g:link action="startEditAttributeDef" params="[id: attributeDef.id]"><i class="icon-pencil" title="Edit this class attribute"></i></g:link></td>
                    <td style="text-align: center"><g:link action="deleteAttributeDef" params="[id: attributeDef.id]" onclick="return confirm('Delete this attribute?');"><i class="icon-trash" title="Delete this class attribute"></i></g:link></td>
                    <td style="text-align: center"><g:link action="copyAttributeDef" id="${attributeDef.id}" ><i class="icon-share"></g:link></i></td>
                </tr>
            </g:each>
            </tbody>
        </table>
        <br/><br/>
        <div class="nav text-right" role="navigation">
            <g:actionSubmit class="create btn btn-primary" action="createAttributeDef" id="${schemaInstance.id}" value="Create Class Attribute" title="Create a class attribute and start editing it"/>
        </div>
    </div>
    <div class="tab-pane" id="classDefs" style="margin-left: 20px; margin-right: 20px">
        <h4>Classifications</h4>
        <table id="classDefsTable" class="table table-bordered" style="width: 100%">
            <thead>
            <tr>
                <th>Name</th>
                <th style="text-align: center">Color</th>
                <th style="text-align: center">Attributes</th>
                %{--<th style="text-align: center">Parent Class</th>--}%
                %{--<th style="text-align: center">Sub-Classes</th>--}%
                <th style="width: 30px; text-align: center">Edit</th>
                <th style="width: 30px; text-align: center">Delete</th>
                <th style="width: 30px; text-align: center">Copy</th>
            </tr>
            </thead>
            <tbody>
            <g:each in="${classDefs}" var="classDef">
                <tr>
                    <td hidden = true>${classDef.id}</td>
                    <td id="classDefNameCell">
                        <div style="background-color:#${classDef?.color}">${classDef?.name}</div>
                    </td>
                    <td style="text-align: center">
                        <div style="background-color:#${classDef?.color}">${classDef?.color}</div>
                    </td>
                    <td style="text-align: center">
                        <g:each in="${classDef?.doGetAttributeDefsSorted()}" var="classAttributeDef">
                            <div style="background-color:#${classAttributeDef?.color?.replaceAll('0x', '')}">${classAttributeDef?.name}</div><br/>
                        </g:each>
                    </td>
                    %{--<td style="text-align: center">--}%
                        %{--<div>${classDef?.parent?.name}</div>--}%
                    %{--</td>--}%
                    %{--<td style="text-align: center">--}%
                        %{--<g:each in="${classDef?.classDefs}" var="classClassDef">--}%
                            %{--<div style="background-color:#${classClassDef?.color}">${classClassDef?.name}</div><br/>--}%
                        %{--</g:each>--}%
                    %{--</td>--}%
                    <td style="text-align: center"><g:link action="startEditClassDef" params="[id: classDef.id]"><i class="icon-pencil" title="Edit this classification"></i></g:link></td>
                    <td style="text-align: center"><g:link action="deleteClassDef" params="[id: classDef.id]" onclick="return confirm('Delete this classification?');"><i class="icon-trash" title="Delete this classification"></i></g:link></td>
                    <td style="text-align: center"><g:link action="copyClassDef" id="${classDef.id}" ><i class="icon-share"></g:link></i></td>
                </tr>
            </g:each>
            </tbody>
        </table>
        <br/><br/>
        <div class="nav text-right" role="navigation">
            <g:actionSubmit class="create btn btn-primary" action="createClassDef" id="${schemaInstance.id}" value="Create Classification" title="Create a classification and start editing it"/>
        </div>
    </div>
    <div class="tab-pane" id="classRelDefs" style="margin-left: 20px; margin-right: 20px">
        <h4>Class Relationships</h4>
        <table id="classRelDefsTable" class="table table-bordered" style="width: 100%">
            <tr>
                <th>Name</th>
                <th style="text-align: center">Color</th>
                <th style="text-align: center">Type</th>
                <th style="text-align: center">Left Classes</th>
                <th style="text-align: center">Right Classes</th>
                <th style="text-align: center">Attributes</th>
                <th style="text-align: center">Version</th>
                <th style="width: 30px; text-align: center">Edit</th>
                <th style="width: 30px; text-align: center">Delete</th>
                <th style="width: 30px; text-align: center">Copy</th>
            </tr>
            <g:each in="${classRelDefs}" var="classRelDef">
                <tr>
                    <td hidden = true>${classRelDef.id}</td>
                    <td id="classRelDefNameCell">
                        <div style="background-color:#${classRelDef?.color}">${classRelDef?.name}</div>
                    </td>
                    <td>
                        <div style="background-color:#${classRelDef?.color}">${classRelDef?.color}</div>
                    </td>
                    <td style="text-align: center">${classRelDef?.type}</td>
                    <td style="text-align: center">
                        <g:each in="${classRelDef?.doGetLeftClassDefsSorted()}" var="leftClassDef">
                            <div style="background-color:#${leftClassDef?.color}">${leftClassDef?.name}</div><br/>
                        </g:each>
                    </td>
                    <td style="text-align: center">
                        <g:each in="${classRelDef?.doGetRightClassDefsSorted()}" var="rightClassDef">
                            <div style="background-color:#${rightClassDef?.color}">${rightClassDef?.name}</div><br/>
                        </g:each>
                    </td>
                    <td style="text-align: center">
                        <g:each in="${classRelDef?.doGetAttributeDefsSorted()}" var="attributeDef">
                            <div style="background-color:#${attributeDef?.color}">${attributeDef?.name}</div><br/>
                        </g:each>
                    </td>
                    <td style="text-align: center">${classRelDef?.version}</td>
                    <td style="text-align: center"><g:link action="startEditClassRelDef" params="[id: classRelDef.id, currentTab: currentTab]"><i class="icon-pencil" title="Edit this class relationship"></i></g:link></td>
                    <td style="text-align: center"><g:link action="deleteClassRelDef" params="[id: classRelDef.id, currentTab: currentTab]" onclick="return confirm('Delete this class relationship?');"><i class="icon-trash" title="Delete this class relationship"></i></g:link></td>
                    <td style="text-align: center"><g:link action="copyClassRelDef" id="${classRelDef.id}" ><i class="icon-share"></g:link></i></td>
                </tr>
            </g:each>
        </table>
        <br/><br/>
        <div class="nav text-right" role="navigation">
            <g:actionSubmit class="create btn btn-primary" action="createClassRelDef" id="${schemaInstance.id}" value="Create Class Relationship" title="Create a class relationship and start editing it"/>
        </div>
    </div>
</div>
<br/><br/>
<fieldset class="buttons">
    <g:hiddenField name="id" value="${schemaInstance?.id}" />
    <g:hiddenField name="currentTab" value="${currentTab}" />
    <g:hiddenField name="attributeDefsRowOrder" value="${attributeDefsRowOrder}"/>
    <g:hiddenField name="classDefsRowOrder" value="${classDefsRowOrder}"/>
    <g:hiddenField name="classRelDefsRowOrder" value="${classRelDefsRowOrder}"/>
    <g:actionSubmit class="btn btn-success" style="width:200px; float:right;" action="editSchemaSchemaList" onclick="captureListOrders()" value="Done" title="Save all edits to this schema and go back to the list of schemas" />
    <a class="btn" style="float:left;" href='${createLink(action: "delete",  id:"${schemaInstance.id}", params:"[currentTab: currentTab]", onclick:"return confirm('Delete this whole schema?');")}' value="Delete Schema" title="Delete this whole schema!"><i class="icon-trash"></i> Delete Schema</a>
<br/><br/>
<g:if test="${flash.message}">
    <div class="alert" role="status">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        ${flash.message}
    </div>
</g:if>
<script>
    function captureListOrders() {
        var attributeDefsTableBody = attributeDefsTable.children[1];
        var attributeDefsRowOrderString = "";
        for(i = 0; i < attributeDefsTableBody.children.length; i++)
        {
            var tRow = attributeDefsTableBody.children[i];
            var idCell = tRow.cells[0];
            attributeDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
            if(i < attributeDefsTableBody.children.length - 1)
            {
                attributeDefsRowOrderString += ",";
            }
        }
        document.getElementById("attributeDefsRowOrder").value = attributeDefsRowOrderString;

        var classDefsTableBody = classDefsTable.children[1];
        var classDefsRowOrderString = "";
        for(i = 0; i < classDefsTableBody.children.length; i++)
        {
            var tRow = classDefsTableBody.children[i];
            var idCell = tRow.cells[0];
            classDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
            if(i < classDefsTableBody.children.length - 1)
            {
                classDefsRowOrderString += ",";
            }
        }
        document.getElementById("classDefsRowOrder").value = classDefsRowOrderString;

        var classRelDefsTableBody = classRelDefsTable.children[0]; // NOTE: NOT SURE WHY THIS ONE IS INDEX ZERO WHEN OTHERS ARE INDEX 1 - HTML IS THE SAME...
        var classRelDefsRowOrderString = "";
        for(i = 0; i < classRelDefsTableBody.children.length; i++)
        {
            var tRow = classRelDefsTableBody.children[i];
            var idCell = tRow.cells[0];
            classRelDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
            if(i < classRelDefsTableBody.children.length - 1)
            {
                classRelDefsRowOrderString += ",";
            }
        }
        document.getElementById("classRelDefsRowOrder").value = classRelDefsRowOrderString;
    }
    $("#attributeDefsTable tbody").sortable();
    $("#classDefsTable tbody").sortable();
    $("#classRelDefsTable tbody").sortable();
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
