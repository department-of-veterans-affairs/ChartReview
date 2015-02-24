package gov.va.vinci.chartreview.marshallers

import gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef
import grails.converters.XML
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.codehaus.groovy.grails.web.converters.marshaller.ObjectMarshaller

class AttributeDefOptionDefMarshaller extends BaseMarshaller implements ObjectMarshaller<XML> {

    @Override
    boolean supports(Object object) {
        return object instanceof AttributeDefOptionDef
    }

    @Override
    void marshalObject(Object object, XML converter) throws ConverterException {

        AttributeDefOptionDef attributeDefOptionDef = object as AttributeDefOptionDef;

        converter.attribute("id", attributeDefOptionDef.id);
        addElement(converter, "name", attributeDefOptionDef.getName())
    }
}
