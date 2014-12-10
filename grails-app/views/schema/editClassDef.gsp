<%@ page import="gov.va.vinci.chartreview.model.schema.AnnotationSchema" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassRelDef" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:set var="entityName" value="${message(code: 'classDef.label', default: 'Classification')}" />
    <g:title><g:fieldValue bean="${classDef}" field="name"/></g:title>
    <r:require module="jquery-ui"/>
    <r:require modules="bootstrap"/>
    <link rel="stylesheet" href="../../static/css/pick-a-color-1.1.8.min.css">
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
    function onNameChange(obj, event)
    {
        updateColorExample();
    }
    function updateColorExample()
    {
        var nameField = document.getElementById("nameField");
        var colorExample = document.getElementById("colorExample");
        if(colorExample)
        {
            var colorTextField = document.getElementById("pick-a-color");
            colorExample.textContent = nameField.value;
            colorExample.style.backgroundColor = "#" + colorTextField.value;
        }
    }
</script>
<legend>Classification: <g:fieldValue bean="${schemaInstance}" field="name"/>  /  <g:fieldValue bean="${classDef}" field="name"/></legend>
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
    <li id="attributeDefsListTab"><a href="#attributeDefsList">Attributes</a></li>
    %{--<li id="classDefsListTab"><a href="#classDefsList">Sub-Classes</a></li>--}%
