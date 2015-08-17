<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard Step 3</title>
    <script src="${request.contextPath}/ckeditor/ckeditor.js"></script>
    <script src="${request.contextPath}/js/jquery-ui-1.11.2.min.js"></script>
</head>
<body>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form action="create">
        <fieldset class="form">
            <legend>Step 3 - Data Set Column Definition &amp; Other Metadata</legend>
            Note: Drag and Drop rows to change the order that the columns will be displayed
            <table id="columnsTable" class="table table-bordered table-striped">
                <thead>
                <tr>
                    <th style="width: 200px">
                        Column Name
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="The column name from the result set." id="columnNameToolTip"></i>
                    </th>
                    <th>Display Name
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="The name for this column that will be displayed in the user interface." id="displayNameToolTip"></i>
                    </th>
                    <th>
                        Type Name
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="The database type for the column." id="typeNameToolTip"></i>
                    </th>
                    %{--<th style="text-align: center">--}%
                    %{--Key Field--}%
                    %{--<i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="Key fields in the database should be checked." id="keyFieldToolTip"></i>--}%
                    %{--</th>--}%
                    <th style="text-align: center">
                        Exclude <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="Excluded fields are not sent to the UI, and are expected to be part of the content template." id="excludeToolTip"></i>
                    </th>
                </tr>
                </thead>
                <tbody>
                <g:each in="${dto.dataQueryColumns}" var="column">
                    <tr>
                        <td id="col-columnName-${column.columnName}">${column.columnName}</td>
                        <td id="col-displayName-${column.columnName}"><g:textField name="${column.columnName}-displayName" value="${column.displayName}" size="20" required=""/></td>
                        <td id="col-type-${column.columnName}">
                            ${column.type}
                            <g:if test="${column.type.startsWith("LONGBLOB")}">
                                <br>Mime type:
                                <g:select name="${column.columnName}-mimeTypeReferenceColumn"
                                          from="${dto.dataQueryColumns.findAll{it.type.equals("VARCHAR")}}"
                                          value="${column.columnName}"
                                          optionKey="columnName" optionValue="columnName" />
                            </g:if>
                        </td>
                        %{--<td style="text-align: center"><g:checkBox name="${column.columnName}-KeyField" checked="${column.keyField}" /></td>--}%
                        <td style="text-align: center" id="col-excludeName-${column.columnName}">
                            <g:checkBox name="${column.columnName}-Exclude"
                                        checked="${column.exclude}"
                                        onclick="handleClick(this, '${column.columnName}', '${column.columnName}', '#titleField');handleClick(this, '${column.columnName}', '${column.columnName}', '#descriptionField');"
                            />
                        </td>
                    </tr>
                </g:each>
                </tbody>
            </table>

            <table class="table table-bordered table-striped">
                <tr>
                    <td style="width: 200px">Title Field
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="Shows up at the top of the document when viewing a document as a single tab in the patient chart. " id="titleFieldToolTip"></i></td>
                    <td>
                        <g:select name="titleField"
                                  id="titleField"
                                  from="${dto.dataQueryColumns.findAll{!it.exclude}}"
                                  value="${dto?.titleField}"
                                  noSelection="['':'-Choose a field-']"
                                  optionKey="columnName" optionValue="columnName"
                                  required="true"/>
                    </td>
                </tr>
                <tr>
                    <td style="width: 200px">Description Field <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="Shows up in the master list (optionally) on the annotation screen." id="descriptionFieldToolTip"></i></td>
                    <td>
                        <g:select name="descriptionField"
                                  id="descriptionField"
                                  from="${dto.dataQueryColumns.findAll{!it.exclude}}"
                                  value="${dto?.descriptionField}"
                                  noSelection="['':'-Choose a field-']"
                                  optionKey="columnName" optionValue="columnName"
                                  required="true"/>
                    </td>
                </tr>
                <tr>
                    <td style="width: 200px">Type
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="The type of this clinical element. Summary is one record per primary clinical element (patient), list is multiple records per primary clinical element (patient)." id="singleFieldToolTip"></i>
                    </td>
                    <td>
                        <select name="elementType" id="elementType">
                            <option<g:if test="${dto.elementType == "List"}"> selected</g:if>>List</option>
                            <option<g:if test="${dto.elementType == "Summary"}"> selected</g:if>>Summary</option>
                        </select>
                    </td>
                </tr>
                <tr id="contentTemplateRow">
                    <td>Content Template
                        <i class="glyphicon glyphicon-question-sign" data-toggle="tooltip" title="Content element defines how data is displayed for annotation view. All elements should generally have a content template." id="contentTemplateToolTip"></i>
                    </td>
                    <td>
                        <input type="radio" name="hasContent" value="true" <g:if test="${dto.contentTemplate && dto.contentTemplate.length() > 0}">checked="checked"</g:if> /> Yes&nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="radio" name="hasContent" value="false" <g:if test="${!dto.contentTemplate || dto.contentTemplate.length() == 0}">checked="checked"</g:if>/> No
                    </td>
                </tr>
                <tr id="templateCkEditor">
                    <td>&nbsp;&nbsp;</td>
                    <td>
                        <textarea id="template" class="ckeditor" name="template">${dto.contentTemplate}</textarea>
                        <br/>
                        <blockquote>
                            <p>Note: Fields in the content template are shown by putting a ${'${}'} around them,
                            for instance ${'${company_name}'}. There should be no spaces in the brackets, and the column name
                            must match the column name in the query including case. </p>
                        </blockquote>
                    </td>
                </tr>
            </table>

            <button name="_eventId_prev" class="btn btn-primary" style="float:left;" id="_eventId_prev" type="submit" formnovalidate onclick="captureListOrders()"><i class="glyphicon glyphicon-chevron-left"></i> Back</button>
            <button name="_eventId_advanced" class="btn btn-primary" style="float:left;" id="_eventId_advanced" type="submit" formnovalidate onclick="captureListOrders()"><i class="glyphicon glyphicon-chevron-left"></i> Advanced</button>
            %{--<span style="float: bottom;"><g:submitButton name="advanced" value="Advanced" class="btn btn-primary" /></span>--}%
            <button type="submit" name="_eventId_next"  class="btn btn-primary" style="float:right;" id="_eventId_next" onclick="captureListOrders()">Next <i class="glyphicon glyphicon-chevron-right"></i></button>
            <g:hiddenField name="columnsTableRowOrder" value="${columnsTableRowOrder}"/>
        </fieldset>
    </g:form>
