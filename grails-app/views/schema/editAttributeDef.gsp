<%@ page import="gov.va.vinci.chartreview.model.schema.AnnotationSchema" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassDef" %>
<%@ page import="gov.va.vinci.chartreview.model.schema.ClassRelDef" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:set var="entityName" value="${message(code: 'attributeDef.label', default: 'Attribute')}" />
    <g:title><g:fieldValue bean="${attributeDef}" field="name"/></g:title>
    <r:require module="jquery-ui"/>
    <r:require modules="bootstrap"/>
    <link rel="stylesheet" href="../../static/css/pick-a-color-1.1.8.min.css">
</head>
<body>

<script>
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
<legend>Attribute: <g:fieldValue bean="${schemaInstance}" field="name"/>  /  <g:fieldValue bean="${attributeDef}" field="name"/></legend>
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
            <div id="show-attributeDef" class="content scaffold-show" role="main">
                <div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'name', 'error')} ">
                    <label for="name">
                        <g:message code="attributeDef.name.label" />*
                    </label>
                    <g:textField id="nameField" name="name" value="${attributeDef?.name}" autofocus="true" onfocus="this.select();" onchange="onNameChange(this, event)"/>
                </div>
                %{--<div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'color', 'error')} ">--}%
                    %{--<label for="attributeType" class="control-label">--}%
                        %{--<g:message code="attributeDef.color.label" />*--}%
                        %{--<i class="icon-question-sign" rel="tooltip" title="For example: 0x123abc" id="typeToolTip"></i>--}%
                        %{--<text id="colorExample" style="background-color:#${attributeDef?.color}">${attributeDef?.name}</text>--}%
                    %{--</label>--}%
                    %{--<g:textField name="color" value="${attributeDef?.color}" id="pick-a-color" class="pick-a-color form-control" onchange="updateColorExample()"/>--}%
                %{--</div>--}%
                <div class="control-group">
                    <label for="attributeType" class="control-label">
                        <g:message code="attributeDef.type.label" />*
                        <i class="icon-question-sign" rel="tooltip" title="This attribute can be text, number, or a list of options.  If number, then a low and high number range must be specified. If a list of options, that list must be provided." id="typeToolTip"></i>
                    </label>
                    <div class="controls">
                        <g:select class="form-control" id="attributeType" name="type"
                                  from="${[[k:'0', v:'Text'], [k:'1', v:'Numeric'], [k:'4', v:'Date'], [k:'3', v:'Option']] }"
                                  value="${attributeDef?.type}"
                                  optionKey="k" optionValue="v"
                                  onchange="doUpdateAttributeTypeEnablement(this)"
                        />
                    </div>
                </div>
                <div id="numeric">
                    <div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'numericLow', 'error')} ">
                        <label for="numericLow">
                            <g:message code="attributeDef.numericLow.label" />*
                        </label>
                        <g:textField name="numericLow" value="${attributeDef?.numericLow}"/>
                    </div>
                    <div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'numericHigh', 'error')} ">
                        <label for="numericHigh">
                            <g:message code="attributeDef.numericHigh.label" />*
                        </label>
                        <g:textField name="numericHigh" value="${attributeDef?.numericHigh}"/>
                    </div>
                </div>
                <div id="date">
                    <div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'minDate', 'error')} ">
                        <label for="minDate">
                            <g:message code="attributeDef.minDate.label" />*
                        </label>
                        <g:datePicker name="minDate" value="${attributeDef?.minDate}" years="${9999..0000}"/>
                    </div>
                    <div class="fieldcontain ${hasErrors(bean: attributeDef, field: 'maxDate', 'error')} ">
                        <label for="maxDate">
                            <g:message code="attributeDef.maxDate.label" />*
                        </label>
                        <g:datePicker name="maxDate" value="${attributeDef?.maxDate}" years="${9999..0000}"/>
                    </div>
                </div>
                <div id="options">
                    <h4>Options</h4>
                    <table id="attributeDefOptionDefsTable" class="table table-bordered" style="width: 100%">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th style="width: 30px; text-align: center">Edit</th>
                            <th style="width: 30px; text-align: center">Delete</th>
                            <th style="width: 30px; text-align: center">Copy</th>
                        </tr>
                        </thead>
                        <tbody>
                        <g:each in="${attributeDef.doGetAttributeDefOptionDefsSorted()}" var="attributeDefOptionDef">
                            <tr>
                                <td hidden = true>${attributeDefOptionDef.id}</td>
                                <td>
                                    <div>${attributeDefOptionDef?.name}</div>
                                </td>
                                <td style="text-align: center"><g:link action="startEditAttributeDefOptionDef" params="[id: attributeDefOptionDef.id, currentTab: currentTab]"><i class="icon-pencil" title="Edit this option"></i></g:link></td>
                                <td style="text-align: center"><g:link action="deleteAttributeDefOptionDef" params="[id: attributeDefOptionDef.id, currentTab: currentTab]" onclick="return confirm('Remove this option?');"><i class="icon-trash" title="Delete this option"></i></g:link></td>
                                <td style="text-align: center"><g:link action="copyAttributeDefOptionDef" id="${attributeDefOptionDef.id}" ><i class="icon-share"></g:link></i></td>
                            </tr>
                        </g:each>
                        </tbody>
                    </table>
                    <div class="nav text-right" role="navigation">
                        <g:actionSubmit class="create btn btn-primary" action="createAttributeDefOptionDef" id="${attributeDef.id}" value="Create Option" title="Create an option and start editing it"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br/><br/>
    <fieldset class="buttons">
        <g:hiddenField name="id" value="${attributeDef?.id}"/>
        <g:hiddenField name="currentTab" value="${currentTab}" />
        <g:hiddenField name="classDefId" value="${classDefId}" />
        <g:hiddenField name="attributeDefOptionDefsRowOrder" value="${attributeDefOptionDefsRowOrder}"/>
        <g:actionSubmit class="btn btn-success" style="width:200px; float:right;" action="${returnAction}" onclick="captureListOrders()" value="Done" title="Save all edits to this attribute and go back to editing the schema" />
        <a class="btn" style="float:left;" href='${createLink(action: "deleteAttributeDef",  id:"${attributeDef.id}", params:"[currentTab: currentTab]", onclick:"return confirm('Delete this whole attribute?');")}' value="Delete Attribute" title="Delete this whole attribute!"><i class="icon-trash"></i> Delete Attribute</a>
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
            var attributeDefOptionDefsTableBody = attributeDefOptionDefsTable.children[1];
            var attributeDefOptionDefsRowOrderString = "";
            for(i = 0; i < attributeDefOptionDefsTableBody.children.length; i++)
            {
                var tRow = attributeDefOptionDefsTableBody.children[i];
                var idCell = tRow.cells[0];
                attributeDefOptionDefsRowOrderString += idCell.innerHTML+"="+tRow.rowIndex;
                if(i < attributeDefOptionDefsTableBody.children.length - 1)
                {
                    attributeDefOptionDefsRowOrderString += ",";
                }
            }
            document.getElementById("attributeDefOptionDefsRowOrder").value = attributeDefOptionDefsRowOrderString;
        }
        $("#attributeDefOptionDefsTable tbody").sortable();
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
                            color01    : '6DD7FF',
                            color02    : '5D8BD0',
                            color03    : '66A3FF',
                            color04    : '708BE6',
                            color05    : '86A25D',
                            color06    : '4A8C8A',
                            color07    : '60CDBB',
                            color08    : 'A7F99A',
                            color09    : 'FF7070',
                            color10    : 'FF3535',
                            color11    : 'FF8247',
                            color12    : 'CE5575',
                            color13    : 'FFA1C1',
                            color14    : 'DDB3FF',
                            color15    : '9E83DD',
                            color16    : 'F4EC57',
                            color17    : 'FFC60A',
                            color18    : 'F9BD9F',
                            color19    : 'FD8BF9',
                            color20    : 'A5ABB1',
                            color21    : '43FF62',
                            color22    : 'DF7762',
                            color23    : 'D4A746',
                            color24    : 'A19C92',
                            color25    : '8981EA'
                        }
                    }
            );
            updateEnablement(${attributeDef?.type});
        });
        function doUpdateAttributeTypeEnablement(sel) {
            var attributeDefType = sel.value;
            this.updateEnablement(attributeDefType);
        }
        function updateEnablement(attributeDefType) {
            var numericHidden = attributeDefType != 1 ? true : false;//AttributeDef.ATTRIBUTE_DEF_TYPE_NUMERIC;
            var dateHidden = attributeDefType != 4 ? true : false;//AttributeDef.ATTRIBUTE_DEF_TYPE_DATE;
            var optionsHidden = attributeDefType != 3 ? true : false;//AttributeDef.ATTRIBUTE_DEF_TYPE_OPTION;
            var numeric = document.getElementById("numeric");
            numeric.hidden = numericHidden;
            var date = document.getElementById("date");
            date.hidden = dateHidden;
            var options = document.getElementById("options");
            options.hidden = optionsHidden;
        }
    </script>
</g:form>
<script src="${request.contextPath}/js/tinycolor-0.9.15.min.js"></script>
<script src="${request.contextPath}/js/pick-a-color-1.1.8.js"></script>
</body>
</html>
