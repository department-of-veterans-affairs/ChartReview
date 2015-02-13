package chartreview

import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord

class AnnotationSchemaController {


    /** Forward to list page. **/
    def index() {
        redirect(action: "list", params: params)
    }

    /**
     * List all schemas. Max is the maximum number to show.
     * @param max
     * @return
     */
    def list(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        if (!params.sort) {
            params.sort= "name";
        }
        [model: AnnotationSchemaRecord.list(params), total: AnnotationSchemaRecord.count()]
    }

    def getXml() {
        println("here with " + params.id);
        render("test");
        return null;
    }

    def create() {

    }
}
