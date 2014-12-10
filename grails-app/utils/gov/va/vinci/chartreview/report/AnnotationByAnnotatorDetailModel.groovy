package gov.va.vinci.chartreview.report

import gov.va.vinci.chartreview.model.AnnotationTask
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.siman.model.Annotation

/**
 * Created by ryancornia on 9/18/14.
 */
class AnnotationByAnnotatorDetailModel {
    Annotation annotation;
    AnnotationTask annotationTask;
    String clinicalElementConfigurationName;
    String clinicalElementConfigurationId;
    AnnotationSchema annotationSchema;
    String clinicalElementSerializedKeys;


    public String getReadableAnnotationType() {
        String type = annotation.annotationType;
        List<String> parts = type.split(";");

        String classDefId = parts[1].split(":")[1];

        ClassDef classDef = annotationSchema.classDefs.find{it.id == classDefId};
        return classDef.name;
    }
}
