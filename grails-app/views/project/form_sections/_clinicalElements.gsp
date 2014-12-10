<legend>Select clinical elements used in this project</legend>
<g:each in="${clinicalElements}" var="clinicalElement">
    <div style="vertical-align: top"><g:checkBox name="clinicalElement-${clinicalElement.id}"  style="vertical-align: top" checked="${projectInstance?.clinicalElementConfigurations?.contains(clinicalElement)}"/> ${clinicalElement.name}</div>
</g:each>
 <br/><br/><br/><br/>
<input type="button"  class="btn btn-primary save" id="configurationNext" onclick="changeTab(0);" value="&lt;&lt; Previous" />
<input type="button"  class="btn btn-primary save" id="configurationNext" onclick="changeTab(2);" value="Next &gt;&gt;" style="float: right"/>