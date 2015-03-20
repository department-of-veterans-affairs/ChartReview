package gov.va.vinci.chartreview.marshallers

import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AttributeDef
import grails.converters.XML
import gov.va.vinci.chartreview.util.CRSchemaXML
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.codehaus.groovy.grails.web.converters.marshaller.ObjectMarshaller

class AnnotationSchemaMarshaller extends BaseMarshaller implements ObjectMarshaller<XML> {

    @Override
    boolean supports(Object object) {
        return object instanceof AnnotationSchema
    }

    @Override
    void marshalObject(Object object, XML converter) throws ConverterException {

        AnnotationSchema annotationSchema = object as AnnotationSchema;

        converter.attribute("id", annotationSchema.id);
        addElement(converter, "name", annotationSchema.getName())
        addElement(converter, "type", annotationSchema.type.toString())
        addElement(converter, "description", annotationSchema.getDescription())

        def attributeDefs = annotationSchema.doGetAttributeDefsSorted();
        if(attributeDefs && attributeDefs.size() > 0)
        {
            converter.startNode("attributeDefs");
            converter.convertAnother(annotationSchema.doGetAttributeDefsSorted());
            converter.end();
        }
        def classDefs = annotationSchema.doGetClassDefsSorted();
        if(classDefs && classDefs.size() > 0)
        {
            converter.startNode("classDefs");
            converter.convertAnother(annotationSchema.doGetClassDefsSorted());
            converter.end();
        }
        def classRelDefs = annotationSchema.doGetClassRelDefsSorted();
        if(classRelDefs && classRelDefs.size() > 0)
        {
            converter.startNode("classRelDefs");
            converter.convertAnother(annotationSchema.doGetClassRelDefsSorted());
            converter.end();
        }
    }
}
