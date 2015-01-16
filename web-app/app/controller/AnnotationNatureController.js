/**
 * This is the main annotation nature control and utility class.  Adding this class as a mixin called "annotationAware"
 * allows a class to participate in an application-global, annotation nature, giving access to tasks,
 * annotation schemas, and annotations.  There are both static-global, shared annotation aware resources, and there are
 * component-specific annotation aware resources available.  Tasks are retrieved and annotations submitted during a call to the sync() method.
 * Classes that are annotation aware can register for annotation nature action callbacks and can have their text
 * components (if any) be used in displaying and creating annotated text.  If not a text component itself, an
 * annotation aware class can override the getAnnotationComponent() method to return a text component to be annotated.  Classes
 * that are annotation aware need not have a text component to be annotated (i.e. the annotation list itself is annotation aware,
 * but it has no text to markup).
 */
Ext.define('CR.app.controller.AnnotationNatureController', {
	requires: ['Ext.util.Event', 'Ext.draw.Color',
        'CR.app.controller.AnnotationNatureControllerText', 'Ext.data.reader.Xml', 'CR.app.controller.AnnotationNatureControllerAnnotations'],
	
	/**
	 * Use the annotationAware attribute to query for all ext objects that are annotation aware.
	 */
	annotationAware: true,
	/**
	 * Has annotation aware been initialized yet.
	 */
	annotationAwareInitialized: false,
	/**
	 * Temporary variable to hold style blocks within the scope of one annotatable element.
	 */
	styleTags: [],
	/**
	 * For walking thru the markup process; As the element text is walked thru, these show which annotations currently 
	 * want to be marked up with color at the current caret position.
	 */
	processingAnnotations: [],
	/**
	 * Placeholder for the last caret position during the process of marking up text with color.
	 */
	lastMark: null,
	/**
	 * The names of the columns in this view (if any) whose values should show up as the values for
     * the clinicalElement date and name columns in the annotation list.
	 */
	clinicalElementDateCol: '',
	clinicalElementNameCol: '',
    /**
     * The whole clinical element represented by this annotation-aware component, if any.  This is used in
     * tracking annotations as part of annotation awareness, so it is conveniently kept in the nature rather
     * than in the component's properties hierarchy.  Each annotation aware component may have a clinicalElementId indicating
     * which clinical element is "selected" in that component.  The id may be null, indicating that no clinical element
     * is selected in the component.  The UI has a flag available to the user that allows the user to choose to see all
     * annotations or all annotations associated with the currently selected clinical elements (plural, since each
     * component may have a different selected clinical element.  Components do not have to be a list to have a selected
     * clinical element, for example a patient portlet may only have one patient in it, displayed in a summary panel
     * only, not in a list..
     */
     clinicalElementId: null,

    constructor: function(config) {
		this.callParent(config);
//
//        this.addEvents('schemaLoaded');
//        this.addEvents('beforeSync');
//        this.addEvents('principalClinicalElementLoaded');
//        this.addEvents('principalClinicalElementSelectedAutomatically');
//        this.addEvents('clinicalElementSelectedByUser');
//        this.addEvents('portletClosed');
//        this.addEvents('annotationListFilterTypeChangedByUser');
//        this.addEvents('annotationCreatedByUserTextLevel');
//        this.addEvents('annotationSelectedByUserTextLevel');
//        this.addEvents('annotationCreatedByUserRecordLevel');
//        this.addEvents('annotationSelectedByUserRecordLevel');
//        this.addEvents('annotationSelectedByUserInList');
//        this.addEvents('clinicalElementContentLoaded');
//        this.addEvents('annotationsDeletedByUserInList');
//        this.addEvents('annotationSelectionBlur');
//        this.addEvents('');
	},

    annotationSelectionBlur: function()
    {
        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserInList');
    },

    /**
     * Override this in classes that render the annotation in a different component than the one
     * implementing AnnotationAware.
     */
    getAnnotationComponent: function()
    {
        return this;
    },

    /**
	 * Intended to be called after EXT component has been rendered (afterRender event).
     * This initializes the annotation awareness of the whole system.
	 */
	initAnnotationAwareness: function() {
		if(!this.annotationAwareInitialized)
		{
			this.addClickListenersToAnnotationComponentElement(this.getAnnotationComponent().body);
            this.configureAnnotationToolbar();
		}
        this.annotationAwareInitialized = true;
	},

    /**
     * This expects an EXT element.  This method adds a mouse listener to an ext element, for example it is added
     * to the annotation component body during initialization of annotation awareness.  The mouse event launches
     * the work of creating an annotation on the annotation component text area for the selected schema element.
     * @param {Ext element like text area body..}
     */
    addClickListenersToAnnotationComponentElement: function(topElement)
    {
        if(topElement)
        {
            topElement.addListener("mouseup", this.mouseUpOnAnnotationComponent, this);
        }
    },

    /**
     * Triggers the work of creating or selecting an annotation with a single drag or click.
     */
    mouseUpOnAnnotationComponent: function(evt, el)
    {
        if(this.clinicalElementId != null)
        {
            // Get the document element in which the document selection mouse event happened.
            var annotationComponent = this.getAnnotationComponent();

            // Is NOT double click; However, this happens on double click too - just treat it as a single click and handle the double click after...
            CR.app.controller.AnnotationNatureControllerText.handleAnnotationComponentTextSelection(annotationComponent, this, false);
//            this.fireEvent('clinicalElementchanged'); // Indirectly makes this paint annotations. Should probably be methodized.
//            Ext.getCmp('annotationlist').fireEvent('annotationschanged');
            CR.app.controller.AnnotationNatureControllerText.removeCurrentAnnotationComponentTextSelection();
        }
    },

    /**
     * Triggers the work of creating an annotation with a double click.
     */
    listeners: {
        dblclick: function(e, t, eOpts) {
            if(typeof(this.getAnnotationComponent) == typeof(Function))
            {
                // Get the document element in which the document selection mouse event happened.
                var annotationComponent = this.getAnnotationComponent();

                CR.app.controller.AnnotationNatureControllerText.handleAnnotationComponentTextSelection(annotationComponent, this, true); // Is double click
            }
        },
        element: 'body'
    },

    /**
     * The classify button should be added to a component that represents one whole record of a clinical element
     * (i.e. a patient, lab value, or visit note).  This button creates a annotation to classify the whole clinical
     * element.
     * @returns {Ext.Button}
     */
    createClassifyWholeClinicalElementButton: function() {
        var me = this;
        return Ext.create('Ext.Button', {
            xtype: 'button',
            prnt: me,
            text: 'Classify',
            flex: 0,
            dock: 'top',
            tooltip: 'Add the currently selected classification to this whole clinical element.',
            disabled: CR.app.model.CRAppData.readOnly ? true : false,
            handler: function(btn)
            {
                btn.prnt.classifyWholeClinicalElement(btn.prnt.getAnnotationComponent());
            }
        });
    },

    /**
     * The classifications panel should be added to a component that represents one whole record of a clinical element
     * (i.e. a patient, lab value, or visit note).  This panel displays the classifications of this whole clinical
     * element.
     * @returns {Ext.Panel}
     */
    getClassificationsPanel: function() {
        var me = this;
        return Ext.create('Ext.Panel', {
            flex: 100,
            bodyStyle: {
                background: '#eeeeee'
            }
        });
    },

    /**
     * This button should be added to a component that represents the current task.  Clicking
     * it moves to the previous task in the list of tasks to be accomplished.  If only one task is loaded at a time, then this
     * button should not be displayed.
     * @returns {Ext.Button}
     */
    getNavPreviousButton: function() {
		var me = this;
		return Ext.create('Ext.Button', {
			xtype: 'button',
			prnt: me,
			icon: '/images/nav_backward.gif',
			dock: 'top',
			handler: function(btn)
			{
				btn.prnt.navPreviousPrincipal();
			}
		})
	},

    /**
     * This button should be added to a component that represents the current task.  Clicking
     * it moves to the next task in the list of tasks to be accomplished.  If only one task is loaded at a time, then this
     * button should not be displayed.
     * @returns {Ext.Button}
     */
	getNavNextButton: function() {
		var me = this; /* TODO: REDIRECT */
		return Ext.create('Ext.Button', {
			xtype: 'button',
			prnt: me,
			dock: 'top',
			icon: '/images/nav_forward.gif',
			handler: function(btn)
			{
				btn.prnt.navNextPrincipal();
			}
		})
	},

    /**
     * This button should be added to a component that represents the current task.  Clicking
     * it moves to the previous principal clinical element in the list of principal clinical elements
     * to be annotated in the current task.  If only one task is loaded at a time, then this
     * button should not be displayed.
     * @returns {Ext.Button}
     */
	navNextPrincipal: function()
	{
		var anlt = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[this.clinicalElementId];
		if(anlt)
		{
			var comp = Ext.ComponentQuery.query('[id=tasklistpanel]')[0];
            var mdlSize = comp.store.count();
            var selected = comp.selModel.getSelection();
            if(selected && selected.length>0)
            {
                var selDex = comp.store.indexOf(selected[0]);
                if(selDex < (mdlSize-1))
                {
                    comp.selModel.select(selDex+1);
                }
            }
		}
	},

    /**
     * This button should be added to a component that represents the current task.  Clicking
     * it moves to the next principal clinical element in the list of principal clinical elements
     * to be annotated in the current task.  If only one task is loaded at a time, then this
     * button should not be displayed.
     * @returns {Ext.Button}
     */
	navPreviousPrincipal: function()
	{
		var anlt = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[this.clinicalElementId];
		if(anlt)
		{
            var comp = Ext.ComponentQuery.query('[id=tasklistpanel]')[0];
            var mdlSize = comp.store.count();
            var selected = comp.selModel.getSelection();
            if(selected && selected.length>0)
            {
                var selDex = comp.store.indexOf(selected[0]);
                if(selDex > 0)
                {
                    comp.selModel.select(selDex-1);
                }
            }
		}
	},

    /**
     * This button should be added to a component that represents the current task.  It would be used to
     * display and pick task status.  For example, toodo, complete, hold, skip
     * @param stat
     * @param displayName
     * @returns {Ext.Button}
     */
	getStatusButton: function(stat, displayName)
	{
		var me = this.getAnnotationComponent();
		return Ext.create('Ext.Button', {
			xtype: 'button',
			prnt: me,
			text: displayName,
			status: stat,
			dock: 'top',
			handler: function(btn)
			{
				btn.prnt.setClinicalElementStatus(btn.status);
			}
		});
	},

    /**
     * Set the status of the whole clinical element that this annotation aware
     * class represents, identified by the clinicalElementId property (i.e. toodo, complete, hold, skip).
     * @param stat
     */
	setClinicalElementStatus: function(stat)
	{ 
		var clincalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[this.clinicalElementId];
		if(clincalElement)
		{
			clincalElement.status = stat;
            var comp = Ext.ComponentQuery.query('[id=tasklistpanel]')[0];
            if(comp.selModel.selected.items.length>0)
            {
                comp.selModel.selected.items[0].data.status = stat;
            }
            comp.store.fireEvent('datachanged', comp.store, comp.store.records);
		}
	},

    /**
     * Creates an annotation that classifies the whole clinical element that this
     * annotation aware class represents, identified by the clinicalElementId property.
     */
	classifyWholeClinicalElement: function(annotationComponent)
	{
		var id = this.clinicalElementId;
		if(!id)
		{
			alert('An annotation cannot be added because a clinical element id cannot be found for the selected component.');
			return;
		}

        var principalClinicalElement = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement;

        // Ensure that the context clinical element exists if it does not already.
        var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[this.clinicalElementId];
        if(!clinicalElement)
        {
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(annotationComponent.clinicalElementConfigurationId);
            clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElementFromPrincipalClinicalElement(this.clinicalElementId, clinicalElementConfiguration.dataIndex, clinicalElementConfiguration.text, principalClinicalElement);
            CR.app.controller.AnnotationNatureController.principalClinicalElementsById[this.clinicalElementId] = clinicalElement;

            // In the this case of direct annotation creation on a record, set this clinical element as the selected clinical element as well.
            CR.app.controller.AnnotationNatureController.setSelectedClinicalElement(clinicalElement);
        }

        var schemaElement = null;
        var comp = Ext.ComponentQuery.query('component[id=annotationschemapanel]')[0];
        var selMdl = comp.getSelectionModel();
        if(selMdl)
        {
            var selections = selMdl.selected;
            if(selections)
            {
                for(i = 0; i<selections.items.length; i++)
                {
                    var selection = selections.items[i];
                    if(selection && selection.data && selection.data.srcNode)
                    {
                        schemaElement = selection.data.srcNode;
                    }
                }
            }
        }
		if(!schemaElement)
		{
			alert('A schema element must be selected for annotation.');
			return;
		}

		var d1 = new Date();
		var today = Ext.Date.format(d1, "Y-m-d\\TH:i:s\\Z");
		var annotation = CR.app.controller.AnnotationNatureControllerAnnotations.createAnnotation(
            CR.app.controller.AnnotationNatureController.getNewId(), // id
            clinicalElement.id, // clinicalElementId
            clinicalElement.schemaId, // schemaId
            schemaElement, // schemaElement
            today, // creationDate
            clinicalElement.clinicalElementConfigurationId, // clinicalElementConfigurationId
            [], // spans
            [], // features
            true); // isNew

		CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotation(annotation.clinicalElementId, annotation, true);
//		CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotationWithClinicalElementDateAndName(annotation, null, annotationClinicalElementId);
        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(annotation);
        this.appendAnnotationsToAnnotationToolbar();
		CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationCreatedByUserRecordLevel');
    },

	/**
	 * This convenience function adds an annotation toolbar to the annotation component represented or owned by this
     * class.  The annotation toolbar is docked at the top of the annotation component and allows the whole clinical
     * element represented by the component to be classified and for classifications of it to be displayed.
     * This function is intended to be called liberally any time there is a change that can affect
	 * the toolbar.
	 */
	configureAnnotationToolbar: function()
	{
		/*
		 * 1) Create a panel
		 * 2) Add buttons to the panel according to what role this component plays
		 * 3) Add panel to docked section (for now, just top)
		 */
		var me = this.getAnnotationComponent();

		if(this.clinicalElementId)
		{
			// Check for existence of tool bar and remove if exists.
			if(this.getAnnotationComponent().annotationToolbar)
			{
				this.getAnnotationComponent().removeDocked(this.getAnnotationComponent().annotationToolbar, true);
			}	

			var toolbarParts = [];
            toolbarParts.push(this.createClassifyWholeClinicalElementButton(this.getAnnotationComponent()));
            this.getAnnotationComponent().classificationsPanel = this.getClassificationsPanel();
            var id = this.getAnnotationComponent().id + "-classificationPanel";
            this.getAnnotationComponent().classificationsPanel.id = id;
            toolbarParts.push(this.getAnnotationComponent().classificationsPanel);

            this.getAnnotationComponent().annotationToolbar = Ext.create('Ext.Panel', {
//                defaults: {padding: '0 0 0 0'},
//                layout: 'hbox',
//                align: 'stretch',
//                bodyStyle: {
//                    background: '#123123'
//                },
                layout:
                {
                    type: 'hbox',
                    align: 'stretch',
                    padding: '0 0 0 0'
                },
                bodyStyle: {
                    background: '#888888'
                },
                items: toolbarParts
            });

			this.getAnnotationComponent().addDocked(this.getAnnotationComponent().annotationToolbar);
            this.addClickListenersToAnnotationToolbarElement(this.getAnnotationComponent().classificationsPanel.body);
        }
	},

    /**
     * This expects an EXT element.  This method adds a mouse listener to an ext element, for example it is added
     * to the annotation toolbar body during initialization of annotation awareness.  The mouse event launches
     * the work of selecting an annotation on the annotation toolbar classification panel area.
     * @param {Ext element like text area body..}
     */
    addClickListenersToAnnotationToolbarElement: function(topElement)
    {
        if(topElement)
        {
            topElement.addListener("mouseup", this.mouseUpOnAnnotationToolbar, this);
        }
    },

    /**
     * Triggers the work of creating or selecting an annotation with a single drag or click.
     */
    mouseUpOnAnnotationToolbar: function(evt, el)
    {
        if(this.clinicalElementId != null)
        {
            // Get the document element in which the document selection mouse event happened.
            var classificationsPanel = this.getAnnotationComponent().classificationsPanel;

            // Is NOT double click; However, this happens on double click too - just treat it as a single click and handle the double click after...
            CR.app.controller.AnnotationNatureControllerText.handleAnnotationToolbarTextSelection(classificationsPanel, this, false);
            CR.app.controller.AnnotationNatureControllerText.removeCurrentAnnotationToolbarTextSelection();
        }
    },

    /**
     * Add html to the classifications panel of the annotation tool bar to show the classification annotations of the
     * whole clincial element represented by this component (if it does represent one).
     */
    appendAnnotationsToAnnotationToolbar: function()
	{
        if(typeof this.getAnnotationComponent().classificationsPanel != 'undefined')
        {
            var clinicalElementAnnotations = [];
            if(this.clinicalElementId)
            {
                var annotations = CR.app.controller.AnnotationNatureController.annotationsById[this.clinicalElementId];
                for(key in annotations)
                {
                    var annot = annotations[key];
                    if(annot.spans && annot.spans.length==0)
                    {
                        clinicalElementAnnotations.push(annot);
                    }
                }
            }

            clinicalElementAnnotations.sort(function(o1, o2){
                var ret = 0;
                if(o1.schemaRefName > o2.schemaRefName){
                    ret = 1;
                }
                else if (o1.schemaRefName < o2.schemaRefName){
                    ret = -1;
                }
                return ret;
            });

            var classificationsHtml = '';
            for(i=0;i<clinicalElementAnnotations.length;i++)
            {
                var annot = clinicalElementAnnotations[i];
                if(annot.color && annot.schemaRefName)
                {
                    if (i > 0)
                    {
                        classificationsHtml += ', ';
                    }
                    var schemaElementName = annot.schemaRefName;

                    var isSelected = false;
                    var selectedAnnotation = CR.app.controller.AnnotationNatureController.getSelectedAnnotation();
                    if(selectedAnnotation && CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(annot, selectedAnnotation))
                    {
                        isSelected = true;
                    }
                    var selectionColor = CR.app.controller.AnnotationNatureController.DEFAULT_ANNOTATION_SELECTION_COLOR;
                    var borderStyle = isSelected?"border-bottom: 1px solid "+selectionColor+";"+"border-top: 1px solid "+selectionColor+";":"";
                    var selectionStart = isSelected?"<u>":""; // boarder style does not seem to work on titles, so we have to do normal, uncolored underline.
                    var selectionEnd = isSelected?"</u>":"";
                    classificationsHtml += "<text style=\"background-color:"+annot.color+";"+borderStyle+"font-size: 9px;\" annotationId="+annot.id+">"+selectionStart+schemaElementName+selectionEnd+'</text>';
                }
            }
            var html = '';
            html += '<div style="height:20px;overflow:auto;">'
            html += ':' + classificationsHtml;
            html += '</div>'
            this.getAnnotationComponent().classificationsPanel.update(html);
        }
	},

    /**
     * Adds style tags to the given element for the given stack of annotations.
     * @param el - the element to which the style tag will be added
     * @param s - the stack of annotations for which style tags will be added
     */
	addStyleTagToElement: function(el, s)
	{
		/*
		 * TODO: Put an attribute or other such reference to reference back to the annotation stack that generated this tag.
		 */
		var color = 'yellow';
		var selectionColor = 'red';
		var count = s.annotations.length;
		var isSelected = false;
		var annotationIdsStr = "";
		if(count>0)
		{
			var r = 0;
			var g = 0;
			var b = 0;
			var rSelected = 0;
			var gSelected = 0;
			var bSelected = 0;
			for(j=0; j<count; j++)
			{
				var a = s.annotations[j];
				annotationIdsStr += a.annotation.id;
				if(j < count - 1)
				{
					annotationIdsStr += ",";
				}
				var selectedAnnotation = CR.app.controller.AnnotationNatureController.getSelectedAnnotation();
				if(selectedAnnotation && CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(a.annotation, selectedAnnotation))
				{
					isSelected = true;
				}
				var acolor = a.color;
				if(!acolor)
				{
					acolor = '#EEEEEE';
				}
				var ecolor = Ext.draw.Color.fromString(acolor);
				r = r + ecolor.getRed();
				g = g + ecolor.getGreen();
				b = b + ecolor.getBlue();
				//color = s.annotations[j].color;
				var acolorSelected = a.selectionColor;
				if(!acolorSelected)
				{
					acolorSelected = CR.app.controller.AnnotationNatureController.DEFAULT_ANNOTATION_SELECTION_COLOR;
				}	
				var ecolorSelected = Ext.draw.Color.fromString(acolorSelected);
				rSelected = rSelected + ecolorSelected.getRed();
				gSelected = gSelected + ecolorSelected.getGreen();
				bSelected = bSelected + ecolorSelected.getBlue();
			}

			r = r / count;
			g = g / count;
			b = b / count;

			var ecolor = new Ext.draw.Color(r,g,b);
			color = ecolor.toString();
			var ecolorSelected = new Ext.draw.Color(rSelected,gSelected,bSelected);
			selectionColor = ecolorSelected.toString();
		}
		CR.app.controller.AnnotationNatureControllerText.annotateHTMLElementWithColor(el, color, s['start'], s['stop'], isSelected, selectionColor, annotationIdsStr);
	},

    /**
     * Make sure that the clinical element represented by this class is loaded so that we can start annotating it.
     */
	checkForExistingClinicalElementAfterRender: function()
	{
		if(this.clinicalElementId)
		{
            // NOTE: In the original CR app, clinical elements (analytes) were created here, if they had not already
            // been created.  In the new CR app, we can just attach annotations to the clinical element GUID without
            // a load of clincal elements.
            //
            // TBD - Assume that all of the clinical elements whose annotations have been loaded
            // are existing in the filtered lists of clinical elements already fetched.
//			CR.app.controller.AnnotationNatureController.ensureClinicalElementIsLoaded(this.clinicalElementId, 0, CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement);
			this.configureAnnotationToolbar();
		}	
	},

    /**
     * Walks thru the markup process; All annotations that want to be marked up are found in processingAnnotations
     * and are marked up with color up to the given caret position.
     * @param s - mark up with color up to the given caret position
     */
	addStyleTagsForProcessedAnnotationsUpTo: function(mark)
	{
		// Slightly inefficient, but doesn't matter much.
		this.processingAnnotations.sort(function(a1, a2){
			return parseInt(a1['textStop']) - parseInt(a2['textStop']);
		});
		var currentMark = mark;
		var finishedAnnotations = [];

		var x = 0;
		for(; x<this.processingAnnotations.length; x++)
		{
			var current = this.processingAnnotations[x];
			/*
			 * If we have a 'pa' (previously processed span) that closes after the last point, but 
			 * before the current start point, we need to make a style tag for all annotations currently 
			 * being processed and mark it to be removed from the processing list.
			 */
			var t1 = (parseInt(current['textStop'])>parseInt(this.lastMark));
			var t2 = (currentMark==null);
			var t3 = (parseInt(current['textStop'])<=parseInt(currentMark));
			if(t1 && (t2 || t3))
			{
				/*
				 *  Add style for all PA's up to this point between lastMark and currentMark that HAVENT already been marked for removal.
				 */ 
				var activeAnnotations = [];
				for(ppa in this.processingAnnotations)
				{
					if(finishedAnnotations.indexOf(this.processingAnnotations[ppa])==-1)
					{
						activeAnnotations.push(this.processingAnnotations[ppa]);
					}
				}
				this.addStyleTag(this.styleTags, this.lastMark, current['textStop'], activeAnnotations);

				finishedAnnotations.push(current);

				// Move the lastMark up to this point.
				this.lastMark = current['textStop'];
			}
			else if(parseInt(current['textStop'])==parseInt(this.lastMark))
			{
				finishedAnnotations.push(current);
			}
		}
		// Remove all flagged PA items.
		for(ra in finishedAnnotations)
		{
			var pos = this.processingAnnotations.indexOf(finishedAnnotations[ra]);
			if(pos >= 0)
			{
				this.processingAnnotations.splice(pos, 1);
			}
		}
		if(this.processingAnnotations.length>0 && currentMark && currentMark != this.lastMark)
		{
			// Style to cover segment leading up to this textStart.
			this.addStyleTag(this.styleTags, this.lastMark, currentMark, this.processingAnnotations);
		}
	},

	/**
	 * For use when collecting all style tags that need to be rendered in clinicalElement HTML elements.
	 */
	addStyleTag: function(tags, start, stop, annotations)
	{
		if(annotations.length>0)
		{
			var annotationsCopy = [];
			for(key in annotations)
			{
				annotationsCopy.push(annotations[key]);
			}
			tags.push({'start':start,'stop':stop,'annotations':annotationsCopy});
		}
	},
	
	statics: {
        // Annotation types
        ANNOTATION_TYPE_CLASSIFICATION: 0,
        ANNOTATION_TYPE_CLASSREL: 1,

        // Attribute types
        ATTRIBUTE_DEF_TYPE_TEXT: 0,
        ATTRIBUTE_DEF_TYPE_NUMERIC: 1,
        ATTRIBUTE_DEF_TYPE_BLOB: 2,
        ATTRIBUTE_DEF_TYPE_OPTION: 3,
        ATTRIBUTE_DEF_TYPE_DATE: 4,

        // Feature types
        FEATURE_TYPE_ATTRIBUTE_TEXT: 0,
        FEATURE_TYPE_ATTRIBUTE_NUMERIC: 1,
        FEATURE_TYPE_ATTRIBUTE_BLOB: 2,
        FEATURE_TYPE_ATTRIBUTE_OPTION: 3,
        FEATURE_TYPE_ATTRIBUTE_DATE: 4,
        FEATURE_TYPE_CLASSIFICATION_LEFT: 5,
        FEATURE_TYPE_CLASSIFICATION_RIGHT: 6,

        DEFAULT_ANNOTATION_SELECTION_COLOR: '#000000',

        /**
         * The project id for use in getting tasks.
         */
        projectId: null,
        /**
         * The process id for use in getting tasks.
         */
        processId: null,
		/**
		 * An EXTJS4 model of schema information.
		 */
		schemaStore: null,
		/**
		 * A count used in submitAnnotations to know when the annotations of all principal clinical elements are done being submitted.
		 */
		submitAnnotationsPrincipalClinicalElementCount: 0,
		/**
		 * Schemas by schema ref ID
		 * Can contain multiple tiers.
		 */
		schemasByRefID: [],
		/**
		 * Currently selected schema.
		 */
		selectedSchemaID: null,
		/**
		 * Name of schema.
		 */
		schemaName: null,
		/**
		 * Attributes of the currently selected schema.
		 */
		attributes: [],
		/**
		 * Classes of the currently selected schema.
		 */
		classes: [],
		/**
		 * Class relationships of the currently selected schema.
		 */
		classRels: [],
		/**
		 * Combination of attribute, class, and classRel schema elements for quick lookup when loading annotations.
		 */
		schemaElements: [],
		/**
		 * Cache of principalClinicalElementsById by id
		 */
        principalClinicalElementsById: [],
        /**
         * The currently selected principal clinicalElement.  This comes from the currently selected task.
         */
        selectedPrincipalClinicalElement: null,
        /**
         * The previously selected principal clinicalElement.  This comes from the previously selected task.
         */
        previouslySelectedPrincipalClinicalElement: null,
        /**
         * The comment to be submitted with the principal clinical element task status (i.e. hold comment)
         */
        selectedPrincipalClinicalElementStatusComment: "",
		/**
		 * Annotations by id (or ContextRefId.)
		 * This is populated both from server responses and UI changes.
		 * These are used after rendering the component to mark up style tags for annotations.
		 */
		annotationsById: [],
		/**
		 * Currently selected annotation
		 */
		selectedAnnotation: null,
		/**
		 * True if all annotations for the currently selected clinicalElement are to be displayed in the annotations list, regardless
		 * which context element is selected.
		 * False if only annotations from the currently selected context clinicalElement are to be displayed.
		 */
		showAllAnnotationsForSelectedTask: true,
		/**
		 * List of pre-annotators for the currently selected clinicalElement.
		 */
		preAnnotators: [],
		/**
		 * A count of all the blocks put on the UI during loading.  When this goes to zero, we can unblock.
		 */
		blockWhileLoadingCount: 0,
        /**
         * For creation of temp ids to send to server on submitAnnotation and submitClinicalElement
         */
        curTempId: 1,
        /**
         * Temporary id counter
         */
        newIdCounter: 1,

        /**
         * Resets the annotation awareness for static-global, shared resource, as well as for component-specific
         * annotation awareness resources.
         */
		resetAnnotationAware: function()
		{
            // Do not set the previously selected principal clinical element.  We are not deleting the
            // portlets and we need to use the previously selected principal clinical element's clinical element type
            // to figure out if we need to change the portlets.
            CR.app.controller.AnnotationNatureController.setSelectedPrincipalClinicalElement(null);
            CR.app.controller.AnnotationNatureController.annotationsById = [];
            CR.app.controller.AnnotationNatureController.preAnnotators = [];
            CR.app.controller.AnnotationNatureController.principalClinicalElementsById = [];
            CR.app.controller.AnnotationNatureController.annotationsById = [];

            // Some of the resources in this class are shared as global static for all annotation aware components,
            // and some are component-specific annotation awareness.  Do NOT reset the component-specific annotation
            // awareness resources, because we are reusing portlets on saves.
            // comp.annotationAware = true;
            // comp.annotationAwareInitialized = false;
            // comp.styleTags = [];
            // comp.processingAnnotations = [];
            // comp.lastMark = null;
            // comp.clinicalElementDateCol = '';
            // comp.clinicalElementNameCol = '';
            // comp.clinicalElementId = null;

            // THINGS TO NOT RESET AND WHY...
            // CR.app.controller.AnnotationNatureController.submitAnnotationsPrincipalClinicalElementCount // Do not reset this one - necessary to submit task correctly.
            // CR.app.controller.AnnotationNatureController.principalClinicalElementsById // Do not reset this one - needed to do submit tasks correctly.
            // CR.app.controller.AnnotationNatureController.userID // Do not reset this one - its the user - that does not change for this session, until logout
            // CR.app.controller.AnnotationNatureController.showAllAnnotationsForSelectedTask  // Do not reset this one - the user has chosen this for this session.
            // CR.app.controller.AnnotationNatureController.selectedAnnotation // Do not reset this one - we may try to select it again.
            // CR.app.controller.AnnotationNatureController.schemaStore
            // CR.app.controller.AnnotationNatureController.schemasByRefID
            // CR.app.controller.AnnotationNatureController.selectedSchemaID
            // CR.app.controller.AnnotationNatureController.attributes
            // CR.app.controller.AnnotationNatureController.classes
            // CR.app.controller.AnnotationNatureController.classRels
            // CR.app.controller.AnnotationNatureController.schemaElements
            // DO not delete the portlets - we may reuse them on the next task, if the task is the same.
		},

        /**
         * For creating unique ids within the UI.  Used in annotation creation so that annotation selection can find unique annotation
         * even before synching with Annotation Admin which gives an annotation its long-term, server-side unique identifier.
         */
		getNewId: function()
		{
			return "" + CR.app.controller.AnnotationNatureController.newIdCounter++;
		},

        /**
         * Used to fetch context analyte information AFTER annotating.  SAVE THIS CONCEPT: This concept is not currently used
         * in the current implementation of CR, because the current annotation administration server does not keep
         * a list of analyte proxies on the server.  An analyte proxy is needed if the
         * server has the concept of remote analytes coming from multiple data sources.  The analyte proxy
         * in that case is the unique identified location for storing annotations on an object whose id
         * may not be unique across the multiple data sources.
         * @param principalClinicalElement
         * @param clinicalElementIdsById
         */
		ensureClinicalElementsAreLoaded: function(principalClinicalElement, clinicalElementIdsById)
		{
			var clinicalElements = [];
			for(tClinicalElementId in clinicalElementIdsById)
			{
				var tClinicalElementId = clinicalElementIdsById[tClinicalElementId];
				if(tClinicalElementId)
				{
					var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[tClinicalElementId];
					if(!clinicalElement)
					{
						clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElementFromPrincipalClinicalElement(tClinicalElementId, principalClinicalElement.clinicalElementConfigurationId, principalClinicalElement.clinicalElementConfigurationName, principalClinicalElement);
						CR.app.controller.AnnotationNatureController.principalClinicalElementsById[tClinicalElementId] = clinicalElement;
					}
                    clinicalElements.push(clinicalElement);
				}
			}
			/*
			 * The clinicalElement will be given to the call to Annotation Admin.
			 * Because the call is asynchronous, I will let the callback routine fill it in.
			 */
			var existingClinicalElement = CR.app.controller.AnnotationNatureControllerText.getExistingClinicalElementsFromContextElementIds(principalClinicalElement, clinicalElements);
		},

        /**
         * See header for ensureClinicalElementsAreLoaded.  SAVE THIS CONCEPT.
         * @param tClinicalElementId
         * @param principalClinicalElement
         */
		ensureClinicalElementIsLoaded: function(tClinicalElementId, principalClinicalElement)
		{
			if(tClinicalElementId)
			{
				var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[tClinicalElementId];
				if(!clinicalElement)
				{
					clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElementFromPrincipalClinicalElement(tClinicalElementId, principalClinicalElement.clinicalElementConfigurationId, principalClinicalElement.clinicalElementConfigurationName, principalClinicalElement);
					/*
					 * The clinicalElement will be given to the call to Annotation Admin.
					 * Because the call is asynchronous, I will let the callback routine fill it in.
					 */
					var clinicalElements = [];
					clinicalElements.push(clinicalElement);
					var existingClinicalElement = CR.app.controller.AnnotationNatureControllerText.getExistingClinicalElementsFromContextElementIds(principalClinicalElement, clinicalElements);
					CR.app.controller.AnnotationNatureController.principalClinicalElementsById[tClinicalElementId] = clinicalElement;
				}
			}	
		},

        /**
         * See header for ensureClinicalElementsAreLoaded.  SAVE THIS CONCEPT.
         * @param tClinicalElementId
         * @param principalClinicalElement
         * @returns {*}
         */
		createClinicalElementFromPrincipalClinicalElement: function(tClinicalElementId, clinicalElementConfigurationId, clinicalElementConfigurationName, principalClinicalElement)
		{
            clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElement(
                tClinicalElementId, // id
                clinicalElementConfigurationName, // name
                principalClinicalElement.taskId, // taskId
                principalClinicalElement.taskName, // taskName
                principalClinicalElement.taskProjectDocument, // taskProjectDocument
                principalClinicalElement.taskDetailedDescription, // taskDetailedDescription
                clinicalElementConfigurationId, // clinicalElementConfigurationId
                clinicalElementConfigurationName, // clinicalElementConfigurationName
                principalClinicalElement.dateAssigned, // dateAssigned
                principalClinicalElement.dateModified, // dateModified
                principalClinicalElement.schemaId, // schemaId
                principalClinicalElement.schemaName, // schemaName
                'completed', // status
                '', // contextElementTypes
                principalClinicalElement.id, // principalClinicalElementId,
                null, // dateCompleted,
                true, // isContext,
                true); // isNew
			return clinicalElement;
		},

        /**
         * Provides a central place to define and create a clinical element.  Note that in this annotation nature,
         * a clinical element is a combination of task and document.
         * @param id
         * @param name
         * @param taskId
         * @param taskName
         * @param taskProjectDocument
         * @param taskDetailedDescription
         * @param clinicalElementConfigurationId
         * @param clinicalElementConfigurationName
         * @param dateAssigned
         * @param dateModified
         * @param schemaId
         * @param schemaName
         * @param status
         * @param contextElementTypes
         * @param principalClinicalElementId
         * @param dateCompleted
         * @param isContext
         * @param isNew
         * @returns {{id: *, name: *, taskId: *, taskName: *, taskProjectDocument: *, taskDetailedDescription: *, clinicalElementConfigurationId: *, clinicalElementConfigurationName: *, dateAssigned: *, dateModified: *, schemaId: *, schemaName: *, status: *, contextElementTypes: *, principalClinicalElementId: *, dateCompleted: *, isContext: *, isNew: *}}
         */
        createClinicalElement: function(
            id,
            name,
            taskId,
            taskName,
            taskProjectDocument,
            taskDetailedDescription,
            clinicalElementConfigurationId,
            clinicalElementConfigurationName,
            dateAssigned,
            dateModified,
            schemaId,
            schemaName,
            status,
            contextElementTypes,
            principalClinicalElementId,
            dateCompleted,
            isContext,
            isNew)
        {
            var clinicalElement = {
                'id':id,
                'name':name,
                'taskId':taskId,
                'taskName':taskName,
                'taskProjectDocument':taskProjectDocument,
                'taskDetailedDescription':taskDetailedDescription,
                'clinicalElementConfigurationId':clinicalElementConfigurationId,
                'clinicalElementConfigurationName':clinicalElementConfigurationName,
                'dateAssigned':dateAssigned,
                'dateModified':dateModified,
                'schemaId':schemaId,
                'schemaName':schemaName,
                'status':status,
                'contextElementTypes':contextElementTypes,
                'principalClinicalElementId':principalClinicalElementId,
                'dateCompleted':dateCompleted,
                'isContext':isContext,
                'isNew':isNew
            };
            return clinicalElement;
        },

        /**
         * Provides a central place to define and create a context clinical element type. A context element is
         * a clinical element is a clinical element that provides contextual information to the principal clinical
         * element.  If the principal is a patient, then a context clinical element may be a note or a lab.  If the
         * principal is a note, then the context clinical element may be a patient or a lab.
         * @param name
         * @param typeName
         * @param typeId
         * @param allowAnnotation
         * @param hidden
         * @param sequence
         * @returns {{name: *, typeName: *, typeId: *, allowAnnotation: *, hidden: *, sequence: *}}
         */
        createContextElementType: function(
            name,
            typeName,
            typeId,
            allowAnnotation,
            hidden,
            sequence)
        {
            var contextElementType = {
                'name':name,
                'typeName':typeName,
                'typeId':typeId,
                'allowAnnotation':allowAnnotation,
                'hidden':hidden,
                'sequence':sequence
            };
            return contextElementType;
        },

        /**
         * Returns the parent, if any, of the given class def.
         * @param classDef
         * @returns {*}
         */
		getClassDefParent: function(classDef)
		{
			var parent = null;
			var className = classDef['name'];
			for(key in this.classes)
			{
				var tClassDef = this.classes[key];
				for(ke2 in tClassDef.classDefIds)
				{
					var tClassDefId = tClassDef.classDefIds[ke2];
					if(typeof tClassDefId != "undefined" && tClassDefId != null)
					{
						if(classDef.id == tClassDefId)
						{
							parent = tClassDef;
							break;
						}
					}
				}
				if(parent != null)
				{
					break;
				}
			}
			return parent;
		},

        /**
         * Returns all of the attributes in the schema
         */
        getAllSchemaAttributes: function()
        {
            var attributes = [];
            for (key in CR.app.controller.AnnotationNatureController.attributes) // attributes of the currently selected schema
            {
                var attributeDef = CR.app.controller.AnnotationNatureController.attributes[key];
                if(attributeDef)
                {
                    var attribute = {};
                    attribute.attributeDef = attributeDef;
                    attribute.value = 0;
                    if(attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_NUMERIC || attribute.attributeDef.type == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_OPTION)
                    {
                        attribute.isNumeric = true;
                    }
                    attributes.push(attribute);
                }
            }
            return attributes;
        },

        getNewAnnotations: function()
        {
            var newAnnotations = [];

            // Sort the clinical elements into principal clinical element groups (principal clinical elements are tasks).
            var principalClinicalElementsById = {};
            var clinicalElementsByPrincipalClinicalElementId = {}; // The list of clinical elements that belong to a principal (including the principal)
            for(clinicalElementId in this.principalClinicalElementsById)
            {
                var clinicalElement = this.principalClinicalElementsById[clinicalElementId];
                var principalClinicalElementId = clinicalElement.principalClinicalElementId;
                if(!principalClinicalElementId)
                {
                    // This is a principal clinical element.
                    principalClinicalElementId = clinicalElement.id;
                    principalClinicalElementsById[principalClinicalElementId] = clinicalElement;
                }
                var clinicalElements = clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId]
                if(!clinicalElements)
                {
                    clinicalElements = [];
                }
                clinicalElements.push(clinicalElement);
                clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId] = clinicalElements;
            }

            // Look for new annotations on each principal clinical element (task)
            for(principalClinicalElementId in clinicalElementsByPrincipalClinicalElementId)
            {
                var clinicalElements = clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId];
                for(clinicalElementKey in clinicalElements)
                {
                    var clinicalElement = clinicalElements[clinicalElementKey];
                    var clinicalElementAnnotations = this.annotationsById[clinicalElement.id];
                    if(clinicalElementAnnotations)
                    {
                        for(var i = 0; i < clinicalElementAnnotations.length; i++)
                        {
                            var annotation = clinicalElementAnnotations[i];
                            if(annotation.isNew)
                            {
                                newAnnotations.push(annotation);
                            }
                        }
                    }
                }
            }
            return newAnnotations;
        },

        /**
         * This is the main client/server synchronization method.  It submits annotations that have been created
         * for the current task (if any) and gets a new task.  Note that in the case of save, the new task could be the current
         * task again.  Part of the sync() thread.
         * @param jumpToHomePageAfter - if true, jumps to the home page after this function is complete.  On error we need to not jump home, however...
         * @param resetAnnotationAware - if true, resets the annotation aware after this function is complete.
         */
        doSync: function(jumpToHomePageAfter, resetAnnotationAware)
        {
            this.fireAnnotationAwareEvent('beforeSync');

            // If there is not a current task, then just load tasks.
            if(this.selectedPrincipalClinicalElement==null)
            {
                CR.app.controller.AnnotationNatureController.loadTasks(jumpToHomePageAfter);
            }
            else
            {
                this.submitAnnotations(jumpToHomePageAfter, resetAnnotationAware); // This chains forward on callbacks to loadTasks.
            }
            if(resetAnnotationAware == true)
            {
                CR.app.controller.AnnotationNatureController.resetAnnotationAware();
            }
        },

        /**
         * This function loads / reloads tasks from the server as part of a sync() with the server.  Part of the sync() thread.
         */
		loadTasks: function(jumpToHomePageAfter)
		{			
			// First, clear all task / annotation data.

			this.principalClinicalElementsById = [];
			this.annotationsById = [];

            var mdl = null;

            if (CR.app.controller.AnnotationNatureController.taskId) {
//                mdl.getProxy().url = 'annotation/getTaskByTaskId?taskId='+CR.app.controller.AnnotationNatureController.taskId + "&taskType=" + CR.app.controller.AnnotationNatureController.taskType;
                mdl = Ext.data.schema.Schema.lookupEntity('CR.app.model.AnnotationTaskModelByTaskId');
//                mdl.getProxy().url = 'annotation/getTaskByTaskId';
                mdl.getProxy().setExtraParams({
                    taskId: CR.app.controller.AnnotationNatureController.taskId,
                    taskType: CR.app.controller.AnnotationNatureController.taskType
                });
            } else {
//                mdl.getProxy().url = 'annotation/getTask?projectId='+CR.app.controller.AnnotationNatureController.projectId+'&processId='+CR.app.controller.AnnotationNatureController.processId;
                mdl = Ext.data.schema.Schema.lookupEntity('CR.app.model.AnnotationTaskModelByProcessId');
//                mdl.getProxy().url = 'annotation/getTask';
                mdl.getProxy().setExtraParams({
                    projectId: CR.app.model.CRAppData.projectId,
                    processId: CR.app.model.CRAppData.processId
                });
            }
	    	CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading Task...");
            mdl.load('', {
                success: function(response, operation) {
					if(response.raw.firstElementChild)
					{
						CR.app.controller.AnnotationNatureController.setTask(response.raw);
					}
					else
					{
                        CR.app.controller.AnnotationNatureController.doNoTaskExit("No tasks found");
					}
	                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Task...");
				},
                failure: function(response, operation) {
                    CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Task...");
                    CR.app.controller.AnnotationNatureController.doNoTaskExit("Error loading tasks");
                }
			});
			var cmps = Ext.ComponentQuery.query("[annotationaware=true]");
			for(key in cmps)
			{
				cmps[key].render();
			}
		},

        /**
         * Show a message box with the given task loading error message and then EXIT this part of the application by
         * redirecting back to the chart review home page.  Part of the sync() thread.
         * @param msg
         */
        doNoTaskExit: function(msg)
        {
            Ext.MessageBox.show({
                title: '',
                msg: msg,
                buttons: Ext.Msg.OK,
                closable:false,
                icon: Ext.MessageBox.INFO,
                fn: function()
                {
                    var baseUrl = window.location.origin + "/chart-review/";
                    window.top.location.assign(baseUrl);
                }
            });
        },

        /**
         * Set the current task.  Part of the sync() thread.
         * @param taskNode
         */
		setTask: function(taskNode)
		{
			var me = this;
			if(!taskNode)
			{
				alert('No task could be found for the current user.');
				this.unblockAfterLoading("Set Task");
			}	
			else
			{
                // Set the schema for the whole task.
				var schemaList = taskNode.getElementsByTagName('schema');
				if(schemaList && schemaList.length>0 && schemaList[0].getAttributeNode('id'))
				{
                    // Re-use the cached schema, if it is found.  NOTE: It is very likely that the next task a user
                    // gets will be a task with the same schema as the last task, so cache the schema rather than reloading.
					var schemaId = schemaList[0].getAttributeNode('id').value;
					if(schemaId==this.selectedSchemaID)
					{
						me.setTaskAux(taskNode);
					}
					else
					{
                        // Load a new schema, if necessary.
						var mdl = Ext.data.schema.Schema.lookupEntity('CR.app.model.AnnotationSchemaModel');
						mdl.schemaId = schemaId;
						mdl.taskNode = taskNode;
                        CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading AnnotationSchema...");
						mdl.load(schemaId, {
							scope: mdl,
							success: function(schema) {
								CR.app.controller.AnnotationNatureController.setSchemaXML(this.schemaId, schema.raw);
								var a = CR.app.controller.AnnotationNatureController.attributes;
								var c = CR.app.controller.AnnotationNatureController.classes;
								var l = CR.app.controller.AnnotationNatureController.classRels;
								me.setTaskAux(taskNode);
				                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading AnnotationSchema...");
							},
							failure: function(schema) {
				                CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading AnnotationSchema...");
                                alert('Failed to load schema.');
							}
						});
					}
				}
				else
				{
					alert('AnnotationSchema ID could not be found!');
				}			
			}
		},

        /**
         * The part of setting the current task that happens after a schema is found/retrieved.
         * Parse the task xml and get/create the principal clinical element from the task.  Part of the sync() thread.
         * @param taskNode
         */
		setTaskAux: function(taskNode)
		{
            // Expecting only one for now...
            var taskElementList = taskNode.getElementsByTagName('task');
            var taskElement = taskElementList[0];

            // Parse task xml into readable local variables for clarity
            var taskId = taskElement.getAttributeNode('id').value;
            var taskName = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('name')[0]);
            var taskProjectDocument = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('projectDocument')[0]);
            var taskDetailedDescription = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('detailedDescription')[0]);
            var clinicalElementConfigurationElement = taskElement.getElementsByTagName('clinicalElementConfiguration')[0];
            var clinicalElementConfigurationId = clinicalElementConfigurationElement.getAttributeNode('id').value;
            var clinicalElementConfigurationName = clinicalElementConfigurationElement.textContent;
            var clinicalElementElement = taskElement.getElementsByTagName('clinicalElement')[0];
            var clinicalElementId = clinicalElementElement.getAttributeNode('id').value;
            var clinicalElementName = clinicalElementElement.textContent;
            var dateAssigned = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('dateAssigned')[0]);
            var dateModified = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('dateModified')[0]);
            var schemaElement = taskElement.getElementsByTagName('schema')[0];
            var schemaId = schemaElement.getAttributeNode('id').value;
            var schemaName = schemaElement.textContent;
            var status = CR.app.controller.AnnotationNatureControllerText.getTextValue(taskElement.getElementsByTagName('status')[0]);
            var contextElementTypes = [];
            for(j=0;j<taskElement.getElementsByTagName('contextElementType').length;j++)
            {
                var contextElementTypeNode = taskElement.getElementsByTagName('contextElementType')[j];
                var contextElementTypeName = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeNode.getElementsByTagName('name')[0]);
                var contextElementTypeTypeNode = contextElementTypeNode.getElementsByTagName('type')[0];
                var contextElementTypeTypeName = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeTypeNode.getElementsByTagName('name')[0]);
                var contextElementTypeTypeId = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeTypeNode);
                var contextElementAllowAnnotation = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeNode.getElementsByTagName('allowAnnotation')[0]);
                var contextElementHidden = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeNode.getElementsByTagName('hidden')[0]);
                var contextElementSequence = CR.app.controller.AnnotationNatureControllerText.getTextValue(contextElementTypeNode.getElementsByTagName('sequence')[0]);
                var contextElementType = CR.app.controller.AnnotationNatureController.createContextElementType(
                    contextElementTypeName,
                    contextElementTypeTypeName,
                    contextElementTypeTypeId,
                    contextElementAllowAnnotation,
                    contextElementHidden,
                    contextElementSequence);
                contextElementTypes.push(contextElementType);
            }
            var principalClinicalElementId = null;

            // Create a clinical element from the task local variables
            // A clinical element in this code is a combination "document" and task...
            var newClinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElement(
                clinicalElementId, // id
                clinicalElementName, // name
                taskId, // taskId
                taskName, // taskName
                taskProjectDocument, // taskProjectDocument
                taskDetailedDescription, // taskDetailedDescription
                clinicalElementConfigurationId, // clinicalElementConfigurationId
                clinicalElementConfigurationName, // clinicalElementConfigurationName
                dateAssigned, // dateAssigned
                dateModified, // dateModified
                schemaId, // schemaId
                schemaName, // schemaName
                status, // status
                contextElementTypes, // contextElementTypes
                principalClinicalElementId, // principalClinicalElementId,
                '', // dateCompleted,
                false, // isContext,
                false); // isNew
            this.principalClinicalElementsById[clinicalElementId] = newClinicalElement;
            CR.app.controller.AnnotationNatureController.setSelectedPrincipalClinicalElement(newClinicalElement);
            CR.app.controller.AnnotationNatureControllerAnnotations.loadAnnotationsForTasks();
        },

		/**
		 * This method calls a service for each clinicalElement that has annotations.  NOTE: Task completion status
         * is returned to the server as part of this submitAnnotations call.  Part of the sync() thread.
		 * It uses a counter to confirm that all individual requests are finished, then on the last one, calls loadTasks().
         * @param jumpToHomePageAfter - if true, jumps to the home page after this function is complete.  On error we need to not jump home, however...
		 */
		submitAnnotations: function(jumpToHomePageAfter, resetAnnotationAware)
		{
			var tempid = CR.app.controller.AnnotationNatureController.curTempId;
			this.submitAnnotationsPrincipalClinicalElementCount = 0;

            // Sort the clinical elements into principal clinical element groups (principal clinical elements are tasks).
            var principalClinicalElementsById = {};
            var clinicalElementsByPrincipalClinicalElementId = {}; // The list of clinical elements that belong to a principal (including the principal)
            for(clinicalElementId in this.principalClinicalElementsById)
            {
                var clinicalElement = this.principalClinicalElementsById[clinicalElementId];
                var principalClinicalElementId = clinicalElement.principalClinicalElementId;
                if(!principalClinicalElementId)
                {
                    // This is a principal clinical element.
                    principalClinicalElementId = clinicalElement.id;
                    principalClinicalElementsById[principalClinicalElementId] = clinicalElement;
                }
                var clinicalElements = clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId]
                if(!clinicalElements)
                {
                    clinicalElements = [];
                }
                clinicalElements.push(clinicalElement);
                clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId] = clinicalElements;
            }

            // We call submitAnnotations once for each principal clinical element (task)
            for(principalClinicalElementId in clinicalElementsByPrincipalClinicalElementId)
            {
                var clinicalElements = clinicalElementsByPrincipalClinicalElementId[principalClinicalElementId];
                var mdl = Ext.create('CR.app.model.AnnotationSubmitAnnotationsModel');
                var d1 = new Date();
                var today = Ext.Date.format(d1, "Y-m-d\\TH:i:s\\Z");
                var annotationsToSubmit = [];
                for(clinicalElementKey in clinicalElements)
                {
                    var clinicalElement = clinicalElements[clinicalElementKey];
                    var clinicalElementAnnotations = this.annotationsById[clinicalElement.id];
                    if(clinicalElementAnnotations)
                    {
                        for(var i = 0; i < clinicalElementAnnotations.length; i++)
                        {
                            var annotation = clinicalElementAnnotations[i];
                            var spans = [];
                            for(var j = 0; j < annotation.spans.length; j++)
                            {
                                var span = annotation.spans[j];
                                var escapedText = CR.app.controller.AnnotationNatureControllerText.doEscapeHtml(span.text);
                                spans.push({
                                    '@id':span.id,
                                    'clinicalElementField':{
                                        '@id':span.filter
                                    },
                                    'startOffset':span.textStart,
                                    'endOffset':span.textStop,
                                    'text':escapedText
                                })
                            }
                            var features = [];
                            for(var j = 0; j < annotation.features.length; j++)
                            {
                                var feature = annotation.features[j];
                                var elements = [];
                                for(var k = 0; k < feature.elements.length; k++)
                                {
                                    var element = feature.elements[k];
                                    var escapedElementValue = CR.app.controller.AnnotationNatureControllerText.doEscapeHtml(element.value);
                                    elements.push({
                                        '@id':element.id,
                                        'value':escapedElementValue,
                                        'schemaRef':{
                                            '@id':element.schemaRefId,
                                            '@uri':element.schemaRefUri
                                        }
                                    })
                                }
                                features.push({
                                    '@id':feature.id,
                                    '@type':feature.type,
                                    'name':feature.name,
                                    'schemaRef':{
                                        '@id':feature.schemaRefId,
                                        '@uri':feature.schemaRefUri
                                    },
                                    'elements':{'element':elements}
                                })
                            }
                            annotationsToSubmit.push({
                                '@id':annotation.id,
                                'schema':{
                                    '@id':annotation.schemaId
                                },
                                'schemaRef':{
                                    '@id':annotation.schemaRefId,
                                    '@uri':annotation.schemaRefUri
                                },
                                'creationDate':annotation.creationDate,
                                'clinicalElementConfiguration':{
                                    '@id':annotation.clinicalElementConfigurationId
                                },
                                'clinicalElement':{
                                    '@id':annotation.clinicalElementId
                                },
                                'spans':{'span':spans},
                                'features':{'feature':features}
                            });
                        }
                    }
                }
                mdl.data = {'annotations':{'annotation':annotationsToSubmit}};
                this.submitAnnotationsPrincipalClinicalElementCount++;
                var principalClinicalElement = clinicalElement.principalClinicalElementId != null ?
                                                    principalClinicalElementsById[clinicalElement.principalClinicalElementId] :
                                                    principalClinicalElementsById[clinicalElement.id];
                var url = 'annotation/submitAnnotations?taskId='+principalClinicalElement.taskId+'&status='+principalClinicalElement.status;
                if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElementStatusComment != null && CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElementStatusComment.length > 0)
                {
                    url += '&statusComment='+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElementStatusComment;
                }
                var proxy = mdl.getProxy();
                proxy.url = url;
                CR.app.controller.AnnotationNatureController.blockWhileLoading("Submitting Annotations...");
                mdl.save({
                    success: function(schema) {
                        CR.app.controller.AnnotationNatureController.unblockAfterLoading("Submitting Annotations...");
                        CR.app.controller.AnnotationNatureController.submitAnnotationsPrincipalClinicalElementCount--;
                        // We want to do this when all annotation submissions are returned - ONE TIME ONLY.
                        if(CR.app.controller.AnnotationNatureController.submitAnnotationsPrincipalClinicalElementCount==0 && jumpToHomePageAfter == false && resetAnnotationAware == true)
                        {
                            // Task status was sent by submitAnnotations, so just load new tasks.
                            CR.app.controller.AnnotationNatureController.loadTasks(jumpToHomePageAfter);
                        }
                        else if (jumpToHomePageAfter)
                        {
                            var baseUrl = window.location.origin + "/chart-review/";
                            window.top.location.assign(baseUrl);
                        }
                    },
                    failure: function(schema) {
                        CR.app.controller.AnnotationNatureController.unblockAfterLoading("Submitting Annotations...");
                        CR.app.controller.AnnotationNatureController.submitAnnotationsPrincipalClinicalElementCount--;
                        alert('Failed to submit annotations.');
                    }
                });
            }
            CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElementStatusComment = "";
            CR.app.controller.AnnotationNatureController.curTempId = tempid;
		},

        /**
         * Saves the schema by parsing the response node from the AnnotationAdmin getAnnotationSchema(int id) request.
         * @param id
         * @param xmldoc
         */
		setSchemaXML: function(id, xmldoc)
		{
			// Translate the response into something usable.
			var crSchema = [];
			
			var schemaNodeList = xmldoc.getElementsByTagName('annotationSchema');
			var schemaNode = schemaNodeList[0];
			
			var nameNodeList = schemaNode.getElementsByTagName('name');
			var nameNode = nameNodeList[0];
			
			this.schemaName = "Schema: " + nameNode.textContent;
			this.attributes = this.getAttributesFromXMLTags(xmldoc);
			this.classes = this.getClassesFromXMLTags(xmldoc);
			this.classRels = this.getClassRelsFromXMLTags(xmldoc);

			var classNodeList = xmldoc.getElementsByTagName('classDef');

            var comps = Ext.ComponentQuery.query('[annotationAware=true]');
			for (key in comps) {
                var keyStr = key;
                var component = comps[keyStr];
				component.fireEvent('schemaLoaded');
			}

			this.schemaElements = [];
			for(key in this.attributes)
			{
				this.schemaElements[key] = this.attributes[key];
			}
			for(key in this.classes)
			{
				this.schemaElements[key] = this.classes[key];
			}
			for(key in this.classRels)
			{
				this.schemaElements[key] = this.classRels[key];
			}	
			this.selectedSchemaID = id;
		},

        /**
         * Saving schema attributes - from schema xml returned from server.
         * @param xmldoc
         * @returns {Array}
         */
		getAttributesFromXMLTags: function(xmldoc)
		{
			var attributes = [];
            // First, get all attributes.
			var attributeNodeList = xmldoc.getElementsByTagName('attributeDef');
			for(i = 0; i<attributeNodeList.length; i++)
			{
				var ael = attributeNodeList[i];
				if(ael.getAttributeNode('id').value)
				{
					var attribute = {};
					attribute.id = ael.getAttributeNode('id').value;
					attribute.type = ael.getAttributeNode('type').value;
					for(j=0;j<ael.childNodes.length;j++)
					{
						var cn = ael.childNodes[j];
						if(cn.tagName=='name')
						{
							attribute.name = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
						}
						else if(cn.tagName=='color')
						{
							attribute.color = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
						}
                        else if(cn.tagName=='numericLow')
                        {
                            attribute.numericLow = CR.app.controller.AnnotationNatureControllerText.getNumberValue(cn);
                        }
                        else if(cn.tagName=='numericHigh')
                        {
                            attribute.numericHigh = CR.app.controller.AnnotationNatureControllerText.getNumberValue(cn);
                        }
                        else if(cn.tagName=='minDate')
                        {
                            attribute.minDate = CR.app.controller.AnnotationNatureControllerText.getDateValue(cn);
                        }
                        else if(cn.tagName=='maxDate')
                        {
                            attribute.maxDate = CR.app.controller.AnnotationNatureControllerText.getDateValue(cn);
                        }
						else if(cn.tagName=='attributeDefOptionDefs')
						{
							var options = [];
							for(k=0;k<cn.childNodes.length; k++)
							{
								var o = cn.childNodes[k];
								if(o.tagName=='attributeDefOptionDef' && o.getAttributeNode('id'))
								{
									options[o.getAttributeNode('id').value] = CR.app.controller.AnnotationNatureControllerText.getTextValue(o);//.textContent;
								}
							}
							if(Object.keys(options).length>0)
							{
								attribute.options = options;
							}
						}
					}
					attribute.schemaRefUri = this.getSchemaRefUri(ael);
                    var fieldName = attribute.id;
					attributes[fieldName] = attribute;
				}
				else
				{
					console.log('Attribute found with no ID!');
				}
			}
			return attributes;
		},

        /**
         * Find the schema ref uri from the given schema element - from schema xml returned from server.
         * @param element
         * @returns {*}
         */
		getSchemaRefUri: function(element)
		{
			if(element.tagName=='annotationSchema')
			{
				return 'annotationSchema:'+element.getAttributeNode('id').value;
			}
			else if(element.parentNode)
			{
				if(element.tagName=='classDef')
				{
					return this.getSchemaRefUri(element.parentNode)+';'+element.tagName+':'+element.getAttributeNode('id').value;
				}
				else if(element.tagName=='attributeDef')
				{
					return this.getSchemaRefUri(element.parentNode)+';'+element.tagName+':'+element.getAttributeNode('id').value;
				}
				else if(element.tagName=='classRelDef')
				{
					return this.getSchemaRefUri(element.parentNode)+';'+element.tagName+':'+element.getAttributeNode('id').value;
				}	
				else if(element.tagName=='attributeDefOptionDef')
				{
					return this.getSchemaRefUri(element.parentNode)+';'+element.tagName+':'+element.getAttributeNode('id').value;
				}
				else
				{
					return this.getSchemaRefUri(element.parentNode);
				}
			}
		},

        /**
         * Saving schema classes - from schema xml returned from server.
         * @param xmldoc
         * @returns {Array}
         */
        getClassesFromXMLTags: function(xmldoc)
		{
            var classes = [];
            var classNodeList = xmldoc.getElementsByTagName('classDef');
            for(i = 0; i<classNodeList.length; i++)
            {
                var cel = classNodeList[i];
                if(cel.getAttributeNode('id').value)
                {
                    var clazz = {};
                    clazz.id = cel.getAttributeNode('id').value;
                    for(j=0;j<cel.childNodes.length;j++)
                    {
                        var cn = cel.childNodes[j];
                        if(cn.tagName=='name')
                        {
                            clazz.name = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
                        }
                        else if(cn.tagName=='color')
                        {
                            clazz.color = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
                        }
                        else if(cn.tagName=='classDefIds')
                        {
                            var classDefIds = [];
                            for(k=0;k<cn.childNodes.length; k++)
                            {
                                var o = cn.childNodes[k];
                                if(cn.tagName=='classDefId' && o.getAttributeNode('id'))
                                {
                                    classDefIds.push(o.getAttributeNode('id').value);
                                }
                            }
                            if(classDefIds.length>0)
                            {
                                clazz.classDefIds = classDefIds;
                            }
                        }
                        else if(cn.tagName=='attributeDefIds')
                        {
                            var attributeDefIds = [];
                            for(k=0;k<cn.childNodes.length; k++)
                            {
                                var o = cn.childNodes[k];
                                if(o.tagName=='attributeDefId' && o.getAttributeNode('id'))
                                {
                                    attributeDefIds.push(o.getAttributeNode('id').value);
                                }
                            }
                            if(attributeDefIds.length>0)
                            {
                                clazz.attributeDefIds = attributeDefIds;
                            }
                        }
                    }
                    clazz.schemaRefUri = this.getSchemaRefUri(cel);
                    clazz.type = 2;
                    var fieldName = clazz.id;
                    classes[fieldName] = clazz;
                }
                else
                {
                    console.log('Class found with no ID!');
                }
            }
			return classes;
		},

        /**
         * Saving schema class relationships - from schema xml returned from server.
         * @param xmldoc
         * @returns {Array}
         */
		getClassRelsFromXMLTags: function(xmldoc)
		{
			var rels = [];
			var relNodeList = xmldoc.getElementsByTagName('classRelDef');
			for(i = 0; i<relNodeList.length; i++)
			{
				var relNode = relNodeList[i];
				if(relNode.getAttributeNode('id').value)
				{
					var rel = {};
					rel.id = relNode.getAttributeNode('id').value;
					for(j=0;j<relNode.childNodes.length;j++)
					{
						var cn = relNode.childNodes[j];
						if(cn.tagName=='name')
						{
							rel.name = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
						}
						else if(cn.tagName=='color')
						{
							rel.color = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
						}
                        else if(cn.tagName=='leftClassDefIds')
                        {
                            var leftClassDefIds = [];
                            for(k=0;k<cn.childNodes.length; k++)
                            {
                                var o = cn.childNodes[k];
                                if(cn.tagName=='classDefId' && o.getAttributeNode('id'))
                                {
                                    leftClassDefIds.push(o.getAttributeNode('id').value);
                                }
                            }
                            if(leftClassDefIds.length>0)
                            {
                                rel.leftClassDefIds = leftClassDefIds;
                            }
                        }
                        else if(cn.tagName=='rightClassDefIds')
                        {
                            var rightClassDefIds = [];
                            for(k=0;k<cn.childNodes.length; k++)
                            {
                                var o = cn.childNodes[k];
                                if(cn.tagName=='classDefId' && o.getAttributeNode('id'))
                                {
                                    rightClassDefIds.push(o.getAttributeNode('id').value);
                                }
                            }
                            if(rightClassDefIds.length>0)
                            {
                                rel.rightClassDefIds = rightClassDefIds;
                            }
                        }
						else if(cn.tagName=='attributeDefIds')
						{
							var attributeDefIds = [];
							for(k=0;k<cn.childNodes.length; k++)
							{
								var o = cn.childNodes[k];
                                if(cn.tagName=='attributeDefId' && o.getAttributeNode('id'))
								{
									attributeDefIds.push(o.getAttributeNode('id').value);
								}
							}
							if(attributeDefIds.length>0)
							{
								rel.attributeDefIds = attributeDefIds;
							}
						}
					}
					rel.schemaRefUri = this.getSchemaRefUri(relNode);
					rel.type = 3;

                    var fieldName = rel.id;
                    rels[fieldName] = rel;
				}
				else
				{
					console.log('Class Relationship found with no ID!');
				}
			}
//            var sortOrderNodeList = xmldoc.getElementsByTagName('annotationSchemaClassRelDefSortOrder');
//            for(i = 0; i<sortOrderNodeList.length; i++)
//            {
//                var cel = sortOrderNodeList[i];
//                if(cel.getAttributeNode('id').value)
//                {
//                    var sortOrder = {};
//                    sortOrder.id = cel.getAttributeNode('id').value;
//                    for(j=0;j<cel.childNodes.length;j++)
//                    {
//                        var cn = cel.childNodes[j];
//                        if(cn.tagName=='objId')
//                        {
//                            sortOrder.objId = CR.app.controller.AnnotationNatureControllerText.getTextValue(cn);//.textContent;
//                        }
//                        else if(cn.tagName=='sortOrder')
//                        {
//                            sortOrder.sortOrder = parseInt(CR.app.controller.AnnotationNatureControllerText.getTextValue(cn));//.textContent;
//                        }
//                    }
//                    for(var key in rels)
//                    {
//                        var rel = rels[key];
//                        if(rel.id==sortOrder.objId)
//                        {
//                            rel.sortOrder = sortOrder.sortOrder;
//                        }
//                    }
//                }
//                else
//                {
//                    console.log('Class Relationship Sort Order found with no ID!');
//                }
//            }
			return rels;
		},

        /**
         * Returns the currently selected schema.
         * @returns {*}
         */
		getSelectedSchema: function()
		{
			return this.schemasByRefID[this.selectedSchemaID];
		},

        /**
         * Sets the selected principal clinical element
         * @param clinicalElement
         */
        setSelectedPrincipalClinicalElement: function(clinicalElement)
        {
            if(this.selectedPrincipalClinicalElement)
            {
                this.setPreviouslySelectedPrincipalClinicalElement(this.selectedPrincipalClinicalElement);
            }
            if(clinicalElement)
            {
                this.selectedPrincipalClinicalElement = clinicalElement;
            }
            else
            {
                this.selectedPrincipalClinicalElement = null;
            }
            this.setSelectedClinicalElement(this.selectedPrincipalClinicalElement);
            this.setSelectedAnnotation(null);
        },

        /**
         * Sets the selected clinical element (principal or context element)
         * @param clinicalElement
         */
		setSelectedClinicalElement: function(clinicalElement)
		{
			if(clinicalElement)
			{
				this.selectedClinicalElement = clinicalElement;
			}
			else
			{
				this.selectedClinicalElement = null;
			}
		},

        /**
         * Sets the previously principal clinical element, if it is non-null
         */
        setPreviouslySelectedPrincipalClinicalElement: function(clinicalElement)
        {
            if(clinicalElement)
            {
                this.previouslySelectedPrincipalClinicalElement = clinicalElement;
            }
        },

        /**
         * Sets the selected annotation.
         * @param annotation
         */
		setSelectedAnnotation: function(annotation)
		{
			if(annotation)
			{
				CR.app.controller.AnnotationNatureController.selectedAnnotation = annotation;
			}
			else
			{
				CR.app.controller.AnnotationNatureController.selectedAnnotation = null;
			}
		},

        /**
         * Returns the selected annotation.
         * @returns {null}
         */
		getSelectedAnnotation: function()
		{
			return CR.app.controller.AnnotationNatureController.selectedAnnotation;
		},

        /**
         * General utility function to fire a named event to all classes that are annotation aware,
         * that have the annotationAware property set to true.
         * @param eventName
         */
		fireAnnotationAwareEvent: function(eventName)
		{
			var comps = Ext.ComponentQuery.query('component[annotationAware=true]');
			for (key in comps) {
				comps[key].fireEvent(eventName);
			}
		},

        /**
         * Sets a flag to indicate that all annotations for the currently selected task should be shown in the
         * annotations list, not just the annotations associated with the currently selected context clinical element.
         * @param showAll
         */
		setShowAllAnnotationsForSelectedTask: function(showAll)
		{
			this.showAllAnnotationsForSelectedTask = showAll;
		},

        /**
         * Returns the flag that indicates if all annotation for the currently selected task should be shown in the
         * annotations list, or just the annotations associated with the currently selected context clinical element.
         * @returns {boolean}
         */
		getShowAllAnnotationsForSelectedTask: function()
		{
			return this.showAllAnnotationsForSelectedTask;
		},

		blockWhileLoading: function(msg)
		{
			this.blockWhileLoadingCount = this.blockWhileLoadingCount + 1;
			var message = 'Loading Data...';
			if(msg)
			{
				message = msg;
			}	
			console.log("BLOCK count=" + this.blockWhileLoadingCount + " msg=" + message);
            var apnl = Ext.getCmp('app-viewport');
            if(apnl)
            {
                apnl.setLoading(false);
                apnl.setLoading(message, true);
            }
		},

		unblockAfterLoading: function(msg)
		{
			this.blockWhileLoadingCount = this.blockWhileLoadingCount - 1;
			var message = 'Loading Data...';
			if(msg)
			{
				message = msg;
			}	
			console.log("UNBLOCK count=" + this.blockWhileLoadingCount + " msg=" + message);
			if(this.blockWhileLoadingCount < 0)
			{
				this.blockWhileLoadingCount = 0;
			}
			if(this.blockWhileLoadingCount <= 0)
			{
				var apnl = Ext.getCmp('app-viewport');
				if(apnl)
				{	
					apnl.setLoading(false);
				}
			}
		},
		
		viewObj: function(obj)
		{
			var i = 0;
//			obj.collapsed = false;
//			obj.expand();
//			var b = "bb";
//        	this.collapsed = false;
//          var clinicalElementWidgetPanel = Ext.ComponentQuery.query('[id=app-panel]')[0];
//				var items = clinicalElementWidgetPanel.items.items;
//				for(var i = 0; i < items.length; i++)
//				{
//					var child = items[i];
//					child.collapsed = true;
//				}
//			obj.collapsed = false;
		},
	
    	doViewDefOnDataChanged: function(store, me) {
			var data = store.proxy.reader.rawData;
//			console.log(data);

    		// set/update the gridAdvisor if the metadata specifies one.
//    		if (data.meta.defaults && data.meta.defaults['extjs.gridAdvisor']) {
//    			var gridClass = data.meta.defaults['extjs.gridAdvisor'];
//    			if (!me.gridAdvisor || me.gridAdvisor['$className'] != gridClass) {
//    				me.gridAdvisor = Ext.create(gridClass);
//    			}
//    		}
    	
    		// If no columns are defined (first load or different viewdef) then reconfigure the grid with columns
			// Only try to do this if there is data - otherwise, the list configures blank and then subsequent displays of data are also blank.
			// If the first configuration happens when there is data, then subsequent displays with or without data display correctly...
			if (data.data.length > 0 && me.columns.length === 0) {
			    // FILTER EXPERIMENT
//				alert("columndata");
//				CR.app.controller.AnnotationNatureController.viewObj(data);
				me.reconfigure(null, me.gridAdvisor.defineColumns(me, data));
//				alert("afterreconfigure");
//				CR.app.controller.AnnotationNatureController.viewObj(me);
			}

			// Update the annotations with document data.
			for(var i = 0; i < data.data.length; i++)
			{
				var clinicalElement = data.data[i];
				CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotationsWithClinicalElementInfo(clinicalElement, me.clinicalElementDateCol, me.clinicalElementNameCol);
			}
			
			// overLimit flag on server should change the displayInfo
			// TODO: This doesn't seem to work yet.
			if (data.overLimit === true) {
				var toolbar = me.down('pagingtoolbar');
				if (toolbar) {
					console.log('updating toolbar');
					toolbar.displayInfo = "Displaying {0} - {1} of OVER {2}"
				}
			}
			
			// colapseGridIfEmpty
//			if (me.collapsible === true && me.collapseGridIfEmpty === true && (me.collapsed != (store.getCount() === 0))) {
//				me.toggleCollapse();
//			}
			
			// sortable or not?
			if (data.meta && data.meta.sortable) {
				me.sortableColumns = data.meta.sortable;
				me.headerCt.sortable = data.meta.sortable;
			}			
			
			var pageInfo = {
		            total : store.getTotalCount(),
		            currentPage : store.currentPage,
		            pageCount: Math.ceil(store.getTotalCount() / store.pageSize),
		            fromRecord: Math.min(store.getTotalCount(), ((store.currentPage - 1) * store.pageSize) + 1),
		            toRecord: Math.min(store.currentPage * store.pageSize, store.getTotalCount())
		        };
			
			// update the grid title (if any)
			if (Ext.isObject(me.titleTpl)) {
				// Recalculate the template variables and reapply the template
				// TODO: refactor this into a function?
				me.setTitle(me.titleTpl.apply(pageInfo));
			}
			
			// Update the paging tool bar data - doesn't do it by itself when page size is so large.
			var toolbar = me.down('pagingtoolbar');
			if (toolbar) {
				// Not sure why the standard message was displaying NaN - NaN of total - set the whole thing here.
				toolbar.displayMsg = "Displaying " + 1 + " - " + pageInfo.total + " of " + pageInfo.total;
			}

			// The annotation clinicalElementDate or clinicalElementName could have changed if it is referring to a document that was changed.
			CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationsMayHaveChanged');
		},
	
    	doViewDefSetViewDef: function(view, extraParams, me) {
    		var store = me.getStore();
        	
        	// calculate/update the current view/params and apply them to the proxy
        	me.curViewID = view;
        	me.curViewParams = Ext.apply({}, extraParams, me.viewParams);
        	if (me.pid) {
        		// if a patient context is set, ensure its passed through (overriding all other values)
        		Ext.apply(me.curViewParams, {'patient.id': me.pid, 'patient_id': me.pid, 'pid': me.pid});
        		// TODO: this is a little hacky, but it should cover all the different ways we have declared patient id for now
        	}
    		store.getProxy().setExtraParams(Ext.apply(me.curViewParams, {'view': me.curViewID}));
//    		store.getProxy().setExtraParams(Ext.apply(me.curViewParams, {'view': me.curViewID, 'timeout':2}));
//    		Ext.Ajax.timeout = 120000;  // This works - takes affect for whole UI after first fill of a view def.
    		
        	// if we are switching to a new viewdef (or just initalizing the first one)
        	if (me.curViewID != view || me.columns.length === 0) {
        		// initalize the current page/limit
        		store.currentPage = 1;
        		store.pageSize = me.curViewParams['row.count'];
        		
        		// clear out the store model and grid columns
        		this.columns = [];
        		store.model.prototype.fields.clear();
        	}
    		
    		// trigger (re)load of the store
        	// RBA Note: If we do not remove all things in the store, then the grid periodically goes blank even when data is loaded into the store.
        	// I think this may be because the load is called multiple times causing the grid to decide (in comparing store names/size/contents)
        	// not to redraw when the store is actually full of data or something like that.
        	CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading Patient Information: " + me.curViewID);
        	console.log("LOAD STORE curViewID="+me.curViewID);
        	me.down('pagingtoolbar').disable();
			store.proxy.timeout = 100000000;
        	store.removeAll();
    		store.loadPage(1, {
                callback : function(r, options, success) {
                    CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Patient Information: " + me.curViewID);
                	me.down('pagingtoolbar').enable();
               },
    			failure: function() {
                    CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Patient Information: " + me.curViewID);
    			}
            });
		}
	
	}
});

