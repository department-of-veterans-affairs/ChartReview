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
        addElement(converter, "description", annotationSchema.description)
//        addElement(converter, "name", annotationSchema.name)
//        addElement(converter, "type", annotationSchema.type)

        converter.startNode("attributeDefs");
        annotationSchema.doGetAttributeDefsSorted().each {
            converter.convertAnother(it);
        }
        converter.end();

        converter.startNode("classDefs");
        annotationSchema.doGetAttributeDefsSorted().each {
            converter.convertAnother(it);
        }
        converter.end();

        converter.startNode("classRelDefs");
        annotationSchema.doGetAttributeDefsSorted().each {
            converter.convertAnother(it);
        }
        converter.end();
    }
}
