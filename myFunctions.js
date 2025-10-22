// دالة لتحويل الملف إلى Base64
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// عند اختيار ملف (فيديو / صورة / PDF / صوت)
$("#appFile").change(function () {
  const file = this.files[0];
  if (file) {
    const fileType = file.type;
    const reader = new FileReader();

    reader.onload = function (e) {
      let previewHTML = "";

      if (fileType.startsWith("video/")) {
        previewHTML = `<video controls style="max-width: 250px; margin-top: 10px; border-radius: 8px;">
                         <source src="${e.target.result}" type="${fileType}">
                         متصفحك لا يدعم عرض الفيديو.
                       </video>`;
      } else if (fileType.startsWith("image/")) {
        previewHTML = `<img src="${e.target.result}" alt="معاينة الصورة" style="max-width: 200px; border-radius: 8px;">`;
      } else if (fileType === "application/pdf") {
        previewHTML = `<embed src="${e.target.result}" type="application/pdf" width="200" height="250">`;
      } else if (fileType.startsWith("audio/")) {
        previewHTML = `<audio controls style="margin-top:10px;"><source src="${e.target.result}" type="${fileType}"></audio>`;
      } else {
        previewHTML = `<p>تم تحميل الملف: ${file.name}</p>`;
      }

      $("#filePreview").html(previewHTML);
    };

    reader.readAsDataURL(file);
  }
});

// عند إرسال النموذج
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

  const appFile = $("#appFile")[0].files[0];
  if (!appFile) {
    alert("يرجى اختيار ملف للتطبيق");
    return;
  }

  let fileBase64 = "";
  try {
    fileBase64 = await getBase64(appFile);
  } catch (error) {
    alert("حدث خطأ في تحميل الملف");
    return;
  }

  let newApp = {
    name: appName,
    company: $("#appCompany").val(),
    url: $("#appURL").val(),
    file: fileBase64,
    type: appFile.type,
    free: $("#appFree").is(":checked") ? "مجاني" : "غير مجاني",
    field: $("#appField").val(),
    desc: $("#appDesc").val(),
  };

  let apps = JSON.parse(localStorage.getItem("appsList")) || [];
  apps.push(newApp);
  localStorage.setItem("appsList", JSON.stringify(apps));

  alert("تم حفظ التطبيق وسيتم نقلك إلى صفحة التطبيقات");
  window.location.href = "./app.html";
});

// عند تحميل صفحة التطبيقات
$(document).ready(function () {
  let storedApps = JSON.parse(localStorage.getItem("appsList")) || [];

  for (let app of storedApps) {
    $("#appsTable tbody").append(`
      <tr>
        <td>
          ${
            app.type.startsWith("video/")
              ? `<video controls class="app-thumbnail"><source src="${app.file}" type="${app.type}"></video>`
              : app.type.startsWith("image/")
              ? `<img src="${app.file}" alt="${app.name}" class="app-thumbnail">`
              : app.type === "application/pdf"
              ? `<a href="${app.file}" target="_blank">عرض PDF</a>`
              : app.type.startsWith("audio/")
              ? `<audio controls><source src="${app.file}" type="${app.type}"></audio>`
              : `<a href="${app.file}" target="_blank">عرض الملف</a>`
          }
        </td>
        <td>${app.name}</td>
        <td>${app.company}</td>
        <td>${app.field}</td>
        <td>${app.free}</td>
        <td><button class="show-details btn btn-sm">عرض التفاصيل</button></td>
      </tr>
      <tr class="details-row" style="display:none;">
        <td colspan="6">
          <div class="app-details-container">
            <div class="app-media-large">
              ${
                app.type.startsWith("video/")
                  ? `<video controls class="large-app-video"><source src="${app.file}" type="${app.type}"></video>`
                  : app.type.startsWith("image/")
                  ? `<img src="${app.file}" alt="${app.name}" class="large-app-image">`
                  : app.type === "application/pdf"
                  ? `<a href="${app.file}" target="_blank" class="visit-btn">عرض PDF</a>`
                  : app.type.startsWith("audio/")
                  ? `<audio controls><source src="${app.file}" type="${app.type}"></audio>`
                  : `<a href="${app.file}" target="_blank" class="visit-btn">عرض الملف</a>`
              }
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
      </tr>
    `);
  }
});

// زر إظهار التفاصيل
$(document).on("click", ".show-details", function () {
  let detailsRow = $(this).closest("tr").next(".details-row");
  detailsRow.slideToggle(300);
});
