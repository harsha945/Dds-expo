document.addEventListener("DOMContentLoaded", () => {
  const plusBtn = document.getElementById("adminPlusBtn");
  const uploadModal = document.getElementById("uploadModal");
  const closeUpload = document.getElementById("closeUpload");

  if (!plusBtn || !uploadModal) return;

  plusBtn.addEventListener("click", () => {
    uploadModal.hidden = false;
  });

  closeUpload?.addEventListener("click", () => {
    uploadModal.hidden = true;
  });

  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) {
      uploadModal.hidden = true;
    }
  });
});
