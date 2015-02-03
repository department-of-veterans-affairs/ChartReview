<g:if test="${flash.message}">
    <div class="alert alert-warning">
        <a class="close" data-dismiss="alert" href="#">&times;</a>
            ${flash.message}
    </div>
</g:if>
<g:if test="${message}">
    <div class="alert alert-warning">
        <a class="close" data-dismiss="alert" href="#">&times;</a>
          ${message}
    </div>
</g:if>
<g:if test="${model}">
    <g:hasErrors bean="${model}">
        <div class="alert alert-danger">
            <a class="close" data-dismiss="alert" href="#">&times;</a>
            <ul class="errors" role="alert">
                <g:eachError bean="${model}" var="error">
                    <li <g:if test="${error in org.springframework.validation.FieldError}">data-field-id="${error.field}"</g:if>><g:message error="${error}"/></li>
                </g:eachError>
            </ul>
        </div>
    </g:hasErrors>
</g:if>