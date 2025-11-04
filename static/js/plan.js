export function addWeight(w1, w2) {

  const combined = [w1, w2].reduce((a, obj) => {
    Object.entries(obj).forEach(([key, val]) => {
      a[key] = (parseInt(a[key]) || 0) + parseInt(val);
    });
    return a;
  });

  return combined;
}

export function plan_submit(form, uuid = null) {
  var resultJSON = {};

  // FIXME: Require field check
  // Workaround for Prevent null project
  var path = window.location.pathname;
  var page = path.split("/").pop();

  if (page != "cms_agent.html" && uuid == null) {
    try {
      let nameValue = form.get('name');
      if (nameValue === '' || nameValue === null || typeof nameValue === 'undefined')
        return;
    } catch (e) { return; }
  }

  form.append("email", getLocalStorage("email"));
  if (uuid != null) {
    form.append("uuid", uuid);
  }

  form.append("list_project_type", 0);

  $.ajax({
    "url": HOST_URL_TPLANET_DAEMON + "/projects/upload",
    "method": "POST",
    "async": false,
    "timeout": 0,
    "processData": false,
    "mimeType": "multipart/form-data",
    "contentType": false,
    "data": form,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       resultJSON = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return resultJSON;
}

export function plan_info(uuid) {
  var dataJSON = {};

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/info/" + uuid,
    type: "GET",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       dataJSON = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
  return dataJSON;
}

export function list_plan_tasks(uuid, parent = 0) {
  var dataJSON = {};
  var returnDataJSON = {};
  dataJSON.uuid = uuid;
  dataJSON.parent = parent;

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/tasks",
    type: "POST",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
       returnDataJSON = JSON.parse(returnData);
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
  return returnDataJSON;
}

export function list_plans(email = null, sdg = null, page = 1, page_size = 9) {
  var dataJSON = {};

  if (email != null) dataJSON.email = email;
  if (sdg != null) dataJSON.sdg = sdg;
  if (page != null) dataJSON.page = page;
  if (page_size != null) dataJSON.page_size = page_size;

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/projects",
    type: "POST",
    async: false,
    crossDomain: true,
    data: dataJSON,
    success: function(returnData) {
      const obj = JSON.parse(returnData);
      dataJSON = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return dataJSON;
}


export function append_plan_submit_data(page, form) {
  if (page == "cms_plan_info.html") {
    // Budget
    var input_budget = document.getElementById('budget').value;
    var isInteger = /^[0-9]+$/.test(input_budget);
    if (!isInteger) {
      alert('請輸入有效的整數');
      return null;
      // 可以進一步處理，例如清空輸入欄位或為其添加一些視覺效果來指示錯誤
    }

    form.append("name", document.getElementById("name").value);
    form.append("project_a", document.getElementById("project_a").value);
    form.append("project_b", document.getElementById("project_b").value);
    form.append("project_start_date", document.getElementById("project_start_date").value);
    form.append("project_due_date", document.getElementById("project_due_date").value);
    form.append("budget", document.getElementById("budget").value);
    form.append("philosophy", document.getElementById("philosophy").value);

  } else if (page == "cms_sdgs_setting.html") {

    // Get SDGs data
    var list_sdg = new Array(27).fill(0);
    for(var index = 1; index <= 17; index++) {
      if (document.getElementById("sdg_" + index.toString()).checked.toString() == "true") {
        list_sdg[index - 1] = 1;
      }
    }

    // Additional SDGs data
    for(var index = 17; index <= 27; index++) {
      if (document.getElementById("sdg_" + index.toString()).checked.toString() == "true") {
        list_sdg[index - 1] = 1;
      }
    }

    // Set local storage
    form.append("list_sdg", list_sdg);
  } else if (page == "cms_impact.html") {

    const textareaIds = [
      ...document.querySelectorAll("textarea[id^='sdg_']"),
      ...document.querySelectorAll("textarea[id^='parent_task_overview_']")
    ].map(item => `#${item.id}`);
    register_ckeditor(textareaIds);

    var dataJSON = {};
    for (var index = 0 ; index <17; index++) {
      // Append to JSON
      if (document.getElementById("sdg_" + ("0" + (index + 1)).slice(-2) + "_des") == null) {
        continue;
      }
	    dataJSON[index] = document.getElementById("sdg_" + ("0" + (index + 1)).slice(-2) + "_des").innerText;
    }

    // Additional SDGs data
    for (var index = 17 ; index <=27; index++) {
      // Append to JSON
      if (document.getElementById("sdg_" + ("0" + (index + 1)).slice(-2) + "_des") == null) {
        continue;
      }
	    dataJSON[index] = document.getElementById("sdg_" + ("0" + (index + 1)).slice(-2) + "_des").innerText;
    }

    // {"0":"透過深度參與豐富指標","11":"定期聚板相關市集","14":"社區友善農業的產銷創生解方"}
    form.append("weight_description", JSON.stringify(dataJSON));
    } else if (page == "cms_contact_person.html") {
      form.append("hoster", document.getElementById("hoster").value);
      form.append("hoster_email", document.getElementById("email").value);
      form.append("org", document.getElementById("org").value);
      form.append("tel", document.getElementById("tel").value);
      var list_location = [0, 0, 0, 0, 0];
      for(var index = 1; index <= 5; index++) {
        if (document.getElementById("location_" + index.toString()).checked.toString() == "true") {
          list_location[index - 1] = 1;
        }
      }
      form.append("list_location", list_location);
    }

  return form;
}

function plan_send(form) {

  var resultJSON = {};
  $.ajax({
    "url": HOST_URL_TPLANET_DAEMON + "/projects/send_project",
    "method": "POST",
    "async": true,
    "timeout": 0,
    "processData": false,
    "mimeType": "multipart/form-data",
    "contentType": false,
    "data": form,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       resultJSON = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return resultJSON;
}

export function getProjectWeight(list_task_UUIDs) {
  var projectWeight = {};
  var dataJSON = {};
  dataJSON.uuid = list_task_UUIDs[0];

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/weight",
    type: "POST",
    async: false,
    crossDomain: true,
    data: dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       projectWeight = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return projectWeight;
}

export function delete_plan(uuid) {
  var dataJSON = {};
  dataJSON.uuid = uuid;

  var resultJSON = {};

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/del_project",
    type: "POST",
    async: false,
    crossDomain: true,
    data: dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       resultJSON = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return resultJSON;
}
