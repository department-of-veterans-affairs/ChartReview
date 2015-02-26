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
        id: generateUUID(),
        name : "",
        description : "",
        attributeDefs : [  ],
        classDefs : [ ],
        xml: null
    }


    $scope.init =  function (guid, projectId) {
        $scope.model.name = "Loading...";
        $scope.model.description = "Loading...";
        $http.get("/chart-review/annotationSchema/getSchema/" + guid + "?projectId=" + projectId ).then(function(response) {
            parseXml(response.data, $scope.model);
            $scope.$apply();
        });
    }


	$scope.newOption = "";
	
	/** Controller Actions. **/	
	$scope.addAttribute = function() {
		$scope.model.attributeDefs.push({id: generateUUID(), name:'', type: "0", numericLow: 0, numericHigh: 0, attributeOptions: [], minDate: "", maxDate: "", isStartDateOpen: false, isEndDateOpen: false});
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
        $scope.model.xml =createXml($scope.model);
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

    // Load Attributes
    var attributeDefs = [];
    $xml.find("attributeDef").each(function() {
            var attributeDef = {
                id: $(this).attr("id"),
                name: $(this).find("name:first").text(),
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
                var attributeOption = { id: $(this).attr("id"), value: $(this).find("name").text()};
                if ($(this).attr("id")) {
                    attributeOptions.push(attributeOption);
                }
            })

            attributeDef.attributeOptions = attributeOptions;

            if ($(this).attr("id")) {
                attributeDefs.push(attributeDef);
            }
    });

    model.attributeDefs = attributeDefs;

    // Classdefs
    var classDefs = [];
    $xml.find("classDefs").each(function() {
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
            if ($(this).attr("id")) {
                classAttributes.push(findById($(this).attr("id"), attributeDefs));
            }
        })

        classDef.attributeDefs = classAttributes;
        if ($(this).attr("id")) {
            classDefs.push(classDef);
        }
    });

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
    for (var i = 0; i < arrayLength; i++) {
        var attribute =model.attributeDefs[i];
        xml += "<attributeDef id=\""  + attribute.id + "\" type=\"" + attribute.type+ "\">";
        xml += "<name><![CDATA[" + attribute.name + "]]></name>";
        xml += "<color>ffffff</color>";
        if (!attribute.numericLow || 0 === attribute.numericLow) {
            xml += "<numericLow>0.0</numericLow>";
        } else {
            xml += "<numericLow>" + attribute.numericLow + "</numericLow>";
        }
        if (!attribute.numericHigh || 0 === attribute.numericHigh) {
            xml += "<numericHigh>9.99999999999999E11</numericHigh>";
        } else {
            xml += "<numericHigh>" + attribute.numericHigh + "</numericHigh>";
        }

        if (!attribute.minDate || 0 === attribute.minDate) {
            xml += "<minDate>0000-12-30T07:00:00Z</minDate>";
        } else {
            xml += "<minDate>" +  attribute.minDate.getFullYear() + "-" + ("0" + (attribute.minDate.getMonth() + 1)).slice(-2) + "-" + ("0" + attribute.minDate.getDate()).slice(-2)  + "T07:00:00Z</minDate>";
        }

        if (!attribute.maxDate || 0 === attribute.maxDate) {
            xml += "<maxDate>9999-01-01T07:00:00</maxDate>";
        } else {
            xml += "<maxDate>" +  attribute.maxDate.getFullYear() + "-" + ("0" + (attribute.maxDate.getMonth() + 1)).slice(-2) + "-" + ("0" + attribute.maxDate.getDate()).slice(-2) + "T07:00:00Z</maxDate>";
        }
        xml += "<attributeDefOptionDefs>";

        // Serialize options
        var optionsLength = attribute.attributeOptions.length;
        for (var j = 0; j < optionsLength; j++) {
            var option =attribute.attributeOptions[j];
            xml += "<attributeDefOptionDef id=\"" + option.id + "\"><name><![CDATA[" + option.value + "]]></name></attributeDefOptionDef>";
        }
        xml += "</attributeDefOptionDefs>";
        xml += "</attributeDef>";

        // Add to attributeDefSortOrdersXml
        var orderGuid = generateUUID();

    }
    xml += "</attributeDefs>";

    // Handle Class defs.
    xml += "<classDefs>";
    arrayLength = model.classDefs.length;
    for (var i = 0; i < arrayLength; i++) {
        var classDef = model.classDefs[i];
        xml +="<classDef id=\"" + classDef.id + "\"><name><![CDATA[" + classDef.name + "]]></name><color>" + classDef.color + "</color>";
        xml += "<attributeDefIds>";
        var attributeCount = classDef.attributeDefs.length;
        for (var j =0; j < attributeCount; j++) {
            xml += "<attributeDefId id=\"" + classDef.attributeDefs[j].id + "\"/>";
        }

        xml+= "</attributeDefIds>";
        xml+= "<classDefIds/>"; // Currently no classdef relationships
        xml+= "</classDef>";
    }
    xml += "</classDefs>";
    xml += "<classRelDefs/>"; // Currently no relationships are implemented.

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