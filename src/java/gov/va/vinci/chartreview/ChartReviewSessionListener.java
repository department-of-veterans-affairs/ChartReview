package gov.va.vinci.chartreview;

import org.apache.commons.dbutils.DbUtils;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Enumeration;

/**
 * Created by ryancornia on 9/29/15.
 */
public class ChartReviewSessionListener implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {

    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("Got session destroyed. Looking for connections to close.");
        Enumeration<String> attributeNames = se.getSession().getAttributeNames();
        while (attributeNames.hasMoreElements()) {
            String attributeName = attributeNames.nextElement();
            Object value = se.getSession().getAttribute(attributeName);
            if (value instanceof Connection) {
                Connection c = (Connection)value;
                System.out.println("\t\tFound database connection class... closing...");
                DbUtils.closeQuietly(c);
            }
        }

    }
}
