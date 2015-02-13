dataSource {
    pooled = true
    driverClassName = "com.mysql.jdbc.Driver"
    username = "sa"
    password = ""
}
hibernate {
    cache.use_second_level_cache = true
    cache.use_query_cache = false
    cache.region.factory_class = 'net.sf.ehcache.hibernate.EhCacheRegionFactory'
}
// environment specific settings
environments {
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


