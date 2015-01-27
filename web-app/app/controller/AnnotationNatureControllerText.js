/**
 * A class to hold all static text methods that are part of the annotation nature controller.
 */
Ext.define('CR.app.controller.AnnotationNatureControllerText',{
    statics:
    {
        /**
         * This removes all annotation html from the given the given annotation component text.
         */
        resetAnnotationHTML: function(annotationAware)
        {
            // Get the id of the rendered clinicalElement.
            if(annotationAware.clinicalElementId)
            {
                // Clear any existing markups.
                for(filter in CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent()))
                {
                    var el = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent())[filter];
                    CR.app.controller.AnnotationNatureControllerText.removeAllMarkedUpElements(el);
                }
                annotationAware.configureAnnotationToolbar();
            }
        },

        /**
         * This method marks up the given annotation component text with annotation html.
         */
        markupAnnotationHTML: function(annotationAware)
        {
            // Get the id of the rendered clinicalElement.
            if(annotationAware.clinicalElementId)
            {
                // First clear any existing markups.
                for(filter in CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent()))
                {
                    var el = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent())[filter];
                    CR.app.controller.AnnotationNatureControllerText.removeAllMarkedUpElements(el);
                }

                var annotationSuperSet = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotations(annotationAware.clinicalElementId);
                if(annotationSuperSet)
                {
                    // ASSUMPTION: There will be no more than one span per filter per annotation. That is the assumption.
                    for(filter in CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent()))
                    {
                        var spanMarkupData = [];
                        for(key in annotationSuperSet)
                        {
                            var annotation = annotationSuperSet[key];
                            var isSelectedAnnotation = CR.app.controller.AnnotationNatureController.selectedAnnotation == annotation;
                            for(ke2 in annotation.spans)
                            {
                                var span = annotation.spans[ke2];
                                if(span.filter == filter)
                                {
                                    spanMarkupData.push({
                                        'textStart':span.textStart,
                                        'textStop':span.textStop,
                                        'text':span.text,
                                        'filter':span.filter,
                                        'annotation':annotation,
                                        'color':annotation.color,
                                        'isSelectedAnnotation':isSelectedAnnotation,
                                        'selectionColor':CR.app.controller.AnnotationNatureController.DEFAULT_ANNOTATION_SELECTION_COLOR
                                    });
                                }
                            }
                        }
                        if(spanMarkupData && spanMarkupData.length>0)
                        {
                            // Get style indices by virtually stacking annotations on top of each other.
                            // Step 1: Sort annotations by start index.
                            var sortedSpanMarkups = [];
                            for(key in spanMarkupData)
                            {
                                sortedSpanMarkups.push(spanMarkupData[key]);
                            }
                            sortedSpanMarkups.sort(function(a1, a2){
                                return parseInt(a1['textStart']) - parseInt(a2['textStart']);
                            });

                            /*
                             * These are for the algorithm below. Meant to be temporary.
                             * This should be refactored into an object that will do the work
                             * It is safe for now because only one thread at a time will be in here,
                             * and they are cleared at the start.
                             * Still not best practice though.
                             */
                            annotationAware.styleTags = [];
                            annotationAware.processingAnnotations = [];
                            annotationAware.lastMark = null;

                            // Step 2: Find all stop points (each distinct index point, regardless of whether it is a start or stop.)
                            for(sa in sortedSpanMarkups)
                            {
                                var sortedSpanMarkup = sortedSpanMarkups[sa];
                                annotationAware.addStyleTagsForProcessedAnnotationsUpTo(sortedSpanMarkup['textStart']);
                                annotationAware.processingAnnotations.push(sortedSpanMarkup);
                                annotationAware.lastMark = sortedSpanMarkup['textStart'];
                            }

                            // One last piece for the last segment not covered by the above FOR loop.
                            var debug = annotationAware.styleTags;
                            annotationAware.addStyleTagsForProcessedAnnotationsUpTo(null);

                            // Step 3: For each unique span that contains annotation(s), generate a CSS tag that represents that stack of annotations.
                            var annotatableHTMLElements = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationAware.getAnnotationComponent()); /* TODO: REDIRECT */
                            for(key in annotatableHTMLElements)
                            {
                                var el = annotatableHTMLElements[key];

                                for(s in annotationAware.styleTags)
                                {
                                    var styleAnnotations = annotationAware.styleTags[s]['annotations'];
                                    if(styleAnnotations && styleAnnotations.length>0)
                                    {
                                        var filter = '';
                                        if(styleAnnotations[0]['filter'])
                                        {
                                            filter = styleAnnotations[0]['filter'];
                                        }
                                        if(key==filter)
                                        {
                                            // Put style in this HTML element by the offsets indicated.
                                            annotationAware.addStyleTagToElement(el, annotationAware.styleTags[s]);
                                        }
                                    }
                                }
                            }
                            // Step 4: For each CSS tag, be sure to place an attribute of "annotationStyleRefId".
                            // Step 5: For each CSS tag / ref ID, store in a map of these IDs to an array of annotations.
                        }
                    }
                }
                annotationAware.configureAnnotationToolbar();
                annotationAware.appendAnnotationsToAnnotationToolbar();
            }
        },

        /**
         * If the given class mixing in this annotation nature is a text component class, having a body.dom,
         * this function will try to scroll to the selected annotation.  TBD - need to give the charcters per line
         * estimate some attention, taking into consideration the width of this component (i.e. right-docked, bottom-docked, etc.)
         */
        scrollToSelectedAnnotation: function(annotationAware)
        {
            if(annotationAware && annotationAware.body && annotationAware.body.dom)
            {
                var selectedAnnotation = CR.app.controller.AnnotationNatureController.selectedAnnotation;
                var selectedClinicalElement = CR.app.controller.AnnotationNatureController.selectedClinicalElement;
                if(selectedAnnotation && selectedAnnotation.clinicalElementId == selectedClinicalElement.id)
                {
                    var spanStart = 0;
                    if(selectedAnnotation.spans.length > 0)
                    {
                        var span = selectedAnnotation.spans[0];
                        if(span.textStart > spanStart)
                        {
                            spanStart = span.textStart;
                        }
                    }
                    var str1 = annotationAware.body.dom.textContent.substring(0, spanStart);
                    var str1e = CR.app.controller.AnnotationNatureControllerText.doEscapeHtml(str1);
                    var str2 = annotationAware.body.dom.textContent;
                    var str2e = CR.app.controller.AnnotationNatureControllerText.doEscapeHtml(str2);
                    var textInfo = Ext.util.TextMetrics.measure(
                        annotationAware.body.dom,
                        str1e,
                        annotationAware.getWidth());
                    var textHeight = textInfo.height;
                    Ext.util.TextMetrics.destroy();
                    var fullTextInfo = Ext.util.TextMetrics.measure(
                        annotationAware.body.dom,
                        str2e,
                        annotationAware.getWidth());
                    var fullTextHeight = fullTextInfo.height;
                    var d = annotationAware.body.dom;
                    Ext.util.TextMetrics.destroy();
                    var scrollTop = textHeight * d.scrollHeight / fullTextHeight;
                    scrollTop -= 46; // annotation panel height
                    if(scrollTop < 0)
                    {
                        scrollTop = 0;
                    }
                    d.scrollTop = scrollTop - d.offsetHeight / 2;
                }
            }
        },

        /**
         * Estimate the number of lines in the text.
         * @param text - the text string
         * @param beforeIdx - the index, before which, the number of lines is being calculated.
         * @param approxCharPerLine - an estimate of the number of characters per line in this text component.
         * @returns {number} - the number of lines before the given index, in the given text.
         */
        getNumLines: function(text, beforeIdx, approxCharPerLine)
        {
            var numLines = 0;
            var numCharsInCurLine = 0;
            for(j=0; j<text.length && j < beforeIdx; j++)
            {
                var c = text[j];
                numCharsInCurLine++;
                if(c == "\n" || c == "\r")
                {
                    numLines++;
                    numCharsInCurLine = 0;
                }
                else if (numCharsInCurLine >= approxCharPerLine)
                {
                    numLines++;
                    numCharsInCurLine = 0;
                }
            }
            return numLines;
        },

        /**
         * For one annotation's start / stop / color, build a style tag for all elements within this span.
         * @param element - instance of Ext.Elememnt
         * @param color - instance of Ext.draw.Color - the color of the annotation span
         * @param start - Integer representing start position of annotation
         * @param stop - Integer representing stop position of annotation
         * @param isSelected - the annotation is the currently selected annotation
         * @param selectionColor - the color to use in showing that this element is part of the selected annotation
         * @param annotationIdsStr - the list of annotations to add the style color to.
         */
        annotateHTMLElementWithColor: function (element, color, start, stop, isSelected, selectionColor, annotationIdsStr) {
            /*
             * The purpose here is to find all elements that show text and process them.
             */
            var textOrBreakNodes = [];
            if (Ext.ieVersion > 0) {
                // On IE, we need to look for a node name, recursing ourselves, without a tree walker.
                this.getAllRawTextNodesFromInternetExplorerJavaScriptImplementation(element, textNodes);
            }
            else {
                // All other browsers, use a tree walker, filtering for text nodes.
                var iterator = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
                    return NodeFilter.FILTER_ACCEPT;
                } }, false);
                var child = iterator.nextNode();
                while (child) {
                    textOrBreakNodes[textOrBreakNodes.length] = child;
                    child = iterator.nextNode();
                }
            }

            var marking = false;
            var done = false;

            for (i = 0; i < textOrBreakNodes.length && !done; i++) {
                var child = textOrBreakNodes[i];
                var ofst = CR.app.controller.AnnotationNatureControllerText.getElementRawTextOffset(child, element);
                var end = ofst + CR.app.controller.AnnotationNatureControllerText.getTextValue(child).length;
                if (marking) {
                    // If we're already in the process of marking elements...
                    if (end < stop) {
                        // If the end does not finish off the annotation job...
                        this.markTextElementWithColor(child, color, 0, CR.app.controller.AnnotationNatureControllerText.getTextValue(child).length, isSelected, selectionColor, annotationIdsStr);
                        marking = true;
                    }
                    else {
                        // The end finishes this annotation. We can stop now.
                        this.markTextElementWithColor(child, color, 0, stop - ofst, isSelected, selectionColor, annotationIdsStr);
                        marking = false;
                        done = true;
                    }
                }
                else {
                    if (ofst <= start && end > start) {
                        // If the start of the annotation is within the bounds of this text field...
                        if (end > stop) {
                            // If the end finishes off the annotation, we can stop here.
                            this.markTextElementWithColor(child, color, start - ofst, stop - ofst, isSelected, selectionColor, annotationIdsStr);
                            marking = false;
                            done = true;
                        }
                        else {
                            // We need to mark it up, and note that we are still marking.
                            this.markTextElementWithColor(child, color, start - ofst, CR.app.controller.AnnotationNatureControllerText.getTextValue(child).length, isSelected, selectionColor, annotationIdsStr);
                            marking = true;
                        }
                    }
                }
            }
        },

        /**
         * Gets all the text nodes from the given element for the IE browser.
         * @param element - the element to search.
         * @param textOrBreakNodes - the text or break nodes that have been found.
         */
        getAllRawTextNodesFromInternetExplorerJavaScriptImplementation: function (element, textOrBreakNodes) {
//            var noteName = element.nodeName.toLowerCase();
//            if (nodeName == "#text" || nodeName == "#stext" || nodeName == "text" || nodeName == "stext"){// || element.nodeName == 'BR') {
//                textOrBreakNodes.push(element);
//            }
//            var child = element.firstChild;
//            while(child)
//            {
//                this.getAllRawTextNodesFromInternetExplorerJavaScriptImplementation(child, textOrBreakNodes);
//                child = child.nextSibling;
//            }
            // All other browsers, use a tree walker, filtering for text nodes.
            var iterator = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
                return NodeFilter.FILTER_ACCEPT;
            } }, false);
            var child = iterator.nextNode();
            while (child) {
                textOrBreakNodes[textOrBreakNodes.length] = child;
                child = iterator.nextNode();
            }
        },

        /**
         * At the level of an individual element that needs to be colored, this code creates that individual style tag.
         * @param element - instance of Ext.Elememnt
         * @param color - instance of Ext.draw.Color - the color of the annotation span
         * @param spos - Integer representing start position of annotation
         * @param epos - Integer representing stop position of annotation
         * @param isSelected - the annotation is the currently selected annotation
         * @param selectionColor - the color to use in showing that this element is part of the selected annotation
         * @param annotationIdsStr - the list of annotations to add the style color to.
         */
        markTextElementWithColor: function (element, color, spos, epos, isSelected, selectionColor, annotationIdsStr) {
            var txt = CR.app.controller.AnnotationNatureControllerText.getTextValue(element);//.textContent;
            var pel = element.parentNode;

            // I am going to pass the annotation ID into this element as its ID property.
            // I don't know enough about HTML to know whether or not the DOM enforces unique IDs on its elements.
            // I don't think so - but if we have issues when the annotation spans multiple elements, this might be a spot to check.
            // Mark up the text. Stick an ID in there to represent the annotation it came from.
            var borderStyle = isSelected ? "border-bottom: 1px solid " + selectionColor + ";" + "border-top: 1px solid " + selectionColor + ";" : "";
            var ts = "<text annotationIds='" + annotationIdsStr + "' style=\"background-color:" + color + ";" + borderStyle + "\">";
            var te = "</text>";
            var pre = txt.substring(0, spos);
            var mid = txt.substring(spos, epos);
            var post = txt.substring(epos, txt.length);
            txt = pre + ts + mid + te + post;

            /*
             * This element inserts itself above the element we are marking up
             * by breaking up the element into three pieces.
             */
            var newEl = document.createElement('stext');
            newEl.innerHTML = txt;
            // This is replacing a text node with a text / style / text node.
            // We can safely set an attribute on the new node that mirrors this.
            newEl.setAttribute('originalText', txt);
            newEl.setAttribute('name', 'annotationNatureMarkup');
            pel.replaceChild(newEl, element);
        },

        /**
         * Remove all previous markup-ed up elements from the given element.
         * A markup element will have a name of 'annotationNatureMarkup' and an 'originalText' attribute containing
         * the text that we will put back in the innerHTML of the node that we create to replace the previous
         * markup element.
         * @param element
         */
        removeAllMarkedUpElements: function (element) {
            var allAnnotationEndpoints = element.getElementsByTagName('stext');
            if (allAnnotationEndpoints) {
                for (i = 0; i < allAnnotationEndpoints.length; i++) {
                    var ael = allAnnotationEndpoints[i];
                    if (ael && ael.hasAttribute('name') && ael.hasAttribute('originalText') && ael.getAttributeNode('name').value == 'annotationNatureMarkup') {
                        var pel = ael.parentNode;
                        var txt = ael.getAttributeNode('originalText').value;
                        if (txt && pel) {
                            var newEl = document.createElement('stext');
                            newEl.innerHTML = CR.app.controller.AnnotationNatureControllerText.getTextValue(ael);//.textContent;
                            pel.replaceChild(newEl, ael);
                        }
                    }
                }
            }
        },

        /**
         * Replaces semicolons in the given string.
         * @param inval
         * @returns {*}
         */
        replaceSemicolons: function (inval) {
            var newVal = inval;
            while (newVal.indexOf(';') > -1) {
                var part1 = newVal.substring(0, newVal.indexOf(';'));
                var part2 = '';
                if (newVal.length > newVal.indexOf(';')) {
                    part2 = newVal.substring(newVal.indexOf(';') + 1);
                }
                newVal = part1 + '%3B' + part2;
            }
            return newVal;
        },

        /**
         * See header for ensureClinicalElementsAreLoaded.  SAVE THIS CONCEPT.
         * @param principalClinicalElement
         * @param clinicalElements
         */
        getExistingClinicalElementsFromContextElementIds: function (principalClinicalElement, clinicalElements) {
            var contextElementIds = "";
            var hasContextElements = false;
            for (var i = 0; i < clinicalElements.length; i++) {
                var clinicalElement = clinicalElements[i];
                if (clinicalElement.isContext) {
                    contextElementIds += this.replaceSemicolons(clinicalElement.id);
                    if (i < clinicalElements.length) {
                        contextElementIds += ",";
                        hasContextElements = true;
                    }
                }
            }
            if (hasContextElements) {
                var mdl = Ext.data.schema.Schema.lookupEntity('CR.app.AnnotationContextClinicalElementLoaderModel');
                mdl.getProxy().url = 'annotation/getAnalyteForContextElement/' + principalClinicalElement.id + '/' + principalClinicalElement.datasetId + '/' + principalClinicalElement.taskId + '/' + contextElementIds;
//                mdl.getProxy().setExtraParams({ REMEMBER TO USE THIS NEW extjs5 construct rather than accessing url directly.
//                    id: principalClinicalElement.id,
//                    datasetId: principalClinicalElement.taskId
//                    taskId: principalClinicalElement.taskId
//                });
                CR.app.controller.AnnotationNatureController.blockWhileLoading("Loading Context ClinicalElements...");
                mdl.load('', {
                    scope: mdl,
                    success: function (clinicalElementsNode) {
                        // Do this at the beginning; doing it at the end left the block on...TBD
                        CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Context ClinicalElements...");
                        if (clinicalElementsNode) {
                            var clinicalElementNodes = clinicalElementsNode.raw.getElementsByTagName('clinicalElement');
                            if (clinicalElementNodes && clinicalElementNodes.length > 0) {
                                for (var i = 0; i < clinicalElementNodes.length; i++) {
                                    var clinicalElementNode = clinicalElementNodes[i];
                                    // Get the pending clinicalElement that is waiting to be filled in with this more complete server information.
                                    var pClinicalElementId = clinicalElementNode.getAttributeNode('contextElementId').value;
                                    var pClinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[pClinicalElementId];
                                    pClinicalElement.id = clinicalElementNode.getAttributeNode('id').value;
                                    var asgnEl = clinicalElementNode.getElementsByTagName('clinicalElementTask');
                                    if (asgnEl && asgnEl.length > 0) {
                                        /*
                                         * In the case where the clinicalElement exists (because of previous tasks) but the clinicalElement has not yet
                                         * been used on the current task, the web service call returns the clinicalElement but not the clinicalElement task.
                                         * This is because each task has its own clinicalElementTask organizational unit for a given clinicalElement.
                                         */
                                        pClinicalElement.clinicalElementTaskId = asgnEl[0].getAttributeNode('id').value;
                                    }
                                    else {
                                        pClinicalElement.clinicalElementTaskId = 0;
                                    }
                                    pClinicalElement.isContext = true;
                                    //						alert('load context clinicalElementId='+this.pendingClinicalElement.id+' clinicalElementTaskId='+this.pendingClinicalElement.clinicalElementTaskId);
                                    CR.app.controller.AnnotationNatureController.principalClinicalElementsById[pClinicalElementId] = pClinicalElement;

                                    // If all annotations are showing for the principal clinicalElement, then context clinicalElement annotations are already loaded.
                                    if (!CR.app.controller.AnnotationNatureController.getShowAllAnnotationsForSelectedTask()) {
                                        // Need to load annotations for this clinicalElement and store them by id.
                                        CR.app.controller.AnnotationNatureControllerAnnotations.loadAnnotationsForContextClinicalElement(this.pendingClinicalElement);
                                    }
                                    else {
                                        var analteMap = CR.app.controller.AnnotationNatureController.principalClinicalElementsById;
                                        var annotationMap = CR.app.controller.AnnotationNatureController.annotationsById;
                                        // Need to refresh the drawing of annotations on the selected context clinicalElement, however.  This causes a refresh.
                                        CR.app.controller.AnnotationNatureController.annotationsById[pClinicalElementId] = CR.app.controller.AnnotationNatureController.annotationsById[pClinicalElementId];
                                        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationschanged');
                                    }
                                }
                            }
                        }
                        CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Context ClinicalElements...");
                    },
                    failure: function (clinicalElements) {
                        CR.app.controller.AnnotationNatureController.unblockAfterLoading("Loading Context ClinicalElements...");
                        alert('Failed to load context clinicalElement.');
                    }
                });
            }
        },

        /**
         * Remove the selection from the annotation toolbar component text, when we have already processed it.
         */
        removeCurrentAnnotationToolbarTextSelection: function () {
            if (window.getSelection) {  // all browsers, except IE before version 9
                selRange = window.getSelection();
                selRange.removeAllRanges();
            }
        },

        /**
         * This method will:
         * @param annotationComponent - the document element in which the document selection mouse event happened
         * @param annotationAware - the annotation aware component whose text we are marking up
         */
        handleAnnotationToolbarTextSelection: function (annotationToolbar, annotationAware, isDoubleClick) {
            var selRange;
            if (window.getSelection) {  // all browsers, except IE before version 9
                selRange = window.getSelection();
            }
            else {
                selRange = null;
                // This code does not work in IE prior to version 9.
            }
            if (selRange && selRange.rangeCount > 0) {
                var oneRange = selRange.getRangeAt(0);

                var startOffset = oneRange.startOffset; // Offset WITHIN the scope of the element that triggered the event.
                var endOffset = oneRange.endOffset; // Offset WITHIN the scope of the element that triggered the event.
                var startContainer = oneRange.startContainer;
                var endContainer = oneRange.endContainer;
                var spanContainer = oneRange.commonAncestorContainer;
                if (startOffset == endOffset && startContainer == endContainer && !isDoubleClick) {
                    // If there is no span, select an existing annotation.
                    // Find the classification string surrounding the event text position.
                    var id = annotationAware.clinicalElementId;
                    if (!id) {
                        alert('Cannot select annotation because id cannot be found for selected component.');
                        return;
                    }
                    var startContainer = oneRange.startContainer;
                    var endContainer = oneRange.endContainer;
                    var annotationId = startContainer.parentElement.getAttribute("annotationId");
                    var annotations = CR.app.controller.AnnotationNatureController.annotationsById[annotationAware.clinicalElementId];
                    var annotation = null;
                    if(annotationId)
                    {
                        for(key in annotations)
                        {
                            var tAnnotation = annotations[key];
                            if(tAnnotation.id == annotationId)
                            {
                                annotation = tAnnotation;
                                break;
                            }
                        }
                        if(annotation)
                        {
                            CR.app.controller.AnnotationNatureController.setSelectedAnnotation(annotation);
                            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserRecordLevel');
                        }
                    }
                }
            }
        },

        /**
         * Remove the selection from the annotation component text, when we have already processed it.
         */
        removeCurrentAnnotationComponentTextSelection: function () {
            if (window.getSelection) {  // all browsers, except IE before version 9
                selRange = window.getSelection();
                selRange.removeAllRanges();
            }
        },

        /**
         * This method will:
         *  1) Obtain current document selection,
         *  2) Walk DOM hierarchy from start element to end element of the selection range,
         *  3) For each AnnotatableHTMLElement found in its path, it will create a Span value under that element,
         *  4) It will collect all found elements with their spans attached and return them.
         * @param annotationComponent - the document element in which the document selection mouse event happened
         * @param annotationAware - the annotation aware component whose text we are marking up
         * Good site to understand this code: http://www.w3.org/TR/2000/REC-DOM-Level-2-Traversal-Range-20001113/ranges.html
         */
        handleAnnotationComponentTextSelection: function (annotationComponent, annotationAware, isDoubleClick) {
            if(CR.app.model.CRAppData.readOnly)
            {
                return;
            }
            var selRange;
            if (window.getSelection) {  // all browsers, except IE before version 9
                selRange = window.getSelection();
            }
            else {
                selRange = null;
                // This code does not work in IE prior to version 9.
            }
            if (selRange && selRange.rangeCount > 0) {
                var oneRange = selRange.getRangeAt(0);

                var startOffset = oneRange.startOffset; // Offset WITHIN the scope of the element that triggered the event.
                var endOffset = oneRange.endOffset; // Offset WITHIN the scope of the element that triggered the event.
                var startContainer = oneRange.startContainer;
                var endContainer = oneRange.endContainer;

                // Begin of compensation for FireFox oneRange difference when the start and end containers are different.
                // FF returns the parent sometimes (i.e. the "annotate to end of line" case) when selection falls on tag boundaries.
                // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
                // If the start is pointing to the parent, find the next text element after the start element.
                if(startContainer.nodeName != '#text' && startContainer.nodeName != '#stext')// && startContainer.nodeName != 'BR')
                {
                    var startNode = startContainer.childNodes[startOffset];
                    if(startNode)
                    {
                        if(startNode.nodeName == '#text' || startNode.nodeName == '#stext')
                        {
                            startContainer = startNode;
                            startOffset = startNode.length;
                        }
//                        else if (startNode.nodeName == 'BR') {
//                            if(startNode.hasAttribute('data-countas'))
//                            {
//                                var dataCountAsValue = startNode.getAttibute('data-countas');
//                                if(dataCountAsValue != "")
//                                {
//                                    startOffset = parseInt(dataCountAsValue);
//                                }
//                                else
//                                {
//                                    startOffset = 1;
//                                }
//                            }
//                            else
//                            {
//                                startOffset = 1;
//                            }
//                        }
                        else
                        {
                            var nextTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findNextTextOrBreakNode(startNode);
                            if(nextTextOrBreakNode)
                            {
                                startContainer = nextTextOrBreakNode;
                                startOffset = 0; // Beginning of that text...
                            }
                        }
                    }
                }
                // If the end is pointing to the parent, find the previous text element before the end element.
                if(endContainer.nodeName != '#text' && endContainer.nodeName != '#stext')// && endContainer.nodeName != 'BR')
                {
                    var endNode = endContainer.childNodes[endOffset];
                    if(endNode)
                    {
                        if(endNode.nodeName == '#text' || endNode.nodeName == '#stext')
                        {
                            endContainer = endNode;
                            endOffset = endNode.length;
                        }
//                        else if (endNode.nodeName == 'BR') {
//                            if(endNode.hasAttribute('data-countas'))
//                            {
//                                var dataCountAsValue = endNode.getAttibute('data-countas');
//                                if(dataCountAsValue != "")
//                                {
//                                    endOffset = parseInt(dataCountAsValue);
//                                }
//                                else
//                                {
//                                    endOffset = 1;
//                                }
//                            }
//                            else
//                            {
//                                endOffset = 1;
//                            }
//                        }
                        else
                        {
                            var previousTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findPreviousTextOrBreakNode(endNode);
                            if(previousTextOrBreakNode)
                            {
                                if(previousTextOrBreakNode.nodeName == '#text' || previousTextOrBreakNode.nodeName == '#stext')
                                {
                                    endContainer = previousTextOrBreakNode;
                                    endOffset = endContainer.length;
                                }
//                                else if (endNode.nodeName == 'BR') {
//                                    if(endNode.hasAttribute('data-countas'))
//                                    {
//                                        var dataCountAsValue = endNode.getAttibute('data-countas');
//                                        if(dataCountAsValue != "")
//                                        {
//                                            endOffset = parseInt(dataCountAsValue);
//                                        }
//                                        else
//                                        {
//                                            endOffset = 1;
//                                        }
//                                    }
//                                    else
//                                    {
//                                        endOffset = 1;
//                                    }
//                                }
                            }
                        }
                    }
                }
                // End of compensation for Firefox.

                var spanContainer = oneRange.commonAncestorContainer;
                if (startOffset == endOffset && startContainer == endContainer && !isDoubleClick) {
                    // If there is no span, select an existing annotation.
                    // Select the first annotation with a span surrounding the event text position.

                    // TODO: Implement popup menu for single-clicks (?)
                    //showPopupMenu(oneRange.commonAncestorContainer);

                    var id = annotationAware.clinicalElementId;
                    if (!id) {
                        alert('Cannot select annotation because id cannot be found for selected component.');
                        return;
                    }
                    var startContainer = oneRange.startContainer;
                    var endContainer = oneRange.endContainer;
                    var annotations = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsByLoc(id, spanContainer);
                    if (annotations.length > 0) {
                        var annotation = annotations[0];
                        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(annotation);
                        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserTextLevel');
                    }
                    else
                    {
                        // Otherwise, unselect any annotation.
                        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectionBlur');
                    }
                }
                else {
                    // If there is a span, create an annotation.  NOTE: the span may be created by a double click (browser selects word
                    // or a drag selection of arbitrary span).
//					var annotatedText = oneRange.toString();

                    // Find all the nodes that were marked as 'annotatable'
                    var annotatableHTMLElements = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotatableHTMLElements(annotationComponent);

                    var spanArray = CR.app.controller.AnnotationNatureControllerText.createSpans(startContainer, startOffset, endContainer, endOffset, spanContainer, annotatableHTMLElements);

                    if (spanArray && spanArray.length > 0) {
                        var schemaElement = null;
                        var comp = Ext.ComponentQuery.query('panel[id^=annotationschemapanel]')[0];
//                        console.log("COMP id="+comp.id + " itemId=" + comp.itemId);
                        var selMdl = comp.getSelectionModel();
                        if (selMdl) {
                            var selections = selMdl.selected;
                            if (selections) {
                                for (i = 0; i < selections.items.length; i++) {
                                    var selection = selections.items[i];
                                    if (selection && selection.data && selection.data.srcNode) {
                                        schemaElement = selection.data.srcNode;
                                    }
                                    if (selection && selection.data && selection.data.color) {
                                        color = selection.data.color;
                                    }
                                }
                            }
                        }
                        if (!schemaElement) {
                            alert('A schema element must be selected for annotation.');
                            return;
                        }

                        /*
                         * This needs to change. The calling component will need to item the selected clinicalElement to this function.
                         */
                        if (!annotationComponent) {
                            alert('Cannot add annotation without selected component.');
                            return;
                        }
                        var clinicalElementId = annotationAware.clinicalElementId;
                        if (!clinicalElementId) {
                            alert('Cannot add annotation because id cannot be found for selected component.');
                            return;
                        }

                        var principalClinicalElement = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement;

                        // Ensure that the context clinical element exists if it does not already.
                        var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId];
                        if(!clinicalElement)
                        {
                            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(annotationComponent.clinicalElementConfigurationId);
                            clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElementFromPrincipalClinicalElement(clinicalElementId, clinicalElementConfiguration.dataIndex, clinicalElementConfiguration.text, principalClinicalElement);
                            CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId] = clinicalElement;

                            // In the this case of direct annotation creation on the text, set this clinical element as the selected clinical element as well.
                            CR.app.controller.AnnotationNatureController.setSelectedClinicalElement(clinicalElement);
                        }

                        var d1 = new Date();
                        var today = Ext.Date.format(d1, "Y-m-d\\TH:i:s\\Z");

                        var annotation = CR.app.controller.AnnotationNatureControllerAnnotations.createAnnotation(
                            CR.app.controller.AnnotationNatureController.getNewId(), // id
                            clinicalElement.id, // clinicalElementName
                            clinicalElement.schemaId, // schemaId
                            schemaElement, // schemaElement
                            today, // creationDate
                            clinicalElement.clinicalElementConfigurationId, // clinicalElementConfigurationId
                            spanArray, // spans
                            [], // features
                            true); // isNew

                        CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotation(annotation.clinicalElementId, annotation, true);
//						CR.app.controller.AnnotationNatureControllerAnnotations.updateAnnotationWithClinicalElementDateAndName(annotation, clinicalElementDate, clinicalElementName);
                        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(annotation);
                        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationCreatedByUserTextLevel');
                    }
                }
            }
            else
            {
                CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectionBlur');
            }
        },

        findNextTextOrBreakNode: function(node)
        {
            var textOrBreakNode = null;
            var curNode = node;
            while(curNode && curNode.nodeType != 3)
            {
                curNode = curNode.nextSibling;
                var tTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findFirstTextOrBreakNode(curNode);
                if(tTextOrBreakNode != null)
                {
                    textOrBreakNode = tTextOrBreakNode;
                    break;
                }
            }
            return textOrBreakNode;
        },

        findFirstTextOrBreakNode: function(node) {
            var textOrBreakNode = null;
            if (node) {
                var curNode = node;

                if (curNode && curNode.nodeType == 3) {
                    textOrBreakNode = node;
                }
                else if (curNode && curNode.hasChildNodes()) {
                    for (var i = 0; i < curNode.childNodes.length; i++) {
                        var childNode = curNode.childNodes[i];
                        var tTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findFirstTextOrBreakNode(childNode);
                        if (tTextOrBreakNode != null) {
                            textOrBreakNode = tTextOrBreakNode;
                            break;
                        }
                    }
                }
            }
            return textOrBreakNode;
        },

        findPreviousTextOrBreakNode: function(node)
        {
            var textOrBreakNode = null;
            var curNode = node;
            while(curNode && curNode.nodeType != 3)
            {
                curNode = curNode.previousSibling;
                var tTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findLastTextOrBreakNode(curNode);
                if(tTextOrBreakNode != null)
                {
                    textOrBreakNode = tTextOrBreakNode;
                    break;
                }
            }
            return textOrBreakNode;
        },

        findLastTextOrBreakNode: function(node)
        {
            var textOrBreakNode = null;
            var curNode = node;
            if(curNode && curNode.nodeType == 3)
            {
                textOrBreakNode = node;
            }
            else if(curNode && curNode.hasChildNodes())
            {
                for(var i = curNode.childNodes.length - 1; i >= 0; i--)
                {
                    var childNode = curNode.childNodes[i];
                    var tTextOrBreakNode = CR.app.controller.AnnotationNatureControllerText.findLastTextOrBreakNode(childNode);
                    if(tTextOrBreakNode != null)
                    {
                        textOrBreakNode = tTextOrBreakNode;
                        break;
                    }
                }
            }
            return textOrBreakNode;
        },

        /**
         * Finds all html elements with the given element set that
         * @param startContainer - the starting element from the document selection range
         * @param startOffset - the character offset within the starting element
         * @param endContainer - the ending element from the document selection range
         * @param endOffset - the character offset within the ending element
         * @param spanContainer - the common ancestor of the startContainer and endContainer from the document selection range
         * @param elset - all the nodes that were marked as 'annotatable'
         * @returns {Array}
         */
        createSpans: function (startContainer, startOffset, endContainer, endOffset, spanContainer, elset) {
            var spanSet = [];
            for (key in elset) {
                var posval = 0;
                var el = elset[key];
                var txt = CR.app.controller.AnnotationNatureControllerText.getTextValue(el);//.textContent;
                var ecompStart = startContainer.compareDocumentPosition(el);
                var ecompEnd = endContainer.compareDocumentPosition(el);

                if ((ecompStart & Node.DOCUMENT_POSITION_CONTAINS) == Node.DOCUMENT_POSITION_CONTAINS) {
                    posval++;
                    // el contains scomp
                    var startIndex = CR.app.controller.AnnotationNatureControllerText.getElementRawTextOffset(startContainer, el) + startOffset;
                    if ((ecompEnd & Node.DOCUMENT_POSITION_CONTAINS) == Node.DOCUMENT_POSITION_CONTAINS) {
                        // el contains ecomp
                        var endIndex = CR.app.controller.AnnotationNatureControllerText.getElementRawTextOffset(endContainer, el) + endOffset;
                        spanSet.push({
//	            			'node':el,
                            'filter': key,
                            'textStart': startIndex,
                            'textStop': endIndex,
                            'text': el.textContent.substring(startIndex, endIndex)
                        });
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_PRECEDING) == Node.DOCUMENT_POSITION_PRECEDING) {
                        spanSet.push({
//	            			'node':el,
                            'filter': key,
                            'textStart': startIndex,
                            'textStop': CR.app.controller.AnnotationNatureControllerText.getTextValue(el).length,
                            'text': CR.app.controller.AnnotationNatureControllerText.getTextValue(el).substring(startIndex, endIndex)//.textContent
                        });
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_FOLLOWING) == Node.DOCUMENT_POSITION_FOLLOWING) {
                        // Do nothing. The ael comes after the end selection element.
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_CONTAINED_BY) == Node.DOCUMENT_POSITION_CONTAINED_BY) {
                        // ecomp contains el NOT POSSIBLE.
                    }
                }
                else if ((ecompStart & Node.DOCUMENT_POSITION_FOLLOWING) == Node.DOCUMENT_POSITION_FOLLOWING) {
                    posval++;
                    if ((ecompEnd & Node.DOCUMENT_POSITION_CONTAINS) == Node.DOCUMENT_POSITION_CONTAINS) {
                        // el contains ecomp
                        var endIndex = CR.app.controller.AnnotationNatureControllerText.getElementRawTextOffset(endContainer, el) + endOffset;
                        spanSet.push({
//	            			'node':el,
                            'filter': key,
                            'textStart': 0,
                            'textStop': endIndex,
                            'text': CR.app.controller.AnnotationNatureControllerText.getTextValue(el).substring(0, endIndex)
                        });
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_PRECEDING) == Node.DOCUMENT_POSITION_PRECEDING) {
                        spanSet.push({
//	            			'node':el,
                            'filter': key,
                            'textStart': 0,
                            'textStop': CR.app.controller.AnnotationNatureControllerText.getTextValue(el).length,
                            'text': CR.app.controller.AnnotationNatureControllerText.getTextValue(el).substring(startIndex, endIndex)//.textContent
                        });
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_FOLLOWING) == Node.DOCUMENT_POSITION_FOLLOWING) {
                        // Do nothing. The ael comes after the end selection element.
                    }
                    else if ((ecompEnd & Node.DOCUMENT_POSITION_CONTAINED_BY) == Node.DOCUMENT_POSITION_CONTAINED_BY) {
                        // ecomp contains el NOT POSSIBLE.
                    }
                }
                else if ((ecompStart & Node.DOCUMENT_POSITION_PRECEDING) == Node.DOCUMENT_POSITION_PRECEDING) {
                    // Do nothing. The annotatable node is BEFORE the start node.
                }
                else if ((ecompStart & Node.DOCUMENT_POSITION_CONTAINED_BY) == Node.DOCUMENT_POSITION_CONTAINED_BY) {
                    // scomp contains el NOT POSSIBLE.
                }
                /*
                 DOCUMENT_POSITION_DISCONNECTED (0x0001)	The specified and the current nodes have no common container node (e.g. they belong to different documents, or one of them is appended to any document, etc.).
                 DOCUMENT_POSITION_PRECEDING (0x0002)	The specified node precedes the current node.
                 DOCUMENT_POSITION_FOLLOWING (0x0004)	The specified node follows the current node.
                 DOCUMENT_POSITION_CONTAINS (0x0008)		The specified node contains the current node.
                 DOCUMENT_POSITION_CONTAINED_BY (0x0010)	The specified node is contained by the current node.
                 */
            }
            return spanSet;
        },

        /**
         * Browser-independent text retrieval.
         * @param element
         * @returns {*}
         */
        getTextValue: function (element) {
            var retval = null;
            if (!retval && typeof element != "undefined" && typeof element.textContent != "undefined" && element.textContent) {
                retval = element.textContent;
            }
            if (!retval && typeof element != "undefined" && typeof element.innerText != "undefined" && element.innerText) {
                retval = element.innerText;
            }
            if (!retval && typeof element != "undefined" && typeof element.text != "undefined" && element.text) {
                retval = element.text;
            }
            return retval;
        },

        /**
         * Browser-independent number retrieval.
         * @param element
         * @returns {*}
         */
        getNumberValue: function (element) {
            var retval = null;
            if (!retval && typeof element != "undefined" && typeof element.textContent != "undefined" && element.textContent) {
                retval = new Number(element.textContent);
            }
            if (!retval && typeof element != "undefined" && typeof element.innerText != "undefined" && element.innerText) {
                retval = new Number(element.innerText);
            }
            if (!retval && typeof element != "undefined" && typeof element.text != "undefined" && element.text) {
                retval = new Number(element.text);
            }
            return retval;
        },

        /**
         * Browser-independent date retrieval.
         * @param element
         * @returns {*}
         */
        getDateValue: function (element) {
            var retval = null;
            if (!retval && typeof element != "undefined" && typeof element.textContent != "undefined" && element.textContent) {
                retval = new Date(element.textContent.replace(" ","T"));
            }
            if (!retval && typeof element != "undefined" && typeof element.innerText != "undefined" && element.innerText) {
                retval = new Date(element.innerText.replace(" ","T"));
            }
            if (!retval && typeof element != "undefined" && typeof element.text != "undefined" && element.text) {
                retval = new Date(element.text.replace(" ","T"));
            }
            return retval;
        },

        /**
         * Recursively, with a depth-first traversal of the given parentElement, add up the character lengths of the text
         * values of the text child nodes.
         * TBD - ext-ify this method
         * @param childElement
         * @param parentElement
         * @returns {number|*}
         */
        getElementRawTextOffset: function (childElement, parentElement)
        {
            var idx = 0;
            for (var i = 0; i < parentElement.childNodes.length; i++) {
                var relative = parentElement.childNodes[i];
                if (relative.nodeName == "SCRIPT") {
                    // Do nothing if a script tag is found.
                }
                else {
                    if (relative === childElement) {
                        // Stop the traversal when the given child is found.
                        return idx;
                    }
                    if (relative.nodeName == "#text" || relative.nodeName == "#stext") {
                        // Add the character length of the text value of a text child node.

                        // NOTE TO SELF about annotating documents that have html from db - The idea is to escape the html markup
                        // that may be present in the db document text, and just add html from the server clinical element configuration
                        // template.  The problem is that by the time I get to this point in the UI during an annotation, the only
                        // text available to me in these child nodes has already been un-escaped, so I see "<b>hi</b>" when I expect
                        // "&lt;b&gt;hi&lt;/b&gt;"  So, when we use the un-escaped text to put back in to innerHtml, as is happening during
                        // this annotation markup of the document, we end up with html that has un-escaped html from the db document
                        // back in it.  This messes up the offset calculation here, etc.  I briefly toyed with re-escaping the html characters
                        // here, before calculating the length, and in other places, using the escapeHtml and unescapeHtml functions included
                        // below, but I found that the db documents were not going to have html markup in them for quite some time, so I need
                        // to move to other tasks and this one is put on the back burner.
                        // TO Explore: Look in ItemListDetail.loadItemDetail, me.update(content) - what is the loadScripts parameters there?
                        // Is that unescaping the html from the db?
                        idx = idx + CR.app.controller.AnnotationNatureControllerText.getTextValue(relative).length;
                    }
//                    else if (relative.nodeName == 'BR') {
//                        if(relative.hasAttribute('data-countas'))
//                        {
//                            var dataCountAsValue = relative.getAttribute('data-countas');
//                            if(dataCountAsValue != "")
//                            {
//                                idx = idx + parseInt(dataCountAsValue);
//                            }
//                            else
//                            {
//                                idx++;
//                            }
//                        }
//                        else
//                        {
//                            idx++;
//                        }
//                    }
                    else {
                        // Descend recursively.
                        idx = idx + CR.app.controller.AnnotationNatureControllerText.getElementRawTextOffset(childElement, relative);
                    }
                    if (Ext.isFunction(relative.contains) && relative.contains(childElement)/*nodeContainsChildNode(relative, childElement)*/) {
                        // Stop the traversal if the relative contains the childElement.  This pops us out of the recursive descent as soon
                        // as the child is found, returning the idx that was found.
                        return idx;
                    }
                }
            }
            return idx;
        },

        doEscapeHtml : function(originalText)
        {
            var escapedText = escapeHtml(originalText);
            return escapedText;
        },

        doUnescapeHtml : function(originalText)
        {
            var unescapedText = unescapeHtml(originalText);
            return unescapedText;
        }
    }
});

