package gov.va.vinci.chartreview.db

import java.sql.ResultSetMetaData

/**
 * Created by ryancornia on 7/10/15.
 */
class DatabaseUtilities {

    /**
     * Converts a list of rows in List<Object[]> format, and their associated metadata, into a list of Map
     * rows that contain column name as the key and value as the column value.
     * @param rows      the result set rows.
     * @param metadata  the associated metadata object with these rows.
     * @return   a list of Map rows that contain column name as the key and value as the column value.
     */
    public static List<TreeMap<String, Object>> resultSetToMap(List<Object[]> rows, ResultSetMetaData metadata)
    {
        List<TreeMap<String, Object>> results = new ArrayList<>();

        for (Object[] row: rows) {
            TreeMap<String, Object> thisRow = new TreeMap<>();
            int c = 0;
            for (Object value: row) {
                thisRow.put(metadata.getColumnName(c+1), value);
                c++;
            }
            results.add(thisRow);
        }
        return results;
    }
}
