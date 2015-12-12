dataSource {
    pooled = true
    driverClassName = "com.mysql.jdbc.Driver"
    username = "sa"
    password = ""
//    logSql = true
}
hibernate {
    cache.use_second_level_cache = true
    cache.use_query_cache = false
    cache.region.factory_class = 'net.sf.ehcache.hibernate.EhCacheRegionFactory'
}
// environment specific settings
environments {
//    development {
//        dataSource {
//            dbCreate = "update" // one of 'create', 'create-drop', 'update', 'validate', ''
//            url = "jdbc:sqlserver://cpoe.chpc.utah.edu:1433;databasename=chartreview"
//            username="chartreview"
//            password = "z213~sadf"
//            driverClassName = "com.microsoft.sqlserver.jdbc.SQLServerDriver"
//            dialect = "org.hibernate.dialect.SQLServerDialect"
//            hibernate.default_schema = 'Dbo'
//            hibernate.globally_quoted_identifiers=true
//            properties {
//                validationQuery='select 1'
//                testOnBorrow = true
//                testWhileIdle = true
//                testOnReturn = true
//                minEvictableIdleTimeMillis = 1000 * 60 * 5
//                timeBetweenEvictionRunsMillis = 1000 * 60 * 5
//            }
//
//        }
//        activiti {
//            processEngineName = "activiti-engine-dev"
//            databaseSchemaUpdate = "true" // true, false or "create-drop"
//            tablePrefixIsSchema = true;
//            databaseType = "mssql"
//            databaseTablePrefix = "Dbo."
//        }
//    }
    development {
        dataSource {
            dbCreate = "update" // one of 'create', 'create-drop', 'update', 'validateAndSetProperties', ''
            url = "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8"
            username = "chartreview"
            password = "passw0rd"
            driverClassName="com.mysql.jdbc.Driver";
            dialect = "org.hibernate.dialect.MySQL5InnoDBDialect"
            dbCreate = "update"
            properties {
                maxActive = 200
                maxIdle = 5
                minIdle = 1
                initialSize = 2

                numTestsPerEvictionRun = 3
                maxWait = 100000

                testOnBorrow = true
                testWhileIdle = true
                testOnReturn = true

                validationQuery = "select now()"

                minEvictableIdleTimeMillis = 1000 * 60 * 5
                timeBetweenEvictionRunsMillis = 1000 * 60 * 5
            }
        }
        activiti {
            processEngineName = "activiti-engine-dev"
            databaseSchemaUpdate = "true" // true, false or "create-drop"
            databaseType = "mysql"
        }
    }
    test {
        dataSource {
            dbCreate = "create-drop"
            url = "jdbc:h2:mem:testDb;MVCC=TRUE;LOCK_TIMEOUT=10000"
            driverClassName="org.h2.Driver"
        }
        activiti {
            processEngineName = "activiti-engine-test"
            databaseSchemaUpdate = true
            databaseType = "h2"
         }
    }
    production {
        dataSource {
            dbCreate = "update" // one of 'create', 'create-drop', 'update', 'validateAndSetProperties', ''
            jndiName = "java:comp/env/jdbc/chartReviewDS"
        }
        activiti {
            processEngineName = "activiti-engine-prod"
            databaseSchemaUpdate = true
            jobExecutorActivate = true
            databaseType = "mysql"
        }
    }
}


