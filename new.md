---
layout: default
---

<div class="container">
    <h1>Create a new grading scheme</h1>
    <div id="new-error" class="alert alert-danger" role="alert">Something went wrong!</div>
    <form id="new-scheme-form">
        <button type="submit" class="btn btn-success">Submit</button>
        <div class="form-group">
           <label for="scheme-name">Name</label>
           <input id="scheme-name" type="text" class="form-control"/>
         </div>
        <div class="form-group">
           <label for="scheme-rubrics">Rubrics</label>
           <textarea id="scheme-rubrics" class="form-control" rows="15"></textarea>
         </div>
        <div class="form-group">
           <label for="scheme-sheets">Sheets</label>
           <textarea id="scheme-sheets" class="form-control" rows="15"></textarea>
         </div>
    </form>
  {% include footer.html %}
</div> <!-- /container -->

{% include scripts.html %}
<script src="{{site.baseurl}}/static/node_modules/esprima/dist/esprima.js"></script>
<script src="{{site.baseurl}}/static/node_modules/js-yaml/dist/js-yaml.min.js"></script>
<script src="{{site.baseurl}}/static/js/login-required.js"></script>
<script src="{{site.baseurl}}/static/js/new.js"></script>