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

        def attributeDefs = classDef.doGetAttributeDefsSorted();
        if(attributeDefs && attributeDefs.size() > 0)
        {
            converter.startNode("attributeDefIds");
            attributeDefs.each { // returns sorted
                converter.startNode("attributeDefId")
                converter.attribute("id", it.id);
                converter.end();
            }
            converter.end();
        }
        def classDefs = classDef.doGetAttributeDefsSorted();
        if(classDefs && classDefs.size() > 0)
        {
            converter.startNode("classDefIds");
            classDefs.each { // returns sorted
                converter.startNode("classDefId")
                converter.attribute("id", it.id);
                converter.end();
            }
            converter.end();
        }
    }
}
