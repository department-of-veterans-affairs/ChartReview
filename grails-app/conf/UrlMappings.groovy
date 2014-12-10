class UrlMappings {

	static mappings = {
        "/about" (view: "/about/index")
        "/clinicalElement/elements" (controller: "clinicalElement", action: "elements")
        "/clinicalElement/element" (controller: "clinicalElement", action: "element")

        // Annotation Controller
//        "/schema/$id"(controller: 'annotation', action: 'getAnnotationSchema')
//        "/task/$projectId/$processId"(controller: 'annotation', action: 'getTask')
//        "/user"(controller: 'annotation', action: 'getClinicalElementAnnotators')
//        "/annotators"(controller: 'annotation', action: 'getClinicalElementAnnotators')
//        "/annotation"(controller: 'annotation', action: 'getAnnotations')
//        "/annotationForClinicalElement"(controller: 'annotation', action: 'getAnnotationsForClinicalElement')
//        "/submitAnnotation/$id"(controller: 'annotation', action: 'submitAnnotations')
//        "/submitTask/$id"(controller: 'annotation', action: 'submitTask')

        "/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

        "/chart-review" (view: "chart-review")
		"/" (controller: "welcome", action: "index")
		"500"(view:'/error')
	}
}