/**
 * HtmlEscape in JavaScript, which is compatible with utf-8
 * @author Ulrich Jensen, http://www.htmlescape.net
 * Feel free to get inspired, use or steal this code and use it in your
 * own projects.
 * License:
 * You have the right to use this code in your own project or publish it
 * on your own website.
 * If you are going to use this code, please include the author lines.
 * Use this code at your own risk. The author does not warrent or assume any
 * legal liability or responsibility for the accuracy, completeness or usefullness of
 * this program code.
 */

var hex=new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');


function escapeHtml(originalText)
{
    if (originalText == null)
    {
        return "";
    }
    var preescape="" + originalText;
    var escaped="";

    var i=0;
    for(i=0;i<preescape.length;i++)
    {
        var p=preescape.charAt(i);

        p=""+escapeCharOther(p);
        p=""+escapeTags(p);
        //p=""+escapeBR(p);

        escaped=escaped+p;
    }
    return escaped;
}

function escapeBR(original)
{
    if (original == null)
    {
        return "";
    }
    var thechar=original.charCodeAt(0);

    switch(thechar) {
        case 10: return "<br/>"; break; //newline
        case '\r': break;
    }
    return original;
}

function escapeNBSP(original)
{
    if (original == null)
    {
        return "";
    }
    var thechar=original.charCodeAt(0);
    switch(thechar) {
        case 32: return "&nbsp;"; break; //space
    }
    return original;
}


