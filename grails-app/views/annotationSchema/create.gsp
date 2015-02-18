<!doctype html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Create Annotation Schema</g:title>
    <r:require module="jquery-ui"/>
    <r:require modules="bootstrap"/>
    <link rel="stylesheet" href="${request.contextPath}/css/pick-a-color-1.1.8-CR-Enhanced.min.css">
    <script src="${request.contextPath}/js/pick-a-color-1.1.8-CR-Enhanced.js"></script>
    <script src="${request.contextPath}/js/tinycolor-0.9.15.min.js"></script>
    <script src="${request.contextPath}/js/angular.min.js"></script>
    <script src="${request.contextPath}/js/angular-pick-a-color.js"></script>

    <script src="${request.contextPath}/js/sortable.js"></script>
    <script src="${request.contextPath}/js/ui-bootstrap-0.12.0.min.js"></script>
    <script src="${request.contextPath}/js/ui-bootstrap-tpls-0.12.0.min.js"></script>
    <script src="${request.contextPath}/js/annotationSchemaRecord/schema.js"></script>

</head>
<body>
<div  ng-app="schemaApp" ng-controller="SchemaController" ng-init="init('1bb867a9-14ee-441f-bc49-0ab780085b05');" style="margin: 40px" >
    <g:if test="${model}">
        <legend>Edit Schema</legend>
    </g:if>
    <g:else>
        <legend>Create New Schema</legend>
    </g:else>
    <ul class="nav nav-tabs" id="myTab">
        <li class="active"><a href="#generalTab">General Configuration</a></li>
        <li><a href="#attributesTab">Attributes</a></li>
        <li><a href="#classificationsTab">Classifications</a></li>
    </ul>

    <div class="tab-content">
        <div class="tab-pane active" id="generalTab">
            <label>Name</label>
            <input ng-model="model.name" style="width: 400px" ng-required="true"/>
            <br/><br/>
            <label>Description</label>
            <textarea ng-model="model.description" style="width: 80%; height: 150px"></textarea>
        </div>
        <div class="tab-pane" id="attributesTab">
            <table id="attributeDefsTable" class="table table-bordered table-striped" style="width: 100%">
                <thead>
                <tr>
                    <th style="width: 10px"></th>
                    <th style="width: 250px">Name</th>
                    <th style="text-align: center; width: 250px">Type</th>
                    <th style="text-align: center">Values</th>
                </tr>
                </thead>
                <tbody ui:sortable ng:model="model.attributeDefs">
                <tr ng-repeat="row in model.attributeDefs" >
                    <td style="width: 10px; text-align: center"><span class="btn btn-xs" ng-click="removeAttribute(row)"><i class="icon-trash"></i></span></td>
                    <td>
                        <ng-form name="attributeNameForm">
                            <input ng-model="row.name" name="attributeName" style="width: 100%" ng-required="true" attribute-uniquename/>
                            <div ng-show="attributeNameForm.attributeName.$dirty" style="font-weight: bold; color: red;">
                                <div ng-show="attributeNameForm.attributeName.$error.unique">Attribute name must be unique. </div>
                            </div>
                        </ng-form>
                    </td>
                    <td>
                        <select class="form-control" id="attributeType" name="type" ng-model="row.type" ng-required="true">
                            <option value="0" selected="selected" >Text</option>
                            <option value="1" >Numeric</option>
                            <option value="4" >Date</option>
                            <option value="3" >Option</option>
                        </select>
                    </td>
                    <td>
                        <div ng-show="row.type == '1'">
                            <label>Range</label> <input ng-model="row.numericLow" ng-disabled="row.type != '1'"/> <label>to</label> <input  ng-model="row.numericHigh" ng-disabled="row.type != '1'"/>
                        </div>
                        <div ng-show="row.type == '4'">
                            <label>From</label>
                            <p class="input-group">
                                <input type="text" class="form-control" datepicker-popup="{{format}}" ng-model="row.minDate" is-open="row.isStartDateOpen" min-date="minDate" max-date="'2015-06-22'" datepicker-options="dateOptions" date-disabled="disabled(date, mode)" ng-required="true" close-text="Close" />
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" ng-click="openStartDate($event, row)"><i class="glyphicon glyphicon-calendar"></i></button>
                                </span>
                            </p>
                            <label>- To -</label>
                            <p class="input-group">
                                <input type="text" class="form-control" datepicker-popup="{{format}}" ng-model="row.maxDate" is-open="row.isEndDateOpen" min-date="minDate" max-date="'2015-06-22'" datepicker-options="dateOptions" date-disabled="disabled(date, mode)" ng-required="true" close-text="Close" />
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" ng-click="openEndDate($event, row)"><i class="glyphicon glyphicon-calendar"></i></button>
                                </span>
                            </p>
                        </div>
                        <div ng-show="row.type == '3'">
                            <label>Options:</label>
                            <ul style="list-style:none;" ui:sortable ng:model="row.attributeOptions">
                                <li ng-repeat="option in row.attributeOptions">
                                    <span class="btn btn-xs" ng-click="removeOption(row, option)"><i class="icon-trash "></i></span> <span>{{option.value}}</span>
                                </li>
                            </ul>
                            <input type="text" ng-model="newOption" />   <input type="button" value="Add" class="btn btn-primary btn-sm" ng-click="addOption(row, newOption)">
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <input type="button" value="Add Attribute" class="btn btn-primary" ng-click="addAttribute()" style="float:right"/>
        </div>
        <div class="tab-pane" id="classificationsTab">
            <table id="classificationsTable" class="table table-bordered table-striped" style="width: 100%">
                <thead>
                <tr>
                    <th style="width: 10px"></th>
                    <th style="width: 250px">Name</th>
                    <th style="text-align: center; width: 250px">Color</th>
                    <th style="text-align: center">Attributes</th>
                </tr>
                </thead>
                <tbody ui:sortable ng:model="model.classDefs">
                <tr ng-repeat="classification in model.classDefs">
                    <td style="width: 10px; text-align: center"><span class="btn btn-xs" ng-click="removeClassification(classification)"><i class="icon-trash"></i></span></td>
                    <td>
                        <ng-form name="classificationNameForm">
                            <input ng-model="classification.name" ng-required="true" name="classificationName" background-color="{{classification.color}}" style="width: 100%" classification-uniquename/>
                            <div ng-show="classificationNameForm.classificationName.$dirty" style="font-weight: bold; color: red;">
                                <div ng-show="classificationNameForm.classificationName.$error.unique">Classification name must be unique. </div>
                            </div>
                        </ng-form>
                    </td>
                    <td><pick-a-color id="inputColor" ng-model="classification.color" inline-dropdown="true"></pick-a-color>
                    </td>
                    <td><label>Selected:</label><br/>
                        <table class="table table-striped table-bordered">
                            <tbody ui:sortable ng:model="classification.attributeDefs">
                            <tr ng-repeat="row in classification.attributeDefs">
                                <td><span class="btn btn-xs" ng-click="removeAttributeToClassification(classification, row)"><i class="icon-minus"></i></span> {{row.name}}</td>
                            </tr>
                            </tbody>
                        </table>
                        <br/><br/>
                        <label>Available:</label><br/>
                        <table class="table table-striped table-bordered">
                            <tbody>
                            <tr ng-repeat="row in model.attributeDefs">
                                <td><span class="btn btn-xs" ng-click="addAttributeToClassification(classification, row)"><i class="icon-plus"></i></span> {{row.name}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
            <input type="button" value="Add Classification" class="btn btn-primary" ng-click="addClassification()"  style="float:right"/>
        </div>
    </div>

    <br/><br/><br/>
    <input type="button" value="Save" class="btn btn-primary" ng-click="save()"  style="float:right"/>
</div>
<script>
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
</script>
</body>
</html>