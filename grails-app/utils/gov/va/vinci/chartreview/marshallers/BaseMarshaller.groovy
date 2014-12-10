package gov.va.vinci.chartreview.marshallers

import grails.converters.XML

/**
 * Created by ryancornia on 2/26/14.
 */
class BaseMarshaller {
    protected void addElement(XML converter, String name, String value) {
        converter.startNode(name);
        if (value) {
            converter.chars value
        }
        converter.end();
    }
}
