// locations to search for config files that get merged into the main config;
// config files can be ConfigSlurper scripts, Java properties files, or classes
// in the classpath in ConfigSlurper format

// grails.config.locations = [ "classpath:${appName}-config.properties",
//                             "classpath:${appName}-config.groovy",
//                             "file:${userHome}/.grails/${appName}-config.properties",
//                             "file:${userHome}/.grails/${appName}-config.groovy"]

// if (System.properties["${appName}.config.location"]) {
//    grails.config.locations << "file:" + System.properties["${appName}.config.location"]
// }

grails.plugins.restapidoc.basePath="/chart-review"

grails.converters.gson.escapeHtmlChars = false;

grails.converters.xml.default.deep = true
grails.converters.xml.pretty.print = false;

grails.project.groupId = appName // change this to alter the default package name and Maven publishing destination
grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.use.accept.header = false
grails.mime.types = [
    all:           '*/*',
    atom:          'application/atom+xml',
    css:           'text/css',
    csv:           'text/csv',
    form:          'application/x-www-form-urlencoded',
    html:          ['text/html','application/xhtml+xml'],
    js:            'text/javascript',
    json:          ['application/json', 'text/json'],
    multipartForm: 'multipart/form-data',
    rss:           'application/rss+xml',
    text:          'text/plain',
    xml:           ['text/xml', 'application/xml']
]

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// What URL patterns should be processed by the resources plugin
grails.resources.adhoc.patterns = ['/images/*', '/css/*', '/js/*', '/plugins/*']

// The default codec used to encode data with ${}
grails.views.default.codec = "none" // none, html, base64
grails.views.gsp.encoding = "UTF-8"
grails.converters.encoding = "UTF-8"
// enable Sitemesh preprocessing of GSP pages
grails.views.gsp.sitemesh.preprocess = true
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
grails.converters.default.pretty.print=true
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = ['gov.va.vinci.chartreview.process']
// whether to disable processing of multi part requests
grails.web.disable.multipart=false

// request parameters to mask when logging exceptions
grails.exceptionresolver.params.exclude = ['password']

// configure auto-caching of queries by default (if false you can cache individual queries with 'cache: true')
grails.hibernate.cache.queries = false

compress {
    enabled = false
}

environments {
    development {
        grails.logging.jul.usebridge = true
        grails.logging.jul.usebridge = true
    }
    production {
        grails.logging.jul.usebridge = false
    }
}

// log4j configuration
log4j = {
    // Example of changing the log pattern for the default console appender:
    //
    //appenders {
    //    console name:'stdout', layout:pattern(conversionPattern: '%c{2} %m%n')
    //}


    error  'org.codehaus.groovy.grails.web.servlet',        // controllers
           'org.codehaus.groovy.grails.web.pages',          // GSP
           'org.codehaus.groovy.grails.web.sitemesh',       // layouts
           'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
           'org.codehaus.groovy.grails.web.mapping',        // URL mapping
           'org.codehaus.groovy.grails.commons',            // core / classloading
           'org.codehaus.groovy.grails.plugins',            // plugins
           'org.codehaus.groovy.grails.orm.hibernate',      // hibernate integration
           'org.springframework',
           'org.hibernate',
           'net.sf.ehcache.hibernate'
//    debug 'org.grails.activiti'

    //debug 'org.springframework.security'

    // Logging debug and higher for the services
    //debug 'grails.app.services';

    //debug 'org.springframework',

    // Uncomment the following two lines to get SQL and bind parameters.
//    debug 'org.hibernate.SQL'
//    trace 'org.hibernate.type'
}

grails.plugins.twitterbootstrap.fixtaglib=true;

/**
 * Spring security configuration.
 *
 */

