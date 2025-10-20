// دالة لتحويل الصورة إلى Base64
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}


$("#appImage").change(function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $("#imagePreview").html(
        `<img src="${e.target.result}" alt="معاينة الصورة" style="max-width: 200px; max-height: 200px; margin-top: 10px; border-radius: 8px;">`
      );
    };
    reader.readAsDataURL(file);
  }
});

$("#addAppForm").submit(async function (e) {
  e.preventDefault();

  let appName = $("#appName").val().trim();
  if (!/^[A-Za-z]+$/.test(appName)) {
    alert("اسم التطبيق يجب أن يحتوي على أحرف إنجليزية فقط وبدون فراغات");
    return;
  }

    let appCompany = $("#appCompany").val().trim();
    if (!/^[A-Za-z\s]+$/.test(appCompany)) {
      alert("اسم الشركة يجب أن يحتوي على أحرف إنجليزية فقط");
      return;
    }

  
  const imageFile = $("#appImage")[0].files[0];
  if (!imageFile) {
    alert("يرجى اختيار صورة للتطبيق");
    return;
  }

  let imageBase64 = "";
  try {
    imageBase64 = await getBase64(imageFile);
  } catch (error) {
    alert("حدث خطأ في تحميل الصورة");
    return;
  }

  let newApp = {
    name: appName,
    company: $("#appCompany").val(),
    url: $("#appURL").val(),
    image: imageBase64, // حفظ الصورة كـ Base64
    free: $("#appFree").is(":checked") ? "مجاني" : "غير مجاني",
    field: $("#appField").val(),
    desc: $("#appDesc").val(),
  };

  let apps = JSON.parse(localStorage.getItem("appsList")) || [];
  apps.push(newApp);
  localStorage.setItem("appsList", JSON.stringify(apps));

  alert("سيتم نقل إلى صفحة التطبيقات");
  window.location.href = "./app.html";
});

$(document).ready(function () {
  let storedApps = JSON.parse(localStorage.getItem("appsList")) || [];


  for (let app of storedApps) {
    $("#appsTable tbody").append(`
      <tr>
        <td><img src="${app.image}" alt="${app.name}" class="app-thumbnail"></td>
        <td>${app.name}</td>
        <td>${app.company}</td>
        <td>${app.field}</td>
        <td>${app.free}</td>
        <td><button class="show-details btn btn-sm">عرض التفاصيل</button></td>
      </tr>
      <tr class="details-row" style="display:none;">
        <td colspan="6">
          <div class="app-details-container">
            <div class="app-image-large">
              <img src="${app.image}" alt="${app.name}" class="large-app-image">
            </div>
            <div class="app-info">
              <h3>${app.name}</h3>
              <p><strong>الشركة:</strong> ${app.company}</p>
              <p><strong>المجال:</strong> ${app.field}</p>
              <p><strong>السعر:</strong> ${app.free}</p>
              <p><strong>الوصف:</strong> ${app.desc}</p>
              <a href="${app.url}" target="_blank" class="visit-btn">زيارة الموقع</a>
            </div>
          </div>
        </td>
      </tr>`);
  }
});

$(document).on("click", ".show-details", function () {
  let detailsRow = $(this).closest("tr").next(".details-row");
  detailsRow.slideToggle(300);
});
