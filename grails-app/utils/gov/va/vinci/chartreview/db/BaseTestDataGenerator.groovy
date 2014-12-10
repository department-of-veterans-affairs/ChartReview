package gov.va.vinci.chartreview.db

/**
 * Created by ryancornia on 3/17/14.
 */
class BaseTestDataGenerator {
    protected Date getRandomDate() {
        long offset = sdf.parse("01/01/2001").getTime();
        long end =  new Date().getTime();
        long diff = end - offset + 1;
        return new Date(offset + (long)(Math.random() * diff));
    }
}
