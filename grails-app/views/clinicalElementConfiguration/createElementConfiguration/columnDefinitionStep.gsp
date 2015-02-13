<%@ page import="gov.va.vinci.siman.model.ElementTypeEnum" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <ckeditor:resources/>
    <g:title>Clinical Element Configuration Wizard</g:title>
</head>
<body>

<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form>
        <fieldset class="form">
            <legend>Step 3 - Data Set Column Definition &amp; Other Metadata</legend>
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 200px">
                        Column Name
                        <i class="icon-question-sign" rel="tooltip" title="The column name from the result set." id="columnNameToolTip"></i>
                    </th>
                    <th>Display Name
                        <i class="icon-question-sign" rel="tooltip" title="The name for this column that will be displayed in the user interface." id="displayNameToolTip"></i>
                    </th>
                    <th>
                        Type Name
                        <i class="icon-question-sign" rel="tooltip" title="The database type for the column." id="typeNameToolTip"></i>
                    </th>
                    <th style="text-align: center">
                            Key Field
                            <i class="icon-question-sign" rel="tooltip" title="Key fields in the database should be checked." id="keyFieldToolTip"></i>
                    </th>
                    <th style="text-align: center">
                            Exclude <i class="icon-question-sign" rel="tooltip" title="Excluded fields are not sent to the UI, and are expected to be part of the content template." id="excludeToolTip"></i>
                    </th>
                </tr>
                <g:each in="${dto.dataQueryColumns}" var="column">
                    <tr>
                        <td>${column.columnName}</td>
                        <td><g:textField name="${column.columnName}-displayName" value="${column.displayName}" size="20"/></td>
                        <td>
                            ${column.type}
                            <g:if test="${column.type.startsWith("LONGBLOB")}">
                                <br>Mime type:
                                <g:select name="${column.columnName}-mimeTypeReferenceColumn"
                                          from="${dto.dataQueryColumns.findAll{!it.exclude&&it.type.equals("VARCHAR")}}"
                                          value="${column.columnName}"
                                          optionKey="columnName" optionValue="columnName" />
                            </g:if>
                        </td>
                        <td style="text-align: center"><g:checkBox name="${column.columnName}-KeyField" checked="${column.keyField}" /></td>
                        <td style="text-align: center">
                            <g:checkBox name="${column.columnName}-Exclude"
                                        checked="${column.exclude}"
                                        onclick="handleClick(this, '${column.columnName}', '${column.columnName}', 'titleField');handleClick(this, '${column.columnName}', '${column.columnName}', 'descriptionField');"
                            />
                        </td>
                    </tr>
                </g:each>
                </table>

            <table class="table table-bordered table-striped">
                <tr>
                    <td style="width: 200px">Title Field
                        <i class="icon-question-sign" rel="tooltip" title="Shows up at the top of the document when viewing a document as a single tab in the patient chart. " id="titleFieldToolTip"></i></td>
                    <td>
                        <g:select name="titleField"
                                  from="${dto.dataQueryColumns.findAll{!it.exclude}}"
                                  value="${dto?.titleField}"
                                  optionKey="columnName" optionValue="columnName" />
                    </td>
                </tr>
                <tr>
                    <td style="width: 200px">Description Field <i class="icon-question-sign" rel="tooltip" title="Shows up in the master list (optionally) on the annotation screen." id="descriptionFieldToolTip"></i></td>
                    <td>
                        <g:select name="descriptionField"
                                  from="${dto.dataQueryColumns.findAll{!it.exclude}}"
                                  value="${dto?.descriptionField}"
                                  optionKey="columnName" optionValue="columnName" />
                    </td>
                </tr>
                <tr>
                    <td style="width: 200px">Type
                        <i class="icon-question-sign" rel="tooltip" title="The type of this clinical element. Summary is one record per primary clinical element (patient), list is multiple records per primary clinical element (patient)." id="singleFieldToolTip"></i>
                    </td>
                    <td>
                        <g:select name="elementType" from="${ElementTypeEnum.values()}"
                                  value="${dto?.elementType}" /></td>
                    </td>
                </tr>
                <tr>
                    <td>Content Template
                        <i class="icon-question-sign" rel="tooltip" title="Content element defines how data is displayed for annotation view. All elements should generally have a content template." id="contentTemplateToolTip"></i>
                    </td>
                    <td>
                        <input type="radio" name="hasContent" value="true"  <g:if test="${dto.hasContent}">CHECKED="true"</g:if>/> Yes&nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="radio" name="hasContent" value="false" <g:if test="${!dto.hasContent}">CHECKED="true"</g:if>/> No
                    </td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;</td>
                    <td>
                        <ckeditor:editor name="contentTemplate" height="400px" width="100%" id="contentTemplate">
                            ${dto.contentTemplate}
                        </ckeditor:editor>
                        <br/>
                        <blockquote>
                            <p>Note: Fields in the content template are shown by putting a ${'${}'} around them,
                            for instance ${'${lab_name}'}. There should be no spaces in the brackets, and the column name
                            must match the column name in the query including case. </p>
                        </blockquote>
                    </td>
                </tr>
            </table>

            <g:submitButton name="reset" value="Previous" class="btn btn-primary"/>

            <span style="float: right;"><g:submitButton name="next" value="Next" class="btn btn-primary" /></span>
        </fieldset>
    </g:form>
</div>
<script>
    $(document).ready(function(){


        //put ckeditor initialization (the above) here.
        $('input[name="hasContent"]').change(function(){
            var oEditor = CKEDITOR.instances.contentTemplate;

            var x = $(this);
            if(x.val()=='true'){
                oEditor.setReadOnly( false );
            }else if(x.val()=='false'){
                oEditor.setData('');
                oEditor.setReadOnly( true );
            }

        });

        $("[rel=tooltip]").tooltip({ placement: 'right'});
    });

    $(window).load(function(){
        <g:if test="${!dto.hasContent}">
        var oEditor = CKEDITOR.instances.contentTemplate;

        // wait until the editor has done initializing
        oEditor.on("instanceReady",function() {
            oEditor.setData('');
            oEditor.setReadOnly( true );
        });
        </g:if>
    });

    function handleClick(cb, name, id, dropDownId) {
        var selectedValue = $(dropDownId).valueOf();

        if (!cb.checked) {
            $('#'+dropDownId).append('<option value="' + id + '">' + name + '</option>');
            var selectOptions = $('#'+dropDownId + " option");

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

            $('#'+dropDownId).empty().append(selectOptions);
        } else {
            var itemQuery = '#'+dropDownId + " option[value='" + id + "']";
            var item = $(itemQuery)
            item.remove();
        }
        $('#'+dropDownId + ' option[value="' + selectedValue + '"]').prop('selected', true);
    }
</script>
</body>
</html>
