import { list_plans, plan_info, list_plan_tasks, getProjectWeight, addWeight } from './plan.js'
import { set_page_info_project_list } from './project_list.js'
import { commonImages, draw_bar, draw_bar_chart, fiveImges, getMappedSdgData, sdgImages } from './chart/bar.js'

export function set_page_info_project_counts(uuid_project) {
  var weight = {};

  try {
    var obj_project = plan_info(uuid_project);
    var obj_parent_tasks = list_plan_tasks(obj_project.uuid, 1);
    weight = getProjectWeight(obj_parent_tasks.tasks);
  } catch (e) { return; }

  for (var index = 1; index < 28; index++) {
    if (weight["sdgs-" + index.toString()] != "0") {
      try {
        document.getElementById("pc_" + index.toString()).innerText =
        parseInt(document.getElementById("pc_" + index.toString()).innerText) + 1;
      } catch (e) { console.log(e) }
    }
  }
}

export function set_relate_people_and_project_counts(totalProjectWeight, list_project_uuids) {
  if (WEIGHT[1] == 1)
    $('#five_life_kpi').css('display', 'block');
  if (WEIGHT[2] == 1)
    $('#community_kpi').css('display', 'block');

  // 關係人口
  var total_sdgs_weight = 0;
  for (var index = 1; index < 28; index++) {
    try {
      total_sdgs_weight = total_sdgs_weight + parseInt(totalProjectWeight["sdgs-" + index]);
      document.getElementById("rp_" + index.toString()).innerText = totalProjectWeight["sdgs-" + index.toString()];
    } catch (e) { console.log(e) }
  }

  try {
    document.getElementById("rp_total_sdgs").innerText = total_sdgs_weight.toString();
  } catch (e) { console.log(e) }

  // 專案件數
  list_project_uuids.forEach(set_page_info_project_counts);
}

export function get_total_project_weight(list_project_uuids) {
    // Get Project weigh
    /* if (list_project_uuids.length != 0) {
      var totalProjectWeight = {};
    }
    for (var index = 0; index < list_project_uuids.length; index++) {
      var obj_project = plan_info(list_project_uuids[index]);
      var obj_parent_tasks = list_plan_tasks(obj_project.uuid, 1);

      var weight = {}
      try {
        if (obj_parent_tasks.tasks.length != 0) {
          weight = getProjectWeight(obj_parent_tasks.tasks);
        }
      } catch (e) { console.log(e) }

      totalProjectWeight = addWeight(totalProjectWeight, weight)
    }

    return totalProjectWeight;
 */

    return {"sdgs-1":24,"sdgs-2":5,"sdgs-3":1,"sdgs-4":41,"sdgs-5":23,"sdgs-6":19,"sdgs-7":1,"sdgs-8":0,"sdgs-9":0,"sdgs-10":0,"sdgs-11":34,"sdgs-12":25,"sdgs-13":17,"sdgs-14":2,"sdgs-15":19,"sdgs-16":0,"sdgs-17":23,"sdgs-18":18,"sdgs-19":17,"sdgs-20":17,"sdgs-21":37,"sdgs-22":17,"sdgs-23":18,"sdgs-24":18,"sdgs-25":37,"sdgs-26":19,"sdgs-27":17}
  }

export function draw_sdgs_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){
    if (parseInt(key.substring(5,7)) > 17){
      delete totalProjectWeight[key];
    }
  });

  const array_weight_colors = ["#e5243b", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21", "#26BDE2", "#FCC30B", "#A21942", "#FD6925", "#DD1367", "#FD9D24", "#BF8B2E", "#3F7E44", "#0A97D9", "#56C02B", "#00689D", "#19486A", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1"]
  draw_bar_chart({
    elementId: "weight_sdgs",
    title: "永續發展指標",
    data: totalProjectWeight,
    backgroundColor: array_weight_colors,
    images: sdgImages,
  });
}
export function draw_five_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){
    if (18 > parseInt(key.substring(5,7)) || parseInt(key.substring(5,7)) > 22) {
      delete totalProjectWeight[key];
    }
  });

  draw_bar_chart({
    elementId: "weight_five",
    title: "人文地產景",
    data: getMappedSdgData(totalProjectWeight),
    backgroundColor: "#0075A1",
    images: fiveImges,
  });
}

export function draw_comm_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){
    if (23 > parseInt(key.substring(5,7)) || parseInt(key.substring(5,7)) > 28) {
      delete totalProjectWeight[key];
    }
  });

  draw_bar_chart({
    elementId: "weight_comm",
    title: "德智體群美",
    data: getMappedSdgData(totalProjectWeight),
    backgroundColor: "#28a745",
    images: commonImages,
  });
}

export function set_page_info_kpi() {
  // 只撈第一頁，不跑 while loop
  var list_project_uuids = [];

  for (var index = 0; index < SITE_HOSTERS.length; index++) {
    try {
      // 只取第 1 頁 3 筆
      var obj_list_projects = list_plans(SITE_HOSTERS[index], null, 1, 3);
      if (obj_list_projects.projects && obj_list_projects.projects.length > 0) {
        list_project_uuids = list_project_uuids.concat(obj_list_projects.projects);
      }
    } catch (e) { console.log(e); }
  }

  // ✅ 渲染：第 1 頁 3 筆
  set_page_info_project_list();

  // === 以下維持原邏輯 ===
  var totalProjectWeight = get_total_project_weight(list_project_uuids);
  set_relate_people_and_project_counts(totalProjectWeight, list_project_uuids);

  var totalProjectWeight_for_sdgs = Object.assign({}, totalProjectWeight);
  draw_sdgs_chart(totalProjectWeight_for_sdgs);

  if (WEIGHT[1] == 1) {
    var totalProjectWeight_for_five = Object.assign({}, totalProjectWeight);
    $('#chart_weight_five').css('display', 'block');
    draw_five_chart(totalProjectWeight_for_five);
  }

  if (WEIGHT[2] == 1) {
    var totalProjectWeight_for_comm = Object.assign({}, totalProjectWeight);
    $('#chart_weight_comm').css('display', 'block');
    draw_comm_chart(totalProjectWeight_for_comm);
  }
}