grails.plugin.springsecurity.useSwitchUserFilter = true
grails.plugin.springsecurity.useSecurityEventListener = true
grails.plugin.springsecurity.userLookup.userDomainClassName = 'gov.va.vinci.chartreview.model.User'
grails.plugin.springsecurity.userLookup.authorityJoinClassName = 'gov.va.vinci.chartreview.model.UserProjectRole'
grails.plugin.springsecurity.userLookup.usernamePropertyName = 'username';
grails.plugin.springsecurity.authority.className = 'gov.va.vinci.chartreview.model.Role'
grails.plugin.springsecurity.securityConfigType = "InterceptUrlMap"
grails.plugin.springsecurity.interceptUrlMap = [
        '/j_spring_security_check':	    ['IS_AUTHENTICATED_ANONYMOUSLY'],
        '/sessiontimeout':	            ['IS_AUTHENTICATED_ANONYMOUSLY'],
        '/login/**':     		        ['IS_AUTHENTICATED_ANONYMOUSLY'],
        '/logout/**':    		        ['IS_AUTHENTICATED_ANONYMOUSLY'],
        '/schema/uimaTypeSystem/**':     ['IS_AUTHENTICATED_ANONYMOUSLY'],
        '/admin/deleteRunningProcessInstancesByProjectProcess':                    ['IS_AUTHENTICATED_FULLY'],
        '/admin/**':                    ['ROLE_ADMIN_CHARTREVIEW'],
        '/monitoring/**':               ['ROLE_ADMIN_CHARTREVIEW'],
        '/runtimeLogging/**':           ['ROLE_ADMIN_CHARTREVIEW'],
        '/user/ajaxFindUsers':          ['IS_AUTHENTICATED_FULLY'],
        '/user/**':                     ['ROLE_ADMIN_CHARTREVIEW'],
        '/workflow/addToProject/**':    ['IS_AUTHENTICATED_FULLY'],
        '/workflow/**':                 ['ROLE_ADMIN_CHARTREVIEW'],
        '/**':   	    		        ['IS_AUTHENTICATED_FULLY'],
]
grails.plugin.springsecurity.voterNames = [
        'authenticatedVoter', 'roleVoter',
        'webExpressionVoter', 'chartReviewRoleVoter'
]
/**
 * End Spring security configuration.
 */


grails.plugins.appinfo.useContextListener = true

// Uncomment and edit the following lines to start using Grails encoding & escaping improvements

/* remove this line 
// GSP settings
grails {
    views {
        gsp {
            encoding = 'UTF-8'
            htmlcodec = 'xml' // use xml escaping instead of HTML4 escaping
            codecs {
                expression = 'html' // escapes values inside null
                scriptlet = 'none' // escapes output from scriptlets in GSPs
                taglib = 'none' // escapes output from taglibs
                staticparts = 'none' // escapes output from static template parts
            }
        }
        // escapes all not-encoded output at final stage of outputting
        filteringCodecForContentType {
            //'text/html' = 'html'
        }
    }
}
remove this line */

// Added by the Grails Activiti plugin:
activiti {
    processEngineName = "activiti-engine-default"

    deploymentName = Chex
    deploymentResources = ["file:./grails-app/conf/**/*.bpmn*.xml",
            "file:./grails-app/conf/**/*.png",
            "file:./src/taskforms/**/*.form"]
    jobExecutorActivate = true
    mailServerHost = "smtp.yourserver.com"
    mailServerPort = "25"
    mailServerUsername = ""
    mailServerPassword = ""
    mailServerDefaultFrom = "username@yourserver.com"
    history = "audit" // "none", "activity", "audit" or "full"
    sessionUsernameKey = SessionConstants.USERNAME;
    useFormKey = true
}

ckeditor {
    config = "/js/myckconfig.js"
    skipAllowedItemsCheck = false
    defaultFileBrowser = "ofm"
    upload {
        basedir = "/uploads/"
        overwrite = false
        link {
            browser = true
            upload = false
            allowed = []
            denied = ['html', 'htm', 'php', 'php2', 'php3', 'php4', 'php5',
                    'phtml', 'pwml', 'inc', 'asp', 'aspx', 'ascx', 'jsp',
                    'cfm', 'cfc', 'pl', 'bat', 'exe', 'com', 'dll', 'vbs', 'js', 'reg',
                    'cgi', 'htaccess', 'asis', 'sh', 'shtml', 'shtm', 'phtm']
        }
        image {
            browser = true
            upload = true
            allowed = ['jpg', 'gif', 'jpeg', 'png']
            denied = []
        }
        flash {
            browser = false
            upload = false
            allowed = ['swf']
            denied = []
        }
    }
}

grails.doc.title = "Chart Review"
grails.doc.subtitle = ""
grails.doc.authors = "University of Utah / VA"

grails.resources.modules = {
    overrides {
        'jquery-theme' {
            resource id:'theme', url:'/themes/smoothness/jquery-ui-1.10.4.custom.min.css'
        }
    }
}
