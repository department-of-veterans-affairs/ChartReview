<%@ page import="grails.util.Holders" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
        <g:if test="${!readOnly}">
            <g:title>Add Process to Project Wizard</g:title>
        </g:if>
        <g:else>
            <g:title>Review Process</g:title>
        </g:else>
	</head>
	<body>
        <style>
            input[disabled], textarea[readonly="readonly"], textarea[readonly], input[readonly="readonly"], select[readonly="readonly"], select[disabled]
            {
                color: #000000;
                opacity: 50;
            }
            .ui-state-disabled {
                color: #000000;
            }
        </style>
		<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
            <legend>Confirm</legend>
            <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
            <g:form class="form-horizontal" >
                <div style="min-height: 400px">
                <g:if test="${numberToCreate > grails.util.Holders.config.chartReview.maxElementsInCreateProcess}">
                    <div class="alert alert-danger">
                        <h2>Large Task Warning</h2>
                        <br/>
                        <div class="checkbox">
                            <label  style="font-size: 18px;">
                                ChartReview does not support creating processes with over <g:formatNumber number="${grails.util.Holders.config.chartReview.maxElementsInCreateProcess}"/> elements. Your query is trying to create <span style="font-weight: bold; font-size: 18px;"><g:formatNumber number="${numberToCreate}" type="number" /></span> elements.
                                Please reduce the number of elements in your query in order to be able to create the processes.
                            </label>
                        </div>
                        <br/>
                    </div>
                </g:if>
                <g:elseif test="${numberToCreate > grails.util.Holders.config.chartReview.warnElementsInCreateProcess}">
                        <div class="alert alert-danger">
                            <h2>Large Task Warning</h2>
                            <br/>
                            <div class="checkbox" style="font-size: 18px;">
                                ChartReview is optimized for <g:formatNumber number="${grails.util.Holders.config.chartReview.warnElementsInCreateProcess}"/> elements.   To reduce the number of elements, choose <strong>Previous</strong> and edit your query.
                                <label   style="padding-left: 30px; font-size: 18px;">

                                    <br/>
                                    <input type="checkbox"  style="vertical-align: middle;" name="confirmedSize" value="confirmedSize" />&nbsp;&nbsp;I confirm I want to create <span style="font-weight: bold; font-size: 18px;"><g:formatNumber number="${numberToCreate}" type="number" /></span> elements.
                                    <br/>

                                </label>
                            </div>
                            <br/>
                        </div>
                </g:elseif>
                <g:else>
                    <br/>
                    <h4>This action will create ${numberToCreate} elements.</h4>
                </g:else>

                </div>
                <g:submitButton name="previous" value="Previous" class="btn btn-primary" style="float:left"/>

                <g:if test="${numberToCreate < grails.util.Holders.config.chartReview.maxElementsInCreateProcess}">
                    <g:submitButton name="finish" value="Create Tasks and Finish" class="btn btn-primary" style="float:right"/>
                </g:if>
            </g:form>
		</div>
        <script>
            $(document).ready(function(){
                $("[rel=tooltip]").tooltip({ placement: 'right'});
            });
        </script>
    <g:if test="${mode == "edit"}">
        <script src="${request.contextPath}/js/jquery-disabler.min.js"></script>
        <script>
            $(function() {

                $("#formFields").disabler({
                    disable : true,
                    expression : "*:not(.editableClass)"
                });

                $("#formFields").disabler("readOnly", "formFields", true);

            });
        </script>
    </g:if>
        <g:if test="${mode == 'readOnly'}">
            <script src="${request.contextPath}/js/jquery-disabler.min.js"></script>
            <script>
                $(function() {

                    $("#formFields").disabler({
                        disable : true
                    });

                    $("#formFields").disabler("readOnly", "formFields", true);

                });
            </script>
        </g:if>
	</body>
</html>
