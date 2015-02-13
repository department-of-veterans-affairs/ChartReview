var app = angular.module('schemaApp', ['ui.bootstrap', 'ui.sortable', 'pickAColor']);

app.controller('SchemaController', ['$scope', function($scope) {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");

    $scope.init =  function (myId) {
        $http.get("/chart-review/schema/getSchema/" + myId ).then(function(response) {
            alert(response.data);
        });
    }

	/** Model Object **/
	$scope.model = {
        id: "testGuid",
		name : "Example",
		description : "Hard coded example",
        attributeDefs : [
			{
                id: "attributeGuid1", name:'My First Attribute', type: "1", numericLow: 0, numericHigh: 0,
                attributeOptions: [
                    {id: "aoid1", value: "a"},
                    {id: "aoid2", value: "b"},
                    {id: "aoid3", value: "c"}
                    ],
                minDate: "", maxDate: "", isStartDateOpen: false, isEndDateOpen: false
            },
			{
                id: "attributeGuid2", name:'My Second Attribute', type: "3", numericLow: 0, numericHigh: 0,
                attributeOptions: [
                    {id: "aoid4", value: "a"},
                    {id: "aoid5", value: "b"},
                    {id: "aoid6", value: "c"}
                    ],
                minDate: "", maxDate: "", isStartDateOpen: false, isEndDateOpen: false
            }
			],
        classDefs : [
			{id: "classfuid1", name: "My Classification", color: "#FFFFFF", attributeDefs: []}
		 ]
	}
	
	$scope.newOption = "";
	
	/** Controller Actions. **/	
	$scope.addAttribute = function() {
		$scope.model.attributeDefs.push({name:'', type: "0", numericLow: 0, numericHigh: 0, attributeOptions: [], minDate: "", maxDate: "", isStartDateOpen: false, isEndDateOpen: false});
	}
	$scope.removeAttribute = function(row) {
		var index = $scope.model.attributeDefs.indexOf(row)
  		$scope.model.attributeDefs.splice(index, 1);
		
		var arrayLength = $scope.model.classDefs.length;
		for (var i = 0; i < arrayLength; i++) {
			var classification = $scope.model.classDefs[i];
			var index = classification.attributeDefs.indexOf(row);
			classification.attributeDefs.splice(index, 1);
		}
		
	}
	
	$scope.classificationColorStyle = function(classification) {
		return  { 'background-color' : classification.color };	
	}
	
	$scope.addOption = function(row, newOption) {
		row.attributeOptions.push({id: generateUUID(), value: newOption});
	}
	
	$scope.removeOption = function(row, option) {
		var index = row.attributeOptions.indexOf(option)
  		row.attributeOptions.splice(index, 1);   
	}
	
	$scope.addClassification = function() {
		$scope.model.classDefs.push({id: generateUUID(), name:'', color: '', attributeDefs: []});
	}
	
	$scope.removeClassification = function(row) {
		var index = $scope.model.classDefs.indexOf(row)
  		$scope.model.classDefs.splice(index, 1);
	}
	
	$scope.addAttributeToClassification = function(classification, attribute) {
		var index = classification.attributeDefs.indexOf(attribute)
		if (index == -1) 
			classification.attributeDefs.push(attribute);
	}
	
	$scope.removeAttributeToClassification = function(classification, attribute) {
		var index = classification.attributeDefs.indexOf(attribute)
  		classification.attributeDefs.splice(index, 1);
	}
	
	$scope.save = function() {


		alert("Data=" + createXml($scope.model));
	}
	
	$scope.openStartDate = function($event, row) {
		$event.preventDefault();
		$event.stopPropagation();
	  
		row.isStartDateOpen = true;
	};
	
	$scope.openEndDate = function($event, row) {
		$event.preventDefault();
		$event.stopPropagation();
	  
		row.isEndDateOpen = true;
	};

}]);

app.directive('attributeUniquename', function(){
    return {
        restrict:'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModelCtrl){
            ngModelCtrl.$validators.uniqueAttributeName= function(value){
                var arrayLength = scope.model.attributeDefs.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (scope.model.attributeDefs[i].name === value)
                    {
                        ngModelCtrl.$setValidity('unique', false);
                        return false;
                    }
                }
                ngModelCtrl.$setValidity('unique', true);
                return true
            };

        }
    };
});

