package chartreview

import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.ProjectDocument
import grails.plugin.gson.converters.GSON

class ProjectDocumentController {

    def show() {
        ProjectDocument document = ProjectDocument.get(params.id);
        if(document)
        {
            if (document.mimeType.startsWith("text")) {
                // renders text for a specified content-type/encoding
                String str1 = new String(document.content, "UTF-8");
                render(text: str1, contentType: document.mimeType);
                return null;
            } else {
                response.setContentType("application/octet-stream")
                response.setHeader("Content-disposition", "filename=${document.name}")
                response.setContentType(document.mimeType);
                response.contentLength = document.content.size();
                response.outputStream << document.content;
                response.outputStream.flush()
                return null;
            }
        }
        else
        {
            return null;
        }
    }

    def delete() {
        // TODO - Implement security checking here.
        ProjectDocument document = ProjectDocument.get(params.id);
        Project p = document.project;
        document.delete();
        redirect(controller: "project", action: "show", params: [id: p.id, selectedTab: 'projectDocuments']);
    }

}
