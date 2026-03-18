let chart;                  // instance của Chart.js
let seriesData = [];        // mảng các nhóm: [{name, color, data: [{label, value}]}]

function init() {
  // Thêm nhóm mặc định đầu tiên
  addSeries("Nhóm 1", "#007bff");
  updateChart();
}

function addSeries(name = "", color = "#007bff") {
  const seriesName = name || document.getElementById("seriesName").value.trim() || `Nhóm ${seriesData.length + 1}`;
  const seriesColor = color || document.getElementById("seriesColor").value;

  if (!seriesName) return alert("Vui lòng nhập tên nhóm!");

  const newSeries = {
    name: seriesName,
    color: seriesColor,
    data: [{ label: "Item 1", value: 100 }]
  };

  seriesData.push(newSeries);
  renderSeriesList();
  document.getElementById("seriesName").value = "";
}

function renderSeriesList() {
  const container = document.getElementById("seriesList");
  container.innerHTML = "";

  seriesData.forEach((series, seriesIndex) => {
    const div = document.createElement("div");
    div.className = "series-item";
    div.innerHTML = `
      <strong>${series.name}</strong> 
      <input type="color" value="${series.color}" onchange="updateSeriesColor(${seriesIndex}, this.value)" />
      <button class="delete" onclick="removeSeries(${seriesIndex})">Xóa nhóm</button>

      <div style="margin-top:10px;">
        <strong>Dữ liệu:</strong>
        ${series.data.map((item, itemIndex) => `
          <div class="data-row">
            <input type="text" value="${item.label}" placeholder="Tên nhãn" onchange="updateLabel(${seriesIndex}, ${itemIndex}, this.value)" />
            <input type="number" value="${item.value}" placeholder="Giá trị" onchange="updateValue(${seriesIndex}, ${itemIndex}, this.value)" />
            <button class="delete" onclick="removeDataItem(${seriesIndex}, ${itemIndex})">Xóa</button>
          </div>
        `).join("")}
        <button onclick="addDataItem(${seriesIndex})">+ Thêm mục</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addDataItem(seriesIndex) {
  seriesData[seriesIndex].data.push({ label: `Item ${seriesData[seriesIndex].data.length + 1}`, value: 0 });
  renderSeriesList();
}

function removeDataItem(seriesIndex, itemIndex) {
  seriesData[seriesIndex].data.splice(itemIndex, 1);
  if (seriesData[seriesIndex].data.length === 0) {
    seriesData.splice(seriesIndex, 1);
  }
  renderSeriesList();
  updateChart();
}

function updateLabel(seriesIndex, itemIndex, value) {
  seriesData[seriesIndex].data[itemIndex].label = value;
  updateChart();
}

function updateValue(seriesIndex, itemIndex, value) {
  seriesData[seriesIndex].data[itemIndex].value = parseFloat(value) || 0;
  updateChart();
}

function updateSeriesColor(seriesIndex, color) {
  seriesData[seriesIndex].color = color;
  updateChart();
}

function removeSeries(seriesIndex) {
  seriesData.splice(seriesIndex, 1);
  renderSeriesList();
  updateChart();
}

function resetAll() {
  if (!confirm("Xóa hết dữ liệu?")) return;
  seriesData = [];
  addSeries("Nhóm 1", "#007bff");
  document.getElementById("chartTitle").value = "Biểu đồ của tôi";
  document.getElementById("chartType").value = "bar";
  updateChart();
}

function getChartConfig() {
  const type = document.getElementById("chartType").value;
  const title = document.getElementById("chartTitle").value;

  // Chuẩn bị labels (lấy từ nhóm đầu tiên, giả sử tất cả nhóm có cùng nhãn)
  let labels = [];
  if (seriesData.length > 0) {
    labels = seriesData[0].data.map(d => d.label);
  }

  const datasets = seriesData.map(series => ({
    label: series.name,
    data: series.data.map(d => d.value),
    backgroundColor: type === "pie" || type === "doughnut" ? series.data.map(() => series.color) : series.color,
    borderColor: series.color,
    borderWidth: 2,
    fill: type === "line" ? false : undefined,
    tension: type === "line" ? 0.3 : undefined
  }));

  return {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, font: { size: 18 } },
        legend: { position: "top" },
        datalabels: {
          color: "#fff",
          font: { weight: "bold" },
          formatter: (v) => (v > 0 ? v : "")
        }
      },
      scales: type !== "pie" && type !== "doughnut" ? {
        y: { beginAtZero: true }
      } : undefined
    },
    plugins: [ChartDataLabels]
  };
}

function updateChart() {
  const ctx = document.getElementById("chartCanvas").getContext("2d");

  if (chart) chart.destroy();

  if (seriesData.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "20px Arial";
    ctx.fillText("Chưa có dữ liệu", 100, 100);
    return;
  }

  chart = new Chart(ctx, getChartConfig());
}

// Khởi động
init();
