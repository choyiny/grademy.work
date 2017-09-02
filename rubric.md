---
layout: default
---

<nav class="navbar navbar-default navbar-fixed-top sub-nav">
    <div class="container">
            <div class="col-xs-2 btn-group sub-btn-group"> 
                <label id="release-toggle" class="switch"><input type="checkbox" id="togBtn"><div class="slider round"></div></label>
            </div>
              <div class="col-xs-8 col-xs-offset-1 btn-group view sub-btn-group optional" id="viewToggle" data-toggle="buttons">
                  <label class="btn btn-default active">
                      <input type="radio" name="options" value="userView" autocomplete="off" checked> Sheet View
                  </label>
                  <label class="col-xs-offset-11 btn btn-default">
                      <input type="radio" name="options" value="compareView" autocomplete="off"> Compare View
                  </label>
              </div>
              <!--div class="btn-group sub-btn-group pull-right optional" id="download"> 
                  <div id="download-button"></div>
              </div-->
      </div>
</nav>

<div class="container">
    <div id="content-container" class="row">
        <!--Nav Bar -->
        <nav class="col-xs-2 bs-docs-sidebar">
            <ul id="sidebar" class="nav nav-stacked fixed col-xs-2">
            </ul>
        </nav>

        <!--Main Content -->
        <div class="col-xs-9 col-xs-offset-1">
            <div id="alert-panel">
                <div id="main-warning" class="alert alert-warning" role="alert">Please sign in to the see the results of this grading scheme.</div>
                <div id="main-error" class="alert alert-danger" role="alert">You do not have any access to this grading scheme. Please contact your instructor.</div>
            </div>
            <div id="main-panel"></div>
        </div>
    </div>
  {% include footer.html %}
</div> <!-- /container -->

{% include scripts.html %}
<script src="{{site.baseurl}}/static/js/rubric.js"></script>