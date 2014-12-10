Intro
-----

The more tests we write, the more free time we have to improve the quality of our software. Without tests, it's easy to end up constantly chasing the 
same bugs again and again after each refactoring. A logical step to improving the quality of a web based application is to make
sure it works in all the various browsers out there. Normally you need to support old and sometimes obsolete operation systems, like
Windows XP and browsers which require their own VM (IE7, 8, 9 etc). The number of platforms that we want to run our tests on is constantly growing.

One way to solve this requirement is to maintain your own farm of virtual machines with various OS/browser combinations.
This can be tricky and will consume lots of your time and resources.
Another more elegant way is to use services providing the same infrastructure in the cloud. Thanks to services such as [BrowserStack](http://www.browserstack.com/) it is now very simple.

This guide describes the integration facilities that Siesta provides to access the BrowserStack cloud testing infrastructure.

Authentication
--------------

When registering in BrowserStack, you will receive a user name and an access key. You can find these in your BrowserStack account
under "Account -> Automate" section. Later in this guide we will refer to these as "BrowserStack username" and "BrowserStack access key"


Quick testing
------- 

Assuming your local web server is configured to listen at host "localhost" on port 80, all you need to launch your test suite in the cloud
is to sign up for the BrowserStack trial and run the following command:

    __SIESTA_DIR__/bin/webdriver http://localhost/myproject/tests/harness.html --browserstack BS_USERNAME,BS_KEY 
    --cap browser=firefox --cap os=windows --cap os_version=XP
    
That's all, the only difference from a normal Siesta automated launch is the "--browserstack" option, which is a shortcut performing
a few additional actions. We'll examine what happens under the hood later in this guide.

Note how we have specified the desired OS/browser combination using the "--cap" switch (it specifies remote webdriver capability).
For a full list of supported capabilities please refer to <http://www.browserstack.com/automate/capabilities>

If your webserver listens on a different host (`mylocalhost` for example) or port (8888), then the "--browserstack" option should look like:

    --browserstack BS_USERNAME,BS_KEY,mylocalhost,8888


Under the hood
-------------

Let's examine what happens under the hood when we use the  "--browserstack" shortcut option. In fact, we don't have to use this shortcut
option and can perform all the steps listed below manually.

1) The first thing that happens is that Siesta establishes a local tunnel from your machine to the BrowserStack server, using the BrowserStack binaries.
You can do this step manually by using the batch file in the Siesta package:

     __SIESTA_DIR__/bin/browserstacklocal BS_KEY mylocalhost,myportnumber

When launched successfully, you should see the following text:

    Verifying parameters
    
    Starting local testing
    You can now access your local server(s) in our remote browser:
    http://local:80
    
    Press Ctrl-C to exit
 
2) The "--host" option is set to point to the BrowserStack server, based on your username and access key:

    --host="http://BS_USERNAME:BS_KEY@hub.browserstack.com/wd/hub"
    
3) The browserstack specific capability "browserstack.local" is set to "true"

To sum up, instead of using the "--browserstack" shortcut option, we could:

- launch the tunnel manually: 

        __SIESTA_DIR__/bin/browserstacklocal BS_KEY,mylocalhost,myportnumber
    
- specify the command as:
    
        __SIESTA_DIR__/bin/webdriver http://localhost/myproject/tests/harness.html 
            --host="http://BS_USERNAME:BS_KEY@hub.browserstack.com/wd/hub" 
            --cap browser=firefox --cap os=windows --cap os_version=XP 
            --cap browserstack.local=true
    
For convenience, instead of setting the "--host" option manually, one can specify "--browserstack-user" and "--browserstack-key" options.

        __SIESTA_DIR__/bin/webdriver http://localhost/myproject/tests/harness.html 
            --browserstack-user=BS_USERNAME --browserstack-key=BS_KEY
            --cap browser=firefox --cap os=windows --cap os_version=XP 
            --cap browserstack.local=true


Conclusion
----------

As you can see, thanks to the excellent [BrowserStack](http://www.browserstack.com) infrastructure, launching your tests in the cloud is as easy as specifying
one extra argument on the command line. The benefits of cloud testing are obvious - no need to waste time and resources setting up and maintaining your own VM farm, 
and additionally you can run your test suite in various browsers in parallel. 

See also:
---------

<http://www.browserstack.com/local-testing>

Buy this product
---------

Visit our store: <http://bryntum.com/store/siesta>

Support
---------

Ask a question in our community forum: <http://www.bryntum.com/forum/viewforum.php?f=20>

Share your experience in our IRC channel: [#bryntum](http://webchat.freenode.net/?randomnick=1&channels=bryntum&prompt=1)

Please report any bugs through the web interface at <https://www.assembla.com/spaces/bryntum/support/tickets>


See also
---------

Web page of this product: <http://bryntum.com/products/siesta>

Other Bryntum products: <http://bryntum.com/products>


COPYRIGHT AND LICENSE
---------

Copyright (c) 2009-2014, Bryntum AB & Nickolay Platonov

All rights reserved.