package gov.va.vinci.chartreview.db

import groovy.transform.ToString

/**
 *
 * Holds tbale information from a database.
 *
 * Note: In the SQL Server world, the format is:
 *       {"tableCat":"exampleDb","tableSchem":"myproject","tableName":"annotation","tableType":"TABLE"},
 *  Where tableSchem is the user schema (myproject in this example).
 *
 */
@ToString
class DatabaseTable {
    String tableCat;
    String tableSchem;
    String tableName;
    String tableType;
    String remarks;
    String typeCat;
    String typeSchem;
    String typeName;
    String selfReferencingColName;
    String refGeneration;

    public String getSchemaAndTable() {
        if (tableSchem) {
            return tableSchem + "." + tableName
        } else {
            return tableName;
        }

    }
}
