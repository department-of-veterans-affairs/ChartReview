package gov.va.vinci.chartreview

import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.chartreview.model.schema.ClassRelDef

/**
 * Created by bradadams on 3/25/14.
 */
class CreateAnnotationSchemaModel implements Serializable {
    String name;
    String description;
    List<AttributeDef> attributeDefs = new ArrayList<AttributeDef>();
    List<ClassDef> classDefs = new ArrayList<ClassDef>();
    List<ClassRelDef> classRels = new ArrayList<ClassRelDef>();
}
