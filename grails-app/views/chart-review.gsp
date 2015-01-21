<!--<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">-->
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Chart Review</title>

    <!-- CSS -->
    %{--<link rel="stylesheet" type="text/css" href="css/themes/classic/ext-theme-classic-all.css" />--}%
    %{--When I change values in the scss files found in the chart-review-theme package, and use the chart-review-theme as the theme in sencha.cfg, I DO see my changes in the generated chart-review-theme.css file that is generated when I do a "sencha package build" in the js/packages/chart-review-theme directory.--}%
    <link rel="stylesheet" type="text/css" href="packages/chart-review-theme/build/resources/chart-review-theme-all-debug.css" />
    %{--When I change values in the scss files found in the application, and use exe-theme-classic as the theme in sencha.cfg, I do not see my changes in the generated ChartReview-all.css files that are generated for either testing or production when I do a "sencha app build" or "sencha app build testing" in the js/chart-review directory--}%
    %{--<link rel="stylesheet" type="text/css" href="js/build/testing/ChartReview/resources/ChartReview-all.css" />--}%
    <link rel="stylesheet" type="text/css" href="css/chartReviewer.css" />

    <!-- GC -->
    <!-- <x-compile> -->

    <!-- <x-bootstrap> -->
    <script type="text/javascript" src="ext/build/ext-all-debug.js"></script>
    <!--<script type="text/javascript" src="js/ext-all.js"></script>-->
    %{--<script type="text/javascript" src="js/packages/chart-review-theme/build/chart-review-theme.js"></script>--}%
    <!--<script type="text/javascript" src="js/ext-theme-neptune.js"></script>-->
    <!-- </x-bootstrap> -->

    <script type="text/javascript">
        Ext.Loader.setPath('CR', 'app');
        Ext.Loader.setPath('CR.app', 'app');
        Ext.Loader.setPath('CR.app.controller', 'app/controller');
        Ext.Loader.setPath('CR.app.model', 'app/model');
//        Ext.Loader.setPath('CR.app.store', 'app/store');
        Ext.Loader.setPath('CR.app.view', 'app/view');
        Ext.Loader.setPath('CR.ux', 'app/ux');
        Ext.Loader.setPath('Ext.draw', 'ext/packages/ext-charts/src/draw');
        Ext.Loader.setPath('Ext.chart', 'ext/packages/ext-charts/src/chart');
        Ext.Loader.setPath('Ext.ux', 'ext/src/ux');
    </script>
    <script type="text/javascript" src="app.js"></script>
    <!-- </x-compile> -->
    <r:require modules="bootstrap"/>
    <r:layoutResources/>
</head>
<style type="text/css">
    html, body {
        overflow: hidden;
    }
</style>
<body>
<r:layoutResources/>
<g:render template="/layouts/mainmenu" />
<div style="margin-top: 46px">
    %{--<div id="appContent" style="padding: 0px; margin: 0px; width: 100%; height: 100%; overflow: hidden; background-color:blue;"></div>--}%
    <div id="appContent" style="padding: 0px; margin: 0px; width: 100%; height: 100%; overflow: hidden;"></div>```````````````````````````````````````````````````~~```````````````````````````````````````</div>
</body>
</html>
