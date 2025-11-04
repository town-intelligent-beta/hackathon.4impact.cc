import { list_plans, plan_info } from "./plan.js";

export function set_page_info_project_list(page = 1, page_size = 9, filterYear = null) {
  const yearFilterSelect = document.getElementById("year_filter");
  const projectContainer = document.getElementById("project_container");
  let list_project_uuids = [];
  let list_years = [];

  // === 1️⃣ 控制 KPI 區塊顯示 ===
  const kpiSection = document.getElementById("kpi_summary");
  const relationSection = document.getElementById("relation_chart");

  if (page === 1) {
    if (kpiSection) kpiSection.style.display = "block";
    if (relationSection) relationSection.style.display = "block";
  } else {
    if (kpiSection) kpiSection.style.display = "none";
    if (relationSection) relationSection.style.display = "none";
  }

  // === 2️⃣ 建立年份選單 ===
  if (yearFilterSelect.options.length === 0) {
    const selectAllOption = document.createElement("option");
    selectAllOption.value = "all";
    selectAllOption.textContent = "全部";
    yearFilterSelect.appendChild(selectAllOption);
  }

  // === 3️⃣ 收集所有專案 UUID + 年份 ===
  for (let index = 0; index < SITE_HOSTERS.length; index++) {
    try {
      const obj_list_projects = list_plans(SITE_HOSTERS[index], null);
      if (!obj_list_projects.projects) continue;

      list_project_uuids = list_project_uuids.concat(obj_list_projects.projects);

      obj_list_projects.projects.forEach((uuid) => {
        const info = plan_info(uuid);
        if (info && info.period) {
          const startYear = extractStartYear(info.period);
          if (!isNaN(startYear)) list_years.push(startYear);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  // === 4️⃣ 產出年份選單（只做一次）===
  if (yearFilterSelect.options.length === 1) {
    list_years = Array.from(new Set(list_years)).sort();
    list_years.forEach((year) => {
      if (!isNaN(year)) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilterSelect.appendChild(option);
      }
    });
  }

  // === 5️⃣ 若有 filterYear → 過濾該年份的 UUID ===
  if (filterYear) {
    list_project_uuids = filterProjectsByYear(parseInt(filterYear), list_project_uuids);
  }

  // === 6️⃣ 計算分頁 ===
  let startIndex, endIndex;
  if (page === 1) {
    startIndex = 0;
    endIndex = 3;
  } else {
    startIndex = 3 + (page - 2) * page_size;
    endIndex = startIndex + page_size;
  }
  const projectsToDisplay = list_project_uuids.slice(startIndex, endIndex);

  // === 7️⃣ 清空並渲染卡片 ===
  projectContainer.innerHTML = "";
  projectsToDisplay.forEach((uuid) => {
    const obj = plan_info(uuid);
    const html = generateProjectBlockHTML(obj);
    const block = document.createElement("div");
    block.className = "col-md-4";
    block.innerHTML = html;
    projectContainer.appendChild(block);
  });

  // === 8️⃣ 分頁控制 ===
  renderPaginationControls();

  function renderPaginationControls() {
    // 計算總頁數
    let totalPages = 1;
    if (list_project_uuids.length > 3) {
      const remaining = list_project_uuids.length - 3;
      totalPages = 1 + Math.ceil(remaining / page_size);
    }

    // 移除舊的
    const oldControls = document.querySelector(".pagination-controls");
    if (oldControls) oldControls.remove();

    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination-controls text-center mt-3";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← 上一頁";
    prevBtn.className = "btn btn-outline-primary mx-2";
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () =>
      set_page_info_project_list(page - 1, page_size, filterYear);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "下一頁 →";
    nextBtn.className = "btn btn-outline-primary mx-2";
    nextBtn.disabled = page >= totalPages;
    nextBtn.onclick = () =>
      set_page_info_project_list(page + 1, page_size, filterYear);

    const infoText = document.createElement("span");
    infoText.textContent = `第 ${page} 頁，共 ${totalPages} 頁`;

    paginationDiv.append(prevBtn, infoText, nextBtn);
    projectContainer.parentNode.appendChild(paginationDiv);
  }

  // === 9️⃣ 綁定年份篩選 ===
  yearFilterSelect.onchange = function () {
    const selectedValue = this.value;
    if (selectedValue === "all") {
      set_page_info_project_list(1, page_size, null);
    } else {
      set_page_info_project_list(1, page_size, selectedValue);
    }
  };
}

// ====== Helper Functions ======

function extractStartYear(period) {
  if (!period) return NaN;
  // 支援格式：MM/DD/YYYY - MM/DD/YYYY
  const match = period.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : NaN;
}

function filterProjectsByYear(selectedYear, list_project_uuids) {
  return list_project_uuids.filter((uuid) => {
    const info = plan_info(uuid);
    if (!info || !info.period) return false;
    const year = extractStartYear(info.period);
    return year === selectedYear;
  });
}

function generateProjectBlockHTML(obj_project) {
  let html = `<a class="text-dark" href="/cms_project_detail.html?uuid=${obj_project.uuid}" style="display: block; text-decoration:none">
    <div class="card mb-4 kpi-card" style="border-radius: 20px;">
      <div class="d-flex justify-content-center">
        <div class="img-fluid bg-cover shadow"
             style="background-repeat: no-repeat; background-position: center center; background-size: cover;
                    background-image:url(${obj_project.img ? HOST_URL_TPLANET_DAEMON + obj_project.img : "#"});
                    width:100%; height:200px; border-radius: 18px;">
        </div>
      </div>
      <div class="card-body d-flex flex-column">
        <p class="h5">${obj_project.name}</p>
        <p class="card-text mt-4">永續企業:<span class="pl-2">${obj_project.project_a}</span></p>
        <p class="card-text">地方團隊:<span class="pl-2">${obj_project.project_b}</span></p>
        <p class="card-text">期間:<span class="pl-2">${obj_project.period}</span></p>
        <p class="card-text">預算:<span class="pl-2">新台幣 ${obj_project.budget} 元</span></p>
        <div class="row mt-3">${generateSDGsHTML(obj_project.weight)}</div>
      </div>
    </div>
  </a>`;
  return html;
}

function generateSDGsHTML(weight) {
  if (!weight) return "";
  const list_weight = weight.split(",");
  let sdg = "";
  for (let i = 0; i < list_weight.length; i++) {
    if (parseInt(list_weight[i]) === 1) {
      const index_sdg = ("0" + (i + 1)).slice(-2);
      sdg += `<div class="col-2 p-2" style="width:13%">
                <img class="w-100" src="/static/imgs/SDGs_${index_sdg}.jpg" alt="">
              </div>`;
    }
  }
  return sdg;
}