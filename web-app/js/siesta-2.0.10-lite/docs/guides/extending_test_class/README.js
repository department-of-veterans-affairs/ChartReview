Ext.data.JsonP.extending_test_class({"guide":"<h2 id='extending_test_class-section-intro'>Intro</h2>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/extending_test_class-section-intro'>Intro</a></li>\n<li><a href='#!/guide/extending_test_class-section-extending-the-siesta-test-class'>Extending the Siesta test class</a></li>\n<li><a href='#!/guide/extending_test_class-section-things-to-note'>Things to note</a></li>\n<li><a href='#!/guide/extending_test_class-section-custom-setup'>Custom setup</a></li>\n<li><a href='#!/guide/extending_test_class-section-more-examples'>More examples</a></li>\n<li><a href='#!/guide/extending_test_class-section-buy-this-product'>Buy this product</a></li>\n<li><a href='#!/guide/extending_test_class-section-support'>Support</a></li>\n<li><a href='#!/guide/extending_test_class-section-see-also'>See also</a></li>\n<li><a href='#!/guide/extending_test_class-section-copyright-and-license'>COPYRIGHT AND LICENSE</a></li>\n</ol>\n</div>\n\n<p>As your test suite grows you often notice that you are repeating certain pieces of code in your tests. You should then consider extending the Siesta test class with your own utility and assertion methods.</p>\n\n<p>It can be just a simple helper method returning some pre-populated data store, or a new assertion method which reports results to the harness like any other.</p>\n\n<h2 id='extending_test_class-section-extending-the-siesta-test-class'>Extending the Siesta test class</h2>\n\n<p>All Siesta assertions are methods belonging to the <a href=\"#!/api/Siesta.Test\" rel=\"Siesta.Test\" class=\"docClass\">Siesta.Test</a> class. To create a new assertion method you will need to subclass the test class.\nWhen creating assertions purposed for testing JavaScript code built with Ext JS - subclass the <a href=\"#!/api/Siesta.Test.ExtJS\" rel=\"Siesta.Test.ExtJS\" class=\"docClass\">Siesta.Test.ExtJS</a>. For testing NodeJS code - use <a href=\"#!/api/Siesta.Test\" rel=\"Siesta.Test\" class=\"docClass\">Siesta.Test</a> as your base class.</p>\n\n<p>Siesta is written using the <a href=\"http://joose.it\">Joose</a> class system, the following example will show you how to subclass the test class.</p>\n\n<p>Let's create 2 special assertions, which will be checking the odd parity of a passed number. Usually, an assertion needs to check its statement and report the result\nwith either <a href=\"#!/api/Siesta.Test-method-pass\" rel=\"Siesta.Test-method-pass\" class=\"docClass\">Siesta.Test.pass</a> or <a href=\"#!/api/Siesta.Test-method-fail\" rel=\"Siesta.Test-method-fail\" class=\"docClass\">Siesta.Test.fail</a> methods.</p>\n\n<pre><code>Class('MyProject.MyTestClass', {\n    isa     : <a href=\"#!/api/Siesta.Test.ExtJS\" rel=\"Siesta.Test.ExtJS\" class=\"docClass\">Siesta.Test.ExtJS</a>,\n\n    methods : {\n\n        isOdd : function (number, description) {\n            if (number % 2) {\n                this.pass(description);\n            } else {\n                this.fail(description, {\n                    assertionName   : 'isOdd',\n                    got             : number,\n                    annotation      : 'Need odd number'\n                });\n            }\n        },\n\n        isEven : function (number, description) {\n            if (!(number % 2)) {\n                this.pass(description);\n            } else {\n                this.fail(description, {\n                    assertionName   : 'isEven',\n                    got             : number,\n                    annotation      : 'Need even number'\n                });\n            }\n        }\n    }\n})\n</code></pre>\n\n<p>When failing, try to provide as much information about the failure as possible and format the failure message in a readable form. Please refer to <a href=\"#!/api/Siesta.Test-method-fail\" rel=\"Siesta.Test-method-fail\" class=\"docClass\">Siesta.Test.fail</a>\nmethod documentation for additional options.</p>\n\n<p>To make the Harness use your new test class you have to specify the test class to use by setting the <a href=\"#!/api/Siesta.Harness-cfg-testClass\" rel=\"Siesta.Harness-cfg-testClass\" class=\"docClass\">Siesta.Harness.testClass</a> configuration option:</p>\n\n<pre><code>Harness.configure({\n    title       : 'Awesome Test Suite',\n\n    testClass   : MyProject.MyTestClass,\n\n    preload     : [\n        ...\n    ]\n})\n</code></pre>\n\n<p>The test class should be loaded right after the siesta-all.js file:</p>\n\n<pre><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=\"stylesheet\" type=\"text/css\" href=\"http://cdn.sencha.io/ext-4.1.0-gpl/resources/css/ext-all.css\"&gt;\n        &lt;link rel=\"stylesheet\" type=\"text/css\" href=\"__path_to_siesta__/resources/css/siesta-all.css\"&gt;\n\n        &lt;script type=\"text/javascript\" src=\"http://cdn.sencha.io/ext-4.1.0-gpl/bootstrap.js\"&gt;&lt;/script&gt;\n        &lt;script type=\"text/javascript\" src=\"__path_to_siesta__/siesta-all.js\"&gt;&lt;/script&gt;\n\n        &lt;!-- The file with new test class --&gt;\n        &lt;script type=\"text/javascript\" src=\"lib/MyTestClass.js\"&gt;&lt;/script&gt;\n\n        &lt;script type=\"text/javascript\" src=\"index.js\"&gt;&lt;/script&gt;\n    &lt;/head&gt;\n\n    &lt;body&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n\n<h2 id='extending_test_class-section-things-to-note'>Things to note</h2>\n\n<ul>\n<li><p><code>this</code> inside of assertion methods corresponds to the test instance (often seen as <code>t</code> in the examples)</p></li>\n<li><p>The Test class \"belongs\" to the context of the harness. Each test will have its own global context. So, <code>window</code> inside of an assertion method is different from the <code>window</code> inside of <code>StartTest</code>.</p></li>\n<li><p>To get the \"window\" of the test page, use \"this.global\"</p></li>\n<li><p>For Ext JS tests: To get the Ext object from the scope of the test page use <a href=\"#!/api/Siesta.Test.ExtJS-method-getExt\" rel=\"Siesta.Test.ExtJS-method-getExt\" class=\"docClass\">this.getExt()</a>, which is a shortcut for <code>this.global.Ext</code></p></li>\n<li><p>A new test class should be included in the harness file - index.html</p></li>\n<li><p>When performing asynchronous operations inside of a helper method - always wrap them with <code>this.beginAsync/this.endAsync</code> calls</p></li>\n</ul>\n\n\n<h2 id='extending_test_class-section-custom-setup'>Custom setup</h2>\n\n<p>Sometimes, you need to execute some code before every test start. For this purpose you can use <a href=\"#!/api/Siesta.Test-method-setup\" rel=\"Siesta.Test-method-setup\" class=\"docClass\">Siesta.Test.setup</a> method, please refer to its documentation\nfor details. There's also <a href=\"#!/api/Siesta.Test-method-isReady\" rel=\"Siesta.Test-method-isReady\" class=\"docClass\">Siesta.Test.isReady</a> method, which is  slightly harder to implement.</p>\n\n<h2 id='extending_test_class-section-more-examples'>More examples</h2>\n\n<p>See also the <code>/examples/023-extjs-grid</code> example.</p>\n\n<pre><code>Class('MyProject.MyTestClass', {\n    isa     : <a href=\"#!/api/Siesta.Test.ExtJS\" rel=\"Siesta.Test.ExtJS\" class=\"docClass\">Siesta.Test.ExtJS</a>,\n\n    methods : {\n\n        // create a grid with some pre-defined configuration\n        getGrid : function (config) {\n            // Get the `Ext` object from the context of test page\n            var Ext     = this.getExt();\n\n            return Ext.create('Ext.grid.Panel', Ext.apply({\n                ...\n            }, config));\n        },\n\n        // a custom wrapper around the `this.waitFor`\n        waitForAppLogin : function (callback, scope, timeout) {\n            // Get the `MyApp` reference from the context of test page\n            // this.global is a \"window\" object of the test page\n            var MyApp       = this.global.MyApp\n\n            this.waitFor(function () {\n                return MyApp.AuthManager.isAuthenticated();\n            }, callback, scope, timeout);\n        } \n    }\n});\n</code></pre>\n\n<h2 id='extending_test_class-section-buy-this-product'>Buy this product</h2>\n\n<p>Visit our store: <a href=\"http://bryntum.com/store/siesta\">http://bryntum.com/store/siesta</a></p>\n\n<h2 id='extending_test_class-section-support'>Support</h2>\n\n<p>Ask questions in our community forum: <a href=\"http://www.bryntum.com/forum/viewforum.php?f=20\">http://www.bryntum.com/forum/viewforum.php?f=20</a></p>\n\n<p>Share your experience in our IRC channel: <a href=\"http://webchat.freenode.net/?randomnick=1&amp;channels=bryntum&amp;prompt=1\">#bryntum</a></p>\n\n<p>Please report any bugs through the web interface at <a href=\"https://www.assembla.com/spaces/bryntum/support/tickets\">https://www.assembla.com/spaces/bryntum/support/tickets</a></p>\n\n<h2 id='extending_test_class-section-see-also'>See also</h2>\n\n<p>Web page of this product: <a href=\"http://bryntum.com/products/siesta\">http://bryntum.com/products/siesta</a></p>\n\n<p>Other Bryntum products: <a href=\"http://bryntum.com/products\">http://bryntum.com/products</a></p>\n\n<h2 id='extending_test_class-section-copyright-and-license'>COPYRIGHT AND LICENSE</h2>\n\n<p>Copyright (c) 2009-2014, Bryntum AB &amp; Nickolay Platonov</p>\n\n<p>All rights reserved.</p>\n","title":"Extending a test class with your own assertions and utility methods"});