app.directive('classificationUniquename', function(){
    return {
        restrict:'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModelCtrl){
            ngModelCtrl.$validators.uniqueAttributeName= function(value){
                var arrayLength = scope.model.classDefs.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (scope.model.classDefs[i].name === value)
                    {
                        ngModelCtrl.$setValidity('unique', false);
                        return false;
                    }
                }
                ngModelCtrl.$setValidity('unique', true);
                return true
            };

        }
    };
});

function createXml(model) {
    var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<annotationSchemas>\n<annotationSchema id=\"" + model.id + "\">\n";
    xml += "<id>" + model.id + "</id>";
    xml += "<name><![CDATA[" + model.name + "]]></name>";
    xml += "<description><![CDATA[" + model.description + "]]></description>";
    xml += "<attributeDefs>";

    // Handle attributes.
    var arrayLength = model.attributeDefs.length;
    var attributeDefSortOrdersXml = "<attributeDefSortOrders>";attributeDefSortOrdersXml = "<attributeDefSortOrders>";
    for (var i = 0; i < arrayLength; i++) {
        var attribute =model.attributeDefs[i];
        xml += "<attributeDef id=\""  + attribute.id + "\" type=\"" + attribute.type+ "\">";
        xml += "<name><![CDATA[" + attribute.name + "]]></name>";
        xml += "<color>ffffff</color>";
        xml += "<numericLow>" + attribute.numericLow + "</numericLow>";
        xml += "<numericHigh>" + attribute.numericHigh + "</numericHigh>";
        xml += "<minDate>" + attribute.minDate + "</minDate>";
        xml += "<maxDate>" + attribute.maxDate + "</maxDate>";
        xml += "<attributeDefOptionDefs>";

        // Serialize options
        var optionsLength = attribute.attributeOptions.length;
        for (var j = 0; i < optionsLength; i++) {
            var option =attribute.attributeOptions[j];
            xml += "<attributeDefOptionDef id=\"" + option.id + "\"><![CDATA[" + option.value + "]]</attributeDefOptionDef>";
        }
        xml += "</attributeDefOptionDefs>";
        xml += "</attributeDef>";

        // Add to attributeDefSortOrdersXml
        var orderGuid = generateUUID();
        attributeDefSortOrdersXml += "<annotationSchemaAttributeDefSortOrder id=\"" + orderGuid + "\">";
        attributeDefSortOrdersXml += "<id>" + orderGuid + "</id><annotationSchema ref=\"../..\"/><objId>" + attribute.id + "</objId><sortOrder>" + i + "</sortOrder></annotationSchemaAttributeDefSortOrder>";
    }
    attributeDefSortOrdersXml += "</attributeDefSortOrders>";
    xml += "</attributeDefs>";

    // Handle Class defs.
    xml += "<classDefs>";
    var classDefSortOrdersXml = "<classDefSortOrders>";
    arrayLength = model.classDefs.length;
    for (var i = 0; i < arrayLength; i++) {
        var classDef = model.classDefs[i];
        xml +="<classDef id=\"" + classDef.id + "\"><name><![CDATA[" + classDef.name + "]]</name><color>" + classDef.color + "</color>";
        xml += "<attributeDefIds>";
        var attributeCount = classDef.attributeDefs.length;
        for (var j =0; j < attributeCount; j++) {
            xml += "<attributeDefId id=\"" + classDef.attributeDefs[j].id + "\"/>";
        }

        xml+= "</attributeDefIds>";
        xml+= "<classDefIds/>"; // Currently no classdef relationships
        xml+= "</classDef>";

        var orderGuid = generateUUID();
        classDefSortOrdersXml += "<annotationSchemaClassDefSortOrder id=\"" + orderGuid + "\"><id>" + orderGuid + "</id><annotationSchema ref=\"../..\"/>";
        classDefSortOrdersXml += "<objId>" + classDef.id + "</objId><sortOrder>" + i + "</sortOrder></annotationSchemaClassDefSortOrder>";
    }
    classDefSortOrdersXml += "</classDefSortOrders>";
    xml += "</classDefs>";
    xml += "<classRelDefs/>"; // Currently no relationships are implemented.

    xml += attributeDefSortOrdersXml;
    xml += classDefSortOrdersXml;
    xml += "</annotationSchema>\n";
    xml += "</annotationSchemas>";
    return xml;
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};