package chartreview

import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecordDAO
import org.apache.commons.dbutils.DbUtils

import java.sql.Connection

class AnnotationSchemaService {
    def projectService;


    def copy(Project p, AnnotationSchemaRecord record, String newName) {

        // TODO Implement
        println("In copy, need to implement. ")

    }

    def insert(Project p, AnnotationSchemaRecord record) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            dao.insert(record);
            if (!c.autoCommit) {
                c.commit();
            }
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    def update(Project p, AnnotationSchemaRecord record) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            dao.update(record);
            if (!c.autoCommit) {
                c.commit();
            }
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    def get(Project p, String id) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.get(id);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }


    public List<AnnotationSchemaRecord> getAll(Project p) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.getAll();
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    def delete(Project p, String id) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.delete(id);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }
}
