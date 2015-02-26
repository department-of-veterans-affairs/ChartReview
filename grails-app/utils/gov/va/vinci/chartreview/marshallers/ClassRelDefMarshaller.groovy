package gov.va.vinci.chartreview.marshallers

import gov.va.vinci.chartreview.model.schema.ClassRelDef
import grails.converters.XML
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.codehaus.groovy.grails.web.converters.marshaller.ObjectMarshaller

class ClassRelDefMarshaller extends BaseMarshaller implements ObjectMarshaller<XML> {

    @Override
    boolean supports(Object object) {
        return object instanceof ClassRelDef
    }

    @Override
    void marshalObject(Object object, XML converter) throws ConverterException {

        ClassRelDef classRelDef = object as ClassRelDef;

        converter.attribute("id", classRelDef.id);
        addElement(converter, "name", classRelDef.name)
        addElement(converter, "color", classRelDef.color)
        addElement(converter, "type", "" + classRelDef.type)

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
        def leftClassDefs = classDef.doGetAttributeDefsSorted();
        if(leftClassDefs && leftClassDefs.size() > 0)
        {
            converter.startNode("leftClassDefIds");
            leftClassDefs.each { // returns sorted
                converter.startNode("classDefId")
                converter.attribute("id", it.id);
                converter.end();
            }
            converter.end();
        }
        def rightClassDefs = classDef.doGetAttributeDefsSorted();
        if(rightClassDefs && rightClassDefs.size() > 0)
        {
            converter.startNode("rightClassDefIds");
            rightClassDefs.each { // returns sorted
                converter.startNode("classDefId")
                converter.attribute("id", it.id);
                converter.end();
            }
            converter.end();
        }
    }
}
