grails.servlet.version = "2.5" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.6
grails.project.source.level = 1.6
grails.project.war.file = "target/${appName}.war"

grails.project.dependency.resolver = "maven"

// uncomment (and adjust settings) to fork the JVM to isolate classpaths
//grails.project.fork = [
//   run: [maxMemory:1024, minMemory:64, debug:false, maxPerm:256]
//]

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // specify dependency exclusions here; for example, uncomment this to disable ehcache:
        // excludes 'ehcache'
    }
    log "verbose" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve
    legacyResolve false // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

    repositories {
        inherits true // Whether to inherit repository definitions from plugins
        mavenRepo "http://decipher.chpc.utah.edu/nexus/content/groups/public"
    }

    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes e.g.
        runtime 'mysql:mysql-connector-java:5.1.22'
        test 'com.h2database:h2:1.3.175'
        compile 'com.mysema.querydsl:querydsl-sql:3.3.1'
        compile 'com.mysema.querydsl:querydsl-sql-codegen:3.3.1'
        compile 'org.apache.commons:commons-lang3:3.2.1'
        provided 'com.microsoft.sqlserver:sqljdbc4:4.0'
//        runtime 'net.sourceforge.jtds:jtds:1.3.0'  Do we need to include this for it to be available as a project jdbc type?
        compile 'com.google.guava:guava:13.0.1'
        build 'gov.va.vinci:jtds:2.0.1'
        test 'net.sourceforge.spnego:spnego:r7'
        compile('gov.va.vinci.leo:leo-service:2014.08.0') {
            exclude 'org.springframework:spring-asm:3.0.7.RELEASE'
        }
        compile('gov.va.vinci.leo:leo-client:2014.08.0')
        compile 'gov.va.vinci:leo-siman:2015.06.02'
    }

    plugins {
        build ":rest:0.8"
        build ":tomcat:7.0.47"
	    build ":release:3.0.1"

        compile ":activiti:5.14.3"
        compile ":ajax-uploader:1.1"
        compile ":build-test-data:2.0.9"
        compile ":cache:1.0.1"
        compile ":cache-headers:1.0.4"
        compile ":ckeditor:4.4.1.0"
        runtime ":database-migration:1.3.8"
        compile ":grails-melody:1.52.0"
        compile ":jquery-ui:1.10.3"
        compile ":spring-security-core:2.0-RC3"
        compile 'org.grails.plugins:gson:1.1.4'
        compile "org.grails.plugins:runtime-logging:0.4a"
        compile ":rest-api-doc:0.1.2"
        compile ":scaffolding:2.0.0"
        compile ':webflow:2.0.8.1', {
            exclude 'javassist'
        }

        runtime ":hibernate:3.6.10.6"
        runtime ":jquery:1.10.2.2"
        runtime ':twitter-bootstrap:2.3.2'
    	runtime ':resources:1.2.7'


//        runtime ":zipped-resources:1.0"
//        runtime ":cached-resources:1.0"
//        runtime ":yui-minify-resources:0.1.4"
    }
}

// File: conf/BuildConfig.groovy
grails.war.resources = { stagingDir ->
    echo message: "StagingDir: $stagingDir"
    delete(verbose: true) {
        fileset(dir: stagingDir) {
            include name: 'WEB-INF/lib/guava-16.0.1.jar'
        }
    }
}
