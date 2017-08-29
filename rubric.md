---
layout: default
---

<div class="container">
    <div class="row">
        <!--Nav Bar -->
        <nav class="col-xs-2 bs-docs-sidebar">
            <div class="container" class="fixed">
                <div class="btn-group btn-toggle"> 
                   <button id="view-toggle" class="btn btn-default" value="sheet">compare results</button>
                 </div>
            </div>
            <ul id="sidebar" class="nav nav-stacked fixed col-xs-2">
            </ul>
        </nav>

        <!--Main Content -->
        <div class="col-xs-9 col-xs-offset-1">
            <div id="alert-panel">
                <div id="main-success" class="alert alert-success" role="alert">This grading scheme has been released</div>
                <div id="main-info" class="alert alert-info" role="alert">This grading scheme has not been released</div>
                <div id="main-warning" class="alert alert-warning" role="alert">Please sign in to the see the results of this grading scheme.</div>
                <div id="main-error" class="alert alert-danger" role="alert">You do not have any access to this grading scheme. Please contact your instructor.</div>
            </div>
            <div id="main-panel"></div>
        </div>
    </div>
  {% include footer.html %}
</div> <!-- /container -->

{% include scripts.html %}
<script src="{{site.url}}/static/js/rubric.js"></script>