function escapeTags(original)
{
    if (original == null)
    {
        return "";
    }
    var thechar=original.charCodeAt(0);
    switch(thechar) {
        case 60:return "&lt;"; break; //<
        case 62:return "&gt;"; break; //>
        case 34:return "&quot;"; break; //"
    }
    return original;

}

function escapeCharOther(original)
{
    if (original == null)
    {
        return "";
    }
    var found=true;
    var thechar=original.charCodeAt(0);
    switch(thechar) {
        case 38:return "&amp;"; break; //&
        case 198:return "&AElig;"; break; //Æ
        case 193:return "&Aacute;"; break; //Á
        case 194:return "&Acirc;"; break; //Â
        case 192:return "&Agrave;"; break; //À
        case 197:return "&Aring;"; break; //Å
        case 195:return "&Atilde;"; break; //Ã
        case 196:return "&Auml;"; break; //Ä
        case 199:return "&Ccedil;"; break; //Ç
        case 208:return "&ETH;"; break; //Ð
        case 201:return "&Eacute;"; break; //É
        case 202:return "&Ecirc;"; break; //Ê
        case 200:return "&Egrave;"; break; //È
        case 203:return "&Euml;"; break; //Ë
        case 205:return "&Iacute;"; break; //Í
        case 206:return "&Icirc;"; break; //Î
        case 204:return "&Igrave;"; break; //Ì
        case 207:return "&Iuml;"; break; //Ï
        case 209:return "&Ntilde;"; break; //Ñ
        case 211:return "&Oacute;"; break; //Ó
        case 212:return "&Ocirc;"; break; //Ô
        case 210:return "&Ograve;"; break; //Ò
        case 216:return "&Oslash;"; break; //Ø
        case 213:return "&Otilde;"; break; //Õ
        case 214:return "&Ouml;"; break; //Ö
        case 222:return "&THORN;"; break; //Þ
        case 218:return "&Uacute;"; break; //Ú
        case 219:return "&Ucirc;"; break; //Û
        case 217:return "&Ugrave;"; break; //Ù
        case 220:return "&Uuml;"; break; //Ü
        case 221:return "&Yacute;"; break; //Ý
        case 225:return "&aacute;"; break; //á
        case 226:return "&acirc;"; break; //â
        case 230:return "&aelig;"; break; //æ
        case 224:return "&agrave;"; break; //à
        case 229:return "&aring;"; break; //å
        case 227:return "&atilde;"; break; //ã
        case 228:return "&auml;"; break; //ä
        case 231:return "&ccedil;"; break; //ç
        case 233:return "&eacute;"; break; //é
        case 234:return "&ecirc;"; break; //ê
        case 232:return "&egrave;"; break; //è
        case 240:return "&eth;"; break; //ð
        case 235:return "&euml;"; break; //ë
        case 237:return "&iacute;"; break; //í
        case 238:return "&icirc;"; break; //î
        case 236:return "&igrave;"; break; //ì
        case 239:return "&iuml;"; break; //ï
        case 241:return "&ntilde;"; break; //ñ
        case 243:return "&oacute;"; break; //ó
        case 244:return "&ocirc;"; break; //ô
        case 242:return "&ograve;"; break; //ò
        case 248:return "&oslash;"; break; //ø
        case 245:return "&otilde;"; break; //õ
        case 246:return "&ouml;"; break; //ö
        case 223:return "&szlig;"; break; //ß
        case 254:return "&thorn;"; break; //þ
        case 250:return "&uacute;"; break; //ú
        case 251:return "&ucirc;"; break; //û
        case 249:return "&ugrave;"; break; //ù
        case 252:return "&uuml;"; break; //ü
        case 253:return "&yacute;"; break; //ý
        case 255:return "&yuml;"; break; //ÿ
        case 162:return "&cent;"; break; //¢
        default:
            found=false;
            break;
    }
    if(!found)
    {
        if(thechar>127) {
            var c=thechar;
            var a4=c%16;
            c=Math.floor(c/16);
            var a3=c%16;
            c=Math.floor(c/16);
            var a2=c%16;
            c=Math.floor(c/16);
            var a1=c%16;
            return "&#x"+hex[a1]+hex[a2]+hex[a3]+hex[a4]+";";
        }
        else
        {
            return original;
        }
    }


}

