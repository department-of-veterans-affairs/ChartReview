<%@ page import="gov.va.vinci.chartreview.model.schema.AnnotationSchema" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassRelDef" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:set var="entityName" value="${message(code: 'classRelDef.label', default: 'Class Relationship')}" />
    <g:title><g:fieldValue bean="${classRelDef}" field="name"/></g:title>
    <r:require module="jquery-ui"/>
    <r:require modules="bootstrap"/>
    <link rel="stylesheet" href="../../static/css/pick-a-color-1.1.8-CR-Enhanced.min.css">
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
<legend>Class Relationship: <g:fieldValue bean="${schemaInstance}" field="name"/>  /  <g:fieldValue bean="${classRelDef}" field="name"/></legend>
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
    <li id="classRelsTab"><a href="#classRels">Related Classes</a></li>
</ul>
<g:form method="post" action="update" >
    <div class="tab-content">
        <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
            <div id="show-classRelDef" class="content scaffold-show" role="main">
                <div class="fieldcontain ${hasErrors(bean: classRelDef, field: 'name', 'error')} ">
                    <label for="name">
                        <g:message code="classRelDef.name.label" />*
                    </label>
                    <g:textField id="nameField" name="name" value="${classRelDef?.name}" autofocus="true" onfocus="this.select();" onchange="onNameChange(this, event)"/>
                </div>
                <div class="fieldcontain ${hasErrors(bean: classRelDef, field: 'color', 'error')} ">
                    <label for="color">
                        <g:message code="classRelDef.color.label" />*
                        <i class="icon-question-sign" rel="tooltip" title="For example: 0x123abc" id="typeToolTip"></i>
                        <text id="colorExample" style="background-color:#${classRelDef?.color}">${classRelDef?.name}</text>
                    </label>
                    <g:textField name="color" value="${classRelDef?.color}" id="pick-a-color" class="pick-a-color form-control" onchange="updateColorExample()"/>
                </div>
            </div>
        </div>
        <div class="tab-pane" id="attributeDefs" style="margin-left: 20px; margin-right: 20px">
            <h4>Class Attributes</h4>
            <table id="attributeDefsTable" class="table table-bordered" style="width: 100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style="text-align: center">Color</th>
                        <th style="text-align: center">Type</th>
                        <th style="text-align: center">Min</th>
                        <th style="text-align: center">Max</th>
                        <th style="text-align: center">Options</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    <g:each in="${classRelDef.doGetAttributeDefsSorted()}" var="attributeDef">
                        <tr>
                            <td hidden = true>${attributeDef.id}</td>
                            <td>
                                <div style="background-color:#${attributeDef?.color}">${attributeDef?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${attributeDef?.color}">${attributeDef?.color}</div>
                            </td>
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
                            <td style="text-align: center"><g:link action="removeClassRelDefAttributeDef" params="[id: attributeDef.id, classRelDefId: classRelDef.id]" value="Delete" onclick="return confirm('Remove this attribute?');"><i class="icon-trash" title="Remove this attribute from this class relationship"></i></g:link></td>
                        </tr>
                    </g:each>
                </tbody>
            </table>
            <br/>
            <div class="text-left">
                <label for="availableAttributeDefs" class="control-label">
                    <g:message code="availableAttributeDefs.name.label" />*
                    <i class="icon-question-sign" rel="tooltip" title="The list of attributes that can be added to this class relationship." id="typeToolTip"></i>
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
                <g:actionSubmit class="create btn btn-primary" action="addClassRelDefAttributeDef" value="Add Attributes" title="Add the selected attributes to this class relationship" />
            </div>
        </div>
        <div class="tab-pane" id="classRels" style="margin-left: 20px; margin-right: 20px">
            <h4>Left Classes</h4>
            <table id="leftClassDefsTable" class="table table-bordered" style="width: 100%">
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
                    <g:each in="${classRelDef.doGetLeftClassDefsSorted()}" var="leftClassDef">
                        <tr>
                            <td hidden = true>${leftClassDef.id}</td>
                            <td id="leftClassDefNameCell">
                                <div style="background-color:#${leftClassDef?.color}">${leftClassDef?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${leftClassDef?.color}">${leftClassDef?.color}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${leftClassDef?.doGetAttributeDefsSorted()}" var="leftClassDefAttributeDef">
                                    <div style="background-color:#${leftClassDefAttributeDef?.color}">${leftClassDefAttributeDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${leftClassDef?.parent?.color}">${leftClassDef?.parent?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${leftClassDef?.doGetClassDefsSorted()}" var="leftClassDefClassDefClassDef">
                                    <div style="background-color:#${leftClassDefClassDefClassDef?.color}">${leftClassDefClassDefClassDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center"><g:link action="removeClassRelDefLeftClassDef" params="[id: leftClassDef.id, classRelDefId: classRelDef.id]" value="Delete" onclick="return confirm('Remove this left class?');"><i class="icon-trash" title="Remove this class from being a left class in this class relationship"></i></g:link></td>
                        </tr>
                    </g:each>
                </tbody>
            </table>
            <br/>
            <div class="text-left">
                <label for="availableLeftClassDefs" class="control-label">
                    <g:message code="availableClassDefs.name.label" />*
                    <i class="icon-question-sign" rel="tooltip" title="The list of classes that can be added to the left side of this class relationship." id="typeToolTip"></i>
                </label>
                <div class="controls">
                    <g:select class="form-control"
                              style="width: 100%"
                              id="availableLeftClassDefs"
                              name="selectedLeftClassDefIds"
                              from="${classDefs.sort()}"
                              optionKey="id"
                              optionValue="name"
                              multiple="true"
                    />
                </div>
                <g:actionSubmit class="create btn btn-primary" action="addClassRelDefLeftClassDef" value="Add Left Classes" title="Add the selected classes to be left classes in this class relationship" />
            </div>
            <br/><br/>
            <h4>Right Classes</h4>
            <table id="rightClassDefsTable" class="table table-bordered" style="width: 100%">
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
                    <g:each in="${classRelDef.doGetRightClassDefsSorted()}" var="rightClassDef">
                        <tr>
                            <td hidden = true>${rightClassDef.id}</td>
                            <td id="rightClassDefNameCell">
                                <div style="background-color:#${rightClassDef?.color}">${rightClassDef?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${rightClassDef?.color}">${rightClassDef?.color}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${rightClassDef?.doGetAttributeDefsSorted()}" var="rightClassDefAttributeDef">
                                    <div style="background-color:#${rightClassDefAttributeDef?.color}">${rightClassDefAttributeDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center">
                                <div style="background-color:#${rightClassDef?.parent?.color}">${rightClassDef?.parent?.name}</div>
                            </td>
                            <td style="text-align: center">
                                <g:each in="${rightClassDef?.doGetClassDefsSorted()}" var="rightClassDefClassDefClassDef">
                                    <div style="background-color:#${rightClassDefClassDefClassDef?.color}">${rightClassDefClassDefClassDef?.name}</div><br/>
                                </g:each>
                            </td>
                            <td style="text-align: center"><g:link action="removeClassRelDefRightClassDef" params="[id: rightClassDef.id, classRelDefId: classRelDef.id]" value="Delete" onclick="return confirm('Remove this right class?');"><i class="icon-trash" title="Remove this class from being a right class in this class relationship"></i></g:link></td>
                        </tr>
                    </g:each>
                </tbody>
            </table>
            <br/>
            <div class="text-left">
                <label for="availableRightClassDefs" class="control-label">
                    <g:message code="availableClassDefs.name.label" />*
                    <i class="icon-question-sign" rel="tooltip" title="The list of classes that can be added to the right side of this class relationship." id="typeToolTip"></i>
                </label>
                <div class="controls">
                    <g:select class="form-control"
                              style="width: 100%"
                              id="availableRightClassDefs"
                              name="selectedRightClassDefIds"
                              from="${classDefs.sort()}"
                              optionKey="id"
                              optionValue="name"
                              multiple="true"
                    />
                </div>
                <g:actionSubmit class="create btn btn-primary" action="addClassRelDefRightClassDef" value="Add Right Classes" title="Add the selected classes to be right classes in this class relationship" />
            </div>
        </div>
    </div>
    <br/><br/>
    <fieldset class="buttons">
        <g:hiddenField name="id" value="${classRelDef?.id}"/>
        <g:hiddenField name="currentTab" value="${currentTab}" />
        <g:hiddenField name="selectedAttributeDefIds" value="${selectedAttributeDefIds}"/>
        <g:hiddenField name="selectedLeftClassDefIds" value="${selectedLeftClassDefIds}"/>
        <g:hiddenField name="selectedRightClassDefIds" value="${selectedRightClassDefIds}"/>
        <g:hiddenField name="attributeDefsRowOrder" value="${attributeDefsRowOrder}"/>
        <g:hiddenField name="leftClassDefsRowOrder" value="${leftClassDefsRowOrder}"/>
        <g:hiddenField name="rightClassDefsRowOrder" value="${rightClassDefsRowOrder}"/>
        <g:actionSubmit class="btn btn-success" style="width:200px; float:right;" action="editClassRelDefSchema" onclick="captureListOrders()" value="Done" title="Save all edits to this class relationship and go back to editing the schema" />
        <a class="btn" style="float:left;" href='${createLink(action: "deleteClassRelDef",  id:"${classRelDef.id}", params:"[currentTab: currentTab, selectedAttributeDefIds: selectedAttributeDefIds, selectedLeftClassDefIds: selectedLeftClassDefIds, selectedRightClassDefIds: selectedRightClassDefIds]", onclick:"return confirm('Delete this whole class relationship?');")}' value="Delete Class Relationship" title="Delete this whole class relationship!"><i class="icon-trash"></i> Delete Class Relationship</a>
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

            var leftClassDefsTableBody = leftClassDefsTable.children[1];
            var leftClassDefsRowOrderString = "";
            for(i = 0; i < leftClassDefsTableBody.children.length; i++)
            {
                var tRow = leftClassDefsTableBody.children[i];
                var idCell = tRow.cells[0];
                leftClassDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
                if(i < leftClassDefsTableBody.children.length - 1)
                {
                    leftClassDefsRowOrderString += ",";
                }
            }
            document.getElementById("leftClassDefsRowOrder").value = leftClassDefsRowOrderString;

            var rightClassDefsTableBody = rightClassDefsTable.children[1];
            var rightClassDefsRowOrderString = "";
            for(i = 0; i < rightClassDefsTableBody.children.length; i++)
            {
                var tRow = rightClassDefsTableBody.children[i];
                var idCell = tRow.cells[0];
                rightClassDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
                if(i < rightClassDefsTableBody.children.length - 1)
                {
                    rightClassDefsRowOrderString += ",";
                }
            }
            document.getElementById("rightClassDefsRowOrder").value = rightClassDefsRowOrderString;
        }
        $("#attributeDefsTable tbody").sortable();
        $("#leftClassDefsTable tbody").sortable();
        $("#rightClassDefsTable tbody").sortable();
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
                            Color01    : '6DD7FF',
                            Color02    : '5D8BD0',
                            Color03    : '66A3FF',
                            Color04    : '708BE6',
                            Color05    : '86A25D',
                            Color06    : '4A8C8A',
                            Color07    : '60CDBB',
                            Color08    : 'A7F99A',
                            Color09    : 'FF7070',
                            Color10    : 'FF3535',
                            Color11    : 'FF8247',
                            Color12    : 'CE5575',
                            Color13    : 'FFA1C1',
                            Color14    : 'DDB3FF',
                            Color15    : '9E83DD',
                            Color16    : 'F4EC57',
                            Color17    : 'FFC60A',
                            Color18    : 'F9BD9F',
                            Color19    : 'FD8BF9',
                            Color20    : 'A5ABB1',
                            Color21    : '43FF62',
                            Color22    : 'DF7762',
                            Color23    : 'D4A746',
                            Color24    : 'A19C92',
                            Color25    : '8981EA'
                        }
                    }
            );
        });
    </script>
</g:form>
<script src="${request.contextPath}/js/tinycolor-0.9.15.min.js"></script>
<script src="${request.contextPath}/js/pick-a-color-1.1.8-CR-Enhanced.js"></script>
</body>
</html>
