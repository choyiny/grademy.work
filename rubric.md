---
layout: default
---

<nav class="navbar navbar-default navbar-fixed-top sub-nav">
    <div class="container">
              <div class="col-xs-2 btn-group sub-btn-group"> 
                <label id="releaseToggle" class="switch invisible"><input type="checkbox" class="disabled" id="togBtn"><div class="slider round"></div></label>
              </div>
              <!--div class="col-xs-8 col-xs-offset-1 btn-group view sub-btn-group invisible" id="viewToggle" data-toggle="buttons">
                  <label class="btn btn-default active">
                      <input type="radio" name="options" value="sheetView" autocomplete="off" checked>Sheet
                  </label>
                  <label class="btn btn-default">
                      <input type="radio" name="options" value="compareView" autocomplete="off">Rubric
                  </label>
              </div-->
      </div>
</nav>

<div class="container">
    <div id="content-container" class="row">
        <!-- Nav Bar -->
        <nav class="col-xs-2 bs-docs-sidebar">
            <ul id="sidebar" class="nav nav-stacked fixed col-xs-2">
                <!--li class="active"><a href="#sheet1">John doe</a>
                    <ul class="nav nav-stacked">
                        <li class="active"><a href="#sheet1-rubric0">First rubric</a></li>
                        <li><a href="#sheet1-rubric1">Second rubric</a></li>
                    </ul>
                </li>
                <li><a href="">Jane doe</a></li-->
            </ul>
        </nav>

        <!-- Main Content -->
        <div class="col-xs-8 col-xs-offset-1">
            <div id="title-panel" class="title" data-spy="affix" data-offset-top="1"><h1>Loading ...</h1></div>
            <div id="rubric-alert-panel">
                <div class="alert alert-success hidden">All rubrics have been filed.</div>
                <div class="alert alert-info hidden">Some rubrics are incomplete</div>
                <div class="alert alert-warning hidden" role="alert">Please sign in to the see the results of this grading scheme.</div>
                <div class="alert alert-danger hidden" role="alert">You do not have any access to this grading scheme. Please contact your instructor.</div>
            </div>
            <div id="main-panel">
            </div>
            {% include footer.html %}
        </div>
    </div>
</div> <!-- /container -->

{% include scripts.html %}
<script src="{{site.baseurl}}/static/js/rubric-templates.js"></script>
<script src="{{site.baseurl}}/static/js/rubric-ui.js"></script>