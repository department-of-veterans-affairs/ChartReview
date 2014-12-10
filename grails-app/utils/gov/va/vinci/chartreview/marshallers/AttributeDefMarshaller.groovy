package gov.va.vinci.chartreview.marshallers

import gov.va.vinci.chartreview.model.schema.AttributeDef
import grails.converters.XML
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.codehaus.groovy.grails.web.converters.marshaller.ObjectMarshaller

class AttributeDefMarshaller extends BaseMarshaller implements ObjectMarshaller<XML> {

    @Override
    boolean supports(Object object) {
        return object instanceof AttributeDef
    }

    @Override
    void marshalObject(Object object, XML converter) throws ConverterException {

        AttributeDef attributeDef = object as AttributeDef;

        converter.attribute("id", attributeDef.id);
        converter.attribute("type", attributeDef.type.toString());

        addElement(converter, "name", attributeDef.getName())
        addElement(converter, "color", attributeDef.color)
        addElement(converter, "numericLow", attributeDef.numericLow.toString())
        addElement(converter, "numericHigh", attributeDef.numericHigh.toString())
        addElement(converter, "minDate", attributeDef.minDate.toString())
        addElement(converter, "maxDate", attributeDef.maxDate.toString())

        converter.startNode("attributeDefOptionDefs");
        attributeDef.doGetAttributeDefOptionDefsSorted().each {
            converter.startNode("attributeDefOptionDef")
            converter.attribute("id", it.id);
            if (it.name) {
                converter.chars it.name;
            }
            converter.end();
        }
        converter.end();
    }


}
