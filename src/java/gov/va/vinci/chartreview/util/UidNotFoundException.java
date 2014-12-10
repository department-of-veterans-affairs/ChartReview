package gov.va.vinci.chartreview.util;

public class UidNotFoundException extends NotFoundException {
    Class domainClass;
    String uid;

     public UidNotFoundException(Class domainClass, String uid) {
        super(domainClass.getName() + " with uid '" + uid + "' not found");
            this.domainClass = domainClass;
            this.uid = uid;
    }
}
