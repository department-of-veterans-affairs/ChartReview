package chartreview

import grails.plugin.gson.converters.GSON
import org.restapidoc.annotation.RestApiMethod
import org.restapidoc.annotation.RestApiParam
import org.restapidoc.annotation.RestApiParams
import org.restapidoc.pojo.RestApiParamType
import org.restapidoc.pojo.RestApiVerb
import org.springframework.http.MediaType

class ClinicalElementController {

    def clinicalElementService;


    @RestApiMethod( description="Return all clinical data for a project, clinical element, and principal clinicalElement. The data is returned in JSON format.",
            path="/clinicalElement/elements",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.POST
    )
    @RestApiParams(params=[
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.PATH, description = "The project to get the data for. This defines which database to connect to."),
            @RestApiParam(name="clinicalElementConfigurationId", type="string", paramType = RestApiParamType.PATH, description = "The clinical data element id to get. For example, this might specify to get all labs, or tiu documents."),
            @RestApiParam(name="principalElementId", type="string", paramType = RestApiParamType.PATH, description = "The principal element (i.e. patient) to get the information for.")

    ])
    /**
     * Return all clinical data for a project, clinical element, and principal clinicalElement.
     * @param projectId - The project to get the data for. This defines which database to connect to.
     * @param clinicalElementConfigurationId - The clinical data element id to get. For example, this might specify to get all labs,
     *  or tiu documents.
     * @param principalElementId - The principal element (i.e. patient) to get the information for.
     * @return
     */
    def elements() {
        log.debug("Elements for projectId: ${params.projectId}, clinicalElementConfigurationId: ${params.clinicalElementConfigurationId}, principalElementId: ${params.principalElementId}")
        def data = clinicalElementService.getClinicalElements(params.projectId,  params.clinicalElementConfigurationId, params.principalElementId);
        render data as GSON;
        return null;
    }


    @RestApiMethod( description="Return the element content for a specific element. The data is returned in JSON format.",
            path="/clinicalElement/elementContent",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.POST
    )
    @RestApiParams(params=[
            @RestApiParam(name="serializedKey", type="string", paramType = RestApiParamType.PATH, description = "The serialized key that contains all information needed to get the clinical element content.")

    ])
    /**
     * Return the element content for a specific element.
     * @param serializedKey - The serialized key for the clinical element.
     * @return html data in a json formatted object.
     */
    def elementContent() {
        log.debug("Element content for serializedKey: ${params.serializedKey}")
        def data = clinicalElementService.getElementContent(params.serializedKey);
        def map = new HashMap();
        map.put("content", data);
        render map as GSON;
        return null;
    }

    @RestApiMethod( description="Return the clinical element (minus content) data. The data is returned in JSON format.",
            path="/clinicalElement/elementContent",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.POST
    )
    @RestApiParams(params=[
            @RestApiParam(name="serializedKey", type="string", paramType = RestApiParamType.PATH, description = "The serialized key that contains all information needed to get the clinical element.")

    ])
    /**
     * Return the clinical element (minus content) data.
     * @param serializedKey - The serialized key for the clinical element.
     */
    def element() {
        log.debug("Element for serializedKey: ${params.serializedKey}")
        Map<String, Object> data = clinicalElementService.getClinicalElementBySerializedKey(params.serializedKey);
        render data as GSON;
        return null;
    }

    @RestApiMethod( description="Return the clinical element (minus content) data. The data is returned in JSON format.",
            path="/clinicalElement/elementBlob",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.POST
    )
    @RestApiParams(params=[
            @RestApiParam(name="serializedKey", type="string", paramType = RestApiParamType.PATH, description = "The serialized key that contains all information needed to get the clinical element.")

    ])
    /**
     * Return the element content for a specific element.
     * @param serializedKey - The serialized key for the clinical element.
     * @return html data in a json formatted object.
     */
    def elementBlob() {
        log.debug("Element blob for serializedKey: ${params.serializedKey}")
        def ret = clinicalElementService.getElementBlobAndMimeType(params.projectId, params.clinicalElementConfigurationId, params.clinicalElementId, params.columnName);
        def mimeType = (String)ret.get("mimeType");
        def blob = (byte[])ret.get("blob");
        response.setContentType("application/octet-stream")
        response.setHeader("Content-disposition", "filename="+params.columnName)
        response.setContentType(mimeType);
        response.contentLength = blob.size();
        response.outputStream << blob;
        response.outputStream.flush()
        return null;
    }
}
