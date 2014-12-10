package gov.va.vinci.chartreview.marshallers

import gov.va.vinci.chartreview.model.schema.ClassDef
import grails.converters.XML
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.codehaus.groovy.grails.web.converters.marshaller.ObjectMarshaller

class ClassDefMarshaller extends BaseMarshaller implements ObjectMarshaller<XML> {

    @Override
    boolean supports(Object object) {
        return object instanceof ClassDef
    }

    @Override
    void marshalObject(Object object, XML converter) throws ConverterException {

        ClassDef classDef = object as ClassDef;

        converter.attribute("id", classDef.id);
        addElement(converter, "name", classDef.name)
        addElement(converter, "color", classDef.color)

        converter.startNode("attributeDefIds");
        classDef.findAllAttributeDefs().each { // returns sorted
            converter.startNode("attributeDefId")
            converter.attribute("id", it.id);
            converter.end();
        }
        converter.end();

        converter.startNode("classDefIds");
        classDef.doGetClassDefsSorted().each {
            converter.startNode("classDefId")
            converter.attribute("id", it.id);
            converter.end();
        }
        converter.end();

    }
}