</ul>
<g:form name="editClassDefForm" method="post" action="update" >
    <div class="tab-content">
        <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
            <div id="show-classDef" class="content scaffold-show" role="main">
                <div class="fieldcontain ${hasErrors(bean: classDef, field: 'name', 'error')} ">
                    <label for="name">
                        <g:message code="classDef.name.label" />*
                    </label>
                    <g:textField id="nameField" name="name" value="${classDef?.name}" autofocus="true" onfocus="this.select();" onchange="onNameChange(this, event)"/>
                </div>
                <div class="fieldcontain ${hasErrors(bean: classDef, field: 'color', 'error')} ">
                    <label for="color">
                        <g:message code="classDef.color.label" />*
                        <i class="icon-question-sign" rel="tooltip" title="For example: 0x123abc" id="typeToolTip"></i>
                        <text id="colorExample" style="background-color:#${classDef?.color}">${classDef?.name}</text>
                    </label>
                    <g:textField name="color" value="${classDef?.color}" id="pick-a-color" class="pick-a-color form-control" onchange="updateColorExample()"/>
                </div>
            </div>
        </div>
        <div class="tab-pane" id="attributeDefsList" style="margin-left: 20px; margin-right: 20px">
            %{--<h4>Inherited Attributes</h4>--}%
            %{--<table id="inheritedAttributesTable" class="table table-bordered" style="width: 100%">--}%
                %{--<thead>--}%
                    %{--<tr>--}%
                        %{--<th>Name</th>--}%
                        %{--<th style="text-align: center">Color</th>--}%
                        %{--<th style="text-align: center">Type</th>--}%
                        %{--<th style="text-align: center">Low</th>--}%
                        %{--<th style="text-align: center">High</th>--}%
                        %{--<th style="text-align: center">Options</th>--}%
                        %{--<th style="text-align: center">Version</th>--}%
                    %{--</tr>--}%
                %{--</thead>--}%
                %{--<tbody>--}%
                    %{--<g:each in="${classDef.findInheritedAttributeDefs()}" var="attributeDef">--}%
                        %{--<tr>--}%
                            %{--<td>--}%
                                %{--<div style="background-color:#${attributeDef?.color}">${attributeDef?.name}</div>--}%
                            %{--</td>--}%
                            %{--<td style="text-align: center">--}%
                                %{--<div style="background-color:#${attributeDef?.color}">${attributeDef?.color}</div>--}%
                            %{--</td>--}%
                            %{--<td style="text-align: center">${attributeDef?.type}</td>--}%
                            %{--<td style="text-align: center">${attributeDef?.numericLow}</td>--}%
                            %{--<td style="text-align: center">${attributeDef?.numericHigh}</td>--}%
                            %{--<td style="text-align: center">--}%
                                %{--<g:each in="${attributeDef?.attributeDefOptionDefs}" var="attributeDefOptionDef">--}%
                                    %{--${attributeDefOptionDef?.name}<br/>--}%
                                %{--</g:each>--}%
                            %{--</td>--}%
                            %{--<td style="text-align: center">${attributeDef?.version}</td>--}%
                        %{--</tr>--}%
                    %{--</g:each>--}%
                %{--</tbody>--}%
            %{--</table>--}%
            <h4>Attributes</h4>
            <table id="attributesTable" class="table table-bordered" style="width: 100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        %{--<th style="text-align: center">Color</th>--}%
                        <th style="text-align: center">Type</th>
                        <th style="text-align: center">Min</th>
                        <th style="text-align: center">Max</th>
                        <th style="text-align: center">Options</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    <g:each in="${classDef.doGetAttributeDefsSorted()}" var="attributeDef">
                        <tr>
                            <td hidden = true>${attributeDef.id}</td>
                            <td>
                                <div style="background-color:#${attributeDef?.color}">${attributeDef?.name}</div>
                            </td>
                            %{--<td style="text-align: center">--}%
                                %{--<div style="background-color:#${attributeDef?.color}">${attributeDef?.color}</div>--}%
                            %{--</td>--}%
                            <td style="text-align: center">
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
                            <td style="text-align: center"><g:link action="removeClassDefAttributeDef" params="[id: attributeDef.id, classDefId: classDef.id]" value="Delete" onclick="return confirm('Remove this attribute?');"><i class="icon-trash" title="Remove this attribute from this class"></i></g:link></td>
                        </tr>
                    </g:each>
                </tbody>
            </table>
            <br/><br/>
            <div class="text-left">
                <label for="availableAttributeDefs" class="control-label">
                    <g:message code="availableAttributeDefs.name.label" />*
                    <i class="icon-question-sign" rel="tooltip" title="The list of attributes that can be added to this classifcation." id="typeToolTip"></i>
                </label>
                <div class="controls">
                    <g:select class="form-control"
                              style="width: 100%"
                              id="availableAttributeDefs"
                              name="selectedAttributeDefIds"
                              from="${attributeDefs.sort()}"
                              optionKey="id"
                              optionValue="name"
                              multiple="true"
                    />
                </div>
                <g:actionSubmit class="create btn btn-primary" action="addClassDefAttributeDef" value="Add Attributes" />
                <br/><br/>
                <fieldset class="buttons">
                    <g:hiddenField name="schemaId" value="${schemaInstance?.id}"/>
                    <g:hiddenField name="classDefId" value="${classDef.id}" />
                    <g:hiddenField name="currentTab" value="${currentTab}" />
                    <g:actionSubmit class="create btn btn-primary" action="createAttributeDefFromClassDefEdit" value="Create Class Attribute" title="Create a class attribute and start editing it"/>
                </fieldset>
            </div>
        </div>
        <div class="tab-pane" id="classDefsList" style="margin-left: 20px; margin-right: 20px">
            <h4>Sub-Classifications</h4>
            <table id="subClassificationsTable" class="table table-bordered" style="width: 100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style="text-align: center">Color</th>
                        <th style="text-align: center">Attributes</th>
                        <th style="text-align: center">Parent Class</th>
                        <th style="text-align: center">Sub-Classes</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    <g:each in="${classDef.doGetClassDefsSorted()}" var="classDefClassDef">
                        <tr>
                            <td hidden = true>${classDefClassDef.id}</td>
                            <td>
                                <div style="background-color:#${classDefClassDef?.color}">${classDefClassDef?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${classDefClassDef?.color}">${classDefClassDef?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${classDefClassDef?.findAllAttributeDefs()}" var="classDefClassDefAttributeDef">
                                    <div style="background-color:#${classDefClassDefAttributeDef?.color}">${classDefClassDefAttributeDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${classDefClassDef?.parent?.color}">${classDefClassDef?.parent?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${classDefClassDef?.getClassDefsSorted()}" var="classDefClassDefClassDef">
                                    <div style="background-color:#${classDefClassDefClassDef?.color}">${classDefClassDefClassDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center"><g:link action="removeClassDefClassDef" params="[id: classDefClassDef.id, classDefId: classDef.id]" value="Delete" onclick="return confirm('Remove this sub class?');"><i class="icon-trash" title="Remove this class from being a sub-class to this class"></i></g:link></td>
                        </tr>
                    </g:each>
                </tbody>
            </table>
            <br/><br/>
            <div class="text-left">
                <label for="availableClassDefs" class="control-label">
                    <g:message code="availableClassDefs.name.label" />*
                    <i class="icon-question-sign" rel="tooltip" title="The list of sub classes that can be added to this classifcation." id="typeToolTip"></i>
                </label>
                <div class="controls">
                    <g:select class="form-control"
                              style="width: 100%"
                              id="availableClassDefs"
                              name="selectedClassDefClassDefIds"
                              from="${classDefs.sort()}"
                              optionKey="id"
                              optionValue="name"
                              multiple="true"
                    />
                </div>
                <g:actionSubmit class="create btn btn-primary" action="addClassDefClassDef" value="Add Sub-Classes" />
            </div>
        </div>
    </div>
    <br/><br/>
    <fieldset class="buttons">
        <g:hiddenField name="id" value="${classDef?.id}"/>
        <g:hiddenField name="currentTab" value="${currentTab}" />
        <g:hiddenField name="selectedAttributeDefIds" value="${selectedAttributeDefIds}"/>
        <g:hiddenField name="selectedClassDefClassDefIds" value="${selectedClassDefClassDefIds}"/>
        <g:hiddenField name="attributeDefsRowOrder" value="${attributeDefsRowOrder}"/>
        <g:hiddenField name="classDefClassDefsRowOrder" value="${classDefClassDefsRowOrder}"/>
        <g:actionSubmit class="btn btn-success" style="width:200px; float:right;" action="editClassDefSchema" onclick="captureListOrders()" value="Done" title="Save all edits to this classification and go back to editing the schema" />
        <a class="btn" style="float:left;" href='${createLink(action: "deleteClassDef",  id:"${classDef.id}", params:"[currentTab: currentTab, selectedAttributeDefIds: selectedAttributeDefIds, selectedClassDefClassDefIds: selectedClassDefClassDefIds]", onclick:"return confirm('Delete this whole classification?');")}' value="Delete Classification" title="Delete this whole classification!"><i class="icon-trash"></i> Delete Classification</a>
    </fieldset>
    <br/><br/>
    <g:if test="${flash.message}">
        <div class="alert" role="status">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            ${flash.message}
        </div>
    </g:if>
    <script>
        function captureListOrders() {
            var attributeDefsTableBody = attributesTable.children[1];
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

            var classDefClassDefsTableBody = subClassificationsTable.children[1];
            var classDefClassDefsRowOrderString = "";
            for(i = 0; i < classDefClassDefsTableBody.children.length; i++)
            {
                var tRow = classDefClassDefsTableBody.children[i];
                var idCell = tRow.cells[0];
                classDefClassDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
                if(i < classDefClassDefsTableBody.children.length - 1)
                {
                    classDefClassDefsRowOrderString += ",";
                }
            }
            document.getElementById("classDefClassDefsRowOrder").value = classDefClassDefsRowOrderString;
        }
        $("#inheritedAttributesTable tbody").sortable();
        $("#attributesTable tbody").sortable();
        $("#subClassificationsTable tbody").sortable();
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
            $("#pick-a-color").pickAColor(
                    {
                        showSpectrum: false,
                        showAdvanced: true,
                        basicColors : {
                            IndianRed: 'CD5C5C',
                            red : 'f00',
                            orange : 'f60',
                            yellow : 'ff0',
                            green : '008000',
                            LawnGreen: '7CFC00',
                            blue : '00f',
                            peru: 'CD853F',
                            purple : '800080',
                            MediumTurquoise: '48D1CC',
                            aqua: '00FFFF'

                        }
                    }
            );
        });
    </script>
</g:form>
<script src="${request.contextPath}/js/tinycolor-0.9.15.min.js"></script>
<script src="${request.contextPath}/js/pick-a-color-1.1.8.min.js"></script>
</body>
</html>
