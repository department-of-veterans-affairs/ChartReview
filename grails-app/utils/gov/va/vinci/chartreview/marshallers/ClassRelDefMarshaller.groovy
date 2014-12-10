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

        converter.startNode("attributeDefIds");
        classRelDef.doGetAttributeDefsSorted().each {
            converter.startNode("attributeDefId")
            converter.attribute("id", it.id);
            converter.end();
        }
        converter.end();

        converter.startNode("leftClassDefIds");
        classRelDef.doGetLeftClassDefsSorted().each {
            converter.startNode("classDefId")
            converter.attribute("id", it.id);
            converter.end();
        }
        converter.end();

        converter.startNode("rightClassDefIds");
        classRelDef.doGetRightClassDefsSorted().each {
            converter.startNode("classDefId")
            converter.attribute("id", it.id);
            converter.end();
        }
        converter.end();

    }
}
