package gov.va.vinci.chartreview

import groovy.xml.StreamingMarkupBuilder
import org.springframework.core.io.ClassPathResource

import javax.servlet.http.HttpServletRequest
import javax.xml.XMLConstants
import javax.xml.transform.stream.StreamSource
import javax.xml.validation.SchemaFactory

class Validator {
    /**
     * Validates xml string against xsd string using schema validator
     * @param xml
     * @param xsd
     * @return
     */
    def static validate( String xml, String xsd){
        def factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI)
        def schema = factory.newSchema(new StreamSource(new StringReader(xsd)))

        def validator = schema.newValidator()
        validator.validate(new StreamSource(new StringReader(xml)))
    }

    /**
     * Reads xml from request validates it against schema, returns xml object
     * This method handles some problems related to loosing xmlns:xsi tagname tags using request.XML directly
     * @param restRequest
     * @param xsdName
     * @return
     */
    def static validate (HttpServletRequest request, String xsdName ) {
        // read in cached xml if exists (request.XML was previously called)
        String xmlString
        Object xmlObj = request.getAttribute(grails.converters.XML.CACHED_XML);
        if (xmlObj != null) {
            xmlString = new StreamingMarkupBuilder().bind { out << xmlObj }.toString()
        }
        else {
            xmlString = request.inputStream.text
        }

        String xsdString = new ClassPathResource( xsdName).getFile().newReader().getText()
        validate(xmlString, xsdString)
        return new XmlSlurper().parseText(xmlString)
    }

}
