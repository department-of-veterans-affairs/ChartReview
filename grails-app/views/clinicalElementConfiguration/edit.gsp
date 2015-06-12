<%@ page import="gov.va.vinci.siman.model.ElementTypeEnum" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
        <ckeditor:resources/>
		<g:title>Edit Clinical Element Configuration</g:title>
        <g:set var="entityName" value="Clinical Element Configuration" />
	</head>
	<body>
            <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>
    		<legend>Edit Clinical Element Configuration</legend>
            <g:render template="/templates/showErrors" model="[model: dataSetConfigurationInstance]" />
            <g:form method="POST">
                <g:hiddenField name="projectId" value="${params.projectId}" />
                <ul class="nav nav-tabs" id="myTab">
                    <li class="active"><a href="#configuration">General Configuration</a></li>
                    <li><a href="#columns">Columns</a></li>
                    <li><a href="#contentTemplateTab">Content Template</a></li>
                </ul>
                <div class="tab-content" style="min-height: 350px">
                    <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
                        <table class="table table-bordered table-striped">
                            <tr>
                                <th style="width: 150px;">Name</th>
                                <td><g:textField name="name" value="${dataSetConfigurationInstance.name}" style="width: 80%"/></td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>
                                    <g:textArea name="description" style="width: 80%; height: 200px;"><g:fieldValue bean="${dataSetConfigurationInstance}" field="description"/></g:textArea>
                                </td>
                            </tr>
                            <tr>
                                <th style="width: 200px">Type
                                    <i class="icon-question-sign" rel="tooltip" title="The type of this clinical element. Summary is one record per primary clinical element (patient), list is multiple records per primary clinical element (patient)." id="singleFieldToolTip"></i>
                                </th>
                                <td>
                                    <g:select name="elementType" from="${ElementTypeEnum.values()}"
                                              value="${elementConfigurationDTO.elementType}" /></td>
                            </td>
                            </tr>
                            <tr>
                                <th>Active</th>
                                <td>
                                    <g:checkBox name="active" checked="${dataSetConfigurationInstance.active}" />
                                </td>
                            </tr>
                            <tr>
                                <th>All Elements By Patient Id Query</th>
                                <td>
                                    ${elementConfigurationDTO.query}
                                </td>
                            </tr>
                            <tr>
                                <th>Single Element Query</th>
                                <td>
                                    ${elementConfigurationDTO.singleElementQuery}
                                </td>
                            </tr>
                            <tr>
                                <th><span id="titleField-label" class="property-label">Title Field</span></th>
                                <td><span class="property-value" aria-labelledby="titleField-label"><g:fieldValue bean="${elementConfigurationDTO}" field="titleField"/></span></td>
                            </tr>
                            <tr>
                                <th><span id="descriptionField-label" class="property-label">Description Field</span></th>
                                <td><span class="property-value" aria-labelledby="descriptionField-label"><g:fieldValue bean="${elementConfigurationDTO}" field="descriptionField"/></span></td>
                            </tr>
                            <tr>
                                <th><span id="createdBy-label" class="property-label">Created By</span></th>
                                <td><span class="property-value" aria-labelledby="createdBy-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="createdBy"/></span></td>
                            </tr>
                            <tr>
                                <th><span id="createdDate-label" class="property-label">Created Date</span></th>
                                <td><span class="property-value" aria-labelledby="createdDate-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="createdDate"/></span></td>
                            </tr>
                        </table>
                    </div>
                    <div class="tab-pane" id="columns" style="margin-left: 20px; margin-right: 20px">
                        <legend>Columns</legend>
                        <g:render template="create/elementTable" model="[model: elementConfigurationDTO]" />
                    </div>
                    <div class="tab-pane" id="contentTemplateTab" style="margin-left: 20px; margin-right: 20px">
                        <div class="form-inline" style="margin-bottom: 30px" >
                            Content Template
                            <i class="icon-question-sign" rel="tooltip" title="Content element defines how data is displayed for annotation view. All elements should generally have a content template." id="contentTemplateToolTip"></i>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <g:if test="${elementConfigurationDTO.hasContent}">Yes</g:if>
                            <g:else>No</g:else>
                        </div>
                        <div style="border: 1px solid #DDDDDD; padding: 10px">
                            ${elementConfigurationDTO.contentTemplate}
                        </div>
                        <br/><br/>
                    </div>
            </div>

				<fieldset class="buttons">
					<g:hiddenField name="id" value="${dataSetConfigurationInstance?.id}" />
					<g:actionSubmit class="update btn btn-primary" action="update" value="Update" />
				</fieldset>
			</g:form>
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
                <g:if test="${!elementConfigurationDTO.hasContent}">
                var oEditor = CKEDITOR.instances.contentTemplate;

                // wait until the editor has done initializing
                oEditor.on("instanceReady",function() {
                    oEditor.setData('');
                    oEditor.setReadOnly( true );
                });
                </g:if>
            });


            $('#myTab a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

            $("[rel=tooltip]").tooltip({ placement: 'right'});
        </script>
	</body>
</html>
