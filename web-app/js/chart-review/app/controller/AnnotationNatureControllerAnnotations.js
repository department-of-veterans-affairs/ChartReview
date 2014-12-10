/**
 * A class to hold all static annotation methods that are part of the annotation nature controller.
 */
Ext.define('CR.app.controller.AnnotationNatureControllerAnnotations', {
	statics:
	{
        /**
         * Provides a central place to define and create an annotation.  This may be called to create annotations
         * provided as pre-annotations from the server, or as users create annotations for clinical elements at any level.
         * Note that some annotation may not have spans, if they are annotating a whole clinical element, for example.
         * @param id
         * @param clinicalElementId
         * @param schemaId
         * @param schemaElement
         * @param creationDate
         * @param clinicalElementConfigurationId
         * @param spans
         * @param features
         * @param isNew
         * @returns {{id: *, clinicalElementId: *, schemaId: *, creationDate: *, clinicalElementConfigurationId: *, spans: *, features: *, isNew: *}}
         */
        createAnnotation: function(
            id,
            clinicalElementId,
            schemaId,
            schemaElement,
            creationDate,
            clinicalElementConfigurationId,
            spans,
            features,
            isNew)
        {
            var annotation = {
                'id':id,
                'clinicalElementId':clinicalElementId,
                'schemaId':schemaId,
                'creationDate':creationDate,
                'clinicalElementConfigurationId':clinicalElementConfigurationId,
                'spans':spans,
                'features':features,
                'isNew':isNew
            };
            var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId];
            if(clinicalElement)
            {
                annotation.clinicalElementDate = new Date(clinicalElement.dateAssigned);
            }
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(clinicalElementConfigurationId);
            if(clinicalElementConfiguration)
            {
                annotation.clinicalElementName = clinicalElementConfiguration.text;
            }

            if(schemaElement)
            {
                // Cache for speed and convenience - could get by lookup to schemaElements with schemaRefId...
                annotation.schemaRefId = schemaElement.id;
                annotation.schemaRefUri = schemaElement.schemaRefUri;
                annotation.schemaRefName = schemaElement.name;
                annotation.color = CR.app.view.AnnotationSchemaPanel.convertToPoundSpecification(schemaElement.color);
            }
            CR.app.controller.AnnotationNatureControllerAnnotations.addFeatureAttributes(annotation);
            return annotation;
        },

        /**
         * This is a general purpose annotation compare method.  Returns true if the given annotations are effectively the same annotation.
         * @param annotation1
         * @param annotation2
         * @returns {boolean}
         */
        getIsSameAnnotation: function(annotation1, annotation2)
        {
            var isSame = false;
            if(annotation1.isNew && annotation2.isNew)
            {
                if(annotation1.clinicalElementDate == annotation2.clinicalElementDate &&
                    annotation1.clinicalElementName == annotation2.clinicalElementName &&
                    annotation1.creationDate == annotation2.creationDate &&
                    annotation1.schemaRefId == annotation2.schemaRefId &&
                    annotation1.spans == annotation2.spans &&
                    annotation1.features == annotation2.features)
                {
                    isSame = true;
                }
            }
            else if(annotation1.id == annotation2.id)
            {
                isSame = true;
            }
            return isSame;
        },

        /**
         * This is a general purpose object comparison method.
         * @param obj1
         * @param obj2
         * @returns {boolean}
         */
        isObjectEqual: function(obj1, obj2)
        {
            var isEqual = false;
            var sortArrays = true;
            function sort(object) {
                if (sortArrays === true && Array.isArray(object)) {
                    return object.sort();
                }
                else if (typeof object !== "object" || object === null) {
                    return object;
                }

                return Object.keys(object).sort().map(function(key) {
                    return {
                        key: key,
                        value: sort(object[key])
                    };
                });
            }

            var obj2Str = CR.app.controller.AnnotationNatureControllerAnnotations.stringifyOnce(sort(obj2), "[[DUP]]", true);
            var obj1Str = CR.app.controller.AnnotationNatureControllerAnnotations.stringifyOnce(sort(obj1), "[[DUP]]", true);
            isEqual = obj1Str === obj2Str;
            return isEqual;
        },

        /**
         * Creates a string from an object to use in object comparison or other tasks.
         * @param obj
         * @param replacer
         * @param indent
         * @returns {*}
         */
        stringifyOnce: function (obj, replacer, indent){
            var printedObjects = [];
            var printedObjectKeys = [];

            return JSON.stringify(obj, replacer, indent);
        },

        /**
         * Loads all of the annotations for the current task.  NOTE:  The server controls whether the annotations received
         * are pre-annotations, or annotations created already for this task.  The UI does not need to know about that
         * concept anymore.
         * @param clinicalElement
         */
		loadAnnotationsForTask: function(principalClinicalElement)
		{
			var nstore = Ext.create('CR.app.store.AnnotationStore');
			nstore.principalClinicalElement = principalClinicalElement;
			nstore.proxy.timeout = 100000000;
			nstore.proxy.url = 'annotation/getAnnotations?clinicalElementId='+principalClinicalElement.id+'&taskId='+principalClinicalElement.taskId;
	    	CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading Annotations...");
			nstore.load({
				callback: function(records, operation, success)
				{
                    // Unblock here because at the end, it does not unblock...TBD
                    CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Annotations...");
                    if(records != null)
                    {
                        var tAnnotationsById = [];
                        var tClinicalElementIdsById = [];
                        // Set records in AnnotationAware and fire any events that need to be fired to refresh the annotation list and rendered annotations on any visible clinicalElements.
                        for(i=0;i<records.length;i++)
                        {
                            var annotation = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationFromXMLNode(records[i].raw, this.principalClinicalElement);
                            var tAnnotations = CR.app.controller.AnnotationNatureController.annotationsById[annotation.clinicalElementId];
                            if(!tAnnotations)
                            {
                                tAnnotations = [];
                            }
                            tAnnotations.push(annotation);
                            CR.app.controller.AnnotationNatureController.annotationsById[annotation.clinicalElementId] = tAnnotations;

                            var clinicalElementId = annotation.clinicalElementId;

                            // Ensure that the context clinical element exists if it does not already.
                            var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId];
                            if(!clinicalElement)
                            {
                                var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(annotation.clinicalElementConfigurationId);
                                clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElementFromPrincipalClinicalElement(clinicalElementId, clinicalElementConfiguration.dataIndex, clinicalElementConfiguration.text, this.principalClinicalElement);
                                CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId] = clinicalElement;
                            }
                        }
                    }
                    // TBD - Lets assume that all of the clinical elements whose annotations have been loaded
                    // are existing in the filtered lists of clinical elements already fetched.
//					CR.app.controller.AnnotationNatureController.ensureClinicalElementsAreLoaded(this.clinicalElement, tClinicalElementIdsById);
                    CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('principalClinicalElementLoaded');
                    CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Annotations...");
				},
				failure: function() {
	                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Annotations...");
                    alert('Failed to load annotations.');
				}
			});
		},

        /**
         * See header for ensureClinicalElementsAreLoaded.  SAVE THIS CONCEPT.
         * Loads annotations for context clinical elements that have not yet been loaded.
         * @param clinicalElement
         */
		loadAnnotationsForContextClinicalElement: function(clinicalElement)
		{
			if(clinicalElement)
			{
				var nstore = Ext.create('CR.app.store.AnnotationStore');
				nstore.proxy.timeout = 100000000;
				nstore.clinicalElement = clinicalElement;
                nstore.proxy.url = 'annotation/getAnnotations?clinicalElementId='+clinicalElement.id+'&taskId='+clinicalElement.taskId;
		    	CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading Context ClinicalElement Annotations...");
				nstore.load({
					callback: function(records, operation, success)
					{
						if(records != null)
						{
							var annotations = [];
							// Set records in AnnotationAware and fire any events that need to be fired to refresh the annotation list and rendered annotations on any visible clinicalElements.
							for(i=0;i<records.length;i++)
							{
								annotations.push(CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationFromXMLNode(records[i].raw, this.clinicalElement));
							}
							CR.app.controller.AnnotationNatureController.annotationsById[this.clinicalElement.id] = annotations;
							CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationschanged');
						}
		                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Context ClinicalElement Annotations...");
					},
					failure: function() {
		                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Fail Loading Context ClinicalElement Annotations...");
					}
				});
			}				
		},
		
		/**
		 * Parses the given annotation node and returns an annotation.  TBD - doesn't handle recursive features yet.
         * @param annotationNode
         * @param clinicalElement
         * @returns {{id: *, clinicalElementId: *, schemaId: *, creationDate: *, clinicalElementConfigurationId: *, spans: *, features: *, isNew: *}}
         */
		getAnnotationFromXMLNode: function(annotationNode, clinicalElement)
		{
            var annotationId = annotationNode.getAttributeNode('id').value;
            var annotationSchemaElement = annotationNode.getElementsByTagName('schema')[0];
            var annotationSchemaId = annotationSchemaElement.getAttributeNode('id').value;
            var annotationSchemaRefElement = annotationNode.getElementsByTagName('schemaRef')[0];
            var annotationSchemaRefId = annotationSchemaRefElement.getAttributeNode('id').value;
            var annotationSchemaRefUri = annotationSchemaRefElement.getAttributeNode('uri').value;
            var annotationCreationDate = CR.app.controller.AnnotationNatureControllerText.getTextValue(annotationNode.getElementsByTagName('creationDate')[0]);
            var annotationClinicalElementConfigurationElement = annotationNode.getElementsByTagName('clinicalElementConfiguration')[0];
            var annotationClinicalElementConfigurationId = annotationClinicalElementConfigurationElement.getAttributeNode('id').value;
            var annotationClinicalElement = annotationNode.getElementsByTagName('clinicalElement')[0];
            var annotationClinicalElementId = annotationClinicalElement.getAttributeNode('id').value;
            var spansNode = annotationNode.getElementsByTagName('spans')[0];
            var featuresNode = annotationNode.getElementsByTagName('features')[0];

            var spans = [];
            for(j=0;j<annotationNode.getElementsByTagName('span').length;j++)
            {
                var spanNode = annotationNode.getElementsByTagName('span')[j];
                var clinicalElementFieldElement = spanNode.getElementsByTagName('clinicalElementField')[0];
                var escapedSpanText = CR.app.controller.AnnotationNatureControllerText.getTextValue(spanNode.getElementsByTagName('text')[0]);
                var unescapedSpanText = CR.app.controller.AnnotationNatureControllerText.doUnescapeHtml(escapedSpanText);
                spans.push({
                    'textStart':CR.app.controller.AnnotationNatureControllerText.getTextValue(spanNode.getElementsByTagName('startOffset')[0]),
                    'textStop':CR.app.controller.AnnotationNatureControllerText.getTextValue(spanNode.getElementsByTagName('endOffset')[0]),
                    'filter':clinicalElementFieldElement.getAttributeNode('id').value,
                    'text':unescapedSpanText
                });
            }
            var features = [];
            for(j=0;j<annotationNode.getElementsByTagName('feature').length;j++)
            {
                var featureNode = annotationNode.getElementsByTagName('feature')[j];
                var names = featureNode.getElementsByTagName('name');
                var schemaRefs = featureNode.getElementsByTagName('schemaRef');
                if(names.length > 0 && schemaRefs.length > 0)
                {
                    var schemaRef1 = schemaRefs[0];
                    var feature = {
                        'name':CR.app.controller.AnnotationNatureControllerText.getTextValue(names[0]),
                        'type':featureNode.getAttributeNode('type').value,
                        'schemaRefUri':schemaRef1.getAttributeNode('uri').value
                    }
                    var elementsNode = featureNode.getElementsByTagName('elements')[0];
                    if(elementsNode && elementsNode.tagName=='elements')
                    {
                        var featureElements = [];
                        for(k=0;k<elementsNode.getElementsByTagName('element').length;k++)
                        {
                            var elementNode = elementsNode.getElementsByTagName('element')[k];
                            var schemaRef2 = elementNode.getElementsByTagName('schemaRef')[0];
                            if(schemaRef2 != null && schemaRef2.tagName=='schemaRef')
                            {
                                var escapedElementValue = CR.app.controller.AnnotationNatureControllerText.getTextValue(featureNode.getElementsByTagName('value')[0]);
                                var unescapedElementValue = CR.app.controller.AnnotationNatureControllerText.doUnescapeHtml(escapedElementValue);
                                featureElements.push({
                                    'schemaRefUri':schemaRef2.getAttributeNode('uri').value,
                                    'value':unescapedElementValue
                                });
                            }
                            else
                            {
                                var escapedElementValue = CR.app.controller.AnnotationNatureControllerText.getTextValue(featureNode.getElementsByTagName('value')[0]);
                                if(escapedElementValue[0]=="A")
                                {
                                    var p = 0;
                                }
                                var unescapedElementValue = CR.app.controller.AnnotationNatureControllerText.doUnescapeHtml(escapedElementValue);
                                featureElements.push({
                                    'value':unescapedElementValue
                                });
                            }
                        }
                        feature.elements = featureElements;
                    }
                }
                // TBD handle features recursively here in the future.
                features.push(feature);
            }

			var schemaRefId = CR.app.controller.AnnotationNatureControllerAnnotations.getSchemaRefIdFromSchemaURI(annotationSchemaRefUri);
			var schemaElement = CR.app.controller.AnnotationNatureController.schemaElements[schemaRefId];
			if(!schemaElement)
			{
				console.log('AnnotationSchema element could not be found for ID: '+schemaRefId);
			}

			var annotation = CR.app.controller.AnnotationNatureControllerAnnotations.createAnnotation(
                annotationId, // id
                annotationClinicalElementId, // clinicalElementId
                annotationSchemaId, // schemaId
                schemaElement, // schemaElement
                annotationCreationDate, //creationDate
                annotationClinicalElementConfigurationId, //clinicalElementConfigurationId
                spans, // spans
                features, // features
                false) // isNew

			return annotation;
		},

        /**
         * Parses the given schemaURI for the schema ref id and returns it.
         * @param schemaURI
         * @returns {*}
         */
		getSchemaRefIdFromSchemaURI: function(schemaURI)
		{
			var schemaRefId = schemaURI;
			while(schemaRefId.indexOf(':')>-1)
			{
				schemaRefId = schemaRefId.substring(schemaRefId.indexOf(':')+1);
			}
			return schemaRefId;
		},

        /**
         * We want to see features as annotation attributes in an annotation list grid.
         * Adds annotation features as annotation attributes so that they can be seen in the annotation list grid as columns.
         * @param annotation
         */
        addFeatureAttributes: function(annotation)
        {
            // Display all annotation feature attributes
            var attributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotation(annotation);
            for(key in attributes)
            {
                var attribute = attributes[key];
                annotation[attribute.name] = attribute.value;
            }
        },

        /**
         * NOTE: We do this separately because it causes a redraw of the annotation list and we only want to do this when
         * enter is pressed or on leaving a field, not on each key stroke.
         * @param attribute
         * @param value
         */
        updateFeatureAttributes: function(attribute, value)
        {
            if(typeof CR.app.controller.AnnotationNatureController.selectedAnnotation != "undefined" && CR.app.controller.AnnotationNatureController.selectedAnnotation != null)
            {
                var attrName = attribute.attributeDef.name.toLowerCase();
                var annotation = CR.app.controller.AnnotationNatureController.selectedAnnotation;
                annotation[attrName] = value;
                CR.app.controller.AnnotationNatureControllerAnnotations.addFeatureAttributes(CR.app.controller.AnnotationNatureController.selectedAnnotation);
            }
        },

        /**
         * Returns all of the attributes, including inherited attributes for the given class def.
         * @param classDef
         * @returns {*}
         */
        getAttributesForSelectedAnnotationForClassDef: function(classDef)
        {
            var attributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotationForClassDef(CR.app.controller.AnnotationNatureController.selectedAnnotation, classDef)
            return attributes;
        },

        /**
         * Returns all of the attributes, including inherited attributes for the given class def.
         * @param annotation
         * @param classDef
         * @returns {Array}
         */
        getAttributesForAnnotationForClassDef: function(annotation, classDef)
        {
            var attributes = [];
            if(annotation == null)
            {
                return attributes;
            }
            if(typeof classDef != "undefined" && classDef != null)
            {
                var classDefParent = CR.app.controller.AnnotationNatureController.getClassDefParent(classDef);
                if(typeof classDefParent != "undefined" && classDefParent != null)
                {
                    var tAttributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotationForClassDef(annotation, classDefParent);
                    for(key in tAttributes)
                    {
                        var tAttribute = tAttributes[key];
                        attributes.push(tAttribute);
                    }
                }
                for (key in classDef.attributeDefIds)
                {
                    var attributeDefId = classDef.attributeDefIds[key];
                    var attributeDef = CR.app.controller.AnnotationNatureController.schemaElements[attributeDefId];
                    var attribute = {};
                    attribute.attributeDef = attributeDef;
                    attribute.name = attributeDef.name;
                    if(typeof annotation.features != "undefined" && annotation.features != null)
                    {
                        for(key2 in annotation.features)
                        {
                            var tFeature = annotation.features[key2];
                            if(tFeature.name == attribute.attributeDef.name)
                            {
                                if(typeof tFeature.elements != "undefined" && tFeature.elements[0] != null)
                                {
                                    attribute.value = tFeature.elements[0].value;
                                    if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_NUMERIC || attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_OPTION)
                                    {
                                        attribute.isNumeric = true;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    attributes.push(attribute);
                }
            }
            return attributes;
        },

        /**
         * Returns all attributes for the selected annotation, including inherited attributes of it's class def.
         * @returns {*}
         */
        getAttributesForSelectedAnnotation: function()
        {
            var attributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotation(CR.app.controller.AnnotationNatureController.selectedAnnotation);
            return attributes;
        },

        /**
         * Returns all attributes for the given annotations, including inherited attributes of their class defs.
         * @param annotations
         * @returns {Array}
         */
        getAttributesForAnnotations: function(annotations)
        {
            var attributes = [];
            var classDefsProcessed = [];
            for(key in annotations)
            {
                var annotation = annotations[key];
                var classDef = CR.app.controller.AnnotationNatureController.schemaElements[annotation.schemaRefId];

                // Do not look for attributes of a class more than once.
                if(classDefsProcessed.indexOf(classDef) < 0)
                {
                    var tAttributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotationForClassDef(annotation, classDef);
                    classDefsProcessed.push(classDef);
                    for(key2 in tAttributes)
                    {
                        var tAttribute = tAttributes[key2];
                        if(attributes.indexOf(tAttribute) < 0)
                        {
                            attributes.push(tAttribute);
                        }
                    }
                }
            }
            return attributes;
        },

        /**
         * Returns all attributes for the given annotation, including inherited attributes of it's class def.
         * @returns {*}
         */
        getAttributesForAnnotation: function(annotation)
        {
            var attributes = [];
            if(typeof annotation != "undefined" && annotation != null)
            {
                var classDef = CR.app.controller.AnnotationNatureController.schemaElements[annotation.schemaRefId];
                var tAttributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotationForClassDef(annotation, classDef);
                for(key in tAttributes)
                {
                    var tAttribute = tAttributes[key];
                    if(attributes.indexOf(tAttribute) < 0)
                    {
                        attributes.push(tAttribute);
                    }
                }
            }
            return attributes;
        },

        /**
         * Updates the value of a feature (attribute) of the selected annotation.
         * @param attribute
         * @param value
         */
        updateAttributeFeatureForSelectedAnnotation: function(attribute, value)
        {
            var tempid = CR.app.controller.AnnotationNatureController.curTempId;
            if(typeof CR.app.controller.AnnotationNatureController.selectedAnnotation != "undefined" && CR.app.controller.AnnotationNatureController.selectedAnnotation != null)
            {
                // Only one attribute element per attribute feature in this UI for now,
                // although the annotation server can handle multiple attribute feature elements.
                var isNewFeature = false;
                var feature = CR.app.controller.AnnotationNatureControllerAnnotations.getSelectedAnnotationFeatureByName(attribute.attributeDef.name);
                if(feature == null)
                {
                    isNewFeature = true;
                    feature = {};
                }
                feature.name = attribute.attributeDef.name;
                feature.schemaRefTempid = tempid++; // A new reference object is created on the server for the schemaRefUri that will be sent.  This is the id of that new object.
                feature.schemaRefUri = attribute.attributeDef.schemaRefUri;
                if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE)
                {
                    feature.type = CR.app.controller.AnnotationNatureController.FEATURE_TYPE_ATTRIBUTE_DATE;
                }
                else if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_NUMERIC)
                {
                    feature.type = CR.app.controller.AnnotationNatureController.FEATURE_TYPE_ATTRIBUTE_NUMERIC;
                }
                else if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_OPTION)
                {
                    feature.type = CR.app.controller.AnnotationNatureController.FEATURE_TYPE_ATTRIBUTE_OPTION;
                }
                else
                {
                    feature.type = CR.app.controller.AnnotationNatureController.FEATURE_TYPE_ATTRIBUTE_TEXT; // Just use TEXT rather than FEATURE_TYPE_UNKNOWN here
                }

                var element = {};
                if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_OPTION)
                {
                    // Only options refrence something in the schema.  Text, Date and numeric do not.
                    element.schemaRefUri = attribute.attributeDef.schemaRefUri + ":attributeDefOptionDef:" + value;
                }
                element.value = value;

                var featureElements = [];
                featureElements.push(element);
                feature.elements = featureElements;

                if(isNewFeature)
                {
                    var features = [];
                    if(typeof CR.app.controller.AnnotationNatureController.selectedAnnotation.features != "undefined" && CR.app.controller.AnnotationNatureController.selectedAnnotation.features != null)
                    {
                        features = CR.app.controller.AnnotationNatureController.selectedAnnotation.features;
                    }
                    features.push(feature);

                    if(features.length > 0)
                    {
                        CR.app.controller.AnnotationNatureController.selectedAnnotation.features = features;
                    }
                }
                CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotation(CR.app.controller.AnnotationNatureController.selectedAnnotation.clinicalElementId, CR.app.controller.AnnotationNatureController.selectedAnnotation, false);
            }
            CR.app.controller.AnnotationNatureController.curTempId = tempid;
        },

        /**
         * Returns the feature, of the given name, of the selected annotation.
         * @param featureName
         * @returns {*}
         */
        getSelectedAnnotationFeatureByName: function(featureName)
        {
            var feature = null;
            if(typeof CR.app.controller.AnnotationNatureController.selectedAnnotation.features != "undefined" && CR.app.controller.AnnotationNatureController.selectedAnnotation.features != null)
            {
                for (key in CR.app.controller.AnnotationNatureController.selectedAnnotation.features)
                {
                    var tFeature = CR.app.controller.AnnotationNatureController.selectedAnnotation.features[key];
                    if(tFeature.name == featureName)
                    {
                        feature = tFeature;
                        break;
                    }
                }
            }
            return feature;
        },

        /**
         * Saves the given annotation in a list of annotations for the given clinical element id.
         * An annotationschanged event is optionally fired.
         * @param clinicalElementId
         * @param annotation
         * @param fireChangeEvent
         */
        updateAnnotation: function(clinicalElementId, annotation, fireChangeEvent)
        {
            var annotationSet = CR.app.controller.AnnotationNatureController.annotationsById[clinicalElementId];
            if(!annotationSet)
            {
                annotationSet = [];
                CR.app.controller.AnnotationNatureController.annotationsById[clinicalElementId] = annotationSet;
            }
            var itemIdx = annotationSet.indexOf(annotation);
            if(itemIdx < 0)
            {
                annotationSet.push(annotation);
            }
            CR.app.controller.AnnotationNatureController.annotationsById[clinicalElementId] = annotationSet;
            if(fireChangeEvent)
            {
                CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationschanged');
            }
        },

        /**
         * Return the annotations associated with the given clinical element id.
         * @param clinicalElementId
         * @returns {*}
         */
        getAnnotations: function(clinicalElementId)
        {
            var tAnnotations = CR.app.controller.AnnotationNatureController.annotationsById[clinicalElementId];
            return tAnnotations;
        },

        /**
         * Returns either all annotations (if the getShowAllAnnotationsForSelectedTask is true) or only the annotations
         * associated with the currently selected clinical elements found in each annotation aware component (may be multiple).
         * @returns {Array}
         */
        getAnnotationsForSelectedPrincipalClinicalElementByAnnotationFilterType: function()
        {
            // For all annotationAware components, get their clinicalElementID's (id's) and map them to their annotations.
            // Return all annotations.
            var annotations = [];
            var comps = Ext.ComponentQuery.query('itemlistdetail, itemsummarydetail');
            var showAllAnnotationsForSelectedTask = CR.app.controller.AnnotationNatureController.getShowAllAnnotationsForSelectedTask();
            for(key1 in CR.app.controller.AnnotationNatureController.annotationsById)
            {
                // For all of the annotations loaded for this principal clinical element (task)...
                var tAnnotations = CR.app.controller.AnnotationNatureController.annotationsById[key1];
                if(tAnnotations)
                {
                    for(i = 0; i < tAnnotations.length; i++)
                    {
                        var tAnnotation = tAnnotations[i];
                        var show = false;
                        if(showAllAnnotationsForSelectedTask && tAnnotation.principalClinicalElementId == CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id)
                        {
                            // If we are showing all annotations for the selected task, add them all to the list, whether or not it they have a clinical element view.
                            show = true;
                        }
                        else
                        {
                            // Otherwise only show the annotations for the selected task that belong to the clinical element selected in each of the clinical element view components, or other
                            // annotation aware components.
                            for(key2 in comps)
                            {
                                var comp = comps[key2];
                                if(tAnnotation.clinicalElementId == comp.clinicalElementId || showAllAnnotationsForSelectedTask)
                                {
                                    show = true;
                                    break;
                                }
                            }
                        }
                        if(show)
                        {
                            // Check to see if it is already in the list.
                            var found = false;
                            for(j = 0; j < annotations.length; j++)
                            {
                                var annotation = annotations[j];
                                if(CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(annotation, tAnnotation))
                                {
                                    found = true;
                                    break;
                                }
                            }
                            // Add the annotation only once.
                            if(!found)
                            {
                                annotations.push(tAnnotation);
                            }
                        }
                    }
                }
            }
            return annotations;
        },

        /**
         * Load the pre-annotations for each principal clinical element (task) loaded - one for now.  Part of the sync() thread.
         */
        loadAnnotationsForTasks: function()
        {
            CR.app.controller.AnnotationNatureController.annotationsById = [];
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationschanged');

            // For each distinct principal clinical element loaded, we need to load previous annotations for the clinicalElement.
            for(key in CR.app.controller.AnnotationNatureController.principalClinicalElementsById)
            {
                var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[key];
                CR.app.controller.AnnotationNatureControllerAnnotations.loadAnnotationsForTask(clinicalElement);
            }
        },

        /**
         * Returns the current list of pre-annotators, annotators that have performed the currently selected task and have
         * produced annotations on the principal clinical element or any of its context clinical elements, for that task.
         * @returns {*}
         */
        getPreAnnotators: function()
        {
            return CR.app.controller.AnnotationNatureControllerAnnotations.preAnnotators;
        },

        /**
         * This returns a map of all HTML elements by their filter.
         * This means that the rendered HTML element comes from an underlying XML element
         * in the actual clinicalElement XML returned by clinical element web services.
         * Returns map of filter:element.
         * Override this in classes that format their clinicalElement in embedded / boilerplate HTML.
         *
         * @param component
         * @returns {Array}
         */
        getAnnotatableHTMLElements: function(component)
        {
            var rslt = [];

            if(component.body && component.body.dom) /* TODO: REDIRECT */
            {
                if(Ext.ieVersion>0)
                {
                    var bdy = component.body;
                    var achilds = component.body.dom.all;
                    for(i=0; i<achilds.length; i++)
                    {
                        var child = achilds[i];
                        if(child.getAttributeNode('name') && child.getAttributeNode('name').value=='annotatable')
                        {
                            if(child.getAttributeNode('clinicalElementFieldId'))
                            {
                                var xpath = child.getAttributeNode('clinicalElementFieldId').value;
                                rslt[xpath] = child;
                            }
                        }
                    }
                }
                else
                {
                    var debug = document;
                    var achilds = document.getElementsByName('annotatable');
                    for(i=0; i<achilds.length; i++)
                    {
                        var child = achilds[i];
                        if(component.body.contains(child)) /* TODO: REDIRECT */
                        {
                            var xpath = '';
                            if(child.getAttributeNode('clinicalElementFieldId'))
                            {
                                xpath = child.getAttributeNode('clinicalElementFieldId').value;
                            }
                            rslt[xpath] = child;
                        }
                    }
                }
            }
            return rslt;
        },

        /**
         * Returns all annotations that are associated with the given clinicalElement and overlapping the given
         * spanContainer element segment.
         * @param clinicalElementId
         * @param spanContainer
         * @returns {Array}
         */
        getAnnotationsByLoc: function(clinicalElementId, spanContainer)
        {
            var annotations = [];
            var spanSegmentText = spanContainer.data;
            var annotationsOverlappingSpanSegment = [];
            var pel = spanContainer.parentElement;
            var annotationIdsStr = pel.getAttribute("annotationIds");
            if(annotationIdsStr)
            {
                var annotationIds = annotationIdsStr.split(",");
                for(var i = 0; i < annotationIds.length; i++)
                {
                    var annotationId = annotationIds[i];
                    var annotation = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationById(annotationId);
                    if(annotation)
                    {
                        if(annotation.clinicalElementId == clinicalElementId)
                        {
                            annotationsOverlappingSpanSegment.push(annotation);
                        }
                    }
                }
                CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsCompareSpanText(annotationsOverlappingSpanSegment, spanSegmentText, "startsWithAndEndsWith", annotations);
                CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsCompareSpanText(annotationsOverlappingSpanSegment, spanSegmentText, "startsWith", annotations);
                CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsCompareSpanText(annotationsOverlappingSpanSegment, spanSegmentText, "containsStr", annotations);
                CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsCompareSpanText(annotationsOverlappingSpanSegment, spanSegmentText, "endsWith", annotations);
            }
            return annotations;
        },

        /**
         * Returns the annotation with the given id.
         * @param annotationId
         * @returns {*}
         */
        getAnnotationById: function(annotationId)
        {
            var annotation;
            for(key in CR.app.controller.AnnotationNatureController.annotationsById)
            {
                var tAnnotationsById = CR.app.controller.AnnotationNatureController.annotationsById[key];
                if(tAnnotationsById)
                {
                    for(var i = 0; i < tAnnotationsById.length; i++)
                    {
                        var tAnnotation = tAnnotationsById[i];
                        if(tAnnotation.id == annotationId)
                        {
                            annotation = tAnnotation;
                            break;
                        }
                    }
                }
                if(annotation)
                {
                    break;
                }
            }
            return annotation;
        },

        /**
         * Adds annotations uniquely from the list of annotations that overlap a segment, those annotations that are
         * associated with the span segment text in the way that is specified by the given operation.
         * @param annotationsOverlappingSpanSegment
         * @param spanSegmentText
         * @param operation
         * @param annotations
         */
        getAnnotationsCompareSpanText: function (annotationsOverlappingSpanSegment, spanSegmentText, operation, annotations)
        {
            for(var key1 in annotationsOverlappingSpanSegment)
            {
                var annotation = annotationsOverlappingSpanSegment[key1];
                for(var key2 in annotation.spans)
                {
                    var span = annotation.spans[key2];
                    if(operation === "startsWithAndEndsWith")
                    {
                        if(CR.app.controller.AnnotationNatureControllerAnnotations.startsWith(span.text, spanSegmentText) &&
                            CR.app.controller.AnnotationNatureControllerAnnotations.endsWith(span.text, spanSegmentText))
                        {
                            CR.app.controller.AnnotationNatureControllerAnnotations.addAnnnotationToListUnique(annotation, annotations);
                        }
                    }
                    else if(operation === "startsWith")
                    {
                        if(CR.app.controller.AnnotationNatureControllerAnnotations.startsWith(span.text, spanSegmentText))
                        {
                            CR.app.controller.AnnotationNatureControllerAnnotations.addAnnnotationToListUnique(annotation, annotations);
                        }
                    }
                    else if(operation === "endsWith")
                    {
                        if(CR.app.controller.AnnotationNatureControllerAnnotations.endsWith(span.text, spanSegmentText))
                        {
                            CR.app.controller.AnnotationNatureControllerAnnotations.addAnnnotationToListUnique(annotation, annotations);
                        }
                    }
                    else if(operation === "containsStr")
                    {
                        if(CR.app.controller.AnnotationNatureControllerAnnotations.strContains(span.text, spanSegmentText))
                        {
                            CR.app.controller.AnnotationNatureControllerAnnotations.addAnnnotationToListUnique(annotation, annotations);
                        }
                    }
                }
            }
        },

        /**
         * Adds the given annotation to the given list, if the annotation does not already exist in the list.
         * @param annotation
         * @param annotations
         */
        addAnnnotationToListUnique: function(annotation, annotations)
        {
            // Check to see if it is already in the list.
            var found = false;
            for(j = 0; j < annotations.length; j++)
            {
                var tAnnotation = annotations[j];
                if(CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(tAnnotation, annotation))
                {
                    found = true;
                    break;
                }
            }
            // Add the annotation only once.
            if(!found)
            {
                annotations.push(annotation);
            }
        },

        /**
         * Caches the clinical element date and name on any annotations associated with that clinical element.  The
         * date and name property names are given as parameters since they may be different for different clinical
         * elements.
         * @param clinicalElement
         * @param clinicalElementDateCol
         * @param clinicalElementNameCol
         */
        updateAnnotationsWithClinicalElementInfo: function (clinicalElement, clinicalElementDateCol, clinicalElementNameCol)
        {
            var annotations = CR.app.controller.AnnotationNatureController.annotationsById[clinicalElement.id];
            if(annotations)
            {
                for(var i = 0; i < annotations.length; i++)
                {
                    var annotation = annotations[i];
                    CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotationWithClinicalElementInfo(annotation, clinicalElement, clinicalElementDateCol, clinicalElementNameCol);
                }
            }
        },

        /**
         * Caches the clinical element date and name of the given clinical element, on the given annotation.  The
         * date and name property names are given as parameters since they may be different for different clinical
         * elements.
         * @param annotation
         * @param clinicalElement
         * @param clinicalElementDateCol
         * @param clinicalElementNameCol
         */
        updateAnnotationWithClinicalElementInfo: function (annotation, clinicalElement, clinicalElementDateCol, clinicalElementNameCol)
        {
            var clinicalElementDate;
            var clinicalElementName;
            if(clinicalElementDateCol)
            {
                clinicalElementDate = clinicalElement[clinicalElementDateCol];
            }
            if(clinicalElementNameCol)
            {
                clinicalElementName = clinicalElement[clinicalElementNameCol];
            }
            CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotationWithClinicalElementDateAndName(annotation, clinicalElementDate, clinicalElementName);
        },

        /**
         * Cache the given clinical element date and name on the given annotation.
         * Make a whole function for this because it is called from two locations - don't want to forget to update the behavior
         * in both locations if the number of fields stored on the annotation from the clinicalElement changes.
         * @param annotation
         * @param clinicalElementDate
         * @param clinicalElementName
         */
        updateAnnotationWithClinicalElementDateAndName: function (annotation, clinicalElementDate, clinicalElementName)
        {
            annotation.clinicalElementDate = new Date(clinicalElementDate);
            annotation.clinicalElementName = clinicalElementName;
        },

        /**
         * Returns true if the given string starts with the given prefix.
         * @param str
         * @param prefix
         * @returns {boolean}
         */
        startsWith: function (str, prefix)
        {
            return str.indexOf(prefix) === 0;
        },

        /**
         * Returns true if the given string ends with the given suffix.
         * @param str
         * @param suffix
         * @returns {boolean}
         */
        endsWith: function (str, suffix)
        {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        /**
         * Returns true if the given string contains the given content string.
         * @param str
         * @param contentStr
         * @returns {boolean}
         */
        strContains: function (str, contentStr)
        {
            return str.indexOf(contentStr) >= 0;
        }
    }
});