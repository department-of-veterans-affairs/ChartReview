var app = angular.module('schemaApp', ['ui.bootstrap', 'ui.sortable', 'pickAColor']);

app.directive('backgroundColor', function(){
    return function(scope, element, attrs){
        attrs.$observe('backgroundColor', function(value) {
            element.css({
                'background-color':  "#" + value
            });
        });
    };
});

app.controller('SchemaController', ['$scope', function($scope) {
    var initInjector = angular.injector(["ng", 'schemaApp']);
    var $http = initInjector.get("$http");


    /** Model Object **/
    $scope.model = {
        id: null,
        name : "Loading....",
        description : "Loading...",
        attributeDefs : [  ],
        classDefs : [ ]
    }


    $scope.init =  function (guid) {
        $http.get("/chart-review/schema/getSchema/" + guid ).then(function(response) {
            parseXml(response.data, $scope.model);
            $scope.$apply();
        });
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

	$scope.classificationColorStyle = function(classificationColor) {
		return  { 'background-color' : classificationColor };
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

function parseXml(xmlString, model) {
    xmlDoc = $.parseXML( xmlString );
    $xml = $(xmlDoc);

    // Top Level Model Object
    model.id= $xml.find("annotationSchema > id").text();
    model.name= $xml.find("annotationSchema > name").text();
    model.description= $xml.find("annotationSchema > description").text();
    model.attributeDefs.length = 0;
    model.classDefs.length = 0;

    /**
     * Get Sort order first, so we know what order to load items.
     */
    var annotationSchemaAttributeDefSortOrders = []
    $xml.find("annotationSchemaAttributeDefSortOrder").each(function() {
        annotationSchemaAttributeDefSortOrders.push( {
                objId: $(this).find("objId").text(),
                sortOrder: $(this).find("sortOrder").text() }
        );
    });
    annotationSchemaAttributeDefSortOrders.sort(function(a,b) {
        if ( a.sortOrder > b.sortOrder){
            return 1;
        }
        if (a.sortOrder < b.sortOrder) {
            return -1;
        }
        return 0;
    });

    var classDefSortOrders = []
    $xml.find("annotationSchemaClassDefSortOrder").each(function() {
        classDefSortOrders.push( {
                objId: $(this).find("objId").text(),
                sortOrder: $(this).find("sortOrder").text() }
        );
    });
    classDefSortOrders.sort(function(a,b) {
        if ( a.sortOrder > b.sortOrder){
            return 1;
        }
        if (a.sortOrder < b.sortOrder) {
            return -1;
        }
        return 0;
    });
    /**
     * End Getting sort orders.
     */


    // Load Atributes
    var attributeDefs = [];
    var attributeLength = annotationSchemaAttributeDefSortOrders.length;
    for (var i=0; i < attributeLength ; i++) {
        var guid = annotationSchemaAttributeDefSortOrders[i].objId;
        $xml.find("attributeDef[id='" +  guid + "']").each(function() {
                var attributeDef = {
                    id: $(this).attr("id"),
                    name: $(this).find("name").text(),
                    type: $(this).attr("type"),
                    numericLow: $(this).find("numericLow").text(),
                    numericHigh: $(this).find("numericHigh").text(),
                    attributeOptions: null,
                    minDate: $(this).find("minDate").text(),
                    maxDate: $(this).find("maxDate").text(),
                    isStartDateOpen: false,
                    isEndDateOpen: false
                }

                var attributeOptions = [];
                $(this).find("attributeDefOptionDef").each(function() {
                    var attributeOption = { id: $(this).attr("id"), value: $(this).text()};
                    attributeOptions.push(attributeOption);

                })

                attributeDef.attributeOptions = attributeOptions;

                attributeDefs.push(attributeDef);
            }
        )
    }
    model.attributeDefs = attributeDefs;

    // Classdefs
    var classDefs = [];
    attributeLength = classDefSortOrders.length;
    for (var i=0; i < attributeLength ; i++) {
        var guid = classDefSortOrders[i].objId;
        $xml.find("classDef[id='" + guid + "']").each(function() {
            var classDef = {
                id:  $(this).attr("id"),
                name: $(this).find("name").text(),
                color: $(this).find("color").text(),
                attributeDefs: null
            };
            classDef.name.$dirty = true;
            var classAttributes = [];
            $(this).find("attributeDefId").each(function() {
                var attributeOption = { id: $(this).attr("id"), value: $(this).text()};
                classAttributes.push(findById($(this).attr("id"), attributeDefs));
            })

            classDef.attributeDefs = classAttributes;
            classDefs.push(classDef);
        })
    }
    model.classDefs = classDefs;


    return model;
}

function findById(id, arrayOfObjects) {
    var arrayLength = arrayOfObjects.length;
    for (var i = 0; i < arrayLength; i++) {
        if (arrayOfObjects[i].id == id) {
            return arrayOfObjects[i];
        }
    }
    return null;
}



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