function unescapeHtml(originalText)
{
    if(originalText == null)
    {
        return "";
    }
    return originalText
        .replace(/<br\/>/g,String.fromCharCode(10))
        .replace(/&nbsp;/g,String.fromCharCode(32))
        .replace(/&lt;/g,String.fromCharCode(60))
        .replace(/&gt;/g,String.fromCharCode(62))
        .replace(/&quot;/g,String.fromCharCode(34))
        .replace(/&amp;/g,String.fromCharCode(38))
        .replace(/&AElig;/g,String.fromCharCode(198))
        .replace(/&Aacute;/g,String.fromCharCode(193))
        .replace(/&Agrave;/g,String.fromCharCode(192))
        .replace(/&Aring;/g,String.fromCharCode(197))
        .replace(/&Atilde;/g,String.fromCharCode(195))
        .replace(/&Auml;/g,String.fromCharCode(196))
        .replace(/&Ccedil;/g,String.fromCharCode(199))
        .replace(/&ETH;/g,String.fromCharCode(208))
        .replace(/&Eacute;/g,String.fromCharCode(201))
        .replace(/&Ecirc;/g,String.fromCharCode(202))
        .replace(/&Egrave;/g,String.fromCharCode(200))
        .replace(/&Euml;/g,String.fromCharCode(203))
        .replace(/&Iacute;/g,String.fromCharCode(205))
        .replace(/&Icirc;/g,String.fromCharCode(206))
        .replace(/&Igrave;/g,String.fromCharCode(204))
        .replace(/&Iuml;/g,String.fromCharCode(207))
        .replace(/&Ntilde;/g,String.fromCharCode(209))
        .replace(/&Oacute;/g,String.fromCharCode(211))
        .replace(/&Ocirc;/g,String.fromCharCode(212))
        .replace(/&Ograve;/g,String.fromCharCode(210))
        .replace(/&Oslash;/g,String.fromCharCode(216))
        .replace(/&Otilde;/g,String.fromCharCode(213))
        .replace(/&Ouml;/g,String.fromCharCode(214))
        .replace(/&THORN;/g,String.fromCharCode(222))
        .replace(/&Uacute;/g,String.fromCharCode(218))
        .replace(/&Ucirc;/g,String.fromCharCode(219))
        .replace(/&Ugrave;/g,String.fromCharCode(217))
        .replace(/&Uuml;/g,String.fromCharCode(220))
        .replace(/&Yacute;/g,String.fromCharCode(221))
        .replace(/&aacute;/g,String.fromCharCode(225))
        .replace(/&acirc;/g,String.fromCharCode(226))
        .replace(/&aelig;/g,String.fromCharCode(230))
        .replace(/&agrave;/g,String.fromCharCode(224))
        .replace(/&aring;/g,String.fromCharCode(229))
        .replace(/&atilde;/g,String.fromCharCode(227))
        .replace(/&auml;/g,String.fromCharCode(228))
        .replace(/&ccedil;/g,String.fromCharCode(231))
        .replace(/&eacute;/g,String.fromCharCode(233))
        .replace(/&ecirc;/g,String.fromCharCode(234))
        .replace(/&egrave;/g,String.fromCharCode(232))
        .replace(/&eth;/g,String.fromCharCode(240))
        .replace(/&euml;/g,String.fromCharCode(235))
        .replace(/&iacute;/g,String.fromCharCode(237))
        .replace(/&icirc;/g,String.fromCharCode(238))
        .replace(/&igrave;/g,String.fromCharCode(236))
        .replace(/&iuml;/g,String.fromCharCode(239))
        .replace(/&ntilde;/g,String.fromCharCode(241))
        .replace(/&oacute;/g,String.fromCharCode(243))
        .replace(/&ocirc;/g,String.fromCharCode(244))
        .replace(/&ograve;/g,String.fromCharCode(242))
        .replace(/&oslash;/g,String.fromCharCode(248))
        .replace(/&otilde;/g,String.fromCharCode(245))
        .replace(/&ouml;/g,String.fromCharCode(246))
        .replace(/&szlig;/g,String.fromCharCode(223))
        .replace(/&thorn;/g,String.fromCharCode(254))
        .replace(/&uacute;/g,String.fromCharCode(250))
        .replace(/&ucirc;/g,String.fromCharCode(251))
        .replace(/&ugrave;/g,String.fromCharCode(249))
        .replace(/&uuml;/g,String.fromCharCode(252))
        .replace(/&yacute;/g,String.fromCharCode(253))
        .replace(/&yuml;/g,String.fromCharCode(255))
        .replace(/&cent;/g,String.fromCharCode(162))
        .replace(/&.*;/g,'X');  // TBD - HANDLE DECODE OF HEX CHARS
}
