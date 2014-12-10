package gov.va.vinci.chartreview.model;
/*
 * #%L
 * siman
 * %%
 * Copyright (C) 2010 - 2014 Department of Veterans Affairs
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */


import com.mysema.query.sql.ColumnMetadata;
import com.mysema.query.types.Path;
import com.mysema.query.types.PathMetadata;
import com.mysema.query.types.path.DateTimePath;
import com.mysema.query.types.path.StringPath;
import gov.va.vinci.siman.model.QAnnotation;

import javax.annotation.Generated;

import static com.mysema.query.types.PathMetadataFactory.forVariable;

/**
 * Created by ryancornia on 8/26/14.
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QAnnotationTask extends com.mysema.query.sql.RelationalPathBase<QAnnotationTask> {

    private static final long serialVersionUID = -1991177471;

    public static final QAnnotationTask annotationTask = new QAnnotationTask("ANNOTATION_TASK");

    public final StringPath annotationGuid = createString("annotationGuid");
    public final StringPath processName = createString("processName");
    public final StringPath taskId = createString("taskId");
    public final StringPath principalElementId = createString("principalElementId");
    public final DateTimePath<java.sql.Timestamp> version = createDateTime("version", java.sql.Timestamp.class);


    public final com.mysema.query.sql.PrimaryKey<QAnnotationTask> sysPk10043 = createPrimaryKey(annotationGuid);
    public final com.mysema.query.sql.ForeignKey<QAnnotation> annotationElementFk = createForeignKey(annotationGuid, "guid");


    public QAnnotationTask(String variable) {
        super(QAnnotationTask.class, forVariable(variable), "PUBLIC", "ANNOTATION_TASK");
        addMetadata();
    }

    public QAnnotationTask(String variable, String schema, String table) {
        super(QAnnotationTask.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QAnnotationTask(Path<? extends QAnnotationTask> path) {
        super(path.getType(), path.getMetadata(), "PUBLIC", "ANNOTATION_TASK");
        addMetadata();
    }

    public QAnnotationTask(PathMetadata<?> metadata) {
        super(QAnnotationTask.class, metadata, "PUBLIC", "ANNOTATION_TASK");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(annotationGuid, ColumnMetadata.named("annotation_guid").ofType(12).withSize(36).notNull());
        addMetadata(processName, ColumnMetadata.named("process_name").ofType(12).withSize(1000));
        addMetadata(taskId, ColumnMetadata.named("task_id").ofType(12).withSize(64));

        addMetadata(principalElementId, ColumnMetadata.named("principal_element_id").ofType(12).withSize(100));
        addMetadata(version, ColumnMetadata.named("version").ofType(93).withSize(26).notNull());
    }
}