</div>
<br/><br/><br/>
<script>
    $("#columnsTable tbody").sortable();
    function captureListOrders() {
        var columnsTableBody = columnsTable.children[0];
        var columnsTableRowOrderString = "";
        for(i = 1; i < columnsTableBody.children.length; i++)
        {
            var tRow = columnsTableBody.children[i];
            var idCell = tRow.cells[0];
            columnsTableRowOrderString += idCell.innerHTML;
            if(i < columnsTableBody.children.length - 1)
            {
                columnsTableRowOrderString += ",";
            }
        }
        document.getElementById("columnsTableRowOrder").value = columnsTableRowOrderString;
    }
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $(document).ready(function(){
        //put ckeditor initialization (the above) here.

        $("[rel=tooltip]").tooltip({ placement: 'right'});

        /**
         * Had content drop down handling.
         */
        $("input[name$='hasContent']").click(function() {
            var test = $(this).val();

            if (test == "true") {
                $("#templateCkEditor").fadeIn();
            } else {
                $("#templateCkEditor").hide();
            }
        });

        <g:if test="${!dto.contentTemplate && dto.contentTemplate.length() > 0}">
        $("#templateCkEditor").hide();
        </g:if>
    });

    function handleClick(cb, name, id, dropDownId) {
        var selectedValue = $(dropDownId).val();

        if (!cb.checked) {
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
            var itemQuery = dropDownId + " option[value='" + id + "']";
            var item = $(itemQuery)
            item.remove();
        }
        $(dropDownId + ' option[value="' + selectedValue + '"]').prop('selected', true);
    }
</script>
</body>
</html>
